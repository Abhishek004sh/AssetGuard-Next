import Layout from "../components/Layout";
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../services/dashboard.service";
import { WorkspaceContext } from "../context/WorkspaceContext";


// A flat registry tile, not a shadowed card. The top rule is brass only
// when the number is something to act on; otherwise it stays quiet ink.
function StatTile({ label, value, sub, needsAttention, to }){

    const content = (

        <div
        className={`bg-surface border-t-2 ${needsAttention ? "border-brass" : "border-ink/15"} px-5 py-4 h-full`}
        >

            <p className="text-sm text-slate">
                {label}
            </p>

            <p className="font-display text-3xl font-semibold text-ink mt-1.5 tabular-nums">
                {value}
            </p>

            {sub && (
                <p className="text-xs text-slate mt-1">
                    {sub}
                </p>
            )}

        </div>

    );

    if(!to) return content;

    return (
        <Link to={to} className="block hover:brightness-[0.98] transition">
            {content}
        </Link>
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

    const roleLabel = role === "OWNER" ? "owner" : String(role || "").toLowerCase();

    return (

        <Layout>


            <div className="mb-7">

                <h1 className="font-display text-3xl font-semibold text-ink">
                    Dashboard
                </h1>

                {currentWorkspace && (
                    <p className="text-slate text-sm mt-1.5">
                        {currentWorkspace.name}{roleLabel && ` — you're the ${roleLabel} here`}
                    </p>
                )}

            </div>

            {loading && (
                <p className="text-slate text-sm">Loading...</p>
            )}

            {!loading && error && (
                <div className="bg-rust-tint border border-rust/20 px-5 py-4 text-rust text-sm">
                    {error}
                </div>
            )}

            {!loading && !error && stats && (

                <>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">

                        <StatTile
                            label="Total assets"
                            value={stats.assets.total}
                            to="/assets"
                        />

                        <StatTile
                            label="Warranty expiring soon"
                            value={stats.assets.warrantyExpiring}
                            sub="within 30 days"
                            needsAttention={stats.assets.warrantyExpiring > 0}
                        />

                        <StatTile
                            label="Active subscriptions"
                            value={stats.subscriptions.total}
                            to="/subscriptions"
                        />

                        <StatTile
                            label="Monthly expense"
                            value={<span className="font-mono">₹{stats.subscriptions.monthlyExpense}</span>}
                        />

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border mt-px">

                        <div className="bg-surface px-5 py-4">

                            <h2 className="font-medium text-ink mb-1.5">
                                Upcoming renewals
                            </h2>

                            <p className="text-slate text-sm">
                                {stats.subscriptions.upcomingRenewals} subscription(s)
                                renewing in the next 30 days.
                            </p>

                            <Link
                            to="/subscriptions"
                            className="text-brass-strong text-sm mt-2.5 inline-block hover:underline"
                            >
                                View subscriptions
                            </Link>

                        </div>

                        <div className="bg-surface px-5 py-4">

                            <h2 className="font-medium text-ink mb-1.5">
                                Notifications
                            </h2>

                            <p className="text-slate text-sm">
                                Warranty and renewal alerts for this workspace.
                            </p>

                            <Link
                            to="/notifications"
                            className="text-brass-strong text-sm mt-2.5 inline-block hover:underline"
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
