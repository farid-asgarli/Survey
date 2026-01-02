import React, { useLayoutEffect, useState } from 'react';
import styles from './Ripple.module.scss';

/**
 * Ripple is a React component that creates a ripple effect usually used in UI interactions.
 * For instance, when a button is clicked, it generates a ripple effect from the point of the click.
 * It is often used to give users feedback that their action (clicking the button) was registered.
 *
 * @param {object} props - The properties that define the behavior of the Ripple component.
 * @param {number} [props.duration=850] - The duration of the ripple effect in milliseconds. Defaults to 850 milliseconds if not specified.
 * @param {function} props.children - A function that takes in two arguments, the generated ripples and the click event handler, and returns a React element.
 * The function is typically used to render the ripple effect on the desired UI element.
 *
 * @returns {JSX.Element} The children function is called within the component returning the result of that function call.
 * This result should be a JSX Element which will typically represent a UI element with the ripple effect applied.
 *
 * @example
 * <Ripple duration={500}>
 *   {(ripples, onClick) => (
 *     <button onClick={onClick}>
 *       Click me
 *       {ripples}
 *     </button>
 *   )}
 * </Ripple>
 */

const Ripple = ({
  duration = 850,
  children,
}: {
  duration?: number;
  children: (ripples: React.ReactNode, onClick: React.MouseEventHandler<HTMLElement>) => JSX.Element;
}): JSX.Element => {
  const [rippleArray, setRippleArray] = useState<
    Array<{
      x: number;
      y: number;
      size: number;
    }>
  >([]);

  function cleanUpRipples() {
    setRippleArray([]);
  }

  function cleanUpTimeout(t: NodeJS.Timeout | null) {
    if (t != null) clearTimeout(t);
  }

  useLayoutEffect(() => {
    let bounce: NodeJS.Timeout | null = null;
    if (rippleArray.length > 0) {
      cleanUpTimeout(bounce);
      bounce = setTimeout(() => {
        cleanUpRipples();
        cleanUpTimeout(bounce);
      }, duration * 2);
    }

    return () => cleanUpTimeout(bounce);
  }, [rippleArray, duration]);

  const addRipple = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rippleContainer = event.currentTarget.getBoundingClientRect();
    const size = rippleContainer.width > rippleContainer.height ? rippleContainer.width : rippleContainer.height;
    const x = event.pageX - rippleContainer.x - size / 2;
    const y = event.pageY - rippleContainer.y - size / 2;
    const newRipple = {
      x,
      y,
      size,
    };

    setRippleArray([...rippleArray, newRipple]);
  };

  return children(
    rippleArray.length > 0 &&
      rippleArray.map((ripple, index) => (
        <span
          className={styles.ripple}
          key={index}
          style={{
            top: ripple.y,
            left: ripple.x,
            width: ripple.size,
            height: ripple.size,
            animationDuration: `${duration}ms`,
          }}
        />
      )),
    addRipple
  );
};

export default Ripple;
