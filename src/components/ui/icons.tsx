import React from "react";

export const WavePattern = () => (
  <svg
    className="absolute inset-0 h-full w-full"
    preserveAspectRatio="none"
    viewBox="0 0 1200 800"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M 0 800 L 0 500 Q 300 100 600 500 T 1200 500 L 1200 800 Z"
      className="text-primary/10"
    />
    <path
      fill="currentColor"
      d="M 0 800 L 0 600 Q 300 200 600 600 T 1200 600 L 1200 800 Z"
      className="text-primary/20"
    />
  </svg>
);

export const SparklesCore = () => (
  <svg
    className="absolute inset-0 h-full w-full"
    preserveAspectRatio="none"
    viewBox="0 0 800 800"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="400" cy="400" r="200" stroke="currentColor" strokeWidth="2" className="text-primary/20" />
    <circle cx="400" cy="400" r="300" stroke="currentColor" strokeWidth="2" className="text-primary/10" />
    <circle cx="400" cy="400" r="400" stroke="currentColor" strokeWidth="2" className="text-primary/5" />
  </svg>
); 