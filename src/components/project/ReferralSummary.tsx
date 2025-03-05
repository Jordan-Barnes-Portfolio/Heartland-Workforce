import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users } from 'lucide-react';
import type { Referrer } from '@/types/project';

interface ReferralSummaryProps {
  referrers: Referrer[];
  className?: string;
}

export function ReferralSummary({ referrers, className = '' }: ReferralSummaryProps) {
  // Calculate total referral fees
  const totalFees = referrers?.reduce((sum, referrer) => {
    return sum + (typeof referrer.referralFee === 'number' ? referrer.referralFee : 0);
  }, 0) || 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Referral Partners Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Partners</span>
            <span className="font-medium">{referrers?.length || 0}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total Referral Fees</span>
            <span className="font-medium text-green-700">
              <DollarSign className="inline h-4 w-4" />
              {totalFees.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </span>
          </div>
          
          {referrers && referrers.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-sm font-medium mb-2">Fee Breakdown</h4>
              <div className="space-y-2">
                {referrers.map(referrer => (
                  <div key={referrer.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{referrer.companyName}</span>
                    <span>
                      ${typeof referrer.referralFee === 'number' ? 
                        referrer.referralFee.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }) : 
                        '0.00'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 