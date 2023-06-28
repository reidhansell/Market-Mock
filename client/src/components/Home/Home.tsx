import React from 'react';
import Nav from './Nav';

interface HomeProps {
    setAuth: (auth: boolean) => void;
}

const Home: React.FC<HomeProps> = ({ setAuth }) => {
    return (
        <>
            <Nav setAuth={setAuth} />
            <div>
                <h1>Welcome to the Home Page, {/*user*/}</h1>
                <p>This is the home page of your application.</p>
            </div>
        </>
    );
};

export default Home;

