require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
   networks: {
    localnetwork: {
      url: "http://localhost:8545", 
      chainId: 1337, 
    },
   
  },
}
