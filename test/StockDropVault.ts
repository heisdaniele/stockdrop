import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("StockDropVault", async () => {
  const { ethers } = await network.connect();

  async function deployFixture() {
    const [sender, recipient, stranger] = await ethers.getSigners();
    const vault = await ethers.deployContract("StockDropVault");
    const token = await ethers.deployContract("MockStock", ["Mock Nvidia Stock", "mNVDA"]);
    await Promise.all([vault.waitForDeployment(), token.waitForDeployment()]);
    return { sender, recipient, stranger, vault, token };
  }

  it("escrows a tokenized stock and records the gift", async () => {
    const { recipient, vault, token } = await deployFixture();
    const amount = ethers.parseEther("2.5");
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;
    await token.approve(await vault.getAddress(), amount);
    await vault.createDrop(recipient.address, await token.getAddress(), amount, now + 3_600, "Happy birthday");

    const drop = await vault.getDrop(0);
    assert.equal(drop.recipient, recipient.address);
    assert.equal(drop.amount, amount);
    assert.equal(drop.memo, "Happy birthday");
    assert.deepEqual([...(await vault.recipientDropIds(recipient.address))], [0n]);
  });

  it("prevents claims before the unlock time", async () => {
    const { recipient, vault, token } = await deployFixture();
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;
    await token.approve(await vault.getAddress(), 1n);
    await vault.createDrop(recipient.address, await token.getAddress(), 1n, now + 3_600, "Locked");
    await assert.rejects(vault.connect(recipient).claim(0));
  });

  it("allows only the recipient to claim once after unlock", async () => {
    const { recipient, stranger, vault, token } = await deployFixture();
    const amount = ethers.parseEther("1");
    const now = (await ethers.provider.getBlock("latest"))!.timestamp;
    await token.approve(await vault.getAddress(), amount);
    await vault.createDrop(recipient.address, await token.getAddress(), amount, now + 60, "For you");
    await assert.rejects(vault.connect(stranger).claim(0));
    await ethers.provider.send("evm_setNextBlockTimestamp", [now + 61]);
    await ethers.provider.send("evm_mine", []);
    await vault.connect(recipient).claim(0);
    assert.equal(await token.balanceOf(recipient.address), amount);
    await assert.rejects(vault.connect(recipient).claim(0));
  });

  it("supports instant rewards with the current timestamp", async () => {
    const { recipient, vault, token } = await deployFixture();
    await token.approve(await vault.getAddress(), 10n);
    await vault.createDrop(recipient.address, await token.getAddress(), 10n, 0, "1% cashback");
    await vault.connect(recipient).claim(0);
    assert.equal(await token.balanceOf(recipient.address), 10n);
  });
});
