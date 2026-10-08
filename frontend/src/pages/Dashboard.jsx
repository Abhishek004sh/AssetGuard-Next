import Layout from "../components/Layout";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/dashboard.service";
import { WorkspaceContext } from "../context/WorkspaceContext";


function StatCard({ label, value, sub, accent }){

    return (

        <div className="bg-white p-5 rounded-xl shadow">

            <h2 className="text-gray-500 text-sm">
                {label}
            </h2>

            <p className={`text-3xl font-bold mt-1 ${accent || ""}`}>
                {value}
            </p>

            {sub && (
                <p className="text-xs text-gray-400 mt-1">
                    {sub}
                </p>
            )}

        </div>

    );

}


function Dashboard(){

    const { currentWorkspaceId, currentWorkspace, role } = useContext(WorkspaceContext);

    const [stats,setStats] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");

    useEffect(()=>{


        const loadStats = async()=>{

            try{

                const data =
                await getDashboardStats();

                setStats(data);

            }
            catch(err){

                setError(
                    err.response?.data?.message ||
                    "Could not load dashboard"
                );

            }
            finally{

                setLoading(false);

            }

        };


        loadStats();


    },[currentWorkspaceId]);

    return (

        <Layout>


            <div className="mb-6">

                <h1 className="text-3xl font-bold">
                    Dashboard
                </h1>

                {currentWorkspace && (
                    <p className="text-gray-500 text-sm mt-1">
                        {currentWorkspace.name} &middot; you are {role === "OWNER" ? "the owner" : `a ${String(role || "").toLowerCase()}`}
                    </p>
                )}

            </div>

            {loading && (
                <p className="text-gray-500">Loading...</p>
            )}

            {!loading && error && (
                <div className="bg-white p-5 rounded-xl shadow text-red-500">
                    {error}
                </div>
            )}

            {!loading && !error && stats && (

                <>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                        <Link to="/assets">
                            <StatCard
                                label="Total Assets"
                                value={stats.assets.total}
                            />
                        </Link>

                        <StatCard
                            label="Warranty Expiring Soon"
                            value={stats.assets.warrantyExpiring}
                            sub="within 30 days"
                            accent={stats.assets.warrantyExpiring > 0 ? "text-orange-500" : ""}
                        />

                        <Link to="/subscriptions">
                            <StatCard
                                label="Active Subscriptions"
                                value={stats.subscriptions.total}
                            />
                        </Link>

                        <StatCard
                            label="Monthly Expense"
                            value={`₹ ${stats.subscriptions.monthlyExpense}`}
                        />

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">

                        <div className="bg-white p-5 rounded-xl shadow">

                            <h2 className="font-semibold mb-2">
                                Upcoming Renewals
                            </h2>

                            <p className="text-gray-500 text-sm">
                                {stats.subscriptions.upcomingRenewals} subscription(s)
                                renewing in the next 30 days.
                            </p>

                            <Link
                            to="/subscriptions"
                            className="text-blue-600 text-sm underline mt-2 inline-block"
                            >
                                View subscriptions
                            </Link>

                        </div>

                        <div className="bg-white p-5 rounded-xl shadow">

                            <h2 className="font-semibold mb-2">
                                Notifications
                            </h2>

                            <p className="text-gray-500 text-sm">
                                Check warranty and renewal alerts.
                            </p>

                            <Link
                            to="/notifications"
                            className="text-blue-600 text-sm underline mt-2 inline-block"
                            >
                                View notifications
                            </Link>

                        </div>

                    </div>

                </>

            )}


        </Layout>

    );

}


export default Dashboard;
