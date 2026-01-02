import styles from './Editor.module.scss';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { useRef } from 'react';
import React from 'react';
import Toolbar from '../Toolbar/Toolbar';
import clsx from 'clsx';

interface EditorProps extends React.ComponentPropsWithoutRef<'div'> {
  html: string;
  disabled?: boolean;
  tagName?: string;
  onChange: (event: ContentEditableEvent) => void;
}

function Editor({ className, children, ...props }: EditorProps) {
  const editorRef = useRef<HTMLElement | null>(null);

  return (
    <div className={styles['rich-text-editor']}>
      {!props.disabled && <Toolbar editorRef={editorRef} />}
      <ContentEditable
        innerRef={editorRef}
        className={clsx(styles['editable-content'], className, !props.disabled && styles.active)}
        spellCheck={false}
        {...props}
      />
    </div>
  );
}

export default Editor;
