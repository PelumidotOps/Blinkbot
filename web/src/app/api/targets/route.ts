import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

function getDataDir(): string {
  const rootData = path.resolve(process.cwd(), '../.data');
  if (fs.existsSync(rootData)) return rootData;
  const localData = path.resolve(process.cwd(), '.data');
  if (!fs.existsSync(localData)) fs.mkdirSync(localData, { recursive: true });
  return localData;
}

export async function GET() {
  const trackersPath = path.join(getDataDir(), 'trackers.json');
  let trackers = [];
  if (fs.existsSync(trackersPath)) {
    try {
      trackers = JSON.parse(fs.readFileSync(trackersPath, 'utf-8'));
    } catch {
      trackers = [];
    }
  }
  return NextResponse.json({ success: true, trackers });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, label } = body;

    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid address. Must be a 42-char 0x EVM address.' },
        { status: 400 }
      );
    }

    const trackersPath = path.join(getDataDir(), 'trackers.json');
    let trackers: any[] = [];
    if (fs.existsSync(trackersPath)) {
      try {
        trackers = JSON.parse(fs.readFileSync(trackersPath, 'utf-8'));
      } catch {
        trackers = [];
      }
    }

    const newTracker = {
      id: 'target-' + Date.now(),
      address,
      label: label || `Whale Target #${trackers.length + 1}`,
      addedAt: Date.now(),
      status: 'MONITORING',
      txCount: 0,
    };

    trackers.push(newTracker);
    fs.writeFileSync(trackersPath, JSON.stringify(trackers, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Added target ${address.slice(0, 6)}...${address.slice(-4)} to Whale Tracker.`,
      tracker: newTracker,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
