import { DetailedViewGroupProps } from '../../types';
import { Title, Card, Box, Divider } from '@mantine/core';
import { DetailedView } from '../..';
import React from 'react';

export function Group(props: DetailedViewGroupProps) {
  return (
    <Box {...props.rootProps}>
      <Title pl={10} mb={10} fw="light" order={4}>
        {props.title}
      </Title>
      <Card withBorder padding="sm" py={0} radius="lg">
        {props.items.map((item, j) => (
          <React.Fragment key={j}>
            <DetailedView.Item {...item} />
            {j !== props.items.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Card>
    </Box>
  );
}
