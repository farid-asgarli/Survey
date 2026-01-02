import Ripple from '@src/primitives/Ripple/Ripple';
import { ActionIcon, ActionIconProps, clsx } from '@mantine/core';
import React, { useState } from 'react';
import styles from './IconButton.module.scss';

export type IconButtonProps = import('@mantine/utils').PolymorphicComponentProps<'button', ActionIconProps> & {
  onClickAsync?(e: React.MouseEvent<HTMLButtonElement>): Promise<void>;
};

function IconButton({ children, className, onClickAsync, ...props }: IconButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  const [loading, setLoading] = useState(false);

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (onClickAsync) {
      setLoading(true);
      try {
        await onClickAsync(e);
      } finally {
        setLoading(false);
      }
    } else props.onClick?.(e);
  }
  return (
    <Ripple>
      {(ripples, onClick) => (
        <ActionIcon
          ref={ref}
          loading={loading}
          {...props}
          onClick={handleClick}
          className={clsx(className, styles['icon-button'])}
          onMouseDown={onClick}
          radius="md"
        >
          {children}
          {ripples}
        </ActionIcon>
      )}
    </Ripple>
  );
}

export default React.forwardRef(IconButton);
