import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@src/utils/dateFormat';
import { Group, Text } from '@mantine/core';
import { CommonButtons } from '@src/static/buttons';
import { t } from '@src/utils/locale';
import { agent } from '@src/api/agent';
import { ResolveQueries } from '@src/utils/fetchEntities';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { Actions } from '@src/static/actions';
import StatusBadge, { assignConfigStateColor } from '@src/components/interface/StatusBadge/StatusBadge';
import { ConfigStateOptions, ConfigStates } from '@src/static/entities/states';
import { displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { drawer } from '@src/components/interface/Drawer/Drawer';
import { Icon } from '@src/components/icons';
import { cssVar } from '@src/utils/css';
import ProductConfigDetails from './details-view';
import { hasAccess } from '@src/utils/access-management';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';

function Main() {
  const navigate = useNavigate();

  const [companiesForFilter, setCompaniesForFilter] = useState<Array<Models.EntityOptions>>();
  const [productsChannelsForFilter, setProductChannelsForFilter] = useState<Array<Models.EntityOptions>>();

  useAsyncEffect(async () => {
    const [products, companies] = await ResolveQueries([agent.EntityOptions.ProductChannels(), agent.EntityOptions.Companies()]);
    setProductChannelsForFilter(products);
    setCompaniesForFilter(companies);
  }, []);

  const qm = useBindQueryManager(DataCategories.ProductConfiguration);

  async function updateDetails(entity: Models.ProductConfiguration.Item) {
    navigate(`/product-configuration/update/${entity.id}`);
  }

  // async function viewDetails(entity: Models.ProductConfiguration.Item) {
  //   navigate(`/product-configuration/view/${entity.id}`);
  // }

  async function viewDetails(entity: Models.ProductConfiguration.Item) {
    const [productConfig, coverages] = await ResolveQueries([
      agent.ProductConfiguration.Details(entity.id),
      agent.ProductCoverage.ListChannelCoverages(entity.productChannelId, entity.companyId, entity.productConditionId),
    ]);

    drawer.open({
      body: <ProductConfigDetails conditionCoverages={coverages} entityDetails={productConfig} />,
      title: (
        <Group spacing="xs">
          <Icon size="1.3rem" color={cssVar('color-primary')} name="Coins" />
          <Text>Konfiqurasiyaya baxış</Text>
        </Group>
      ),
    });
  }

  async function create() {
    navigate('/product-configuration/create');
  }

  function remove(data: Models.ProductConfiguration.Item) {
    displayRemovalDialog('Konfiqurasiyanı silməyə əminsinizmi?', undefined, () =>
      qm.remove(data, () => agent.ProductConfiguration.Remove(data.id))
    );
  }

  return new InitDataViewCardList<Models.ProductConfiguration.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        productChannelId: {
          type: 'select',
          label: t('ProductChannel'),
          icon: 'MedicalCross',
          inputProps: {
            data: productsChannelsForFilter,
          },
        },
        companyId: {
          type: 'select',
          label: t('CompanyId'),
          icon: 'Building',
          inputProps: {
            data: companiesForFilter,
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
    .withListItem((it) => ({
      icon: 'Coins',
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
          title: t('CompanyItem'),
          value: it.company?.name,
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
          disabled: !hasAccess('PRODUCTCONFIG_PAGE_VIEW') || !hasAccess('PRODUCTCONFIG_PAGE_VIEW'),
        }),
        Actions.Item('Edit', {
          onClickAsync: () => updateDetails(it),
          disabled: it.configState !== ConfigStates['Təsdiq gözləyir'] || !hasAccess('PRODUCTCONFIG_PAGE_UPDATE'),
        }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: it.configState !== ConfigStates['Təsdiq gözləyir'] || !hasAccess('PRODUCTCONFIG_PAGE_DELETE'),
        }),
      ],
    }))
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('PRODUCTCONFIG_PAGE_CREATE')} onClickAsync={create}>
            Yeni Konfiqurasiya
          </CommonButtons.New>
        </Group>
      ),
    })
    .render();
}
export default observer(Main);
