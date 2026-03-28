import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const EXTENSION_PATH = path.join(process.cwd(), 'extension');
const SENSITIVE_FILES = ['.env', '.pem', '.key', '.credentials'];
const MAX_SIZE_MB = 50;

interface DownloadLog {
  timestamp: Date;
  success: boolean;
  fileSize?: number;
  error?: string;
  userAgent?: string;
}

const downloadLogs: DownloadLog[] = [];

function sanitizePath(filePath: string): boolean {
  const normalized = path.normalize(filePath);
  return !normalized.includes('..');
}

function isSensitiveFile(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return SENSITIVE_FILES.some(sensitive =>
    fileName.endsWith(sensitive) || fileName.includes(sensitive)
  );
}

function logDownload(success: boolean, fileSize?: number, error?: string, userAgent?: string) {
  const log: DownloadLog = {
    timestamp: new Date(),
    success,
    fileSize,
    error,
    userAgent
  };
  downloadLogs.push(log);
  console.log(`[ExtensionDownload] ${success ? 'SUCCESS' : 'FAILED'}: ${error || `Size: ${fileSize}bytes`}`);
  if (downloadLogs.length > 100) {
    downloadLogs.shift();
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(EXTENSION_PATH)) {
      logDownload(false, 0, 'Extension folder not found');
      return NextResponse.json(
        { error: 'Extension folder not found' },
        { status: 404 }
      );
    }

    const stats = fs.statSync(EXTENSION_PATH);
    if (!stats.isDirectory()) {
      logDownload(false, 0, 'Extension path is not a directory');
      return NextResponse.json(
        { error: 'Invalid extension path' },
        { status: 400 }
      );
    }

    const userAgent = 'Unknown';
    logDownload(true, 0, undefined, userAgent);

    const chunks: Buffer[] = [];

    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('[ExtensionDownload] Warning:', err.message);
      } else {
        throw err;
      }
    });

    archive.directory(EXTENSION_PATH, 'extension');

    archive.finalize();

    await new Promise<void>((resolve, reject) => {
      archive.on('end', () => {
        const totalSize = archive.pointer();
        if (totalSize > MAX_SIZE_MB * 1024 * 1024) {
          logDownload(false, totalSize, `File too large: ${totalSize}bytes`);
          reject(new Error(`Extension too large (max ${MAX_SIZE_MB}MB)`));
        } else {
          logDownload(true, totalSize);
          resolve();
        }
      });
      archive.on('error', (err) => {
        logDownload(false, 0, err.message);
        reject(err);
      });
    });

    const zipBuffer = Buffer.concat(chunks);

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="dev-reality-extension.zip"',
        'Content-Length': zipBuffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, private',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ExtensionDownload] Error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to create extension archive', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  try {
    if (!fs.existsSync(EXTENSION_PATH)) {
      return new NextResponse(null, { status: 404 });
    }

    const stats = fs.statSync(EXTENSION_PATH);
    if (!stats.isDirectory()) {
      return new NextResponse(null, { status: 400 });
    }

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Length': '0',
        'Content-Type': 'application/zip'
      }
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
