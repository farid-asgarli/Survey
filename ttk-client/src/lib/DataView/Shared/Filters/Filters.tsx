import { useFormInputFactory } from '@src/hooks/app/use-form-input-factory';
import styles from './Filters.module.scss';
import { useForm } from '@src/hooks/app/use-form';
import { Form } from '@src/primitives/Form';
import Card from '@src/primitives/Card/Card';
import { useWatch } from 'react-hook-form';
import { useDebounce } from '@src/hooks/common/use-debounce';
import Button from '@src/components/interface/Button/Button';
import { Icon } from '@src/components/icons';
import { Divider } from '@mantine/core';
import { EmptyStr } from '@src/static/string';
import { DataViewFilterProps, DataViewFilterReference } from '../types';
import React, { useImperativeHandle } from 'react';

function Filters(props: DataViewFilterProps<any>, ref: React.ForwardedRef<DataViewFilterReference>) {
  const formInstance = useForm({ defaultValues: props.defaultFormValues });
  const allFields = useWatch(formInstance) as Record<keyof any, any>;

  useDebounce(allFields, props.debounceDelay, props.onFormValuesChange);

  const { getInputs } = useFormInputFactory(formInstance.control, props.filterInputs ?? {});

  const formInputs = getInputs([], {
    htmlProps: {
      style: {
        marginBottom: 0,
      },
    },
    inputProps: {
      label: undefined,
      variant: 'filled',
    },
  });

  function reset() {
    if (!props.filterInputs) return;
    const fieldsToReset: Record<string, any> = {};

    Object.keys(allFields).forEach((it) => {
      switch (props.filterInputs![it].type) {
        case 'text':
        case 'number':
        case 'textArea':
          fieldsToReset[it] = EmptyStr;
          break;
        default:
          fieldsToReset[it] = null;
          break;
      }
    });

    formInstance.reset(fieldsToReset);
  }

  useImperativeHandle(
    ref,
    () => ({
      reset,
    }),
    [allFields, formInstance]
  );

  if (!props.filterInputs) return null;

  return (
    <Form.Wrapper className={styles['list-filters']} id="filter-form">
      <Card className={styles['filter-wrapper']}>
        <div className={styles['inner']}>
          <div className={styles['input-list']}>{formInputs}</div>
          <Divider orientation="vertical" />
          <div className={styles['utility-list']}>
            <Button loading={props.isLoading} variant="outline" color="gray" onClick={reset} leftIcon={<Icon name="AdjustmentsCancel" />}>
              Sıfırla
            </Button>
          </div>
        </div>
      </Card>
    </Form.Wrapper>
  );
}

export default React.forwardRef(Filters);
