import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Home = () => {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    let navigate = useNavigate(); 

    const createItems = () => {
        let item = {
            name: "Coin Flip",
            description: "Double your coins!",
            image: coinflipImage,
            path: "/coinflip"
        }

        if (items.length == 0) {
            items.push(item)
        }

        setLoading(false)
    }

    const play = (item) => {
        navigate(item.path);
    }

    useEffect(() => {
        // createItems()
    }, [])

    return (
        <div className="flex justify-center">
            <div className="px-5 container">
                NFT Raffle Placeholder Page
            </div>
        </div>
    );
}
export default Home