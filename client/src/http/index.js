import axios from 'axios';
const serverUrl = "http://localhost:5500"



const api = axios.create({
    // baseURL: process.env.REACT_APP_API_URL,
    baseURL: serverUrl,
    withCredentials: true, //use this for sending cookies
    headers: {
        'Content-type': 'application/json',
        Accept: 'application/json',
    },
});



// List of all the endpoints
export const sendOtp = (data) => api.post('/api/send-otp', data);
export const verifyOtp = (data) => api.post('/api/verify-otp', data);
export const activate = (data) => api.post('/api/activate', data);
export const logout = () => api.post('/api/logout');
export const createRoom = (data) => api.post('/api/rooms', data);
export const getAllRooms = () => api.get('/api/rooms');
export const getRoom = (roomId) => api.get(`/api/rooms/${roomId}`);


//Interceptors are functions that Axios calls for every request or response. You can use interceptors to transform the request before Axios sends it, or transform the response before Axios returns the response to your code. You can think of interceptors as Axios' equivalent to middleware in Express or Mongoose.

api.interceptors.response.use(
    (config) => {
        //we don't need to modify config...
        return config;
    },
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response.status === 401 &&
            originalRequest &&
            !originalRequest._isRetry
        ) {
            //if isRetry is false it means that our refresh token is also expired, so it will get in a loop of retrying.. so to get it out of the loop, we flip it true.
            originalRequest.isRetry = true;
            try {
                await axios.get(
                    serverUrl + `/api/refresh`,
                    {
                        withCredentials: true,
                    }
                );

                // send or repeat our original request the one we wanted to send before getting 401 error.
                return api.request(originalRequest);
            } catch (err) {
                console.log(err.message);
            }
        }
        throw error;
    }
);


export default api;
