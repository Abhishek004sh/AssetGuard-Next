import {
    Navigate
} from "react-router-dom";


import {
    useContext
} from "react";


import {
    AuthContext
} from "../context/AuthContext";



function PrivateRoute({children}){


    const {
        token,
        authLoading
    } = useContext(AuthContext);


    if(authLoading){

        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Loading...
            </div>
        );

    }


    if(!token){

        return <Navigate to="/login"/>

    }


    return children;


}


export default PrivateRoute;
