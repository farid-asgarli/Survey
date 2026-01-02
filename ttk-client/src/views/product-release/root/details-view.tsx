import { DetailedView } from '@src/lib/DetailedView';
import { ConfigStates } from '@src/static/entities/states';
import { formatDate } from '@src/utils/dateFormat';
import { t } from '@src/utils/locale';

interface Props {
  entityDetails: Models.ProductRelease.Item;
}

export default function Details({ entityDetails }: Props) {
  return (
    <DetailedView.Container
      groups={[
        {
          items: [
            {
              title: t('Title'),
              value: entityDetails.title,
            },
            {
              title: t('ProductChannel'),
              value: entityDetails.productChannel?.name,
            },
            {
              title: t('ProductCondition'),
              value: `${entityDetails.productCondition?.id}. ${entityDetails.productCondition?.description} - (${
                ConfigStates[entityDetails.productCondition?.configState]
              })`,
            },
            {
              title: t('ProductConfiguration'),
              value: `${entityDetails.productConfiguration?.id}. (${ConfigStates[entityDetails.productConfiguration?.configState]})`,
            },
            {
              title: t('EffectiveDate'),
              value: formatDate(entityDetails.effectiveDate),
            },
            {
              title: t('Explanation'),
              value: entityDetails.explanation ?? '-',
            },
          ],
        },
      ]}
    />
  );
}
