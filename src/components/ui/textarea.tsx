import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full field-sizing-content min-h-16 min-w-0 rounded-[--radius] border bg-card px-3 py-2 text-sm font-sans shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-[1px] focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[1px] aria-invalid:ring-destructive/20 dark:bg-white/5 dark:placeholder:text-muted-foreground dark:focus-visible:border-primary dark:focus-visible:ring-primary/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
