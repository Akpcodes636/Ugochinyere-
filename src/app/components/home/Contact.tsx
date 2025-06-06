"use client";

import { useEffect } from "react";
import Button from "../ui/Button";
import InputField from "../ui/InputField";
import { CalendarDays, Mail, User } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

export default function Contact() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      once: true,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <section id="contact" data-aos="fade-up" data-aos-delay="100">
      <div className="container mx-auto py-[80px]">
        <div data-aos="fade-down" data-aos-delay="200" className="mb-6">
          <h1 className="text-[28px] md:text-[38px] lg:text-[38px] font-medium text-center thai-text mb-[8px]">
            Contact <span className="text-[#FA7892]">Me</span>
          </h1>
          <p className="text-[16px] md:text-[16px] lg:text-[18px] font-normal text-[#000000] text-center">
            Choose your preferred way to connect with me
          </p>
        </div>

        <div className="flex flex-col items-center justify-center md:flex-col lg:flex-row gap-[30px] mt-[48px]">
          {/* Contact Form */}
          <div
            className="shadow-[0px_6px_16px_4px_#FEEBEF] w-full md:w-[80%] lg:w-[605px] h-[560px] rounded-[5px]"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            <div className="py-[45px] px-[26px]">
              <form>
                <InputField
                  name="Name"
                  label="Name"
                  placeholder="Your name"
                  value=""
                  onChange={(e) => console.log(e.target.value)}
                  icon={<User size={18} />}
                  css="pl-10"
                />
                <InputField
                  name="Email"
                  label="Email"
                  placeholder="johndoe@gmail.com"
                  value=""
                  onChange={(e) => console.log(e.target.value)}
                  icon={<Mail size={18} />}
                  css="pl-10"
                />
                <div className="flex flex-col gap-2">
                  <label className="label-class">Message</label>
                  <textarea
                    name=""
                    id=""
                    className="w-full  h-[152px] border border-[#EFEFEF] rounded-[5px] p-[16px]  hover:border focus:border-[3px] focus:bg-white focus:outline-none resize-none"
                    placeholder="Your message"
                  ></textarea>
                </div>
                <div className="flex items-center justify-center mt-[28px]">
                  <Button
                    type="submit"
                    icon={null}
                    style="pink"
                    css="w-[393px] h-[43px] rounded-[31px] font-bold text-[#000000]"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Schedule Call */}
          <div
            className="shadow-[0px_6px_16px_4px_#FEEBEF] w-full md:w-[80%] lg:w-[605px] h-[560px] rounded-[5px]"
            data-aos="fade-left"
            data-aos-delay="400"
          >
            <div className="p-[45px] pb-[180px] px-[55px]">
              <div className="flex items-center justify-center flex-col">
                <div className="w-[60px] h-[60px] bg-[#FEF0F3] rounded-full flex items-center justify-center mb-[16px]">
                  <CalendarDays size={25} color="#FA7892" />
                </div>
                <div className="w-full max-w-[496px]">
                  <h1 className="text-[16px] md:text-[16px] lg:text-[20px] font-semibold text-[#000000] text-center">
                    Schedule a Call
                  </h1>
                  <p className="text-[#00000066] text-center text-[16px] mb-[32px]">
                    Book a 30-minuter consultation to discuss your project in
                    detail. I&apos;ll be happy to answer any questions you might
                    have.
                  </p>
                  <div className="flex items-center justify-center mt-[28px] mb-[56px]">
                    <Button
                      type="submit"
                      icon={null}
                      style="pink"
                      css="w-[393px] h-[43px] rounded-[31px] font-bold text-[#000000]"
                    >
                      Book a Call
                    </Button>
                  </div>
                  <hr className="border border-[#E2E2E2AB]" />
                  <div className="pt-[32px] flex items-center justify-center gap-[8px] w-full max-w-[236px] mx-auto">
                    <span>
                      <CalendarDays size={22} color="#00000066" />
                    </span>
                    <p className="text-[14px] lg:text-[16px] text-[#00000066]">
                      Avaliable Monday to Friday
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
