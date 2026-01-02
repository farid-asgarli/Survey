import { Alert, Avatar, Box, Center, CloseButton, Group, Loader, Paper, Stack, Text, TextInput } from '@mantine/core';
import styles from './Create.module.scss';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@src/components/icons';
import { EmptyStr } from '@src/static/string';
import { ProfileCard } from '../Common/ProfileCard';
import { observer } from 'mobx-react-lite';
import { Virtuoso } from 'react-virtuoso';
import { useDebounce } from '@src/hooks/common/use-debounce';
import NoResultElement from '../Common/NoResultElement';
import LoadingElement from '../Common/LoadingElement';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { Form } from '@src/primitives/Form';
import LazyAvatar from '@src/components/interface/LazyProfileImage/LazyAvatar';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';
import { LogicalFilterOperators } from '@src/lib/data-management/utility/logical-operator';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

const maxAvatarCount = 3;

function Create() {
  const _manager = useDataContext();
  const qm = _manager.getOrCreate(DataCategories.EmployeeManagementNotInUse);

  const fetchStatus = qm.getFetchStatus();
  const totalDataCount = qm.getRecordCount();

  const [searchQuery, setSearchQuery] = useState<string>(EmptyStr);
  const [fetchingNextPage, setFetchingNextPage] = useState(false);
  const [employeesToAdd, setEmployeesToAdd] = useState<Map<string, Models.RemoteEmployee.Item>>(new Map());
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    qm.fetchIfNotExists();
    window.setTimeout(() => searchInputRef.current?.focus(), 100);
    return () => {
      _manager.disposeEntry(DataCategories.EmployeeManagementNotInUse);
    };
  }, []);

  async function handleDataFilter(val: string) {
    if (!val || val.length >= 3)
      await qm.fetchFilters(
        [
          { equation: FilterEquations.CONTAINS, key: 'email', value: val },
          { equation: FilterEquations.CONTAINS, key: 'fullName', value: val },
          { equation: FilterEquations.CONTAINS, key: 'positionName', value: val },
        ],
        LogicalFilterOperators.OR_ELSE
      );
  }

  useDebounce(searchQuery, 500, handleDataFilter);

  const employeeListElement = (
    <Paper withBorder py={5} radius="lg" className={styles['employee-list-wrapper']}>
      <div className={styles['inner-list']}>
        {!fetchStatus.has('list') && qm.collection ? (
          qm.collection.length > 0 ? (
            <Virtuoso
              data={qm.collection}
              computeItemKey={(index) => qm.collection![index].id}
              itemContent={(index, item) => (
                <ProfileCard
                  email={item.email}
                  username={item.username}
                  fullName={item.fullName}
                  isChecked={employeesToAdd.has(item.email)}
                  userInitials={[item.firstName, item.lastName]}
                  positionName={item.positionName}
                  hasBorder={index !== qm.collection!.length - 1}
                  onSelect={(isChecked) => onSelect(item, isChecked)}
                />
              )}
              endReached={handleNextPageRequest}
              totalCount={qm.getRecordCount()}
              overscan={5}
            />
          ) : (
            <NoResultElement />
          )
        ) : (
          <LoadingElement />
        )}
      </div>
    </Paper>
  );

  function onSelect(entity: Models.RemoteEmployee.Item, isChecked: boolean) {
    const stateCopy = new Map(employeesToAdd);
    if (isChecked) stateCopy.set(entity.email, entity);
    else stateCopy.delete(entity.email);
    setEmployeesToAdd(stateCopy);
  }

  async function handleNextPageRequest() {
    if (totalDataCount && qm.collection && qm.collection.length >= totalDataCount) return;

    setFetchingNextPage(true);

    try {
      await qm.fetchNextPage();
    } finally {
      setFetchingNextPage(false);
    }
  }

  function addUsers() {
    if (employeesToAdd.size !== 0)
      dialog.manageSubmit(async () => {
        await agent.Identity.AddMultipleUsers({ emails: Array.from(employeesToAdd.keys()) });
        _manager.get('EmployeeManagementInUse')?.fetchReload();
      });
  }

  return (
    <Paper h="100%">
      <Stack spacing="md" h="100%">
        {employeesToAdd.size !== 0 ? (
          <Alert
            styles={{
              root: {
                height: 60,
              },
              message: {
                transform: 'translateY(2px)',
              },
              icon: {
                transform: 'translateY(2px)',
              },
            }}
            variant="light"
            color="teal"
            icon={<Icon name="Check" />}
            radius="lg"
          >
            <Group
              position="apart"
              style={{
                transform: 'translateY(-3px)',
              }}
            >
              <Text truncate fw={500}>
                <strong>{employeesToAdd.size}</strong>&nbsp; istifadəçi 'əlavə olunacaqlar' siyahısındadır. 'Yadda saxla' düyməsinə
                klikləməklə onları əlavə edə bilərsiniz.
              </Text>
              <Box>
                <Avatar.Group spacing="sm">
                  {Array.from(employeesToAdd.values())
                    .slice(0, maxAvatarCount)
                    .map((it) => (
                      <LazyAvatar
                        username={it.username}
                        avatarProps={{
                          size: 30,
                        }}
                        eagerLoad
                        userInitials={[it.firstName, it.lastName]}
                        key={it.id}
                      />
                    ))}
                  {employeesToAdd.size > maxAvatarCount && (
                    <Avatar radius="xl" size={30}>
                      +{employeesToAdd.size - maxAvatarCount}
                    </Avatar>
                  )}
                </Avatar.Group>
              </Box>
            </Group>
          </Alert>
        ) : (
          <Alert
            styles={{
              root: {
                height: 60,
              },
            }}
            variant="light"
            py={15}
            color="blue"
            icon={<Icon name="Info" />}
            radius="lg"
          >
            <Text fw={500}>
              İstifadəçi adlarının yanındaki 'checkbox'-a klikləməklə onları 'əlavə olunacaqlar siyahısına' ata bilərsiniz.
            </Text>
          </Alert>
        )}
        <TextInput
          ref={searchInputRef}
          radius="md"
          icon={<Icon name="Search" />}
          placeholder="Axtarış üçün simvol daxil edin (Tam ad, istifadəçi adı və ya vəzifə)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
          rightSection={
            <CloseButton
              aria-label="Clear input"
              onClick={() => setSearchQuery(EmptyStr)}
              style={{ display: searchQuery ? undefined : 'none' }}
            />
          }
        />

        <Stack h="100%" spacing="md">
          {employeeListElement}
          {fetchingNextPage && (
            <Center inline>
              <Loader my={10} variant="dots" />
            </Center>
          )}
        </Stack>
      </Stack>
      <Form.Wrapper
        onSubmit={(e) => {
          e.preventDefault();
          addUsers();
        }}
      />
    </Paper>
  );
}
export default observer(Create);
