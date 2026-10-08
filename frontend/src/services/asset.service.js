import api from "./api";


export const getAssets = async(params = {})=>{

    const res =
    await api.get("/assets", { params });


    return res.data;

};

export const updateAsset = async(id,data)=>{

    const res =
    await api.put(
        `/assets/${id}`,
        data
    );

    return res.data;

};



export const deleteAsset = async(id)=>{

    const res =
    await api.delete(
        `/assets/${id}`
    );

    return res.data;

};



export const createAsset = async(data)=>{


    const res =
    await api.post(
        "/assets",
        data
    );


    return res.data;

};

export const getWarrantyStatus = async()=>{

    const res =
    await api.get("/assets/warranty-status");

    return res.data;

};

export const uploadInvoice = async(id, file)=>{

    const formData = new FormData();

    formData.append("invoice", file);

    const res = await api.post(
        `/assets/${id}/invoice`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;

};
