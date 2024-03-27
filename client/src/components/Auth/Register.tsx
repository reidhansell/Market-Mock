import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosResponse } from 'axios';
import { register, ResponseData } from '../../requests/auth';
import logo from '../../../logo/android-chrome-192x192.png';
import { FormField, Input, Button, Box, SpaceBetween, Container, Header, Spinner, Form } from '../../../theme/build/components/index';

interface RegisterProps {
    addAlert: (message: string) => void;
}

const Register: React.FC<RegisterProps> = ({ addAlert }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (password !== password2) {
                addAlert("Passwords do not match");
                return;
            }
            setLoading(true);
            const response: AxiosResponse<ResponseData> = await register(username, email, password);
            if (response.status === 200) {
                setRegistrationSuccess(true);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <Container>
                <Box textAlign="center">
                    <SpaceBetween size="xs">
                        <img src={logo} alt="logo" style={{ width: "100px" }} />
                        <Header variant="h1">Market Mock</Header>
                        {!registrationSuccess ? (
                            <>
                                <form onSubmit={handleRegister}>
                                    <Form actions={<Button fullWidth variant="primary">
                                        Register {loading ? <Spinner /> : null}
                                    </Button>}>
                                        <SpaceBetween size="xs">
                                            <FormField label="Username">
                                                <Input type="text" placeholder="Username" value={username} onChange={({ detail }) => setUsername(detail.value)} />
                                            </FormField>
                                            <FormField label="Email">
                                                <Input type="email" placeholder="Email" value={email} onChange={({ detail }) => setEmail(detail.value)} />
                                            </FormField>
                                            <FormField label="Password">
                                                <Input type="password" placeholder="Password" value={password} onChange={({ detail }) => setPassword(detail.value)} />
                                            </FormField>
                                            <FormField label="Confirm Password">
                                                <Input type="password" placeholder="Confirm Password" value={password2} onChange={({ detail }) => setPassword2(detail.value)} />
                                            </FormField>
                                        </SpaceBetween>
                                    </Form>
                                </form>
                                <Button fullWidth variant="link" onClick={() => navigate('/login')}>Already have an account? Login</Button>
                            </>
                        ) : (
                            <>
                                <Header variant="h2">A verification email has been sent.</Header>
                                <p>Please follow the link in the email from marketmock@gmail.com.</p>
                            </>
                        )}
                    </SpaceBetween>
                </Box>
            </Container>
        </div>
    );
};

export default Register;
