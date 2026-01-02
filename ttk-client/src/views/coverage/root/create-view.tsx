import { useForm } from '@src/hooks/app/use-form';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { Form } from '@src/primitives/Form';
import { observer } from 'mobx-react-lite';
import { DefaultFormInputs } from '..';
import { commonRules } from '@src/static/input';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';

interface Props {
  remoteCoverages: Models.RemoteCoverage.Item[];
}

function Create(props: Props) {
  const { control, handleSubmit } = useForm();
  const qm = useDataContext(DataCategories.ProductCoverage);

  const { getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  function onSubmit(values: any) {
    dialog.manageSubmit(() => qm.add(() => agent.ProductCoverage.ImportRemoteCoverageList(values)));
  }

  return (
    <Form.Wrapper onSubmit={handleSubmit(onSubmit)}>
      {getInput('remoteCoverageIds', {
        inputProps: {
          data: props.remoteCoverages.map((it) => ({ label: `${it.id}. ${it.name}`, value: it.id })),
        },
      })}
    </Form.Wrapper>
  );
}

export default observer(Create);
