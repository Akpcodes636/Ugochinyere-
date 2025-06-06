"use client";
import { useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { navLinks } from "../utils/Contents";

const Header = () => {
  // Correct way to initialize AOS in a client component
  useEffect(() => {
    AOS.init({
      duration: 1000, // optional: how long the animation lasts
      once: true,     // optional: only animate once
    });
  }, []);

  return (
    <header
      className="bg-black mx-auto rounded-[40px] mt-[30px] max-w-[350px] md:max-w-[700px] lg:max-w-[922px]"
      data-aos="fade-down"
      data-aos-delay="800"
    >
      <nav className="w-full h-full">
        <ul className="flex items-center justify-center gap-[15px] md:gap-[70px] lg:gap-[150px] w-full h-full min-h-[47px]">
          {navLinks.map((l, i) => (
            <li key={i}>
              <Link
                href={l.router}
                className="text-white text-[14px] md:text-[16px] lg:text-[16px] font-medium duration-200 cursor-pointer"
              >
                {l.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
