import { FunctionComponent } from 'react';
import { RouteObject, createBrowserRouter, matchPath } from 'react-router-dom';
import React from 'react';
import Layout from '@src/components/interface/Layout/Layout';
import Environment from '@src/static/env';
import { AppIcon } from '@src/components/icons';
import { EmptyStr } from '@src/static/string';
import { LazyElement, PrepareLazyElement } from '@src/components/interface/RenderLazily/RenderLazily';
import Error from '@src/views/Application/root/Error/Error';

export type RouteConfig = {
  title: string;
  icon?: AppIcon;
  element?: LazyElement | FunctionComponent;
  nav?: boolean;
  home?: boolean;
  disabled?: boolean;
  children?: RouteMap;
  config?: Omit<RouteObject, 'children' | 'element' | 'path'>;
};

export type RouteMap = {
  [routeName: string]: RouteConfig;
};

export type NavItemProps = {
  path: string;
  title: string;
  icon?: AppIcon;
  children?: NavItemProps[];
};

export type BreadcrumbItem = { title: string; path: string };

export function createRouter(routes: RouteMap) {
  return createBrowserRouter(
    [
      {
        path: '/',
        element: <Layout />,
        children: generateRoutes(routes),
        errorElement: !Environment.IsDevelopment ? <Error /> : undefined,
      },
    ],
    {
      basename: Environment.BASE_PATH,
    }
  );
}
function flattenRoutes(routes: RouteMap, basePath: string = EmptyStr): Array<{ path: string; route: RouteConfig }> {
  return Object.keys(routes).flatMap((key) => {
    const route = routes[key];
    if (route.disabled) return [];

    const path = `${basePath}/${key}`;

    if (route.children) return [{ path, route }, ...flattenRoutes(route.children, path)];

    return { path, route };
  });
}

function renderElement(elem: RouteConfig['element']) {
  if (!elem) return React.Fragment; // will never get here anyways
  if (elem['$$typeof']) return elem as FunctionComponent;
  else return PrepareLazyElement(elem as LazyElement);
}

function generateRoutes(routes: RouteMap) {
  const flatRoutes = flattenRoutes(routes);
  return flatRoutes
    .filter((x) => x.route.element !== undefined)
    .map(({ path, route }) => ({
      ...route.config,
      path,
      element: React.createElement(renderElement(route.element)),
    }));
}

export function generateNavItems(routes: RouteMap, basePath: string = EmptyStr, depth: number = 1): NavItemProps[] {
  return Object.entries(routes)
    .filter(([_, route]) => route.nav !== false && !route.disabled)
    .map(([key, route]) => {
      const path = `${basePath}/${key}`;
      const NavItem: NavItemProps = {
        path,
        title: route.title,
        icon: route.icon,
      };

      if (route.children && depth > 0) NavItem.children = generateNavItems(route.children, path, depth - 1);

      return NavItem;
    });
}

export function getBreadcrumbFromRoutes(
  url: string,
  Routes: RouteMap,
  currentPath: string = EmptyStr,
  breadcrumbs: BreadcrumbItem[] = []
): BreadcrumbItem[] | null {
  for (let key in Routes) {
    const route = Routes[key];

    if (route.disabled) continue;
    const path = `${currentPath}/${key}`;

    const match = matchPath(path, url);

    if (match) {
      breadcrumbs.push({ title: route.title, path });
      return breadcrumbs;
    }

    if (route.children) {
      const childBreadcrumb = getBreadcrumbFromRoutes(url, route.children, path, [...breadcrumbs, { title: route.title, path }]);
      if (childBreadcrumb) return childBreadcrumb;
    }
  }

  return null;
}

export function findBestMatchingPath(url: string, paths: string[]): string | undefined {
  const sortedPaths = [...paths].sort((a, b) => b.length - a.length);
  for (let path of sortedPaths) if (matchPath(path, url)) return path;
}

export function getHomeRoute(routes?: RouteMap, currentPath: string = EmptyStr): (RouteConfig & { path: string }) | undefined {
  for (let key in routes) {
    const path = `${currentPath}/${key}`;

    if (routes[key].home)
      return {
        ...routes[key],
        path,
      };

    if (routes[key].children) {
      const nestedRoute = getHomeRoute(routes[key].children, path);
      if (nestedRoute) return nestedRoute;
    }
  }
}
