declare namespace _DevEntities {
  namespace Contract {
    interface InitiateRequest {
      pinCode: string;
      patronymic: string;
      firstName: string;
      lastName: string;
      phone: string;
      birthDate: Date;
      address: string;
      gender: string;
      educationAmount: number;
      email: string;
      bankId: number;
    }
    interface CreateRequest {
      contractId: number;
      creditContractNumber: string;
      creditAmount: number;
      creditInterestRate: number;
      annuity: number;
      beginDate: Date;
      endDate: Date;
      createdByOperator: string;
      createdByAgent: string;
    }
    interface InitiateResponse {
      contractId: number;
      insuranceFee: number;
    }

    interface ContractDirectRequest {
      pinCode: string;
      patronymic: string;
      firstName: string;
      lastName: string;
      phone: string;
      birthDate: Date;
      address: string;
      gender: string;
      educationAmount: number;
      email: string;
      channelNumber: number;
      creditContractNumber: string;
      creditAmount: number;
      creditInterestRate: number;
      annuity: number;
      beginDate: Date;
      endDate: Date;
      createdByOperator: string;
      createdByAgent: string;
    }

    interface RestructurizationDirectRequest {
      educationAmount: number;
      creditContractNumber: string;
      creditAmount: number;
      creditInterestRate: number;
      annuity: number;
      beginDate: Date;
      endDate: Date;
      restructurizationDate: Date;
      createdByOperator: string;
      createdByAgent: string;
      parentContractNumber: number;
    }
  }
}
