"use client";

import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/chat", label: "Chat" },
  { href: "/contact", label: "Start a Project" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-muted transition hover:text-foreground"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4l12 12M16 4L4 16" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        )}
      </button>
      {open && (
        <div
          id="mobile-nav"
          className="absolute left-0 right-0 top-16 z-50 border-b border-border bg-background p-6"
        >
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.href === "/contact"
                    ? "rounded-full bg-accent px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-accent-dim"
                    : "text-sm font-medium text-muted transition hover:text-foreground"
                }
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
