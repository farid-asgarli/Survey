import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { agent } from '@src/api/agent';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { formatDate } from '@src/utils/dateFormat';
import { Group, Text } from '@mantine/core';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { CommonButtons } from '@src/static/buttons';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { t } from '@src/utils/locale';
import { ConfigStateOptions, ConfigStates } from '@src/static/entities/states';
import StatusBadge, { assignConfigStateColor } from '@src/components/interface/StatusBadge/StatusBadge';
import { Actions } from '@src/static/actions';
import { drawer } from '@src/components/interface/Drawer/Drawer';
import { Icon } from '@src/components/icons';
import { cssVar } from '@src/utils/css';
import { Notifications } from '@src/utils/notification';
import ConditionDetails from './details-view';
import ConditionUpdate from './update-view';
import ConditionCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.ProductCondition);

  const [productsChannelsForFilter, setProductChannelsForFilter] = useState<Array<Models.EntityOptions>>();

  useAsyncEffect(async () => {
    const [products] = await ResolveQueries([agent.EntityOptions.ProductChannels()]);
    setProductChannelsForFilter(products);
  }, []);

  async function viewDetails(entity: Models.ProductCondition.Item) {
    const [entityDetails, coverages] = await ResolveQueries([
      agent.ProductCondition.Details(entity.id),
      agent.ProductCoverage.ListInUseByProduct(),
    ]);

    drawer.open({
      body: <ConditionDetails entityDetails={entityDetails} coveragesInUse={coverages} />,
      title: (
        <Group spacing="xs">
          <Icon size="1.3rem" color={cssVar('color-primary')} name="SettingsHeart" />
          <Text>Şərtə baxış</Text>
        </Group>
      ),
      // buttonsVisible: false,
    });
  }

  async function updateDetails(entity: Models.ProductCondition.Item) {
    const [entityDetails, coverages] = await ResolveQueries([
      agent.ProductCondition.Details(entity.id),
      agent.ProductCoverage.ListInUseByProduct(),
    ]);
    dialog.open({
      body: <ConditionUpdate entityDetails={entityDetails} coveragesInUse={coverages} />,
      title: 'Şərtə düzəliş',
    });
  }

  function remove(data: Models.ProductCondition.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan şərti silməyə əminsinizmi?', data.description, () =>
      qm.remove(data, () => agent.ProductCondition.Remove(data.id))
    );
  }

  async function create() {
    const productChannels = await agent.EntityOptions.ProductChannelsForCondition();

    if (productChannels.length === 0) {
      Notifications.warning('Məhsula uyğun kanallar ya yoxdur, ya da kanalları istifadə edən şərtlər təsdiq gözləyir.');
      return;
    }

    const productCoverages = await agent.ProductCoverage.ListInUseByProduct();

    dialog.open({
      body: <ConditionCreate productCoverages={productCoverages} productsChannels={productChannels} />,
      title: 'Şərt əlavə et',
    });
  }

  return new InitDataViewCardList<Models.ProductCondition.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        description: {
          type: 'text',
          label: t('Description'),
          icon: 'ABC',
          eq: FilterEquations.CONTAINS,
        },
        productChannelId: {
          type: 'select',
          label: t('ProductChannel'),
          icon: 'MedicalCross',
          inputProps: {
            data: productsChannelsForFilter,
          },
        },
        configState: {
          type: 'select',
          label: t('State'),
          icon: 'ChartArcs',
          inputProps: {
            data: ConfigStateOptions,
          },
        },
      },
    })
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('PRODUCTCONDITIONS_PAGE_CREATE')} onClickAsync={create}>
            Yeni Konfiqurasiya
          </CommonButtons.New>
        </Group>
      ),
    })
    .withListItem((it) => ({
      icon: 'SettingsHeart',
      title: it.description,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
        },

        {
          title: t('ProductChannel'),
          value: it.productChannel?.name,
        },
        {
          title: t('Explanation'),
          value: it.explanation ?? '-',
        },
      ],
      badges: [
        {
          children: formatDate(it.createdAt),
        },
        {
          children: it.createdBy,
        },
        <StatusBadge colorFn={assignConfigStateColor} states={ConfigStates} value={it.configState} />,
      ],
      actions: [
        Actions.Item('View', {
          onClickAsync: () => viewDetails(it),
          disabled: !hasAccess('PRODUCTCONDITIONS_PAGE_VIEW'),
        }),
        Actions.Item('Edit', {
          onClickAsync: () => updateDetails(it),
          disabled: it.configState !== ConfigStates['Təsdiq gözləyir'] || !hasAccess('PRODUCTCONDITIONS_PAGE_UPDATE'),
        }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: it.configState !== ConfigStates['Təsdiq gözləyir'] || !hasAccess('PRODUCTCONDITIONS_PAGE_DELETE'),
        }),
      ],
    }))
    .render();
}
export default observer(Main);
