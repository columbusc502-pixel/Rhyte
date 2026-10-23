import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal CRC32 implementation for PNG
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.38 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep obsidian studio background (#0a0b0e -> 10, 11, 14)
      let r = 10;
      let g = 11;
      let b = 14;
      let a = 255;

      // Cyan to Indigo gradient circle in center
      if (dist < radius) {
        // Gradient interpolation
        const t = (x + y) / (width + height);
        r = Math.floor(0 * (1 - t) + 99 * t);
        g = Math.floor(229 * (1 - t) + 102 * t);
        b = Math.floor(255 * (1 - t) + 241 * t);

        // Subtly lighter center
        if (dist > radius - 4) {
          a = 255;
        }
      }

      // Stylized 'R' glyph in center (white / dark contrast)
      const nx = (x - cx) / (radius * 0.7);
      const ny = (y - cy) / (radius * 0.7);

      // Simple robust stylized R coordinates inside [-1, 1]
      const inStem = nx >= -0.45 && nx <= -0.15 && ny >= -0.55 && ny <= 0.55;
      const inTopLoop =
        nx >= -0.45 && nx <= 0.35 && ny >= -0.55 && ny <= -0.05 &&
        !(nx >= -0.15 && nx <= 0.05 && ny >= -0.35 && ny <= -0.2);
      const inLeg =
        nx >= -0.15 && nx <= 0.38 && ny >= -0.05 && ny <= 0.55 &&
        Math.abs(nx - ny * 0.8) < 0.25;

      if (inStem || inTopLoop || inLeg) {
        r = 10;
        g = 11;
        b = 14;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(32, 32, false));

console.log('Successfully generated PWA icon assets in public/');
