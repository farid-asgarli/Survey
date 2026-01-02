import React, { useContext, createContext } from 'react';
import MiscStore from './root/utility/misc-store';
import RoutingStore from './root/utility/routing-store';
import UserStore from './root/utility/user-store';
import ProfileImagesStore from './root/utility/profile-images-store';

export const store = {
  user: new UserStore(),
  misc: new MiscStore(),
  profileImages: new ProfileImagesStore(),
  routing: new RoutingStore(),
};

type ApplicationStore = typeof store;

const AppStoreContext = createContext(store);

export function ApplicationStoreProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(
    AppStoreContext.Provider,
    {
      value: store,
    },
    children
  );
}

export function useStore(): ApplicationStore;
export function useStore<K extends keyof ApplicationStore>(key: K): ApplicationStore[K];
export function useStore(key?: keyof ApplicationStore) {
  const store = useContext(AppStoreContext);
  if (key) return store[key];
  return store;
}
