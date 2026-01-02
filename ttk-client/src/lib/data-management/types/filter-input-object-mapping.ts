import { InputMapProps } from '@src/hooks/app/use-form-input-factory';
import { FilterEquations } from '../utility/filter-equations';

export type FilterInputObjectMapping = { [key: string]: InputMapProps & { eq?: FilterEquations } };
