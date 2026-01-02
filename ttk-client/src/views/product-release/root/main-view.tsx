import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { formatDate } from '@src/utils/dateFormat';
import { agent } from '@src/api/agent';
import { Icon } from '@src/components/icons';
import { Group, Text, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { CommonButtons } from '@src/static/buttons';
import { t } from '@src/utils/locale';
import { Actions } from '@src/static/actions';
import Button from '@src/components/interface/Button/Button';
import StatusBadge, { assignReleaseStateColor } from '@src/components/interface/StatusBadge/StatusBadge';
import { ProductReleaseStateOptions, ProductReleaseStates } from '@src/static/entities/states';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { drawer } from '@src/components/interface/Drawer/Drawer';
import { cssVar } from '@src/utils/css';
import ProductReleaseDetails from './details-view';
import ProductReleaseUpdate from './update-view';
import ProductReleaseCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories, useDataContext } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.ProductRelease);
  const _manager = useDataContext();

  const [productChannelsForFilter, setProductChannelsForFilter] = useState<Array<Models.EntityOptions>>();

  useAsyncEffect(async () => {
    const result = await agent.EntityOptions.ProductChannels();
    setProductChannelsForFilter(result);
  }, []);

  async function viewDetails(entity: Models.ProductRelease.Item) {
    const [entityDetails] = await ResolveQueries([agent.ProductRelease.Details(entity.id)]);

    drawer.open({
      body: <ProductReleaseDetails entityDetails={entityDetails} />,
      title: (
        <Group spacing="xs">
          <Icon size="1.3rem" color={cssVar('color-primary')} name="History" />
          <Text>Relizə baxış</Text>
        </Group>
      ),
    });
  }

  async function updateDetails(entity: Models.ProductRelease.Item) {
    const [entityDetails] = await ResolveQueries([agent.ProductRelease.Details(entity.id)]);

    dialog.open({
      body: <ProductReleaseUpdate entityDetails={entityDetails} />,
      title: 'Relizə düzəliş',
    });
  }

  async function create() {
    const [productChannelsReadyForRelease] = await ResolveQueries([agent.EntityOptions.ProductChannelsForRelease()]);
    dialog.open({
      body: <ProductReleaseCreate productChannelsReadyForRelease={productChannelsReadyForRelease} />,
      title: 'Reliz əlavə et',
    });
  }

  function remove(data: Models.ProductRelease.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan relizi silməyə əminsinizmi?', data.title, () =>
      qm.remove(data, () => agent.ProductRelease.Remove(data.id))
    );
  }

  async function pendingReleaseRegistrationHandler() {
    await agent.ProductRelease.Register();
    qm.fetchReload();
    _manager.get('ProductCondition')?.fetchReload();
    _manager.get('ProductConfiguration')?.fetchReload();
  }

  async function registerPendingReleases() {
    modals.openConfirmModal({
      title: <Title order={5}>Relizlərin qeydiyyatı</Title>,
      centered: true,
      children: (
        <Text size="sm">
          <strong>'Relizə hazır'</strong> statusunda olan və relizdə qeyd olunmuş kriteriyalara uyğunluq təşkil edən relizlər qeydiyyata
          düşəcək. Davam edilsin?
        </Text>
      ),
      labels: { confirm: 'Bəli', cancel: 'Xeyr' },
      confirmProps: { color: 'orange' },
      onConfirm: pendingReleaseRegistrationHandler,
    });
  }

  return new InitDataViewCardList<Models.ProductRelease.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        title: {
          type: 'text',
          label: t('Title'),
          icon: 'ABC',
          eq: FilterEquations.CONTAINS,
        },
        productChannelId: {
          type: 'select',
          label: t('ProductChannel'),
          icon: 'Assembly',
          inputProps: {
            data: productChannelsForFilter,
          },
        },
        effectiveDate: {
          type: 'date',
          label: t('EffectiveDate'),
          icon: 'CalendarTime',
        },
        releaseState: {
          type: 'select',
          label: t('State'),
          icon: 'ChartArcs',
          inputProps: {
            data: ProductReleaseStateOptions,
          },
        },
      },
    })
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <Button
            leftIcon={<Icon name="ProgressCheck" />}
            disabled={!hasAccess('PRODUCTRELEASES_PAGE_COMMIT')}
            color="indigo"
            variant="outline"
            onClick={registerPendingReleases}
          >
            Relizə göndər
          </Button>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('PRODUCTRELEASES_PAGE_CREATE')} onClickAsync={create}>
            Yeni Reliz
          </CommonButtons.New>
        </Group>
      ),
    })
    .withListItem((it) => ({
      icon: 'History',
      title: it.title,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
        },
        {
          title: t('EffectiveDate'),
          value: formatDate(it.effectiveDate, true),
        },
        {
          title: t('ProductChannel'),
          value: it.productChannel?.name,
        },
      ],
      badges: [
        {
          children: formatDate(it.createdAt),
        },
        {
          children: it.createdBy,
        },
        <StatusBadge colorFn={assignReleaseStateColor} states={ProductReleaseStates} value={it.releaseState} />,
      ],
      actions: [
        Actions.Item('View', {
          onClickAsync: () => viewDetails(it),
          disabled: !hasAccess('PRODUCTRELEASES_PAGE_VIEW'),
        }),
        Actions.Item('Edit', {
          onClickAsync: () => updateDetails(it),
          disabled: it.releaseState !== ProductReleaseStates['Relizə hazırdır'] || !hasAccess('PRODUCTRELEASES_PAGE_UPDATE'),
        }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: it.releaseState !== ProductReleaseStates['Relizə hazırdır'] || !hasAccess('PRODUCTRELEASES_PAGE_DELETE'),
        }),
      ],
    }))
    .render();
}
export default observer(Main);
