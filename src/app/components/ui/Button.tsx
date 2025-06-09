"use client";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  type: "button" | "submit" | "reset";
  css?: string;
  icon: React.ReactNode;
  style: "white" | "pink";
  fn?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type,
  css,
  icon,
  style,
  fn,
}) => {
  return (
    <button
      onClick={fn}
      type={type}
      className={`flex items-center justify-center font-medium cursor-pointer transition duration-150 ${css} ${
        style === "white" && "border border-[#000000] text-black"
      } ${style === "pink" && "bg-[#FA7892] text-[#141414]"}
      }`}
    >
      {children}
      {icon && <span>{icon}</span>}
    </button>
  );
};

export default Button;
