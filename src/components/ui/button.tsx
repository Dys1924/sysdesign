"use client";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { type VariantProps } from "class-variance-authority";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof ButtonPrimitive>,
    VariantProps<typeof buttonVariants> {
  href?: string;
  icon?: React.ElementType;
  hideIcon?: boolean;
  showLine?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, href, icon: Icon, hideIcon, showLine, children, ...props }, ref) => {
    const renderIcon = !hideIcon && Icon;

  const content = (
  <>
    {renderIcon && <Icon className="shrink-0 size-4" />}
    {showLine ? (
      <>
        <span className="relative z-10 text-sm font-medium">{children}</span>
        <span
          className="absolute -bottom-1 left-0 h-[1.5px] w-full bg-current scale-x-0 transition-transform duration-300 ease-in-out origin-left group-hover/button:scale-x-100 z-0"
          aria-hidden="true"
        />
      </>
    ) : (
      children
    )}
  </>
);

    const combinedClassName = cn(buttonVariants({ variant, size, className }));

    if (href) {
      return (
        <Link to={href} className={combinedClassName}>
          {content}
        </Link>
      );
    }

    return (
      <ButtonPrimitive ref={ref} className={combinedClassName} {...props}>
        {content}
      </ButtonPrimitive>
    );
  },
);

Button.displayName = "Button";
export { Button, buttonVariants, type ButtonProps };