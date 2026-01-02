declare namespace Models {
  namespace ProductCoverageTariff {
    interface Item extends BaseEntity {
      tariff: number;
      amount: number;
      productCoverageId: number;
      productConfigurationId: number;
    }
    interface Create {
      tariff: number;
      amount: number;
      productCoverageId: number;
    }
    interface Update {
      tariff: number;
      amount: number;
      productCoverageId: number;
      productConfigurationId: number;
    }
  }
}
