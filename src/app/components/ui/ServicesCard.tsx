// components/ServicesCard.tsx
"use client";
import Image from "next/image";

interface Service {
  image: string;
  title: string;
  text: string;
}

export default function ServicesCard({ service }: { service: Service }) {
  return (
    <div className="w-full max-w-[393px] h-[304px] rounded-[10px] bg-[#FBF1FD] p-[24px] flex flex-col items-center justify-center">
      <div className="w-[96px] h-[96px] bg-[#B219D0] mb-[16px] flex items-center justify-center rounded-full">
        <div className="w-[60px] h-[60px]">
          <Image
            src={service.image}
            width={60}
            height={60}
            alt="service icon"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <h2 className="mb-[8px] font-semibold text-[16px] md:text-[20px] text-center text-[#000000]">
        {service.title}
      </h2>
      <p className="text-[14px] text-center">{service.text}</p>
    </div>
  );
}

