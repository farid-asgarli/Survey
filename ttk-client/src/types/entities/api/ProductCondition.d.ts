declare namespace Models {
  namespace ProductCondition {
    interface Item extends BaseEntity {
      description: string;
      explanation: string;
      productChannelId: number;
      productChannel: ProductChannel.Item;
      coverages: number[];
      configState: import('@src/static/entities/states').ConfigStates;
    }

    interface Create {
      description: string;
      explanation: string;
      coverages: number[];
    }

    interface Update {
      id: number;
      description: string;
      explanation: string;
      coverages: number[];
    }

    interface ConditionCoverage {
      productCoverageId: number;
      remoteCoverageId: number;
      name: string;
    }
  }
}
