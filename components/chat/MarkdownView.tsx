'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import CodeBlock from './CodeBlock';
import styles from './chat.module.css';

interface MarkdownViewProps {
  content: string;
  /** When true, citation tokens like [1]/[citation:1] become clickable
   *  anchors that scroll to the corresponding source row. */
  withCitations?: boolean;
  onCitationClick?: (index: number) => void;
}

/** Sanitize schema = defaults + a small allow-list for code/lang classes
 *  and the data-citation attribute we use for footnote jumps. */
const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className', /^language-/]],
    span: [...(defaultSchema.attributes?.span ?? []), 'className', ['data-citation']],
    a: [...(defaultSchema.attributes?.a ?? []), 'target', 'rel', ['data-citation']],
  },
};

const CITATION_PATTERN = /\[(?:citation:)?(\d{1,3})\]/g;

/** Replace [N] / [citation:N] with HTML <span data-citation="N"> so
 *  rehype-raw can lift them into clickable badges in the rendered tree. */
function injectCitationSpans(text: string): string {
  return text.replace(
    CITATION_PATTERN,
    (_match, n) => `<span data-citation="${n}" class="nbk-cite">[${n}]</span>`,
  );
}

export default function MarkdownView({
  content,
  withCitations = false,
  onCitationClick,
}: MarkdownViewProps) {
  const source = withCitations ? injectCitationSpans(content) : content;

  return (
    <div className={styles.markdownBody}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          a: ({ href, children, ...rest }) => (
            <a href={href ?? '#'} target="_blank" rel="noopener noreferrer" {...rest}>
              {children}
            </a>
          ),
          code: ({ inline, className, children, ...rest }: any) => {
            const codeText = String(children ?? '').replace(/\n$/, '');
            if (inline) {
              return (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            }
            const match = /language-(\w+)/.exec(className || '');
            return <CodeBlock language={match?.[1]} code={codeText} />;
          },
          span: ({ className, children, ...rest }: any) => {
            const cite = (rest as any)['data-citation'];
            if (cite && withCitations) {
              return (
                <button
                  type="button"
                  className={styles.citationBadge}
                  onClick={() => onCitationClick?.(Number(cite))}
                >
                  {children}
                </button>
              );
            }
            return (
              <span className={className} {...rest}>
                {children}
              </span>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
