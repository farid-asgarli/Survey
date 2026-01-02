import { devAgent } from '@src/_dev/api/agent';
import { _DataRandomizer } from '@src/_dev/utils/randomizer';
import Button from '@src/components/interface/Button/Button';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { useForm } from '@src/hooks/app/use-form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { Form } from '@src/primitives/Form';
import { commonRules } from '@src/static/input';
import { t } from '@src/utils/locale';
import { pfx } from '@src/utils/pfx';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

const DefaultFormInputs = {
  pinCode: {
    type: 'text',
    label: t('PinCode'),
  },
  patronymic: {
    type: 'text',
    label: t('PaternalName'),
  },
  firstName: {
    type: 'text',
    label: t('FirstName'),
  },
  lastName: {
    type: 'text',
    label: t('LastName'),
  },
  phone: {
    type: 'text',
    label: t('MobilePhoneNumber'),
  },
  birthDate: {
    type: 'date',
    label: t('DateOfBirth'),
  },
  address: {
    type: 'text',
    label: t('CurrentAddress'),
  },
  gender: {
    type: 'text',
    label: t('Gender'),
  },
  educationAmount: {
    type: 'number',
    label: t('EducationAmount'),
  },
  email: {
    type: 'text',
    label: t('Email'),
  },
  channelNumber: {
    type: 'number',
    label: 'Kanal nömrəsi',
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

interface CreateProps {
  createFetchReload: () => Promise<void>;
}
const p = pfx('dialog_segregated_form');
function Create({ createFetchReload }: CreateProps) {
  const { control, handleSubmit, setValues } = useForm();

  function generateRandomValues() {
    setValues(_DataRandomizer.generateDirectContractObject());
  }
  useEffect(() => {
    generateRandomValues();
  }, []);
  function onSubmit(values: any) {
    dialog.manageSubmit(async () => {
      await devAgent.ContractDirect.Contract(values);

      createFetchReload();
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
export default observer(Create);
