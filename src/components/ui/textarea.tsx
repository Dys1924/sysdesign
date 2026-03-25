import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full field-sizing-content min-h-16 min-w-0 rounded-md border  bg-muted/50  px-2.5 py-2 text-sm font-sans shadow-xs transition-[color,box-shadow] outline-none placeholder:text-primary-950 focus-visible:border-primary-500 focus-visible:ring-[1px] focus-visible:ring-primary-600/15 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1px] aria-invalid:ring-destructive/20 dark:bg-primary-50/10 dark:placeholder:text-primary-50 dark:focus-visible:border-neutral-500 dark:focus-visible:ring-neutral-600/15 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
