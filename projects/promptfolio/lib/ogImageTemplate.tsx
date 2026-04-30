export function OGImageTemplate({
  title,
  prompt,
  author,
}: {
  title: string;
  prompt: string;
  author?: string;
}) {
  const truncatedPrompt =
    prompt.length > 280 ? prompt.slice(0, 277) + "..." : prompt;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "1200px",
        height: "630px",
        background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)",
        padding: "64px",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: "#8b5cf6",
            marginRight: "12px",
          }}
        />
        <span
          style={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#a09eb8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Promptfolio
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 800,
            color: "#e8e6f0",
            lineHeight: 1.15,
            marginBottom: "32px",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#a09eb8",
            lineHeight: 1.5,
            maxWidth: "960px",
          }}
        >
          {truncatedPrompt}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
        }}
      >
        {author ? (
          <span
            style={{
              fontSize: "20px",
              color: "#6e6c88",
              fontWeight: 500,
            }}
          >
            by {author}
          </span>
        ) : (
          <span />
        )}
        <span
          style={{
            fontSize: "18px",
            color: "#6e6c88",
            fontWeight: 400,
          }}
        >
          promptfolio.app
        </span>
      </div>
    </div>
  );
}
