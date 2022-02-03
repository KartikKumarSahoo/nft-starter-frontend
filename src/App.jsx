import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

// Constants
const TWITTER_HANDLE = 'KartikKSahoo';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// TODO: Change this when a new contract is deployed
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-t3laea313b';
const TOTAL_MINT_COUNT = 50;

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [minting, setMinting] = useState(false);
  const [totalNFTsMinted, setTotalNFTsMinted] = useState(0);
  const CONTRACT_ADDRESS = "0x067A7cb439d745c01973558584209f3bB871f790";

  const checkIfWalletIsConnected = async () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
    * Check if we're authorized to access the user's wallet
    */
    const accounts = await ethereum.request({ method: 'eth_accounts' });

    /*
    * User can have multiple authorized accounts, we grab the first one if its there!
    */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      postAccountConnect();
    } else {
      console.log("No authorized account found")
    }
  }

  function postAccountConnect() {
    checkIfUserIsInCorrectNetwork();
    fetchTotalNTFsMintedSoFar();
    setupEventListener();
  }

  const checkIfUserIsInCorrectNetwork = async () => {
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      alert("You are not connected to the Rinkeby Test Network!");
    }
  }

  /*
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      /*
      * Fancy method to request access to account.
      */
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      /*
      * Boom! This should print out public address once we authorize Metamask.
      */
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      postAccountConnect();
    } catch (error) {
      console.log(error)
    }
  }

  function getContract() {
    const { ethereum } = window;
    // A "Provider" is what we use to actually talk to Ethereum nodes
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    // creates the connection to our contract
    const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, myEpicNft.abi, signer);

    return connectedContract;
  }

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const contract = getContract();

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        contract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber())
          setTotalNFTsMinted(totalNFTsMinted + 1);
          alert(`Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTotalNTFsMintedSoFar = async () => {
    try {
      const { ethereum } = window;

      if (window) {
        const contract = getContract();

        const totalNFTsMinted = await contract.getTotalNFTsMintedSoFar();
        setTotalNFTsMinted(totalNFTsMinted.toNumber());
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      setMinting(true);

      if (ethereum) {
        const contract = getContract();

        console.log("Going to pop wallet now to pay gas...")
        let nftTxn = await contract.makeAnEpicNFT();

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setMinting(false);
    }
  }

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <div className="mint-button-container">
      <button onClick={askContractToMintNft} className={`cta-button connect-wallet-button ${minting ? 'in-progress' : ''}`}>
        {minting ? "Minting NFT. Please wait..." : "Mint NFT"}
      </button>
      <span className="count">{totalNFTsMinted}/{TOTAL_MINT_COUNT} NFTs minted so far</span>
    </div>
  )

  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
          <div className="collection">
            <a href={OPENSEA_LINK} target="_blank">🌊 View Collection on OpenSea</a>
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;