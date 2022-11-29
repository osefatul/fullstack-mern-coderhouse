import React, { useState } from 'react';
import Phone from './phone/Phone';
import Email from './email/Email';
import styles from './stepPhoneEmail.module.css';



const StepPhoneEmail = ({ onNext }) => {
    return (
        <>
            <div>Phone or Email component</div>
            <button onClick={onNext}>Next</button>
        </>
    );
};

export default StepPhoneEmail;