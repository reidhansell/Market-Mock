import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserQuests } from '../../requests/quest';
import { UserContext } from '../Common/UserProvider';
import "./Quests.css"
import DashboardModule from '../Common/DashboardModule';

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

    const content = (<div>
        {fullscreen ? (<>
            <h2>About</h2>
            <p>Quests serve as Market Mock's tutorial. Start from the top (or not) and work your way down!</p>
            <br />
            <i><small>Still confused? Fear not! Nerd Wallet has a great article <a className="quest-link" target="_blank" href="https://www.nerdwallet.com/article/investing/how-to-buy-stocks">here</a> that can help you get started. You can also look out for tooltip icons throughout the app that will explain terms, just hover your mouse over them!</small></i>
            <br />
            <br />
            <h2>Your Quests</h2>
        </>) : null}
        <ul className={`quests`}>
            {quests.map((quest) => (
                <li className={`quest ${quest.completion_date ? "completed" : ''} ${fullscreen ? "fullscreen" : ''}`} key={quest.quest_id} onClick={() => navigate("/quests")}>
                    <h3 className='quest-header'>{`${quest.name}`}</h3>
                    <p>{quest.description}</p>
                </li>
            ))}
        </ul>
    </div>)

    return (
        <DashboardModule title="Quests" content={content} fullscreen={fullscreen} />
    );
};

export default Quests;