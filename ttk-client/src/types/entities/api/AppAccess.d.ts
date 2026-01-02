declare namespace Models {
  namespace AppAccess {
    interface Item {
      normalizedName: import('@src/static/app-accesses').AppAccessType;
      description: string;
    }

    interface AlterUserAccess {
      accessName: string;
      email: string;
    }
  }
}
