declare namespace Models {
  namespace RemoteEmployee {
    interface Item {
      id: number;
      fullName: string;
      email: string;
      firstName: string;
      lastName: string;
      patronymic: string;
      positionName: string;
      username: string;
    }

    interface DetailedItem extends BaseEntityBasics, Item {}

    interface AddAccessToUser {
      accessName: string;
      email: string;
    }
  }
}
