"use client";

import Image from "next/image";
import HireBtn from "../ui/Hire";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Hero() {
  useEffect(() => {
    AOS.init({
      duration: 700,   // slower, subtle animation
      easing: 'ease-in-out',
      once: true,
      offset: 50,      // start animation a bit before element is in view
    });
  }, []);

  return (
    <section className="container mx-auto">
      <div className="flex items-center justify-center flex-col pt-[46px]">
        <div
          className="w-[71px] h-[35px] mb-[9px]"
          data-aos="fade"
          data-aos-delay="100"
        >
          <Image
            src="/images/Hello.svg"
            alt="Hello!"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>
        <div
          className="text-center mb-[50px] lg:mb-[9px]"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <h1 className="text-[32px] md:text-[42px] lg:text-[55px] thai-text font-medium">
            I&apos;m <span className="text-[#FA7892]">Ugochinyere</span>
          </h1>
          <h2 className="text-[20px] md:text-[28px] thai-text font-medium lg:text-[38px] text-[#000000]">
            Product Manager & Virtual Assistance
          </h2>
        </div>
        <div
          className="w-full max-w-[600px] flex items-center justify-center relative"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <Image
            src="/images/squoosg.webp"
            alt="hero of Mrs Ugochinyere"
            width={500}
            height={500}
            className="w-full h-full object-cover"
          />
          <div className="absolute hidden lg:block bottom-[30%] sm:bottom-[10%] left-1/2 transform -translate-x-1/2">
            <HireBtn />
          </div>
        </div>
      </div>
    </section>
  );
}
