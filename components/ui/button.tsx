import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-teal text-white hover:bg-primary-teal-deep shadow-soft",
        outline:
          "border-2 border-primary-teal text-primary-teal-deep bg-transparent hover:bg-primary-teal hover:text-white",
        ghost: "text-neutral-espresso hover:bg-neutral-espresso/5",
        /** HANYA dipakai di atas background gelap (graphite/teal-deep). Jangan di atas putih. */
        limeOnDark: "bg-accent-lime text-neutral-graphite hover:brightness-95",
        dangerOutline:
          "border-2 border-red-400 text-red-600 bg-transparent hover:bg-red-50",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6",
        lg: "h-14 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
