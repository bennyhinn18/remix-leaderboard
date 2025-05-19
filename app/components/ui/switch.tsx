"use client"

import * as React from "react"
import { cn } from "~/lib/utils"

interface SwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, name, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked)

    React.useEffect(() => {
      setIsChecked(checked)
    }, [checked])

    const handleToggle = () => {
      if (disabled) return
      const newValue = !isChecked
      setIsChecked(newValue)
      onCheckedChange?.(newValue)
    }

    return (
      <>
        {name && (
          <input
            type="hidden"
            name={name}
            value={isChecked ? "on" : "off"}
          />
        )}
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          data-state={isChecked ? "checked" : "unchecked"}
          disabled={disabled}
          onClick={handleToggle}
          className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isChecked ? "bg-blue-600" : "bg-gray-600",
            className
          )}
          ref={ref}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform",
              isChecked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
