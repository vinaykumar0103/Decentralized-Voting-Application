// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Voting is ReentrancyGuard {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Election {
        string name;
        mapping(address => bool) hasVoted;
        mapping(uint256 => bool) candidates; // Use uint256 as key for candidates
        uint256 totalVotes;
        uint256 totalCandidates;
        bool isActive;
    }

    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate) public candidates;
    
    uint256 public candidateCount;
    uint256 public electionCount;

    event NewElection(uint256 indexed id, string name);
    event NewCandidate(uint256 indexed electionId, string name);
    event Voted(uint256 indexed electionId, uint256 candidateId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyAdult(uint256 _age) {
        require(_age >= 18, "You must be at least 18 years old");
        _;
    }

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function createElection(string memory _name) external onlyOwner {
        electionCount++;
        elections[electionCount].name = _name;
        elections[electionCount].isActive = true;
        emit NewElection(electionCount, _name);
    }

    
    function registerCandidate(uint256 _electionId, string memory _candidateName, uint256 _voterAge) external onlyAdult(_voterAge) {
        require(_electionId <= electionCount, "Invalid election ID");
        require(elections[_electionId].isActive, "Election is not active");
        require(!elections[_electionId].candidates[candidateCount], "Candidate already registered");

        candidateCount++; // Increment candidate count
        candidates[candidateCount].id = candidateCount; // Assign candidate ID
        candidates[candidateCount].name = _candidateName;
        
        elections[_electionId].candidates[candidateCount] = true; // Store candidate ID in the election mapping
        elections[_electionId].totalCandidates++;
        
        emit NewCandidate(_electionId, _candidateName);
    }

    function vote(uint256 _electionId, uint256 _candidateId) external nonReentrant { // Change _candidateName to _candidateId
        require(_electionId <= electionCount, "Invalid election ID");
        require(elections[_electionId].isActive, "Election is not active");
        require(elections[_electionId].candidates[_candidateId], "Candidate is not registered");
        require(!elections[_electionId].hasVoted[msg.sender], "You have already voted");

        elections[_electionId].totalVotes++;
        candidates[_candidateId].voteCount++; // Update vote count for the candidate
        elections[_electionId].hasVoted[msg.sender] = true;

        emit Voted(_electionId, _candidateId); // Change event parameter to candidateId
    }

}
