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
}: BookingFormDateFieldProps) {
  const [open, setOpen] = useState(false)
  const dfLocale = locale === "fr" ? fr : enUS
  const selected = parseFormDate(value)

  const labelText = selected
    ? format(selected, "PPP", { locale: dfLocale })
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
              "w-full justify-start text-left font-normal h-auto min-h-[42px] px-3 py-2 border-gray-300 rounded-lg",
              !selected && "text-muted-foreground"
            )}
            onBlur={onBlur}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-70" />
            <span className="truncate">{labelText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-gray-200 shadow-lg"
          align="start"
          sideOffset={6}
        >
          <div
            className="p-2"
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
