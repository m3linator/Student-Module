import Markdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** @brief Element overrides: external links open in a new tab, checkboxes are read-only. */
const COMPONENTS: Components = {
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  input: ({ node: _node, ...props }) => <input {...props} disabled />,
};

/**
 * @brief Renders Markdown notes (GitHub flavour: tables, task lists, strikethrough).
 * @details Raw HTML is never rendered (no rehype-raw) and react-markdown strips unsafe URLs such
 * as `javascript:` – so user content cannot inject scripts.
 * @param props.source Markdown text.
 * @returns Rendered preview.
 */
export function MarkdownPreview({ source }: { source: string }) {
  if (!source.trim()) {
    return <p className="text-gray-500">Noch keine Notizen.</p>;
  }
  return (
    <div className="markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {source}
      </Markdown>
    </div>
  );
}
