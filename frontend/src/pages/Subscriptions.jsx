import {
    useEffect,
    useState,
    useContext
} from "react";

import Layout from "../components/Layout";
import { WorkspaceContext } from "../context/WorkspaceContext";

import {
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription
} from "../services/subscription.service";


function Subscriptions(){

    const emptyForm = {
        name:"",
        provider:"",
        amount:"",
        billingCycle:"MONTHLY",
        startDate:"",
        nextBillingDate:"",
        category:""
    };

    const { currentWorkspaceId, isOwner, canEdit } = useContext(WorkspaceContext);

    const [form,setForm] = useState(emptyForm);

    const [subscriptions,setSubscriptions] = useState([]);
    const [editing,setEditing] = useState(null);

    const [search,setSearch] = useState("");
    const [page,setPage] = useState(1);
    const [pagination,setPagination] = useState({ total:0, page:1, pages:1 });

    const [saving,setSaving] = useState(false);

    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:
            e.target.value

        });

    };

    const loadSubscriptions = async () => {

        const data = await getSubscriptions({
            search,
            page,
            limit: 10
        });

        setSubscriptions(data.subscriptions);

        setPagination(data.pagination);

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        try{

            if (editing) {

                const data = await updateSubscription(
                    editing._id,
                    form
                );

                setSubscriptions(
                    subscriptions.map(sub =>
                        sub._id === editing._id
                            ? data.subscription
                            : sub
                    )
                );

                setEditing(null);

            } else {

                await createSubscription(form);

                await loadSubscriptions();

            }

            setForm(emptyForm);

        }
        finally{

            setSaving(false);

        }

    };

    const handleDelete = async (id) => {

        await deleteSubscription(id);

        setSubscriptions(
            subscriptions.filter(
                sub => sub._id !== id
            )
        );

    };

    const handleEdit = (sub) => {

        setEditing(sub);

        setForm({
            name: sub.name,
            provider: sub.provider,
            amount: sub.amount,
            billingCycle: sub.billingCycle,
            startDate: sub.startDate?.slice(0, 10) || "",
            nextBillingDate: sub.nextBillingDate?.slice(0, 10) || "",
            category: sub.category || ""
        });

    };

    const handleCancelEdit = () => {

        setEditing(null);

        setForm(emptyForm);

    };


    useEffect(()=>{

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSubscriptions();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[page, currentWorkspaceId]);

    const handleSearchSubmit = (e) => {

        e.preventDefault();

        setPage(1);

        loadSubscriptions();

    };


    return (

        <Layout>


            <h1 className="text-3xl font-bold mb-6">
                Subscriptions
            </h1>

            <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">

                <input
                placeholder="Search subscriptions by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded flex-1"
                />

                <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded"
                >
                    Search
                </button>

            </form>

            {canEdit && (
            <form
                onSubmit={handleSubmit}
                className="bg-white p-5 rounded-xl shadow mb-6"
                >

                <h2 className="font-semibold mb-3 text-gray-700">
                    {editing ? "Edit Subscription" : "Add New Subscription"}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <input
                    name="name"
                    placeholder="Subscription Name"
                    value={form.name}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />


                    <input
                    name="provider"
                    placeholder="Provider"
                    value={form.provider}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />


                    <input
                    name="amount"
                    type="number"
                    placeholder="Amount"
                    value={form.amount}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    required
                    />


                    <select
                    name="billingCycle"
                    value={form.billingCycle}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    >
                        <option value="MONTHLY">Monthly</option>
                        <option value="YEARLY">Yearly</option>
                    </select>


                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Start Date
                        </label>
                        <input
                        name="startDate"
                        type="date"
                        value={form.startDate}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">
                            Next Billing Date
                        </label>
                        <input
                        name="nextBillingDate"
                        type="date"
                        value={form.nextBillingDate}
                        onChange={handleChange}
                        className="border p-2 rounded w-full"
                        required
                        />
                    </div>

                    <input
                    name="category"
                    placeholder="Category (optional)"
                    value={form.category}
                    onChange={handleChange}
                    className="border p-2 rounded"
                    />

                </div>


                <div className="flex gap-2 mt-4">

                    <button
                    type="submit"
                    disabled={saving}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
                    >
                        {saving
                            ? "Saving..."
                            : editing ? "Update Subscription" : "Add Subscription"
                        }
                    </button>

                    {editing && (

                        <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-300 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>

                    )}

                </div>


            </form>
            )}

            <div className="grid gap-4">


                {subscriptions.length === 0 && (

                    <div className="bg-white p-5 rounded-xl shadow text-gray-500">
                        No subscriptions yet. Add your first one above.
                    </div>

                )}

                {
                    subscriptions.map((sub)=>(


                        <div
                        key={sub._id}
                        className="bg-white p-5 rounded-xl shadow"
                        >


                            <div className="flex justify-between items-start flex-wrap gap-2">

                                <div>

                                    <h2 className="text-xl font-bold">
                                        {sub.name}
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({sub.status})
                                        </span>
                                    </h2>

                                    <p className="text-gray-500 text-sm">
                                        {sub.provider} &middot; {sub.billingCycle}
                                    </p>

                                </div>

                                <div>

                                    {canEdit && (
                                        <button
                                            onClick={() => handleEdit(sub)}
                                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2 text-sm"
                                        >
                                            Edit
                                        </button>
                                    )}

                                    {/* Delete is owner-only; backend enforces it too */}
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(sub._id)}
                                            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Delete
                                        </button>
                                    )}

                                </div>

                            </div>

                            <p className="mt-2">
                                ₹ {sub.amount}
                            </p>

                            <p className="text-sm text-gray-500">
                                Next billing: {sub.nextBillingDate?.slice(0, 10)}
                            </p>

                        </div>


                    ))
                }


            </div>

            {pagination.pages > 1 && (

                <div className="flex justify-center gap-2 mt-6">

                    <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                        Prev
                    </button>

                    <span className="px-3 py-1 text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </span>

                    <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 rounded border disabled:opacity-40"
                    >
                        Next
                    </button>

                </div>

            )}


        </Layout>

    );

}


export default Subscriptions;
