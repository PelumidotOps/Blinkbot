import { parseAbi } from 'viem';

export const SEADROP_CONTRACT_ADDRESS: `0x${string}` = '0x00005EA00Ac477B1030CE7850649663528343865';

export const SEADROP_ABI = parseAbi([
  'function mintPublic(address nftContract, address feeRecipient, address minterIfNotPayer, uint256 quantity) external payable',
  'function getPublicDrop(address nftContract) view returns ((uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 maxTotalMintableByWallet, uint16 feeBps, bool restrictFeeRecipients))',
  'function getAllowListDrop(address nftContract) view returns ((bytes32 merkleRoot, string[] publicKeyURIs, (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 maxTotalMintableByWallet, uint16 feeBps, bool restrictFeeRecipients) allowListDropData))',
  'function mintAllowList(address nftContract, address feeRecipient, address minterIfNotPayer, uint256 quantity, (uint80 mintPrice, uint48 startTime, uint48 endTime, uint16 maxTotalMintableByWallet, uint16 feeBps, bool restrictFeeRecipients) mintParams, bytes32[] proof) external payable',
]);

export const DISPERSE_ABI = parseAbi([
  'function disperseEther(address[] recipients, uint256[] values) external payable',
  'function disperseToken(address token, address[] recipients, uint256[] values) external',
  'function disperseTokenSimple(address token, address[] recipients, uint256[] values) external',
]);

export const ERC721_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function ownerOf(uint256 tokenId) view returns (address)',
  'function safeTransferFrom(address from, address to, uint256 tokenId) external',
  'function transferFrom(address from, address to, uint256 tokenId) external',
  'function isApprovedForAll(address owner, address operator) view returns (bool)',
  'function setApprovalForAll(address operator, bool approved) external',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
]);

export const COMMON_MINT_SIGNATURES = [
  'function mint(uint256 quantity) external payable',
  'function mint(address to, uint256 quantity) external payable',
  'function publicMint(uint256 quantity) external payable',
  'function publicMint() external payable',
  'function mint() external payable',
  'function claim(uint256 quantity) external payable',
  'function claim(address receiver, uint256 quantity) external payable',
  'function safeMint(address to, uint256 quantity) external payable',
  'function safeMint(address to) external payable',
];
