import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { format, subDays, subMonths, subYears } from 'date-fns';
import { Download, CalendarIcon, Search } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Mock data for the line chart
const chartData = Array.from({ length: 30 }, (_, i) => ({
  date: format(subDays(new Date(), 29 - i), 'MMM dd'),
  count: Math.floor(Math.random() * 50) + 10,
}));

// Mock data for the projects table
const projectsData = Array.from({ length: 50 }, (_, i) => ({
  id: `PRJ-${1000 + i}`,
  name: `Project ${i + 1}`,
  archiveDate: format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd'),
  completionDate: format(subDays(new Date(), Math.floor(Math.random() * 365)), 'yyyy-MM-dd'),
  status: ['Completed', 'Cancelled', 'On Hold'][Math.floor(Math.random() * 3)],
  budget: Math.floor(Math.random() * 100000) + 10000,
  duration: Math.floor(Math.random() * 90) + 30,
  teamSize: Math.floor(Math.random() * 10) + 2,
}));

export function Archived() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'archiveDate', direction: 'desc' });

  const itemsPerPage = 20;

  // Filter and sort projects
  const filteredProjects = projectsData
    .filter((project) => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
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

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleQuickDateSelect = (period: 'week' | 'month' | '3months' | 'year') => {
    const to = new Date();
    const from = period === 'week' 
      ? subDays(to, 7)
      : period === 'month'
      ? subMonths(to, 1)
      : period === '3months'
      ? subMonths(to, 3)
      : subYears(to, 1);
    
    setDateRange({ from, to });
  };

  const handleExport = () => {
    const headers = ['ID', 'Name', 'Archive Date', 'Completion Date', 'Status', 'Budget', 'Duration', 'Team Size'];
    const csvContent = [
      headers.join(','),
      ...filteredProjects.map(project => [
        project.id,
        `"${project.name}"`,
        project.archiveDate,
        project.completionDate,
        project.status,
        project.budget,
        project.duration,
        project.teamSize
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `archived-projects-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="container mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Archived Projects</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and analyze historical project data
              </p>
            </div>

            {/* Date Range and Export Controls */}
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
                  onClick={() => handleQuickDateSelect('week')}
                >
                  Last 7 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickDateSelect('month')}
                >
                  Last 30 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickDateSelect('3months')}
                >
                  Last 3 months
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickDateSelect('year')}
                >
                  Last year
                </Button>
              </div>

              <div className="ml-auto">
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="mb-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Archived
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projectsData.length}</div>
                  <p className="text-xs text-gray-500">+12% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Average Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45 days</div>
                  <p className="text-xs text-gray-500">-3% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Average Budget
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$52,450</div>
                  <p className="text-xs text-gray-500">+8% from previous period</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Average Team Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.5</div>
                  <p className="text-xs text-gray-500">No change from previous period</p>
                </CardContent>
              </Card>
            </div>

            {/* Line Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Archive Trends</CardTitle>
                <CardDescription>
                  Number of projects archived over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                        padding={{ left: 10, right: 10 }}
                        tickLine={{ stroke: '#E5E7EB' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        tick={{ fill: '#6B7280' }}
                        tickLine={{ stroke: '#E5E7EB' }}
                        axisLine={{ stroke: '#E5E7EB' }}
                        width={60}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        dot={{ fill: '#6366F1', strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: '#6366F1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Projects Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Archived Projects</CardTitle>
                    <CardDescription>
                      Detailed list of all archived projects
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Select defaultValue="20">
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Rows per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 per page</SelectItem>
                        <SelectItem value="20">20 per page</SelectItem>
                        <SelectItem value="50">50 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('name')}
                        >
                          Project
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('archiveDate')}
                        >
                          Archive Date
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('completionDate')}
                        >
                          Completion Date
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleSort('status')}
                        >
                          Status
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50 text-right"
                          onClick={() => handleSort('budget')}
                        >
                          Budget
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50 text-right"
                          onClick={() => handleSort('duration')}
                        >
                          Duration (days)
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:bg-gray-50 text-right"
                          onClick={() => handleSort('teamSize')}
                        >
                          Team Size
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div>{project.name}</div>
                            <div className="text-sm text-gray-500">{project.id}</div>
                          </TableCell>
                          <TableCell>{project.archiveDate}</TableCell>
                          <TableCell>{project.completionDate}</TableCell>
                          <TableCell>
                            <div className={`inline-flex rounded-full px-2 py-1 text-xs font-medium
                              ${project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {project.status}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            ${project.budget.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {project.duration}
                          </TableCell>
                          <TableCell className="text-right">
                            {project.teamSize}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of{' '}
                    {filteredProjects.length} results
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}