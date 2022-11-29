import React from 'react'
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";




function ProtectedRoutes({ children }) {
    const { user, isAuth } = useSelector((state) => state.auth);
    const location = useLocation()

    return (

        <div>
        {
            !isAuth?
            <Navigate to="/authenticate" state={{from:location}} replace/>
            : isAuth && !user.activated ?
            <Navigate to="/activate" state={{from:location}} replace/>
            : 
            <main>
                <Outlet/>
            </main>
        }
        </div>
        
    );
}

export default ProtectedRoutes