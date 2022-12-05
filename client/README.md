

### WebRTC


### useStateWithCallback:
Problem: When clients gets added or removed from the list of a group then we need to run a callback function?
Ans: We can use useState hook, but that will re-render the whole application and we don't want that. so We are using a custom hook named useStateWithCallback.
We need to make a function where we can add new users into a group or removed users from the group for calling. Normally we would use useState when our clients list changes, but the cons of using useState in this condition is that it will re-render the whole component when the list of clients changes and we obviously don't want that. So we are using useRef in that case, and useCallback to run callback when user is added to the client list of the group.

`
setState(prev =>{
            return typeof newState === 'function'? newState(prev): newState
        })
`

We check if setState is function because common way of update a useState is like below:
`
setState((prev) => {[...prev, newState]})
`

then we call setState function or we call setState.