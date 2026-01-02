import { agent } from '@src/api/agent';
import { store } from '@src/store';
import { makeAutoObservable } from 'mobx';

export default class ProfileImagesStore {
  constructor() {
    makeAutoObservable(this);
  }

  images: Record<string, string | null> = {};

  hasImage = (username: string) => this.images[username] !== undefined;

  getOrAdd = async (username: string) => {
    if (this.hasImage(username)) return this.images[username];

    const res = await agent.Identity.Image({
      username,
      accessToken: store.user.graphRefreshToken!,
    });
    if (res.size) this.images[username] = URL.createObjectURL(res);
    else this.images[username] = null;

    return this.images[username];
  };
}
