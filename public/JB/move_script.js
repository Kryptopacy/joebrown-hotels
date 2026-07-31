const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\pacy_labs\\joeBrown_hotel\\public\\JB';
const destDir = path.join(srcDir, 'rooms', 'room_1');

const filesToMove = [
  'IMG_20260401_160252.JPG',
  'IMG_20260401_160332.JPG',
  'IMG_20260401_160356.JPG',
  'IMG_20260401_160619.JPG',
  'IMG_20260401_160711.JPG',
  'IMG_20260401_160728.JPG',
  'IMG_20260401_160931.JPG',
  'IMG_20260401_160940.JPG',
  'IMG_20260401_160948.JPG',
  'IMG_20260401_161002.JPG'
];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

filesToMove.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${file} to room_1`);
  }
});
