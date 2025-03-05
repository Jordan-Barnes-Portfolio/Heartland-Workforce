import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Filter, 
  Loader2, 
  Calendar,  
  User, 
  Building2, 
  Phone, 
  Mail,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical
} from 'lucide-react';

const mockReferrals = [
  {
    id: 'ref-1',
    projectId: 'proj-1',
    projectName: 'Water Damage Restoration',
    clientName: 'John Smith',
    clientEmail: 'john.smith@example.com',
    clientPhone: '(555) 123-4567',
    date: '2024-03-15',
    status: 'converted',
    fee: 250,
    referrer: {
      name: 'Alice Johnson',
      company: 'ABC Insurance',
      email: 'alice@abcinsurance.com',
      phone: '(555) 987-6543',
    },
    description: 'Emergency water damage restoration needed for residential property.',
    notes: 'Client prefers evening appointments. Insurance claim pending.',
  },
  {
    id: 'ref-2',
    projectId: 'proj-2',
    projectName: 'Mold Remediation',
    clientName: 'Jane Doe',
    clientEmail: 'jane.doe@example.com',
    clientPhone: '(555) 234-5678',
    date: '2024-03-14',
    status: 'pending',
    fee: 350,
    referrer: {
      name: 'Bob Smith',
      company: 'XYZ Contractors',
      email: 'bob@xyzcontractors.com',
      phone: '(555) 876-5432',
    },
    description: 'Mold discovered in basement after recent flooding.',
    notes: 'Immediate assessment required. Health concerns reported.',
  },
  {
    id: 'ref-3',
    projectId: 'proj-3',
    projectName: 'Fire Damage Repair',
    clientName: 'Mike Johnson',
    clientEmail: 'mike.johnson@example.com',
    clientPhone: '(555) 345-6789',
    date: '2024-03-13',
    status: 'lost',
    fee: 500,
    referrer: {
      name: 'Carol Martinez',
      company: 'City Properties',
      email: 'carol@cityproperties.com',
      phone: '(555) 765-4321',
    },
    description: 'Kitchen fire damage requiring extensive restoration.',
    notes: 'Client went with another contractor due to scheduling conflicts.',
  },
];

const statusColors = {
  converted: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  lost: 'bg-red-100 text-red-800',
};

export function Referrals() {
  const [referrals, setReferrals] = useState(mockReferrals);
  const [isAddingReferral, setIsAddingReferral] = useState(false);
  const [isEditingReferral, setIsEditingReferral] = useState<typeof mockReferrals[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referralToDelete, setReferralToDelete] = useState<typeof mockReferrals[0] | null>(null);
  const [expandedReferral, setExpandedReferral] = useState<string | null>(null);

  const handleCreateReferral = async () => {
    setIsSubmitting(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAddingReferral(false);
    } catch (error) {
      console.error('Failed to create referral:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditReferral = async () => {
    if (!isEditingReferral) return;

    setIsSubmitting(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the referral in the list
      setReferrals(referrals.map(r => 
        r.id === isEditingReferral.id ? isEditingReferral : r
      ));
      setIsEditingReferral(null);
    } catch (error) {
      console.error('Failed to update referral:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReferral = async () => {
    if (!referralToDelete) return;

    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setReferrals(referrals.filter(r => r.id !== referralToDelete.id));
      setReferralToDelete(null);
    } catch (error) {
      console.error('Failed to delete referral:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track and manage all incoming project referrals
                </p>
              </div>
              <div className="flex gap-3 sm:self-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>All Referrals</DropdownMenuItem>
                    <DropdownMenuItem>Converted</DropdownMenuItem>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Lost</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button 
                  className="gap-2"
                  onClick={() => setIsAddingReferral(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Referral
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {referrals.map((referral) => (
                <Card
                  key={referral.id}
                  className="overflow-hidden transition-shadow hover:shadow-lg"
                >
                  <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {referral.projectName}
                          <span className="mx-2 text-gray-400">|</span>
                          <span className="text-gray-600">{referral.clientName}</span>
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                          {referral.description}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <Badge className={statusColors[referral.status as keyof typeof statusColors]}
                        >
                          {referral.status.toUpperCase()}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gray-100"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setIsEditingReferral(referral)}
                              className="gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setReferralToDelete(referral)}
                              className="gap-2 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setExpandedReferral(
                            expandedReferral === referral.id ? null : referral.id
                          )}
                          className="h-8 w-8"
                        >
                          {expandedReferral === referral.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`grid transition-all duration-200 ${
                      expandedReferral === referral.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-gray-100">
                        <div className="grid gap-6 p-4 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-3">
                              <h4 className="mb-2 font-medium text-gray-700">
                                Referrer Information
                              </h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4" />
                                  {referral.referrer.name}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Building2 className="h-4 w-4" />
                                  {referral.referrer.company}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  {referral.referrer.phone}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="h-4 w-4" />
                                  {referral.referrer.email}
                                </div>
                              </div>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-3">
                              <h4 className="mb-2 font-medium text-gray-700">
                                Client Information
                              </h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <User className="h-4 w-4" />
                                  {referral.clientName}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="h-4 w-4" />
                                  {referral.clientPhone}
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Mail className="h-4 w-4" />
                                  {referral.clientEmail}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="mb-2 font-medium text-gray-700">
                                Project Details
                              </h4>
                              <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Calendar className="h-4 w-4" />
                                  Referred on: {new Date(referral.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="mb-2 font-medium text-gray-700">
                                Notes
                              </h4>
                              <p className="text-sm text-gray-600">
                                {referral.notes}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Referral Fee
                            </span>
                            <span className="text-lg font-semibold text-orange-600">
                              ${referral.fee.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {referrals.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                <div className="rounded-full bg-gray-100 p-3">
                  <Plus className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No referrals</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new referral
                </p>
                <Button 
                  className="mt-4 gap-2"
                  onClick={() => setIsAddingReferral(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Referral
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Dialog open={isAddingReferral} onOpenChange={setIsAddingReferral}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Referral</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Client Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input id="clientPhone" placeholder="(555) 123-4567" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" type="email" placeholder="john.smith@example.com" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Project Details</h3>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input id="projectName" placeholder="Water Damage Restoration" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="projectType">Project Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="water">Water Damage</SelectItem>
                      <SelectItem value="fire">Fire Damage</SelectItem>
                      <SelectItem value="mold">Mold Remediation</SelectItem>
                      <SelectItem value="storm">Storm Damage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project and any specific requirements..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Referrer Information</h3>
              <div className="space-y-2">
                <Label htmlFor="referrer">Select Referrer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select referrer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Alice Johnson - ABC Insurance</SelectItem>
                    <SelectItem value="2">Bob Smith - XYZ Contractors</SelectItem>
                    <SelectItem value="3">Carol Martinez - City Properties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or special instructions..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddingReferral(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateReferral} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Referral
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!isEditingReferral} onOpenChange={() => setIsEditingReferral(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Referral</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Client Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input 
                    id="clientName" 
                    value={isEditingReferral?.clientName || ''}
                    onChange={(e) => setIsEditingReferral(prev => 
                      prev ? { ...prev, clientName: e.target.value } : null
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input 
                    id="clientPhone" 
                    value={isEditingReferral?.clientPhone || ''}
                    onChange={(e) => setIsEditingReferral(prev => 
                      prev ? { ...prev, clientPhone: e.target.value } : null
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input 
                  id="clientEmail" 
                  type="email" 
                  value={isEditingReferral?.clientEmail || ''}
                  onChange={(e) => setIsEditingReferral(prev => 
                    prev ? { ...prev, clientEmail: e.target.value } : null
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Project Details</h3>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName" 
                  value={isEditingReferral?.projectName || ''}
                  onChange={(e) => setIsEditingReferral(prev => 
                    prev ? { ...prev, projectName: e.target.value } : null
                  )}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={isEditingReferral?.status}
                    onValueChange={(value) => setIsEditingReferral(prev => 
                      prev ? { ...prev, status: value as 'converted' | 'pending' | 'lost' } : null
                    )}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="converted">Converted</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={isEditingReferral?.description || ''}
                  onChange={(e) => setIsEditingReferral(prev => 
                    prev ? { ...prev, description: e.target.value } : null
                  )}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={isEditingReferral?.notes || ''}
                onChange={(e) => setIsEditingReferral(prev => 
                  prev ? { ...prev, notes: e.target.value } : null
                )}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingReferral(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditReferral} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!referralToDelete} onOpenChange={() => setReferralToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Referral</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this referral? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteReferral}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}