"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Combobox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { XMarkIcon } from "@heroicons/react/24/outline"

import { cn } from "@/lib/utils"
import { useDropdownManager } from "@/components/ui/use-dropdown-manager"

const SelectOpenContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
} | null>(null)

function Select({
  open: openProp,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const isControlled = openProp !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    defaultOpen ?? false
  )
  const open = isControlled ? openProp : uncontrolledOpen

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) setUncontrolledOpen(nextOpen)
      onOpenChange?.(nextOpen)
    },
    [isControlled, onOpenChange]
  )

  useDropdownManager(Boolean(open), () => handleOpenChange(false))

  return (
    <SelectOpenContext.Provider
      value={{ open: Boolean(open), setOpen: handleOpenChange }}
    >
      <SelectPrimitive.Root
        data-slot="select"
        open={open}
        onOpenChange={handleOpenChange}
        {...props}
      />
    </SelectOpenContext.Provider>
  )
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const select = React.useContext(SelectOpenContext)

  return (
    <SelectPrimitive.Portal>
      <div
        data-slot="select-backdrop"
        data-state={select?.open ? "open" : "closed"}
        onClick={() => select?.setOpen(false)}
        className="fixed inset-0 z-[40] bg-black/40 backdrop-blur-[1px] transition-opacity duration-150 data-[state=closed]:opacity-0 data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none"
      />
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-white text-slate-900 pointer-events-auto data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 relative z-[60] max-h-(--radix-select-content-available-height) min-w-[10rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg border border-slate-200 shadow-xl duration-150",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "data-[highlighted]:bg-slate-100 data-[highlighted]:text-slate-900 data-[state=checked]:bg-slate-100 data-[state=checked]:text-slate-900 [&_svg:not([class*='text-'])]:text-slate-500 relative flex w-full cursor-pointer items-center gap-2 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}

type SearchableSelectProps = {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  allowClear?: boolean
  disabled?: boolean
  className?: string
  buttonClassName?: string
  listClassName?: string
}

type SearchableSelectBodyProps = {
  open: boolean
  buttonRef: React.RefObject<HTMLButtonElement | null>
  onCloseRequest: () => void
  query: string
  setQuery: (value: string) => void
  selected: SelectOption | null
  filtered: SelectOption[]
  allowClear: boolean
  value: string
  placeholder: string
  searchPlaceholder: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  listClassName?: string
  onChange: (value: string) => void
}

function SearchableSelectBody({
  open,
  buttonRef,
  onCloseRequest,
  query,
  setQuery,
  selected,
  filtered,
  allowClear,
  value,
  placeholder,
  searchPlaceholder,
  disabled,
  className,
  buttonClassName,
  listClassName,
  onChange,
}: SearchableSelectBodyProps) {
  const openRef = React.useRef(open)

  React.useEffect(() => {
    openRef.current = open
  }, [open])

  useDropdownManager(open, () => {
    if (openRef.current) onCloseRequest()
  })

  return (
    <div className={cn("relative inline-block w-full overflow-visible", className)}>
      <Combobox.Button
        ref={buttonRef}
        className={cn(
          "admin-btn-secondary w-full py-2 px-3 rounded-xl text-sm flex items-center justify-between gap-2",
          disabled && "opacity-60 cursor-not-allowed",
          buttonClassName
        )}
      >
        <span className={cn("truncate", !selected && "text-[#9aa6b0]")}>
          {selected?.label ?? placeholder}
        </span>
      </Combobox.Button>
      {allowClear && value ? (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onChange("")
            setQuery("")
          }}
          className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-white/70"
          aria-label="Clear selection"
        >
          <XMarkIcon className="w-4 h-4 text-[#9aa6b0]" />
        </button>
      ) : null}
      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa6b0] pointer-events-none" />
      <Transition appear show={open} as="div" className="contents">
        <Transition.Child
          as="div"
          enter="transition duration-150 ease-out"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="transition duration-150 ease-in"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Combobox.Options
            static
            className={cn(
              "absolute top-full left-0 mt-2 w-full z-[70] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden origin-top transition duration-150 ease-out",
              listClassName
            )}
          >
            <div className="p-2 border-b border-slate-100">
              <Combobox.Input
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 text-sm outline-none text-slate-900 placeholder:text-slate-400"
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
              />
            </div>
            <div className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400">No results</div>
              )}
              {filtered.map((opt) => (
                <Combobox.Option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange(opt.value)
                    onCloseRequest()
                  }}
                  className={({ active, selected: isSelected }) =>
                    cn(
                      "px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors pointer-events-auto",
                      active && "bg-slate-100 text-slate-900",
                      isSelected && "bg-slate-100 text-slate-900 font-medium"
                    )
                  }
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <CheckIcon className="w-4 h-4 text-[#ff7a2d]" />}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </div>
          </Combobox.Options>
        </Transition.Child>
      </Transition>
    </div>
  )
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  allowClear = true,
  disabled,
  className,
  buttonClassName,
  listClassName,
}: Readonly<SearchableSelectProps>) {
  const [query, setQuery] = React.useState("")
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const selected = options.find((o) => o.value === value) ?? null
  const filtered =
    query.trim().length === 0
      ? options
      : options.filter((opt) => opt.label.toLowerCase().includes(query.trim().toLowerCase()))

  return (
    <Combobox
      value={value}
      onChange={(nextValue) => onChange(nextValue ?? "")}
      onClose={() => setQuery("")}
      disabled={disabled}
    >
      {({ open }) => (
        <SearchableSelectBody
          open={open}
          buttonRef={buttonRef}
          onCloseRequest={() => buttonRef.current?.click()}
          query={query}
          setQuery={setQuery}
          selected={selected}
          filtered={filtered}
          allowClear={allowClear}
          value={value}
          placeholder={placeholder}
          searchPlaceholder={searchPlaceholder}
          disabled={disabled}
          className={className}
          buttonClassName={buttonClassName}
          listClassName={listClassName}
          onChange={onChange}
        />
      )}
    </Combobox>
  )
}

export { SearchableSelect }
