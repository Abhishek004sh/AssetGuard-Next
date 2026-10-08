import { useState } from "react";
import { uploadInvoice } from "../services/asset.service";


function Row({ label, value }){

    return (

        <div className="py-2 border-b last:border-b-0">

            <p className="text-xs text-gray-500">
                {label}
            </p>

            <p className="text-gray-800">
                {value || "-"}
            </p>

        </div>

    );

}


/*
 * Detail view for one asset. Invoice upload lives here so the
 * asset list itself stays clean and easy to scan.
 */
function AssetDetailsModal({ asset, canEdit, onClose, onInvoiceUploaded }){

    const [file, setFile] = useState(null);

    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");


    if(!asset) return null;


    const handleUpload = async () => {

        if(!file) return;

        setUploading(true);

        setError("");

        try{

            const data = await uploadInvoice(asset._id, file);

            onInvoiceUploaded(asset._id, data.invoiceUrl);

            setFile(null);

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Upload failed. Please try again."
            );

        }
        finally{

            setUploading(false);

        }

    };


    const formatDate = (d) => d ? d.slice(0, 10) : "";


    return (

        <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
        onClick={onClose}
        >

            <div
            className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            >

                <div className="flex justify-between items-start p-5 border-b">

                    <div>

                        <h2 className="text-2xl font-bold">
                            {asset.name}
                        </h2>

                        <p className="text-gray-500 text-sm">
                            {asset.category}
                        </p>

                    </div>

                    <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
                    aria-label="Close"
                    >
                        &times;
                    </button>

                </div>


                <div className="p-5">

                    <Row label="Purchase Price" value={`₹ ${asset.purchasePrice}`} />

                    <Row label="Purchase Date" value={formatDate(asset.purchaseDate)} />

                    <Row label="Warranty Expiry" value={formatDate(asset.warrantyExpiry)} />

                    <Row label="Serial Number" value={asset.serialNumber} />

                    <Row label="Description" value={asset.description} />


                    <div className="mt-5 pt-4 border-t">

                        <h3 className="font-semibold mb-2">
                            Invoice
                        </h3>

                        {error && (
                            <p className="text-red-500 text-sm mb-2">
                                {error}
                            </p>
                        )}

                        {asset.invoiceUrl ? (

                            <div className="flex items-center gap-3 flex-wrap">

                                <a
                                href={asset.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
                                >
                                    View Invoice
                                </a>

                                {canEdit && (

                                    <div className="flex items-center gap-2">

                                        <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="text-sm"
                                        />

                                        <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className="bg-gray-700 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                                        >
                                            {uploading ? "Uploading..." : "Replace"}
                                        </button>

                                    </div>

                                )}

                            </div>

                        ) : canEdit ? (

                            <div className="flex items-center gap-2 flex-wrap">

                                <input
                                type="file"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="text-sm"
                                />

                                <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="bg-gray-800 text-white px-4 py-2 rounded text-sm disabled:opacity-50"
                                >
                                    {uploading ? "Uploading..." : "Upload Invoice"}
                                </button>

                            </div>

                        ) : (

                            <p className="text-gray-500 text-sm">
                                No invoice uploaded yet.
                            </p>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}


export default AssetDetailsModal;
