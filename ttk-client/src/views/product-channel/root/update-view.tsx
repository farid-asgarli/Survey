import { useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { commonRules } from '@src/static/input';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';

const p = pfx('dialog_segregated_form');

interface Props {
  entityDetails: Models.ProductChannel.Item;
  companies: Array<Models.EntityOptions>;
}

function Update(props: Props) {
  const { control, handleSubmit } = useForm({ defaultValues: props.entityDetails });
  const qm = useDataContext(DataCategories.ProductChannel);

  function onSubmit(values: any) {
    values.id = props.entityDetails.id;
    dialog.manageSubmit(() => qm.add(() => agent.ProductChannel.Update(values)));
  }

  const { getInputs, getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        {getInput('companyId', {
          inputProps: {
            data: props.companies,
          },
        })}
        {getInputs(['name', 'channelNumber'])}
      </Form.Wrapper>
    </section>
  );
}
export default observer(Update);
