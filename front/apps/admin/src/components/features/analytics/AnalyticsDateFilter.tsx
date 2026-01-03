import { Calendar, Check } from 'lucide-react';
import { Menu, MenuItem, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { getDaysAgo, getMonthsFromToday, getCurrentISOTimestamp } from '@/utils';

export type DateRangePreset = '7d' | '14d' | '30d' | '90d' | '12m' | 'all' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  fromDate?: string;
  toDate?: string;
  label: string;
}

export interface AnalyticsDateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const presets: { value: DateRangePreset; label: string; getDates: () => { from: string; to: string } }[] = [
  {
    value: '7d',
    label: 'Last 7 days',
    getDates: () => ({
      from: new Date(getDaysAgo(7)).toISOString(),
      to: getCurrentISOTimestamp(),
    }),
  },
  {
    value: '14d',
    label: 'Last 14 days',
    getDates: () => ({
      from: new Date(getDaysAgo(14)).toISOString(),
      to: getCurrentISOTimestamp(),
    }),
  },
  {
    value: '30d',
    label: 'Last 30 days',
    getDates: () => ({
      from: new Date(getDaysAgo(30)).toISOString(),
      to: getCurrentISOTimestamp(),
    }),
  },
  {
    value: '90d',
    label: 'Last 90 days',
    getDates: () => ({
      from: new Date(getDaysAgo(90)).toISOString(),
      to: getCurrentISOTimestamp(),
    }),
  },
  {
    value: '12m',
    label: 'Last 12 months',
    getDates: () => ({
      from: new Date(getMonthsFromToday(-12)).toISOString(),
      to: getCurrentISOTimestamp(),
    }),
  },
  {
    value: 'all',
    label: 'All time',
    getDates: () => ({ from: '', to: '' }),
  },
];

export function AnalyticsDateFilter({ value, onChange, className }: AnalyticsDateFilterProps) {
  const handleSelect = (presetValue: DateRangePreset) => {
    const preset = presets.find((p) => p.value === presetValue);
    if (preset) {
      const dates = preset.getDates();
      onChange({
        preset: presetValue,
        fromDate: dates.from || undefined,
        toDate: dates.to || undefined,
        label: preset.label,
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      <Menu
        trigger={
          <Button variant='outline' size='sm' className='min-w-35 justify-between gap-2'>
            <Calendar className='h-4 w-4' />
            <span>{value.label}</span>
          </Button>
        }
        align='end'
      >
        {presets.map((preset) => (
          <MenuItem
            key={preset.value}
            onClick={() => handleSelect(preset.value)}
            icon={value.preset === preset.value ? <Check className='h-4 w-4' /> : undefined}
          >
            {preset.label}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

// Helper to create initial date range
export function getDefaultDateRange(): DateRange {
  const preset = presets.find((p) => p.value === '30d')!;
  const dates = preset.getDates();
  return {
    preset: '30d',
    fromDate: dates.from,
    toDate: dates.to,
    label: preset.label,
  };
}
