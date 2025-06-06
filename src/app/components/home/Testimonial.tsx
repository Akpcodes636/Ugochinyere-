"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Testimonials } from "@/app/utils/Contents";
import TestimonialCard from "../ui/TestimonialCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

import { useState } from "react";

export default function Testimonial() {
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <section id="Testimonial" className="bg-cover py-[53px]">
      <div className="container mx-auto">
        <div className="max-w-[400px] md:max-w-[400px] lg:max-w-[634px] mx-auto">
          <Image
            src="/images/Texts.svg"
            width={500}
            height={500}
            alt="image testimonial"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="pt-[80px] pb-[40px] flex items-center justify-center">
        <Swiper
      
          modules={[EffectCoverflow, Navigation]}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          // spaceBetween={30}
          // onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="testimonial-swiper"
          centeredSlides={true}
          slidesPerView="auto" // Shows other cards slightly
          slideActiveClass="custom-active-slide"
          loop={true}
          speed={300}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlidesBounds={true}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          }}
        >
          {Testimonials.map((testimonial, index) => (
            <SwiperSlide
              key={index}
              className="!w-[90%] md:!w-[600px] lg:!w-[711px] transition-all"
            >
              <TestimonialCard testimonial={testimonial} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Arrows */}
      </div>
      <div className="flex justify-center gap-6">
        <button className="swiper-button-prev bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center">
          <FaArrowLeft size={16} />
        </button>
        <button className="swiper-button-next bg-[#FF5A5F] text-white w-10 h-10 rounded-full flex items-center justify-center">
          <FaArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
