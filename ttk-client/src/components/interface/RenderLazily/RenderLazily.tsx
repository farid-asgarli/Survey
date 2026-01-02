import React from 'react';

export type LazyElement = () => Promise<{
  default: () => JSX.Element | null;
}>;

export function PrepareLazyElement(elem: LazyElement) {
  return () => <LoadLazily>{elem}</LoadLazily>;
}

export function LoadLazily(props: { children: LazyElement }) {
  return <React.Suspense>{React.createElement(React.lazy(props.children))}</React.Suspense>;
}
