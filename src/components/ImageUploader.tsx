/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { Upload, X, Camera, Image as ImageIcon, AlertCircle } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (base64Data: string, mimeType: string, file: File | null) => void;
  selectedFile: File | null;
  imagePreviewUrl: string | null;
  onClear: () => void;
}

export default function ImageUploader({
  onImageSelected,
  selectedFile,
  imagePreviewUrl,
  onClear
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPG, PNG, or WEBP only).");
      return;
    }

    // Validate size (limit to 10MB to be extremely safe with Gemini/Express limits)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size exceeds 10MB. Please choose a smaller luxury photograph.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result, file.type, file);
      } else {
        setError("Error reading the image file.");
      }
    };
    reader.onerror = () => {
      setError("An error occurred during image reading.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4" id="image-uploader-section">
      <div className="flex flex-col space-y-1">
        <label className="text-[11px] uppercase tracking-widest text-stone-500 font-sans font-semibold">
          01. Image Input
        </label>
        <span className="text-xs text-stone-400 font-serif italic">
          Upload a high-fidelity JPG, PNG, or WEBP jewelry photograph.
        </span>
      </div>

      {error && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 text-amber-800 rounded-sm text-xs font-sans flex items-start space-x-2 animate-fade-in" id="upload-error">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {!imagePreviewUrl ? (
        <div
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border border-dashed rounded-sm p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[220px] group relative ${
            isDragging
              ? "border-brand-dark bg-brand-bg/80"
              : "border-brand-accent bg-[#FAF9F7] hover:border-brand-dark hover:bg-white"
          }`}
        >
          <input
            type="file"
            id="jewelry-file-input"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".jpg,.jpeg,.png,.webp"
            className="hidden"
          />

          <div className="p-4 rounded-full bg-stone-100 text-brand-dark group-hover:bg-stone-200 transition-colors duration-300 mb-4">
            <Upload className="h-5 w-5 stroke-[1.2] group-hover:scale-105 transition-transform duration-300" />
          </div>

          <p className="font-serif text-sm tracking-wide text-brand-dark font-medium mb-1">
            Drag &amp; Drop Jewelry Image
          </p>
          <p className="text-xs text-stone-400 font-sans mb-3 max-w-sm">
            or click to browse your digital atelier.
          </p>
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono">
            Max File Size: 10MB
          </span>
        </div>
      ) : (
        <div className="relative rounded-sm border border-brand-border bg-white p-4 animate-fade-in" id="image-preview-container">
          <div className="relative aspect-video w-full max-h-[350px] rounded-sm overflow-hidden bg-[#FAF9F7] flex items-center justify-center border border-brand-border group">
            <img
              src={imagePreviewUrl}
              alt="Jewelry Preview"
              id="jewelry-preview-image"
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-102"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-brand-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-brand-dark text-xs font-sans uppercase tracking-widest bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-sm border border-brand-border">
                Active Photograph
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-brand-border pt-3">
            <div className="flex items-center space-x-2">
              <ImageIcon className="h-4 w-4 text-stone-400" />
              <div className="flex flex-col">
                <span className="text-xs font-sans font-medium text-brand-dark line-clamp-1 max-w-[200px] sm:max-w-xs">
                  {selectedFile ? selectedFile.name : "Uploaded Image"}
                </span>
                <span className="text-[10px] font-mono text-stone-400">
                  {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                </span>
              </div>
            </div>

            <button
              type="button"
              id="change-photo-btn"
              onClick={onClear}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-sm text-xs font-sans text-stone-500 hover:text-brand-dark hover:bg-stone-50 border border-brand-border transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Remove Photo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
