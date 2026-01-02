import { Box, ButtonProps, Chip, Divider, Modal, Text } from '@mantine/core';
import { Icon } from '@src/components/icons';
import Button from '@src/components/interface/Button/Button';
import IconButton from '@src/components/interface/IconButton/IconButton';
import { BASE_FORM_KEY } from '@src/static/form-keys';
import clsx from 'clsx';
import React, { createRef, useImperativeHandle, useState } from 'react';
import { Proxify } from '@src/utils/proxy';
import { modals } from '@mantine/modals';
import styles from './Dialog.module.css';
import { merge } from '@src/utils/merge';
import { MantineComponentSize } from '@src/types/lib/mantine';
import { useTheme } from '@src/hooks/app/use-theme';
import { ModalRootProps } from '@mantine/core/lib/Modal/ModalRoot/ModalRoot';
import { PermissionDialog } from '../PermissionDialog/PermissionDialog';

interface DialogInnerState {
  title: React.ReactNode;
  body: JSX.Element | undefined;
  visible: boolean;
  buttonLoading: boolean;
  buttonsVisible: boolean;
  okButtonLabel: string;
  closeButtonLabel: string;
  contentHeight: string | number | undefined;
  formId: string;
  size: MantineComponentSize;
  dialogProps?: Partial<ModalRootProps> | undefined;
  okButtonProps?: import('@mantine/utils').PolymorphicComponentProps<'button', ButtonProps>;
  closeButtonProps?: import('@mantine/utils').PolymorphicComponentProps<'button', ButtonProps>;
  footer: React.ReactNode;
}

interface OpenDialogProps extends Partial<Omit<DialogInnerState, 'visible'>> {
  body: JSX.Element;
}

const DefaultDialogState: DialogInnerState = {
  body: undefined,
  footer: undefined,
  buttonLoading: false,
  buttonsVisible: true,
  okButtonLabel: 'Yadda saxla',
  closeButtonLabel: 'Bağla',
  contentHeight: undefined,
  size: '75%',
  formId: BASE_FORM_KEY,
  title: undefined,
  visible: false,
};

interface DialogRef {
  open(props: OpenDialogProps): void;
  close(): void;
  update(props: Partial<OpenDialogProps>): void;
  manageSubmit(callback: () => Promise<any> | any, closeOnFinish?: boolean): Promise<void>;
}

const dialogRef = createRef<DialogRef>();

export const dialog = Proxify(dialogRef);

function Dialog() {
  const [dialogState, setDialogState] = useState<DialogInnerState>(DefaultDialogState);
  const { theme, colorScheme } = useTheme();

  useImperativeHandle(
    dialogRef,
    () => ({
      close,
      open,
      update,
      manageSubmit,
    }),
    []
  );

  function open(props: OpenDialogProps) {
    setDialogState(merge(DefaultDialogState, props, { visible: true }));
  }

  function close() {
    setDialogState((prev) => ({ ...prev, visible: false }));
    setTimeout(destroy, 300);
  }

  function update(props: Partial<DialogInnerState>) {
    setDialogState((prev) => merge(prev, props));
  }

  function destroy() {
    setDialogState(DefaultDialogState);
  }

  async function manageSubmit(cb: () => Promise<void> | void, closeOnFinish = true) {
    try {
      update({ buttonLoading: true });
      await cb();
      if (closeOnFinish) close();
    } finally {
      update({ buttonLoading: false });
    }
  }

  const header = (
    <Modal.Header
      style={{
        padding: theme.spacing.lg,
      }}
    >
      <Modal.Title>{dialogState.title}</Modal.Title>
      <IconButton onClick={close}>
        <Icon size={20} name="Close" />
      </IconButton>
    </Modal.Header>
  );

  const body = (
    <Modal.Body
      className={styles.body}
      style={{
        height: !dialogState.dialogProps?.fullScreen ? dialogState.contentHeight : undefined,
      }}
    >
      {dialogState.body}
    </Modal.Body>
  );

  const footer =
    dialogState.footer ??
    (dialogState.buttonsVisible && (
      <Box
        style={{
          background: colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[1],
        }}
        className={styles.footer}
      >
        <Button
          className={styles['close-button']}
          leftIcon={<Icon name="Close" />}
          variant="outline"
          onClick={close}
          children={dialogState.closeButtonLabel}
          {...dialogState.closeButtonProps}
        />
        <Button
          className={styles['submit-button']}
          leftIcon={<Icon name="Check" />}
          loading={dialogState.buttonLoading}
          type="submit"
          form={dialogState.formId}
          children={dialogState.okButtonLabel}
          {...dialogState.okButtonProps}
        />
      </Box>
    ));

  return (
    <Modal.Root
      onClose={close}
      opened={dialogState.visible}
      size={dialogState.size}
      centered
      {...dialogState.dialogProps}
      classNames={{
        title: styles.title,
        header: styles.header,
        ...dialogState.dialogProps?.classNames,
      }}
      className={clsx(styles.dialog, dialogState.dialogProps?.className)}
    >
      <Modal.Overlay />
      <Modal.Content radius="lg" className={styles.content}>
        {header}
        <div className={styles['divider-wrapper']}>
          <Divider className={styles.divider} />
        </div>
        {body}
        {dialogState.buttonsVisible && footer}
      </Modal.Content>
    </Modal.Root>
  );
}

export default Dialog;

export function displayRemovalDialog(brief: string, body: string | undefined, onConfirm: () => void) {
  modals.openConfirmModal({
    withCloseButton: false,
    centered: true,
    children: (
      <Text size="sm">
        <strong>{brief}</strong>
        {body && (
          <Text
            // style={({colors,})=>({
            //   color:   colors.gray[6],
            // })}
            size="sm"
            mt={20}
          >
            {body}
          </Text>
        )}
      </Text>
    ),
    labels: { confirm: 'Bəli', cancel: 'Xeyr' },
    confirmProps: { color: 'red', leftIcon: React.createElement(Icon, { name: 'Trash' }) },
    cancelProps: { leftIcon: React.createElement(Icon, { name: 'Close' }) },
    onConfirm,
  });
}

export function displayAccessDialog(content: string) {
  const conditionalError = 'bu əməliyyat üçün kifayət qədər hüququnuz yoxdur';
  // accessType === 0
  //   ? 'bu məlumatların əldə etmək üçün kifayət qədər hüququnuz yoxdur'
  //   : 'bu əməliyyatı yerinə yetirmək üçün hüququnuz yoxdur';

  dialog.open({
    title: 'Yetərsiz icazə',
    body: (
      <PermissionDialog
        content={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <span style={{ textAlign: 'center' }}>
              Üzr istəyirik, {conditionalError}. Aşağıdaki bölmə adını istifadə etməklə, icazə hüququ əldə etmək üçün administratorla əlaqə
              saxlaya bilərsiniz:
            </span>
            <Chip checked={false} variant="filled">
              {content}
            </Chip>
          </div>
        }
      />
    ),
    buttonsVisible: false,
    size: 'md',
  });
}
