import {
    createContext,
    useState,
    useEffect
} from "react";

import api from "../services/api";


// Context + provider live together here to keep the project simple.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext =
createContext();


export const AuthProvider = ({children})=>{


    const [user,setUser] = useState(null);


    const [token,setToken] = useState(
        localStorage.getItem("token")
    );


    const [authLoading,setAuthLoading] = useState(true);


    // Used by BOTH login and register, so a newly registered user
    // is signed in exactly the same way as someone logging in.
    const login = (newToken, newUser) => {

        localStorage.setItem("token", newToken);

        // A fresh session should pick its workspace again
        localStorage.removeItem("workspaceId");

        setToken(newToken);

        setUser(newUser);

    };


    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("workspaceId");

        setToken(null);

        setUser(null);

    };


    useEffect(()=>{

        const loadUser = async()=>{

            if(!token){

                setAuthLoading(false);

                return;

            }

            try{

                const res = await api.get("/auth/me");

                setUser(res.data.user);

            }
            catch{

                // Token invalid/expired - log the user out
                localStorage.removeItem("token");

                localStorage.removeItem("workspaceId");

                setToken(null);

                setUser(null);

            }
            finally{

                setAuthLoading(false);

            }

        };

        loadUser();

        // Only run this on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[]);


    return (

        <AuthContext.Provider
        value={{
            user,
            setUser,
            token,
            setToken,
            login,
            logout,
            authLoading
        }}
        >

            {children}

        </AuthContext.Provider>

    );


};
