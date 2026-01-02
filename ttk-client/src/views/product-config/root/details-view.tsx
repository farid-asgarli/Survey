import { DetailedView } from '@src/lib/DetailedView';
import { ProductConfigurationTypes } from '@src/static/entities/configuration-type';
import { Currencies } from '@src/static/entities/currency-type';
import { DepreciationTypes } from '@src/static/entities/depreciation-type';
import { PaymentTypes } from '@src/static/entities/payment-type';
import { t } from '@src/utils/locale';

interface Props {
  entityDetails: Models.ProductConfiguration.Item;
  conditionCoverages: Models.ProductCondition.ConditionCoverage[];
}

export default function Details({ entityDetails, conditionCoverages }: Props) {
  return (
    <DetailedView.Container
      groups={[
        {
          title: 'Əsas məlumatlar',
          items: [
            {
              title: t('CompanyItem'),
              value: entityDetails?.company?.name,
            },

            {
              title: t('ProductChannel'),
              value: entityDetails?.productChannel?.name,
            },
            {
              title: t('CurrencyId'),
              value: Currencies[entityDetails?.currencyId],
            },
          ],
        },
        {
          title: 'Müqavilə üzrə bəzi məlumatlar',
          items: [
            {
              title: t('MinimumContractDurationInMonths'),
              value: entityDetails?.minimumContractDurationInMonths,
            },
            {
              title: t('MaximumContractDurationInMonths'),
              value: entityDetails?.maximumContractDurationInMonths,
            },
            {
              title: t('MinimumAge'),
              value: entityDetails?.minimumAge,
            },
            {
              title: t('MaximumAge'),
              value: entityDetails?.maximumAge,
            },
            {
              title: t('CompanyRate'),
              value: entityDetails?.companyRate,
            },
            {
              title: t('AdministrativeCost'),
              value: entityDetails?.administrativeCost,
            },
            {
              title: t('CommissionInterest'),
              value: entityDetails?.commissionInterest,
            },
          ],
        },
        {
          title: 'Məbləğ məlumatları',
          items: [
            {
              title: t('MinimumInsuranceCost'),
              value: entityDetails?.minimumInsuranceCost,
            },
            {
              title: t('MaximumInsuranceAmount'),
              value: entityDetails?.maximumInsuranceAmount,
            },
            {
              title: t('PaymentTypeId'),
              value: PaymentTypes[entityDetails?.paymentTypeId],
            },
            {
              title: t('DepreciationTypeId'),
              value: DepreciationTypes[entityDetails?.depreciationTypeId],
            },
            {
              title: t('ConfigurationTypeId'),
              value: ProductConfigurationTypes[entityDetails?.configurationTypeId],
            },
          ],
        },
        {
          title: 'Təminat tarifləri',
          items: conditionCoverages.map((it) => ({
            title: `${it.remoteCoverageId}. ${it.name}`,
            value: entityDetails?.productCoverageTariffs.find((x) => x.productCoverageId === it.productCoverageId)?.tariff + '%',
          })),
        },
      ]}
    />
  );
}
