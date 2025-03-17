import React, { useState } from 'react';
import { useShader, SHADER_OPTIONS } from '../utils/ShaderContext';
import './ShaderToggle.css';

const ShaderSelector = () => {
  const { activeShader, changeShader } = useShader();
  const [isOpen, setIsOpen] = useState(false);

  const shaderLabels = {
    [SHADER_OPTIONS.NONE]: 'No Shader',
    [SHADER_OPTIONS.WAVE_GRADIENT]: 'Wave Gradient',
    [SHADER_OPTIONS.PLASMA]: 'Plasma',
    [SHADER_OPTIONS.FRACTAL]: 'Fractal',
    [SHADER_OPTIONS.NOISE]: 'Noise',
    [SHADER_OPTIONS.FIRE]: 'Fire',
    [SHADER_OPTIONS.MATRIX]: 'Matrix'
  };

  const handleSelect = (shader) => {
    changeShader(shader);
    setIsOpen(false);
  };

  return (
    <div className="shader-selector-container">
      <div className="shader-selector">
        <button 
          className={`shader-selector-current ${activeShader !== SHADER_OPTIONS.NONE ? 'active' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          {shaderLabels[activeShader]} {isOpen ? '▲' : '▼'}
        </button>
        
        {isOpen && (
          <div className="shader-selector-dropdown">
            {Object.values(SHADER_OPTIONS).map(shader => (
              <div 
                key={shader}
                className={`shader-option ${activeShader === shader ? 'selected' : ''}`}
                onClick={() => handleSelect(shader)}
              >
                {shaderLabels[shader]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShaderSelector; 