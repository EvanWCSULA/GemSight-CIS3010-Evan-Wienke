/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VisualAppraisal {
  appraisal_status: "estimate_available" | "insufficient_visual_evidence";
  currency: string;
  low_estimate: number | null;
  high_estimate: number | null;
  confidence: "low" | "medium";
  visual_clarity_score: number;
  basis: string[];
  assumptions: string[];
  missing_information: string[];
  value_change_factors: string[];
  disclaimer: string;
}

export interface JewelryProfile {
  product_metadata: {
    detected_materials: string[];
    primary_stone: string;
    secondary_stones: string[];
    stone_cut: string;
    setting_style: string;
    jewelry_category: string;
    visual_confidence: number;
  };
  listing_content: {
    seo_title: string;
    luxury_narrative: string;
    technical_bullets: string[];
  };
  social_media: {
    instagram_caption: string;
    alt_text: string;
  };
  seo_tags: string[];
  visual_appraisal?: VisualAppraisal;
}

export type StylePreference = "Minimalist" | "Opulent" | "Modern";
