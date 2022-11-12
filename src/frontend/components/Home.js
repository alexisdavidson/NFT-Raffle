import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import configContract from './configContract';
import coinflipImage from '../img/games/coinflip.jpg'

const Home = ({loading, items}) => {

    const enterRaffle = async(id) => {
        console.log("Enter Raffle " + id)
    }

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
                                <Card.Img variant="top" src={item.image} />
                                <Card.Body color="secondary">
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>
                                    {item.duration}
                                    <br/>
                                    {item.totalSupply}
                                    <br/>
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