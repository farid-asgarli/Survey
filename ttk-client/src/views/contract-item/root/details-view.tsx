import { DetailedView } from '@src/lib/DetailedView';
import { BoolTypes } from '@src/static/entities/bool-types';
import { Currencies } from '@src/static/entities/currency-type';
import { formatDate } from '@src/utils/dateFormat';
import { t } from '@src/utils/locale';

interface Props {
  entityDetails: Models.ContractItem.Item;
}

export default function Details({ entityDetails: it }: Props) {
  const customer = it.contractCustomer;
  const creditDetails = it.creditDetails;
  return (
    <DetailedView.Container
      segments={[
        {
          title: 'Müqavilə məlumatları',
          groups: [
            {
              items: [
                {
                  title: t('Id'),
                  value: it.id,
                },
                {
                  title: t('ContractNumber'),
                  value: it.contractNumberFull,
                },
                {
                  title: t('ContractBeginDate'),
                  value: formatDate(it.contractBeginDate),
                },
                {
                  title: t('ContractEndDate'),
                  value: formatDate(it.contractEndDate),
                },
                {
                  title: t('ProductChannel'),
                  value: it.productChannel?.name,
                },
                {
                  title: t('BankDetails'),
                  value: it.productChannel?.company?.name,
                },
                {
                  title: t('ContractSignStatus'),
                  value: BoolTypes[it.isSigned.toString()],
                },
                {
                  title: t('ProductRelease'),
                  value: it.productRelease.title,
                },
              ],
            },
          ],
        },
        {
          title: 'Müştəri məlumatları',
          groups: [
            {
              title: 'Əsas məlumatlar',
              items: [
                {
                  title: t('FirstName'),
                  value: `${customer?.paternalName} ${customer?.firstName} ${customer?.lastName}`,
                },
                {
                  title: t('PinCode'),
                  value: customer?.pinCode,
                },
                {
                  title: t('Gender'),
                  value: customer?.gender,
                },
                {
                  title: t('DateOfBirth'),
                  value: formatDate(customer?.dateOfBirth, true),
                },

                {
                  title: t('RegisteredAddress'),
                  value: customer?.registeredAddress,
                },
              ],
            },
            {
              title: 'Əlaqə məlumatları',
              items: [
                {
                  title: t('MobilePhoneNumber'),
                  value: customer?.mobilePhoneNumber,
                },
                {
                  title: t('Email'),
                  value: customer?.email,
                },
              ],
            },
          ],
        },
        {
          title: 'Kredit detailları',
          groups: [
            {
              items: [
                {
                  title: t('CreditContractNumber'),
                  value: creditDetails?.creditContractNumber,
                },
                {
                  title: t('CreditInterestRate'),
                  value: creditDetails?.creditInterestRateFull,
                },
                {
                  title: t('CreditAmount'),
                  value: creditDetails?.creditAmount + ' ' + Currencies[it.productRelease.productConfiguration.currencyId],
                },
                {
                  title: t('Annuity'),
                  value: creditDetails?.annuityFull,
                },
                {
                  title: t('CreatedByAgent'),
                  value: creditDetails?.createdByAgent,
                },
              ],
            },
          ],
        },
      ]}
    />
  );
}
