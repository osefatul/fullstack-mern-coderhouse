import React, { useState } from 'react';
import Card from '../../../components/shared/card/Card';
import Button from '../../../components/shared/button/Button';
import TextInput from '../../../components/shared/textInput/TextInput';
import { useDispatch, useSelector } from 'react-redux';
import { setName } from '../../../features/activateSlice';
import styles from './stepName.module.css';






const StepName = ({ onNext }) => {
    const dispatch = useDispatch();

    const { name } = useSelector((state) => state.activate);
    const [fullname, setFullname] = useState(name);

    function nextStep() {
        if (!fullname) {
            return;
        }
        dispatch(setName(fullname));
        onNext();
    }


    return (
        <>
            <Card title="What’s your full name?" icon="goggle-emoji">
                <TextInput
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                />
                <p className={styles.paragraph}>
                    People use real names at codershouse :) !
                </p>
                <div>
                    <Button onClick={nextStep} text="Next" />
                </div>
            </Card>
        </>
    );
};

export default StepName;