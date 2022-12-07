import React, { useEffect, useState } from 'react';
import Card from '../../../components/shared/card/Card';
import Button from '../../../components/shared/button/Button';
import styles from './stepAvatar.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { setAvatar } from '../../../features/activateSlice';
import { activate } from '../../../http';
import { setAuth } from '../../../features/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../../../components/shared/loader/Loader';



const StepAvatar = ({ onNext }) => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();


    // console.log(location.state.from.pathname)


    const { name, avatar } = useSelector((state) => state.activate);
    const [image, setImage] = useState('/images/monkey-avatar.png');
    const [loading, setLoading] = useState(false);
    const [unMounted, setUnMounted] = useState(false);


    function captureImage(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            setImage(reader.result);
            dispatch(setAvatar(reader.result));
        };
    }



    async function submit() {

        if (!name || !avatar) return;
        setLoading(true);

        try {
            const { data } = await activate({ name, avatar });

            data.auth && data.user.activated && dispatch(setAuth(data));

            // if (data.auth) {
            //     if(!unMounted){
            //         dispatch(setAuth(data));
            //     }
            // }

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        return () => {
            setUnMounted(true);
        };
    }, []);

    if (loading) return <Loader message="Activation in progress..." />;





    return (
        <>
            <Card title={`Okay, ${name}`} icon="monkey-emoji">
                <p className={styles.subHeading}>How’s this photo?</p>
                <div className={styles.avatarWrapper}>
                    <img
                        className={styles.avatarImage}
                        src={image}
                        alt="avatar"
                    />
                </div>
                <div>
                    <input
                        onChange={captureImage}
                        id="avatarInput"
                        type="file"
                        className={styles.avatarInput}
                    />
                    <label className={styles.avatarLabel} htmlFor="avatarInput">
                        Choose a different photo
                    </label>
                </div>
                <div>
                    <Button onClick={submit} text="Next" />
                </div>
            </Card>
        </>
    );
};


export default StepAvatar;