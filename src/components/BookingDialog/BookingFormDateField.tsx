"use client"

import type { CSSProperties } from "react"
import { useState } from "react"
import { format, isValid, parse } from "date-fns"
import { enUS, fr } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import type { Matcher } from "react-day-picker"
import { DayPicker } from "react-day-picker"

import "react-day-picker/style.css"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type BookingFormDateFieldProps = {
  id: string
  value: string
  onChange: (isoDate: string) => void
  onBlur: () => void
  disabled?: Matcher | Matcher[]
  placeholder: string
  openCalendarAria: string
  locale: string
  error?: string
  /** Tighter trigger on small screens (home search bar). Desktop unchanged. */
  compactMobile?: boolean
}

function parseFormDate(value: string): Date | undefined {
  if (!value?.trim()) return undefined
  const d = parse(value, "yyyy-MM-dd", new Date())
  return isValid(d) ? d : undefined
}

export function BookingFormDateField({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  placeholder,
  openCalendarAria,
  locale,
  error,
  compactMobile = false,
}: BookingFormDateFieldProps) {
  const [open, setOpen] = useState(false)
  const dfLocale = locale === "fr" ? fr : enUS
  const selected = parseFormDate(value)

  const labelText = selected
    ? format(selected, compactMobile ? "PP" : "PPP", { locale: dfLocale })
    : placeholder

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-invalid={error ? true : undefined}
            aria-label={openCalendarAria}
            className={cn(
              "w-full justify-start text-left font-normal border-gray-300 rounded-lg",
              compactMobile
                ? "h-9 min-h-9 px-2.5 py-1.5 text-xs sm:h-auto sm:min-h-[42px] sm:px-3 sm:py-2 sm:text-sm"
                : "h-auto min-h-[42px] px-3 py-2",
              !selected && "text-muted-foreground"
            )}
            onBlur={onBlur}
          >
            <CalendarIcon
              className={cn(
                "shrink-0 opacity-70",
                compactMobile ? "mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" : "mr-2 h-4 w-4",
              )}
            />
            <span className="truncate">{labelText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[calc(100vw-1.5rem)] border-gray-200 p-0 shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div
            className={cn("p-2", compactMobile && "max-sm:scale-[0.92] max-sm:origin-top")}
            style={
              { "--rdp-accent-color": "#CB1939" } as CSSProperties & {
                "--rdp-accent-color": string
              }
            }
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                onChange(d ? format(d, "yyyy-MM-dd") : "")
                setOpen(false)
              }}
              disabled={disabled}
              locale={dfLocale}
              defaultMonth={selected ?? new Date()}
              autoFocus
            />
          </div>
        </PopoverContent>
      </Popover>
      {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
    </div>
  )
}
