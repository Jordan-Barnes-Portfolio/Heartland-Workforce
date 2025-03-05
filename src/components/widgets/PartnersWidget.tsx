import { useState, useEffect } from 'react';
import { BaseWidget } from './BaseWidget';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePartners } from '@/lib/partner-context';
import type { Widget } from '@/types/widget';
import type { Partner } from '@/types/partner';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  inactive: 'bg-gray-100 text-gray-800',
};

interface PartnersWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export function PartnersWidget({ widget, onRemove }: PartnersWidgetProps) {
  const navigate = useNavigate();
  const { partners, loading, error, refreshPartners } = usePartners();
  const [topPartners, setTopPartners] = useState<Partner[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Sort partners by referral count and take the top 5
    const sorted = [...partners]
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 5);
    setTopPartners(sorted);
  }, [partners]);

  const handleViewPartner = (partnerId: string) => {
    navigate(`/partners?id=${partnerId}`);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshPartners();
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderContent = () => {
    if ((loading || isRefreshing) && topPartners.length === 0) {
      return (
        <div className="flex h-full items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }

    if (error && topPartners.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-gray-500">Failed to load partners</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={handleRefresh}>
            Try Again
          </Button>
        </div>
      );
    }

    if (topPartners.length === 0) {
      return (
        <div className="flex h-full flex-col items-center justify-center p-4 text-center">
          <p className="text-sm text-gray-500">No partners found</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/partners')}>
            Add Partners
          </Button>
        </div>
      );
    }

    return (
      <div className="divide-y">
        {topPartners.map((partner) => (
          <div key={partner.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar className="ring-2 ring-white ring-offset-2">
                {partner.avatar ? (
                  <AvatarImage src={partner.avatar} alt={partner.name} />
                ) : (
                  <AvatarFallback>{partner.name ? partner.name[0] : '?'}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{partner.name}</p>
                  <Badge className={statusColors[partner.status] || statusColors.inactive}>
                    {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{partner.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="font-medium">{partner.successRate}%</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-gray-900"
                onClick={() => handleViewPartner(partner.id)}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <div className="p-3 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-gray-500 hover:text-gray-900"
            onClick={() => navigate('/partners')}
          >
            View All Partners
          </Button>
        </div>
      </div>
    );
  };

  return (
    <BaseWidget widget={widget} onRemove={onRemove} onRefresh={handleRefresh}>
      {isRefreshing && topPartners.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      )}
      {renderContent()}
    </BaseWidget>
  );
}