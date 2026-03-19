import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 text-sm rounded-md border bg-card font-sans shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent placeholder:text-primary-950 focus-visible:border-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-600/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:bg-primary-50/10 dark:placeholder:text-primary-50 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-600/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        default:
          "h-9 px-2.5 py-1 text-base file:h-7 file:text-sm file:font-medium md:text-sm",
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
}

function Input({ className, type, size, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ size }), className)}
      {...props}
    />
  );
}

export { Input, inputVariants };
