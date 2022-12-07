import React from 'react';
import { Link } from 'react-router-dom';
import { logout } from '../../../http';
import styles from './navigation.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth } from '../../../features/authSlice';




const Navigation = () => {

    const dispatch = useDispatch();
    const { isAuth, user } = useSelector((state) => state.auth);
    async function logoutUser() {
        try {
            const { data } = await logout();
            dispatch(setAuth(data));
        } catch (err) {
            console.log(err);
        }
    }


    return (
        <nav className={`${styles.navbar} container`}>
            
            <Link className={styles.brandStyle} to="/">
                <img 
                    className={styles.logoAvatar} 
                    src="https://cdn-icons-png.flaticon.com/512/2408/2408462.png" alt="logo" />
                <span className={styles.logoText}>Codershouse</span>
            </Link>

            {isAuth && (
                <div className={styles.navRight}>
                    <h3>{user?.name}</h3>
                    <Link to="/">
                        <img
                            className={styles.avatar}
                            src={
                                user.avatar
                                    ? user.avatar
                                    : '/images/monkey-avatar.png'
                            }

                            alt="avatar"
                        />
                    </Link>
                    <button
                        className={styles.logoutButton}
                        onClick={logoutUser}
                    >
                        <img src="/images/logout.png" alt="logout" />
                    </button>
                </div>
            )}
        </nav>
    );
};
export default Navigation;