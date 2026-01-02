declare namespace Models {
  namespace ProductConfiguration {
    interface Item extends BaseEntity {
      companyId: number;
      productChannelId: number;
      currencyId: import('@src/static/entities/currency-type').Currencies;
      minimumAge: number;
      maximumAge: number;
      minimumInsuranceCost: number;
      maximumInsuranceAmount: number;
      minimumContractDurationInMonths: number;
      maximumContractDurationInMonths: number;
      administrativeCost: number;
      commissionInterest: number;
      companyRate: number;
      paymentTypeId: number;
      depreciationTypeId: number;
      configurationTypeId: number;
      productCoverageTariffs: ProductCoverageTariff.Item[];
      productChannel: ProductChannel.Item;
      company: Company.Item;
      configState: import('@src/static/entities/states').ConfigStates;
      productConditionId?: number;
    }

    interface Create {
      companyId: number;
      productChannelId: number;
      currencyId: number;
      minimumAge: number;
      maximumAge: number;
      minimumInsuranceCost: number;
      maximumInsuranceAmount: number;
      minimumContractDurationInMonths: number;
      maximumContractDurationInMonths: number;
      administrativeCost: number;
      commissionInterest: number;
      companyRate: number;
      paymentTypeId: number;
      depreciationTypeId: number;
      configurationTypeId: number;
      productConditionId: number;
      productCoverageTariffs: ProductCoverageTariff.Create[];
    }

    interface Update {
      id: number;
      minimumAge: number;
      maximumAge: number;
      minimumInsuranceCost: number;
      maximumInsuranceAmount: number;
      minimumContractDurationInMonths: number;
      maximumContractDurationInMonths: number;
      administrativeCost: number;
      commissionInterest: number;
      companyRate: number;
      paymentTypeId: number;
      depreciationTypeId: number;
      configurationTypeId: number;
      productCoverageTariffs: ProductCoverageTariff.Update[];
    }
  }
}
