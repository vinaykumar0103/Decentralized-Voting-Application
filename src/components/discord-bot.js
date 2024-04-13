// Import necessary modules
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Create a new Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

// Define the command prefix
const PREFIX = '!';

// Event listener for when the client is ready
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Event listener for incoming messages
client.on('messageCreate', async (message) => {
  // Ignore messages from bots
  if (message.author.bot) return; 
  // Ignore messages that don't start with the command prefix
  if (!message.content.startsWith(PREFIX)) return; 

  // Extract command and arguments from the message content
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Command to fetch ongoing elections
  if (command === 'ongoingelections') {
    try {
      // Fetch ongoing elections from the server
      const response = await axios.get('http://localhost:3000/elections');
      const elections = response.data;
      // Send a message listing the ongoing elections
      message.channel.send(`Ongoing Elections:\n${elections.map(election => `- ${election.name}`).join('\n')}`);
    } catch (error) {
      // Handle errors while fetching ongoing elections
      console.error('Error fetching ongoing elections:', error);
      message.channel.send('An error occurred while fetching ongoing elections.');
    }
  }

  // Command to register as a candidate
  if (command === 'registercandidate') {
    const electionId = args[0];
    const candidateName = args.slice(1).join(' ');

    if (!electionId || !candidateName) {
      // Send usage information if arguments are missing
      message.channel.send('Usage: !registercandidate <election_id> <candidate_name>');
      return;
    }

    try {
      // Register as a candidate for the specified election
      await axios.post(`http://localhost:3000/elections/${electionId}/candidates`, { name: candidateName });
      message.channel.send(`Successfully registered as a candidate for Election ${electionId}.`);
    } catch (error) {
      // Handle errors while registering as a candidate
      console.error('Error registering as a candidate:', error);
      message.channel.send('An error occurred while registering as a candidate.');
    }
  }

  // Command to cast a vote
  if (command === 'vote') {
    const electionId = args[0];
    const candidateId = args[1];

    if (!electionId || !candidateId) {
      // Send usage information if arguments are missing
      message.channel.send('Usage: !vote <election_id> <candidate_id>');
      return;
    }

    try {
      // Cast a vote for the specified candidate in the specified election
      await axios.post(`http://localhost:3000/elections/${electionId}/vote`, { candidateId });
      message.channel.send(`Vote successfully cast for Candidate ${candidateId} in Election ${electionId}.`);
    } catch (error) {
      // Handle errors while casting the vote
      console.error('Error casting vote:', error);
      message.channel.send('An error occurred while casting the vote.');
    }
  }
});

// Log in the client with the provided token
client.login('');
