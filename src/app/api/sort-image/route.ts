import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { filename, category, addToGallery } = await req.json();
    
    if (!filename || !category) {
      return NextResponse.json({ error: 'Missing filename or category' }, { status: 400 });
    }

    const baseDir = path.join(process.cwd(), 'public', 'JB');
    const sourcePath = path.join(baseDir, filename);
    const destDir = path.join(baseDir, category);
    const destPath = path.join(destDir, filename);

    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    // Move to main category
    fs.renameSync(sourcePath, destPath);

    // If addToGallery is checked, copy it to the gallery folder
    if (addToGallery) {
      const galleryDir = path.join(baseDir, 'gallery');
      if (!fs.existsSync(galleryDir)) {
        fs.mkdirSync(galleryDir, { recursive: true });
      }
      const galleryPath = path.join(galleryDir, filename);
      fs.copyFileSync(destPath, galleryPath);
    }

    return NextResponse.json({ success: true, message: `Moved ${filename} to ${category}` });
  } catch (error: any) {
    console.error('Error sorting image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
