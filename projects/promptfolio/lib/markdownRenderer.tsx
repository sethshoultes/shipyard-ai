import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ ...props }) => (
          <h1
            className="text-3xl font-display font-bold text-spotlight mb-6 mt-8"
            {...props}
          />
        ),
        h2: ({ ...props }) => (
          <h2
            className="text-2xl font-display font-semibold text-spotlight mb-4 mt-6"
            {...props}
          />
        ),
        h3: ({ ...props }) => (
          <h3
            className="text-xl font-display font-semibold text-spotlight mb-3 mt-5"
            {...props}
          />
        ),
        p: ({ ...props }) => (
          <p
            className="text-base leading-relaxed text-spotlight-muted mb-4"
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => {
          const isInline = !className;
          return isInline ? (
            <code
              className="px-1.5 py-0.5 rounded-md bg-midnight-700 text-accent-glow text-sm font-mono"
              {...props}
            >
              {children}
            </code>
          ) : (
            <pre className="overflow-x-auto rounded-xl bg-midnight-800 border border-midnight-700 p-5 my-6">
              <code
                className="text-sm font-mono leading-relaxed text-spotlight"
                {...props}
              >
                {children}
              </code>
            </pre>
          );
        },
        ul: ({ ...props }) => (
          <ul
            className="list-disc pl-6 mb-4 text-spotlight-muted space-y-1"
            {...props}
          />
        ),
        ol: ({ ...props }) => (
          <ol
            className="list-decimal pl-6 mb-4 text-spotlight-muted space-y-1"
            {...props}
          />
        ),
        li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
        blockquote: ({ ...props }) => (
          <blockquote
            className="border-l-4 border-accent pl-5 italic text-spotlight-dim my-6"
            {...props}
          />
        ),
        a: ({ ...props }) => (
          <a
            className="text-accent hover:text-accent-glow underline underline-offset-4 transition-colors"
            {...props}
          />
        ),
        hr: () => <hr className="border-midnight-700 my-8" />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
