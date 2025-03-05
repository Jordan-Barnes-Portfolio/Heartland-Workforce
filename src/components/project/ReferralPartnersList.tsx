import { Badge } from '@/components/ui/badge';
import { User, Phone, Mail, DollarSign } from 'lucide-react';
import type { Referrer } from '@/types/project';

interface ReferralPartnersListProps {
  referrers: Referrer[];
  showEmail?: boolean;
  compact?: boolean;
  className?: string;
}

export function ReferralPartnersList({ 
  referrers, 
  showEmail = false, 
  compact = false,
  className = '' 
}: ReferralPartnersListProps) {
  if (!referrers || referrers.length === 0) {
    return <p className="text-sm text-gray-600">No referral partners assigned</p>;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {referrers.map((referrer, index) => (
        <div 
          key={referrer.id} 
          className={`${index > 0 ? 'pt-3 border-t border-gray-200' : ''}`}
        >
          <div className="flex items-center justify-between">
            <p className="font-medium text-gray-800">{referrer.companyName || 'Unknown Company'}</p>
            <Badge className="bg-green-100 text-green-800">
              {typeof referrer.referralPercentage === 'number' ? referrer.referralPercentage : 0}%
            </Badge>
          </div>
          
          {!compact && (
            <>
              <div className="mt-1 flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                {referrer.contact?.name || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                {referrer.contact?.phone || 'N/A'}
              </div>
              {showEmail && referrer.contact?.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {referrer.contact.email}
                </div>
              )}
            </>
          )}
          
          <div className="mt-1 text-sm text-gray-700">
            <span className="font-medium">
              <DollarSign className="inline h-3 w-3" /> Referral Fee:
            </span> ${typeof referrer.referralFee === 'number' ? 
              referrer.referralFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 
              '0.00'}
          </div>
        </div>
      ))}
    </div>
  );
} 