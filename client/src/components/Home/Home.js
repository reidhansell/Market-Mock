import React from 'react';

const Home = (props) => {
    return (
        <div>
            <h1>Welcome to the Home Page, {props.user}</h1>
            <p>This is the home page of your application.</p>
        </div>
    );
};

export default Home;
