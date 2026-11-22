import AgencyHeroSection from "@/components/shadcn-space/blocks/hero-01";
import { GlowMockupPreview } from "@/components/hero-with-mockup";
import { HowItWorksSection } from "@/components/how-it-works";
import { DeviceMockupPicture } from "@/components/hero-section-6";
import { MotionFooter } from "@/components/motion-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-clip">
      {/* 1. Agency (Hero 1) as the Top Hero Banner */}
      <AgencyHeroSection />

      {/* 2. Glow Mockup (Launch UI) - only Tindahan POS dashboard preview with ambient glow */}
      <section id="pos-interface" className="relative w-full -mt-2 md:-mt-6 mb-8 md:mb-16 scroll-mt-24">
        <div className="container mx-auto px-4 text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary backdrop-blur-md">
            <span>✨ Live Web & POS System</span>
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
            Streamlined Retail POS Interface
          </h2>
          <p className="mt-1 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Intuitive touchscreen checkout, hardware & camera barcode scanning, and instant shift settlement.
          </p>
        </div>
        <GlowMockupPreview />
      </section>

      {/* 3. System Explanation: How Stockify Works */}
      <HowItWorksSection />

      {/* 4. Device Mockup - only the picture (Desktop screenshot + overlaid iPhone), without the hero texts */}
      <section id="multi-device" className="relative w-full my-12 md:my-20 scroll-mt-24">
        <div className="container mx-auto px-4 text-center mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-3.5 py-1 text-xs font-semibold text-foreground backdrop-blur-md">
            <span>📱 Multi-Device Ready</span>
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight">
            Run on Any Counter or Smartphone
          </h2>
          <p className="mt-1 text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Switch between desktop cashier terminals and mobile staff devices seamlessly.
          </p>
        </div>
        <DeviceMockupPicture />
      </section>

      {/* 5. Motion Footer */}
      <MotionFooter />
    </div>
  );
}
