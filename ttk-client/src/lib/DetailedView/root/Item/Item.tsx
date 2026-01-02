import { Card, Group, Stack, Text } from '@mantine/core';
import { DetailedViewItemProps } from '../../types';
import CopyButton from '@src/components/interface/CopyButton/CopyButton';
import { useState } from 'react';

export default function Item(props: DetailedViewItemProps) {
  const [copyButtonVisible, setCopyButtonVisible] = useState(false);
  return (
    <Card.Section
      onMouseLeave={() => setCopyButtonVisible(false)}
      onMouseEnter={() => setCopyButtonVisible(true)}
      inheritPadding
      py="xs"
      {...props.rootProps}
    >
      <Group position="apart" pr={20}>
        <Stack spacing={0}>
          {props.title && (
            <Text
              sx={({ colors }) => ({
                color: colors.gray[6],
              })}
              fw="bolder"
              fz="sm"
            >
              {props.title}
            </Text>
          )}
          {props.value && <Text fz="md">{props.value ?? '-'}</Text>}
        </Stack>
        {props.value && <CopyButton pos={'absolute'} right={10} visible={copyButtonVisible} value={props.value as string} />}
      </Group>
    </Card.Section>
  );
}
