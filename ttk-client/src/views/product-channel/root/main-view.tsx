import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { formatDate } from '@src/utils/dateFormat';
import { agent } from '@src/api/agent';
import { Group } from '@mantine/core';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { CommonButtons } from '@src/static/buttons';
import { t } from '@src/utils/locale';
import useAsyncEffect from '@src/hooks/common/use-async-effect';
import { Actions } from '@src/static/actions';
import ProductChannelUpdate from './update-view';
import ProductChannelCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.ProductChannel);

  const [companiesForFilter, setCompaniesForFilter] = useState<Array<Models.EntityOptions>>();

  useAsyncEffect(async () => {
    const [companies] = await ResolveQueries([agent.EntityOptions.Companies()]);
    setCompaniesForFilter(companies);
  }, []);

  function remove(data: Models.ProductChannel.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan məhsul kanalını silməyə əminsinizmi?', data.name, () =>
      qm.remove(data, () => agent.ProductChannel.Remove(data.id))
    );
  }

  async function updateDetails(entity: Models.ProductChannel.Item) {
    const [entityDetails, companies] = await ResolveQueries([agent.ProductChannel.Details(entity.id), agent.EntityOptions.Companies()]);

    dialog.open({
      body: <ProductChannelUpdate entityDetails={entityDetails} companies={companies} />,
      title: 'Kanala düzəliş',
    });
  }

  async function create() {
    const [companies] = await ResolveQueries([agent.EntityOptions.Companies()]);
    dialog.open({
      body: <ProductChannelCreate companies={companies} />,
      title: 'Kanal əlavə et',
    });
  }

  return new InitDataViewCardList<Models.ProductChannel.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        name: {
          type: 'text',
          label: t('Title'),
          icon: 'ABC',
          eq: FilterEquations.CONTAINS,
        },
        companyId: {
          type: 'select',
          label: t('CompanyId'),
          icon: 'Building',
          inputProps: {
            data: companiesForFilter,
          },
        },
      },
    })
    .withListItem((it) => ({
      icon: 'Assembly',
      title: it.name,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
        },
        {
          title: t('ChannelNumber'),
          value: it.channelNumber,
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
      ],
      actions: [
        Actions.Item('Edit', {
          onClickAsync: () => updateDetails(it),
          disabled: !hasAccess('PRODUCTCHANNEL_PAGE_UPDATE'),
        }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: !hasAccess('PRODUCTCHANNEL_PAGE_DELETE'),
        }),
      ],
    }))
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('PRODUCTCHANNEL_PAGE_CREATE')} onClickAsync={create}>
            Yeni Kanal
          </CommonButtons.New>
        </Group>
      ),
    })
    .render();
}
export default observer(Main);
