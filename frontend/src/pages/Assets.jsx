import {
    useEffect,
    useState,
    useContext,
    useCallback
} from "react";

import Layout from "../components/Layout";
import AssetDetailsModal from "./AssetDetailsModal";
import { WorkspaceContext } from "../context/WorkspaceContext";
import {
    inputCls,
    primaryBtnCls,
    secondaryBtnCls,
    PageHeading,
    ErrorBanner,
    EmptyState,
    Row,
    Tag
} from "../components/ui";

import {
    getAssets,
    createAsset,
    updateAsset,
    deleteAsset
} from "../services/asset.service";



function Assets(){

    const emptyForm = {
        name:"",
        category:"",
        description:"",
        purchaseDate:"",
        purchasePrice:"",
        warrantyExpiry:"",
        serialNumber:""
    };

    // Role in the CURRENT workspace decides what the UI offers.
    // The backend checks this again on every request.
    const { currentWorkspaceId, isOwner, canEdit } = useContext(WorkspaceContext);

    const [form,setForm] = useState(emptyForm);

    const [assets,setAssets] = useState([]);
    const [editing,setEditing] = useState(null);

    const [search,setSearch] = useState("");
    const [page,setPage] = useState(1);
    const [pagination,setPagination] = useState({ total:0, page:1, pages:1 });

    const [selectedAsset,setSelectedAsset] = useState(null);

    const [showForm,setShowForm] = useState(false);
    const [saving,setSaving] = useState(false);
    const [error,setError] = useState("");


    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:
            e.target.value

        });

    };


    const loadAssets = useCallback(async (searchTerm = search, pageNum = page) => {

        try{

            const data = await getAssets({
                search: searchTerm,
                page: pageNum,
                limit: 10
            });

            setAssets(data.assets);

            setPagination(data.pagination);

            setError("");

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not load assets"
            );

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[page, currentWorkspaceId]);


    // Reload whenever the page changes OR the user switches workspace,
    // so we never show another workspace's assets.
    useEffect(()=>{

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAssets();

    },[loadAssets]);


    const handleSubmit = async (e) => {

        e.preventDefault();

        setSaving(true);

        setError("");

        try{

            if (editing) {

                const data = await updateAsset(editing._id, form);

                setAssets(
                    assets.map(asset =>
                        asset._id === editing._id ? data.asset : asset
                    )
                );

                setEditing(null);

            } else {

                await createAsset(form);

                await loadAssets();

            }

            setForm(emptyForm);

            setShowForm(false);

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not save the asset"
            );

        }
        finally{

            setSaving(false);

        }

    };


    const handleDelete = async (id) => {

        if(!window.confirm("Delete this asset?")) return;

        try{

            await deleteAsset(id);

            setAssets(assets.filter(asset => asset._id !== id));

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not delete the asset"
            );

        }

    };


    const handleEdit = (asset) => {

        setEditing(asset);

        setShowForm(true);

        setForm({
            name: asset.name,
            category: asset.category,
            description: asset.description || "",
            purchaseDate: asset.purchaseDate?.slice(0, 10) || "",
            purchasePrice: asset.purchasePrice,
            warrantyExpiry: asset.warrantyExpiry?.slice(0, 10) || "",
            serialNumber: asset.serialNumber || ""
        });

    };


    const handleCancelEdit = () => {

        setEditing(null);

        setForm(emptyForm);

        setShowForm(false);

    };


    const handleSearchSubmit = (e) => {

        e.preventDefault();

        setPage(1);

        loadAssets(search, 1);

    };


    // Keep the modal in sync after an invoice upload
    const handleInvoiceUploaded = (assetId, invoiceUrl) => {

        setAssets(
            assets.map(a =>
                a._id === assetId ? { ...a, invoiceUrl } : a
            )
        );

        setSelectedAsset(prev =>
            prev && prev._id === assetId
                ? { ...prev, invoiceUrl }
                : prev
        );

    };


    // Simple warranty label so the list is scannable at a glance
    const warrantyLabel = (asset) => {

        if(!asset.warrantyExpiry) return null;

        const days = Math.ceil(
            (new Date(asset.warrantyExpiry) - new Date()) / (1000*60*60*24)
        );

        if(days < 0)  return { text:"Warranty expired", tone:"rust" };
        if(days <= 30) return { text:`Expires in ${days}d`, tone:"brass" };
        return { text:"Under warranty", tone:"moss" };

    };


    return (

        <Layout>


            <PageHeading
                action={canEdit && !showForm && (
                    <button
                    onClick={() => setShowForm(true)}
                    className={primaryBtnCls}
                    >
                        Add asset
                    </button>
                )}
            >
                Assets
            </PageHeading>


            <ErrorBanner>{error}</ErrorBanner>


            <form onSubmit={handleSearchSubmit} className="mb-5 flex gap-2">

                <input
                placeholder="Search assets by name..."
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


            {showForm && canEdit && (

                <Row className="mb-6">

                    <form onSubmit={handleSubmit}>

                        <h2 className="font-display font-semibold mb-3 text-ink">
                            {editing ? "Edit asset" : "Add new asset"}
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            <input
                            name="name"
                            placeholder="Asset name"
                            value={form.name}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <input
                            name="category"
                            placeholder="Category"
                            value={form.category}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <input
                            name="purchasePrice"
                            type="number"
                            placeholder="Purchase price"
                            value={form.purchasePrice}
                            onChange={handleChange}
                            className={inputCls}
                            required
                            />

                            <input
                            name="serialNumber"
                            placeholder="Serial number (optional)"
                            value={form.serialNumber}
                            onChange={handleChange}
                            className={inputCls}
                            />

                            <div>
                                <label className="text-xs text-slate block mb-1">
                                    Purchase date
                                </label>
                                <input
                                name="purchaseDate"
                                type="date"
                                value={form.purchaseDate}
                                onChange={handleChange}
                                className={inputCls}
                                required
                                />
                            </div>

                            <div>
                                <label className="text-xs text-slate block mb-1">
                                    Warranty expiry
                                </label>
                                <input
                                name="warrantyExpiry"
                                type="date"
                                value={form.warrantyExpiry}
                                onChange={handleChange}
                                className={inputCls}
                                required
                                />
                            </div>

                        </div>

                        <textarea
                        name="description"
                        placeholder="Description (optional)"
                        value={form.description}
                        onChange={handleChange}
                        className={`${inputCls} mt-3`}
                        rows="2"
                        />

                        <div className="flex gap-2 mt-4">

                            <button
                            type="submit"
                            disabled={saving}
                            className={primaryBtnCls}
                            >
                                {saving
                                    ? "Saving..."
                                    : editing ? "Update asset" : "Add asset"
                                }
                            </button>

                            <button
                            type="button"
                            onClick={handleCancelEdit}
                            className={secondaryBtnCls}
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </Row>

            )}


            <div className="flex flex-col gap-px bg-border">

                {assets.length === 0 && (

                    <EmptyState>
                        {canEdit
                            ? "No assets yet. Add your first one above."
                            : "No assets in this workspace yet."
                        }
                    </EmptyState>

                )}

                {assets.map((asset)=>{

                    const w = warrantyLabel(asset);

                    return (

                        <Row
                        key={asset._id}
                        className="flex justify-between items-center flex-wrap gap-3"
                        >

                            <div className="min-w-0">

                                <div className="flex items-center gap-2 flex-wrap">

                                    <h2 className="font-display text-base font-semibold text-ink">
                                        {asset.name}
                                    </h2>

                                    {w && <Tag tone={w.tone}>{w.text}</Tag>}

                                    {asset.invoiceUrl && <Tag tone="ink">Invoice on file</Tag>}

                                </div>

                                <p className="text-slate text-sm mt-0.5">
                                    {asset.category} · <span className="font-mono">₹{asset.purchasePrice}</span>
                                </p>

                            </div>

                            <div className="flex gap-4 items-center text-sm shrink-0">

                                <button
                                onClick={() => setSelectedAsset(asset)}
                                className="text-ink hover:text-brass-strong transition-colors"
                                >
                                    View details
                                </button>

                                {canEdit && (

                                    <button
                                    onClick={() => handleEdit(asset)}
                                    className="text-ink hover:text-brass-strong transition-colors"
                                    >
                                        Edit
                                    </button>

                                )}

                                {/* Delete is owner-only. The backend rejects
                                    a member's DELETE call regardless. */}
                                {isOwner && (

                                    <button
                                    onClick={() => handleDelete(asset._id)}
                                    className="text-rust hover:underline"
                                    >
                                        Delete
                                    </button>

                                )}

                            </div>

                        </Row>

                    );

                })}

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


            <AssetDetailsModal
            asset={selectedAsset}
            canEdit={canEdit}
            onClose={() => setSelectedAsset(null)}
            onInvoiceUploaded={handleInvoiceUploaded}
            />


        </Layout>

    );

}


export default Assets;
