"use client"

import React, { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useMotionValueEvent, useScroll } from "motion/react"

export const centralColumnStyle = "w-[94%] max-w-[1380px] mx-auto"
export const pageYPadding = "py-6 md:py-10"
const defaultTitleClass = "text-base sm:text-lg lg:text-xl font-bold mb-1 text-foreground tracking-tight"
const defaultDescriptionClass = "text-xs sm:text-sm font-normal text-muted-foreground max-w-[440px] leading-relaxed line-clamp-3"

export interface ItemContent {
  title: string
  description: string
  badge?: string
  image: {
    url: string
    width: number
    height: number
    alt: string
  }
}

interface Props extends React.ComponentProps<"div"> {
  contentA: ItemContent
  contentB: ItemContent
  contentC: ItemContent
  header?: React.ReactNode
  titleClass?: string
  descriptionClass?: string
}

export const ScrollRevealContentA = ({
  contentA,
  contentB,
  contentC,
  header,
  titleClass = defaultTitleClass,
  descriptionClass = defaultDescriptionClass,
  className,
  ...props
}: Props) => {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [clickedStep, setClickedStep] = useState<number | null>(null)
  const [mobileStep, setMobileStep] = useState(0)
  const ref0 = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref0,
    offset: ["start 80px", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (latest: number) => {
    setScrollProgress(latest)
    if (clickedStep !== null) {
      setClickedStep(null)
    }
  })

  const effectiveProgress =
    clickedStep !== null
      ? clickedStep === 0
        ? 0.1
        : clickedStep === 1
        ? 0.48
        : 0.82
      : scrollProgress

  const currentStepIndex =
    clickedStep !== null
      ? clickedStep
      : effectiveProgress < 0.32
      ? 0
      : effectiveProgress < 0.65
      ? 1
      : 2

  const handleStepClick = (stepIndex: number) => {
    setClickedStep(stepIndex)
    if (ref0.current) {
      const rect = ref0.current.getBoundingClientRect()
      const scrollTop = window.scrollY + rect.top - 80
      const scrollRange = ref0.current.offsetHeight - (window.innerHeight - 80)
      if (scrollRange > 0) {
        const targetScroll =
          scrollTop + (stepIndex === 0 ? 0 : stepIndex === 1 ? scrollRange * 0.48 : scrollRange * 0.82)
        window.scrollTo({ top: targetScroll, behavior: "smooth" })
      }
    }
  }

  const items = [contentA, contentB, contentC]
  const activeMobileContent = items[mobileStep]

  return (
    <div className={cn("relative w-full bg-background", className)} {...props}>
      {/* ========================================================================= */}
      {/* DESKTOP: STICKY SCROLL-REVEAL SHOWCASE (lg+) */}
      {/* ========================================================================= */}
      <div ref={ref0} className="relative w-full h-[260vh] hidden lg:block">
        {/* Sticky viewport frame: pinned cleanly 80px below the global navbar */}
        <div className="sticky top-20 h-[calc(100dvh-5rem)] w-full flex flex-col justify-center z-20">
          <div className={cn(centralColumnStyle, "w-full py-2")}>
            {header && <div className="mb-4">{header}</div>}

            <div className="flex flex-row items-center justify-between gap-8 xl:gap-14 w-full">
              {/* Left Column: 3 Numbered Steps with Growing Vertical Progress Line */}
              <div className="w-[38%] xl:w-[35%] flex flex-col justify-center gap-3 xl:gap-4 shrink-0">
                <PointItem
                  active={true}
                  number="01"
                  badge={contentA.badge}
                  title={contentA.title}
                  description={contentA.description}
                  thresholdStart={0}
                  thresholdEnd={0.32}
                  scrollProgress={effectiveProgress}
                  onClick={() => handleStepClick(0)}
                  titleClass={titleClass}
                  descriptionClass={descriptionClass}
                />
                <PointItem
                  active={true}
                  number="02"
                  badge={contentB.badge}
                  title={contentB.title}
                  description={contentB.description}
                  thresholdStart={0.32}
                  thresholdEnd={0.65}
                  scrollProgress={effectiveProgress}
                  onClick={() => handleStepClick(1)}
                  titleClass={titleClass}
                  descriptionClass={descriptionClass}
                />
                <PointItem
                  active={true}
                  number="03"
                  badge={contentC.badge}
                  title={contentC.title}
                  description={contentC.description}
                  thresholdStart={0.65}
                  thresholdEnd={0.92}
                  scrollProgress={effectiveProgress}
                  onClick={() => handleStepClick(2)}
                  titleClass={titleClass}
                  descriptionClass={descriptionClass}
                />
              </div>

              {/* Right Column: Synchronized Visual Mockup Card (Enlarged) */}
              <div className="w-[62%] xl:w-[65%] flex items-center justify-center relative">
                <div className="relative w-full max-w-[680px] xl:max-w-[780px] 2xl:max-w-[840px] aspect-16/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-border/80 bg-card ring-1 ring-border/50">
                  <Image
                    width={contentA.image.width}
                    height={contentA.image.height}
                    src={contentA.image.url}
                    alt={contentA.image.alt}
                    unoptimized
                    priority
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ease-in-out",
                      currentStepIndex === 0
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105 pointer-events-none"
                    )}
                  />
                  <Image
                    width={contentB.image.width}
                    height={contentB.image.height}
                    src={contentB.image.url}
                    alt={contentB.image.alt}
                    unoptimized
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover object-center transition-all duration-500 ease-in-out",
                      currentStepIndex === 1
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105 pointer-events-none"
                    )}
                  />
                  <Image
                    width={contentC.image.width}
                    height={contentC.image.height}
                    src={contentC.image.url}
                    alt={contentC.image.alt}
                    unoptimized
                    className={cn(
                      "absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 ease-in-out",
                      currentStepIndex === 2
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105 pointer-events-none"
                    )}
                  />

                  {/* Subtle edge vignette along bottom */}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />

                  {/* Dynamic Step Badge on Top of Image */}
                  <div className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-background/90 backdrop-blur-md border border-border/80 text-xs font-bold text-foreground shadow-md flex items-center gap-2">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    <span>
                      {currentStepIndex === 0
                        ? contentA.badge || "Step 01 • Setup & Shifts"
                        : currentStepIndex === 1
                        ? contentB.badge || "Step 02 • High-Speed POS"
                        : contentC.badge || "Step 03 • Inventory & Restock Radar"}
                    </span>
                  </div>

                  {/* Visual progress track along the bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-10">
                    <div
                      className="h-full bg-primary transition-all duration-100"
                      style={{ width: `${Math.min(100, Math.max(0, effectiveProgress * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE / TABLET: INTERACTIVE STEPPER TABS (< lg) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full px-4 sm:px-6 py-10">
        {header && <div className="mb-6">{header}</div>}

        {/* Tab Selector */}
        <div className="flex items-center justify-center gap-2 p-1.5 bg-muted/80 rounded-2xl border border-border/70 max-w-sm mx-auto mb-6 shadow-2xs">
          {[
            { idx: 0, label: "01 Setup" },
            { idx: 1, label: "02 POS" },
            { idx: 2, label: "03 Inventory" },
          ].map((tab) => (
            <button
              key={tab.idx}
              type="button"
              onClick={() => setMobileStep(tab.idx)}
              className={cn(
                "flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center",
                mobileStep === tab.idx
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Step Content Card */}
        <div className="max-w-2xl sm:max-w-3xl mx-auto space-y-4">
          <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden shadow-md border border-border/80 bg-card">
            <Image
              width={activeMobileContent.image.width}
              height={activeMobileContent.image.height}
              src={activeMobileContent.image.url}
              alt={activeMobileContent.image.alt}
              unoptimized
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full bg-background/90 backdrop-blur-md border border-border/80 text-[11px] font-bold text-foreground shadow-xs">
              {activeMobileContent.badge}
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {activeMobileContent.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {activeMobileContent.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScrollRevealContentA

const getBarPercentageHeight = (scrollProgress: number, thresholdStart: number, thresholdEnd: number) => {
  if (scrollProgress < thresholdStart) {
    return 0
  }
  if (scrollProgress > thresholdEnd) {
    return 100
  }
  return ((scrollProgress - thresholdStart) / (thresholdEnd - thresholdStart)) * 100
}

const PointItem = ({
  active,
  number,
  badge,
  title,
  description,
  thresholdStart,
  thresholdEnd,
  scrollProgress,
  onClick,
  titleClass = defaultTitleClass,
  descriptionClass = defaultDescriptionClass,
}: {
  active: boolean
  number: string
  badge?: string
  title: string
  description: string
  thresholdStart: number
  thresholdEnd: number
  scrollProgress: number
  onClick?: () => void
  titleClass?: string
  descriptionClass?: string
}) => {
  const barHeightPercentage = getBarPercentageHeight(scrollProgress, thresholdStart, thresholdEnd)
  const isActive = barHeightPercentage > 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col interactive w-full transition-all duration-300 cursor-pointer group rounded-xl p-2 -ml-2 hover:bg-muted/30",
        active && (isActive || scrollProgress >= thresholdStart) ? "opacity-100" : "opacity-40 hover:opacity-75"
      )}
    >
      <div className="w-full flex items-center gap-2.5 mb-1 ml-3 sm:ml-4">
        <h3
          className={cn(
            "text-lg sm:text-xl font-black font-mono tracking-tight transition-colors",
            isActive ? "text-primary" : "text-muted-foreground/50 group-hover:text-muted-foreground"
          )}
        >
          {number}
        </h3>
        {badge && (
          <span
            className={cn(
              "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full transition-all",
              isActive
                ? "bg-primary/15 text-primary border border-primary/30"
                : "bg-muted text-muted-foreground border border-border/50"
            )}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="w-full flex relative left-[12px] sm:left-[14px]">
        {/* Vertical Progress Bar */}
        <div className="w-[36px] sm:w-[44px] flex items-start justify-center relative shrink-0">
          <div className="h-full w-[2px] bg-border/80 absolute top-0 left-[50%] -translate-x-1/2" />
          <div
            className="h-full w-[2.5px] bg-primary absolute top-0 left-[50%] -translate-x-1/2 rounded-full transition-all duration-75 shadow-xs shadow-primary/30"
            style={{ height: `${barHeightPercentage}%` }}
          />
        </div>

        {/* Content Block */}
        <div className="flex-1 pl-2 sm:pl-3">
          <div className="flex flex-col gap-0.5">
            <h4
              className={cn(
                titleClass,
                "transition-colors leading-snug",
                isActive ? "text-foreground font-bold" : "text-muted-foreground/80 font-medium"
              )}
            >
              {title}
            </h4>
            <p
              className={cn(
                descriptionClass,
                "transition-colors",
                isActive ? "text-muted-foreground" : "text-muted-foreground/60"
              )}
            >
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


