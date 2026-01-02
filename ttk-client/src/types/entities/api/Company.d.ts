declare namespace Models {
  namespace Company {
    interface Item extends BaseEntity, Create {}

    interface Create {
      companyId: number;
      name: string;
    }

    interface Update extends Create {
      id: number;
    }
  }
}
