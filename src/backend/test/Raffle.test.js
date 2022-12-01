const { expect } = require("chai")

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

describe("Raffle", async function() {
    let deployer, addr1, addr2, token
    let subscriptionId = 256

    // entry 1
    let duration = 5;
    let dollarValue = 1337;
    let ticketsTotalSupply = 500;
    let price = 5000000000000000; // 0.005 eth
    let name = "MAYC #18341";
    let image = "ipfs://QmSEdxRSkapGzgRYQVdrhXkbyP5Wmou6ZMg9h1WNSjTNhs";
    let projectName = "Mutant Ape Yacht Club";
    let nftAddress = "0xAd6434A0aD3cF1b9c40a0B8723AE9258232FA297";

    beforeEach(async function() {
        // Get contract factories
        const Raffle = await ethers.getContractFactory("Raffle");

        // Get signers
        [deployer, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy contracts
        const vrfCoordFactory = await ethers.getContractFactory("MockVRFCoordinator");
        const mockVrfCoordinator = await vrfCoordFactory.connect(deployer).deploy();
        raffle = await Raffle.deploy(mockVrfCoordinator.address, subscriptionId);
    });

    describe("Deployment", function() {
        it("Should create a raffle entry and retreive the entry data", async function() {
            expect(await raffle.getEntryLength()).to.equal(0);

            await raffle.connect(deployer).createRaffle(duration, dollarValue, ticketsTotalSupply, price, name, 
                image, projectName, nftAddress);
            
            expect(await raffle.getEntryLength()).to.equal(1);

            let entry1 = await raffle.entries(0);
            expect(entry1.id).to.equal(0)
            expect(entry1.duration).to.equal(duration)
            expect(entry1.dollarValue).to.equal(dollarValue)
            expect(entry1.ticketsTotalSupply).to.equal(ticketsTotalSupply)
            expect(entry1.price).to.equal(price)
            expect(entry1.name).to.equal(name)
            expect(entry1.image).to.equal(image)
            expect(entry1.projectName).to.equal(projectName)
            expect(entry1.nftAddress).to.equal(nftAddress)

            await raffle.connect(deployer).createRaffle(duration, dollarValue, ticketsTotalSupply, price, name, 
                image, projectName, nftAddress);
            expect(await raffle.getEntryLength()).to.equal(2);
            let entry2 = await raffle.entries(1);
            expect(entry2.id).to.equal(1)
        })
    })

    describe("Play", function() {
        it("Should enter a raffle and end it", async function() {
            expect(await raffle.getEntryLength()).to.equal(0);

            await raffle.connect(deployer).createRaffle(duration, dollarValue, 3, price, name, 
                image, projectName, nftAddress);
            
            expect(await raffle.getEntryLength()).to.equal(1);

            await expect(raffle.connect(addr1).buyTicket(1)).to.be.revertedWith('Entry not found');
            await expect(raffle.connect(addr1).buyTicket(0)).to.be.revertedWith('Not enough ETH sent');
            
            await raffle.connect(addr1).buyTicket(0, { value: price})
            expect(await raffle.getTicketsBoughtLength(0)).to.equal(1)
            
            await raffle.connect(addr2).buyTicket(0, { value: price})
            expect(await raffle.getTicketsBoughtLength(0)).to.equal(2)
            
            await raffle.connect(addr3).buyTicket(0, { value: price})
            expect(await raffle.getTicketsBoughtLength(0)).to.equal(3)
        })
    })
})