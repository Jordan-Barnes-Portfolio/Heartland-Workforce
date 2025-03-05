import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Save, X, Phone, Mail, Calendar, DollarSign, BarChart, Loader2 } from 'lucide-react';
import { usePartners } from '@/lib/partner-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';    
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Partner } from '@/types/partner';
interface PartnerDetailsProps {
  partnerId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialEditMode?: boolean;
}

export function PartnerDetails({ partnerId, isOpen, onOpenChange, initialEditMode = false }: PartnerDetailsProps) {
  const navigate = useNavigate();
  const { getPartnerById, updatePartner, removePartner, fetchPartnerAnalytics } = usePartners();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalProjects: number;
    convertedProjects: number;
    pendingProjects: number;
    lostProjects: number;
    totalEarnings: number;
    averageFee: number;
  } | null>(null);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [editedPartner, setEditedPartner] = useState<Partial<Partner>>({});
  const [activeTab, setActiveTab] = useState<string>("info");
  const [transitionClass, setTransitionClass] = useState("");

  // Fetch partner data
  useEffect(() => {
    if (isOpen && partnerId) {
      const fetchPartnerData = async () => {
        setIsLoading(true);
        try {
          const partnerData = await getPartnerById(partnerId);
          if (partnerData) {
            setPartner(partnerData);
            setEditedPartner(partnerData);
            
            // Fetch analytics
            const analyticsData = await fetchPartnerAnalytics(partnerId);
            setAnalytics(analyticsData);
          }
        } catch (err) {
          toast.error('Failed to load partner details');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchPartnerData();
    }
  }, [partnerId, isOpen, getPartnerById, fetchPartnerAnalytics]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setActiveTab("info");
    } else {
      setIsEditing(initialEditMode);
    }
  }, [isOpen, initialEditMode]);

  // Add transition effect when switching between edit and view modes
  useEffect(() => {
    setIsTransitioning(true);
    
    if (isEditing) {
      setTransitionClass("animate-in fade-in-0 slide-in-from-bottom-2 duration-300");
    } else {
      setTransitionClass("animate-in fade-in-0 slide-in-from-top-2 duration-300");
    }
    
    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      setTransitionClass("");
      setIsTransitioning(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [isEditing]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPartner(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (status: Partner['status']) => {
    setEditedPartner(prev => ({
      ...prev,
      status
    }));
  };

  const handleSave = async () => {
    if (!partner) return;
    
    setIsSaving(true);
    setIsTransitioning(true);
    
    try {
      await updatePartner(partner.id, editedPartner);
      
      // Refresh partner data
      const updatedPartner = await getPartnerById(partnerId);
      if (updatedPartner) {
        setPartner(updatedPartner);
      }
      
      // Add a small delay before switching to view mode for smoother transition
      setTimeout(() => {
        setIsEditing(false);
        toast.success('Partner updated successfully');
      }, 400);
    } catch (err) {
      toast.error('Failed to update partner');
      setIsTransitioning(false);
    } finally {
      // Keep the saving state a bit longer to ensure smooth transition
      setTimeout(() => {
        setIsSaving(false);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 300);
    }
  };

  const handleDelete = async () => {
    if (!partner) return;
    
    try {
      await removePartner(partner.id);
      toast.success('Partner deleted successfully');
      onOpenChange(false);
      navigate('/partners');
    } catch (err) {
      toast.error('Failed to delete partner');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Helper function to determine if inputs should be disabled
  const isInputDisabled = () => isSaving || isTransitioning;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <p>Loading partner details...</p>
        </div>
      );
    }

    if (!partner) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Partner Not Found</h2>
          <p className="text-gray-500 mb-4">The partner you're looking for doesn't exist or has been removed.</p>
          <Button onClick={handleClose}>Close</Button>
        </div>
      );
    }

    return (
      <>
        <DialogHeader className="pb-4">
          <div className="flex justify-between items-center pr-8">
            <DialogTitle className="text-2xl font-bold">{partner.name}</DialogTitle>
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    disabled={isInputDisabled()}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isInputDisabled()}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Partner</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this partner? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setIsDeleting(false)}>Cancel</Button>
                        <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </div>
          </div>
          <DialogDescription className="mt-1 text-sm">
            {partner.company} • {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6 bg-gray-100/80 p-1 rounded-lg">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4 transition-all duration-300 ease-in-out data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95">
            <div className={`space-y-4 ${transitionClass}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={editedPartner.name || ''}
                      onChange={handleInputChange}
                      disabled={isInputDisabled()}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{partner.name}</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  {isEditing ? (
                    <Input
                      id="company"
                      name="company"
                      value={editedPartner.company || ''}
                      onChange={handleInputChange}
                      disabled={isInputDisabled()}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{partner.company}</div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editedPartner.email || ''}
                      onChange={handleInputChange}
                      disabled={isInputDisabled()}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <Mail className="h-4 w-4 text-gray-500" />
                      {partner.email}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={editedPartner.phone || ''}
                      onChange={handleInputChange}
                      disabled={isInputDisabled()}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 border rounded-md">
                      <Phone className="h-4 w-4 text-gray-500" />
                      {partner.phone}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referralPercentage">Referral Percentage</Label>
                  {isEditing ? (
                    <Input
                      id="referralPercentage"
                      name="referralPercentage"
                      type="number"
                      min="0"
                      max="100"
                      value={editedPartner.referralPercentage || 0}
                      onChange={handleInputChange}
                      disabled={isInputDisabled()}
                    />
                  ) : (
                    <div className="p-2 border rounded-md">{partner.referralPercentage}%</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  {isEditing ? (
                    <Select 
                      value={editedPartner.status || partner.status} 
                      onValueChange={(value: Partner['status']) => handleStatusChange(value)}
                      disabled={isInputDisabled()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 border rounded-md">
                      <Badge className={
                        partner.status === 'active' ? 'bg-green-100 text-green-800' :
                        partner.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                {isEditing ? (
                  <Textarea
                    id="notes"
                    name="notes"
                    value={editedPartner.notes || ''}
                    onChange={handleInputChange}
                    rows={4}
                    disabled={isInputDisabled()}
                  />
                ) : (
                  <div className="p-2 border rounded-md min-h-[100px]">
                    {partner.notes || 'No notes available'}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="transition-all duration-300 ease-in-out data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95">
            <div className={`space-y-4 ${transitionClass}`}>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Total Projects</span>
                </div>
                <span className="font-semibold">{analytics?.totalProjects || partner.referralCount}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col p-3 bg-green-50 rounded-md">
                  <span className="text-sm text-gray-500">Converted</span>
                  <span className="font-semibold">{analytics?.convertedProjects || 0}</span>
                </div>
                <div className="flex flex-col p-3 bg-yellow-50 rounded-md">
                  <span className="text-sm text-gray-500">Pending</span>
                  <span className="font-semibold">{analytics?.pendingProjects || 0}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Total Earnings</span>
                </div>
                <span className="font-semibold">${(analytics?.totalEarnings || partner.totalEarnings).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Average Fee</span>
                </div>
                <span className="font-semibold">${(analytics?.averageFee || 0).toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-500">Last Referral</span>
                </div>
                <span className="font-semibold">
                  {partner.lastReferral ? new Date(partner.lastReferral).toLocaleDateString() : 'No referrals yet'}
                </span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="referrals" className="transition-all duration-300 ease-in-out data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:zoom-in-95">
            <div className={transitionClass}>
              {partner.referrals && partner.referrals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Project</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Client</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Status</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {partner.referrals.map((referral) => (
                        <tr key={referral.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-medium">{referral.projectName}</div>
                            <div className="text-sm text-gray-500">{referral.projectId}</div>
                          </td>
                          <td className="px-4 py-3">{referral.clientName}</td>
                          <td className="px-4 py-3">
                            {new Date(referral.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={
                              referral.status === 'converted' ? 'bg-green-100 text-green-800' :
                              referral.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            ${referral.fee.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No referrals yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!isSaving && !isTransitioning) {
          onOpenChange(open);
        }
      }}
    >
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
      >
        {isSaving && (
          <div className="absolute inset-0 bg-white/70 dark:bg-gray-950/70 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300 animate-in fade-in-0">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Saving changes...</p>
            </div>
          </div>
        )}
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
} 