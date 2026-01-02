import React, { useMemo, useRef } from 'react';
import { Icon } from '@src/components/icons';
import { TextEditorCommands, execCommands } from '../../commands';
import { useToolbarState } from '../../use-toolbar-state';
import clsx from 'clsx';
import { UnstyledButton } from '@mantine/core';
import useIntersectionObserver from '@src/hooks/common/useIntersectionObserver';
import styles from './Toolbar.module.scss';

export default function Toolbar({ editorRef }: { editorRef: React.MutableRefObject<HTMLElement | null> }) {
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { toolbarState, execCommandWithArg } = useToolbarState(editorRef, toolbarRef);

  const execCommand = (command: (typeof execCommands)[number]) => {
    let arg: string | null = null;

    switch (command) {
      case 'createLink':
      case 'insertImage':
        arg = prompt('URL-i daxil edin:');
        break;
      case 'foreColor':
      case 'backColor':
        arg = prompt('Rəngi kodunu daxil edin:');
        break;
      case 'fontSize':
        arg = prompt('Font ölçüsünü daxil edin:');
        break;
      case 'hiliteColor':
        arg = arg = prompt('Rəng kodunu daxil edin:');
        break;
      default:
        break;
    }

    execCommandWithArg(command, arg);
  };

  const toolbarItems = useMemo(() => {
    const items: Array<JSX.Element> = [];
    for (const groupKey in TextEditorCommands) {
      const group = TextEditorCommands[groupKey];

      const innerGroup: Array<JSX.Element> = [];

      for (const itemKey in group) {
        const { command, icon, title } = group[itemKey];
        innerGroup.push(
          <UnstyledButton
            key={command}
            title={title}
            color="indigo.5"
            onClick={() => execCommand(command)}
            className={clsx(styles['toolbar-button'], toolbarState[itemKey] && styles.active)}
          >
            <Icon name={icon} />
          </UnstyledButton>
        );
      }

      items.push(
        <div key={groupKey} className={styles['list-group']}>
          {innerGroup}
        </div>
      );
    }
    return items;
  }, [toolbarState]);

  const isIntersecting = useIntersectionObserver(sentinelRef);

  return (
    <>
      <div ref={sentinelRef} className={styles.sentinel} />
      <div ref={toolbarRef} className={clsx(styles['rich-text-toolbar'], { [styles.fixed]: !isIntersecting })}>
        <div className={styles.list}>{toolbarItems}</div>
      </div>
    </>
  );
}
