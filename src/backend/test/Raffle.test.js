const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")

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
            expect(entry1.duration).to.equal(duration * 3600)
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
            
            await expect(raffle.connect(addr1).buyTicket(0, { value: price})).to.be.revertedWith('Raffle sold out!');

            let entry1 = await raffle.entries(0);
            let winner = entry1.winner
            console.log("winner: " + winner)
            
            // Raffle 2
            await raffle.connect(deployer).createRaffle(duration, dollarValue, 2, price, name, 
                image, projectName, nftAddress);
            expect(await raffle.getEntryLength()).to.equal(2);
            
            await raffle.connect(addr1).buyTicket(1, { value: price})
            expect(await raffle.getTicketsBoughtLength(1)).to.equal(1)
            
            await raffle.connect(addr2).buyTicket(1, { value: price})
            expect(await raffle.getTicketsBoughtLength(1)).to.equal(2)
            
            await expect(raffle.connect(addr3).buyTicket(0, { value: price})).to.be.revertedWith('Raffle sold out!');

            let entry2 = await raffle.entries(1);
            winner = entry2.winner
            console.log("winner: " + winner)

            await raffle.connect(deployer).checkRaffleSoldOutOwner(1); // Force redraw a winner (in case error in ChainLink)

            entry2 = await raffle.entries(1);
            winner = entry2.winner
            console.log("winner: " + winner)
        })

        it("Should claim refund after raffle's timer ended", async function() {
            await raffle.connect(deployer).createRaffle(duration, dollarValue, 3, price, name, 
                image, projectName, nftAddress);

            let balance1 = parseInt(await addr1.getBalance())
            
            await raffle.connect(addr1).buyTicket(0, { value: price})
            expect(await raffle.getTicketsBoughtLength(0)).to.equal(1)
            let balance2 = parseInt(await addr1.getBalance())
            expect(balance2).to.lessThan(balance1)
            
            await raffle.connect(addr2).buyTicket(0, { value: price})
            expect(await raffle.getTicketsBoughtLength(0)).to.equal(2)
            
            const halfDuration = duration * 3600 / 2;
            await helpers.time.increase(halfDuration);

            await expect(raffle.connect(addr2).claimRefund(0)).to.be.revertedWith('This raffle is still going');
            
            await helpers.time.increase(halfDuration + 100);

            await expect(raffle.connect(addr3).claimRefund(0)).to.be.revertedWith('You did not participate to this raffle.');
            await raffle.connect(addr1).claimRefund(0);
            let balance3 = parseInt(await addr1.getBalance())
            expect(balance3).to.greaterThan(balance2)
            await expect(raffle.connect(addr1).claimRefund(0)).to.be.revertedWith('This raffle already got refunded for this address.');
        })
    })
})