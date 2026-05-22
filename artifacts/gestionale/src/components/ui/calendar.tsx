"use client"

import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker"

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
  const defaultDisabled = (date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <DayPicker
      disabled={props.disabled !== undefined ? props.disabled : defaultDisabled}
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-background/95 backdrop-blur-xl group/calendar p-4 sm:p-5 shadow-2xl border border-border/60 rounded-[1.25rem] [--cell-size:2.5rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=card-content]_&]:shadow-none [[data-slot=card-content]_&]:border-none [[data-slot=popover-content]_&]:bg-transparent [[data-slot=popover-content]_&]:shadow-none [[data-slot=popover-content]_&]:border-none",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit mx-auto", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-6 sm:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between px-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-9 w-9 rounded-full select-none p-0 aria-disabled:opacity-50 transition-colors hover:bg-secondary hover:text-secondary-foreground shadow-sm border border-border/40",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-9 w-9 rounded-full select-none p-0 aria-disabled:opacity-50 transition-colors hover:bg-secondary hover:text-secondary-foreground shadow-sm border border-border/40",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-9 w-full items-center justify-center font-bold tracking-tight text-foreground text-[16px] capitalize",
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
          "select-none font-bold tracking-tight capitalize",
          captionLayout === "label"
            ? "text-[16px]"
            : "[&>svg]:text-muted-foreground flex h-8 items-center gap-1 rounded-md pl-2 pr-1 text-[16px] [&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse mt-2",
        weekdays: cn("flex mb-3", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground/80 flex-1 select-none text-center text-[11px] font-bold uppercase tracking-widest",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mb-1.5 gap-1.5", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-muted-foreground select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "group/day relative aspect-square h-full w-full select-none p-0 text-center flex items-center justify-center rounded-full",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-accent rounded-l-full",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("bg-accent rounded-r-full", defaultClassNames.range_end),
        today: cn(
          "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-full border-2 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground/40 aria-selected:text-muted-foreground/40",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-30",
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
              <ChevronLeftIcon className={cn("size-4", className)} {...props} />
            )
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn("size-4", className)}
                {...props}
              />
            )
          }

          return (
            <ChevronDownIcon className={cn("size-4", className)} {...props} />
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
        "flex aspect-square h-[--cell-size] w-[--cell-size] items-center justify-center rounded-full text-[14px] font-medium leading-none transition-all duration-300 ease-out",
        "hover:bg-primary/15 hover:text-primary hover:scale-[1.12] active:scale-[0.95]",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[selected-single=true]:shadow-lg data-[selected-single=true]:shadow-primary/30 data-[selected-single=true]:font-bold data-[selected-single=true]:scale-[1.05] data-[selected-single=true]:hover:bg-primary data-[selected-single=true]:hover:text-primary-foreground",
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-middle=true]:rounded-none data-[range-middle=true]:hover:bg-accent data-[range-middle=true]:hover:text-accent-foreground data-[range-middle=true]:scale-100",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-start=true]:rounded-l-full data-[range-start=true]:shadow-md data-[range-start=true]:shadow-primary/30 data-[range-start=true]:font-bold data-[range-start=true]:hover:bg-primary data-[range-start=true]:hover:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground data-[range-end=true]:rounded-r-full data-[range-end=true]:shadow-md data-[range-end=true]:shadow-primary/30 data-[range-end=true]:font-bold data-[range-end=true]:hover:bg-primary data-[range-end=true]:hover:text-primary-foreground",
        "group-data-[focused=true]/day:ring-2 group-data-[focused=true]/day:ring-primary/50 group-data-[focused=true]/day:ring-offset-2 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
