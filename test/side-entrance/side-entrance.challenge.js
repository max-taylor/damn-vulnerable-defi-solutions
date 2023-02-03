const { ethers } = require("hardhat");
const { expect } = require("chai");
const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");

describe("[Challenge] Side entrance", function () {
  let deployer, player;
  let pool;

  const ETHER_IN_POOL = 1000n * 10n ** 18n;
  const PLAYER_INITIAL_ETH_BALANCE = 1n * 10n ** 18n;

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, player] = await ethers.getSigners();

    // Deploy pool and fund it
    pool = await (
      await ethers.getContractFactory("SideEntranceLenderPool", deployer)
    ).deploy();
    await pool.deposit({ value: ETHER_IN_POOL });
    expect(await ethers.provider.getBalance(pool.address)).to.equal(
      ETHER_IN_POOL
    );

    // Player starts with limited ETH in balance
    await setBalance(player.address, PLAYER_INITIAL_ETH_BALANCE);
    expect(await ethers.provider.getBalance(player.address)).to.eq(
      PLAYER_INITIAL_ETH_BALANCE
    );
  });

  // We take out a flash loan on the lender pool, then deposit the loaned ETH back into the pool. This allows the flashLoan closing condition to pass (it has the same amount of ETH in the contract from when it started), but we can then withdraw the ETH from the contract
  it("Execution", async function () {
    const ExploitContractFactory = await ethers.getContractFactory(
      "SideEntranceExploit",
      deployer
    );

    const exploitContract = await ExploitContractFactory.deploy(pool.address);

    await exploitContract.runExploit(player.address);
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player took all ETH from the pool
    expect(await ethers.provider.getBalance(pool.address)).to.be.equal(0);
    expect(await ethers.provider.getBalance(player.address)).to.be.gt(
      ETHER_IN_POOL
    );
  });
});
