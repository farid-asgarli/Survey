declare namespace Models {
  namespace ContractDocument {
    interface Item extends BaseEntity {
      contractItemId: number;
      filePath: string;
      note: string;
      contractDocumentType: import('@src/static/entities/contract-document-type').ContractDocumentTypes;
    }
    interface Create {
      contractId: number;
      fileProperties: UploadModel;
      contractDocumentType: number;
      note: string;
    }
    interface UploadModel {
      fileName: string;
      fileContent: string;
    }
  }
}
