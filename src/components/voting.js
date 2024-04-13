import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import '../index.css';
import VotingContract from '../Voting.json';
import { createHederaClient, submitVoteToHedera } from './hedera';

const CONTRACT_ADDRESS = '0x0bae40b835bf3fe7f61f69411dd7cd3e7ab27fe6';

const Voting = () => {
  // State variables for managing contract, account, elections, new election name, new candidate name, voter age, selected election ID,
  // selected candidate ID, and candidates
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [elections, setElections] = useState([]);
  const [newElectionName, setNewElectionName] = useState('');
  const [newCandidateName, setNewCandidateName] = useState('');
  const [voterAge, setVoterAge] = useState('');
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [candidates, setCandidates] = useState([]);

  // Function to connect the wallet to the decentralized application
  const connectWallet = async () => {
    try {
      if (window.ethereum && window.ethereum.request) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        throw new Error('Metamask extension not detected');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingContract.abi, signer);
      setContract(contract);

      const accounts = await provider.listAccounts();
      setAccount(accounts[0]);

      await fetchElections(); // Fetch elections when connecting wallet
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  useEffect(() => {
    connectWallet(); // Call connectWallet directly in useEffect
  }, []); 

  // Function to disconnect the wallet from the decentralized application
  const disconnectWallet = async () => {
    setContract(null);
    setAccount(null);
    setElections([]);
    setCandidates([]);
  };

  // Function to create a new election
  const createElection = async () => {
    try {
      if (!newElectionName) {
        throw new Error('Please enter a name for the new election.');
      }

      if (!contract || !account) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const createTx = await contract.createElection(newElectionName);
      await createTx.wait();
      setNewElectionName('');
      await fetchElections(); 
    } catch (error) {
      console.error('Error creating election:', error);
    }
  };

  // Function to fetch all elections
  const fetchElections = async () => {
    try {
      if (!contract) return;

      const numElections = await contract.electionCount();
      const electionsData = await Promise.all(
        Array.from({ length: numElections.toNumber() }, async (_, index) => {
          const election = await contract.elections(index + 1);
          return {
            id: index + 1,
            name: election.name,
            isActive: election.isActive,
            totalCandidates: election.totalCandidates.toNumber(),
            totalVotes: election.totalVotes.toNumber()
          };
        })
      );
      setElections(electionsData);
    } catch (error) {
      console.error('Error fetching elections:', error);
    }
  };

  // Function to fetch candidates for a specific election
  const fetchCandidates = async (electionId) => {
    try {
      if (!contract || !electionId) return;

      const election = await contract.elections(electionId);
      const candidateIds = await election.getActiveCandidateIds();
      const candidateData = await Promise.all(
        candidateIds.map(async (id) => {
          const candidate = await contract.candidates(id);
          return {
            id: id.toNumber(),
            name: candidate.name,
            age: candidate.age.toNumber()
          };
        })
      );
      setCandidates(candidateData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  // Use effect to update candidates when selected election ID changes
  useEffect(() => {
    const updateCandidates = async () => {
      const newCandidates = await fetchCandidates(selectedElectionId);
      setCandidates(newCandidates);
    };

    if (selectedElectionId) {
      updateCandidates();
    }
   
  }, [selectedElectionId]);

  // Use effect to listen for new candidate events from the contract
  useEffect(() => {
    if (contract) {
      contract.on("NewCandidate", (electionId, candidateName) => {
        console.log(`New candidate registered for election ${electionId}: ${candidateName}`);
      });
    }
  }, [contract]);

  // Use effect to listen for vote events from the contract
  useEffect(() => {
    if (contract) {
      contract.on("Voted", (electionId, candidateId) => {
        console.log(`Vote recorded for election ${electionId}, candidate ${candidateId}`);
      });
    }
  }, [contract]);

  // Function to render active election options for selection
  const renderActiveElectionOptions = () => {
    return elections.map(election => (
      election.isActive ? (
        <option key={election.id} value={election.id}>{election.name}</option>
      ) : null
    ));
  };

  // Function to render candidate options for selection
  const renderCandidateOptions = () => {
    if (!candidates || candidates.length === 0) {
      return <option value="">No candidates available</option>;
    }

    return candidates.map(candidate => (
      <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
    ));
  };

  // Function to register a new candidate for an election
  const registerCandidate = async () => {
    try {
      if (!selectedElectionId || !newCandidateName || !voterAge) {
        throw new Error('Please select an election, enter candidate name, and select age.');
      }

      if (!contract || !account) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      const activeElection = await contract.elections(selectedElectionId);
      if (!activeElection.isActive) {
        throw new Error('Selected election is not active.');
      }

      await contract.registerCandidate(selectedElectionId, newCandidateName, voterAge);
      console.log('Candidate registered successfully');
      setNewCandidateName('');
      setVoterAge('');
      await fetchCandidates(selectedElectionId); // Update candidates data after registering
      console.log('Candidates fetched successfully');
      setSelectedCandidateId('');
    } catch (error) {
      console.error('Error registering candidate:', error);
    }
  };

  // Function to vote to Ethereum blockchain
  const voteToEthereum = async () => {
    try {
      if (!selectedElectionId || !selectedCandidateId) {
        throw new Error('Please select an election and a candidate to vote for.');
      }

      if (!contract || !account) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      await contract.vote(selectedElectionId, selectedCandidateId);
      console.log('Vote to Ethereum successful');
    } catch (error) {
      console.error('Error voting to Ethereum:', error);
    }
  };

  // Function to vote to Hedera Hashgraph
  const voteToHedera = async () => {
    try {
      if (!selectedElectionId || !selectedCandidateId) {
        throw new Error('Please select an election and a candidate to vote for.');
      }

      const client = createHederaClient();
      await submitVoteToHedera(client, selectedElectionId, selectedCandidateId);
      console.log('Vote to Hedera successful');
    } catch (error) {
      console.error('Error voting to Hedera:', error);
    }
  };  

  // JSX to render the voting component
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-semibold mb-4">Elections {account}</h2>
      {!account ? (
        <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={connectWallet}>
          Connect Wallet
        </button>
      ) : (
        <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={disconnectWallet}>
          Disconnect Wallet
        </button>
      )}

      <h3 className="text-xl font-semibold mt-8 mb-2">Create Election</h3>
      <input className="input border rounded w-full py-2 px-3 mb-4" type="text" value={newElectionName} onChange={(e) => setNewElectionName(e.target.value)} />
      <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={createElection}>
        Create Election
      </button>

      <h3 className="text-xl font-semibold mt-8 mb-2">Register Candidate</h3>
      <select className="select border rounded w-full py-2 px-3 mb-4" value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)}>
        <option value="">Select Election</option>
        {renderActiveElectionOptions()}
      </select>
      <input className="input border rounded w-full py-2 px-3 mb-2" type="text" value={newCandidateName} onChange={(e) => setNewCandidateName(e.target.value)} placeholder="Candidate Name" />
      <input className="input border rounded w-full py-2 px-3 mb-4" type="number" value={voterAge} onChange={(e) => setVoterAge(e.target.value)} min="18" placeholder="Voter Age" />
      <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={registerCandidate}>
        Register Candidate
      </button>

      <h3 className="text-xl font-semibold mt-8 mb-2">Vote to Ethereum</h3>
      <select className="select border rounded w-full py-2 px-3 mb-4" value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)}>
        <option value="">Select Election</option>
        {renderActiveElectionOptions()}
      </select>
      <select className="select border rounded w-full py-2 px-3 mb-2" value={selectedCandidateId} onChange={(e) => setSelectedCandidateId(e.target.value)}>
        <option value="">Select Candidate</option>
        {renderCandidateOptions()}
      </select>
      <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={voteToEthereum}>
        Vote
      </button>

      <h3 className="text-xl font-semibold mt-8 mb-2">Vote to Hedera Hashgraph</h3>
      <select className="select border rounded w-full py-2 px-3 mb-4" value={selectedElectionId} onChange={(e) => setSelectedElectionId(e.target.value)}>
        <option value="">Select Election</option>
        {renderActiveElectionOptions()}
      </select>
      <select className="select border rounded w-full py-2 px-3 mb-2" value={selectedCandidateId} onChange={(e) => setSelectedCandidateId(e.target.value)}>
        <option value="">Select Candidate</option>
        {renderCandidateOptions()}
      </select>
      <button className="button bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={voteToHedera}>
        Vote
      </button>
    </div>
  );
};

export default Voting;
