import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 text-sm rounded-sm border bg-card font-sans shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent placeholder:text-primary-950 focus-visible:border-primary-500 focus-visible:ring-[1px] focus-visible:ring-primary-600/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[1px] aria-invalid:ring-destructive/20 dark:bg-primary-50/10 dark:placeholder:text-primary-50 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-600/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default:
          "h-9 px-2.5 py-1 text-sm file:h-7 file:text-sm file:font-medium md:text-sm",
        xs: "h-6 px-2 py-0.5 text-xs file:h-4 file:text-xs",
        sm: "h-8 px-2.5 py-1 text-sm file:h-6 file:text-xs",
        lg: "h-10 px-3 py-2 text-base file:h-8 file:text-sm",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface InputProps
  extends
    Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  size?: VariantProps<typeof inputVariants>["size"];
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

function Input({
  className,
  type,
  size,
  startIcon,
  endIcon,
  ...props
}: InputProps) {
  if (!startIcon && !endIcon) {
    return (
      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(inputVariants({ size, className }))}
        {...props}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-stretch w-full rounded-sm border bg-muted/50 shadow-xs",
        // clips slots to border radius so corners look clean
        "overflow-hidden",
        "transition-[color,box-shadow]",
        "focus-within:border-primary-500 focus-within:ring-[1px] focus-within:ring-primary-600/15",
        "dark:bg-primary-50/10",
        "dark:focus-within:border-neutral-500 dark:focus-within:ring-neutral-600/15",
        "has-[:disabled]:pointer-events-none has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        "has-[aria-invalid]:border-destructive has-[aria-invalid]:ring-[1px] has-[aria-invalid]:ring-destructive/20",
        "dark:has-[aria-invalid]:border-destructive/50 dark:has-[aria-invalid]:ring-destructive/40",
      )}
    >
      {startIcon && (
        <div
          className={cn(
            "self-stretch flex items-center justify-center shrink-0",
            "bg-black/5 dark:bg-white/5",
            "border-r border-black/10 dark:border-white/10",
            "text-muted-foreground",
            size === "xs" && "px-1.5",
            size === "sm" && "px-2",
            size === "lg" && "px-3",
            (!size || size === "default") && "px-2.5",
          )}
        >
          {startIcon}
        </div>
      )}

      <InputPrimitive
        type={type}
        data-slot="input"
        className={cn(
          // wrapper owns border, radius, shadow — input is bare
          "flex-1 min-w-0 bg-transparent border-0 rounded-none shadow-none outline-none ring-0 focus-visible:ring-0 focus-visible:border-0",
          "font-sans transition-[color] placeholder:text-primary-950 dark:placeholder:text-primary-50",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          size === "xs" && "h-6 px-2 py-0.5 text-xs file:h-4 file:text-xs",
          size === "sm" && "h-8 px-2.5 py-1 text-sm file:h-6 file:text-xs",
          size === "lg" && "h-10 px-3 py-2 text-base file:h-8 file:text-sm",
          (!size || size === "default") &&
            "h-9 px-2.5 py-1 text-base file:h-7 file:text-sm file:font-medium md:text-sm",
          startIcon && "pl-2.5",
          endIcon && "pr-2.5",
          className,
        )}
        {...props}
      />

      {endIcon && (
        <div
          className={cn(
            "self-stretch flex items-center justify-center shrink-0",
            "bg-black/5 dark:bg-white/5",
            "border-l border-black/10 dark:border-white/10",
            "text-muted-foreground",
            size === "xs" && "px-1.5",
            size === "sm" && "px-2",
            size === "lg" && "px-3",
            (!size || size === "default") && "px-2.5",
          )}
        >
          {endIcon}
        </div>
      )}
    </div>
  );
}

export { Input, inputVariants };
