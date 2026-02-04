
import React, { useEffect, useRef, useState } from 'react';
import { WheelOption } from '../types';

interface WheelProps {
  options: WheelOption[];
  isSpinning: boolean;
  onSpinComplete: (option: WheelOption) => void;
  targetRotation: number;
}

const Wheel: React.FC<WheelProps> = ({ options, isSpinning, onSpinComplete, targetRotation }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentRotation, setCurrentRotation] = useState(0);
  // Fix: Provide initial value for useRef to satisfy TypeScript requirements
  const animationRef = useRef<number | undefined>(undefined);

  const drawWheel = (rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = size / 2 - 20;
    const sliceAngle = (2 * Math.PI) / options.length;

    ctx.clearRect(0, 0, size, size);

    // Draw slices
    options.forEach((option, i) => {
      const startAngle = i * sliceAngle + rotation;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.fillStyle = option.color;
      ctx.fill();
      
      // Thin separator
      ctx.strokeStyle = '#2d4a3e';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      
      // Contrast check for text color
      const color = option.color.toLowerCase();
      ctx.fillStyle = (color === '#ffffff' || color === '#e5e7eb') ? '#2d4a3e' : 'white';
      
      ctx.font = 'bold 18px "Plus Jakarta Sans"';
      ctx.fillText(option.label.toUpperCase(), radius - 40, 6);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(center, center, radius + 5, 0, 2 * Math.PI);
    ctx.strokeStyle = '#ffffff22';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center, center, radius + 15, 0, 2 * Math.PI);
    ctx.strokeStyle = '#cc993333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#2d4a3e';
    ctx.fill();
    ctx.strokeStyle = '#cc9933';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Tiny center dot
    ctx.beginPath();
    ctx.arc(center, center, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#cc9933';
    ctx.fill();
  };

  useEffect(() => {
    drawWheel(currentRotation);
  }, [options, currentRotation]);

  useEffect(() => {
    if (isSpinning) {
      const startTime = performance.now();
      const duration = 5000; 
      const startRotation = currentRotation;

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom cubic-bezier like ease-out
        const t = progress;
        const easeOut = 1 - Math.pow(1 - t, 4);
        const currentRot = startRotation + targetRotation * easeOut;
        
        setCurrentRotation(currentRot);
        drawWheel(currentRot);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          const finalRotationNormalized = (currentRot % (2 * Math.PI));
          const sliceAngle = (2 * Math.PI) / options.length;
          const pointerPos = (2 * Math.PI - finalRotationNormalized) % (2 * Math.PI);
          const index = Math.floor(pointerPos / sliceAngle);
          onSpinComplete(options[index]);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isSpinning, targetRotation, options, onSpinComplete]);

  return (
    <div className="relative group">
      {/* Indicator Pointer at Right */}
      <div className="absolute top-1/2 -right-6 -translate-y-1/2 z-10">
        <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[35px] border-r-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"></div>
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="max-w-full aspect-square drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)] rounded-full transition-transform duration-700"
      />
    </div>
  );
};

export default Wheel;