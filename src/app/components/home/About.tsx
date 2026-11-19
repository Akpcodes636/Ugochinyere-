"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "../ui/Button";
import { MdOutlineArrowOutward } from "react-icons/md";
import Pagination from "../ui/Pagination";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";

const images = ["/images/About.png", "/images/About1.jpg"];

export default function About() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <section id="about" className="bg-cover bg-black">
      <div className="container mx-auto py-[50px]">
        <div
          className="w-[179px] h-[52px] mx-auto"
          data-aos="fade"
          data-aos-delay="100"
        >
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
          <div
            className="w-full max-w-full  mb-[16px]"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <div className="w-full h-full space-y-[24px]">
              <p className="text-[16px] md:text-[16px] lg:text-[18px] font-normal leading-[130%] text-white">
                I&apos;m{" "}
                <span className="text-[#FA7892]">Ugochinyere Amaonyeanaso</span>{" "},
                I Help Business Owners, Founders & Startups Work Smarter and
                Grow Faster.Through Agile Project Management, Automation, and
                Process Optimization, I help streamline systems, manage
                projects, and improve workflows.
              </p>
              <p className="text-[16px] md:text-[16px] lg:text-[18px] font-normal leading-[130%] text-white">
                If your business isn&apos;t growing, there&apos;s usually a breakdown
                behind the scenes. Inefficient operations hurt your KPIs—and
                your ROI. I help startups, agencies, and busy professionals set
                up clear processes, automate tasks, and manage projects
                effectively. With the right systems in place, your business runs
                smoother, scales faster, and performs better. Let me oil your
                engine.
              </p>
              <div>
                <Link href="#contact">
                  <Button
                    type="button"
                    icon={<MdOutlineArrowOutward />}
                    style="pink"
                    css="w-[150px] lg:w-[182px] h-[45px] lg:h-[56px] rounded-[31px]"
                  >
                    Hire here
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Box Two */}
          <div
            className="w-full  max-w-full h-[216px] md:h-[350px] lg:h-[400px]"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <Image
              src={images[currentIndex]}
              width={500}
              height={500}
              alt="Picture of Ugochinyere"
              className="rounded-[10px] w-full h-full object-cover transition-all duration-500 object-top-right"
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
