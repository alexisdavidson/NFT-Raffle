// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Raffle is Ownable, ReentrancyGuard {
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
        bool ended;
        address nftAddress;
        bool canceled;
    }

    Entry[] public entries;
    
    event TicketBought(address user);
    event RaffleSoldOut(uint256 id);
    event RaffleCreated(uint256 id);

    constructor() { }

    function createRaffle(uint256 _duration, uint256 _dollarValue, uint256 _ticketsTotalSupply, uint256 _price, string memory _name, 
                            string memory _image, string memory _projectName, address _nftAddress) public onlyOwner {
        uint256 _entryId = entries.length; 
        entries.push(Entry(_entryId, _duration, _dollarValue, _ticketsTotalSupply, _price, _name, _image, _projectName,
                            new address[](0), address(0), false, _nftAddress, false));
        emit RaffleCreated(_entryId);
    }

    function buyTicket(uint256 _entryId) public payable nonReentrant {
        Entry storage _entry = getEntryByIndex(_entryId);
        require(msg.value >= _entry.price, "Not enough ETH sent");

        _entry.ticketsBought.push(msg.sender);

        emit TicketBought(msg.sender);
        checkRaffleSoldOut(_entry);
    }

    function getEntryByIndex(uint256 _entryId) internal view returns(Entry storage) {
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

    function checkRaffleSoldOut(Entry storage _entry) internal {
        if (_entry.ticketsBought.length >= _entry.ticketsTotalSupply) {
            // Call Chainlink to get random winner
            // Add raffle to queue

            _entry.ended = true;
            emit RaffleSoldOut(_entry.id);
        }
    }

    function cancelRaffle(uint256 _entryId) public onlyOwner {
        Entry storage _entry = getEntryByIndex(_entryId);
        _entry.canceled = true;
    }
    
    function withdraw() public onlyOwner {
        payable(msg.sender).transfer(address(this).balance);
    }
}
