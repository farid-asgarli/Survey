import { useForm } from '@src/hooks/app/use-form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { DefaultFormInputs } from '..';
import { pfx } from '@src/utils/pfx';
import { Form } from '@src/primitives/Form';
import { commonRules } from '@src/static/input';
import { FileFns } from '@src/utils/fileFns';
import { Notifications } from '@src/utils/notification';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { agent } from '@src/api/agent';

const p = pfx('dialog_segregated_form');
const maxFileSizeInMb = 5;

export default function Create({ contractId, reloadDocuments }: { contractId: number; reloadDocuments: () => Promise<void> }) {
  const { control, handleSubmit } = useForm();

  const { getInputs } = useFormInputFactory(control, DefaultFormInputs, {
    rules: commonRules,
  });

  async function onSubmit(values) {
    const fileSize = values.documentFile.size / (1024 * 1024);
    if (fileSize > maxFileSizeInMb) {
      Notifications.warning(`Maksimum fayl ölçüsü ${maxFileSizeInMb}MB-dır`);
      return;
    }
    const convertedFile = await FileFns.fileToBase64(values.documentFile);

    if (convertedFile) {
      await dialog.manageSubmit(() =>
        agent.ContractDocument.Upload({
          contractDocumentType: values.contractDocumentType,
          contractId,
          fileProperties: {
            fileContent: convertedFile.toString(),
            fileName: values.documentFile.name,
          },
          note: values.note,
        })
      );
      await reloadDocuments();
    }
  }

  return (
    <section>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        {getInputs()}
      </Form.Wrapper>
    </section>
  );
}
