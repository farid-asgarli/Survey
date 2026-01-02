declare namespace _DevEntities {
  namespace Addendum {
    interface InitiateRequest {
      bankId: number;
      parentContractId: number;
      educationAmount: number;
    }
    interface InitiateResponse {
      contractId: number;
      insuranceFee: number;
    }
    interface CreateRequest {
      contractId: number;
      creditContractNumber: string;
      creditAmount: number;
      creditInterestRate: number;
      annuity: number;
      beginDate: string;
      endDate: string;
      restructurizationDate: string;
      createdByOperator: string;
      createdByAgent: string;
    }
  }
}
