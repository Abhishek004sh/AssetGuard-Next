import api from "./api";


export const getMyWorkspaces = async()=>{

    const res =
    await api.get("/workspace");

    return res.data;

};

export const getWorkspaceById = async(id)=>{

    const res =
    await api.get(`/workspace/${id}`);

    return res.data;

};

export const createWorkspace = async(name)=>{

    const res =
    await api.post(
        "/workspace/create",
        { name }
    );

    return res.data;

};

export const addMember = async(workspaceId, email, role)=>{

    const res =
    await api.post(
        `/workspace/${workspaceId}/member`,
        { email, role }
    );

    return res.data;

};

export const removeMember = async(workspaceId, userId)=>{

    const res =
    await api.delete(
        `/workspace/${workspaceId}/member/${userId}`
    );

    return res.data;

};
