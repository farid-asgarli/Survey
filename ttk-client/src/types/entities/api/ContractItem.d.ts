declare namespace Models {
  namespace ContractItem {
    interface Item extends BaseEntity {
      bankDetails: string;
      contractNumber: number;
      contractBeginDate: string;
      contractEndDate: string;
      contractCustomer: ContractCustomer.Item;
      productReleaseId: number;
      productChannelId: number;
      productRelease: ProductRelease.Item;
      productChannel: ProductChannel.Item;
      contractNumberFull: string;
      contractYear: number;
      channelNumber: number;
      isSigned: boolean;
      creditDetails: CreditDetails | null;
    }

    interface ViewModel extends BaseEntity {
      contractDate: string;
      productChannelName: string;
      productChannelNumber: number;
      companyName: string;
      companyId: number;
      currencyId: number;
      customerFullName: string;
      customerPinCode: string;
      contractNumberFull: string;
      contractNumber: number;
      contractBeginDate: string;
      contractEndDate: string;
      productReleaseId: number;
      productChannelId: number;
      addendumNumber: number;
      officialSignDate: string | null;
      insuranceFee: number;
      insuranceAmount: number;
      trancheAmount: number;
      isSigned: boolean;
      addendumType: import('@src/static/entities/addendum-types').AddendumTypes;
    }

    interface CreditDetails {
      creditContractNumber: string;
      creditInterestRate: number;
      creditAmount: number;
      annuity: number;
      createdByAgent: string;
      contractItemId: number | null;
      annuityFull: string;
      creditInterestRateFull: string;
    }

    interface TerminationDetailsResponse {
      contractId: number;
      contractNumber: string;
      customerFullName: string;
      customerPinCode: string;
      accountNumbers: string[];
      insuranceFeeToBeReturned: number;
      message: string;
    }

    interface TerminateRequest {
      contractId: number;
      terminationDate: Date;
      customerBankAccountNumber: string;
      isOnInsurersDemand: boolean;
    }

    interface TerminationDetailsRequest {
      contractId: number;
      terminationDate: Date;
      isOnInsurersDemand: boolean;
    }
  }
}
