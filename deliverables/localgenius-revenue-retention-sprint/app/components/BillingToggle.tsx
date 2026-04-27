/**
 * Billing Toggle — Monthly vs. Annual Radio Button
 *
 * DECISION (LOCKED): Two Stripe annual plans, one radio button.
 * PRD: Minimal HTML radio group. No new CSS framework. Must match existing brand colors.
 */

"use client";

import React from "react";
import { ANNUAL_PRICES, MONTHLY_PRICES, PLAN_IDS } from "@/lib/stripe";
import { BRAND } from "@/config/brand";

export type BillingInterval = "monthly" | "annual";

interface BillingToggleProps {
  selected: BillingInterval;
  onChange: (interval: BillingInterval) => void;
  tier: "base" | "pro";
}

/**
 * Monthly vs. Annual radio toggle.
 *
 * - Monthly remains default
 * - Annual shows savings badge
 * - No feature grid, no "Pro / Base" labels in copy
 * - Clear price visible in under 3 seconds
 */
export function BillingToggle({ selected, onChange, tier }: BillingToggleProps): JSX.Element {
  const monthly = MONTHLY_PRICES[tier];
  const annual = ANNUAL_PRICES[tier];

  return (
    <div className="billing-toggle" role="radiogroup" aria-label="Billing interval">
      <style jsx>{`
        .billing-toggle {
          display: flex;
          gap: 0.75rem;
          align-items: stretch;
        }
        .billing-option {
          flex: 1;
          position: relative;
          padding: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #ffffff;
        }
        .billing-option:hover {
          border-color: #d1d5db;
        }
        .billing-option.selected {
          border-color: #111827;
          box-shadow: 0 0 0 2px #111827;
        }
        .billing-option input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .billing-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          display: block;
          margin-bottom: 0.25rem;
        }
        .billing-price {
          font-size: 1.125rem;
          font-weight: 700;
          color: #111827;
        }
        .billing-savings {
          display: inline-block;
          margin-top: 0.25rem;
          padding: 0.125rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #065f46;
          background: #d1fae5;
          border-radius: 9999px;
        }
      `}</style>

      {/* Monthly Option */}
      <label
        className={`billing-option ${selected === "monthly" ? "selected" : ""}`}
        onClick={() => onChange("monthly")}
      >
        <input
          type="radio"
          name="billing-interval"
          value="monthly"
          checked={selected === "monthly"}
          onChange={() => onChange("monthly")}
          aria-checked={selected === "monthly"}
        />
        <span className="billing-label">{BRAND.monthlyFrame.headline}</span>
        <span className="billing-price">{monthly.display}</span>
      </label>

      {/* Annual Option */}
      <label
        className={`billing-option ${selected === "annual" ? "selected" : ""}`}
        onClick={() => onChange("annual")}
      >
        <input
          type="radio"
          name="billing-interval"
          value="annual"
          checked={selected === "annual"}
          onChange={() => onChange("annual")}
          aria-checked={selected === "annual"}
        />
        <span className="billing-label">{BRAND.annualFrame.headline}</span>
        <span className="billing-price">{annual.display}</span>
        <span className="billing-savings">
          {BRAND.annualFrame.savingsLine(annual.savings)}
        </span>
      </label>
    </div>
  );
}
