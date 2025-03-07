import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X } from 'lucide-react';
import type { Client } from '@/types/project';

interface CustomerDetailsFormProps {
  client: Client;
  onSave: (updatedClient: Client) => Promise<void>;
  onCancel: () => void;
}

export function CustomerDetailsForm({ client, onSave, onCancel }: CustomerDetailsFormProps) {
  const [editedClient, setEditedClient] = useState<Client>({ ...client });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (
    section: 'client' | 'address' | 'contact',
    field: string,
    value: string
  ) => {
    if (section === 'client') {
      setEditedClient({ ...editedClient, name: value });
    } else if (section === 'address') {
      setEditedClient({
        ...editedClient,
        address: {
          ...editedClient.address,
          [field]: value,
        },
      });
    } else if (section === 'contact') {
      setEditedClient({
        ...editedClient,
        contact: {
          ...editedClient.contact,
          [field]: value,
        },
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(editedClient);
    } catch (error) {
      console.error('Failed to save customer details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4 rounded-md border p-4">
        <div className="space-y-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={editedClient.contact.name}
                onChange={(e) => handleInputChange('contact', 'name', e.target.value)}
                placeholder="Enter contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={editedClient.contact.phone}
                onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={editedClient.contact.email}
                onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Address</h4>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                value={editedClient.address.street}
                onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                placeholder="Enter street address"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editedClient.address.city}
                  onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={editedClient.address.state}
                  onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                  placeholder="Enter state"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={editedClient.address.zipCode}
                  onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving}>
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
      </div>
    </form>
  );
} 