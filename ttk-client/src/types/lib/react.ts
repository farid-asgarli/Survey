import React from 'react';

/**
 * Creates a React component with a forwarded ref using TypeScript generics.
 * This utility function enhances React's `forwardRef` to allow for type-safe forwarding of refs,
 * providing a flexible way to pass refs down to child components while maintaining the
 * types of both props and the ref itself.
 *
 * @typeparam T The type of the forwarded ref.
 * @typeparam P The type of the component's props.
 * @param render A function that takes props of type `P` and a ref of type `React.Ref<T>`, and returns a React node.
 * @returns A React component that takes props of type `P & React.RefAttributes<T>`, effectively combining props with ref attributes.
 *
 * @example
 * const MyButton = withForwardedRef<HTMLButtonElement, ButtonProps>((props, ref) => (
 *   <button ref={ref} {...props} />
 * ));
 */
export function withForwardedRef<T, P = {}>(
  render: (props: P, ref: React.Ref<T>) => React.ReactNode
): (props: P & React.RefAttributes<T>) => React.ReactNode {
  return React.forwardRef(render) as any;
}
