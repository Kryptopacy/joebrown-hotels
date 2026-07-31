import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const baseDir = path.join(process.cwd(), 'public', 'JB');
    
    if (!fs.existsSync(baseDir)) {
      return NextResponse.json({ images: [] });
    }

    // Only get files (not directories) directly in JB
    const files = fs.readdirSync(baseDir)
      .filter(file => {
        const stat = fs.statSync(path.join(baseDir, file));
        return stat.isFile() && (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpeg'));
      });

    return NextResponse.json({ images: files });
  } catch (error: any) {
    console.error('Error listing images:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
