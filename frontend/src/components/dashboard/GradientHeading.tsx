"use client";

import * as React from "react";

interface GradientHeadingProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  highlight?: string;
  highlightAtEnd?: boolean;
  className?: string;
}

export function GradientHeading({ title, subtitle, highlight, highlightAtEnd, className = "" }: GradientHeadingProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
        {!highlightAtEnd && highlight && (
          <span className="gradient-text-vivid">{highlight} </span>
        )}
        <span className="gradient-text">{title}</span>
        {highlightAtEnd && highlight && (
          <span className="gradient-text-vivid"> {highlight}</span>
        )}
      </h1>
      {subtitle && (
        <p className="max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
