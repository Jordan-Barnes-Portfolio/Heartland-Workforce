import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth } from 'date-fns';
import { CalendarIcon, ChevronDown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock data for time cards
const timeCards = Array.from({ length: 20 }, (_, i) => ({
  id: `TC-${1000 + i}`,
  employeeName: `Employee ${i + 1}`,
  department: ['Engineering', 'Sales', 'Support', 'Management'][Math.floor(Math.random() * 4)],
  status: ['submitted', 'approved', 'rejected'][Math.floor(Math.random() * 3)],
  regularHours: Math.floor(Math.random() * 20) + 30,
  overtimeHours: Math.floor(Math.random() * 10),
  entries: Array.from({ length: 5 }, (_, j) => ({
    date: format(subDays(new Date(), j), 'yyyy-MM-dd'),
    clockIn: '09:00',
    clockOut: '17:00',
    breaks: [{ start: '12:00', end: '13:00' }],
    project: ['Project A', 'Project B', 'Project C'][Math.floor(Math.random() * 3)],
  })),
}));

const statusColors = {
  submitted: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function TimeCards() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfWeek(new Date()),
    to: endOfWeek(new Date()),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'employeeName', direction: 'asc' });

  const handleQuickDateSelect = (period: 'current-week' | 'last-week' | 'current-month') => {
    const today = new Date();
    let from: Date, to: Date;

    switch (period) {
      case 'current-week':
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case 'last-week':
        from = startOfWeek(subDays(today, 7));
        to = endOfWeek(subDays(today, 7));
        break;
      case 'current-month':
        from = startOfMonth(today);
        to = new Date();
        break;
    }

    setDateRange({ from, to });
  };

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Filter and sort time cards
  const filteredTimeCards = timeCards
    .filter((card) => {
      const matchesSearch = card.employeeName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment = departmentFilter === 'all' || card.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
      return matchesSearch && matchesDepartment && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key as keyof typeof a];
      const bValue = b[sortConfig.key as keyof typeof b];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortConfig.direction === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    });

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Time Cards</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track and manage employee work hours
              </p>
            </div>

            {/* Filters and Controls */}
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start gap-2 text-left font-normal"
                    >
                      <CalendarIcon className="h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'LLL dd, y')} -{' '}
                            {format(dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{ from: dateRange.from, to: dateRange.to }}
                      onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect('current-week')}
                >
                  Current Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect('last-week')}
                >
                  Last Week
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickDateSelect('current-month')}
                >
                  Current Month
                </Button>
              </div>

              <div className="ml-auto flex items-center gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Support">Support</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Time Cards Table */}
            <Card>
              <CardHeader>
                <CardTitle>Employee Time Cards</CardTitle>
                <CardDescription>
                  View and manage employee work hours and time entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('employeeName')}
                        >
                          Employee
                          <ChevronDown className="ml-2 h-4 w-4 inline-block" />
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('department')}
                        >
                          Department
                        </TableHead>
                        <TableHead className="text-right">Regular Hours</TableHead>
                        <TableHead className="text-right">Overtime Hours</TableHead>
                        <TableHead className="text-right">Total Hours</TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTimeCards.map((timeCard) => (
                        <TableRow
                          key={timeCard.id}
                          className="group cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {timeCard.employeeName}
                            <div className="text-sm text-gray-500">{timeCard.id}</div>
                          </TableCell>
                          <TableCell>{timeCard.department}</TableCell>
                          <TableCell className="text-right">
                            {timeCard.regularHours}
                          </TableCell>
                          <TableCell className="text-right">
                            {timeCard.overtimeHours}
                          </TableCell>
                          <TableCell className="text-right">
                            {timeCard.regularHours + timeCard.overtimeHours}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[timeCard.status]}>
                              {timeCard.status.charAt(0).toUpperCase() + timeCard.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}