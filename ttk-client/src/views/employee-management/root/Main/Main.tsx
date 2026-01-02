import { useState } from 'react';
import { Group } from '@mantine/core';
import { CommonButtons } from '@src/static/buttons';
import { t } from '@src/utils/locale';
import { formatDate } from '@src/utils/dateFormat';
import { Actions } from '@src/static/actions';
import { observer } from 'mobx-react-lite';
import LazyAvatar from '@src/components/interface/LazyProfileImage/LazyAvatar';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { hasAccess } from '@src/utils/access-management';
import EmployeeCreate from '../Create/Create';
import EmployeeManageAccess from '../ManageAccess/ManageAccess';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { agent } from '@src/api/agent';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { DataCategories } from '@src/data/query-manager';
import { InitDataViewCardList } from '@src/lib/data-management/tools/data-view-factory';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

function Main() {
  const qm = useBindQueryManager(DataCategories.EmployeeManagementInUse);

  const [appAccesses, setAppAccesses] = useState<Array<Models.AppAccess.Item>>();

  function remove(data: Models.RemoteEmployee.DetailedItem) {
    displayRemovalDialog('Aşağıda adı qeyd olunan istifadəçini silməyə əminsinizmi?', `${data.fullName} (${data.email})`, () =>
      qm.remove(data, () => agent.Identity.Remove(data.email))
    );
  }

  function create() {
    dialog.open({
      title: 'İstifadəçi əlavə et',
      body: <EmployeeCreate />,
      dialogProps: {
        styles: {
          content: {
            height: '75vh',
          },
        },
      },
    });
  }

  async function manageAccess(data: Models.RemoteEmployee.DetailedItem) {
    const [accesses] = !appAccesses ? await ResolveQueries([agent.Identity.ListAccesses()]) : [appAccesses];
    if (!appAccesses) setAppAccesses(accesses);

    dialog.open({
      title: 'İcazələrin tənzimlənməsi',
      body: (
        <EmployeeManageAccess
          username={data.username}
          accessList={accesses}
          email={data.email}
          position={data.positionName}
          userInitials={[data.firstName, data.lastName]}
        />
      ),
      dialogProps: {
        styles: {
          content: {
            height: '75vh',
          },
        },
      },
      footer: false,
    });
  }

  return new InitDataViewCardList<Models.RemoteEmployee.DetailedItem>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        id: {
          type: 'number',
          label: t('Id'),
          icon: 'Hash',
        },
        fullName: {
          type: 'text',
          label: t('Name'),
          icon: 'ABC',
          eq: FilterEquations.CONTAINS,
        },
        email: {
          type: 'text',
          label: t('Username'),
          icon: 'User',
          eq: FilterEquations.CONTAINS,
        },
        positionName: {
          type: 'text',
          label: t('EmployeePositionName'),
          icon: 'IdBadge',
          eq: FilterEquations.CONTAINS,
        },
      },
    })
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          <CommonButtons.New onClick={create} disabled={!hasAccess('ADMIN')}>
            Yeni İstifadəçi
          </CommonButtons.New>
        </Group>
      ),
    })
    .withListItem((it) => ({
      title: it.fullName,
      pairs: [
        {
          title: t('Id'),
          value: it.id,
        },
        {
          title: t('Username'),
          value: it.email,
        },
        {
          title: t('EmployeePositionName'),
          value: it.positionName,
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
      leftSection: <LazyAvatar eagerLoad userInitials={[it.firstName, it.lastName]} username={it.username} />,
      actions: [
        Actions.Item('Adjust', {
          onClickAsync: () => manageAccess(it),
          disabled: !hasAccess('ADMIN'),
        }),
        Actions.Item('Remove', {
          onClick: () => remove(it),
          disabled: !hasAccess('ADMIN'),
        }),
      ],
    }))
    .render();
}
export default observer(Main);
