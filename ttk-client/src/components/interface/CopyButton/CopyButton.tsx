import {
  CopyButton as MantineCopyButton,
  Tooltip,
  CopyButtonProps as MantineCopyButtonProps,
  Transition,
  Box,
  BoxProps,
} from '@mantine/core';
import IconButton from '../IconButton/IconButton';
import { Icon } from '@src/components/icons';
import { merge } from '@src/utils/merge';

interface CopyButtonProps extends Omit<MantineCopyButtonProps, 'children'>, BoxProps {
  visible?: boolean;
}

export default function CopyButton({ visible, value, timeout, ...props }: CopyButtonProps) {
  return (
    <Transition mounted={!!visible} transition="pop" duration={200} timingFunction="ease">
      {(style) => (
        <Box {...props} style={merge(props.style, style)}>
          <MantineCopyButton timeout={timeout ?? 2000} value={value}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Kopyalandı!' : 'Kopyala'} withArrow position="right">
                <IconButton color={copied ? 'teal' : 'gray'} onClick={copy}>
                  {copied ? <Icon name="Check" size="1.5rem" /> : <Icon name="Copy" size="1.5rem" />}
                </IconButton>
              </Tooltip>
            )}
          </MantineCopyButton>
        </Box>
      )}
    </Transition>
  );
}
