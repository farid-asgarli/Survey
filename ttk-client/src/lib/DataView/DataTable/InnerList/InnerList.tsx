import { Virtuoso } from 'react-virtuoso';
import { DataViewModel } from '../../Shared/types';
import { DataTableContainerProps } from '../types';
import { Box, Group, Menu, useMantineTheme, Text } from '@mantine/core';
import BodyCell from '../BodyCell/BodyCell';
import HeaderRow from '../HeaderRow/HeaderRow';
import HeaderCell from '../HeaderCell/HeaderCell';
import BodyRow from '../BodyRow/BodyRow';
import HeaderItem from '../HeaderItem/HeaderItem';
import IconButton from '@src/components/interface/IconButton/IconButton';
import { Icon } from '@src/components/icons';
import styles from './InnerList.module.scss';
import Root from '../Root/Root';
import { useImperativeHandle, useRef } from 'react';

interface InnerListProps<TData extends DataViewModel>
  extends Pick<DataTableContainerProps<TData>, 'header' | 'data' | 'renderListItem' | 'actions' | 'actionsPlacement'> {
  handleNextPageRequest(lastItemIndex: number): Promise<void>;
  children?: React.ReactNode;
  listScrollRef?: React.ForwardedRef<{
    resetScrollPosition: () => void;
  }>;
}

const minWidth = '50px';

function InnerList<TData extends DataViewModel>(props: InnerListProps<TData>) {
  const theme = useMantineTheme();
  const scrollerRef = useRef<HTMLElement | Window | null>();
  const gridTemplate = `280px 270px repeat(${props.header.length - 2}, minmax(${minWidth}, 1fr)) ${
    props.actions ? (props.actionsPlacement === 'plain' ? '150px' : '60px') : ''
  }`;

  function resetScrollPosition() {
    scrollerRef.current?.scrollTo({
      behavior: 'smooth',
      top: 0,
    });
  }

  useImperativeHandle(
    props.listScrollRef,
    () => ({
      resetScrollPosition,
    }),
    []
  );

  const ThreeDotsMenu = ({ item }: { item: TData }) => (
    <Menu
      styles={{
        itemLabel: {
          color: theme.colorScheme === 'dark' ? theme.colors.gray[2] : theme.colors.dark[3],
        },
        dropdown: {
          minWidth: 200,
        },
      }}
      shadow="md"
      // width={200}
      radius="md"
      transitionProps={{ transition: 'pop' }}
    >
      <Menu.Target>
        <IconButton>
          <Icon name="DotsVertical" />
        </IconButton>
      </Menu.Target>

      <Menu.Dropdown>
        {props.actions?.(item).map((it, i) => (
          <Menu.Item key={i} disabled={it.disabled} color={it.color} onClick={it.onClick ?? it.onClickAsync} icon={<Icon name={it.icon} />}>
            <Text fw={500}>{it.label}</Text>
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );

  const PlainMenu = ({ item }: { item: TData }) => (
    <Group position="center">
      {props.actions?.(item).map(({ icon, label, ...it }, i) => (
        <IconButton key={i} title={label} variant="light" size="lg" {...it}>
          <Icon name={icon} />
        </IconButton>
      ))}
    </Group>
  );

  return (
    <Root className={styles['data-table_inner-list']}>
      <HeaderItem>
        <HeaderRow
          style={{
            gridTemplateColumns: gridTemplate,
            width: 'calc(100% - 20px)',
          }}
        >
          {props.header.map((it, index) => (
            <HeaderCell key={index} children={it.title} />
          ))}
          {props.actions && <HeaderCell />}
        </HeaderRow>
      </HeaderItem>
      <Box className={styles['inner-body']}>
        {props.data && (
          <Virtuoso
            data={props.data}
            scrollerRef={(ref) => (scrollerRef.current = ref)}
            computeItemKey={(index) => props.data![index].id}
            itemContent={(_, item) => {
              const { items, onClick } = props.renderListItem(item);
              return (
                <BodyRow
                  key={item.id}
                  style={{
                    gridTemplateColumns: gridTemplate,
                    marginBottom: 2,
                  }}
                  className={styles['list-item']}
                  onClick={(e) => onClick?.(e, item)}
                >
                  {items.map((it, index) => (
                    <BodyCell key={index}>{it.value}</BodyCell>
                  ))}
                  {props.actions && (
                    <BodyCell
                      style={{
                        borderTopRightRadius: theme.radius.md,
                        borderBottomRightRadius: theme.radius.md,
                        padding: 0,
                      }}
                      className={styles['actions']}
                    >
                      {props.actionsPlacement === 'plain' ? <PlainMenu item={item} /> : <ThreeDotsMenu item={item} />}
                    </BodyCell>
                  )}
                </BodyRow>
              );
            }}
            endReached={props.handleNextPageRequest}
            totalCount={props.data.length}
            overscan={5}
          />
        )}
        {props.children}
      </Box>
    </Root>
  );
}

export default InnerList;
