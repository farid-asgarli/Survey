import { useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { ConfigStates } from '@src/static/entities/states';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { commonRules } from '@src/static/input';
import clsx from 'clsx';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';

// // TODO Update this one as well, there is a mismatch with Create inputs.

const p = pfx('dialog_segregated_form');

function Update({ entityDetails }: { entityDetails: Models.ProductRelease.Item }) {
  const { control, handleSubmit } = useForm({
    defaultValues: {
      ...entityDetails,
      productChannel: entityDetails.productChannel?.name,
      productCondition: `${entityDetails.productCondition?.id}. ${entityDetails.productCondition?.description} - (${
        ConfigStates[entityDetails.productCondition?.configState]
      })`,
      productConfiguration: `${entityDetails.productConfiguration?.id}. (${ConfigStates[entityDetails.productConfiguration?.configState]})`,
      effectiveDate: new Date(entityDetails.effectiveDate),
    },
  });
  const qm = useDataContext(DataCategories.ProductRelease);

  function onSubmit(values: any) {
    values.id = entityDetails.id;
    dialog.manageSubmit(() => qm.add(() => agent.ProductRelease.Update(values)));
  }

  const { getInputs, getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={clsx(p('form-set'), p('form-set-divided'))}>
          {getInput('title')}
          {getInput('productChannel')}
        </fieldset>
        <fieldset className={clsx(p('form-set'), p('form-set-divided'))}>
          {getInput('productCondition')}
          {getInput('productConfiguration')}
        </fieldset>
        {getInputs(['effectiveDate', 'explanation'])}
      </Form.Wrapper>
    </section>
  );
}
export default observer(Update);
