import { Group } from '@mantine/core';
import { agent } from '@src/api/agent';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { Actions } from '@src/static/actions';
import { CommonButtons } from '@src/static/buttons';
import { formatDate } from '@src/utils/dateFormat';
import { t } from '@src/utils/locale';
import { observer } from 'mobx-react-lite';
import { DataCategories } from '@src/data/query-manager';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import CompanyCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.Company);

  function remove(data: Models.Company.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan şirkəti silməyə əminsinizmi?', data.name, () =>
      qm.remove(data, () => agent.Company.Remove(data.id))
    );
  }

  async function create() {
    dialog.open({
      body: <CompanyCreate />,
      title: 'Şirkət əlavə et',
    });
  }

  return new InitDataViewCardList<Models.Company.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        companyId: {
          type: 'number',
          label: 'Əsas nömrəsi',
          icon: 'Hash',
        },
        name: {
          type: 'text',
          label: t('Title'),
          icon: 'ABC',
          eq: FilterEquations.CONTAINS,
        },
      },
    })
    .withListItem((it) => ({
      icon: 'Building',
      title: it.name,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
        },
        {
          title: 'Əsas nömrəsi',
          value: it.companyId,
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
        // Actions.Item('Edit', {
        //   onClickAsync: () => updateDetails(it),
        // }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: !hasAccess('COMPANY_PAGE_DELETE'),
        }),
      ],
    }))
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('COMPANY_PAGE_CREATE')} onClickAsync={create}>
            Yeni Şirkət
          </CommonButtons.New>
        </Group>
      ),
    })
    .render();
}

export default observer(Main);
