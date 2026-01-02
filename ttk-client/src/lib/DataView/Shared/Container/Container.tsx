import { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import styles from './Container.module.scss';
import { Stack } from '@mantine/core';
import { clearEmptyFields } from '@src/utils/formExtensions';
import { DataView } from '../../Shared';
import { DataViewFilterCriteria, DataViewFilterReference, DataViewModel } from '../../Shared/types';
import { hasValue } from '@src/utils/valueCheck';
import { FilterEntryWithBinding } from '@src/lib/data-management/utility/filter-specification';
import { getIf } from '@src/utils/get-if';
import { DEFAULT_PAGE_SIZE } from '@src/lib/data-management/static/pagination-values';
import { DataViewProps } from './Container.props';

export default function DataContainer<TModel extends DataViewModel>(
  props: DataViewProps<TModel> & {
    children?(children: React.ReactNode, handleNextPageRequest: (lastItemIndex: number) => Promise<void>): React.ReactNode;
  }
) {
  const [isFetchingNextPage, setFetchingNextPage] = useState(false);
  const [isLoadingData, setLoadingData] = useState(false);
  const filterRef = useRef<DataViewFilterReference | null>(null);
  const filterEntryEquations = useRef<Record<string, string>>({});

  function getOrAddBinding(binderFieldName: string) {
    if (filterEntryEquations.current[binderFieldName]) return filterEntryEquations.current[binderFieldName];

    const nameArr = binderFieldName.split('~');
    const key = nameArr[0];

    filterEntryEquations.current[binderFieldName] = key;
    return key;
  }

  const handleFormValuesChange = useCallback(
    async (values) => {
      try {
        setLoadingData(true);
        const dirtyFields = clearEmptyFields(values);
        const filterEntries: DataViewFilterCriteria<TModel> = [];
        for (const key in dirtyFields) {
          const binding = getOrAddBinding(key);
          filterEntries.push(
            new FilterEntryWithBinding<any>({
              eq: props.filtering?.inputs?.[key]?.eq,
              key: filterEntryEquations.current[key],
              value: dirtyFields[key],
              binder: getIf(binding !== key, binding),
            })
          );
        }

        await props.onFilterChange?.(filterEntries);
      } finally {
        setLoadingData(false);
      }
    },
    [props.onFilterChange]
  );

  async function handleNextPageRequest(lastItemIndex: number) {
    if (!props.onNextPageLoad || (props.totalCount && props.data && props.data.length >= props.totalCount)) return;

    const nextPage = Math.ceil(lastItemIndex / (props.pageSize ?? DEFAULT_PAGE_SIZE)) + 1;

    setFetchingNextPage(true);

    try {
      await props.onNextPageLoad(nextPage);
    } finally {
      setFetchingNextPage(false);
    }
  }
  const hasFilters = useMemo(
    () => props.filtering?.defaultValues && Object.values(props.filtering.defaultValues).some(hasValue),
    [props.filtering?.defaultValues]
  );

  return (
    <Stack spacing={5} className={styles['data-view_container']}>
      <DataView.Filters
        isLoading={isLoadingData || props.isLoading}
        debounceDelay={300}
        filterInputs={props.filtering?.inputs}
        defaultFormValues={props.filtering?.defaultValues}
        onFormValuesChange={handleFormValuesChange}
        ref={filterRef}
      />
      <DataView.UtilityBar dataCount={props.totalCount} right={props.utilitySection} />
      <div className={styles.list}>
        {props.children?.(
          <Fragment>
            <DataView.NoResult
              resetFilters={hasFilters ? filterRef.current?.reset : undefined}
              visible={!props.isLoading && !isLoadingData && props.data?.length === 0}
            />
            <DataView.LoadingOverlay visible={props.isLoading || isLoadingData} />
          </Fragment>,
          handleNextPageRequest
        )}
        <DataView.ScrollEndLoader visible={isFetchingNextPage} />
      </div>
    </Stack>
  );
}
