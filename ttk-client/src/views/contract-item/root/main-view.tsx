/* eslint-disable react/jsx-pascal-case */
import { CommonButtons } from '@src/static/buttons';
import { formatDate } from '@src/utils/dateFormat';
import { t } from '@src/utils/locale';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { agent } from '@src/api/agent';
import { States } from '@src/static/entities/states';
import { Actions } from '@src/static/actions';
import { drawer } from '@src/components/interface/Drawer/Drawer';
import { cssVar } from '@src/utils/css';
import { Icon } from '@src/components/icons';
import { dialog } from '@src/components/interface/Dialog/Dialog';
import { Currencies } from '@src/static/entities/currency-type';
import { pdfViewer } from '@src/components/interface/PdfViewer/PdfViewer';
import { AddendumTypeOptions, AddendumTypes } from '@src/static/entities/addendum-types';
import { modals } from '@mantine/modals';
import { router } from '@src/configs/routing/RoutingProvider';
import { Notifications } from '@src/utils/notification';
import { DevContractView } from '@src/_dev/views/Contract';
import { DevAddendumView } from '@src/_dev/views/Addendum';
import Environment from '@src/static/env';
import { DataViewFilterCriteria } from '@src/lib/DataView/Shared/types';
import ContractDetails from './details-view';
import ContractTerminationDetails from './termination-details-view';
import { hasAccess } from '@src/utils/access-management';
import { DataCategories } from '@src/data/query-manager';
import { useBindQueryManager } from '@src/data/use-bind-query-manager';
import { InitDataViewTabularList } from '@src/lib/data-management/tools/data-view-factory';
import { Badge, CopyButton, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import StatusBadge, { assignAddendumStateColor, assignStateColor } from '@src/components/interface/StatusBadge/StatusBadge';
import { FilterEntryWithBinding } from '@src/lib/data-management/utility/filter-specification';
import { FilterEquations } from '@src/lib/data-management/utility/filter-equations';

const contractNumberFilterField = 'cn';

function Main() {
  const theme = useMantineTheme();

  const qm = useBindQueryManager(DataCategories.ContractItem);

  async function viewDetails(data: Models.ContractItem.ViewModel) {
    const res = await agent.ContractItem.Details(data.id);
    drawer.open({
      body: <ContractDetails entityDetails={res} />,
      title: (
        <Group spacing="xs">
          <Icon size="1.3rem" color={cssVar('color-primary')} name="Contract" />
          <Text>Müqaviləyə baxış</Text>
        </Group>
      ),
    });
  }

  async function terminationDetails(data: Models.ContractItem.ViewModel, isOnInsurersDemand: boolean) {
    const res = await agent.ContractItem.TerminationDetails({
      contractId: data.id,
      terminationDate: new Date(),
      isOnInsurersDemand,
    });

    dialog.open({
      body: <ContractTerminationDetails entityDetails={res} isOnInsurersDemand={isOnInsurersDemand} />,
      title: `Xitam - ${data.contractNumberFull}`,
      okButtonLabel: 'Təsdiqlə',
      okButtonProps: {
        color: 'red',
      },
    });
  }

  async function print(data: Models.ContractItem.ViewModel) {
    const res = await agent.Report.GetReport(data.id);
    pdfViewer.open({
      title: `Müqavilə - ${data.contractNumberFull}`,
      content: res,
    });
  }

  async function cancelContract(data: Models.ContractItem.ViewModel) {
    modals.openConfirmModal({
      withCloseButton: false,
      centered: true,
      children: (
        <Text size="sm">
          <strong>{'Ləğv əməliyyatı'}</strong>
          <Text
            sx={({ colors, colorScheme }) => ({
              color: colorScheme === 'light' ? colors.gray[7] : colors.gray[5],
            })}
            size="sm"
            mt={20}
          >
            {data.contractNumberFull} nömrəli müqaviləni ləğv etməyə əminsinizmi?
          </Text>
        </Text>
      ),

      labels: { confirm: 'Bəli', cancel: 'Xeyr' },
      confirmProps: { color: 'red', leftIcon: React.createElement(Icon, { name: 'SquareRounded' }) },
      cancelProps: { leftIcon: React.createElement(Icon, { name: 'Close' }) },
      onConfirm: async () => {
        await agent.ContractItem.Cancel(data.id);
        await qm.fetchReload();
      },
    });
  }

  function displayCreateDialog() {
    dialog.open({ title: 'Yeni müqavilə', body: <DevContractView.Create createFetchReload={() => qm.fetchReload()} /> });
  }
  function displayNewCreateDialog() {
    dialog.open({ title: 'Yeni Əlavə', body: <DevAddendumView.Addendum addendumFetchReload={() => qm.fetchReload()} /> });
  }

  function convertToFullYear(num: number) {
    if (num < 100) return parseInt('20' + num.toString().padStart(2, '0'));

    return num;
  }

  async function onFilterUpdate(filters: DataViewFilterCriteria<Models.ContractItem.ViewModel>) {
    let filterCopy = [...filters];

    const contractNumber = filterCopy.find((it) => it.key === contractNumberFilterField)?.value;

    if (contractNumber) {
      const contractNumberSplitArr = contractNumber.split('/');
      if (contractNumberSplitArr.length > 0) {
        const contractNumSegment = contractNumberSplitArr[0];

        const contractNumberParsed = Number(contractNumSegment);

        if (contractNumberParsed) filterCopy.push(new FilterEntryWithBinding({ key: 'contractNumber', value: contractNumberParsed }));

        const rightSegment = contractNumberSplitArr[1];
        if (rightSegment) {
          const rightSegmentSplitArr = rightSegment.split('-');

          if (rightSegmentSplitArr.length > 0) {
            const contractYearSegment = rightSegmentSplitArr[0];

            const contractYearParsed = Number(contractYearSegment);

            if (contractYearParsed)
              filterCopy.push(new FilterEntryWithBinding({ key: 'contractYear', value: convertToFullYear(contractYearParsed) }));

            const addendumSegment = rightSegmentSplitArr[1];

            if (addendumSegment) {
              const parsedAddendumNum = Number(addendumSegment);
              if (parsedAddendumNum) filterCopy.push(new FilterEntryWithBinding({ key: 'addendumNumber', value: parsedAddendumNum }));
            }
          }
        }
      }
      filterCopy = filterCopy.filter((it) => it.key !== contractNumberFilterField);
    }

    await qm.fetchFilters(filterCopy);
  }

  // function generateDefaultValues() {
  //   const defaultValues = InitDataViewTabularList.prepareDefaultValues(qm);

  //   if (defaultValues.contractNumber || defaultValues.contractYear || defaultValues.addendumNumber)
  //     defaultValues[contractNumberFilterField] = `${defaultValues.contractNumber ?? ''}/${defaultValues.contractYear ?? ''}-${
  //       defaultValues.addendumNumber ?? ''
  //     }`;

  //   console.log('defaultValues', defaultValues);

  //   return defaultValues;
  // }

  return new InitDataViewTabularList<Models.ContractItem.ViewModel>()
    .withQMBindings(qm)
    .withFiltering({
      inputs: {
        [contractNumberFilterField]: {
          type: 'text',
          label: t('ContractNumber'),
          icon: 'Hash',
        },
        customerFullName: {
          type: 'text',
          label: t('Customer'),
          icon: 'User',
          eq: FilterEquations.CONTAINS,
        },
        customerPinCode: {
          type: 'text',
          label: t('PinCode'),
          icon: 'IdBadge',
          eq: FilterEquations.CONTAINS,
        },
        'contractDate~1': {
          type: 'date',
          label: t('ContractBeginDate'),
          icon: 'CalendarTime',
          eq: FilterEquations.BIGGER_EQUALS,
        },
        'contractDate~2': {
          type: 'date',
          label: t('ContractEndDate'),
          icon: 'CalendarTime',
          eq: FilterEquations.SMALLER_EQUALS,
        },
        addendumType: {
          type: 'select',
          label: 'Müqavilə statusu',
          inputProps: { data: AddendumTypeOptions },
          icon: 'ChartArcs',
        },
      },
      onFilterChange: onFilterUpdate,
      // defaultValues: generateDefaultValues(),
    })
    .withUiElements({
      utilitySection: (
        <Group noWrap>
          <CommonButtons.Reload onClickAsync={() => qm.fetchReload()} />
          {Environment.MODE !== 'production' && (
            <>
              <CommonButtons.New onClick={displayCreateDialog}>Yeni Müqavilə</CommonButtons.New>
              <CommonButtons.New onClick={displayNewCreateDialog}>Yeni Əlavə</CommonButtons.New>
            </>
          )}
        </Group>
      ),
    })
    .withListItem((it) => {
      const contractDate = formatDate(it.contractDate);
      return {
        items: [
          {
            value: (
              <Group align="flex-start" spacing="xs">
                <Stack>
                  <CopyButton value={it.contractNumberFull}>
                    {({ copied, copy }) => {
                      if (copied) Notifications.success('Müqavilə nömrəsi panoya kopyalandı');
                      return (
                        <Title sx={{ cursor: 'pointer' }} fz="1.125rem" onClick={copy}>
                          {it.contractNumberFull}
                        </Title>
                      );
                    }}
                  </CopyButton>

                  <Stack>
                    <Group spacing="5px">
                      <Badge
                        color="gray"
                        radius="md"
                        title={`${t('ContractDate')}: ${contractDate}`}
                        styles={{
                          root: {
                            background: theme.colorScheme === 'light' ? theme.colors.gray[2] : undefined,
                            width: 'min-content',
                          },
                          inner: {
                            color: theme.colorScheme === 'light' ? theme.colors.gray[6] : undefined,
                          },
                        }}
                        variant="filled"
                      >
                        {formatDate(contractDate, true)}
                      </Badge>
                      {it.state !== States.Aktiv && <StatusBadge colorFn={assignStateColor} states={States} value={it.state} />}
                      {it.addendumType !== AddendumTypes.Yoxdur && (
                        <StatusBadge colorFn={assignAddendumStateColor} states={AddendumTypes} value={it.addendumType} />
                      )}
                    </Group>
                  </Stack>
                </Stack>
              </Group>
            ),
          },
          {
            value: it.customerFullName,
          },
          {
            value: it.customerPinCode,
          },
          // {
          //   value: it.companyName,
          // },
          {
            value: `${it.insuranceFee} ${Currencies[it.currencyId]}`,
          },
          {
            value: `${it.trancheAmount} ${Currencies[it.currencyId]}`,
          },
          {
            value: formatDate(it.contractBeginDate, true),
          },
          {
            value: formatDate(it.contractEndDate, true),
          },
        ],
      };
      // onClick: (e, dat) => {
      //   e.stopPropagation();

      //   viewDetails(dat);
      // },
    })
    .withContextMenu({
      actionsPlacement: 'menu',
      actions: (it) => [
        Actions.Item('View', {
          onClickAsync: () => viewDetails(it),
          disabled: !hasAccess('COMMONACTIONS_VIEW_CONTRACT'),
        }),
        Actions.Item('Print', {
          onClickAsync: () => print(it),
          disabled: it.addendumType === AddendumTypes.Ləğv || !hasAccess('COMMONACTIONS_PRINT_CONTRACT'),
        }),
        Actions.Item('Documents', {
          onClick: () => router.navigate(`/contract/documents/${it.id}`),
          disabled: !hasAccess('CONTRACTDOCUMENT_PAGE_VIEW'),
        }),
        Actions.Item('Cancel', {
          onClick: () => cancelContract(it),
          disabled: it.state === States.Deaktiv || !hasAccess('COMMONACTIONS_CANCEL_CONTRACT'),
        }),
        Actions.Item('TerminateOnCustomerDemand', {
          onClick: () => terminationDetails(it, false),
          disabled: it.state === States.Deaktiv || !hasAccess('COMMONACTIONS_TERMINATE_CONTRACT'),
        }),
        Actions.Item('TerminateOnCompanyDemand', {
          onClick: () => terminationDetails(it, true),
          disabled: it.state === States.Deaktiv || !hasAccess('COMMONACTIONS_TERMINATE_CONTRACT'),
        }),
      ],
    })
    .withHeader([
      {
        title: t('ContractNumber'),
      },
      {
        title: t('FirstName'),
      },
      {
        title: t('PinCode'),
      },
      // {
      //   title: t('CompanyItem'),
      // },
      {
        title: t('InsuranceCost'),
      },
      {
        title: t('TrancheAmount'),
      },
      {
        title: t('ContractBeginDate'),
      },
      {
        title: t('ContractEndDate'),
      },
    ])
    .render();
}

export default observer(Main);
