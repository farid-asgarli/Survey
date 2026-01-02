import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { agent } from '@src/api/agent';
import { useNavigate } from 'react-router-dom';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { Form } from '@src/primitives/Form';
import { Alert, Grid, Group, Stack, Text } from '@mantine/core';
import { useForm } from '@src/hooks/app/use-form';
import { Icon } from '@src/components/icons';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { Notifications } from '@src/utils/notification';
import { modals } from '@mantine/modals';
import { commonRules, inputDecimalProps } from '@src/static/input';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { DefaultFormInputs } from '..';
import { CommonButtons } from '@src/static/buttons';
import { DataCategories, useDataContext } from '@src/data/query-manager';

// // TODO Fetch defaultvalues of already related configuration when channelId is chosen

const Create = () => {
  const { control, handleSubmit, resetField, watch, isSubmitting, setValuesFromObject } = useForm();

  const navigate = useNavigate();
  const qm = useDataContext(DataCategories.ProductConfiguration);

  const [productChannels, setProductChannels] = useState<Models.EntityOptions[]>();
  const [conditionCoverages, setConditionCoverages] = useState<Models.ProductCondition.ConditionCoverage[]>();
  const [companies, setCompanies] = useState<Models.EntityOptions[]>();

  const selectedChannel = watch('productChannelId');
  const selectedCompany = watch('companyId');

  useAsyncEffect(async () => {
    const [companiesResult] = await ResolveQueries([agent.EntityOptions.Companies()]);
    setCompanies(companiesResult);
  }, []);

  useAsyncEffect(async () => {
    if (selectedCompany) {
      resetField('productChannelId');

      const result = await agent.EntityOptions.ProductChannelsForConfiguration(selectedCompany);
      if (result.length === 0)
        Notifications.warning('Məhsul üzrə kanallar ya digər konfiqurasiya tərəfindən istifadədədir, ya da təyin olunmayıb.', {
          autoClose: 10000,
        });
      setProductChannels(result);
    }
  }, [selectedCompany]);

  useAsyncEffect(async () => {
    if (selectedChannel) {
      const result = await agent.ProductCoverage.ListChannelCoverages(selectedChannel, selectedCompany);
      setConditionCoverages(result);
      const initialValues = await agent.ProductConfiguration.DetailsByChannel(selectedChannel);
      if (initialValues) {
        setValuesFromObject(initialValues);
        Notifications.info('Hazırki aktiv konfiqurasiyaya əsasən məlumatlar əlavə olundu.', {
          withCloseButton: false,
        });
      }
    }
  }, [selectedChannel]);

  function goBack() {
    navigate('/product-configuration');
  }

  async function onFormSubmit(values) {
    if (conditionCoverages?.length === 0) {
      Notifications.error('Parametrlərə uyğun şərt yoxdur. Zəhmət olmasa ilk öncə şərt təyin edin.');
      return;
    }

    const result = await agent.ProductConfiguration.CheckEligibilityForCreate(values.productChannelId, values.companyId);

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
      onConfirm: () => createConfig(values),
    });
  }

  async function createConfig(values) {
    const coverage_details: Models.ProductCoverageTariff.Create[] = [];

    conditionCoverages?.forEach((it) =>
      coverage_details.push({
        productCoverageId: it.productCoverageId,
        tariff: values[`coverage_tariff-${it.productCoverageId}`],
        amount: values[`coverage_amount-${it.productCoverageId}`],
      })
    );

    values.productCoverageTariffs = coverage_details;

    await qm.add(() => agent.ProductConfiguration.Create(values));

    goBack();
  }

  const { getInputs, getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group cols={3} title="Əsas məlumatlar">
          {getInput('companyId', {
            inputProps: {
              data: companies,
            },
          })}

          {getInput('productChannelId', {
            inputProps: {
              data: productChannels,
            },
          })}
          {getInput('currencyId')}
        </Form.Group>
        <Form.Group cols={4} title="Müqavilə üzrə bəzi məlumatlar">
          {getInputs([
            'minimumContractDurationInMonths',
            'maximumContractDurationInMonths',
            'minimumAge',
            'maximumAge',
            'administrativeCost',
            'companyRate',
            'commissionInterest',
          ])}
        </Form.Group>
        <Form.Group cols={4} title="Məbləğ məlumatları">
          {getInputs(['minimumInsuranceCost', 'maximumInsuranceAmount', 'paymentTypeId', 'depreciationTypeId', 'configurationTypeId'])}
        </Form.Group>
        <Form.Group title="Təminat limitləri">
          {!conditionCoverages && (
            <Alert w="100%" icon={<Icon name="AlertCircle" />} title="Xəbərdarlıq" color="orange">
              <Text>Təminat marjalarını təyin etmək üçün ilk öncə məhsul və şərti seçin.</Text>
            </Alert>
          )}
          <Stack
            style={{
              flex: '1',
            }}
          >
            {conditionCoverages?.map((it) => (
              <Grid grow key={it.productCoverageId} align="center">
                <Grid.Col span={4}>
                  <Text
                    fz="sm"
                    sx={({ colors, colorScheme }) => ({
                      color: colorScheme === 'light' ? colors.dark[4] : undefined,
                    })}
                  >{`${it.remoteCoverageId}. ${it.name}`}</Text>
                </Grid.Col>
                <Grid.Col span={'auto'}>
                  <Form.NumberInput
                    label="Net tarif"
                    controller={{
                      control,
                      name: `coverage_tariff-${it.productCoverageId}`,
                      rules: commonRules,
                      shouldUnregister: true,
                    }}
                    inputProps={{
                      ...inputDecimalProps,
                      precision: 4,
                    }}
                  />
                </Grid.Col>
              </Grid>
            ))}
          </Stack>
        </Form.Group>

        <Group pb={20} position="right">
          <CommonButtons.Reject onClick={goBack} variant="outline" />
          <CommonButtons.Submit loading={isSubmitting} type="submit" />
        </Group>
      </form>
    </section>
  );
};

export default observer(Create);
