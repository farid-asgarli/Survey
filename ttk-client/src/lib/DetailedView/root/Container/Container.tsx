import { useState } from 'react';
import { DetailedViewContainerProps } from '../../types';
import { Box, Paper, SegmentedControl, Space } from '@mantine/core';
import React from 'react';
import { DetailedView } from '../..';

export default function Container(props: DetailedViewContainerProps) {
  if (props.groups && props.segments) throw new Error("Either 'groups' or 'segments' can be specified at a time. ");

  const [currentSegment, setCurrentSegment] = useState<string>('0');

  function groupedItems(groups: DetailedViewContainerProps['groups']) {
    return groups?.map(({ items, title }, i) => (
      <DetailedView.Group key={i} title={title} items={items} rootProps={{ mt: i !== 0 ? 20 : undefined }} />
    ));
  }

  function segmentedItems(segments: DetailedViewContainerProps['segments']) {
    return segments?.map((seg, i) => currentSegment === i.toString() && groupedItems(seg.groups));
  }

  return (
    <Paper
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {props.segments && (
        <React.Fragment>
          <SegmentedControl
            onChange={setCurrentSegment}
            color="primary"
            radius="md"
            size="md"
            fullWidth
            data={props.segments.map((it, i) => ({ value: i.toString(), label: it.title }))}
          />

          <Space h="md" />
        </React.Fragment>
      )}
      <Box>
        {props.groups && groupedItems(props.groups)}
        {props.segments && segmentedItems(props.segments)}
      </Box>
    </Paper>
  );
}
