import { devAgent } from '@src/_dev/api/agent';
import Button from '@src/components/interface/Button/Button';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { useForm } from '@src/hooks/app/use-form';
import { t } from '@src/utils/locale';
import { pfx } from '@src/utils/pfx';
import { _DataRandomizer } from '@src/_dev/utils/randomizer';
import clsx from 'clsx';
import { useEffect } from 'react';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { commonRules } from '@src/static/input';
import { Form } from '@src/primitives/Form';

const DefaultFormInputs = {
  parentContractNumber: {
    type: 'number',
    label: 'Əsas Müqavilə Nömrəsi',
  },
  educationAmount: {
    type: 'number',
    label: t('EducationAmount'),
  },
  creditContractNumber: {
    type: 'text',
    label: t('CreditContractNumber'),
  },
  creditAmount: {
    type: 'number',
    label: t('CreditAmount'),
  },
  creditInterestRate: {
    type: 'number',
    label: t('CreditInterestRate'),
  },
  annuity: {
    type: 'number',
    label: t('Annuity'),
  },
  beginDate: {
    type: 'date',
    label: t('ContractBeginDate'),
  },
  endDate: {
    type: 'date',
    label: t('ContractEndDate'),
  },
  createdByOperator: {
    type: 'text',
    label: 'Operator',
  },
  createdByAgent: {
    type: 'text',
    label: t('CreatedByAgent'),
  },
} as const;
interface AddendumProps {
  addendumFetchReload: () => Promise<void>;
}

export default function Addendum({ addendumFetchReload }: AddendumProps) {
  const p = pfx('dialog_segregated_form');

  const { control, handleSubmit, setValues } = useForm();

  function generateRandomValues() {
    setValues(_DataRandomizer.generateDirectRestructurizationObject());
  }
  useEffect(() => {
    generateRandomValues();
  }, []);

  function onSubmit(values: any) {
    dialog.manageSubmit(async () => {
      await devAgent.ContractDirect.Restructurization(values);
      addendumFetchReload();
    });
  }
  const { getInputs } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section className={p()}>
      <Button onClick={generateRandomValues}>Random dəyərlər əlavə et</Button>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={clsx(p('form-set'), p('form-set-divided'))}>{getInputs()}</fieldset>
      </Form.Wrapper>
    </section>
  );
}
