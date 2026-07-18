'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronsUpDown, CornerDownLeft } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  ANALYTICS_PRESETS,
  resolveAnalyticsRange,
  type AnalyticsPreset,
  type AnalyticsRange,
} from '@/lib/admin/analyticsRange';

type Props = {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
};

export function AnalyticsDateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(value.preset === 'custom');
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: value.from,
    to: value.to,
  });

  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'Local';
    }
  }, []);

  const applyPreset = (preset: Exclude<AnalyticsPreset, 'custom'>) => {
    const next = resolveAnalyticsRange(preset);
    onChange(next);
    setShowCustom(false);
    setDraft({ from: next.from, to: next.to });
    setOpen(false);
  };

  const applyCustom = () => {
    if (!draft?.from || !draft?.to) return;
    const next = resolveAnalyticsRange('custom', draft.from, draft.to);
    onChange(next);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft({ from: value.from, to: value.to });
          setShowCustom(value.preset === 'custom');
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 hover:bg-zinc-900"
        >
          <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium">{value.label}</span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto border-zinc-700 bg-zinc-950 p-0 text-zinc-100 shadow-2xl"
        sideOffset={8}
      >
        <div className="flex min-w-[280px] flex-col sm:flex-row">
          <div className="border-b border-zinc-800 p-2 sm:w-48 sm:border-b-0 sm:border-r">
            {ANALYTICS_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => applyPreset(preset.value)}
                className={cn(
                  'flex w-full rounded-md px-3 py-2 text-left text-sm transition',
                  value.preset === preset.value && !showCustom
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900',
                )}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowCustom(true)}
              className={cn(
                'mt-1 flex w-full rounded-md px-3 py-2 text-left text-sm transition',
                showCustom ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-900',
              )}
            >
              Custom range…
            </button>
          </div>

          {showCustom ? (
            <div className="space-y-3 p-3">
              <div
                className="rounded-lg"
                style={
                  {
                    '--rdp-accent-color': '#fafafa',
                    '--rdp-accent-background-color': '#3f3f46',
                    colorScheme: 'dark',
                  } as CSSProperties
                }
              >
                <DayPicker
                  mode="range"
                  selected={draft}
                  onSelect={setDraft}
                  numberOfMonths={1}
                  locale={enUS}
                  defaultMonth={draft?.from ?? value.from}
                  disabled={{ after: new Date() }}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs">
                  <p className="text-zinc-500">Start</p>
                  <p className="font-medium text-zinc-100">
                    {draft?.from ? format(draft.from, 'MMM d, yyyy') : '—'}
                  </p>
                </div>
                <div className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs">
                  <p className="text-zinc-500">End</p>
                  <p className="font-medium text-zinc-100">
                    {draft?.to ? format(draft.to, 'MMM d, yyyy') : '—'}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                size="sm"
                className="w-full bg-white text-zinc-950 hover:bg-zinc-200"
                disabled={!draft?.from || !draft?.to}
                onClick={applyCustom}
              >
                Apply
                <CornerDownLeft className="ml-1 h-3.5 w-3.5" />
              </Button>

              <p className="text-[11px] text-zinc-500">Local ({timezone})</p>
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
