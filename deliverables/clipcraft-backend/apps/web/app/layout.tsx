import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ClipCraft — Turn blog posts into short-form video",
  description:
    "Paste any blog post URL and get a polished vertical or horizontal video in minutes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          background: "#0a0a0f",
          color: "#f2f2f7",
        }}
      >
        {children}
      </body>
    </html>
  );
}
