import { modals } from '@mantine/modals';
import styles from './NetworkDialog.module.scss';
import { Text } from '@mantine/core';
import { useNetwork } from '@mantine/hooks';
import { useEffect } from 'react';
import { AppIllustrations } from '@src/components/illustrations';
import { store } from '@src/store';

export function displayNetworkDialog() {
  modals.open({
    modalId: 'network_dialog',
    centered: true,
    size: 'lg',
    withCloseButton: false,
    children: (
      <div className={styles.network_dialog}>
        <AppIllustrations.Network width={250} height={250} />
        <Text size="xl" ta="center">
          <strong
            style={{
              color: 'red',
            }}
          >
            Şəbəkə xətası
          </strong>
        </Text>
        <Text c="gray.7" ta="center">
          Şəbəkə əlaqəsi itib. Zəhmət olmasa cihazınızın internet-ə qoşulduğundan əmin olun.
        </Text>
      </div>
    ),
  });
}

export default function NetworkDialog() {
  const { online } = useNetwork();

  useEffect(() => {
    if (!online) {
      store.misc.stopAppFetching();
      displayNetworkDialog();
    } else modals.close('network_dialog');
  }, [online]);

  return null;
}
