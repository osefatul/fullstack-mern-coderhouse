import React, { useState } from 'react';
import Card from '../../../components/shared/card/Card';
import TextInput from '../../../components/shared/textInput/TextInput';
import Button from '../../../components/shared/button/Button';
import styles from './stepOtp.module.css';
import { verifyOtp } from '../../../http';
import { useSelector } from 'react-redux';
import { setAuth } from '../../../features/authSlice'
import { useDispatch} from 'react-redux';
import { useNavigate } from "react-router-dom";


const StepOtp = () => {
    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { phone, hash } = useSelector((state) => state.auth.otp);
    
    async function submit() {
        try {
            // empty return mean go no further in the function
            if (!otp || !phone || !hash) return;

            const { data } = await verifyOtp({ otp, phone, hash });
            console.log(data)
            dispatch(setAuth(data));
            if(data){
                navigate("/activate")
            }

        } catch (err) {
            console.log(err);
        }
    }


    return (
        <>
            <div className={styles.cardWrapper}>
                <Card
                    title="Enter the code we just texted you"
                    icon="lock-emoji"
                >
                    <TextInput
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <div className={styles.actionButtonWrap}>
                        <Button onClick={submit} text="Next" />
                    </div>
                    <p className={styles.bottomParagraph}>
                        By entering your number, you’re agreeing to our Terms of
                        Service and Privacy Policy. Thanks!
                    </p>
                </Card>
            </div>
        </>
    );
};

export default StepOtp;