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
  const dropsPath = path.join(getDataDir(), 'drops.json');
  let drops = [];
  if (fs.existsSync(dropsPath)) {
    try {
      drops = JSON.parse(fs.readFileSync(dropsPath, 'utf-8'));
    } catch {
      drops = [];
    }
  }
  return NextResponse.json({ success: true, drops });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, contractAddress, chainSlug = 'base', price = '0.00', launchTimestamp } = body;

    if (!contractAddress || !contractAddress.startsWith('0x') || contractAddress.length !== 42) {
      return NextResponse.json(
        { success: false, error: 'Invalid contract address. Must be a 42-char 0x EVM address.' },
        { status: 400 }
      );
    }

    const dropsPath = path.join(getDataDir(), 'drops.json');
    let drops: any[] = [];
    if (fs.existsSync(dropsPath)) {
      try {
        drops = JSON.parse(fs.readFileSync(dropsPath, 'utf-8'));
      } catch {
        drops = [];
      }
    }

    const newDrop = {
      id: 'drop-' + Date.now(),
      name: name || 'Scheduled Drop',
      creator: contractAddress.slice(0, 6) + '...' + contractAddress.slice(-4),
      chain: chainSlug,
      chainName: chainSlug === 'base' ? 'Base' : chainSlug === 'ink' ? 'Ink' : 'Ethereum',
      dateStr: new Date(launchTimestamp || Date.now() + 3600000).toLocaleString(),
      targetTimestamp: launchTimestamp || Date.now() + 3600000,
      price: price || '0.00',
      currency: chainSlug === 'arc' ? 'USDC' : 'ETH',
      walletsCount: 5,
      status: 'SCHEDULED',
      contractAddress,
    };

    drops.push(newDrop);
    fs.writeFileSync(dropsPath, JSON.stringify(drops, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Scheduled mint drop for ${newDrop.name} on ${newDrop.chainName}.`,
      drop: newDrop,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
