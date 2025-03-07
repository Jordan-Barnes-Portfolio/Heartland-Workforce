import { useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Clock, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import { useProjects } from '@/lib/project-context';

// Mock employee data (replace with Firebase Firestore)
const mockEmployees = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Senior Technician',
    status: 'available',
    location: 'Location here',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    currentProject: null,
    skills: ['Water Damage', 'Mold Remediation', 'Fire Damage'],
    schedule: {
      start: '08:00',
      end: '17:00',
    },
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    role: 'Project Manager',
    status: 'dispatched',
    location: 'Location here',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    currentProject: 'Water Damage Restoration',
    skills: ['Project Management', 'Customer Service', 'Team Leadership'],
    schedule: {
      start: '09:00',
      end: '18:00',
    },
  },
];

// Mock project locations
const projectLocations = [
  {
    id: '1',
    position: { lat: 40.7128, lng: -74.0060 },
    title: 'Water Damage Project',
    status: 'not-started',
    address: '123 Main St, New York, NY',
  },
  {
    id: '2',
    position: { lat: 40.7580, lng: -73.9855 },
    title: 'Fire Damage Restoration',
    status: 'in-progress',
    address: '456 Park Ave, New York, NY',
  },
];

const statusColors = {
  available: 'bg-green-100 text-green-800',
  dispatched: 'bg-orange-100 text-orange-800',
  unavailable: 'bg-red-100 text-red-800',
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 40.7128,
  lng: -74.0060,
};

export function Dispatch() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDHnX59kZ00Ttpj0xF93je8EzwnmFVhva4', // Replace with your API key
  });

  const [employees, setEmployees] = useState(mockEmployees);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState<typeof mockEmployees[0] | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<typeof projectLocations[0] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { projects } = useProjects();
  const { toast } = useToast();

  const handleDispatch = async (employeeId: string, projectId: string) => {
    try {
      // TODO: Update employee status in Firestore
      // await updateEmployeeStatus(employeeId, 'dispatched', projectId);
      
      toast({
        title: 'Employee Dispatched',
        description: 'Successfully assigned employee to project.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dispatch employee. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderMap = useCallback(() => {
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={{
          styles: [
            {
              featureType: 'all',
              elementType: 'all',
              stylers: [{ saturation: -100 }],
            },
          ],
        }}
      >
        {projectLocations.map((location) => (
          <Marker
            key={location.id}
            position={location.position}
            onClick={() => setSelectedLocation(location)}
            icon={{
              url: location.status === 'not-started' 
                ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
                : 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            }}
          />
        ))}
        {selectedLocation && (
          <InfoWindow
            position={selectedLocation.position}
            onCloseClick={() => setSelectedLocation(null)}
          >
            <div className="p-2">
              <h3 className="font-medium">{selectedLocation.title}</h3>
              <p className="text-sm text-gray-500">{selectedLocation.address}</p>
              <Button 
                className="mt-2" 
                size="sm"
                onClick={() => {
                  // Handle project selection
                }}
              >
                Select Project
              </Button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    );
  }, [selectedLocation]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex flex-1 overflow-hidden bg-gray-50">
          <div className="flex flex-1">
            {/* Main Content */}
            <div className="flex flex-1 flex-col">
              {/* Stats Overview */}
              <div className="border-b bg-white p-4">
                <div className="mx-auto max-w-[1400px]">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-green-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {employees.filter(e => e.status === 'available').length}
                        </div>
                        <p className="text-xs text-gray-500">Employees ready for dispatch</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dispatched</CardTitle>
                        <div className="h-4 w-4 rounded-full bg-orange-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {employees.filter(e => e.status === 'dispatched').length}
                        </div>
                        <p className="text-xs text-gray-500">Currently on projects</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projects.filter(p => p.status === 'in-progress').length}
                        </div>
                        <p className="text-xs text-gray-500">Projects in progress</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Projects</CardTitle>
                        <Clock className="h-4 w-4 text-gray-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {projects.filter(p => p.status === 'not-started').length}
                        </div>
                        <p className="text-xs text-gray-500">Awaiting dispatch</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Map View */}
              <div className="relative flex-1">
                {renderMap()}
                
                {/* Floating Action Button */}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-[15%] z-50 h-10 w-10 rounded-full bg-white shadow-lg hover:bg-gray-100"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
              </div>
            </div>

            {/* Employee Sidebar */}
            <div
              className={`border-l bg-white transition-all duration-300 ${
                isSidebarOpen ? 'w-96' : 'w-0'
              }`}
            >
              <div className="flex h-full flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Employees</h2>
                  </div>
                  <div className="mt-4">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="dispatched">Dispatched</SelectItem>
                        <SelectItem value="unavailable">Unavailable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="divide-y">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                        onClick={() => setSelectedEmployee(employee)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.role}</div>
                          </div>
                          <Badge className={`${statusColors[employee.status as keyof typeof statusColors]}`}>
                            {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {employee.location}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {employee.schedule.start} - {employee.schedule.end}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dispatch Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispatch Employee</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedEmployee && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedEmployee.avatar} />
                    <AvatarFallback>{selectedEmployee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{selectedEmployee.name}</h3>
                    <p className="text-sm text-gray-500">{selectedEmployee.role}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployee.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Select Project</h4>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects
                        .filter((p) => p.status === 'not-started')
                        .map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.projectType} - {project.clientName}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEmployee(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleDispatch(selectedEmployee!.id, 'project-id')}>
              Confirm Dispatch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}