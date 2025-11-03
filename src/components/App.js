import React, { Component } from 'react';
import Navbar from './Navbar';
import Web3 from 'web3';
import Tether from '../out/Tether.sol/Tether.json';
import RWD from '../out/RWD.sol/RWD.json';
import DecentralBank from '../out/DecentralBank.sol/DecentralBank.json';
import ParticleSettings from './ParticleSettings';
import Main from './Main';
import deploymentData from './run-latest.json';
class App extends Component {

  async componentDidMount() {
    await this.loadWeb3();
    this.loadBlockchainData();
  }

  async loadWeb3() {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        
        await window.ethereum.enable();
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
      } else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      }
    } catch (error) {
      console.error("Failed to load web3 or enable Ethereum.", error);
      window.alert("Failed to connect to Ethereum. Please check your network and try again.");
    }
  }

  loadBlockchainData() {
    try {
      const web3 = window.web3;
      
      
      web3.eth.getAccounts().then(accounts => {
        if (accounts.length > 0) {
            this.setState({ account: accounts[0] });
            this.continueLoadingContracts(web3, accounts[0]);
        } else {
            console.error("No Ethereum accounts found or connected.");
            this.setState({ loading: false, isDataLoaded: false });
            window.alert("Please unlock and connect your Ethereum wallet (e.g., MetaMask).");
        }
      }).catch(err => {
        console.error("Could not get accounts:", err);
        this.setState({ loading: false, isDataLoaded: false });
        window.alert("Could not connect to your wallet.");
      });
    } catch (error) {
        console.error("Error during initial Web3 setup:", error);
        this.setState({ loading: false, isDataLoaded: false });
        window.alert("Critical initialization error.");
    }
  }

  // Extracted contract loading logic to handle async balance calls after account is set
  continueLoadingContracts = (web3, currentAccount) => {
    this.setState({ loading: true, account: currentAccount });

    // Helper function to get the contract address from the deployment log
    const getContractAddress = (contractName) => {
      const contract = deploymentData.transactions.find(tx => tx.contractName === contractName);
      return contract ? contract.contractAddress : null;
    };

    const tetherAddress = getContractAddress('Tether');
    const rwdAddress = getContractAddress('RWD');
    const decentralBankAddress = getContractAddress('DecentralBank');
    
    let allContractsLoaded = true;

    const promises = [];

    // Load Tether Token
    if (tetherAddress) {
      const tether = new web3.eth.Contract(Tether.abi, tetherAddress);
      this.setState({ tether, tetherAddress });
      // Fetch balance asynchronously
      promises.push(
          tether.methods.balanceOf(currentAccount).call()
              .then(tetherBalance => {
                  this.setState({ tetherBalance: tetherBalance.toString() });
              })
      );
    } else {
      window.alert('Tether contract address not found in deployment log.');
      allContractsLoaded = false;
    }

    // Load RWD Token
    if (rwdAddress) {
      const rwd = new web3.eth.Contract(RWD.abi, rwdAddress);
      this.setState({ rwd, rwdAddress });
      // Fetch balance asynchronously
      promises.push(
          rwd.methods.balanceOf(currentAccount).call()
              .then(rwdBalance => {
                  this.setState({ rwdBalance: rwdBalance.toString() });
              })
      );
    } else {
      window.alert('Reward contract address not found in deployment log.');
      allContractsLoaded = false;
    }
    
    // Load DecentralBank
    if (decentralBankAddress) {
      const decentralBank = new web3.eth.Contract(DecentralBank.abi, decentralBankAddress);
      this.setState({ decentralBank, decentralBankAddress });
      // Fetch balance asynchronously
      promises.push(
          decentralBank.methods.stakingBalance(currentAccount).call()
              .then(stakingBalance => {
                  this.setState({ stakingBalance: stakingBalance.toString() });
              })
      );
    } else {
      window.alert('DecentralBank contract address not found in deployment log.');
      allContractsLoaded = false;
    }
    
    // Wait for all balance calls to complete
    Promise.all(promises).finally(() => {
        this.setState({ 
            loading: false,
            isDataLoaded: allContractsLoaded
        });
    });
  }

  constructor(props) {
    super(props);
    this.state = {
      account: '0x0',
      tether: {},
      rwd: {},
      decentralBank: {},
      tetherBalance: '0',
      rwdBalance: '0',
      stakingBalance: '0',
      loading: true,
      isDataLoaded: false,
      tetherAddress: null,
      decentralBankAddress: null
    };
  }

  // staking function
  stakeTokens = (amount) => {
    if (!this.state.tether.methods || !this.state.decentralBank.options.address) {
      console.error("Contracts not properly initialized.");
      window.alert("Contracts are not fully initialized.");
      return;
    }
    
    if (!amount || amount === '0') {
      console.error("Deposit amount cannot be zero or empty.");
      window.alert("Please enter a valid amount greater than zero to deposit.");
      return;
    }

    this.setState({ loading: true });

    // Step 1: Approve the DecentralBank to spend the Tether tokens
    this.state.tether.methods.approve(this.state.decentralBank.options.address, amount)
      .send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        // Step 2: Deposit tokens once approval is confirmed
        this.state.decentralBank.methods.depositTokens(amount)
          .send({ from: this.state.account })
          .on('transactionHash', (depositHash) => {
            console.log("Deposit Transaction Hash:", depositHash);
            this.setState({ loading: false });
            // Re-fetch data to update balances immediately after successful deposit
            this.continueLoadingContracts(window.web3, this.state.account);
          })
          .on('error', (error) => {
            console.error("Deposit Error:", error);
            this.setState({ loading: false });
            window.alert("Deposit failed. Check console for details.");
          });
      })
      .on('error', (error) => {
        console.error("Approval Reverted by EVM:", error);
        this.setState({ loading: false });
        window.alert(
          "Token approval failed (EVM Revert).\n\n" + 
          "POSSIBLE FIX: Check that your current wallet has enough mUSDT to cover the amount you entered. The 'Available' balance on the card must be greater than zero."
        );
      });
  };

  // unstaking function
  unstakeTokens = () => {
    if (!this.state.decentralBank || !this.state.decentralBank.options.address) {
      window.alert("DecentralBank contract is not loaded. Please provide the address.");
      return;
    }

    this.setState({ loading: true });
    this.state.decentralBank.methods.unstakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false });
      // Re-fetch data to update balances immediately after successful unstake
      this.continueLoadingContracts(window.web3, this.state.account);
    })
    .on('error', (error) => {
        console.error("Unstake Error:", error);
        this.setState({ loading: false });
        window.alert("Unstake failed. Check console for details.");
    });
  };

  render() {
    let content;
    
    if (this.state.loading) {
        content = <p id="loader" className='text-center' style={{ color: 'white', margin: '30px' }}>LOADING PLEASE...</p>;
    } 
    else if (!this.state.isDataLoaded) {
        content = <p className='text-center text-danger' style={{ color: 'red', margin: '30px', fontWeight: 'bold' }}>
            ERROR: Blockchain data could not be fully loaded. Check console for contract address errors.
        </p>;
    }
    else {
        content = <Main
            tetherBalance={this.state.tetherBalance}
            rwdBalance={this.state.rwdBalance}
            stakingBalance={this.state.stakingBalance}
            stakeTokens={this.stakeTokens}
            unstakeTokens={this.unstakeTokens}
            decentralBankContract={this.decentralBank}
            account={this.state.account}
            tetherAddress={this.state.tetherAddress}
            decentralBankAddress={this.state.decentralBankAddress}
        />;
    }


    return (
      <div className='App' style={{ position: 'relative', backgroundColor: '#0f172a', minHeight: '100vh' }}>
        <div style={{ position: 'absolute' }}>
          <ParticleSettings />
        </div>
        <Navbar account={this.state.account} />
        
        <div 
            className='container-fluid d-flex flex-column justify-content-center align-items-center' 
            style={{ 
                paddingTop: '56px',
                minHeight: 'calc(100vh - 56px)' 
            }}
        >
          <main role='main' style={{ maxWidth: '450px', width: '90%', margin: '20px 0' }}> 
            <div>
              {content}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default App;
