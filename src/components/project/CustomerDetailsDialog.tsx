import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CustomerDetailsForm } from './CustomerDetailsForm';
import type { Client } from '@/types/project';
import { useToast } from '@/hooks/use-toast';

interface CustomerDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  onSave: (updatedClient: Client) => Promise<void>;
  projectId: string;
}

export function CustomerDetailsDialog({
  isOpen,
  onClose,
  client,
  onSave,
  projectId,
}: CustomerDetailsDialogProps) {
  const { toast } = useToast();

  const handleSave = async (updatedClient: Client) => {
    try {
      await onSave(updatedClient);
      toast({
        title: 'Customer details updated',
        description: 'The customer information has been successfully updated.',
      });
      onClose();
    } catch (error) {
      console.error('Error updating customer details:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating the customer details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Customer Details</DialogTitle>
        </DialogHeader>
        <CustomerDetailsForm
          client={client}
          onSave={handleSave}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
} 