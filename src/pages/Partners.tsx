import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { usePartners } from '@/lib/partner-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DialogDescription } from '@/components/ui/dialog';
import type { Partner } from '@/types/partner';
import { PartnerDetails } from '@/components/partner/PartnerDetails';

export default function Partners() {
  const { partners, loading, error, addPartner, refreshPartners } = usePartners();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isPartnerDetailsOpen, setIsPartnerDetailsOpen] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);
  const [newPartner, setNewPartner] = useState<Omit<Partner, 'id'>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'active',
    referralCount: 0,
    successRate: 0,
    referrals: [],
    referralPercentage: 0, // Default 0%
    totalEarnings: 0,
    activeProjects: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPartner(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addPartner(newPartner);
      setIsAddPartnerOpen(false);
      setNewPartner({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'active',
        referralCount: 0,
        successRate: 0,
        referrals: [],
        referralPercentage: 0,
        totalEarnings: 0,
        activeProjects: 0
      });
    } catch (err) {
      console.error('Failed to add partner:', err);
    }
  };

  const openPartnerDetails = (partnerId: string, editMode: boolean = false) => {
    setSelectedPartnerId(partnerId);
    setInitialEditMode(editMode);
    setIsPartnerDetailsOpen(true);
  };

  const filteredPartners = partners.filter(partner => 
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePartners = filteredPartners.filter(partner => partner.status === 'active');
  const pendingPartners = filteredPartners.filter(partner => partner.status === 'pending');
  const inactivePartners = filteredPartners.filter(partner => partner.status === 'inactive');

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Referral Partners</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your referral network and track partner performance
                </p>
              </div>
              <div className="flex gap-4">
                <Input
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Partner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Partner</DialogTitle>
                      <DialogDescription>
                        Add a new referral partner to your network.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddPartner}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={newPartner.name}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="company" className="text-right">
                            Company
                          </Label>
                          <Input
                            id="company"
                            name="company"
                            value={newPartner.company}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={newPartner.email}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="phone" className="text-right">
                            Phone
                          </Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={newPartner.phone}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="referralPercentage" className="text-right">
                            Referral %
                          </Label>
                          <Input
                            id="referralPercentage"
                            name="referralPercentage"
                            type="number"
                            min="0"
                            max="100"
                            value={newPartner.referralPercentage}
                            onChange={handleInputChange}
                            className="col-span-3"
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Partner</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading partners...</p>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{error}</p>
                <Button variant="outline" onClick={() => refreshPartners()} className="mt-2">
                  Retry
                </Button>
              </div>
            ) : (
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({activePartners.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pendingPartners.length})</TabsTrigger>
                  <TabsTrigger value="inactive">Inactive ({inactivePartners.length})</TabsTrigger>
                  <TabsTrigger value="all">All ({filteredPartners.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active">
                  <PartnerGrid partners={activePartners} onOpenPartnerDetails={openPartnerDetails} />
                </TabsContent>
                
                <TabsContent value="pending">
                  <PartnerGrid partners={pendingPartners} onOpenPartnerDetails={openPartnerDetails} />
                </TabsContent>
                
                <TabsContent value="inactive">
                  <PartnerGrid partners={inactivePartners} onOpenPartnerDetails={openPartnerDetails} />
                </TabsContent>
                
                <TabsContent value="all">
                  <PartnerGrid partners={filteredPartners} onOpenPartnerDetails={openPartnerDetails} />
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          {selectedPartnerId && (
            <PartnerDetails 
              partnerId={selectedPartnerId}
              isOpen={isPartnerDetailsOpen}
              onOpenChange={setIsPartnerDetailsOpen}
              initialEditMode={initialEditMode}
            />
          )}
        </main>
      </div>
    </div>
  );
}

interface PartnerGridProps {
  partners: Partner[];
  onOpenPartnerDetails: (partnerId: string, editMode: boolean) => void;
}

function PartnerGrid({ partners, onOpenPartnerDetails }: PartnerGridProps): JSX.Element {
  if (partners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No partners found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {partners.map(partner => (
        <PartnerCard key={partner.id} partner={partner} onOpenPartnerDetails={onOpenPartnerDetails} />
      ))}
    </div>
  );
}

interface PartnerCardProps {
  partner: Partner;
  onOpenPartnerDetails: (partnerId: string, editMode: boolean) => void;
}

function PartnerCard({ partner, onOpenPartnerDetails }: PartnerCardProps): JSX.Element {
  const handleViewDetails = () => {
    onOpenPartnerDetails(partner.id, false);
  };
  
  const handleEdit = () => {
    onOpenPartnerDetails(partner.id, true);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold">
            {partner.avatar ? (
              <img src={partner.avatar} alt={partner.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              partner.name.charAt(0)
            )}
          </div>
          <div>
            <CardTitle>{partner.name}</CardTitle>
            <CardDescription>{partner.company}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Email:</span>
            <span className="text-sm">{partner.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Phone:</span>
            <span className="text-sm">{partner.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Referral Rate:</span>
            <span className="text-sm">{partner.referralPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Earnings:</span>
            <span className="text-sm">${partner.totalEarnings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Referrals:</span>
            <span className="text-sm">{partner.referralCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Success Rate:</span>
            <span className="text-sm">{partner.successRate}%</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleViewDetails}>View Details</Button>
        <Button variant="outline" size="sm" onClick={handleEdit}>Edit</Button>
      </CardFooter>
    </Card>
  );
}