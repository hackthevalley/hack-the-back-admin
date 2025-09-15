"use client";
import React from "react";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

interface AgeRangeSliderProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
  step?: number;
}

const AgeRangeSlider: React.FC<AgeRangeSliderProps> = ({
  value,
  onValueChange,
  min = 13,
  max = 40,
  step = 1,
}) => {
  return (
    <div className="w-full px-4">
      <div className="mb-2">
        <label className="text-sm font-medium text-gray-500 dark:text-gray-300">
          Age Range: {value[0]} - {value[1]} years
        </label>
      </div>
      <DualRangeSlider
        label={(val) => `${val}`}
        value={value}
        onValueChange={onValueChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
};

export default AgeRangeSlider;
