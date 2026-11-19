"use client";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { Services } from "@/app/utils/Contents";
import ServicesCard from "../ui/ServicesCard";

export default function ServicesSection() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <section id="service" className="py-[80px]">
      <div className="container mx-auto">
        <h1
          className="text-[28px] md:text-[38px] lg:text-[38px] font-medium text-center thai-text mb-[40px]"
          data-aos="fade"
          data-aos-delay="100"
        >
          My <span className="text-[#B219D0] ">Services</span>
        </h1>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[31px] gap-y-[56px] w-full h-full place-items-center px-4"
        >
          {Services.map((item, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={150 + index * 100} // stagger delay by 100ms per card
            >
              <ServicesCard service={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
