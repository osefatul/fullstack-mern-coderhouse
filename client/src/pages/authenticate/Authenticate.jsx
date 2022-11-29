import React, { useState } from 'react';
import StepPhoneEmail from '../Steps/stepPhoneEmail/StepPhoneEmail';
import StepOtp from '../Steps/stepOtp/StepOtp';

const steps = {
    1: StepPhoneEmail,
    2: StepOtp,
};

const Authenticate = () => {
    const [step, setStep] = useState(1);
    const Step = steps[step];

    function onNext() {
        setStep(step + 1);
    }

    return <Step onNext={onNext} />;
};

export default Authenticate;