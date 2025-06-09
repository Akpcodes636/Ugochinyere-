"use client";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow, Navigation } from "swiper/modules";
import { Testimonials } from "@/app/utils/Contents";
import TestimonialCard from "../ui/TestimonialCard";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";


export default function Testimonial() {
  return (
    <section id="Testimonial" className="bg-coer bg-black py-[53px]">
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
          className="testimonial-swiper"
          centeredSlides={true}
          slidesPerView={1}
          spaceBetween={30}
          loop={true}
          speed={500}
          effect="coverflow"
          grabCursor={true}
          coverflowEffect={{
            rotate: 15,
            stretch: 0,
            depth: 300,
            modifier: 1,
            slideShadows: true,
          }}
          breakpoints={{
            640: {
              slidesPerView: 1.2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 1.5,
              spaceBetween: 30,
            },
            1024: {
              slidesPerView: 2,
              spaceBetween: 40,
            },
          }}
        >
          {Testimonials.map((testimonial, index) => (
            <SwiperSlide
              key={index}
              className="!w-full max-w-[711px] transition-all duration-300"
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
