import { network } from "hardhat";

const { ethers } = await network.connect();
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY is not loaded. Run `set -a; source .env; set +a` before deploying.");
}

const deployer = new ethers.Wallet(privateKey, ethers.provider);
const balance = await ethers.provider.getBalance(deployer.address);

console.log("Deploying mock stocks from:", deployer.address);
console.log("Base Sepolia ETH balance:", ethers.formatEther(balance));

if (balance === 0n) {
  throw new Error("The deployer has no Base Sepolia ETH.");
}

const stocks = [
  { key: "NVDA", name: "StockDrop Mock Nvidia", symbol: "mNVDA" },
  { key: "TSLA", name: "StockDrop Mock Tesla", symbol: "mTSLA" },
  { key: "AAPL", name: "StockDrop Mock Apple", symbol: "mAAPL" },
] as const;

const factory = await ethers.getContractFactory("MockStock", deployer);

for (const stock of stocks) {
  const token = await factory.deploy(stock.name, stock.symbol);
  await token.waitForDeployment();
  console.log(`${stock.key}:`, await token.getAddress());
}
