declare namespace Models {
  namespace AppUser {
    interface Item {
      accesses: Array<AppAccess.Item>;
    }
    interface AlterUser {
      email: string;
    }
  }
}
