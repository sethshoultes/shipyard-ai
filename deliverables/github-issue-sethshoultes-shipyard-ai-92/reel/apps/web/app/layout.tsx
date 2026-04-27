import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reel — Turn blog posts into short-form video",
  description:
    "Paste any blog post text or URL and get a polished 9:16 video in a few minutes.",
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
