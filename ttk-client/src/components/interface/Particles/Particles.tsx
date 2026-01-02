import { cssVar } from '@src/utils/css';
import { useCallback, useEffect, useRef } from 'react';
import TSParticles from 'react-tsparticles';
import { loadLinksPreset } from 'tsparticles-preset-links';

export function Particles() {
  const particlesInit = useCallback(loadLinksPreset, []);

  const particlesRef = useRef<TSParticles | null>(null);

  useEffect(() => {
    return () => {
      if (particlesRef.current) {
        particlesRef.current.destroy();
        particlesRef.current = null;
      }
    };
  }, []);

  return (
    <TSParticles
      ref={particlesRef}
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: false,
        preset: 'links',
        background: {
          color: {
            value: cssVar('color-primary'),
          },
        },
        particles: {
          color: {
            value: '#ffffff',
          },
          links: {
            color: '#ffffff',
            distance: 100,
            enable: true,
            opacity: 0.5,
            width: 1,
          },
          move: {
            direction: 'none',
            enable: true,
            outModes: {
              default: 'bounce',
            },
            random: false,
            speed: 2,
            straight: false,
          },
          number: {
            value: 80,
          },
          opacity: {
            value: 0.5,
          },
          shape: {
            type: 'circle',
          },
          size: {
            value: { min: 1, max: 5 },
          },
        },
      }}
    />
  );
}
