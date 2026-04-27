/**
 * Pricing Page — Emotional Fork, Clear Price, Annual Badge
 *
 * DECISIONS (LOCKED):
 * - Pricing page is one emotional fork, not a feature grid.
 * - No "Pro / Base" labels in customer-facing copy.
 * - Clear annual price visible in < 3 seconds.
 * - Annual billing badge ships.
 * - Brand voice: warm, confident, never apologetic.
 */

"use client";

import React, { useState } from "react";
import { BillingToggle, BillingInterval } from "./BillingToggle";
import { BRAND } from "@/config/brand";

interface PricingPageProps {
  onSelectPlan: (tier: "base" | "pro", interval: BillingInterval) => void;
}

/**
 * Pricing Page — emotional fork framing.
 *
 * No feature grid. No comparison table. No gray explanatory text.
 * One choice: breathe annually, or go month by month.
 */
export function PricingPage({ onSelectPlan }: PricingPageProps): JSX.Element {
  const [interval, setInterval] = useState<BillingInterval>("monthly");
  const [hoveredTier, setHoveredTier] = useState<"base" | "pro" | null>(null);

  return (
    <div className="pricing-page">
      <style jsx>{`
        .pricing-page {
          max-width: 640px;
          margin: 0 auto;
          padding: 3rem 1rem;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .pricing-headline {
          font-size: 1.875rem;
          font-weight: 700;
          color: #111827;
          text-align: center;
          margin-bottom: 0.5rem;
        }
        .pricing-subheadline {
          font-size: 1.125rem;
          color: #6b7280;
          text-align: center;
          margin-bottom: 2rem;
        }
        .pricing-toggle-wrapper {
          max-width: 400px;
          margin: 0 auto 2rem;
        }
        .tier-cards {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .tier-cards {
            grid-template-columns: 1fr 1fr;
          }
        }
        .tier-card {
          position: relative;
          padding: 1.5rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          cursor: pointer;
          transition: border-color 0.2s, transform 0.2s;
          background: #ffffff;
        }
        .tier-card:hover {
          border-color: #d1d5db;
          transform: translateY(-2px);
        }
        .tier-card.selected {
          border-color: #111827;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .tier-badge {
          position: absolute;
          top: -0.75rem;
          right: 1rem;
          padding: 0.25rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #ffffff;
          background: #111827;
          border-radius: 9999px;
        }
        .tier-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.25rem;
        }
        .tier-price {
          font-size: 2.25rem;
          font-weight: 800;
          color: #111827;
          line-height: 1;
        }
        .tier-price-note {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.25rem;
          margin-bottom: 1rem;
        }
        .tier-cta {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          font-weight: 600;
          color: #ffffff;
          background: #111827;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .tier-cta:hover {
          background: #374151;
        }
        .tier-cta.secondary {
          color: #111827;
          background: #ffffff;
          border: 2px solid #111827;
        }
        .tier-cta.secondary:hover {
          background: #f9fafb;
        }
        .annual-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.75rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          border-radius: 0.375rem;
        }
        .annual-badge svg {
          width: 1rem;
          height: 1rem;
        }
        .footer-legal {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.75rem;
          color: #9ca3af;
        }
      `}</style>

      <h1 className="pricing-headline">
        {interval === "annual" ? BRAND.annualFrame.headline : BRAND.monthlyFrame.headline}
      </h1>
      <p className="pricing-subheadline">
        {interval === "annual"
          ? BRAND.annualFrame.subheadline
          : BRAND.monthlyFrame.subheadline}
      </p>

      <div className="pricing-toggle-wrapper">
        <BillingToggle
          selected={interval}
          onChange={setInterval}
          tier="base"
        />
      </div>

      <div className="tier-cards">
        {/* Base Tier */}
        <div
          className={`tier-card ${hoveredTier === "base" ? "selected" : ""}`}
          onMouseEnter={() => setHoveredTier("base")}
          onMouseLeave={() => setHoveredTier(null)}
          role="button"
          tabIndex={0}
          onClick={() => onSelectPlan("base", interval)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectPlan("base", interval);
            }
          }}
        >
          {interval === "annual" && (
            <span className="tier-badge">{BRAND.annualFrame.badge}</span>
          )}
          <div className="tier-name">For one location</div>
          <div className="tier-price">
            {interval === "annual" ? "$278" : "$29"}
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280" }}>
              /{interval === "annual" ? "year" : "month"}
            </span>
          </div>
          <div className="tier-price-note">
            {interval === "annual"
              ? "Save $70 — 2 months free"
              : "Cancel anytime"}
          </div>
          <button className="tier-cta secondary">
            {interval === "annual" ? BRAND.annualFrame.cta : BRAND.monthlyFrame.cta}
          </button>
          {interval === "annual" && (
            <div className="annual-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Annual commitment — best value
            </div>
          )}
        </div>

        {/* Pro Tier */}
        <div
          className={`tier-card ${hoveredTier === "pro" ? "selected" : ""}`}
          onMouseEnter={() => setHoveredTier("pro")}
          onMouseLeave={() => setHoveredTier(null)}
          role="button"
          tabIndex={0}
          onClick={() => onSelectPlan("pro", interval)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelectPlan("pro", interval);
            }
          }}
        >
          {interval === "annual" && (
            <span className="tier-badge">{BRAND.annualFrame.badge}</span>
          )}
          <div className="tier-name">For 2–5 locations</div>
          <div className="tier-price">
            {interval === "annual" ? "$798" : "$83"}
            <span style={{ fontSize: "1rem", fontWeight: 500, color: "#6b7280" }}>
              /{interval === "annual" ? "year" : "month"}
            </span>
          </div>
          <div className="tier-price-note">
            {interval === "annual"
              ? "Save $198 — 2 months free"
              : "Cancel anytime"}
          </div>
          <button className="tier-cta">
            {interval === "annual" ? BRAND.annualFrame.cta : BRAND.monthlyFrame.cta}
          </button>
          {interval === "annual" && (
            <div className="annual-badge">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Annual commitment — best value
            </div>
          )}
        </div>
      </div>

      <div className="footer-legal">
        {BRAND.legalName} · Cancel anytime, prorated refund · Stripe Customer Portal for changes
      </div>
    </div>
  );
}
