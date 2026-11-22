import { cn } from "@/lib/utils";

interface MockupProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "browser" | "responsive";
}

export function Mockup({
  children,
  className,
  type = "browser",
  ...props
}: MockupProps) {
  return (
    <div
      data-slot="mockup"
      className={cn(
        "relative mx-auto rounded-2xl border border-border/60 bg-card/80 p-2 shadow-2xl backdrop-blur-md overflow-hidden",
        className
      )}
      {...props}
    >
      {type === "browser" && (
        <div className="flex items-center gap-1.5 border-b border-border/40 px-3 py-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <div className="mx-auto h-4 w-48 rounded-full bg-muted/70 text-[10px] text-center text-muted-foreground flex items-center justify-center font-mono">
            stockify.ph
          </div>
        </div>
      )}
      <div className="overflow-hidden rounded-xl bg-background">{children}</div>
    </div>
  );
}
