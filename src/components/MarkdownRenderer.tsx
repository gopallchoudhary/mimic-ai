import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";

                    return match ? (
                        <div className="relative my-4 rounded-lg overflow-hidden">
                            {language && (
                                <div className="absolute top-0 right-0 px-3 py-1 text-xs text-gray-400 bg-gray-800/50 rounded-bl-lg">
                                    {language}
                                </div>
                            )}
                            <SyntaxHighlighter
                                style={oneDark as any}
                                language={language}
                                PreTag="div"
                                customStyle={{
                                    margin: 0,
                                    padding: "1.5rem",
                                    paddingTop: language ? "2.5rem" : "1.5rem",
                                    fontSize: "0.875rem",
                                    lineHeight: "1.5",
                                    borderRadius: "0.5rem",
                                }}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code
                            className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono"
                            {...props}
                        >
                            {children}
                        </code>
                    );
                },
                p({ children }) {
                    return <p className="mb-3 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                },
                li({ children }) {
                    return <li className="ml-2">{children}</li>;
                },
                h1({ children }) {
                    return <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>;
                },
                h2({ children }) {
                    return <h2 className="text-xl font-bold mb-3 mt-4">{children}</h2>;
                },
                h3({ children }) {
                    return <h3 className="text-lg font-semibold mb-2 mt-3">{children}</h3>;
                },
                blockquote({ children }) {
                    return (
                        <blockquote className="border-l-4 border-muted pl-4 italic my-3">
                            {children}
                        </blockquote>
                    );
                },
                a({ href, children }) {
                    return (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            {children}
                        </a>
                    );
                },
                table({ children }) {
                    return (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-muted rounded-lg">
                                {children}
                            </table>
                        </div>
                    );
                },
                thead({ children }) {
                    return <thead className="bg-muted">{children}</thead>;
                },
                th({ children }) {
                    return (
                        <th className="px-4 py-2 text-left font-semibold border-b border-muted">
                            {children}
                        </th>
                    );
                },
                td({ children }) {
                    return <td className="px-4 py-2 border-b border-muted">{children}</td>;
                },
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
