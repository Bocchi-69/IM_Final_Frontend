import { cn } from "@/lib/utils";

interface GlowProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "above" | "below" | "center";
}

export function Glow({ className, variant = "above", ...props }: GlowProps) {
  return (
    <div
      data-slot="glow"
      className={cn(
        "absolute aspect-square w-full rounded-full bg-primary/20 blur-[130px] pointer-events-none -z-10",
        variant === "above" && "-top-1/2 left-1/2 -translate-x-1/2",
        variant === "below" && "-bottom-1/2 left-1/2 -translate-x-1/2",
        variant === "center" && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    />
  );
}
