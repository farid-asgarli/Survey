import { Storage } from '@src/utils/storage';
import { makeAutoObservable, reaction } from 'mobx';

export default class MiscStore {
  constructor() {
    makeAutoObservable(this);
    reaction(
      () => this.sidebarExpanded,
      (expanded) => Storage.write('sidebar-expanded', expanded)
    );
  }
  sidebarExpanded: boolean | undefined = Storage.read('sidebar-expanded') === 'true';
  appLoaded: boolean = true;
  appFetching: boolean = false;

  updateSidebarExpansion = (val?: boolean) => {
    if (val) this.sidebarExpanded = val;
    else this.sidebarExpanded = !this.sidebarExpanded;
  };

  setAppLoaded = (val?: boolean) => {
    if (val) this.appLoaded = val;
    else this.appLoaded = !this.appLoaded;
  };

  startAppFetching = () => (this.appFetching = true);
  stopAppFetching = () => (this.appFetching = false);
}
