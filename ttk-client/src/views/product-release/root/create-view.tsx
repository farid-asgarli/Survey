import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import { useState } from 'react';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { agent } from '@src/api/agent';
import { ConfigStates } from '@src/static/entities/states';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { commonRules } from '@src/static/input';
import { parseDateFormEntries } from '@src/utils/formExtensions';
import clsx from 'clsx';
import { DataCategories, useDataContext } from '@src/data/query-manager';

// TODO Use badges in select options.

interface Props {
  productChannelsReadyForRelease: Array<Models.EntityOptions>;
}

const p = pfx('dialog_segregated_form');

function Create({ productChannelsReadyForRelease }: Props) {
  const { control, handleSubmit, watch, resetField } = useForm();
  const qm = useDataContext(DataCategories.ProductRelease);

  const [productConditions, setProductConditions] = useState<Array<Models.EntityOptions>>();
  const [productConfigurations, setProductConfigurations] = useState<Array<Models.EntityOptions>>();

  function onSubmit(values: any) {
    dialog.manageSubmit(() => qm.add(() => agent.ProductRelease.Create(parseDateFormEntries(values))));
  }

  const productChannelIdValue: number = watch('productChannelId');

  useAsyncEffect(async () => {
    if (!productChannelIdValue) return;

    resetField('productConditionId');
    resetField('productConfigurationId');
    resetField('productDocumentFormId');

    const [productConditionsResult, productConfigurationsResult] = await ResolveQueries([
      agent.EntityOptions.ProductConditionsForRelease(productChannelIdValue),
      agent.EntityOptions.ProductConfigurationsForRelease(productChannelIdValue),
    ]);

    setProductConditions(productConditionsResult);
    setProductConfigurations(productConfigurationsResult);
  }, [productChannelIdValue]);

  const { getInputs, getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={clsx(p('form-set'), p('form-set-divided'))}>
          {getInput('title')}
          {getInput('productChannelId', {
            inputProps: {
              data: productChannelsReadyForRelease,
            },
          })}
        </fieldset>
        <fieldset className={clsx(p('form-set'), p('form-set-divided'))}>
          {getInput('productConditionId', {
            inputProps: {
              data: productConditions?.map((it) => ({
                value: it.value,
                label: `${it.value}. ${it.label} - (${ConfigStates[it.configState]})`,
              })),
            },
            disabled: !productChannelIdValue,
          })}
          {getInput('productConfigurationId', {
            inputProps: {
              data: productConfigurations?.map((it) => ({ value: it.value, label: `${it.value}. (${ConfigStates[it.configState]})` })),
            },
            disabled: !productChannelIdValue,
          })}
        </fieldset>

        {getInputs(['effectiveDate', 'explanation'])}
      </Form.Wrapper>
    </section>
  );
}
export default observer(Create);
