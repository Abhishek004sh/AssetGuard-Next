import { useState } from "react";
import { uploadInvoice } from "../services/asset.service";
import { primaryBtnCls, secondaryBtnCls } from "../components/ui";


function Field({ label, value }){

    return (

        <div className="py-2.5 border-b border-border last:border-b-0">

            <p className="text-xs text-slate">
                {label}
            </p>

            <p className="text-ink mt-0.5">
                {value || "—"}
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
        className="fixed inset-0 bg-ink/50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
        >

            <div
            className="bg-paper border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            >

                <div className="flex justify-between items-start p-5 border-b border-border bg-surface">

                    <div>

                        <h2 className="font-display text-xl font-semibold text-ink">
                            {asset.name}
                        </h2>

                        <p className="text-slate text-sm mt-0.5">
                            {asset.category}
                        </p>

                    </div>

                    <button
                    onClick={onClose}
                    className="text-slate hover:text-ink text-2xl leading-none"
                    aria-label="Close"
                    >
                        &times;
                    </button>

                </div>


                <div className="p-5">

                    <Field label="Purchase price" value={<span className="font-mono">₹{asset.purchasePrice}</span>} />

                    <Field label="Purchase date" value={formatDate(asset.purchaseDate)} />

                    <Field label="Warranty expiry" value={formatDate(asset.warrantyExpiry)} />

                    <Field label="Serial number" value={asset.serialNumber && <span className="font-mono">{asset.serialNumber}</span>} />

                    <Field label="Description" value={asset.description} />


                    <div className="mt-5 pt-4 border-t border-border">

                        <h3 className="font-medium text-ink mb-2">
                            Invoice
                        </h3>

                        {error && (
                            <p className="text-rust text-sm mb-2">
                                {error}
                            </p>
                        )}

                        {asset.invoiceUrl ? (

                            <div className="flex items-center gap-3 flex-wrap">

                                <a
                                href={asset.invoiceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={`${primaryBtnCls} inline-block`}
                                >
                                    View invoice
                                </a>

                                {canEdit && (

                                    <div className="flex items-center gap-2">

                                        <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files[0])}
                                        className="text-sm text-slate"
                                        />

                                        <button
                                        onClick={handleUpload}
                                        disabled={!file || uploading}
                                        className={secondaryBtnCls}
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
                                className="text-sm text-slate"
                                />

                                <button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className={primaryBtnCls}
                                >
                                    {uploading ? "Uploading..." : "Upload invoice"}
                                </button>

                            </div>

                        ) : (

                            <p className="text-slate text-sm">
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
