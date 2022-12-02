import React from 'react'
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";




function SemiProtectRoutes({ children }){
    const { user, isAuth } = useSelector((state) => state.auth);
    const location = useLocation()

    return (

        <div>
        {
            !isAuth?
            <Navigate to="/" state={{from:location}} replace/>
            : isAuth && !user.activated ?
            <main>
                <Outlet/>
            </main>:
            <Navigate to="rooms" state={{from:location}} replace/>
        }
        </div>

    );
}

export default SemiProtectRoutes