import { NavItemProps } from '@src/configs/routing/RoutingUtils';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function useMatchRoute(NavItems: NavItemProps[]) {
  const [index, setIndex] = useState<number>();
  const location = useLocation();

  useEffect(() => {
    setIndex(NavItems.findIndex((it) => location.pathname.startsWith(it.path)));
  }, [location]);

  return index;
}
