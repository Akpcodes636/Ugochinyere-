"use client";

import { useEffect } from "react";
import { Instagram } from "lucide-react";
import Link from "next/link";
import { FaFacebook } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { RxLinkedinLogo } from "react-icons/rx";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Footer() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <section className="bg-[#262626]">
      <div className="container mx-auto py-[58px]">
        <div className="flex flex-col md:flex-col lg:flex-row items-start justify-between gap-y-[30px]">
          <div
            className="w-full max-w-[426px]"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h4 className="text-left lg:text-[24px] thai-text text-[16px] md:text-[18px] mb-[16px] font-semibold text-[#FA7892]">
              Ugochinyere Amaonyeanaso
            </h4>
            <p className="text-[16px] text-[#FFFFFF]">
              Virtual Assistant & Project Manager helping businesses stay
              organized and efficient. Let&apos;s work together!
            </p>
          </div>

          <div
            className="w-full max-w-[128px]"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <h4 className="text-left lg:text-[24px] thai-text text-[16px] md:text-[18px] mb-[16px] font-semibold text-[#FA7892]">
              Navigation
            </h4>
            <div className="flex flex-col gap-3 text-paragraph-md xs:text-paragraph-lg text-white">
              <Link href="#">Home</Link>
              <Link href="#service">Services</Link>
              <Link href="#portfolio">Portfolio</Link>
              <Link href="#contact">Contact</Link>
            </div>
          </div>

          <div
            className="w-full max-w-[210px]"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <h4 className="text-left lg:text-[24px] thai-text text-[16px] md:text-[18px] mb-[16px] font-semibold text-[#FA7892]">
              Contact
            </h4>
            <div className="flex gap-6 text-icon-strong-inverse">
              <Link href="/">
                <Instagram size={24} color="white" />
              </Link>
              <Link href="/">
                <RiTwitterXFill size={24} color="white" />
              </Link>
              <Link href="/">
                <RxLinkedinLogo size={24} color="white" />
              </Link>
              <Link href="/">
                <FaFacebook size={24} color="white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
