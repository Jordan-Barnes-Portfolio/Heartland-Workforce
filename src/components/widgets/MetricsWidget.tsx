import { useState } from 'react';
import { BaseWidget } from './BaseWidget';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth } from 'date-fns';
import type { Widget } from '@/types/widget';

// Mock data generator function
const generateMockData = (days: number, isTimeCard: boolean) => {
  return Array.from({ length: days }, (_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    return {
      name: format(date, 'MMM dd'),
      value: isTimeCard 
        ? Math.floor(Math.random() * 120) + 420 // 7-9 hours in minutes
        : Math.floor(Math.random() * 20) + 5,
    };
  });
};

interface MetricsWidgetProps {
  widget: Widget;
  onRemove: (id: string) => void;
}

export function MetricsWidget({ widget, onRemove }: MetricsWidgetProps) {
  const [dataType, setDataType] = useState<'timecards' | 'archived'>('timecards');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfWeek(new Date()),
    to: new Date(),
  });

  const handleQuickDateSelect = (period: 'current-week' | 'last-week' | 'current-month') => {
    const today = new Date();
    let from: Date, to: Date;

    switch (period) {
      case 'current-week':
        from = startOfWeek(today);
        to = today;
        break;
      case 'last-week':
        from = startOfWeek(subDays(today, 7));
        to = endOfWeek(subDays(today, 7));
        break;
      case 'current-month':
        from = startOfMonth(today);
        to = today;
        break;
    }

    setDateRange({ from, to });
  };

  // Generate data based on date range
  const getDaysBetween = () => {
    if (!dateRange.from || !dateRange.to) return 7;
    return Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const data = generateMockData(getDaysBetween(), dataType === 'timecards');

  const formatValue = (value: number) => {
    if (dataType === 'timecards') {
      const hours = Math.floor(value / 60);
      const minutes = value % 60;
      return `${hours}h ${minutes}m`;
    }
    return value;
  };

  return (
    <BaseWidget widget={widget} onRemove={onRemove}>
      <div className="flex flex-col p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select
            value={dataType}
            onValueChange={(value: 'timecards' | 'archived') => setDataType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timecards">Time Cards</SelectItem>
              <SelectItem value="archived">Archived Projects</SelectItem>
            </SelectContent>
          </Select>

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
                        {format(dateRange.from, 'LLL dd')} -{' '}
                        {format(dateRange.to, 'LLL dd')}
                      </>
                    ) : (
                      format(dateRange.from, 'LLL dd')
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
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickDateSelect('current-week')}
            >
              This Week
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
              This Month
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name"
                axisLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                axisLine={{ stroke: '#E5E7EB' }}
                tick={{ fill: '#6B7280' }}
                tickLine={{ stroke: '#E5E7EB' }}
                width={60}
                tickFormatter={formatValue}
              />
              <Tooltip 
                formatter={formatValue}
                contentStyle={{ 
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
              <Line 
                type="monotone"
                dataKey="value"
                stroke="#1F2937"
                strokeWidth={2}
                dot={{ fill: '#1F2937', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#1F2937' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BaseWidget>
  );
}