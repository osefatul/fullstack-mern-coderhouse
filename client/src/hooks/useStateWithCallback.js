import { useCallback, useEffect, useRef, useState } from "react"



export const useStateWithCallback = (initialState) => {
    const [state, setState] = useState(initialState);
    const cbRef = useRef(null);


    //In useCallback new function won't be created after state gets changed.
    const updateState = useCallback((newState, cb) => {
        cbRef.current = cb; // store current, passed callback in ref

        setState((prev) =>
            typeof newState === 'function' ? newState(prev) : newState
        );
    }, []);


    //when state changes we call cb function which is our goal.
    useEffect(() => {

        // cb.current is `null` on initial render, 
        // so we only invoke callback on state *updates*
        if (cbRef.current) {
            cbRef.current(state);// this will execute the callback
            cbRef.current = null; // reset callback after execution
        }
        
    }, [state]);

    return [state, updateState];
};