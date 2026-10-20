import { NextResponse } from 'next/server';
import {
  getWalletsList,
  createBurnerWallet,
  batchGenerateBurners,
  importPrivateKey,
  deleteWalletByAddress,
  setMasterWalletByAddress,
} from '@/lib/blink-service';

export async function GET() {
  try {
    const wallets = getWalletsList();
    return NextResponse.json({ success: true, wallets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, count, prefix, privateKey, label, isMaster, address } = body;

    if (action === 'batch') {
      const num = Math.min(Math.max(Number(count) || 5, 1), 50);
      const newWallets = batchGenerateBurners(num, prefix || 'Mint Fleet');
      return NextResponse.json({
        success: true,
        message: `Successfully generated ${newWallets.length} new mint wallets.`,
        wallets: newWallets.map(w => ({ address: w.address, label: w.label, isMaster: w.isMaster })),
      });
    }

    if (action === 'import') {
      if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
        return NextResponse.json(
          { success: false, error: 'Invalid private key. Must be a 66-character 0x-prefixed hex string.' },
          { status: 400 }
        );
      }
      const imported = importPrivateKey(privateKey, label, !!isMaster);
      return NextResponse.json({
        success: true,
        message: `Successfully imported wallet ${imported.address.slice(0, 6)}...${imported.address.slice(-4)}`,
        wallet: { address: imported.address, label: imported.label, isMaster: imported.isMaster },
      });
    }

    if (action === 'setMaster') {
      if (!address) {
        return NextResponse.json({ success: false, error: 'Wallet address is required.' }, { status: 400 });
      }
      setMasterWalletByAddress(address);
      return NextResponse.json({
        success: true,
        message: `Designated ${address.slice(0, 6)}...${address.slice(-4)} as Master Vault.`,
      });
    }

    // Default: generate single burner
    const single = createBurnerWallet(label, !!isMaster);
    return NextResponse.json({
      success: true,
      message: `Generated new encrypted wallet ${single.address.slice(0, 6)}...${single.address.slice(-4)}`,
      wallet: { address: single.address, label: single.label, isMaster: single.isMaster },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let address = searchParams.get('address');
    if (!address) {
      try {
        const body = await req.json();
        address = body.address;
      } catch {
        // no body
      }
    }

    if (!address) {
      return NextResponse.json({ success: false, error: 'Address required to delete wallet.' }, { status: 400 });
    }

    const deleted = deleteWalletByAddress(address);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Wallet not found in keystore.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Deleted wallet ${address.slice(0, 6)}...${address.slice(-4)} from keystore.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
