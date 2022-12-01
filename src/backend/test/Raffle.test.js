const { expect } = require("chai")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("Raffle", async function() {
    let deployer, addr1, addr2, token

    beforeEach(async function() {
        // Get contract factories
        const Raffle = await ethers.getContractFactory("Raffle");

        // Get signers
        [deployer, addr1, addr2] = await ethers.getSigners();

        // Deploy contracts
        raffle = await Raffle.deploy();
    });

    describe("Deployment", function() {
        it("Should create a raffle entry", async function() {
        })
    })
})