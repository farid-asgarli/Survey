import { useEffect, useState, RefObject } from 'react';

export function useScrollPresence(ref: RefObject<HTMLElement>) {
  const [scrollPresent, setScrollPresent] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setScrollPresent(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [ref]);

  return scrollPresent;
}
