"use client";

import Image from "next/image";
import HireBtn from "../ui/Hire";
import { useEffect } from "react";
// Import AOS styles

export default function Hero() {
  return (
    <section className="container mx-auto ">
      <div className="flex items-center justify-center flex-col pt-[46px]">
        <div
          className="w-[71px] h-[35px] mb-[9px]"
        >
          <Image
            src="/images/Hello.svg"
            alt="Hello!"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-center mb-[9px]">
          <h1 className="text-[32px] md:text-[42px] lg:text-[55px]  thai-text font-medium">
            I&apos;m <span className="text-[#FA7892]">Ugochinyere</span>
          </h1>
          <h2 className="text-[20px] md:text-[28px] thai-text font-medium lg:text-[38px] text-[#000000]">
            Product Manager & Virtual Assistance
          </h2>
        </div>
        <div
          className="w-full max-w-[586px] flex items-center justify-center relative"
        >
          <Image
            src="/images/Heross.svg"
            alt="hero of Mrs Ugochinyere"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
          <div className="absolute hidden lg:block bottom-[30%] sm:bottom-[10%] left-1/2 transform -translate-x-1/2">
            <HireBtn />
          </div>
        </div>
      </div>
    </section>
  );
}
