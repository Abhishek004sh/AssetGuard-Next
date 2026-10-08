import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";

import { getNotifications } from "../services/notification.service";


function Notifications(){

    const [notifications,setNotifications] = useState([]);
    const [loading,setLoading] = useState(true);


    useEffect(()=>{


        const loadNotifications = async()=>{

            try{

                const data =
                await getNotifications();

                setNotifications(
                    data.notifications
                );

            }
            finally{

                setLoading(false);

            }

        };


        loadNotifications();


    },[]);


    return (

        <Layout>


            <h1 className="text-3xl font-bold mb-6">
                Notifications
            </h1>


            {loading && (
                <p className="text-gray-500">Loading...</p>
            )}


            {!loading && notifications.length === 0 && (

                <div className="bg-white p-5 rounded-xl shadow text-gray-500">
                    No notifications yet. Warranty and subscription renewal
                    alerts will show up here as they come in.
                </div>

            )}


            <div className="grid gap-3">

                {
                    notifications.map((note)=>(

                        <div
                        key={note._id}
                        className={`bg-white p-4 rounded-xl shadow border-l-4 ${
                            note.type === "WARRANTY"
                                ? "border-orange-400"
                                : note.type === "SUBSCRIPTION"
                                ? "border-blue-400"
                                : "border-gray-300"
                        }`}
                        >

                            <div className="flex justify-between items-start">

                                <h2 className="font-semibold">
                                    {note.title}
                                </h2>

                                <span className="text-xs text-gray-400">
                                    {note.type}
                                </span>

                            </div>

                            <p className="text-gray-600 text-sm mt-1">
                                {note.message}
                            </p>

                            <p className="text-xs text-gray-400 mt-2">
                                {new Date(note.createdAt).toLocaleString()}
                            </p>

                        </div>

                    ))
                }

            </div>


        </Layout>

    );

}


export default Notifications;
