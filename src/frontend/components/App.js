import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';

import { useState } from 'react'
import { ethers } from 'ethers'
import { useEffect } from 'react'

import TokenAbi from '../contractsData/Token.json'
import TokenAddress from '../contractsData/Token-address.json'

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)

function App() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [account, setAccount] = useState(null)

  let provider;

  useEffect(async () => {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    await updateCurrentTimestampFromBlockchain()
    loadItems()
  }, [])

  const loadItems = () => {
    console.log("loadItems")
    let itemsTemp = []

    itemsTemp.push({
      id: 1,
      name: "MAYC #18341",
      image: "https://boredlucky.com/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2FvVAhsatqKexyoJhCs-S7WriLXEoepP_Fp9OzUCKjiG3MWGew-9HEIqZGzHe4dMHHeNo_1uYno1ipXOR3Svp2Objtc4yZaqmJsAu42A&w=1920&q=80",
      timestampStart: 1668221256,
      duration: 12,
      dollarValue: 31800,
      totalSupply: 500,
      price: 0.05,
      projectName: "Mutant Ape Yacht Club",
      ticketsBought: ["0x1", "0x1", "0x2"],
      winner: null,
      ended: false,
      nftContractAddress: "0x60E4d786628Fea6478F785A6d7e704777c86a7c6"
    })

    itemsTemp.push({
      id: 0,
      name: "Doodle #8761",
      image: "https://boredlucky.com/_next/image?url=https%3A%2F%2Flh3.googleusercontent.com%2F4990XWkl9GGLi8vz5jmO2RXX3vhsaIutOAJPQdB65eQ60dKwXQE7i9oiZCmUYnrwSmbGJ6ipRLKG2VXSIQyBfJ1db-BfrrZw8xwZXg&w=1920&q=80",
      timestampStart: 1668201056,
      duration: 12,
      dollarValue: 12720,
      totalSupply: 110,
      price: 0.1,
      projectName: "Doodles",
      ticketsBought: [],
      winner: null,
      ended: false,
      nftContractAddress: "0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e"
    })

    console.log(itemsTemp)

    setItems(itemsTemp)
    setLoading(false)
  }
  
  const updateCurrentTimestampFromBlockchain = async () => {
    console.log("getCurrentTimestamp")
    const currentBlock = await provider.getBlockNumber();
    const currentTimestampTemp = (await provider.getBlock(currentBlock)).timestamp;

    console.log(currentTimestampTemp)
    setCurrentTimestamp(currentTimestampTemp)
  }

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    const signer = provider.getSigner()

    const _token = new ethers.Contract(TokenAddress.address, TokenAbi.abi, signer)
  }

  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />

          <Routes>
            <Route path="/" element={
              <Home loading={loading} items={items} currentTimestamp={currentTimestamp}/>
            } />
            {/*
            <Route path="/coinflip" element={
              <CoinFlip coinflip={coinflip}/>
            } /> */}
          </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
