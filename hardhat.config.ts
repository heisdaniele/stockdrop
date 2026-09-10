import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const baseSepoliaRpcUrl = process.env.BASE_SEPOLIA_RPC_URL ?? "https://sepolia.base.org";

if (deployerPrivateKey && !/^0x[0-9a-fA-F]{64}$/.test(deployerPrivateKey)) {
  throw new Error("DEPLOYER_PRIVATE_KEY must be 0x followed by exactly 64 hexadecimal characters.");
}

export default defineConfig({
  plugins: [hardhatEthers, hardhatNodeTestRunner],
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    baseSepolia: {
      type: "http",
      chainType: "l1",
      url: baseSepoliaRpcUrl,
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
});
