import React, { createContext, useState, useContext } from 'react';

// Define shader options
export const SHADER_OPTIONS = {
  NONE: 'none',
  WAVE_GRADIENT: 'wave-gradient',
  PLASMA: 'plasma',
  FRACTAL: 'fractal',
  NOISE: 'noise',
  FIRE: 'fire',
  MATRIX: 'matrix'
};

const ShaderContext = createContext();

export const ShaderProvider = ({ children }) => {
  const [activeShader, setActiveShader] = useState(SHADER_OPTIONS.NONE);

  const changeShader = (shaderType) => {
    setActiveShader(shaderType);
  };

  return (
    <ShaderContext.Provider value={{ 
      activeShader, 
      changeShader,
      shaderEnabled: activeShader !== SHADER_OPTIONS.NONE
    }}>
      {children}
    </ShaderContext.Provider>
  );
};

export const useShader = () => useContext(ShaderContext); 