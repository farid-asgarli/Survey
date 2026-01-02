import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import clsx from 'clsx';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { agent } from '@src/api/agent';
import { Notifications } from '@src/utils/notification';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { useForm } from '@src/hooks/app/use-form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { commonRules } from '@src/static/input';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { DataCategories, useDataContext } from '@src/data/query-manager';

interface Props {
  productsChannels: Array<Models.EntityOptions>;
  productCoverages: Models.ImportedCoverage.Item[];
}
const p = pfx('dialog_segregated_form');

function Create(props: Props) {
  const { control, handleSubmit, isSubmitting, watch, setValuesFromObject } = useForm<Record<keyof typeof DefaultFormInputs, any>>();
  const { getInputs, getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  const qm = useDataContext(DataCategories.ProductCondition);

  const productChannelFieldValue = watch('productChannelId');

  useEffect(() => {
    dialog.update({
      buttonLoading: isSubmitting,
    });
  }, [isSubmitting]);

  async function onSubmit(values: Record<keyof typeof DefaultFormInputs, any>) {
    const result = await agent.ProductCondition.CheckEligibilityForCreate(values.productChannelId);

    modals.openConfirmModal({
      title: 'Məlumat',
      centered: true,
      children: (
        <Text
          size="sm"
          dangerouslySetInnerHTML={{
            __html: result,
          }}
        />
      ),
      styles: {
        overlay: { zIndex: 2000 },
        inner: { zIndex: 2001 },
        content: { zIndex: 2002 },
      },
      labels: { confirm: 'Təsdiq', cancel: 'İmtina' },
      confirmProps: { color: 'primary' },
      onConfirm: () => dialog.manageSubmit(() => qm.add(() => agent.ProductCondition.Create(values))),
    });
  }

  useAsyncEffect(async () => {
    if (productChannelFieldValue) {
      const res = await agent.ProductCondition.DetailsByChannel(productChannelFieldValue);
      if (res) {
        setValuesFromObject(res, 'coverages', 'explanation', 'description');
        Notifications.info('Hazırki aktiv konfiqurasiyaya əsasən məlumatlar əlavə olundu.', {
          withCloseButton: false,
        });
      }
    }
  }, [productChannelFieldValue]);

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        <fieldset className={clsx(p('form-set'))}>
          {getInput('productChannelId', {
            inputProps: {
              data: props.productsChannels,
            },
          })}
        </fieldset>
        <fieldset className={p('form-set')}>
          {getInput('coverages', {
            inputProps: {
              data: props.productCoverages?.map((it) => ({
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
export default observer(Create);
