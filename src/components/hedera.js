import { Client, TopicMessageSubmitTransaction, TopicCreateTransaction } from '@hashgraph/sdk';

// Function to create and configure a Hedera client
export const createHederaClient = () => {
  const accountId = ""; // Replace with your actual account ID
  const privateKey = ""; // Replace with your actual private key
  const client = Client.forTestnet();
  client.setOperator(accountId, privateKey);
  console.log('Hedera client created successfully');
  return client;
};

// Function to create a topic and get the topic ID
const createTopic = async (client) => {
  try {
    const transaction = new TopicCreateTransaction();
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    console.log('Topic created successfully');
    console.log('Topic ID:', receipt.topicId.toString());
    return receipt.topicId;
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
};

// Function to submit a vote to the Hedera network
export const submitVoteToHedera = async (client, electionId, candidateId) => {
  try {
    // Create a topic and get the topic ID
    const topicId = await createTopic(client);

    const message = `${electionId}:${candidateId}`;
    const response = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);

    const receipt = await response.getReceipt(client);

    if (receipt) {
      console.log('Vote submitted to Hedera:');
      console.log('Transaction ID:', response.transactionId?.toString());
      console.log('Transaction Status:', receipt.status?.toString());
      // Log other relevant properties as needed
    } 

    return receipt; // Return the receipt here
  } catch (error) {
    console.error('Error submitting vote to Hedera:', error);
    throw error;
  }
};

// Example usage
(async () => {
  const client = createHederaClient();
  const electionId = 'election123';
  const candidateId = 'candidateA';

  await submitVoteToHedera(client, electionId, candidateId);
})();
