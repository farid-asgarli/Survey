declare namespace Models {
  namespace ImportedCoverage {
    interface Item extends BaseEntity {
      name: string;
      remoteCoverageId: number;
    }

    interface Create {
      remoteCoverageIds: number[];
    }

    interface Remove {
      id: number;
    }
  }
}
