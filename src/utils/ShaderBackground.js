// file: src/utils/ShaderBackground.js
import { SHADER_OPTIONS } from './ShaderContext';

export class ShaderBackground {
  constructor(canvas, shaderType) {
    this.canvas = canvas;
    this.shaderType = shaderType || SHADER_OPTIONS.WAVE_GRADIENT;
    
    // Create WebGL context with proper alpha settings
    this.gl = canvas.getContext('webgl', { 
      premultipliedAlpha: false,
      alpha: true,
      preserveDrawingBuffer: true,
      antialias: true
    }) || canvas.getContext('experimental-webgl', { 
      premultipliedAlpha: false,
      alpha: true,
      preserveDrawingBuffer: true,
      antialias: true
    });
    
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }
    
    // Set viewport immediately to match canvas size
    this.gl.viewport(0, 0, canvas.width, canvas.height);
    
    this.initShaders();
    this.initBuffers();
    this.startTime = Date.now();
    this.running = false;
  }
  
  initShaders() {
    // Vertex shader program - same for all shaders
    const vsSource = `
      attribute vec4 aVertexPosition;
      attribute vec2 aTextureCoord;
      
      varying highp vec2 vTextureCoord;
      
      void main(void) {
        gl_Position = aVertexPosition;
        vTextureCoord = aTextureCoord;
      }
    `;
    
    // Get the appropriate fragment shader based on the shader type
    const fsSource = this.getFragmentShader();
    
    // Initialize shader program
    const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
    
    this.shaderProgram = this.gl.createProgram();
    this.gl.attachShader(this.shaderProgram, vertexShader);
    this.gl.attachShader(this.shaderProgram, fragmentShader);
    this.gl.linkProgram(this.shaderProgram);
    
    if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
      return;
    }
    
    this.programInfo = {
      program: this.shaderProgram,
      attribLocations: {
        vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
        textureCoord: this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord'),
      },
      uniformLocations: {
        iTime: this.gl.getUniformLocation(this.shaderProgram, 'iTime'),
        iResolution: this.gl.getUniformLocation(this.shaderProgram, 'iResolution'),
      },
    };
  }
  
  getFragmentShader() {
    // Original Wave Gradient shader
    if (this.shaderType === SHADER_OPTIONS.WAVE_GRADIENT) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        float mygradient(float x) {
          float x2 = fract(x);
          if (x2 > .5) {
            x2 = .5 - (x2-.5);
          }
          
          x2 = (1. - sqrt(sqrt(sqrt(x2*2.))))*1.8;
          if (x2 > 1.) { return 1.; }
          return x2;
        }
        
        vec2 warpCoords(vec2 coords, float a, float aspect) {
          vec2 uv = vec2(coords);
          uv.x *= aspect;
          float d = distance(uv, vec2(0.5*aspect,0.5));
          uv.y = d*uv.y;
          uv.x = d*uv.x;
          
          float oldX = (2.*(uv.x -.5));
          float oldY = (2.*(uv.y -.5));
          uv.x = sin(a) * oldX + cos(a) * oldY;
          uv.y = cos(a) * oldX - sin(a) * oldY;
          uv.x *= .5;
          uv.x += .5;
          uv.y *= .5;
          uv.y += .5;
          
          uv.x /= aspect;
          return uv;
        }
        
        void main() {
          vec2 uv0 = vTextureCoord;
          float aspect = iResolution.x / iResolution.y;
          
          vec4 currentColor, nextColor, finalColor;
          
          vec2 uv;
          vec2 uv2;
          
          uv = warpCoords(uv0, sin(iTime*.5), aspect);
          uv.x += sin(iTime*.01)*.1;
          
          uv2 = warpCoords(uv0, sin(iTime*.15), aspect);
          uv2.x += sin(iTime*.02)*.1;
          
          float rBarSize = uv.y * 40.0 * (cos(iTime*.1) * 10.);  
          float wave = sin(uv.x * 10.0) * 1.0;
          
          float rBarSize2 = uv2.x * 40.0;  
          float wave2 = sin(uv2.y * 10.0) * 1.0;
          
          float rBarSize3 = uv.y * 40.0;  
          float wave3 = 0.;
          
          float v = 0.0;
          if (mygradient(rBarSize/50. + iTime/5. + wave) > .1 &&
              mygradient(rBarSize2/15. + iTime/5. + wave2) > .2 &&
              mygradient(rBarSize3/25. + iTime/4. + wave3) > .0) {
            v = 1.0;
          }
          
          float mod = (uv0.y/2.) + .5;
          
          v = v * abs(tan(iTime * .01 + mod*480.));
          v = v * 0.7;      
          
          float r = v;
          
          v = mygradient(rBarSize2/15. + iTime/5. + wave2);
          float g = v;
          
          v = v * abs(tan(iTime * 14.8 + mod*180.));
          v = v * 0.7;      
          float b = v;
          
          // Add a base color to make it brighter
          r = min(1.0, r + 0.1);
          g = min(1.0, g + 0.1);
          b = min(1.0, b + 0.1);
          
          // Increase overall brightness
          r = pow(r, 0.8);
          g = pow(g, 0.8);
          b = pow(b, 0.8);
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `;
    }
    
    // Plasma shader
    else if (this.shaderType === SHADER_OPTIONS.PLASMA) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        void main() {
          vec2 uv = vTextureCoord;
          float time = iTime * 0.5;
          
          // Generate plasma effect
          float v1 = sin((uv.x * 10.0) + time);
          float v2 = sin((uv.y * 10.0) + time);
          float v3 = sin((uv.x * 5.0) + (uv.y * 5.0) + time);
          float v4 = sin(sqrt(pow(uv.x - 0.5, 2.0) + pow(uv.y - 0.5, 2.0)) * 10.0 + time);
          
          float plasma = (v1 + v2 + v3 + v4) * 0.25;
          
          // Create color mapping
          float r = sin(plasma * 3.14159 + time) * 0.5 + 0.5;
          float g = sin(plasma * 3.14159 + time + 2.094) * 0.5 + 0.5;
          float b = sin(plasma * 3.14159 + time + 4.188) * 0.5 + 0.5;
          
          gl_FragColor = vec4(r, g, b, 1.0);
        }
      `;
    }
    
    // Fractal shader
    else if (this.shaderType === SHADER_OPTIONS.FRACTAL) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        void main() {
          vec2 uv = vTextureCoord;
          float time = iTime * 0.2;
          
          // Map UV to complex plane
          vec2 c = vec2(
            uv.x * 3.0 - 2.0 + sin(time * 0.1) * 0.5,
            uv.y * 3.0 - 1.5 + cos(time * 0.1) * 0.5
          );
          
          // Julia set parameters
          vec2 z = vec2(
            sin(time * 0.3) * 0.7,
            cos(time * 0.3) * 0.7
          );
          
          float iter = 0.0;
          const float maxIter = 100.0;
          
          // Julia set iteration
          for (float i = 0.0; i < maxIter; i++) {
            // z = z^2 + c
            float zr = z.x * z.x - z.y * z.y + c.x;
            float zi = 2.0 * z.x * z.y + c.y;
            
            z.x = zr;
            z.y = zi;
            
            if (length(z) > 2.0) break;
            iter++;
          }
          
          // Normalize and create color
          float t = iter / maxIter;
          
          vec3 color = vec3(
            0.5 + 0.5 * sin(t * 3.14159 + time),
            0.5 + 0.5 * sin(t * 3.14159 + time + 2.094),
            0.5 + 0.5 * sin(t * 3.14159 + time + 4.188)
          );
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;
    }
    
    // Noise shader
    else if (this.shaderType === SHADER_OPTIONS.NOISE) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        // Pseudo-random function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        // 2D noise function
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          // Smooth interpolation
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) +
                 (c - a) * u.y * (1.0 - u.x) +
                 (d - b) * u.x * u.y;
        }
        
        void main() {
          vec2 uv = vTextureCoord;
          float time = iTime * 0.5;
          
          // Create multiple layers of noise
          float n1 = noise(uv * 8.0 + time);
          float n2 = noise(uv * 16.0 - time * 0.5);
          float n3 = noise(uv * 32.0 + time * 0.25);
          
          float finalNoise = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2);
          
          // Create color mapping
          vec3 color = vec3(
            0.5 + 0.5 * sin(finalNoise * 6.28 + time),
            0.5 + 0.5 * sin(finalNoise * 6.28 + time + 2.094),
            0.5 + 0.5 * sin(finalNoise * 6.28 + time + 4.188)
          );
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;
    }
    
    // Fire shader
    else if (this.shaderType === SHADER_OPTIONS.FIRE) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        // Pseudo-random function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        // 2D noise function
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          
          // Four corners in 2D of a tile
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          
          // Smooth interpolation
          vec2 u = f * f * (3.0 - 2.0 * f);
          
          return mix(a, b, u.x) +
                 (c - a) * u.y * (1.0 - u.x) +
                 (d - b) * u.x * u.y;
        }
        
        // Fractal Brownian Motion
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 5; i++) {
            value += amplitude * noise(st * frequency);
            frequency *= 2.0;
            amplitude *= 0.5;
          }
          
          return value;
        }
        
        void main() {
          vec2 uv = vTextureCoord;
          float time = iTime;
          
          // Adjust UV for fire effect
          uv.y = 1.0 - uv.y;
          
          // Create fire noise
          float noise1 = fbm(vec2(uv.x * 3.0, uv.y * 6.0 + time * 0.5));
          float noise2 = fbm(vec2(uv.x * 4.0 + 0.5, uv.y * 7.0 + time * 0.6));
          
          float fireNoise = noise1 * noise2 * 1.5;
          
          // Fire gradient
          float gradient = 1.0 - pow(uv.y, 1.5);
          
          // Combine for final fire effect
          float fire = smoothstep(0.1, 0.9, fireNoise * gradient);
          
          // Fire colors
          vec3 color1 = vec3(1.0, 0.8, 0.0); // Yellow
          vec3 color2 = vec3(1.0, 0.4, 0.0); // Orange
          vec3 color3 = vec3(0.8, 0.0, 0.0); // Red
          
          vec3 fireColor = mix(color3, color2, fire);
          fireColor = mix(fireColor, color1, pow(fire, 2.0));
          
          // Add some flickering
          fireColor *= 0.8 + 0.2 * sin(time * 10.0);
          
          gl_FragColor = vec4(fireColor, 1.0);
        }
      `;
    }
    
    // Matrix shader
    else if (this.shaderType === SHADER_OPTIONS.MATRIX) {
      return `
        precision mediump float;
        varying highp vec2 vTextureCoord;
        uniform float iTime;
        uniform vec2 iResolution;
        
        // Pseudo-random function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }
        
        void main() {
          vec2 uv = vTextureCoord;
          float time = iTime;
          
          // Create grid
          vec2 grid = vec2(30.0, 50.0);
          vec2 gridUV = fract(uv * grid);
          
          // Create falling effect
          float speed = 0.8;
          vec2 offset = vec2(
            floor(uv.x * grid.x) * 0.2,
            floor(uv.y * grid.y) * 0.1
          );
          
          float fallY = fract(uv.y * grid.y - time * speed + offset.x);
          
          // Random character brightness
          float charBrightness = random(vec2(floor(uv.x * grid.x), floor(time * 2.0) + offset.y));
          
          // Character shape (simple rectangle with random height)
          float charHeight = 0.3 + 0.4 * random(vec2(floor(uv.x * grid.x), floor(time) + offset.y));
          float char = step(fallY, charHeight);
          
          // Fade out as characters fall
          float fade = 1.0 - fallY;
          
          // Combine for final effect
          float brightness = char * fade * charBrightness;
          
          // Matrix green color
          vec3 color = vec3(0.0, brightness * 1.0, brightness * 0.5);
          
          // Add glow
          color += vec3(0.0, 0.2, 0.1) * (1.0 - char) * fade * 0.3;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;
    }
    
    // Default to wave gradient if no match
    return `
      precision mediump float;
      varying highp vec2 vTextureCoord;
      uniform float iTime;
      uniform vec2 iResolution;
      
      void main() {
        vec2 uv = vTextureCoord;
        float time = iTime;
        
        // Simple color gradient
        vec3 color = vec3(
          0.5 + 0.5 * sin(uv.x * 6.28 + time),
          0.5 + 0.5 * sin(uv.y * 6.28 + time + 2.094),
          0.5 + 0.5 * sin((uv.x + uv.y) * 6.28 + time + 4.188)
        );
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;
  }
  
  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }
  
  initBuffers() {
    // Create a buffer for the square's positions
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    
    // Create a square
    const positions = [
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0,
    ];
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
    
    // Create a buffer for texture coordinates
    const textureCoordBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, textureCoordBuffer);
    
    const textureCoordinates = [
      0.0, 0.0,
      1.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
    ];
    
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);
    
    this.buffers = {
      position: positionBuffer,
      textureCoord: textureCoordBuffer,
    };
  }
  
  render() {
    if (!this.gl) return;
    
    // Clear with transparent background
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    this.gl.clearDepth(1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
    // Enable transparency with proper blending
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    
    // Tell WebGL how to pull out the positions from the position buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.vertexPosition,
      2, // 2 components per vertex
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.vertexPosition);
    
    // Tell WebGL how to pull out the texture coordinates from buffer
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.textureCoord);
    this.gl.vertexAttribPointer(
      this.programInfo.attribLocations.textureCoord,
      2, // 2 components per vertex
      this.gl.FLOAT,
      false,
      0,
      0
    );
    this.gl.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);
    
    // Use our shader program
    this.gl.useProgram(this.programInfo.program);
    
    // Set the shader uniforms
    const currentTime = (Date.now() - this.startTime) / 1000.0;
    this.gl.uniform1f(this.programInfo.uniformLocations.iTime, currentTime);
    this.gl.uniform2f(
      this.programInfo.uniformLocations.iResolution,
      this.canvas.width,
      this.canvas.height
    );
    
    // Draw the square
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
  }
  
  start() {
    if (this.running) return;
    this.running = true;
    this.animate();
  }
  
  stop() {
    this.running = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  animate() {
    if (!this.running) return;
    
    this.render();
    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
  
  resize() {
    if (!this.gl) return;
    
    // Get the actual dimensions of the parent element
    const parentWidth = this.canvas.parentElement ? this.canvas.parentElement.clientWidth : 240;
    const parentHeight = this.canvas.parentElement ? this.canvas.parentElement.clientHeight : 280;
    
    // Update canvas size to match parent exactly
    this.canvas.width = parentWidth;
    this.canvas.height = parentHeight;
    
    // Update viewport to match new canvas size
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }
} 