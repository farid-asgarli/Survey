import { Form } from '@src/primitives/Form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { useForm } from '@src/hooks/app/use-form';
import { commonRules } from '@src/static/input';
import { TerminationDetailsFormInputs } from '..';
import { useEffect } from 'react';
import { Notifications } from '@src/utils/notification';
import { observer } from 'mobx-react-lite';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';
import { DetailedView } from '@src/lib/DetailedView';
import { t } from '@src/utils/locale';
import { Divider, Stack, Title } from '@mantine/core';

function TerminationDetails({
  entityDetails,
  isOnInsurersDemand,
}: {
  entityDetails: Models.ContractItem.TerminationDetailsResponse;
  isOnInsurersDemand: boolean;
}) {
  const { control, handleSubmit } = useForm({
    defaultValues: entityDetails,
  });
  const { getInput } = useFormInputFactory(
    control,
    TerminationDetailsFormInputs(entityDetails.accountNumbers.length === 0 ? 'text' : 'select'),
    {
      rules: commonRules,
    }
  );

  useEffect(() => {
    if (entityDetails.message) Notifications.warning(entityDetails.message);
  }, []);

  const qm = useDataContext(DataCategories.ContractItem);

  async function onSubmit(values) {
    dialog.manageSubmit(async () => {
      await agent.ContractItem.Terminate({
        contractId: entityDetails.contractId,
        customerBankAccountNumber: values.customerBankAccountNumber,
        terminationDate: new Date(),
        isOnInsurersDemand,
      });
      await qm.fetchReload();
    });
  }

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 5px 1fr',
        gap: 25,
      }}
    >
      <Stack align="center" justify="space-between">
        <Stack mt={30}>
          <Title fz={54} fw={500}>
            {entityDetails.insuranceFeeToBeReturned}
          </Title>
          <Title mt={-15} color="gray.6" fw={400} order={4}>
            {t('InsuranceFeeToBeReturned')}
          </Title>
        </Stack>
        <Form.Wrapper
          style={{
            width: '100%',
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {getInput('customerBankAccountNumber', {
            inputProps: {
              data: entityDetails.accountNumbers.map((it) => ({
                label: it,
                value: it,
              })),
              size: 'md',
            },
          })}
        </Form.Wrapper>
      </Stack>
      <Divider orientation="vertical" />
      <DetailedView.Container
        groups={[
          {
            items: [
              {
                title: t('ContractNumber'),
                value: entityDetails.contractNumber,
              },
              {
                title: t('Customer'),
                value: entityDetails.customerFullName,
              },
              {
                title: t('PinCode'),
                value: entityDetails.customerPinCode,
              },
              {
                title: t('TerminationType'),
                value: isOnInsurersDemand ? t('TerminateOnCompanyDemand') : t('TerminateOnCustomerDemand'),
              },
            ],
          },
        ]}
      />
    </section>
  );
}

export default observer(TerminationDetails);
