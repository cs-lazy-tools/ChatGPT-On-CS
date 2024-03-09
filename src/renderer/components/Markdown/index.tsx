import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './index.module.scss';

interface MarkdownProps {
  content: string;
}

const Markdown: React.FC<MarkdownProps> = ({ content }) => {
  // 使用正确的类型来确保与预期的ReactMarkdown组件兼容
  const components: Components = {
    // @ts-ignore
    a: ({ node, ...props }) => ( // eslint-disable-line
      <a {...props} target="_blank" rel="noopener noreferrer">
        {props.children}
      </a>
    ),
  };

  return (
    <ReactMarkdown
      className={styles.markdown}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default React.memo(Markdown);
