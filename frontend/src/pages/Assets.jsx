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

        if(days < 0)  return { text:"Warranty expired", cls:"bg-red-100 text-red-700" };
        if(days <= 30) return { text:`Expires in ${days}d`, cls:"bg-orange-100 text-orange-700" };
        return { text:"Under warranty", cls:"bg-green-100 text-green-700" };

    };


    return (

        <Layout>


            <div className="flex justify-between items-center mb-6 flex-wrap gap-3">

                <h1 className="text-3xl font-bold">
                    Assets
                </h1>

                {canEdit && !showForm && (

                    <button
                    onClick={() => setShowForm(true)}
                    className="bg-black text-white px-4 py-2 rounded-lg"
                    >
                        + Add Asset
                    </button>

                )}

            </div>


            {error && (

                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>

            )}


            <form onSubmit={handleSearchSubmit} className="mb-6 flex gap-2">

                <input
                placeholder="Search assets by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded-lg flex-1"
                />

                <button
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                    Search
                </button>

            </form>


            {showForm && canEdit && (

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-5 rounded-xl shadow mb-6"
                    >

                    <h2 className="font-semibold mb-3 text-gray-700">
                        {editing ? "Edit Asset" : "Add New Asset"}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <input
                        name="name"
                        placeholder="Asset Name"
                        value={form.name}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                        />

                        <input
                        name="category"
                        placeholder="Category"
                        value={form.category}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                        />

                        <input
                        name="purchasePrice"
                        type="number"
                        placeholder="Purchase Price"
                        value={form.purchasePrice}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        required
                        />

                        <input
                        name="serialNumber"
                        placeholder="Serial Number (optional)"
                        value={form.serialNumber}
                        onChange={handleChange}
                        className="border p-2 rounded"
                        />

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Purchase Date
                            </label>
                            <input
                            name="purchaseDate"
                            type="date"
                            value={form.purchaseDate}
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                            required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 block mb-1">
                                Warranty Expiry
                            </label>
                            <input
                            name="warrantyExpiry"
                            type="date"
                            value={form.warrantyExpiry}
                            onChange={handleChange}
                            className="border p-2 rounded w-full"
                            required
                            />
                        </div>

                    </div>

                    <textarea
                    name="description"
                    placeholder="Description (optional)"
                    value={form.description}
                    onChange={handleChange}
                    className="border p-2 rounded w-full mt-3"
                    rows="2"
                    />

                    <div className="flex gap-2 mt-4">

                        <button
                        type="submit"
                        disabled={saving}
                        className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
                        >
                            {saving
                                ? "Saving..."
                                : editing ? "Update Asset" : "Add Asset"
                            }
                        </button>

                        <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="bg-gray-200 px-4 py-2 rounded"
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            )}


            <div className="grid gap-3">

                {assets.length === 0 && (

                    <div className="bg-white p-5 rounded-xl shadow text-gray-500">
                        {canEdit
                            ? "No assets yet. Add your first one above."
                            : "No assets in this workspace yet."
                        }
                    </div>

                )}

                {assets.map((asset)=>{

                    const w = warrantyLabel(asset);

                    return (

                        <div
                        key={asset._id}
                        className="bg-white p-4 rounded-xl shadow flex justify-between items-center flex-wrap gap-3"
                        >

                            <div className="min-w-0">

                                <div className="flex items-center gap-2 flex-wrap">

                                    <h2 className="text-lg font-bold">
                                        {asset.name}
                                    </h2>

                                    {w && (
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${w.cls}`}>
                                            {w.text}
                                        </span>
                                    )}

                                    {asset.invoiceUrl && (
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                            Invoice
                                        </span>
                                    )}

                                </div>

                                <p className="text-gray-500 text-sm">
                                    {asset.category} &middot; ₹ {asset.purchasePrice}
                                </p>

                            </div>

                            <div className="flex gap-2">

                                <button
                                onClick={() => setSelectedAsset(asset)}
                                className="border border-gray-300 px-3 py-1.5 rounded text-sm hover:bg-gray-50"
                                >
                                    View Details
                                </button>

                                {canEdit && (

                                    <button
                                    onClick={() => handleEdit(asset)}
                                    className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm"
                                    >
                                        Edit
                                    </button>

                                )}

                                {/* Delete is owner-only. The backend rejects
                                    a member's DELETE call regardless. */}
                                {isOwner && (

                                    <button
                                    onClick={() => handleDelete(asset._id)}
                                    className="bg-red-500 text-white px-3 py-1.5 rounded text-sm"
                                    >
                                        Delete
                                    </button>

                                )}

                            </div>

                        </div>

                    );

                })}

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
