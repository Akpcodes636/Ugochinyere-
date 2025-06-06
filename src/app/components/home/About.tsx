"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "../ui/Button";
import { MdOutlineArrowOutward } from "react-icons/md";
import Pagination from "../ui/Pagination";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

const images = ["/images/About.png", "/images/Hero.png"];

export default function About() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <section
      id="about"
      data-aos="fade-up"
      className="bg-cover min-h-screen rounded-t-[50px] overflow-hidden relative z-10"
    >
      <div className="container mx-auto h-full py-[50px]">
        <div className="w-[179px] h-[52px] mx-auto">
          <Image
            src="/images/Aboutme.svg"
            alt="about me image"
            width={500}
            height={500}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="flex flex-col md:flex-col lg:flex-row items-center justify-center gap-x-[72px] mt-10 px-4">
          {/* Box One */}
          <div data-aos="fade-right" className="w-full max-w-full min-h-full mb-[16px]">
            <div className="w-full h-full space-y-[24px]">
              <p className="text-[16px] md:text-[16px] lg:text-[20px] font-normal leading-[130%] text-white">
                I&apos;m{" "}
                <span className="text-[#FA7892]">Ugochinyere Amaonyeanaso</span>{" "}
                your tech-savvy virtual assistant with high proficiency in CRMs,
                Project Management and Administrative support committed to boost
                your business efficiency.
              </p>
              <p className="text-[16px] md:text-[16px] lg:text-[20px] font-normal leading-[130%] text-white">
                I help busy entrepreneurs and teams streamline operations,
                manage projects, and automate daily tasks - so you can focus on
                what truly matters. With 8+ years of global experience and a
                track record of boosting project success by 93%, I bring
                clarity, structure, and calm to your workflow.
              </p>
              <div>
                <Link href="#contact">
                  <Button
                    type="button"
                    icon={<MdOutlineArrowOutward />}
                    style="pink"
                    css="w-[150px] lg:w-[182px] h-[56px] rounded-[31px]"
                  >
                    Hire here
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Box Two */}
          <div data-aos="fade-left" className="w-full max-h-full max-w-full h-[400px]">
            <Image
              src={images[currentIndex]}
              width={500}
              height={500}
              alt="Picture of Ugochinyere"
              className="rounded-[10px] w-full h-full object-cover transition-all duration-500"
            />
            <Pagination
              activeIndex={currentIndex}
              setActiveIndex={setCurrentIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
