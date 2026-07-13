import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getDatasetsRoot } from '@/server/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const IMAGE_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

const findImageDirectories = (datasetsPath: string): string[] => {
  const directories: string[] = [];
  const pending = [datasetsPath];

  while (pending.length > 0) {
    const currentPath = pending.pop() as string;
    let entries: fs.Dirent[];

    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      continue;
    }

    if (entries.some(entry => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))) {
      directories.push(path.relative(datasetsPath, currentPath));
    }

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        pending.push(path.join(currentPath, entry.name));
      }
    }
  }

  return directories;
};

export async function GET() {
  try {
    let datasetsPath = await getDatasetsRoot();

    // if folder doesnt exist, create it
    if (!fs.existsSync(datasetsPath)) {
      fs.mkdirSync(datasetsPath);
    }

    // Keep top-level folders while also exposing nested image directories.
    const topLevelFolders = fs
      .readdirSync(datasetsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .filter(dirent => !dirent.name.startsWith('.'))
      .map(dirent => dirent.name);
    const imageDirectories = findImageDirectories(datasetsPath);
    const folders = [...new Set([...topLevelFolders, ...imageDirectories])].sort((a, b) => a.localeCompare(b));

    return NextResponse.json(folders, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch datasets' }, { status: 500 });
  }
}
