/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Gem, Compass } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-brand-border bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all duration-300" id="gemsight-header">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-brand-dark rounded-full"></div>
          <div>
            <span className="font-serif text-xl tracking-[0.2em] text-brand-dark font-light block leading-none">
              GEMSIGHT
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-stone-400 font-sans block mt-1">
              Luxury Cataloguer
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-6 text-[10px] font-sans tracking-[0.2em] text-stone-500 uppercase">
          <div className="flex items-center space-x-1.5 border-r border-brand-border pr-6">
            <Compass className="h-4 w-4 text-stone-400" />
            <span className="font-medium text-brand-text">Digital Atelier</span>
          </div>
          <span className="text-xs text-stone-400 font-mono lowercase tracking-normal">gemini multimodal engine</span>
        </div>
      </div>
    </header>
  );
}
