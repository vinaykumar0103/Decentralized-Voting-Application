const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const PREFIX = '!';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // Ignore messages from other bots
  if (!message.content.startsWith(PREFIX)) return; // Ignore messages that don't start with the prefix

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ongoingelections') {
    try {
      const response = await axios.get('http://localhost:3000/elections');
      const elections = response.data;
      message.channel.send(`Ongoing Elections:\n${elections.map(election => `- ${election.name}`).join('\n')}`);
    } catch (error) {
      console.error('Error fetching ongoing elections:', error);
      message.channel.send('An error occurred while fetching ongoing elections.');
    }
  }

  if (command === 'registercandidate') {
    const electionId = args[0];
    const candidateName = args.slice(1).join(' ');

    if (!electionId || !candidateName) {
      message.channel.send('Usage: !registercandidate <election_id> <candidate_name>');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/elections/${electionId}/candidates`, { name: candidateName });
      message.channel.send(`Successfully registered as a candidate for Election ${electionId}.`);
    } catch (error) {
      console.error('Error registering as a candidate:', error);
      message.channel.send('An error occurred while registering as a candidate.');
    }
  }

  if (command === 'vote') {
    const electionId = args[0];
    const candidateId = args[1];

    if (!electionId || !candidateId) {
      message.channel.send('Usage: !vote <election_id> <candidate_id>');
      return;
    }

    try {
      await axios.post(`http://localhost:3000/elections/${electionId}/vote`, { candidateId });
      message.channel.send(`Vote successfully cast for Candidate ${candidateId} in Election ${electionId}.`);
    } catch (error) {
      console.error('Error casting vote:', error);
      message.channel.send('An error occurred while casting the vote.');
    }
  }
});


client.login('');
