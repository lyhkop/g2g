import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { getProject } from '@theatre/core';

import studio from '@theatre/studio';
import extension from '@theatre/r3f/dist/extension';
import { editable as e, SheetProvider, PerspectiveCamera } from '@theatre/r3f';

const Demo = () => {
  useEffect(() => {
    studio.initialize();
    studio.extend(extension);
  }, []);

  return (
    <Canvas>
      <SheetProvider sheet={getProject('Demo Project').sheet('Demo Sheet')}>
        <PerspectiveCamera
          theatreKey='Camera'
          makeDefault
          position={[5, 5, -5]}
          fov={75}
          attachArray={undefined}
          attachObject={undefined}
          attachFns={undefined}
        />
        <ambientLight />
        <e.pointLight theatreKey='Light' position={[10, 10, 10]} />
        <e.mesh theatreKey='Cube'>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color='orange' />
        </e.mesh>
      </SheetProvider>
    </Canvas>
  );
};

export { Demo };
