import { createRef, useImperativeHandle, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, Modal } from '@mantine/core';
import IconButton from '../IconButton/IconButton';
import { Icon } from '@src/components/icons';
import { CommonButtons } from '@src/static/buttons';
import { Proxify } from '@src/utils/proxy';
import { MimeTypes } from '@src/static/file';
import { FileFns } from '@src/utils/fileFns';
import styles from './PdfViewer.module.css';

const DefaultPdfViewerState: PdfViewerInnerState = {
  visible: false,
  content: undefined,
};

interface PdfViewerInnerState {
  content: string | undefined;
  title?: string | undefined;
  visible: boolean;
}

interface OpenPdfViewerProps extends Omit<PdfViewerInnerState, 'visible'> {}

interface PdfViewerRef {
  open(props: OpenPdfViewerProps): void;
  close(): void;
}

const pdfViewerRef = createRef<PdfViewerRef>();

export const pdfViewer = Proxify(pdfViewerRef);

function PdfViewer() {
  const [pdfViewerState, setPdfViewerState] = useState<PdfViewerInnerState>(DefaultPdfViewerState);

  function close() {
    setPdfViewerState((prev) => ({ ...prev, visible: false }));
    setTimeout(destroy, 300);
  }

  function open({ content, ...props }: OpenPdfViewerProps) {
    var documentBlob = FileFns.base64ToBlob(FileFns.base64ToFileUrl(content!, MimeTypes.pdf)).blob;

    const blobUrl = window.URL.createObjectURL(documentBlob);

    setPdfViewerState({ ...DefaultPdfViewerState, content: blobUrl, ...props, visible: true });
  }

  function destroy() {
    if (pdfViewerState.content) URL.revokeObjectURL(pdfViewerState.content);
    setPdfViewerState(DefaultPdfViewerState);
  }

  function printDocument() {
    if (pdfViewerState.content) {
      const newWin = window.open(pdfViewerState.content);
      if (newWin) newWin.onload = newWin.print;
    }
  }

  useImperativeHandle(
    pdfViewerRef,
    () => ({
      close,
      open,
    }),
    []
  );

  const header = (
    <Modal.Header>
      <Modal.Title>{pdfViewerState.title}</Modal.Title>
      <IconButton onClick={close}>
        <Icon size={20} name="Close" />
      </IconButton>
    </Modal.Header>
  );

  const body = (
    <object className={styles.inner} data={pdfViewerState.content} type={MimeTypes.pdf}>
      <iframe title={pdfViewerState.title} src={pdfViewerState.content} />
    </object>
  );

  const footer = (
    <div className={styles.footer}>
      <CommonButtons.Reject onClick={close} />
      <CommonButtons.Print variant="filled" onClick={printDocument} />
    </div>
  );

  return (
    <Modal.Root
      onClose={close}
      opened={pdfViewerState.visible}
      centered
      classNames={{
        title: styles.title,
        header: styles.header,
      }}
      className={styles.dialog}
    >
      <Modal.Overlay />
      <Modal.Content
        style={{
          minWidth: '80vw',
          width: '80vw',
          height: '90vh',
        }}
        className={styles.content}
      >
        {header}
        <div className={styles['divider-wrapper']}>
          <Divider className={styles.divider} />
        </div>
        {body}
        {footer}
      </Modal.Content>
    </Modal.Root>
  );
}
export default observer(PdfViewer);
