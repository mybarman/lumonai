import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { memo, type FC } from "react";
import ReactMarkdown, { type Options } from "react-markdown";

export const MemoizedReactMarkdown: FC<Options> = memo(
  ReactMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

export const DefaultMarkdownRenderer = ({
  text,
  components,
}: {
  text: string;
  components?: Partial<Components>;
}) => {
  return (
    <MemoizedReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        ...components,
        h1: ({ ...props }) => <h1 className="font-semibold" {...props} />,
        h2: ({ ...props }) => <h2 className="font-semibold" {...props} />,

        h3: ({ ...props }) => <h3 className=" font-semibold" {...props} />,
        h4: ({ ...props }) => <h4 className=" font-semibold" {...props} />,
        h5: ({ ...props }) => <h5 className=" font-semibold" {...props} />,
        h6: ({ ...props }) => <h6 className=" font-semibold" {...props} />,
        li: ({ ...props }) => <li className="list-disc " {...props} />,
        p: ({ ...props }) => <p className="whitespace-pre-wrap " {...props} />,
        a: ({ ...props }) => (
          <a
            className="text-blue-500 underline dark:text-blue-400"
            {...props}
          />
        ),

        blockquote: ({ ...props }) => (
          <blockquote className="border-l-4 border-gray-400 pl-2" {...props} />
        ),

        ul: ({ ...props }) => <ul className="ml-5 list-disc" {...props} />,

        ol: ({ ...props }) => <ol className="ml-5 list-decimal" {...props} />,
        table({ children }) {
          return (
            <table className="min-w-full divide-y divide-gray-200">
              {children}
            </table>
          );
        },
        th({ children }) {
          return (
            <th className="bg-gray-50 px-6 py-3 text-left  font-medium uppercase tracking-wider text-gray-500">
              {children}
            </th>
          );
        },
        td({ children }) {
          return <td className="px-6 py-4  text-gray-500">{children}</td>;
        },

        section: ({ children, ...props }) => {
          if ((props as { [key: string]: unknown })["data-footnotes"]) {
            return null; // Or return false;
          }
          return <section {...props}>{children}</section>;
        },
      }}
    >
      {text}
    </MemoizedReactMarkdown>
  );
};
