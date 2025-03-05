import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, X, Edit2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { Referrer } from '@/types/project';
import { usePartners } from '@/lib/partner-context';
import type { Partner } from '@/types/partner';
import { formatCurrency } from '@/lib/firestore-service';

// Convert Partner to Referrer format
const partnerToReferrer = (partner: Partner): Referrer => {
  const referrer = {
    id: partner.id || '',
    companyName: partner.company || 'Unknown Company',
    contact: {
      name: partner.name || 'Unknown',
      phone: partner.phone || '',
      email: partner.email || '',
    },
    referralFee: 0, // Will be calculated based on percentage and project estimate
    referralPercentage: typeof partner.referralPercentage === 'number' ? partner.referralPercentage : 0,
  };
  
  return referrer;
};

interface ReferrerSelectProps {
  selectedReferrers: Referrer[];
  onReferrersChange: (referrers: Referrer[]) => void;
  completionEstimate?: string;
}

export function ReferrerSelect({ 
  selectedReferrers = [], // Provide default empty array
  onReferrersChange,
  completionEstimate = ''
}: ReferrerSelectProps) {
  // Remove the initialization log that runs on every render
  
  const { partners, loading, refreshPartners } = usePartners();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingReferrer, setEditingReferrer] = useState<Referrer | null>(null);
  const [editPercentage, setEditPercentage] = useState<number>(0);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use a ref to track if this is the first render
  const isFirstRender = useRef(true);

  // Ensure selectedReferrers is always an array
  const currentReferrers = Array.isArray(selectedReferrers) ? selectedReferrers : [];
  
  // Remove the logging effect that runs on every referrers change

  // Modified: Only fetch partners when dropdown is opened for the first time
  useEffect(() => {
    if (open && !hasInitiallyFetched) {
      // Only log once when we do the initial fetch
      
      refreshPartners()
        .then(fetchedPartners => {
          setHasInitiallyFetched(true);
        })
        .catch(error => {
          console.error('Error fetching partners:', error);
        });
    }
  }, [open, hasInitiallyFetched, refreshPartners]);

  // Update referral fees when completion estimate changes
  useEffect(() => {
    // Skip this effect on the first render to prevent unnecessary updates
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!completionEstimate || currentReferrers.length === 0) return;
    
    try {
      const estimateValue = parseFloat(completionEstimate.replace(/[^0-9.]/g, ''));
      if (isNaN(estimateValue) || estimateValue <= 0) return;
      
      const updatedReferrers = currentReferrers.map(referrer => {
        // Ensure referralPercentage is a number
        const percentageValue = typeof referrer.referralPercentage === 'string'
          ? parseFloat(referrer.referralPercentage) || 0
          : (referrer.referralPercentage || 0);
        
        // Calculate new fee
        const newFee = Math.round((percentageValue / 100) * estimateValue * 100) / 100;
        
        return {
          ...referrer,
          referralPercentage: percentageValue, // Ensure it's stored as a number
          referralFee: newFee
        };
      });
      
      // Compare if there are actual changes before calling onReferrersChange
      const hasChanges = JSON.stringify(updatedReferrers) !== JSON.stringify(currentReferrers);
      
      if (hasChanges) {
        onReferrersChange(updatedReferrers);
      }
    } catch (error) {
      console.error('Error updating referral fees:', error);
    }
  }, [completionEstimate, currentReferrers, onReferrersChange]);

  // Filter partners based on search query
  const filteredPartners = partners
    .filter(partner => 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Only show active partners
    .filter(partner => partner.status === 'active');

  const toggleReferrer = (partner: Partner) => {
    // Validate partner object
    if (!partner || !partner.id) {
      console.error('Invalid partner object:', partner);
      toast.error('Error: Invalid partner data');
      return;
    }
    
    const referrer = partnerToReferrer(partner);
    
    // Calculate referral fee based on percentage and completion estimate
    referrer.referralFee = 0; // Default to 0
    
    if (completionEstimate && referrer.referralPercentage > 0) {
      try {
        const estimateValue = parseFloat(completionEstimate.replace(/[^0-9.]/g, ''));
        if (!isNaN(estimateValue) && estimateValue > 0) {
          referrer.referralFee = Math.round((referrer.referralPercentage / 100) * estimateValue * 100) / 100;
        }
      } catch (error) {
        console.error('Error calculating referral fee:', error);
        // Keep the default 0 fee on error
      }
    }
    
    const isSelected = currentReferrers.some(r => r.id === referrer.id);
    if (isSelected) {
      onReferrersChange(currentReferrers.filter(r => r.id !== referrer.id));
    } else {
      onReferrersChange([...currentReferrers, referrer]);
    }
    setOpen(false);
  };

  const removeReferrer = (referrerId: string) => {
    onReferrersChange(currentReferrers.filter(r => r.id !== referrerId));
  };

  const openEditDialog = (referrer: Referrer) => {
    // Validate referrer object
    if (!referrer || !referrer.id) {
      console.error('Invalid referrer object:', referrer);
      toast.error('Error: Invalid referrer data');
      return;
    }
    
    setEditingReferrer(referrer);
    setEditPercentage(typeof referrer.referralPercentage === 'number' ? referrer.referralPercentage : 0);
  };

  const saveReferrerPercentage = () => {
    if (!editingReferrer) return;
    
    // Remove excessive logging

    // Calculate new referral fee based on percentage and completion estimate
    let newFee = 0; // Default to 0
    
    // Only calculate fee if percentage is greater than 0
    if (editPercentage > 0 && completionEstimate) {
      try {
        const estimateValue = parseFloat(completionEstimate.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(estimateValue) && estimateValue > 0) {
          newFee = Math.round((editPercentage / 100) * estimateValue * 100) / 100;
        }
      } catch (error) {
        console.error('Error calculating referral fee:', error);
      }
    }

    const updatedReferrers = currentReferrers.map(r => 
      r.id === editingReferrer.id 
        ? { ...r, referralPercentage: editPercentage, referralFee: newFee }
        : r
    );
    
    onReferrersChange(updatedReferrers);
    setEditingReferrer(null);
  };

  // Function to manually refresh partners - completely separate from the useEffect
  const handleRefreshPartners = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isRefreshing) return; // Prevent multiple simultaneous refreshes
    
    console.log('Manually refreshing partners'); // Keep this log as it's only triggered by button
    setIsRefreshing(true);
    
    refreshPartners()
      .then(fetchedPartners => {
        toast.success('Partners refreshed successfully');
      })
      .catch(error => {
        console.error('Error refreshing partners:', error);
        toast.error('Failed to refresh partners');
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefreshPartners}
          disabled={loading || isRefreshing}
          className="flex items-center gap-1"
        >
          {loading || isRefreshing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          )}
          Refresh
        </Button>
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {currentReferrers.length > 0
              ? `${currentReferrers.length} partner${currentReferrers.length === 1 ? '' : 's'} selected`
              : "Select referral partners..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search referral partners..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm text-gray-500">Loading partners...</span>
                </div>
              ) : (
                <>
                  <CommandEmpty>
                    {filteredPartners.length === 0 && partners.length > 0 
                      ? "No matching partners found. Try a different search term."
                      : partners.filter(p => p.status === 'active').length === 0
                        ? "No active partners found. Please add partners in the Partners section."
                        : "No referral partner found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredPartners.map((partner) => {
                      const referrer = partnerToReferrer(partner);
                      return (
                        <CommandItem
                          key={partner.id}
                          value={partner.id}
                          onSelect={() => toggleReferrer(partner)}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <Check
                              className={cn(
                                "h-4 w-4",
                                currentReferrers.some(r => r.id === partner.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div>
                              <p className="font-medium">{partner.company}</p>
                              <p className="text-sm text-gray-500">{partner.name}</p>
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <Badge className="bg-green-100 text-green-800">
                              {partner.referralPercentage}%
                            </Badge>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {currentReferrers.length > 0 && (
        <div className="space-y-2">
          {currentReferrers.map((referrer) => (
            <div 
              key={referrer.id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-2"
            >
              <div>
                <p className="font-medium">{referrer.companyName || 'Unknown Company'}</p>
                <p className="text-sm text-gray-500">{referrer.contact?.name || 'Unknown Contact'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatCurrency(referrer.referralFee)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {typeof referrer.referralPercentage === 'number' ? 
                      referrer.referralPercentage : 0}%
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditDialog(referrer)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:text-red-600"
                  onClick={() => removeReferrer(referrer.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Referrer Dialog */}
      <Dialog open={!!editingReferrer} onOpenChange={(open) => !open && setEditingReferrer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Referral Percentage</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <p className="text-sm font-medium">{editingReferrer?.companyName}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="percentage">Referral Percentage (%)</Label>
              <Input
                id="percentage"
                type="number"
                min="0"
                max="100"
                value={editPercentage}
                onChange={(e) => setEditPercentage(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Estimated Referral Fee</Label>
              <p className="text-sm font-medium">
                {(() => {
                  // Safe calculation with fallback to 0
                  try {
                    if (!completionEstimate || !editPercentage) return formatCurrency(0);
                    
                    const estimateValue = parseFloat(completionEstimate.replace(/[^0-9.]/g, ''));
                    if (isNaN(estimateValue) || estimateValue <= 0) return formatCurrency(0);
                    
                    const fee = Math.round((editPercentage / 100) * estimateValue * 100) / 100;
                    return formatCurrency(fee);
                  } catch (error) {
                    console.error('Error calculating preview fee:', error);
                    return formatCurrency(0);
                  }
                })()}
              </p>
              <p className="text-xs text-gray-500">
                Based on {editPercentage || 0}% of {completionEstimate ? formatCurrency(completionEstimate.replace(/[^0-9.]/g, '')) : formatCurrency(0)}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingReferrer(null)}>Cancel</Button>
            <Button onClick={saveReferrerPercentage}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}