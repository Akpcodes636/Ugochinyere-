"use client";
interface PaginationProps {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export default function Pagination({ activeIndex, setActiveIndex }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-[8px] pt-[10px] md:pt-[15px] lg:pt-[24px]">
      {[0, 1].map((index) => (
        <div
          key={index}
          onClick={() => setActiveIndex(index)}
          className={`cursor-pointer transition-all duration-300 ${
            activeIndex === index
              ? "w-[36px] bg-[#FA7892]"
              : "w-[10px] bg-[#D9D9D9]"
          } h-[10px] rounded-[19px]`}
        ></div>
      ))}
    </div>
  );
}
