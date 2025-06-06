"use client";
import { CircleAlert } from "lucide-react";
import React from "react";

interface InputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  css?: string;
  value: string;
  readonly?: boolean;
  error?: string | null;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean
}

const InputField: React.FC<InputProps> = ({
  placeholder,
  disabled,
  name,
  readonly,
  label,
  value,
  onChange,
  onBlur,
  error,
  icon,
  css = "",
}) => {

  return (
    <div className="flex flex-col gap-2">
      <label className="label-class" htmlFor={name}>
        {label}
      </label>
      <div className="relative w-full">
      {icon && (
          <div className="absolute left-3 top-[37%] -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          readOnly={readonly}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={`input-class ${css} ${
            error &&
            "border-2 border-text-negative bg-[#CC18180F] text-text-negative"
          }`}
        />
        {name !== "password" && error && (
          <div className="mt-1 flex items-center gap-1 text-title-sm font-bold text-text-negative">
            <CircleAlert size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputField;
