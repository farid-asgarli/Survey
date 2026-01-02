import React from 'react';

export function lazilyImportPages<TPage extends string & {}>(
  cb: (path: string) => Promise<{ default: React.ComponentType<any> }>,
  ...pages: Array<TPage>
) {
  const lazyObjectPage: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {};

  pages.forEach((it) => {
    lazyObjectPage[it] = React.lazy(() => cb(`./root/${it}/${it}`));
  });

  return lazyObjectPage as { [P in TPage]: React.LazyExoticComponent<React.ComponentType<any>> };
}
