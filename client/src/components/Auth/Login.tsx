import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../requests/auth';
import Axios from 'axios';
import config from '../../config.json';
import { UserContext } from '../../UserProvider';
import logo from '../../../logo/android-chrome-192x192.png';
import { FormField, Input, Button, Box, SpaceBetween, Container, Header, Form } from '../../../theme/build/components/index';

interface LoginProps {
    setAuth: (auth: boolean) => void;
}

const Login: React.FC<LoginProps> = ({ setAuth }) => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const response = await login(email, password);
            if (response.status === 200) {
                const response = await Axios.get(`${config.serverURL}/api/auth/`);
                if (response.status === 200) {
                    setUser(response.data)
                    setAuth(true);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Container>
                <Box textAlign="center">
                    <SpaceBetween size="xs">
                        <img src={logo} alt="logo" style={{ width: "100px" }} />
                        <Header variant="h1">Market Mock</Header>
                        <form onSubmit={handleLogin}>
                            <Form actions={<Button fullWidth variant="primary">Login</Button>}>
                                <SpaceBetween size="xs">
                                    <FormField label="Email">
                                        <Input type="email" placeholder="Email" value={email} onChange={({ detail }) => setEmail(detail.value)} />
                                    </FormField>
                                    <FormField label="Password">
                                        <Input type="password" placeholder="Password" value={password} onChange={({ detail }) => setPassword(detail.value)} />
                                    </FormField>
                                </SpaceBetween>
                            </Form>
                        </form>
                        <Button fullWidth variant="link" onClick={() => navigate('/register')}>Don't have an account? Register</Button>
                    </SpaceBetween>
                </Box>
            </Container>
        </div>
    );
};

export default Login;
