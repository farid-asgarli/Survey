import { Paper, Stack, TextInput } from '@mantine/core';
import styles from './ManageAccess.module.scss';
import { useEffect, useRef, useState } from 'react';
import { Icon } from '@src/components/icons';
import { EmptyStr } from '@src/static/string';
import { AccessCard } from '../Common/AccessCard';
import { UserCard } from '../Common/UserCard';
import { agent } from '@src/api/agent';
import { AppAccessType } from '@src/static/app-accesses';
import NoResultElement from '../Common/NoResultElement';
import LoadingElement from '../Common/LoadingElement';

interface ManageAccessProps {
  userInitials: string[];
  position: string;
  email: string;
  username: string;
  accessList: Models.AppAccess.Item[];
}

export default function ManageAccess(props: ManageAccessProps) {
  const [searchQuery, setSearchQuery] = useState<string>(EmptyStr);
  const [userAccesses, setUserAccesses] = useState<Set<AppAccessType>>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.setTimeout(() => searchInputRef.current?.focus(), 100);
    getUserAccesses();
  }, []);

  const accessListFiltered = props.accessList.filter((it) => {
    if (!searchQuery) return it;
    const searchQueryInvariant = searchQuery?.toLowerCase();
    return it.description?.toLowerCase().includes(searchQueryInvariant) || it.normalizedName?.toLowerCase().includes(searchQueryInvariant);
  });

  const accessListElement = (
    <Paper withBorder py={5} radius="lg" className={styles['access-list-wrapper']}>
      <div className={styles['inner-list']}>
        {userAccesses ? (
          accessListFiltered.length > 0 ? (
            accessListFiltered.map((it, i, total) => (
              <AccessCard
                isChecked={!!userAccesses?.has(it.normalizedName)}
                key={it.normalizedName}
                description={it.description}
                normalizedName={it.normalizedName}
                hasBorder={i !== total.length - 1}
                onUpdate={(isChecked) => updateUserAccess(isChecked, it.normalizedName)}
                disabled={it.normalizedName !== 'ADMIN' && userAccesses.has('ADMIN')}
              />
            ))
          ) : (
            <NoResultElement />
          )
        ) : (
          <LoadingElement />
        )}
      </div>
    </Paper>
  );

  async function getUserAccesses() {
    const result = await agent.Identity.ListUserAccesses(props.email);
    setUserAccesses(new Set(result.map((it) => it.normalizedName)));
  }

  async function updateUserAccess(isChecked: boolean, accessName: AppAccessType) {
    const requestObj = {
      accessName,
      email: props.email,
    };

    const stateCopy = new Set(userAccesses);

    if (isChecked) {
      await agent.Identity.AddAccessToUser(requestObj);
      stateCopy.add(accessName);
    } else {
      await agent.Identity.RemoveAccessFromUser(requestObj);
      stateCopy.delete(accessName);
    }
    setUserAccesses(stateCopy);
  }

  return (
    <Paper h="100%">
      <Stack h="100%" spacing="md">
        <UserCard userInitials={props.userInitials} position={props.position} email={props.email} username={props.username} />
        <TextInput
          ref={searchInputRef}
          radius="md"
          icon={<Icon name="Search" />}
          placeholder="Axtarış üçün simvol daxil edin"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="md"
        />
        {accessListElement}
      </Stack>
    </Paper>
  );
}
