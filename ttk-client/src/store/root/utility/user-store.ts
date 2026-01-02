import { makeAutoObservable, runInAction } from 'mobx';
import ApplicationUser from '@src/types/models/user';
import { AppAccessType } from '@src/static/app-accesses';

export default class UserStore {
  constructor() {
    makeAutoObservable(this);
  }

  appUser: ApplicationUser | undefined;
  accessToken: { content: string; exp: number } | undefined;
  graphRefreshToken: string | undefined;
  userRoles: Set<AppAccessType> = new Set();

  setUserRoles = (val: typeof this.userRoles) => (this.userRoles = val);

  setAppUser(val: typeof this.appUser) {
    this.appUser = val;
  }

  setAccessToken(value: typeof this.accessToken) {
    this.accessToken = value;
  }

  setGraphRefreshToken = (value: typeof this.graphRefreshToken) => (this.graphRefreshToken = value);

  async signIn(profileInfo: { profile: ApplicationUser; accessToken: { content: string; exp: number } }) {
    this.setAppUser(profileInfo.profile);
    this.setAccessToken(profileInfo.accessToken);
    this.setUserRoles(new Set(profileInfo.profile.accesses));
  }

  logOut() {
    runInAction(() => {
      this.setAppUser(undefined);
      this.setAccessToken(undefined);
      this.setGraphRefreshToken(undefined);
      this.setUserRoles(new Set());
    });
  }
}
