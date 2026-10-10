import {
    useEffect,
    useState
} from "react";

import Layout from "../components/Layout";
import { getNotifications } from "../services/notification.service";
import { PageHeading, EmptyState, Row, Tag } from "../components/ui";


const typeTone = {
    WARRANTY: "brass",
    SUBSCRIPTION: "moss",
    SYSTEM: "ink"
};


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


            <PageHeading>
                Notifications
            </PageHeading>


            {loading && (
                <p className="text-slate text-sm">Loading...</p>
            )}


            {!loading && notifications.length === 0 && (

                <EmptyState>
                    No notifications yet. Warranty and subscription renewal
                    alerts will show up here as they come in.
                </EmptyState>

            )}


            <div className="flex flex-col gap-px bg-border">

                {
                    notifications.map((note)=>(

                        <Row key={note._id}>

                            <div className="flex justify-between items-start gap-3">

                                <h2 className="font-medium text-ink">
                                    {note.title}
                                </h2>

                                <Tag tone={typeTone[note.type] || "ink"}>
                                    {note.type}
                                </Tag>

                            </div>

                            <p className="text-slate text-sm mt-1">
                                {note.message}
                            </p>

                            <p className="text-xs text-slate/70 mt-2">
                                {new Date(note.createdAt).toLocaleString()}
                            </p>

                        </Row>

                    ))
                }

            </div>


        </Layout>

    );

}


export default Notifications;
