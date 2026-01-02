import { useForm } from 'react-hook-form';
import { observer } from 'mobx-react-lite';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import clsx from 'clsx';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { commonRules } from '@src/static/input';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';
interface Props {
  entityDetails: Models.ProductCondition.Item;
  coveragesInUse: Array<Models.ImportedCoverage.Item>;
}
const p = pfx('dialog_segregated_form');

function Update(props: Props) {
  const qm = useDataContext(DataCategories.ProductCondition);

  const { control, handleSubmit } = useForm({
    defaultValues: { ...props.entityDetails } as any,
  });

  function onSubmit(values: any) {
    values.id = props.entityDetails.id;
    dialog.manageSubmit(() => qm.add(() => agent.ProductCondition.Update(values)));
  }

  const { getInput, getInputs } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={clsx(p('form-set'))}>
          {getInput('productChannelId', {
            inputProps: {
              data: [
                {
                  label: props.entityDetails.productChannel?.name,
                  value: props.entityDetails.productChannelId,
                },
              ],
            },
            disabled: true,
          })}
        </fieldset>
        <fieldset className={p('form-set')}>
          {getInput('coverages', {
            inputProps: {
              data: props.coveragesInUse?.map((it) => ({
                value: it.remoteCoverageId,
                label: `${it.remoteCoverageId}. ${it.name}`,
              })),
            },
          })}
        </fieldset>
        {getInputs(['description', 'explanation']).map((it, i) => (
          <fieldset key={i} className={p('form-set')}>
            {it}
          </fieldset>
        ))}
      </Form.Wrapper>
    </section>
  );
}
export default observer(Update);
