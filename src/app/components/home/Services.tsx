"use client";
import { Services } from "@/app/utils/Contents";
import ServicesCard from "../ui/ServicesCard";

export default function ServicesSection() {
  return (
    <section
      id="service"
      className="py-[80px]"
    >
      <div className="container mx-auto">
        <h1
          className="text-[28px] md:text-[38px] lg:text-[38px] font-medium text-center thai-text mb-[40px]"
        >
          My <span className="text-[#B219D0] ">Services</span>
        </h1>

        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[31px] gap-y-[56px] w-full h-full place-items-center px-4"
        >
          {Services.map((item, index) => (
            <div
              key={index}
            >
              <ServicesCard service={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
