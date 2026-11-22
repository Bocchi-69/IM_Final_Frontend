import type { SVGAttributes } from "react";
import { StockifyLogo } from "@/components/stockify-logo";

const Logo = ({ className }: { className?: string }) => {
  return <StockifyLogo className={className} />;
};

export default Logo;
