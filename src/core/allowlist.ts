import { keccak256, encodePacked, isAddressEqual } from 'viem';

export interface AllowlistEntry {
  address: `0x${string}`;
  maxMintable?: number;
  priceWei?: bigint;
}

export class MerkleAllowlist {
  private leaves: `0x${string}`[] = [];
  private layers: `0x${string}`[][] = [];
  private addressMap: Map<string, number> = new Map();

  constructor(addresses: (`0x${string}` | string)[]) {
    const validAddresses = addresses
      .map((a) => a.toLowerCase() as `0x${string}`)
      .sort((a, b) => a.localeCompare(b));

    // Remove duplicates
    const uniqueAddresses = Array.from(new Set(validAddresses));

    this.leaves = uniqueAddresses.map((addr, idx) => {
      this.addressMap.set(addr, idx);
      return this.hashLeaf(addr);
    });

    this.buildTree();
  }

  public hashLeaf(address: `0x${string}`): `0x${string}` {
    return keccak256(encodePacked(['address'], [address]));
  }

  private buildTree(): void {
    if (this.leaves.length === 0) {
      this.layers = [[]];
      return;
    }

    this.layers = [this.leaves];

    while (this.layers[this.layers.length - 1].length > 1) {
      const currentLayer = this.layers[this.layers.length - 1];
      const nextLayer: `0x${string}`[] = [];

      for (let i = 0; i < currentLayer.length; i += 2) {
        if (i + 1 < currentLayer.length) {
          const left = currentLayer[i];
          const right = currentLayer[i + 1];
          nextLayer.push(this.hashPair(left, right));
        } else {
          // Odd element gets promoted to next level
          nextLayer.push(currentLayer[i]);
        }
      }

      this.layers.push(nextLayer);
    }
  }

  private hashPair(a: `0x${string}`, b: `0x${string}`): `0x${string}` {
    // Sort pair before hashing for standard OpenZeppelin / SeaDrop MerkleProof compatibility
    return a.localeCompare(b) <= 0
      ? keccak256(encodePacked(['bytes32', 'bytes32'], [a, b]))
      : keccak256(encodePacked(['bytes32', 'bytes32'], [b, a]));
  }

  public getRoot(): `0x${string}` {
    if (this.layers.length === 0 || this.layers[this.layers.length - 1].length === 0) {
      return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(address: `0x${string}`): `0x${string}`[] {
    const idx = this.addressMap.get(address.toLowerCase());
    if (idx === undefined) return [];

    let currentIdx = idx;
    const proof: `0x${string}`[] = [];

    for (let layerIdx = 0; layerIdx < this.layers.length - 1; layerIdx++) {
      const layer = this.layers[layerIdx];
      const isEven = currentIdx % 2 === 0;
      const pairIdx = isEven ? currentIdx + 1 : currentIdx - 1;

      if (pairIdx < layer.length) {
        proof.push(layer[pairIdx]);
      }

      currentIdx = Math.floor(currentIdx / 2);
    }

    return proof;
  }

  public isEligible(address: `0x${string}`): boolean {
    return this.addressMap.has(address.toLowerCase());
  }

  public verifyProof(address: `0x${string}`, proof: `0x${string}`[], root: `0x${string}`): boolean {
    let computedHash = this.hashLeaf(address);

    for (const proofElement of proof) {
      computedHash = this.hashPair(computedHash, proofElement);
    }

    return computedHash.toLowerCase() === root.toLowerCase();
  }
}
