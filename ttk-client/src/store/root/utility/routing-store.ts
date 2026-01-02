import { BreadcrumbItem, NavItemProps, RouteMap, generateNavItems, getHomeRoute } from '@src/configs/routing/RoutingUtils';
import { getRoutes } from '@src/configs/routing/Routes';
import { makeAutoObservable, runInAction } from 'mobx';
import { EmptyStr } from '@src/static/string';

export default class RoutingStore {
  constructor() {
    makeAutoObservable(this);
  }

  routes: RouteMap = {};
  navItems: Array<NavItemProps> = [];
  homeRoute = getHomeRoute(this.routes);
  breadcrumbs: Array<BreadcrumbItem> | null = null;
  routerTimestamp: number = 0;

  setupRouter = () => {
    const routeMap = getRoutes();
    this.routes = routeMap;
    this.navItems = generateNavItems(routeMap);
    this.homeRoute = getHomeRoute(routeMap);
    return routeMap;
  };

  reInitializeRouter = () => (this.routerTimestamp = Date.now());

  setBreadcrumbs = (val: typeof this.breadcrumbs) => (this.breadcrumbs = val);

  setCurrentBreadcrumb = (title: string) =>
    runInAction(() => {
      if (this.breadcrumbs) this.breadcrumbs[this.breadcrumbs.length - 1] = { path: EmptyStr, title };
    });
}
