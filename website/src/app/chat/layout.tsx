import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat — Shipyard AI",
  description: "Describe your project and our AI will create a PRD for you.",
  openGraph: {
    title: "Chat — Shipyard AI",
    description: "Describe your project and our AI will create a PRD for you.",
    url: "https://shipyard.company/chat",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chat — Shipyard AI",
    description: "Describe your project and our AI will create a PRD for you.",
  },
};

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
