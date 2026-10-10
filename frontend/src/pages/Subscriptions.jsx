import {
    useEffect,
    useState,
    useContext
} from "react";

import Layout from "../components/Layout";
import { WorkspaceContext } from "../context/WorkspaceContext";
import {
    inputCls,
    primaryBtnCls,
    secondaryBtnCls,
    PageHeading,
    EmptyState,
    Row,
    Tag
} from "../components/ui";

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


            <PageHeading>
                Subscriptions
            </PageHeading>

            <form onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">

                <input
                placeholder="Search subscriptions by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls} flex-1`}
                />

                <button
                type="submit"
                className={secondaryBtnCls}
                >
                    Search
                </button>

            </form>

            {canEdit && (

                <Row className="mb-6">

                    <form onSubmit={handleSubmit}>

                        <h2 className="font-display font-semibold mb-3 text-ink">
                            {editing ? "Edit subscription" : "Add new subscription"}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <input
                            name="name"
                            placeholder="Subscription name"
                            value={form.name}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <input
                            name="provider"
                            placeholder="Provider"
                            value={form.provider}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <input
                            name="amount"
                            type="number"
                            placeholder="Amount"
                            value={form.amount}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <select
                            name="billingCycle"
                            value={form.billingCycle}
                            onChange={handleChange}
                            className={inputCls}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                            </select>

                            <div>
                                <label className="text-xs text-slate block mb-1">
                                    Start date
                                </label>
                                <input
                                name="startDate"
                                type="date"
                                value={form.startDate}
                                onChange={handleChange}
                                className={inputCls}
                                required
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate block mb-1">
                                    Next billing date
                                </label>
                                <input
                                name="nextBillingDate"
                                type="date"
                                value={form.nextBillingDate}
                                onChange={handleChange}
                                className={inputCls}
                                required
                                />
                            </div>

                            <input
                            name="category"
                            placeholder="Category (optional)"
                            value={form.category}
                            onChange={handleChange}
                            className={inputCls}
                            />

                        </div>


                        <div className="flex gap-2 mt-4">

                            <button
                            type="submit"
                            disabled={saving}
                            className={primaryBtnCls}
                            >
                                {saving
                                    ? "Saving..."
                                    : editing ? "Update subscription" : "Add subscription"
                                }
                            </button>

                            {editing && (

                                <button
                                type="button"
                                onClick={handleCancelEdit}
                                className={secondaryBtnCls}
                                >
                                    Cancel
                                </button>

                            )}

                        </div>

                    </form>

                </Row>

            )}

            <div className="flex flex-col gap-px bg-border">


                {subscriptions.length === 0 && (

                    <EmptyState>
                        No subscriptions yet. Add your first one above.
                    </EmptyState>

                )}

                {
                    subscriptions.map((sub)=>(

                        <Row
                        key={sub._id}
                        className="flex justify-between items-start flex-wrap gap-3"
                        >

                            <div>

                                <div className="flex items-center gap-2 flex-wrap">

                                    <h2 className="font-display text-base font-semibold text-ink">
                                        {sub.name}
                                    </h2>

                                    <Tag tone={sub.status === "ACTIVE" ? "moss" : "ink"}>
                                        {sub.status}
                                    </Tag>

                                </div>

                                <p className="text-slate text-sm mt-0.5">
                                    {sub.provider} · {sub.billingCycle.toLowerCase()}
                                </p>

                                <p className="mt-2 font-mono text-ink">
                                    ₹{sub.amount}
                                </p>

                                <p className="text-sm text-slate">
                                    Next billing: {sub.nextBillingDate?.slice(0, 10)}
                                </p>

                            </div>

                            <div className="flex gap-4 items-center text-sm shrink-0">

                                {canEdit && (
                                    <button
                                        onClick={() => handleEdit(sub)}
                                        className="text-ink hover:text-brass-strong transition-colors"
                                    >
                                        Edit
                                    </button>
                                )}

                                {/* Delete is owner-only; backend enforces it too */}
                                {isOwner && (
                                    <button
                                        onClick={() => handleDelete(sub._id)}
                                        className="text-rust hover:underline"
                                    >
                                        Delete
                                    </button>
                                )}

                            </div>

                        </Row>

                    ))
                }


            </div>

            {pagination.pages > 1 && (

                <div className="flex justify-center items-center gap-3 mt-6">

                    <button
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="text-sm border border-border px-3 py-1.5 text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-border transition-colors"
                    >
                        Prev
                    </button>

                    <span className="text-sm text-slate">
                        Page {pagination.page} of {pagination.pages}
                    </span>

                    <button
                    disabled={page >= pagination.pages}
                    onClick={() => setPage(page + 1)}
                    className="text-sm border border-border px-3 py-1.5 text-ink hover:border-ink disabled:opacity-40 disabled:hover:border-border transition-colors"
                    >
                        Next
                    </button>

                </div>

            )}


        </Layout>

    );

}


export default Subscriptions;
