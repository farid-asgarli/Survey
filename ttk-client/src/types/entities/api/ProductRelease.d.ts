declare namespace Models {
  namespace ProductRelease {
    interface Item extends BaseEntity, Create {}

    interface Create {
      title: string;
      explanation: string;
      effectiveDate: string;
      productChannelId: number;
      productConditionId: number;
      productConfigurationId: number;
      releaseState: import('@src/static/entities/states').ProductReleaseStates;
      productConfiguration: ProductConfiguration.Item;
      productChannel: ProductChannel.Item;
      productCondition: ProductCondition.Item;
    }

    interface Update extends Create {
      id: number;
    }
  }
}
