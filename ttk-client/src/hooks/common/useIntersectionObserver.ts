import { RefObject, useEffect, useState } from 'react';

export default function useIntersectionObserver<T extends Element>(ref: RefObject<T>): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      setIsIntersecting(entry.isIntersecting);
    });

    const element = ref.current;
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [ref]);

  return isIntersecting;
}
