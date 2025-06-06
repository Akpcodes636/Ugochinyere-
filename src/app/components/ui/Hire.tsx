"use client";
import { MdOutlineArrowOutward } from "react-icons/md";
import Button from "./Button";
import Link from "next/link";

export default function HireBtn() {
  return (
    <div className="flex items-center gap-3 justify-center bg-white rounded-full p-2">
      <Link href="#contact">
        <Button
          style="pink"
          type="button"
          icon={<MdOutlineArrowOutward />}
          css="px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium"
        >
          Hire Me
        </Button>
      </Link>
      <Link href="#portfolio">
        <Button
          style="white"
          type="button"
          icon={null}
          css="px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-medium text-[#FA7892] border border-gray-200 hover:border-[#FA7892]"
        >
          Portfolio
        </Button>
      </Link>
    </div>
  );
}
