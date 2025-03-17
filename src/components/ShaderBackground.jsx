import React, { useRef, useEffect } from 'react';
import { ShaderBackground as ShaderBackgroundClass } from '../utils/ShaderBackground';
import { SHADER_OPTIONS } from '../utils/ShaderContext';

const ShaderBackground = ({ className, shaderType }) => {
  const canvasRef = useRef(null);
  const shaderRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Force initial dimensions before initialization
    canvas.width = canvas.parentElement.clientWidth || 240;
    canvas.height = canvas.parentElement.clientHeight || 280;
    
    // Initialize shader
    shaderRef.current = new ShaderBackgroundClass(canvas, shaderType);
    
    // Start animation
    shaderRef.current.start();
    
    // Handle resize
    const handleResize = () => {
      if (shaderRef.current && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || 240;
        canvas.height = canvas.parentElement.clientHeight || 280;
        shaderRef.current.resize();
      }
    };
    
    // Initial resize to ensure correct dimensions
    handleResize();
    
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
      if (shaderRef.current) {
        shaderRef.current.stop();
      }
    };
  }, [shaderType]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Allow clicks to pass through
        zIndex: 0,
        borderRadius: '12px',
        display: 'block' // Ensure canvas is block-level
      }}
    />
  );
};

export default ShaderBackground; 