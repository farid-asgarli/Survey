declare namespace Models {
  interface BaseEntityBasics {
    id: number;
    createdAt: string;
    createdBy: string;
    state: import('@src/static/entities/states').States;
  }
  interface BaseEntity extends BaseEntityBasics {
    modifiedAt: string | null;
    modifiedBy: string | null;
  }
}
