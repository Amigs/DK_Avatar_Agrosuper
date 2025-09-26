import { useEffect, useRef } from "react";
import useSize from "./useSize";

const TWO_PI = Math.PI * 2;

export default function WaveFormCircle({ analyzerData }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [width, height] = useSize();

  // 🎨 Paleta de verdes (#91C13B + 3 tonos)
  const palette = ["#e96d19", "#ff944d", "#cc5a0f", "#b34e0d"];

  const drawCircle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Fondo siempre
    ctx.fillStyle = "#0d1b2a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cX = canvas.width / 2;
    const cY = canvas.height / 2;

    if (!analyzerData) {
      // // 👉 Figura por defecto: un círculo central
      // drawIdleWaves(ctx, canvas.width, canvas.height);
      animationRef.current = requestAnimationFrame(drawCircle);
      return;
    }

    const { analyzer, dataArray } = analyzerData;
    analyzer.getByteTimeDomainData(dataArray);

    const radianAdd = TWO_PI / dataArray.length;
    let radian = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i];
      const x = v * Math.cos(radian) + cX;
      const y = v * Math.sin(radian) + cY;

      ctx.beginPath();
      const radius = Math.max(2, v / 64);
      ctx.fillStyle = palette[i % palette.length];
      ctx.arc(x, y, radius, 0, TWO_PI, false);
      ctx.fill();

      radian += radianAdd;
    }

    animationRef.current = requestAnimationFrame(drawCircle);
  };

  // Ajustar tamaño del canvas sin resetear el contexto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height/2;
    }
  }, [width, height]);

  // Loop de animación
  useEffect(() => {
    animationRef.current = requestAnimationFrame(drawCircle);
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyzerData]);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "80%" }}
      />
    </>
  );
}
