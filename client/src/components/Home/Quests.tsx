import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserQuests } from '../../requests/quest';
import { UserContext } from '../../UserProvider';
import { Box, Header, Button, SpaceBetween, Link, Container } from '../../../theme/build/components/index';

interface QuestProps {
    fullscreen: boolean;
}

const Quests: React.FC<QuestProps> = ({ fullscreen }) => {
    const navigate = useNavigate();

    const { quests, setQuests } = useContext(UserContext);

    const fetchData = async () => {
        const userQuestData = await getUserQuests();
        setQuests(userQuestData.sort((a, b) => a.completion_date && !b.completion_date ? 1 : b.completion_date && !a.completion_date ? -1 : 0));
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Box padding="m">
            <SpaceBetween size='m'>
                <Header
                    variant="h1"
                    actions={
                        !fullscreen &&
                        <Button variant="primary" onClick={() => navigate('/quests')}>
                            See All Quests
                        </Button>
                    }>
                    Quests
                </Header>
                {fullscreen ? (<>
                    <Header variant="h2">About</Header>
                    Quests serve as Market Mock's tutorial. Start from the top (or not) and work your way down!
                    <i><small>Still confused? Fear not! Nerd Wallet has a great article <Link external href="https://www.nerdwallet.com/article/investing/how-to-buy-stocks">here</Link> that can help you get started.</small></i>
                    <Header variant="h2">Your Quests</Header>
                </>) : null}
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <SpaceBetween size='m'>
                        {quests.map((quest) => (<Container key={quest.quest_id}>
                            <Header variant="h3">{`${quest.name}`} {quest.completion_date ? " (Complete)" : null}</Header>
                            {quest.completion_date ? <s>{quest.description}</s> : `${quest.description}`}
                        </Container>
                        ))}
                    </SpaceBetween>
                </div>
            </SpaceBetween>
        </Box>
    )
};

export default Quests;