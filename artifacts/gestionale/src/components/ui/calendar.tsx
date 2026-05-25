"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"
import { it } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()
  // By default disable dates before today
  const defaultDisabled = (date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div className={cn("relative group/calendar-container isolate", className)}>
      {/* Decorative background glow that animates on hover */}
      <div className="absolute -inset-2 bg-gradient-to-br from-primary/30 via-transparent to-primary/10 blur-3xl -z-10 rounded-[3.5rem] opacity-40 group-hover/calendar-container:opacity-70 transition-opacity duration-700" />
      
      <DayPicker
        locale={it}
        disabled={props.disabled !== undefined ? props.disabled : defaultDisabled}
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-card/80 backdrop-blur-3xl p-6 sm:p-8 shadow-[0_12px_60px_-15px_rgba(0,0,0,0.4)] dark:shadow-[0_16px_70px_-15px_rgba(0,0,0,0.8)] border border-white/20 dark:border-white/10 rounded-[2rem] sm:rounded-[2.5rem] [--cell-size:3.4rem] sm:[--cell-size:4rem] relative z-10 transition-all duration-500",
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("it-IT", { month: "short" }),
          formatWeekdayName: (date) =>
            date.toLocaleString("it-IT", { weekday: "short" }).charAt(0).toUpperCase(),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit mx-auto relative", defaultClassNames.root),
          months: cn(
            "relative flex flex-col gap-8 sm:flex-row",
            defaultClassNames.months
          ),
          month: cn("flex w-full flex-col gap-6 sm:gap-8", defaultClassNames.month),
          nav: cn(
            "absolute inset-x-0 top-1 flex w-full items-center justify-between px-2 z-20 pointer-events-none",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: buttonVariant }),
            "pointer-events-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full select-none p-0 aria-disabled:opacity-50 transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-[0_0_20px_-5px_var(--color-primary)] active:scale-95 border border-border/30 bg-background/50 backdrop-blur-md shadow-sm",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: buttonVariant }),
            "pointer-events-auto h-12 w-12 sm:h-14 sm:w-14 rounded-full select-none p-0 aria-disabled:opacity-50 transition-all duration-300 ease-out hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:shadow-[0_0_20px_-5px_var(--color-primary)] active:scale-95 border border-border/30 bg-background/50 backdrop-blur-md shadow-sm",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex h-10 sm:h-12 w-full items-center justify-center font-serif text-[26px] sm:text-[32px] font-semibold tracking-wide text-foreground capitalize relative z-10 px-16",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "has-focus:border-ring border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] relative rounded-md border",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn(
            "bg-popover absolute inset-0 opacity-0",
            defaultClassNames.dropdown
          ),
          caption_label: cn(
            "select-none font-serif tracking-wide capitalize",
            captionLayout === "label"
              ? "text-[26px] sm:text-[32px]"
              : "[&>svg]:text-muted-foreground flex items-center gap-1 rounded-md pl-2 pr-1 text-[26px] sm:text-[32px] [&>svg]:size-5",
            defaultClassNames.caption_label
          ),
          table: "w-full border-collapse mt-4",
          weekdays: cn("", defaultClassNames.weekdays), // Revert to standard table row behavior
          weekday: cn(
            "text-muted-foreground/60 w-[--cell-size] h-10 align-middle text-center select-none text-[13px] sm:text-[14px] tracking-[0.1em] font-bold uppercase",
            defaultClassNames.weekday
          ),
          week: cn("mt-2", defaultClassNames.week), // Revert to standard table row behavior
          week_number_header: cn(
            "w-[--cell-size] select-none",
            defaultClassNames.week_number_header
          ),
          week_number: cn(
            "text-muted-foreground select-none text-[1rem]",
            defaultClassNames.week_number
          ),
          day: cn(
            "group/day relative p-2 sm:p-3 text-center align-middle",
            defaultClassNames.day
          ),
          range_start: cn(
            "bg-primary/20 rounded-l-full",
            defaultClassNames.range_start
          ),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("bg-primary/20 rounded-r-full", defaultClassNames.range_end),
          today: cn(
            "", // Remove styles from td, move them to the button
            defaultClassNames.today
          ),
          outside: cn(
            "text-muted-foreground/30 aria-selected:text-muted-foreground/30",
            defaultClassNames.outside
          ),
          disabled: cn(
            "text-muted-foreground/40 opacity-40 hover:scale-100 hover:bg-transparent hover:shadow-none hover:text-muted-foreground/40 hover:translate-y-0",
            defaultClassNames.disabled
          ),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (
              <div
                data-slot="calendar"
                ref={rootRef}
                className={cn(className)}
                {...props}
              />
            )
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (
                <ChevronLeftIcon className={cn("size-5 stroke-[2.5]", className)} {...props} />
              )
            }

            if (orientation === "right") {
              return (
                <ChevronRightIcon
                  className={cn("size-5 stroke-[2.5]", className)}
                  {...props}
                />
              )
            }

            return (
              <ChevronDownIcon className={cn("size-5 stroke-[2.5]", className)} {...props} />
            )
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div className="flex size-[--cell-size] items-center justify-center text-center">
                  {children}
                </div>
              </td>
            )
          },
          ...components,
        }}
        {...props}
      />
    </div>
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-today={modifiers.today ? "true" : undefined}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative mx-auto flex aspect-square h-[--cell-size] w-[--cell-size] items-center justify-center rounded-full text-[16px] sm:text-[20px] font-medium leading-none transition-all duration-300 ease-out z-10",
        !modifiers.disabled && "hover:bg-primary/10 hover:text-primary hover:scale-[1.12] hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-[2px] active:scale-[0.95]",
        "data-[today=true]:bg-emerald-500/10 data-[today=true]:text-emerald-600 dark:data-[today=true]:text-emerald-400 data-[today=true]:font-bold data-[today=true]:border-2 data-[today=true]:border-emerald-500/40 data-[today=true]:shadow-[0_0_20px_-3px_rgba(16,185,129,0.25)]",
        "data-[selected-single=true]:bg-gradient-to-br data-[selected-single=true]:from-primary data-[selected-single=true]:to-primary/80 data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-[0_10px_25px_-6px_var(--color-primary)] data-[selected-single=true]:font-bold data-[selected-single=true]:scale-[1.1] data-[selected-single=true]:hover:bg-primary data-[selected-single=true]:hover:text-primary-foreground data-[selected-single=true]:ring-2 data-[selected-single=true]:ring-primary/40 data-[selected-single=true]:ring-offset-2 data-[selected-single=true]:ring-offset-background data-[selected-single=true]:hover:-translate-y-1",
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:hover:bg-accent data-[range-middle=true]:hover:text-accent-foreground data-[range-middle=true]:scale-100",
        "data-[range-start=true]:bg-gradient-to-br data-[range-start=true]:from-primary data-[range-start=true]:to-primary/80 data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-l-full data-[range-start=true]:shadow-lg data-[range-start=true]:shadow-primary/40 data-[range-start=true]:font-bold data-[range-start=true]:hover:bg-primary data-[range-start=true]:hover:text-primary-foreground",
        "data-[range-end=true]:bg-gradient-to-br data-[range-end=true]:from-primary data-[range-end=true]:to-primary/80 data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-r-full data-[range-end=true]:shadow-lg data-[range-end=true]:shadow-primary/40 data-[range-end=true]:font-bold data-[range-end=true]:hover:bg-primary data-[range-end=true]:hover:text-primary-foreground",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary/50 group-data-[focused=true]/day:ring-offset-2 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-20",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
