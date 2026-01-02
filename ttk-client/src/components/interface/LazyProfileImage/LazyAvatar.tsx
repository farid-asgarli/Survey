import { Avatar, AvatarProps } from '@mantine/core';
import { useTheme } from '@src/hooks/app/use-theme';
import { useStore } from '@src/store';
import { getIf } from '@src/utils/get-if';
import { observer } from 'mobx-react-lite';
import React, { useEffect, useRef, useState } from 'react';

interface LazyAvatarProps {
  username: string;
  avatarProps?: import('@mantine/utils').PolymorphicComponentProps<'div', AvatarProps>;
  userInitials?: string[];
  eagerLoad?: boolean;
}

function LazyAvatar(props: LazyAvatarProps, ref: React.ForwardedRef<HTMLDivElement>) {
  const { profileImages } = useStore();
  const { colors } = useTheme();
  const [imageUrl, setImageUrl] = useState<string>();

  const intersectionRef = useRef<HTMLDivElement | null>(null);

  async function retrieveImage() {
    const result = await profileImages.getOrAdd(props.username);
    if (result) setImageUrl(result);
  }

  useEffect(() => {
    if (props.eagerLoad) {
      retrieveImage();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          retrieveImage();
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (intersectionRef.current) observer.observe(intersectionRef.current);

    return () => observer.disconnect();
  }, [props.username]);

  return (
    <div ref={intersectionRef}>
      <Avatar
        ref={ref}
        color="cyan"
        radius="xl"
        size="lg"
        alt={props.username}
        src={imageUrl}
        {...props.avatarProps}
        styles={{
          root: {
            border: `1px solid ${colors.dataList.bodyRow.border}`,
          },
        }}
      >
        {getIf(!imageUrl, props.userInitials?.map((it) => it[0]).join(''))}
      </Avatar>
    </div>
  );
}

export default observer(React.forwardRef(LazyAvatar));
