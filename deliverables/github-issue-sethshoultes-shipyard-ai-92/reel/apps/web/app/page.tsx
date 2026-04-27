import PasteForm from "../components/PasteForm";

export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          fontWeight: 800,
          marginBottom: 12,
          letterSpacing: "-0.02em",
        }}
      >
        Reel
      </h1>
      <p
        style={{
          fontSize: "1.125rem",
          color: "#a1a1aa",
          marginBottom: 48,
          lineHeight: 1.5,
        }}
      >
        Paste a blog post URL or text and turn it into a polished short-form
        video in a few minutes.
      </p>
      <PasteForm />
    </main>
  );
}
