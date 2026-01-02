declare namespace Models {
  namespace ProductChannel {
    interface Item extends BaseEntity, Create {
      company: Company.Item;
    }

    interface Create {
      channelNumber: number;
      name: string;
      companyId: number;
    }

    interface Update extends Create {
      id: number;
    }
  }
}
