/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { StylePreference } from "../types";
import { Sparkles, Crown, Compass } from "lucide-react";

interface StyleSelectorProps {
  selectedStyle: StylePreference;
  onStyleChange: (style: StylePreference) => void;
}

export default function StyleSelector({ selectedStyle, onStyleChange }: StyleSelectorProps) {
  const stylesList: { value: StylePreference; label: string; icon: React.ReactNode; description: string; tag: string }[] = [
    {
      value: "Minimalist",
      label: "Minimalist",
      icon: <Sparkles className="h-5 w-5 stroke-[1.2]" />,
      description: "Understated elegance, quiet luxury, focus on raw materials and clean geometry.",
      tag: "Delicate & Subtle"
    },
    {
      value: "Opulent",
      label: "Opulent",
      icon: <Crown className="h-5 w-5 stroke-[1.2]" />,
      description: "Royal grandeur, majestic sparkle, maximalist glamour, and magnificent heirloom stories.",
      tag: "Grand & Prestigious"
    },
    {
      value: "Modern",
      label: "Modern",
      icon: <Compass className="h-5 w-5 stroke-[1.2]" />,
      description: "Bold contemporary architecture, avant-garde silhouettes, and unconventional chic styling.",
      tag: "Artistic & Avant-Garde"
    }
  ];

  return (
    <div className="space-y-4" id="style-selector-container">
      <div className="flex flex-col space-y-1">
        <label className="text-[11px] uppercase tracking-widest text-stone-500 font-sans font-semibold">
          02. Style Preference
        </label>
        <span className="text-xs text-stone-400 font-serif italic">
          Dictate the brand tone, narrative prose, and metadata vibe.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stylesList.map((style) => {
          const isSelected = selectedStyle === style.value;
          return (
            <button
              key={style.value}
              type="button"
              id={`style-btn-${style.value.toLowerCase()}`}
              onClick={() => onStyleChange(style.value)}
              className={`text-left p-5 border transition-all duration-300 relative flex flex-col justify-between h-36 cursor-pointer group rounded-sm ${
                isSelected
                  ? "border-brand-dark bg-white text-brand-dark shadow-sm"
                  : "border-brand-border bg-white text-brand-text opacity-70 hover:opacity-100 hover:border-stone-400"
              }`}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[9px] uppercase tracking-widest font-semibold ${isSelected ? "text-brand-dark" : "text-stone-400"}`}>
                  {style.tag}
                </span>
                {isSelected ? (
                  <span className="w-2.5 h-2.5 bg-brand-dark rounded-full shrink-0"></span>
                ) : (
                  <span className="w-2.5 h-2.5 border border-brand-border rounded-full shrink-0"></span>
                )}
              </div>

              <div className="mt-4">
                <span className="block font-serif text-base tracking-wider font-medium text-brand-dark">
                  {style.label.toUpperCase()}
                </span>
                <p className="text-[11px] mt-1.5 leading-relaxed text-stone-500 line-clamp-2">
                  {style.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
