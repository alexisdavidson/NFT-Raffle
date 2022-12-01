// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Raffle is Ownable, ReentrancyGuard, VRFConsumerBaseV2 {
    struct Entry {
        uint256 id;
        uint256 duration;
        uint256 dollarValue;
        uint256 ticketsTotalSupply;
        uint256 price;
        string name;
        string image;
        string projectName;
        address[] ticketsBought;
        address winner;
        address nftAddress;
        bool canceled;
        uint256 timestampStart;
        mapping(address => bool) refunds;
    }

    Entry[] public entries;
    
    //VRF Chainlink **************************************************************************************
    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    // bytes32 keyHash = 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15; // goerli - Change this depending current blockchain!
    bytes32 keyHash = 0x8af398995b04c28e9951adb9721ef74c74f93e6a478f39e7e0777be13527e7ef; // mainnet - Change this depending current blockchain!
    uint32 callbackGasLimit = 200000;
    uint16 requestConfirmations = 3;
    uint32 numWords =  1;
    uint256[] public s_randomWords;
    uint256 public s_requestId;

    uint256[] private rafflesEndedQueue;
    
    event TicketBought(address user);
    event RaffleSoldOut(uint256 id);
    event RaffleCreated(uint256 id);

    constructor(address vrfCoordinator, uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
        // Initialize Chainlink Coordinator
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
    }

    function createRaffle(uint256 _duration, uint256 _dollarValue, uint256 _ticketsTotalSupply, uint256 _price, string memory _name, 
                            string memory _image, string memory _projectName, address _nftAddress) public onlyOwner {
        uint256 _entryId = entries.length; 
        Entry storage _entry = entries.push();

        _entry.id = _entryId;
        _entry.duration = _duration * 3600;
        _entry.dollarValue = _dollarValue;
        _entry.ticketsTotalSupply = _ticketsTotalSupply;
        _entry.price = _price;
        _entry.name = _name;
        _entry.image = _image;
        _entry.projectName = _projectName;
        _entry.nftAddress = _nftAddress;
        _entry.timestampStart = block.timestamp;

        emit RaffleCreated(_entryId);
    }

    function buyTicket(uint256 _entryId) public payable nonReentrant {
        Entry storage _entry = getEntryByIndex(_entryId);
        require(msg.value >= _entry.price, "Not enough ETH sent");
        require(_entry.ticketsBought.length < _entry.ticketsTotalSupply, "Raffle sold out!");

        _entry.ticketsBought.push(msg.sender);

        emit TicketBought(msg.sender);
        checkRaffleSoldOut(_entry);
    }

    function getEntryByIndex(uint256 _entryId) private view returns(Entry storage) {
        uint256 _entryLength = entries.length;
        for (uint256 i = 0; i < _entryLength;) {
            if (entries[i].id == _entryId)
                return entries[i];
            unchecked { ++i; }
        }

        revert("Entry not found");
    }

    function getEntryLength() public view returns(uint256) {
        return entries.length;
    }

    function getTicketsBoughtLength(uint256 _entryId) public view returns(uint256) {
        Entry storage _entry = getEntryByIndex(_entryId);
        return _entry.ticketsBought.length;
    }

    function checkRaffleSoldOutOwner(uint256 _entryId) public onlyOwner {
        Entry storage _entry = getEntryByIndex(_entryId);
        checkRaffleSoldOut(_entry);
    }

    function checkRaffleSoldOut(Entry storage _entry) private {
        if (_entry.ticketsBought.length >= _entry.ticketsTotalSupply) {
            requestRandomNumberForWinner(_entry.id);
            emit RaffleSoldOut(_entry.id);
        }
    }

    function processWinner(uint256 _entryId, uint256 _randomNumber) private {
        Entry storage _entry = getEntryByIndex(_entryId);
        _entry.winner = _entry.ticketsBought[_randomNumber % _entry.ticketsBought.length];
    }

    function cancelRaffle(uint256 _entryId) public onlyOwner {
        Entry storage _entry = getEntryByIndex(_entryId);
        _entry.canceled = true;
    }

    function isRaffleTimerEnded(Entry storage _entry) private view returns (bool) {
        return block.timestamp > _entry.timestampStart + _entry.duration;
    }

    function claimRefund(uint256 _entryId) public {
        Entry storage _entry = getEntryByIndex(_entryId);

        require(isRaffleTimerEnded(_entry), "This raffle is still going");
        require(!_entry.refunds[msg.sender], "This raffle already got refunded for this address.");

        uint256 _ticketsCountBoughtBySender;
        uint256 _participantsLength = _entry.ticketsBought.length;
        for (uint256 i = 0; i < _participantsLength;) {
            if (_entry.ticketsBought[i] == msg.sender)
                _ticketsCountBoughtBySender += 1;
            unchecked { ++i; }
        }

        require (_ticketsCountBoughtBySender > 0, "You did not participate to this raffle.");

        _entry.refunds[msg.sender] = true;
        
        payable(msg.sender).transfer(_ticketsCountBoughtBySender * _entry.price);
    }
    
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    function requestRandomNumberForWinner(uint256 _entryId) private {
        rafflesEndedQueue.push(_entryId);

        s_requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
    }

    // Callback function when random number from Chainlink is generated
    function fulfillRandomWords(
        uint256, /* requestId */
        uint256[] memory randomWords
    ) internal override {
        require(rafflesEndedQueue.length > 0, "No raffle ended in queue");
        s_randomWords = randomWords;
        processWinner(rafflesEndedQueue[rafflesEndedQueue.length - 1], s_randomWords[0]);
        rafflesEndedQueue.pop();
    }
}
