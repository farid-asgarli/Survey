import { DetailedView } from '@src/lib/DetailedView';
import { t } from '@src/utils/locale';

interface Props {
  entityDetails: Models.ProductCondition.Item;
  coveragesInUse: Array<Models.ImportedCoverage.Item>;
}

export default function Details({ entityDetails, coveragesInUse }: Props) {
  return (
    <DetailedView.Container
      groups={[
        {
          title: 'Əsas məlumatlar',
          items: [
            {
              title: t('ProductChannel'),
              value: entityDetails.productChannel?.name,
            },
            {
              title: t('Description'),
              value: entityDetails.description,
            },
            {
              title: t('Explanation'),
              value: entityDetails.explanation,
            },
          ],
        },
        {
          title: 'Təminatlar',
          items: coveragesInUse
            .filter((it) => entityDetails.coverages.includes(it.remoteCoverageId))
            .map((it) => ({ value: `${it.remoteCoverageId}. ${it.name}` })),
        },
      ]}
    />
  );
}
