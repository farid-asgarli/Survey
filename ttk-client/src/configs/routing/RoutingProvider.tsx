import { RouterProvider } from 'react-router-dom';
import { createRouter } from './RoutingUtils';
import { useStore } from '@src/store';
import { createRef, useEffect, useImperativeHandle, useState } from 'react';
import { Router } from '@remix-run/router/dist/router';
import { observer } from 'mobx-react-lite';
import { Proxify } from '@src/utils/proxy';

/**
 * `react-router-dom` Router provider reference.
 */
const routerRef = createRef<Router>();

/**
 * Proxy object to ensure access to the latest router methods.
 */
export const router = Proxify(routerRef);

/**
 * RoutingProvider component.
 * It uses MobX for state management.
 * This component is responsible for maintaining the router configuration
 * and re-rendering whenever the routing state is updated in the MobX store.
 */
function RoutingProvider() {
  const { routerTimestamp, setupRouter } = useStore().routing;

  /**
   * Internal router state.
   */
  const [_internalRouter, _setInternalRouter] = useState<Router>();

  /**
   * Effect hook to update routes and internal router whenever args changes.
   */
  useEffect(() => {
    if (routerTimestamp === 0) return;

    const routes = setupRouter();
    _setInternalRouter(createRouter(routes));
    console.log('ROUTER UPDATED: ', routerTimestamp);
  }, [routerTimestamp]);

  /**
   * Imperative handle to provide current internal router to the routerRef.
   */
  useImperativeHandle(routerRef, () => _internalRouter!, [_internalRouter]);

  /**
   * Renders the RouterProvider with the current internal router.
   */
  if (!_internalRouter) return null;

  return <RouterProvider router={_internalRouter} />;
}

export default observer(RoutingProvider);
