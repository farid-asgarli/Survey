import React, { useImperativeHandle } from 'react';
import { useCallback, useRef } from 'react';
import TSParticles, { IParticlesProps } from 'react-tsparticles';
import { loadLinksPreset } from 'tsparticles-preset-links';

export interface ParticlesRef {
  dispose: () => void;
}

interface ParticleProps {
  options?: IParticlesProps['options'];
}

function Particles(props: ParticleProps, ref: React.ForwardedRef<ParticlesRef>) {
  const particlesInit = useCallback(loadLinksPreset, []);

  const particlesRef = useRef<TSParticles | null>(null);

  function dispose() {
    if (particlesRef.current) {
      particlesRef.current.destroy();
      particlesRef.current = null;
    }
  }

  useImperativeHandle(
    ref,
    () => ({
      dispose,
    }),
    []
  );

  return (
    <TSParticles
      ref={particlesRef}
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: false,
        preset: 'links',
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
        ...props.options,
      }}
    />
  );
}
export default React.forwardRef(Particles);
