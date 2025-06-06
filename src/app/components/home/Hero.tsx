"use client";

import Image from "next/image";
import HireBtn from "../ui/Hire";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css"; // Import AOS styles

export default function Hero() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // animation duration in ms
      once: true,     // whether animation should happen only once - while scrolling down
    });
  }, []);

  return (
    <section className="container mx-auto ">
      <div className="flex items-center justify-center flex-col pt-[46px]">
        <div
          data-aos="fade-down"
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
        <div data-aos="fade-up" className="text-center">
          <h1 className="text-[32px] md:text-[42px] lg:text-[55px]  thai-text font-medium">
            I&apos;m <span className="text-[#FA7892]">Ugochinyere</span>
          </h1>
          <h2 className="text-[20px] md:text-[28px] thai-text font-medium lg:text-[38px] text-[#000000]">
            Product Manger & Virtual Assistance
          </h2>
        </div>
        <div
          data-aos="zoom-in"
          className="w-full max-w-[586px] max-h-[565px] flex items-center justify-center relative"
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
