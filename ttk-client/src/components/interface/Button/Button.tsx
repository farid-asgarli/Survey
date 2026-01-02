import { ButtonProps as MantineButtonProps } from '@mantine/core';
import Ripple from '@src/primitives/Ripple/Ripple';
import { Button as MantineButton } from '@mantine/core';
import React, { useState } from 'react';

export type ButtonProps = import('@mantine/utils').PolymorphicComponentProps<'button', MantineButtonProps> & {
  onClickAsync?(e: React.MouseEvent<HTMLButtonElement>): Promise<any>;
};

function Button({ children, style, onClickAsync, ...props }: ButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  const [loading, setLoading] = useState(false);

  function assignTitle(children: React.ReactNode) {
    return typeof children === 'string' ? children : undefined;
  }

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
        <MantineButton
          ref={ref}
          loading={loading}
          title={assignTitle(children)}
          {...props}
          onClick={handleClick}
          style={{
            ...style,
            position: 'relative',
            overflow: 'hidden',
          }}
          onMouseDown={onClick}
        >
          {children}
          {ripples}
        </MantineButton>
      )}
    </Ripple>
  );
}

export default React.forwardRef(Button);
