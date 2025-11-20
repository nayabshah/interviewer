import React from "react";

// Reusable layout wrapper for consistent card styling
export default function CardContainer({ children, className = "" }) {
  return (
    <div
      className={`w-full max-w-md bg-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700 ${className}`}
    >
      {children}
    </div>
  );
}
