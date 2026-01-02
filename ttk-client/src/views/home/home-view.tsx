import styles from './home.module.scss';
import { observer } from 'mobx-react-lite';
import { Text } from '@mantine/core';
import { useStore } from '@src/store';

function Home() {
  const {
    user: { appUser },
  } = useStore();

  return (
    <div className={styles.views__home}>
      <Text fz="xl" fw={600} display="flex">
        Xoş gördük,&nbsp; <Text color="gray.7">{appUser?.fullName}</Text>&nbsp; !
      </Text>
    </div>
  );
}

export default observer(Home);
