import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { agent } from '@src/api/agent';
import { useParams } from 'react-router-dom';
import { Form } from '@src/primitives/Form';
import { useForm } from '@src/hooks/app/use-form';
import { Grid, Group, Stack, Text } from '@mantine/core';
import { commonRules, inputDecimalProps } from '@src/static/input';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { DefaultFormInputs } from '..';
import { CommonButtons } from '@src/static/buttons';
import { router } from '@src/configs/routing/RoutingProvider';
import { DataCategories, useDataContext } from '@src/data/query-manager';

const Update = () => {
  const params = useParams();

  const [productConfig, setProductConfig] = useState<Models.ProductConfiguration.Item>();
  const [conditionCoverages, setConditionCoverages] = useState<Models.ProductCondition.ConditionCoverage[]>();

  const qm = useDataContext(DataCategories.ProductConfiguration);

  const { control, handleSubmit, isSubmitting } = useForm({
    defaultValues: generateDefaultValues,
  });

  async function generateDefaultValues() {
    const initialValues = await fetchConfigDetails();

    if (initialValues) {
      const { conditionCoverages, productConfig } = initialValues;

      const values: Record<string, any> = { ...productConfig };
      conditionCoverages?.forEach((it) => {
        const productCoverage = productConfig?.productCoverageTariffs.find((x) => x.productCoverageId === it.productCoverageId);

        values[`coverage_tariff-${it.productCoverageId}`] = productCoverage?.tariff;
        values[`coverage_amount-${it.productCoverageId}`] = productCoverage?.amount;
      });

      values.company = productConfig?.company?.name;
      values.productChannel = productConfig?.productChannel?.name;
      values.currency = productConfig?.currencyId;

      return values;
    }
  }

  async function fetchConfigDetails() {
    if (params.id) {
      const configId = +params.id;
      if (!isNaN(configId)) {
        const productConfig = await agent.ProductConfiguration.Details(configId);
        setProductConfig(productConfig);

        const conditionCoverages = await agent.ProductCoverage.ListChannelCoverages(
          productConfig.productChannelId,
          productConfig.companyId
        );
        setConditionCoverages(conditionCoverages);

        return {
          productConfig,
          conditionCoverages,
        };
      }
    }
  }

  async function onFormSubmit(values: any) {
    if (params.id) {
      const configId = +params.id;

      const valuesToSubmit: Models.ProductConfiguration.Update = {
        id: configId,
        ...values,
      };
      const coverage_details: Models.ProductCoverageTariff.Update[] = [];

      conditionCoverages?.forEach((it) =>
        coverage_details.push({
          productCoverageId: it.productCoverageId,
          tariff: values[`coverage_tariff-${it.productCoverageId}`],
          amount: values[`coverage_amount-${it.productCoverageId}`],
          productConfigurationId: configId,
        })
      );

      valuesToSubmit.productCoverageTariffs = coverage_details;

      await qm.update(() => agent.ProductConfiguration.Update(valuesToSubmit));

      goBack();
    }
  }

  function goBack() {
    router.navigate('/product-configuration');
  }

  const { getInputs } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  return (
    <section>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <Form.Group cols={4} title="Əsas məlumatlar" loading={!productConfig}>
          {getInputs(['company', 'productChannel', 'currency'])}
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
        <Form.Group title="Təminat limitləri" loading={!productConfig}>
          <Stack
            style={{
              flex: '1',
            }}
          >
            {productConfig &&
              conditionCoverages?.map((it) => (
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

export default observer(Update);
