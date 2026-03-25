import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "group/button text-base font-semibold relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "overflow-hidden text-base font-semibold bg-primary text-white hover:bg-primary/80 dark:text-white",
        outline:
          "overflow-hidden border-border font-semibold bg-background text-olive-950 shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:text-muted-foreground dark:hover:bg-input/50",
        secondary:
          "overflow-hidden bg-secondary font-semibold text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "overflow-hidden hover:bg-muted font-semibold hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "overflow-hidden bg-destructive/10 font-semibold text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "h-auto overflow-visible rounded-none bg-transparent p-0 text-muted-foreground font-semibold transition-colors duration-300 hover:text-primary",
        glass:
          "border border-white/40 bg-white/40 text-slate-900 font-semibold backdrop-blur-md transition-all duration-300 hover:bg-white/60 active:scale-95 dark:border-white/10 dark:bg-black/40 dark:text-white dark:hover:bg-black/60",
        glassPrimary:
          "border border-primary/30 bg-primary/20 text-olive-950 font-semibold backdrop-blur-md transition-all duration-300 hover:bg-primary/30 active:scale-95 dark:border-primary/20 dark:bg-primary/10 dark:text-primary-100",
      },
      size: {
        default: "h-9 gap-1.5 px-2.5",
        xs: "h-6 gap-1 px-2 text-xs",
        sm: "h-8 gap-1 px-2.5",
        lg: "h-10 gap-1.5 px-2.5",
        icon: "size-9",
        "icon-sm": "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
