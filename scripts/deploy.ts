import { network } from "hardhat";

const { ethers } = await network.connect();
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("DEPLOYER_PRIVATE_KEY is not loaded. Run `set -a; source .env; set +a` before deploying.");
}

const deployer = new ethers.Wallet(privateKey, ethers.provider);
const balance = await ethers.provider.getBalance(deployer.address);

console.log("Deploying from:", deployer.address);
console.log("Base Sepolia ETH balance:", ethers.formatEther(balance));

if (balance === 0n) {
  throw new Error("The deployer has no Base Sepolia ETH. Fund it from a Base Sepolia faucet and retry.");
}

const vaultFactory = await ethers.getContractFactory("StockDropVault", deployer);
const vault = await vaultFactory.deploy();
await vault.waitForDeployment();
console.log("StockDropVault:", await vault.getAddress());
