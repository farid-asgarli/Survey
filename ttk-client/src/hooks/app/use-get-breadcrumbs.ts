import { getBreadcrumbFromRoutes } from "@src/configs/routing/RoutingUtils";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useStore } from "@src/store";

export function useGetBreadcrumbs() {
  const location = useLocation();
  const {
    routing: { routes, homeRoute, breadcrumbs, setBreadcrumbs },
  } = useStore();

  useEffect(() => {
    const currentBreadcrumbs = getBreadcrumbFromRoutes(location.pathname, routes);
    if (homeRoute && !(currentBreadcrumbs?.length === 1 && currentBreadcrumbs[0].path === homeRoute.path))
      currentBreadcrumbs?.unshift({ path: homeRoute.path, title: homeRoute.title });
    setBreadcrumbs(currentBreadcrumbs);
  }, [location, routes]);

  return breadcrumbs;
}
