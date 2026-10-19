import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http, formatEther, type PublicClient } from 'viem';
import type { StoredWallet, EncryptedVaultPayload, BotChainConfig } from '../types/index.js';
import { toViemChain, getChain } from '../config/chains.js';

const DATA_DIR = path.resolve(process.cwd(), '.data');
const VAULT_FILE = path.join(DATA_DIR, 'wallets.enc.json');

export class VaultManager {
  private wallets: StoredWallet[] = [];
  private isUnlocked: boolean = false;
  private currentPassword?: string;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public vaultExists(): boolean {
    return fs.existsSync(VAULT_FILE);
  }

  public isUnlockedStatus(): boolean {
    return this.isUnlocked;
  }

  public getUnlockedWallets(): StoredWallet[] {
    if (!this.isUnlocked) {
      throw new Error('Vault is locked. Unlock it with master password first.');
    }
    return this.wallets;
  }

  public getBurners(): StoredWallet[] {
    return this.getUnlockedWallets().filter((w) => !w.isMaster);
  }

  public getMasterWallet(): StoredWallet | undefined {
    return this.getUnlockedWallets().find((w) => w.isMaster);
  }

  public unlock(password: string): boolean {
    if (!this.vaultExists()) {
      // First-time setup
      this.wallets = [];
      this.isUnlocked = true;
      this.currentPassword = password;
      this.save();
      return true;
    }

    try {
      const raw = fs.readFileSync(VAULT_FILE, 'utf-8');
      const payload: EncryptedVaultPayload = JSON.parse(raw);
      const salt = Buffer.from(payload.salt, 'hex');
      const iv = Buffer.from(payload.iv, 'hex');
      const authTag = Buffer.from(payload.authTag, 'hex');
      const ciphertext = Buffer.from(payload.ciphertext, 'hex');

      const key = crypto.scryptSync(password, salt, 32);
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      this.wallets = JSON.parse(decrypted.toString('utf-8'));
      this.isUnlocked = true;
      this.currentPassword = password;
      return true;
    } catch {
      this.isUnlocked = false;
      return false;
    }
  }

  public resetVault(password: string): void {
    this.wallets = [];
    this.isUnlocked = true;
    this.currentPassword = password;
    this.save();
  }

  public save(): void {
    if (!this.isUnlocked || !this.currentPassword) {
      throw new Error('Cannot save locked vault.');
    }

    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12); // Standard GCM 96-bit IV
    const key = crypto.scryptSync(this.currentPassword, salt, 32);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const plaintext = Buffer.from(JSON.stringify(this.wallets), 'utf-8');
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const payload: EncryptedVaultPayload = {
      version: 1,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      ciphertext: ciphertext.toString('hex'),
    };

    fs.writeFileSync(VAULT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  }

  public generateBurners(count: number, prefix: string = 'Burner'): StoredWallet[] {
    if (!this.isUnlocked) throw new Error('Vault is locked');
    const existingCount = this.getBurners().length;
    const newWallets: StoredWallet[] = [];

    for (let i = 0; i < count; i++) {
      const privateKey = generatePrivateKey();
      const account = privateKeyToAccount(privateKey);
      const wallet: StoredWallet = {
        address: account.address,
        privateKey,
        label: `${prefix} #${existingCount + i + 1}`,
        createdAt: Date.now(),
        isMaster: false,
      };
      newWallets.push(wallet);
      this.wallets.push(wallet);
    }

    this.save();
    return newWallets;
  }

  public importWallet(privateKey: `0x${string}`, label: string, isMaster: boolean = false): StoredWallet {
    if (!this.isUnlocked) throw new Error('Vault is locked');
    const account = privateKeyToAccount(privateKey);
    const existing = this.wallets.find((w) => w.address.toLowerCase() === account.address.toLowerCase());
    if (existing) {
      throw new Error(`Wallet ${account.address} already exists in vault.`);
    }

    const wallet: StoredWallet = {
      address: account.address,
      privateKey,
      label,
      createdAt: Date.now(),
      isMaster,
    };
    this.wallets.push(wallet);
    this.save();
    return wallet;
  }

  public setMaster(address: `0x${string}`): void {
    if (!this.isUnlocked) throw new Error('Vault is locked');
    this.wallets.forEach((w) => {
      w.isMaster = w.address.toLowerCase() === address.toLowerCase();
    });
    this.save();
  }

  public deleteWallet(address: `0x${string}`): boolean {
    if (!this.isUnlocked) throw new Error('Vault is locked');
    const prevLen = this.wallets.length;
    this.wallets = this.wallets.filter((w) => w.address.toLowerCase() !== address.toLowerCase());
    if (this.wallets.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  public async fetchBalances(chainSlug: string): Promise<Array<{ wallet: StoredWallet; balanceFormatted: string; balanceWei: bigint }>> {
    const chain = getChain(chainSlug);
    const viemChain = toViemChain(chain);
    const client = createPublicClient({
      chain: viemChain,
      transport: http(chain.rpcUrl),
    });

    const results = await Promise.all(
      this.getUnlockedWallets().map(async (wallet) => {
        try {
          const balanceWei = await client.getBalance({ address: wallet.address });
          return {
            wallet,
            balanceWei,
            balanceFormatted: `${formatEther(balanceWei)} ${chain.nativeCurrency.symbol}`,
          };
        } catch {
          return {
            wallet,
            balanceWei: 0n,
            balanceFormatted: `Error fetching`,
          };
        }
      })
    );

    return results;
  }
}
