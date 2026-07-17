/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ImageUploader from "./components/ImageUploader";
import StyleSelector from "./components/StyleSelector";
import ProfileResult from "./components/ProfileResult";
import { JewelryProfile, StylePreference } from "./types";
import { Sparkles, Gem, ArrowRight, Loader2, Info, AlertTriangle } from "lucide-react";

export default function App() {
  // Application State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);
  const [stylePreference, setStylePreference] = useState<StylePreference>("Minimalist");
  const [includeAppraisal, setIncludeAppraisal] = useState(false);
  const [acknowledgeAppraisal, setAcknowledgeAppraisal] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<JewelryProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Luxury loading message rotation
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const loadingMessages = [
    "Initializing Gemini Flash multimodal analysis...",
    "Scanning facets, structures, and precious metal hues...",
    "Estimating gem cuts, settings, and category dimensions...",
    "Synthesizing 150-word storytelling narrative matching your aesthetic...",
    "Drafting search-engine optimization tags and alt text...",
    "Structuring caption copy and Instagram metadata...",
    "Polishing structured JSON catalog record..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 3500);
    } else {
      setLoadingMessageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleImageSelected = (base64Data: string, mimeType: string, file: File | null) => {
    setImageBase64(base64Data);
    setImageMimeType(mimeType);
    setSelectedFile(file);
    setError(null);
    
    // Create local object URL for instant, high-quality rendering
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    } else {
      setImagePreviewUrl(base64Data);
    }
  };

  const handleClearImage = () => {
    setImageBase64(null);
    setImageMimeType(null);
    setSelectedFile(null);
    if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
    setImagePreviewUrl(null);
    setError(null);
  };

  const handleReset = () => {
    handleClearImage();
    setProfile(null);
    setError(null);
    setIsGenerating(false);
    setIncludeAppraisal(false);
    setAcknowledgeAppraisal(false);
  };

  const generateProductProfile = async () => {
    if (!imageBase64 || !imageMimeType) {
      setError("Please upload an image before requesting a profile.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProfile(null);

    try {
      const response = await fetch("/api/generate-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          mimeType: imageMimeType,
          stylePreference: stylePreference,
          includeAppraisal: includeAppraisal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze jewelry piece. Check backend log.");
      }

      setProfile(data);
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "An unexpected error occurred while communicating with Gemsight servers.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col text-brand-text selection:bg-brand-dark selection:text-white font-sans" id="gemsight-app-root">
      {/* Header component */}
      <Header />

      {/* Main Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-6 sm:px-10 py-10 flex flex-col justify-between">
        
        {/* Error Alert Banner */}
        {error && (
          <div className="mb-8 p-5 bg-amber-50/70 border border-amber-200 text-stone-900 rounded-sm flex items-start space-x-3.5 animate-fade-in" id="global-error-banner">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-700 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-serif font-medium text-sm text-brand-dark">Analysis Interrupted</h4>
              <p className="text-xs text-stone-600 leading-relaxed">{error}</p>
              <div className="pt-2 text-[10px] font-mono uppercase tracking-wider text-stone-400">
                Tip: Add your <strong className="text-brand-dark font-semibold">GEMINI_API_KEY</strong> inside the secrets panel.
              </div>
            </div>
          </div>
        )}

        {/* LOADING SCREEN */}
        {isGenerating ? (
          <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center max-w-lg mx-auto animate-fade-in" id="loading-state-wrapper">
            <div className="relative mb-8">
              <div className="p-6 bg-white border border-brand-border rounded-sm shadow-sm flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-brand-dark animate-spin stroke-[1.2]" />
              </div>
            </div>
            
            <h3 className="font-serif text-lg tracking-wider font-medium text-brand-dark mb-2">
              Cataloging Artifact
            </h3>
            
            {/* Carousel message */}
            <div className="min-h-[40px] flex items-center justify-center">
              <p className="text-xs font-serif italic text-stone-400 animate-fade-in" key={loadingMessageIndex}>
                &ldquo;{loadingMessages[loadingMessageIndex]}&rdquo;
              </p>
            </div>
            
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono mt-8 block">
              Powered by Gemini 3.1 Flash-Lite Engine
            </span>
          </div>
        ) : profile ? (
          /* RESULT SCREEN */
          <ProfileResult profile={profile} onReset={handleReset} />
        ) : (
          /* WORKSPACE (UPLOAD + PREPARE) */
          <div className="space-y-10" id="gemsight-workspace">
            {/* Intro Hero banner */}
            <div className="bg-white rounded-sm border border-brand-border p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden" id="workspace-hero">
              <div className="space-y-2 relative z-10 max-w-2xl">
                <span className="text-[9px] uppercase tracking-widest font-mono text-stone-400 font-semibold block">
                  Interactive Jewelry Cataloguer &amp; Copywriter
                </span>
                <h2 className="text-2xl font-serif italic font-light text-brand-dark tracking-wide">
                  Automate Your Luxury Cataloging Process
                </h2>
                <p className="text-xs md:text-sm text-stone-500 leading-relaxed font-serif italic">
                  Gemsight uses state-of-the-art vision models to extract metadata from jewelry photograph and compose premium, search-engine-optimized marketing copy, product titles, descriptions, and tag arrays in your target aesthetic.
                </p>
              </div>

              <div className="p-4 bg-[#FAF9F7] rounded-sm border border-brand-border flex items-start space-x-3 shrink-0 max-w-xs" id="quick-instruction-bubble">
                <Info className="h-4 w-4 text-stone-400 shrink-0 mt-0.5" />
                <span className="text-[11px] text-stone-500 leading-relaxed font-sans">
                  Upload an image of a ring, necklace, watch, or earring. Select your style preference, and watch the system compile an elite catalog-ready profile.
                </span>
              </div>
            </div>

            {/* Preparation Workspace layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="workspace-grid">
              
              {/* Left Column: Image Uploader */}
              <div className="bg-white rounded-sm border border-brand-border p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6" id="workspace-left-uploader">
                <ImageUploader
                  onImageSelected={handleImageSelected}
                  selectedFile={selectedFile}
                  imagePreviewUrl={imagePreviewUrl}
                  onClear={handleClearImage}
                />
              </div>

              {/* Right Column: Style preference & Appraisal Options */}
              <div className="bg-white rounded-sm border border-brand-border p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6" id="workspace-right-settings">
                <StyleSelector
                  selectedStyle={stylePreference}
                  onStyleChange={setStylePreference}
                />
                
                {/* Visual Appraisal Checkboxes */}
                <div className="p-5 border border-brand-border rounded-sm bg-[#FAF9F7]/60 space-y-4" id="appraisal-option-card">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="include-appraisal-checkbox"
                      checked={includeAppraisal}
                      onChange={(e) => {
                        setIncludeAppraisal(e.target.checked);
                        if (!e.target.checked) {
                          setAcknowledgeAppraisal(false);
                        }
                      }}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-dark focus:ring-brand-dark cursor-pointer accent-stone-800"
                    />
                    <div className="space-y-1">
                      <label htmlFor="include-appraisal-checkbox" className="text-xs font-serif font-medium text-brand-dark cursor-pointer uppercase tracking-wider">
                        Include preliminary visual appraisal estimate
                      </label>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Enables Gemini to generate a broad visual-only valuation range based on recognizable physical attributes.
                      </p>
                    </div>
                  </div>

                  {includeAppraisal && (
                    <div className="pl-7 pt-3 border-t border-dashed border-stone-200 space-y-3 animate-fade-in" id="appraisal-acknowledgment-container">
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          id="acknowledge-appraisal-checkbox"
                          checked={acknowledgeAppraisal}
                          onChange={(e) => setAcknowledgeAppraisal(e.target.checked)}
                          className="mt-0.5 h-3.5 w-3.5 rounded border-gray-300 text-brand-dark focus:ring-brand-dark cursor-pointer accent-stone-800"
                        />
                        <label htmlFor="acknowledge-appraisal-checkbox" className="text-[11px] text-stone-600 leading-relaxed cursor-pointer font-serif italic">
                          I understand that this is an AI-generated visual estimate and not a professional appraisal.
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Visual guidelines hint card */}
                <div className="p-4 bg-[#FAF9F7] rounded-sm border border-brand-border space-y-2" id="guideline-hint">
                  <span className="text-[9px] uppercase font-mono tracking-widest text-stone-400 font-semibold block">
                    Cataloging Specifications &amp; Mime types
                  </span>
                  <p className="text-xs text-stone-500 leading-relaxed font-sans">
                    All image analysis occurs client-to-server. Gemsight formats the prompt with a strict JSON structure and enforces temperature constraints (0.1) on the model parameters to avoid hallucinated alloy grades or mineral classes.
                  </p>
                </div>
              </div>

            </div>

            {/* ACTION FOOTER */}
            <div className="flex flex-col items-center justify-center pt-4" id="action-footer">
              <button
                type="button"
                id="btn-generate-profile"
                disabled={!imageBase64 || (includeAppraisal && !acknowledgeAppraisal)}
                onClick={generateProductProfile}
                className={`group flex items-center justify-center space-x-3 px-8 py-4 rounded-sm text-xs font-sans tracking-[0.25em] uppercase font-bold transition-all duration-300 ${
                  imageBase64 && (!includeAppraisal || acknowledgeAppraisal)
                    ? "bg-brand-dark hover:bg-black text-white cursor-pointer"
                    : "bg-[#E8E6E1] text-stone-400 cursor-not-allowed"
                }`}
              >
                <Gem className={`h-4 w-4 ${imageBase64 && (!includeAppraisal || acknowledgeAppraisal) ? "animate-pulse" : ""}`} />
                <span>Generate Product Profile</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>
              
              {!imageBase64 ? (
                <span className="text-[9px] uppercase tracking-widest text-stone-400 font-mono mt-3">
                  Upload jewelry photo to initiate process
                </span>
              ) : includeAppraisal && !acknowledgeAppraisal ? (
                <span className="text-[9px] uppercase tracking-widest text-amber-600 font-mono mt-3">
                  Acknowledge disclaimer to generate appraisal
                </span>
              ) : null}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-brand-border bg-white py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-widest font-sans text-stone-400 gap-4">
          <span>&copy; {new Date().getFullYear()} Gemsight Atelier Systems. All rights reserved.</span>
          <div className="flex items-center space-x-4">
            <span className="hover:text-brand-dark transition-colors cursor-pointer">Security Protocol</span>
            <span>·</span>
            <span className="hover:text-brand-dark transition-colors cursor-pointer">Cataloger Manual</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
