import React from 'react';
import Nav from './Nav';

const Home = (props) => {
    return (
        <>
            <Nav setAuth={props.setAuth} />
            <div>
                <h1>Welcome to the Home Page, {props.user}</h1>
                <p>This is the home page of your application.</p>
            </div>
        </>
    );
};

export default Home;
