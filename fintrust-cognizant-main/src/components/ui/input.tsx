import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-blue-200/50 dark:border-blue-400/30 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:bg-white dark:focus-visible:bg-slate-800 focus-visible:border-blue-400 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }