import { AppAccessType } from '@src/static/app-accesses';
import { store } from '@src/store';
import { getIf } from './get-if';

export function hasAccess(val: AppAccessType) {
  return store.user.userRoles.has('ADMIN') || store.user.userRoles.has(val);
}

export function getIfAccess<T>(access: AppAccessType, obj: T) {
  return getIf(hasAccess(access), obj);
}
