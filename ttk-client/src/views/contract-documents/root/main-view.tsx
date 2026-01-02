import { Group, Stack } from '@mantine/core';
import { agent } from '@src/api/agent';
import { dialog, displayRemovalDialog } from '@src/components/interface/Dialog/Dialog';
import { useForm } from '@src/hooks/app/use-form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { DataList } from '@src/lib/DataView/DataList';
import { Form } from '@src/primitives/Form';
import { Actions } from '@src/static/actions';
import { CommonButtons } from '@src/static/buttons';
import { ContractDocumentTypes } from '@src/static/entities/contract-document-type';
import { MimeTypes } from '@src/static/file';
import { formatDate } from '@src/utils/dateFormat';
import { ResolveQueries } from '@src/utils/fetchEntities';
import { FileFns } from '@src/utils/fileFns';
import { t } from '@src/utils/locale';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import ContractDocumentCreate from './create-view';
import { hasAccess } from '@src/utils/access-management';

const ContractDetailInputs = {
  fullName: {
    type: 'text',
    label: t('FirstName'),
  },
  pinCode: {
    type: 'text',
    label: t('PinCode'),
  },
  contractNumber: {
    type: 'text',
    label: t('ContractNumber'),
  },
} as const;

export default function Main() {
  const [documents, setDocuments] = useState<Array<Models.ContractDocument.Item>>();
  const params = useParams();

  async function getData() {
    const contractId = Number(params.id);

    if (!isNaN(contractId)) {
      const [documents, contractDetails] = await ResolveQueries([
        agent.ContractDocument.List(contractId),
        agent.ContractItem.Details(contractId),
      ]);

      setDocuments(documents);

      return {
        fullName: contractDetails.contractCustomer.fullName,
        pinCode: contractDetails.contractCustomer.pinCode,
        contractNumber: contractDetails.contractNumberFull,
      };
    }
  }

  async function reloadDocuments() {
    const contractId = Number(params.id);

    if (!isNaN(contractId)) {
      const res = await agent.ContractDocument.List(contractId);
      setDocuments(res);
    }
  }

  const { control } = useForm({ defaultValues: () => getData() });
  const { getInputs } = useFormInputFactory(control, ContractDetailInputs, { disableAll: true });

  async function remove(id: number) {
    await agent.ContractDocument.Remove(id);
    setDocuments((d) => d?.filter((it) => it.id !== id));
  }

  async function download(entity: Models.ContractDocument.Item) {
    const res = await agent.ContractDocument.Download(entity.id);
    FileFns.downloadBase64(FileFns.base64ToFileUrl(res, MimeTypes.pdf), ContractDocumentTypes[entity.contractDocumentType] + '.pdf');
  }

  function launchRemoveDialog(item: Models.ContractDocument.Item) {
    displayRemovalDialog('Aşağıda adı qeyd olunan faylı silməyə əminsinizmi?', ContractDocumentTypes[item.contractDocumentType], () =>
      remove(item.id)
    );
  }

  async function create() {
    const contractId = +params.id!;
    if (documents && contractId)
      dialog.open({
        title: 'Sənəd əlavə et',
        body: <ContractDocumentCreate reloadDocuments={reloadDocuments} contractId={contractId} />,
      });
  }

  return (
    <Stack spacing={0} h={'100%'}>
      <Form.Group cols={3} title="Müştəri məlumatları">
        {getInputs()}
      </Form.Group>
      <DataList.Container
        isLoading={!documents}
        data={documents}
        totalCount={documents?.length}
        utilitySection={
          <Group noWrap>
            <CommonButtons.Reload
              onClickAsync={async () => {
                await getData();
              }}
            />
            <CommonButtons.New disabled={!hasAccess('CONTRACTDOCUMENT_PAGE_UPLOAD')} onClickAsync={create}>
              Yeni Sənəd
            </CommonButtons.New>
          </Group>
        }
        renderListItem={(it) => ({
          icon: 'Document',
          title: ContractDocumentTypes[it.contractDocumentType],
          pairs: [
            {
              title: t('Id'),
              value: it.id,
            },
            {
              title: t('Note'),
              value: it.note,
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
              onClick: () => launchRemoveDialog(it),
              disabled: !hasAccess('CONTRACTDOCUMENT_PAGE_DELETE'),
            }),
            Actions.Item('Download', {
              onClickAsync: () => download(it),
              disabled: !hasAccess('CONTRACTDOCUMENT_PAGE_DOWNLOAD'),
            }),
          ],
        })}
      />
    </Stack>
  );
}
