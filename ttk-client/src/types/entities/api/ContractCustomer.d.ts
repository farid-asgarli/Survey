declare namespace Models {
  namespace ContractCustomer {
    interface Item extends BaseEntity {
      firstName: string;
      lastName: string;
      paternalName: string;
      dateOfBirth: string;
      pinCode: string;
      registeredAddress: string;
      gender: string;
      mobilePhoneNumber: string;
      email: string;
      contractId: number;
      fullName: string;
    }
  }
}
