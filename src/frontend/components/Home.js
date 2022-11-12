import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Home = ({loading, items, currentTimestamp}) => {

    const enterRaffle = async(id) => {
        console.log("Enter Raffle " + id)
    }

    const units = {
        year: 31536000000,
        month: 2628000000,
        day: 86400000,
        hour: 3600000,
        minute: 60000,
        second: 1000,
    }

    const getTimeLeftString = (currentTimestamp, timestampStart, duration) => {
        // 06 Days 10 Hours 49 Mins 26 Secs
        const timestampEnd = timestampStart + duration * units.hour
        let timestampRelative = timestampEnd - currentTimestamp
        
        const daysLeft = Math.floor(timestampRelative / units.day)
        timestampRelative -= daysLeft * units.day

        const hoursLeft = Math.floor(timestampRelative / units.hour)
        timestampRelative -= hoursLeft * units.hour

        const minsLeft = Math.floor(timestampRelative / units.minute)
        timestampRelative -= minsLeft * units.minute

        const secsLeft = Math.floor(timestampRelative / units.second)

        return daysLeft + " Days " + hoursLeft + " Hours " + minsLeft + " Mins " + secsLeft + " Secs";
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    });

    return (
        <div className="flex justify-center">
            <div className="px-5 container mb-3">
                Winner of the raffle is determined as soon as all tickets are sold out. 
                If all tickets are not sold by the end of deadline the raffle is cancelled and participants get refund 
                guaranteed by smart contract.
            </div>
            <div className="px-5 container">
                <Row xs={1} md={2} lg={4} className="g-4 pb-5 pt-3">
                {!loading ? (
                    items.map((item, idx) => (
                        <Col key={idx} className="overflow-hidden">
                            <Card bg="dark">
                                <Card.Header>Value: {formatter.format(item.dollarValue)}</Card.Header>
                                <Card.Img variant="top" src={item.image} />
                                <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>
                                        {getTimeLeftString(currentTimestamp, item.timestampStart, item.duration)}
                                        <br/>
                                        <br/>
                                        Tickets Left: <br/> {item.totalSupply - item.ticketsBought.length} / {item.totalSupply}
                                        <br/>
                                        Price: {item.price} ETH
                                    </Card.Text>
                                </Card.Body>
                                <Card.Footer>
                                    <div className='d-grid'>
                                        <Button variant="success" size="lg" onClick={() => enterRaffle(item.id)}>
                                            Enter
                                        </Button>
                                    </div>
                                </Card.Footer>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <div>Loading...</div>
                )}
                </Row>
            </div>
        </div>
    );
}
export default Home