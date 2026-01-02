import { ContractDocumentTypeOptions } from '@src/static/entities/contract-document-type';
import { t } from '@src/utils/locale';
import { MimeTypes } from '@src/static/file';
import React from 'react';
import { Icon } from '@src/components/icons';
export { default } from './root/main-view';

export const DefaultFormInputs = {
  contractDocumentType: {
    type: 'select',
    label: t('ContractDocumentType'),
    inputProps: {
      data: ContractDocumentTypeOptions,
    },
  },
  note: {
    type: 'textArea',
    label: t('Note'),
  },
  documentFile: {
    type: 'file',
    label: 'Faylı seçin',
    inputProps: {
      accept: [MimeTypes.doc, MimeTypes.docx, MimeTypes.xls, MimeTypes.xlsx, MimeTypes.pdf].join(','),
      icon: React.createElement(Icon, {
        name: 'Upload',
      }),
    },
  },
} as const;
