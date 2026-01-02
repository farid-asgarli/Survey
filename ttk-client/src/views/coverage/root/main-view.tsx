import { observer } from 'mobx-react-lite';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { agent } from '@src/api/agent';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { Group } from '@mantine/core';
import { CommonButtons } from '@src/static/buttons';
import { t } from '@src/utils/locale';
import { Actions } from '@src/static/actions';
import { formatDate } from '@src/utils/dateFormat';
import CoverageCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.ProductCoverage);

  async function create() {
    const [remoteCoverages] = await ResolveQueries([agent.ProductCoverage.ListNotInUseByProduct()]);

    dialog.open({
      body: <CoverageCreate remoteCoverages={remoteCoverages} />,
      title: 'Təminat əlavə et',
    });
  }

  function remove(data: Models.ImportedCoverage.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan təminatı silməyə əminsinizmi?', `${data.remoteCoverageId}. ${data.name}`, () =>
      qm.remove(data, () => agent.ProductCoverage.RemoveImportedCoverage(data.id))
    );
  }

  return new InitDataViewCardList<Models.ImportedCoverage.Item>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        remoteCoverageId: {
          type: 'number',
          label: `${t('Coverage')} id nömrəsi`,
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
      icon: 'Clover',
      title: `${it.remoteCoverageId}. ${it.name}`,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
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
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: !hasAccess('COVERAGE_PAGE_DELETE'),
        }),
      ],
    }))
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New disabled={!hasAccess('COVERAGE_PAGE_CREATE')} onClickAsync={create}>
            Yeni Təminat
          </CommonButtons.New>
        </Group>
      ),
    })
    .render();
}

export default observer(Main);
