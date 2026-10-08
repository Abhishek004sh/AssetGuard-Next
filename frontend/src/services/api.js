import axios from "axios";


const api = axios.create({

    baseURL:"http://localhost:5000/api"

});



api.interceptors.request.use(

    (config)=>{


        const token =
        localStorage.getItem("token");


        if(token){

            config.headers.Authorization =
            `Bearer ${token}`;

        }


        // Tell the backend which workspace this request is about.
        // Everything (assets, subscriptions, dashboard) is scoped to it.
        const workspaceId =
        localStorage.getItem("workspaceId");


        if(workspaceId){

            config.headers["x-workspace-id"] = workspaceId;

        }


        return config;

    },

    (error)=>{

        return Promise.reject(error);

    }

);


// If the token is invalid/expired, the backend returns 401.
// Clear it and send the user back to login instead of leaving
// the app stuck showing stale/broken data.
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if(error.response?.status === 401){

            localStorage.removeItem("token");

            localStorage.removeItem("workspaceId");

            if(window.location.pathname !== "/login"){

                window.location.href = "/login";

            }

        }

        return Promise.reject(error);

    }

);


export default api;
