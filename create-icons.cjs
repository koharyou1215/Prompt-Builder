/**
 * Simple icon generator script
 * Creates basic PNG icon files for Chrome extension
 */

const fs = require('fs');
const path = require('path');

// Minimal valid PNG file data (1x1 blue pixel)
const createPNG = (width, height, color = [66, 133, 244]) => {
  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // chunk length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace

  // Simple CRC32 calculation
  const crc32 = (data) => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ ((crc & 1) ? 0xEDB88320 : 0);
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
  };

  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);

  // IDAT chunk (minimal compressed image data)
  // Create solid color image
  const pixelData = [];
  for (let y = 0; y < height; y++) {
    pixelData.push(0); // filter type: none
    for (let x = 0; x < width; x++) {
      pixelData.push(...color); // RGB
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(Buffer.from(pixelData));

  const idat = Buffer.alloc(12 + compressed.length);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);

  const idatCrc = crc32(idat.slice(4, 8 + compressed.length));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);

  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);

  return Buffer.concat([signature, ihdr, idat, iend]);
};

// Create icons directory
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
const sizes = [
  { size: 16, name: 'icon16.png' },
  { size: 48, name: 'icon48.png' },
  { size: 128, name: 'icon128.png' }
];

sizes.forEach(({ size, name }) => {
  const iconPath = path.join(iconsDir, name);
  const pngData = createPNG(size, size);
  fs.writeFileSync(iconPath, pngData);
  console.log(`✓ Created ${name} (${size}x${size})`);
});

console.log('\n✅ All icons created successfully!');
