import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserQuests } from '../../requests/quest';
import { UserContext } from '../Common/UserProvider';
import "./Quests.css"

const Quests: React.FC = () => {
    const navigate = useNavigate();

    const { quests, setQuests } = useContext(UserContext);

    const fetchData = async () => {
        const userQuestData = await getUserQuests();
        console.log(userQuestData);
        setQuests(userQuestData.sort((a, b) => a.completion_date && !b.completion_date ? 1 : b.completion_date && !a.completion_date ? -1 : 0));
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div>
            <ul className={`quests`}>
                {quests.map((quest) => (
                    <li className={`quest ${quest.completion_date ? "completed" : ''}`} key={quest.quest_id} onClick={() => navigate("/quests")}>
                        <h3 className='quest-header'>{`${quest.name}`}</h3>
                        <p>{quest.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Quests;