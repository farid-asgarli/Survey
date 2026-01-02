import { observer } from 'mobx-react-lite';
import { useForm } from 'react-hook-form';
import { Form } from '@src/primitives/Form';
import { pfx } from '@src/utils/pfx';
import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import { commonRules } from '@src/static/input';
import { DefaultFormInputs } from '..';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { useEffect, useRef, useState } from 'react';
import { agent } from '@src/api/agent';
import { DataCategories, useDataContext } from '@src/data/query-manager';

const p = pfx('dialog_segregated_form');

function Create() {
  const searchTimeout = useRef<number | null>(null);
  const qm = useDataContext(DataCategories.Company);

  const { control, handleSubmit } = useForm();
  const [options, setOptions] = useState<Array<Models.EntityOptions>>();

  function onSubmit(values: any) {
    dialog.manageSubmit(() => qm.add(() => agent.Company.Create(values)));
  }

  const { getInput } = useFormInputFactory(control, DefaultFormInputs, { rules: commonRules });

  async function onSearchChange(query: string) {
    clearSearchTimeout();
    searchTimeout.current = window.setTimeout(async () => {
      if (query?.trim()?.length > 2) {
        const results = await agent.EntityOptions.RemoteBanks(query);
        setOptions(results);
      }
    }, 300);
  }

  function clearSearchTimeout() {
    if (searchTimeout.current) {
      window.clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }
  }

  useEffect(() => {
    return () => {
      clearSearchTimeout();
    };
  }, []);

  return (
    <section className={p()}>
      <Form.Wrapper className={p('form')} onSubmit={handleSubmit(onSubmit)}>
        {getInput('companyId', {
          inputProps: {
            searchable: true,
            onSearchChange,
            data: options,
          },
        })}
      </Form.Wrapper>
    </section>
  );
}
export default observer(Create);
