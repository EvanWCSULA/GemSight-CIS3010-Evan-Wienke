/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JewelryProfile } from "../types";
import { 
  Copy, Check, Download, RotateCcw, Gem, HelpCircle, 
  Tag, Instagram, Sparkles, BookOpen, Layers, Accessibility 
} from "lucide-react";

interface ProfileResultProps {
  profile: JewelryProfile;
  onReset: () => void;
}

export default function ProfileResult({ profile, onReset }: ProfileResultProps) {
  // Individual copy confirmation states
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  const triggerCopyNotification = (key: string) => {
    setCopiedStates((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      triggerCopyNotification(key);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const copySeoTags = () => {
    const tagsString = profile.seo_tags?.join(", ") || "";
    copyToClipboard(tagsString, "seoTags");
  };

  const copyFullJson = () => {
    const jsonString = JSON.stringify(profile, null, 2);
    copyToClipboard(jsonString, "json");
  };

  const downloadJsonFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    
    // Clean, search-friendly filename
    const cleanTitle = profile.listing_content?.seo_title
      ? profile.listing_content.seo_title.toLowerCase().replace(/[^a-z0-9]+/g, "-")
      : "jewelry-profile";
    downloadAnchor.setAttribute("download", `${cleanTitle}-profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Estimate words in the luxury narrative
  const narrativeWordCount = profile.listing_content?.luxury_narrative
    ? profile.listing_content.luxury_narrative.trim().split(/\s+/).length
    : 0;

  // Extract hashtags dynamically from the Instagram caption for beautiful visual rendering
  const hashtags = profile.social_media?.instagram_caption
    ? (profile.social_media.instagram_caption.match(/#[^\s#]+/g) || [])
    : [];

  return (
    <div className="space-y-8 animate-fade-in text-brand-text" id="profile-result-wrapper">
      {/* Title block */}
      <div className="border-b border-brand-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4" id="result-header">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-dark animate-pulse"></span>
            <span className="text-[9px] uppercase font-mono tracking-widest text-brand-dark/60 font-semibold">
              Analysis Completed Successfully
            </span>
          </div>
          <h2 className="text-xl font-serif tracking-wider font-medium text-brand-dark mt-1">
            Product Profile &amp; Copywriting Suite
          </h2>
        </div>

        <button
          type="button"
          id="btn-reset-top"
          onClick={onReset}
          className="flex items-center justify-center space-x-2 px-4 py-2 border border-brand-border bg-white hover:bg-brand-dark hover:text-white text-stone-700 rounded-sm text-[10px] uppercase tracking-widest font-bold transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Catalog New Product</span>
        </button>
      </div>

      {/* Main Grid: Clean Minimalism configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="result-bento-grid">
        
        {/* LEFT COLUMN: Visual Properties Meter & Gemological Matrix */}
        <div className="lg:col-span-1 space-y-6" id="gemological-properties-column">
          
          {/* Confidence Score Panel */}
          <div className="p-6 bg-[#FAF9F7] rounded-sm border border-brand-border" id="confidence-card">
            <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-2">
              Confidence
            </span>
            <div className="flex items-baseline justify-between mb-3">
              <span className="text-2xl font-mono font-medium text-brand-dark">
                {profile.product_metadata?.visual_confidence}%
              </span>
              <span className="text-[10px] text-stone-400 font-mono">
                computer vision certainty
              </span>
            </div>
            
            {/* Visual indicator bar */}
            <div className="w-full h-1 bg-stone-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-brand-dark transition-all duration-1000"
                style={{ width: `${profile.product_metadata?.visual_confidence}%` }}
              ></div>
            </div>
          </div>

          {/* Core Gemology Attributes Panel */}
          <div className="bg-white rounded-sm border border-brand-border p-6 space-y-5 shadow-sm" id="specifications-panel">
            <h3 className="font-serif text-xs uppercase tracking-widest text-brand-dark/40 font-bold flex items-center space-x-2 border-b border-brand-border pb-3">
              <Layers className="h-4 w-4 text-brand-dark/40 stroke-[1.5]" />
              <span>Attributes Matrix</span>
            </h3>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1">Jewelry Category</span>
                <span className="text-xs font-medium text-brand-dark">{profile.product_metadata?.jewelry_category || "N/A"}</span>
              </div>

              {/* Detected Metals */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1">Detected Materials</span>
                <span className="text-xs font-medium text-brand-dark">
                  {profile.product_metadata?.detected_materials?.join(", ") || "None Detected"}
                </span>
              </div>

              {/* Primary Gemstone */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1 flex items-center space-x-1">
                  <Gem className="h-3 w-3 text-brand-dark/40 inline" />
                  <span>Primary Gemstone</span>
                </span>
                <span className="text-xs font-medium text-brand-dark">{profile.product_metadata?.primary_stone || "None"}</span>
              </div>

              {/* Secondary Gemstones */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1">Secondary Gemstones</span>
                <span className="text-xs font-medium text-brand-dark">
                  {profile.product_metadata?.secondary_stones?.join(", ") || "None"}
                </span>
              </div>

              {/* Stone Cut */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1">Stone Cut</span>
                <span className="text-xs font-medium text-brand-dark">{profile.product_metadata?.stone_cut || "None"}</span>
              </div>

              {/* Setting Style */}
              <div>
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-1">Setting Style</span>
                <span className="text-xs font-medium text-brand-dark">{profile.product_metadata?.setting_style || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE & RIGHT COLUMNS: The Copywriting & Brand Suite */}
        <div className="lg:col-span-2 space-y-8" id="copywriting-brand-suite">
          
          {/* OPTIONAL ESTIMATED APPRAISAL RANGE */}
          {profile.visual_appraisal && (
            <div className="bg-white rounded-sm border border-amber-200 shadow-sm overflow-hidden animate-fade-in" id="appraisal-warning-box">
              {/* Top Banner Accent */}
              <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <h3 className="font-serif text-xs font-semibold uppercase tracking-wider text-amber-900">
                    Preliminary Visual Appraisal Estimate
                  </h3>
                </div>
                <div className="text-[9px] uppercase tracking-widest font-mono text-amber-700 bg-amber-100/50 px-2 py-0.5 rounded-sm">
                  AI-Generated
                </div>
              </div>

              {/* Main Appraisal Body */}
              <div className="p-6 space-y-6">
                {profile.visual_appraisal.appraisal_status === "estimate_available" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="appraisal-estimate-details">
                    
                    {/* Range and confidence */}
                    <div className="space-y-4">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block mb-1">
                          Estimated Retail / Market Range
                        </span>
                        <div className="text-3xl font-mono font-semibold text-brand-dark tracking-tight">
                          {profile.visual_appraisal.low_estimate !== null && profile.visual_appraisal.high_estimate !== null ? (
                            <span>
                              ${profile.visual_appraisal.low_estimate.toLocaleString()} – ${profile.visual_appraisal.high_estimate.toLocaleString()}
                            </span>
                          ) : (
                            "N/A"
                          )}
                          <span className="text-sm font-sans font-normal text-stone-400 ml-1.5 uppercase">
                            {profile.visual_appraisal.currency}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block mb-0.5">
                            Visual Clarity Score
                          </span>
                          <span className="text-xs font-mono font-medium text-stone-700">
                            {profile.visual_appraisal.visual_clarity_score}/100
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block mb-0.5">
                            Certainty
                          </span>
                          <span className="text-xs font-mono font-medium text-stone-700 capitalize">
                            {profile.visual_appraisal.confidence}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Basis and assumptions */}
                    <div className="space-y-4 bg-[#FAF9F7] p-4 rounded-sm border border-stone-100">
                      <div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-stone-500 block mb-1.5">
                          Visual Basis of Estimate
                        </span>
                        <ul className="space-y-1">
                          {profile.visual_appraisal.basis?.map((item, i) => (
                            <li key={i} className="text-[11px] text-stone-600 font-serif italic leading-relaxed flex items-start space-x-1.5">
                              <span className="text-stone-400 mt-0.5 shrink-0">·</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Insufficient visual evidence fallback view */
                  <div className="space-y-4" id="appraisal-insufficient-evidence">
                    <div className="flex items-start space-x-3.5 bg-amber-50/40 p-4 border border-amber-100 rounded-sm">
                      <HelpCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-serif font-semibold text-xs uppercase tracking-wider text-amber-900">
                          Insufficient Visual Evidence for Valuation Range
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          The uploaded photograph does not present enough clear details to formulate a reliable appraisal range. An in-person forensic gemologist appraisal is highly recommended to authenticate this luxury specimen.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Grid for assumptions, missing info and factors */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-dashed border-stone-200 text-xs">
                  {/* Assumptions */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block">
                      Underlying Assumptions
                    </span>
                    <ul className="space-y-1">
                      {profile.visual_appraisal.assumptions?.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 leading-relaxed flex items-start space-x-1.5">
                          <span className="text-stone-300 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing information */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block">
                      Missing Forensic Data
                    </span>
                    <ul className="space-y-1">
                      {profile.visual_appraisal.missing_information?.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 leading-relaxed flex items-start space-x-1.5">
                          <span className="text-amber-300 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Value change factors */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest font-bold text-stone-400 block">
                      Market Value Volatilities
                    </span>
                    <ul className="space-y-1">
                      {profile.visual_appraisal.value_change_factors?.map((item, i) => (
                        <li key={i} className="text-[11px] text-stone-600 leading-relaxed flex items-start space-x-1.5">
                          <span className="text-stone-300 shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Mandatory Disclaimer Box */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-sm">
                  <p className="text-[10px] leading-relaxed text-stone-500 font-serif italic text-center uppercase tracking-wide">
                    {profile.visual_appraisal.disclaimer || "This visual estimate is for preliminary content planning only and is not a certified appraisal, insurance value, resale guarantee, or authentication."}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* SEO TITLE & NARRATIVE BLOCK */}
          <div className="bg-white rounded-sm border border-brand-border p-6 shadow-sm space-y-6" id="editorial-narrative-card">
            
            {/* Title Section */}
            <div className="space-y-2 border-b border-brand-border pb-5" id="seo-title-section">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-stone-400" />
                  <span>SEO Product Title</span>
                </span>
                <button
                  type="button"
                  id="btn-copy-title"
                  onClick={() => copyToClipboard(profile.listing_content?.seo_title || "", "title")}
                  className="px-2 py-1 border border-brand-border rounded-sm text-[9px] uppercase tracking-widest font-bold hover:bg-brand-dark hover:text-white transition-all cursor-pointer bg-white text-stone-700"
                  title="Copy SEO Product Title"
                >
                  {copiedStates["title"] ? "Copied" : "Copy Title"}
                </button>
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif italic text-brand-dark tracking-tight leading-relaxed">
                {profile.listing_content?.seo_title}
              </h1>
            </div>

            {/* Narrative Story Section */}
            <div className="space-y-3" id="luxury-narrative-section">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center space-x-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-stone-400" />
                  <span>Brand Narrative Story</span>
                </span>
                <button
                  type="button"
                  id="btn-copy-narrative"
                  onClick={() => copyToClipboard(profile.listing_content?.luxury_narrative || "", "narrative")}
                  className="px-2 py-1 border border-brand-border rounded-sm text-[9px] uppercase tracking-widest font-bold hover:bg-brand-dark hover:text-white transition-all cursor-pointer bg-white text-stone-700"
                  title="Copy Brand Narrative"
                >
                  {copiedStates["narrative"] ? "Copied" : "Copy Story"}
                </button>
              </div>
              
              <div className="p-5 bg-[#FAF9F7] rounded-sm border border-brand-border relative">
                <p className="font-serif text-brand-text text-sm leading-relaxed sm:leading-loose text-justify whitespace-pre-line font-light italic">
                  &ldquo;{profile.listing_content?.luxury_narrative}&rdquo;
                </p>
                
                {/* Micro Metadata tag for Story */}
                <div className="mt-4 flex justify-end">
                  <span className="text-[9px] font-mono uppercase bg-white border border-brand-border text-stone-500 px-2 py-0.5 rounded-sm">
                    ~{narrativeWordCount} words · Luxury Copy
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Bullet Specs */}
            <div className="space-y-3 pt-4 border-t border-brand-border" id="technical-bullets-section">
              <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 block mb-2">
                Technical Specifications Bulletins
              </span>
              <ul className="space-y-2">
                {profile.listing_content?.technical_bullets?.map((bullet, i) => (
                  <li key={i} className="text-xs text-brand-text font-sans flex items-start space-x-2">
                    <span className="h-1 w-1 bg-brand-dark mt-2 shrink-0 rounded-full"></span>
                    <span className="leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Accessibility Alt Text */}
            <div className="space-y-3 pt-4 border-t border-brand-border" id="accessibility-alt-text-section">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center space-x-1.5">
                  <Accessibility className="h-3.5 w-3.5 text-stone-400" />
                  <span>Accessibility Alt Text</span>
                </span>
                <button
                  type="button"
                  id="btn-copy-alt-text"
                  onClick={() => copyToClipboard(profile.social_media?.alt_text || "", "altText")}
                  className="px-2 py-0.5 border border-brand-border rounded-sm text-[9px] uppercase tracking-widest font-bold hover:bg-brand-dark hover:text-white transition-all cursor-pointer bg-white text-stone-700"
                >
                  {copiedStates["altText"] ? "Copied" : "Copy Alt Text"}
                </button>
              </div>
              <p className="text-xs text-stone-500 font-sans leading-relaxed bg-[#FAF9F7] p-3 rounded-sm border border-brand-border">
                {profile.social_media?.alt_text}
              </p>
            </div>
          </div>

          {/* SOCIAL MEDIA & METADATA CARD */}
          <div className="bg-white rounded-sm border border-brand-border p-6 shadow-sm space-y-6" id="social-metadata-card">
            
            {/* Instagram Section */}
            <div className="space-y-3" id="instagram-block">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center space-x-1.5">
                  <Instagram className="h-3.5 w-3.5 text-stone-400" />
                  <span>Instagram Caption</span>
                </span>
                <button
                  type="button"
                  id="btn-copy-instagram"
                  onClick={() => copyToClipboard(profile.social_media?.instagram_caption || "", "instagram")}
                  className="px-2 py-1 border border-brand-border rounded-sm text-[9px] uppercase tracking-widest font-bold hover:bg-brand-dark hover:text-white transition-all cursor-pointer bg-white text-stone-700"
                >
                  {copiedStates["instagram"] ? "Copied" : "Copy Caption"}
                </button>
              </div>

              <div className="p-4 bg-brand-dark text-stone-100 rounded-sm font-sans text-xs space-y-3">
                <p className="leading-relaxed whitespace-pre-wrap italic font-serif opacity-95">{profile.social_media?.instagram_caption}</p>
                
                {/* Render individual hashtags nicely */}
                {hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-800 opacity-80">
                    {hashtags.map((tag, i) => (
                      <span 
                        key={i} 
                        className="text-stone-300 hover:text-white font-mono cursor-pointer transition-colors"
                        onClick={() => copyToClipboard(tag, `tag-${i}`)}
                      >
                        {copiedStates[`tag-${i}`] ? "copied!" : tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SEO TAGS PILLS */}
            <div className="space-y-3 pt-4 border-t border-brand-border" id="seo-tags-block">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-widest font-bold opacity-40 flex items-center space-x-1.5">
                  <Tag className="h-3.5 w-3.5 text-stone-400" />
                  <span>SEO Keywords &amp; Search Tags (Exactly 10)</span>
                </span>
                <button
                  type="button"
                  id="btn-copy-seo-tags"
                  onClick={copySeoTags}
                  className="px-2 py-1 border border-brand-border rounded-sm text-[9px] uppercase tracking-widest font-bold hover:bg-brand-dark hover:text-white transition-all cursor-pointer bg-white text-stone-700"
                >
                  {copiedStates["seoTags"] ? "Copied" : "Copy All Tags"}
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5" id="seo-tags-cloud">
                {profile.seo_tags?.map((tag, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-1 bg-white border border-brand-border text-[9px] text-[#888] font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ATELIER ACTIONS: Download & Technical JSON Drawer */}
          <div className="bg-[#1A1A1A] text-stone-100 rounded-sm p-6 space-y-5 shadow-sm" id="atelier-developers-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-sm tracking-wider font-medium text-white uppercase">
                  Atelier JSON Export Utility
                </h4>
                <p className="text-[11px] text-stone-400 font-sans mt-1">
                  Export catalog metadata for luxury CMS syndication.
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  id="btn-copy-json"
                  onClick={copyFullJson}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-sm text-[10px] font-mono transition-colors cursor-pointer"
                >
                  {copiedStates["json"] ? (
                    <span className="text-emerald-400">Copied</span>
                  ) : (
                    <span>Copy JSON</span>
                  )}
                </button>

                <button
                  type="button"
                  id="btn-download-json"
                  onClick={downloadJsonFile}
                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-900 rounded-sm text-[10px] font-mono font-medium transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .json</span>
                </button>
              </div>
            </div>

            {/* Structured JSON Monospace Block */}
            <div className="relative rounded-sm overflow-hidden bg-black/40 border border-stone-800 p-4 max-h-48 overflow-y-auto" id="json-pre-code">
              <pre className="text-[10px] font-mono text-stone-300 leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(profile, null, 2)}
              </pre>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER ACTIONS: Large reset button & Disclaimer */}
      <div className="pt-8 border-t border-brand-border text-center space-y-6" id="result-footer-disclaimer-panel">
        <button
          type="button"
          id="btn-reset-bottom"
          onClick={onReset}
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand-dark hover:bg-black text-white text-[10px] uppercase tracking-[0.3em] font-bold rounded-sm transition-all duration-200 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Catalog Another Piece</span>
        </button>

        {/* Required Professional Disclaimer */}
        <div className="max-w-3xl mx-auto p-4 bg-white rounded-sm border border-brand-border" id="official-disclaimer-box">
          <p className="text-[9px] leading-relaxed text-stone-400 font-sans italic text-center uppercase tracking-wide">
            Gemsight provides visual estimates for product-drafting purposes. Gemstone identity, metal purity, treatments, origin, authenticity, weight, and monetary value require verification by a qualified professional.
          </p>
        </div>
      </div>
    </div>
  );
}
