"use client";

import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

export type AvatarList = {
  image: string;
};

type HeroSectionProps = {
  avatarList: AvatarList[];
};

function HeroSection({ avatarList }: HeroSectionProps) {
  return (
    <section id="home" className="scroll-mt-24">
      <div className="w-full h-full relative">
        <div className="relative w-full pt-0 md:pt-16 pb-6 md:pb-10 before:absolute before:w-full before:h-full before:bg-linear-to-r before:from-sky-100 before:via-white before:to-amber-100 before:rounded-full before:top-24 before:blur-3xl before:-z-10 dark:before:from-slate-800 dark:before:via-black dark:before:to-stone-700 dark:before:rounded-full dark:before:blur-3xl dark:before:-z-10">
          <div className="container mx-auto relative z-10 px-4">
            <div className="flex flex-col max-w-5xl mx-auto gap-8">
              <div className="relative flex flex-col text-center items-center sm:gap-6 gap-4">
                <motion.h1
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="lg:text-7xl md:text-6xl text-4xl font-medium leading-tight"
                >
                  <span style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    Replace the notebook with{" "}
                  </span>
                  <span
                    className={`${instrumentSerif.className} tracking-tight text-primary`}
                  >
                    smart store intelligence
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeInOut" }}
                  className="text-base sm:text-lg font-normal max-w-2xl text-muted-foreground"
                >
                  Sales, inventory, and shift records for carenderias and sari-sari stores,
                  with predictive and prescriptive analysis that tells you what to restock next.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
                className="flex items-center flex-col md:flex-row justify-center gap-8"
              >
                <Button
                  asChild
                  className="relative text-sm font-bold rounded-full h-12 p-1 ps-6 pe-14 group transition-all duration-500 hover:ps-14 hover:pe-6 w-fit overflow-hidden cursor-pointer bg-gradient-to-r from-[#8eeadb] via-[#7fe0ce] to-[#63c7b5] text-[#172e30] border border-[#7fe0ce]/40 shadow-lg shadow-[#7fe0ce]/30 hover:opacity-95"
                >
                  <Link href="/login">
                    <span className="relative z-10 transition-all duration-500">
                      Get Started Now
                    </span>
                    <span className="absolute right-1 w-10 h-10 bg-[#172e30] text-[#7fe0ce] rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-44px)] group-hover:rotate-45 shadow-sm">
                      <ArrowUpRight size={16} />
                    </span>
                  </Link>
                </Button>
                <div className="flex items-center sm:gap-7 gap-3">
                  <ul className="avatar flex flex-row items-center">
                    {avatarList.map((avatar, index) => (
                      <li key={index} className="-mr-2 z-1">
                        <img
                          src={avatar.image}
                          alt="Store Owner"
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-background object-cover h-10 w-10"
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="gap-1 flex flex-col items-start text-left">
                    <div className="flex gap-1 text-amber-500">
                      {"★★★★★"}
                    </div>
                    <p className="sm:text-sm text-xs font-normal text-muted-foreground">
                      Trusted by carenderias & sari-sari stores
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
