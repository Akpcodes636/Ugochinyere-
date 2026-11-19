"use client";

import React, { useEffect, useState } from "react";
import { LuLoaderCircle } from "react-icons/lu";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000); // 6 seconds
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center fixed left-0 right-0 top-0 bottom-0 z-50 bg-white">
        <LuLoaderCircle
          size={150}
          className="animate-spin text-[#FA7892]"
        />
      </div>
    );
  }

  return <>{children}</>;
}
