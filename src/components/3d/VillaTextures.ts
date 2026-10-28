import * as THREE from 'three';

// Procedural texture generators using Canvas2D for pristine, high-res assets with zero network latency
export function createWoodDeckTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm rich dark teak wood base
  ctx.fillStyle = '#2c221a';
  ctx.fillRect(0, 0, 512, 512);

  // Planks
  const plankWidth = 32;
  for (let x = 0; x < 512; x += plankWidth) {
    ctx.fillStyle = (x / plankWidth) % 2 === 0 ? '#342a20' : '#282018';
    ctx.fillRect(x, 0, plankWidth - 2, 512);

    // Subtle grain lines
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(x + plankWidth - 2, 0, 2, 512);

    for (let y = 0; y < 512; y += 8) {
      if (Math.random() > 0.4) {
        ctx.fillStyle = `rgba(${40 + Math.random() * 20}, ${30 + Math.random() * 15}, 20, 0.25)`;
        ctx.fillRect(x + Math.random() * 10, y, Math.random() * 16, 2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createStoneWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Light travertine / limestone textured stone pattern matching the reference image's retaining wall
  ctx.fillStyle = '#e2ded7';
  ctx.fillRect(0, 0, 512, 512);

  // Stacked horizontal stone courses
  const rowHeight = 16;
  for (let y = 0; y < 512; y += rowHeight) {
    let x = (y / rowHeight) % 2 === 0 ? 0 : 25;
    while (x < 512) {
      const stoneWidth = 40 + Math.random() * 60;
      const lightness = 210 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${lightness}, ${lightness - 6}, ${lightness - 15})`;
      ctx.fillRect(x, y, stoneWidth - 2, rowHeight - 2);

      // Shadow in mortar groove
      ctx.fillStyle = 'rgba(70, 65, 60, 0.4)';
      ctx.fillRect(x + stoneWidth - 2, y, 2, rowHeight);
      ctx.fillRect(x, y + rowHeight - 2, stoneWidth, 2);

      x += stoneWidth;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

export function createConcretePanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Ultra-clean modern white architectural facade panel
  ctx.fillStyle = '#f6f6f8';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle architectural grid groove seams
  ctx.strokeStyle = 'rgba(160, 160, 170, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, 504, 504);

  // Subtle architectural bolt/recess marks in corners
  ctx.fillStyle = 'rgba(120, 120, 130, 0.3)';
  const offsets = [16, 496];
  for (const ox of offsets) {
    for (const oy of offsets) {
      ctx.beginPath();
      ctx.arc(ox, oy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createPoolWaterNormal(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(256, 256);
  for (let y = 0; y < 256; y++) {
    for (let x = 0; x < 256; x++) {
      const idx = (y * 256 + x) * 4;
      const nx = Math.sin(x * 0.1) * Math.cos(y * 0.08) * 0.5 + 0.5;
      const ny = Math.cos(x * 0.09) * Math.sin(y * 0.12) * 0.5 + 0.5;

      imgData.data[idx] = Math.floor(nx * 255);
      imgData.data[idx + 1] = Math.floor(ny * 255);
      imgData.data[idx + 2] = 255;
      imgData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createAbstractArtTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Luxury modern gallery minimalist canvas: ochre, ivory, and deep charcoal
  const grad = ctx.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, '#f2ece4');
  grad.addColorStop(0.5, '#eae0d2');
  grad.addColorStop(1, '#dfd2be');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  // Bold geometric art shapes
  ctx.fillStyle = '#22252a';
  ctx.beginPath();
  ctx.arc(280, 160, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d49842';
  ctx.beginPath();
  ctx.arc(210, 130, 65, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#2b303a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(80, 240);
  ctx.lineTo(440, 90);
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}
