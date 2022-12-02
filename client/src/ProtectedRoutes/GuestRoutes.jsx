import React from 'react'
import {  useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";



function GuestRoutes({ children}) {

    const { isAuth } = useSelector((state) => state.auth);
    const location = useLocation()

    return (

        <div>
        {
            isAuth?
            <Navigate to="rooms" state={{from:location}} replace/>
            :
            <main>
                <Outlet/>
            </main>
        }   
        </div>

    );
}

export default GuestRoutes