import { useEffect, useRef } from "react";
import { initTHREE } from "./helper";

export default function SSRPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { scene, camera, renderer, controls } = initTHREE();

    function tick(): void {
      renderer.render(scene, camera);
      window.requestAnimationFrame(tick);
    }

    tick();

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    return () => {
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef}></div>;
}
