import * as React from "react"
import * as Checkbox from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"
import { Label } from "./label"
import { cn } from "../../lib/utils"

interface CheckBoxProps extends React.ComponentPropsWithoutRef<typeof Checkbox.Root> {
  label?: string
  id?: string
}

const CheckBox = React.forwardRef<
  React.ElementRef<typeof Checkbox.Root>,
  CheckBoxProps
>(({ className, label, id = "checkbox-id", ...props }, ref) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <Checkbox.Root
      ref={ref}
      id={id}
      className={cn(
        "peer shrink-0 h-5 w-5 rounded-sm border border-gray-300",
        "data-[state=checked]:bg-[#00A949] data-[state=checked]:border-00A949",
        "flex items-center justify-center transition-colors"
      )}
      {...props}
    >
      <Checkbox.Indicator>
        <CheckIcon className="h-4 w-4 text-white" />
      </Checkbox.Indicator>
    </Checkbox.Root>

    {label && (
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
    )}
  </div>
))

CheckBox.displayName = "CheckBox"

export { CheckBox }
