require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    catapulta: {
      url: process.env.https://ethereum-sepolia-rpc.publicnode.com,
      accounts: [process.env.6e655499023d5d642787dac0130b92185529af9ec11b3d5ff59410c0cf848099],
      headers: {
        "x-api-key": process.env.drEdy42ewUji7qL2w5Ua
      }
    }
  },
  etherscan: {
    apiKey: process.env.drEdy42ewUji7qL2w5Ua
  }
};