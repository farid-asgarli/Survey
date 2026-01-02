import { shallowEqual } from '@src/utils/shallowEqual';
import { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';

type ToolbarState = {
  [key: string]: boolean;
};

export function useToolbarState(docRef: React.MutableRefObject<HTMLElement | null>, toolbarRef: React.MutableRefObject<HTMLElement | null>) {
  const [toolbarState, setToolbarState] = useState<Partial<ToolbarState>>({});

  function resetToolbarState(e: Event) {
    if (!toolbarRef.current?.contains((e as unknown as React.FocusEvent).relatedTarget)) setToolbarState({});
  }

  function updateToolbarState() {
    const selection = window.getSelection();
    const selectedElement = selection?.anchorNode?.parentElement;

    if (!(selection && docRef.current && docRef.current.contains(selection.anchorNode))) return;

    let isInOrderedList = false;
    let isInUnorderedList = false;
    let isLink = false;
    let isSuperScript = false;
    let isSubScript = false;

    if (selectedElement) {
      let parentNode: HTMLElement | null = selectedElement;

      if (selectedElement?.nodeName === 'SUP') isSuperScript = true;
      else if (selectedElement?.nodeName === 'SUB') isSubScript = true;

      // const contentStyle = window.getComputedStyle(parentNode);
      // const fontSize = contentStyle.fontSize;

      isLink = parentNode.tagName === 'A';
      while (parentNode) {
        if (parentNode.tagName === 'OL') {
          isInOrderedList = true;
          break;
        } else if (parentNode.tagName === 'UL') {
          isInUnorderedList = true;
          break;
        }
        parentNode = parentNode.parentElement;
      }
    }

    const newState: Partial<ToolbarState> = {
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      strikethrough: document.queryCommandState('strikethrough'),
      link: isLink,
      orderedList: isInOrderedList,
      unorderedList: isInUnorderedList,
      superscript: isSuperScript,
      subscript: isSubScript,
    };
    if (!shallowEqual(toolbarState, newState)) setToolbarState(newState);
  }

  const throttledUpdateToolbarState = useMemo(() => debounce(updateToolbarState, 100), []);

  useEffect(() => {
    document.addEventListener('selectionchange', throttledUpdateToolbarState);
    docRef.current?.addEventListener('blur', resetToolbarState);

    return () => {
      document.removeEventListener('selectionchange', throttledUpdateToolbarState);
      docRef.current?.removeEventListener('blur', resetToolbarState);
    };
  }, []);

  const execCommandWithArg = (command: string, arg) => document.execCommand(command, false, arg);

  return { toolbarState, execCommandWithArg };
}
