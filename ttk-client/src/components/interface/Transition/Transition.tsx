import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import { BaseTransitionProps } from '@src/types/app/transition';
import clsx from 'clsx';
import styles from './Transition.module.scss';

interface TransitionProps extends BaseTransitionProps<HTMLElement> {
  /** Defines whether the element is visible or not. */
  visible?: boolean;
  /** Type of CSS animation type. */
  type?: 'fade' | 'slide-left' | 'slide-right' | 'slide-down' | 'slide-up' | 'grow';
  /** Timeout duration for the animation to last. */
  timeout?: number;
}

const Transition: React.FC<TransitionProps> = ({ children, timeout = 300, type = 'fade', visible = true, ...props }) => {
  const nodeRef = useRef<HTMLElement | null>(null);

  return (
    <CSSTransition
      in={visible}
      timeout={timeout}
      classNames={clsx(styles.transition, styles[type])}
      nodeRef={nodeRef}
      unmountOnExit
      {...props}
    >
      {React.isValidElement(children) &&
        React.cloneElement(children, {
          ref: nodeRef,
          style: {
            ...children.props.style,
            transitionDuration: `${timeout}ms`,
          },
        } as JSX.CommonHTMLProps)}
    </CSSTransition>
  );
};

export default Transition;
