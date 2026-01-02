import { AppAccessType } from '@src/static/app-accesses';

export default interface ApplicationUser {
  username: string | undefined;
  fullName: string | undefined;
  imageUrl: string;
  position: string;
  accesses: Array<AppAccessType>;
}
