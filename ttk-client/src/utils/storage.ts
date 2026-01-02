import Environment from '@src/static/env';

const withPrefix = (value: string) => Environment.PAGE_TITLE + '_' + value;

export const Storage = {
  write: (key: string, data: string | boolean | number | undefined) => data !== undefined && localStorage.setItem(withPrefix(key), `${data}`),
  writeObject: function <T>(key: string, data: T) {
    this.write(withPrefix(key), JSON.stringify(data));
  },
  read: (key: string) => localStorage.getItem(withPrefix(key)),
  readObject: function <T>(key: string) {
    const data = this.read(withPrefix(key));
    if (data) return JSON.parse(data) as T;
  },
};
