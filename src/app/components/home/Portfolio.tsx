"use client";
import { useEffect } from "react";
import Image from "next/image";


export default function Portfolio() {
  return (
    <section id="portfolio" className="py-[30px]">
      <div className="container mx-auto px-4">
        <h1
          className="text-[28px] md:text-[38px] font-medium text-center thai-text mb-[40px]"
        >
          My Portfolio
        </h1>

        {/* Top grid section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-x-[31px] gap-y-[24px]">
          {/* Block One */}
          <div
            className="relative cursor-pointer group w-full max-w-[393px] h-[400px] rounded-[10px] overflow-hidden"
          >
            <Image
              src="/images/Rectangle.png"
              fill
              className="object-cover"
              alt="Portfolio 1"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h1 className="text-white text-3xl font-bold">One</h1>
            </div>
          </div>

          {/* Block Two A & B */}
          <div className="flex flex-col gap-[16px] w-full max-w-[393px] h-[400px]">
            <div
              className="relative cursor-pointer group w-full flex-1 rounded-[10px] overflow-hidden"
            >
              <Image
                src="/images/Rectangle.png"
                fill
                className="object-cover"
                alt="Portfolio 2A"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h1 className="text-white text-3xl font-bold">Two A</h1>
              </div>
            </div>
            <div
              className="relative cursor-pointer group w-full flex-1 rounded-[10px] overflow-hidden"
            >
              <Image
                src="/images/Rectangle.png"
                fill
                className="object-cover"
                alt="Portfolio 2B"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <h1 className="text-white text-3xl font-bold">Two B</h1>
              </div>
            </div>
          </div>

          {/* Block Three */}
          <div
            className="relative cursor-pointer group w-full max-w-[393px] h-[400px] rounded-[10px] overflow-hidden md:col-span-2 lg:col-span-1"
          >
            <Image
              src="/images/Rectangle.png"
              fill
              className="object-cover"
              alt="Portfolio 3"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h1 className="text-white text-3xl font-bold">Three</h1>
            </div>
          </div>
        </div>

        {/* Bottom two blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] mt-[32px] justify-items-center">
          <div
            className="relative cursor-pointer group w-full max-w-[400px] md:max-w-[400px] lg:max-w-[605px] h-[200px] rounded-[10px] overflow-hidden"
          >
            <Image
              src="/images/Rectangle.png"
              fill
              className="object-cover"
              alt="Portfolio 4"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h1 className="text-white text-3xl font-bold">Four</h1>
            </div>
          </div>

          <div
            className="relative cursor-pointer group w-full max-w-[400px] md:max-w-[400px] lg:max-w-[605px] h-[200px] rounded-[10px] overflow-hidden"
          >
            <Image
              src="/images/Rectangle.png"
              fill
              className="object-cover"
              alt="Portfolio 5"
            />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <h1 className="text-white text-3xl font-bold">Five</h1>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
