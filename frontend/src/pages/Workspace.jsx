import {
    useEffect,
    useState,
    useContext,
    useCallback
} from "react";

import Layout from "../components/Layout";
import { WorkspaceContext } from "../context/WorkspaceContext";

import {
    getWorkspaceById,
    createWorkspace,
    addMember,
    removeMember
} from "../services/workspace.service";


function RoleTag({ role }){

    const styles = {
        OWNER: "bg-green-100 text-green-700",
        MEMBER: "bg-blue-100 text-blue-700",
        VIEWER: "bg-gray-200 text-gray-600"
    };

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full ${styles[role] || styles.VIEWER}`}>
            {role}
        </span>
    );

}


function Workspace(){

    const {
        workspaces,
        currentWorkspaceId,
        switchWorkspace,
        reloadWorkspaces,
        isOwner
    } = useContext(WorkspaceContext);

    const [details,setDetails] = useState(null);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState("");

    const [newName,setNewName] = useState("");
    const [creating,setCreating] = useState(false);

    const [memberForm,setMemberForm] = useState({ email:"", role:"MEMBER" });
    const [memberMessage,setMemberMessage] = useState("");
    const [memberError,setMemberError] = useState("");


    const loadDetails = useCallback(async () => {

        if(!currentWorkspaceId){

            setDetails(null);

            setLoading(false);

            return;

        }

        setLoading(true);

        try{

            const data = await getWorkspaceById(currentWorkspaceId);

            setDetails(data.workspace);

            setError("");

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not load workspace"
            );

        }
        finally{

            setLoading(false);

        }

    },[currentWorkspaceId]);


    useEffect(()=>{

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDetails();

    },[loadDetails]);


    const handleCreate = async (e) => {

        e.preventDefault();

        if(!newName.trim()) return;

        setCreating(true);

        try{

            const data = await createWorkspace(newName.trim());

            setNewName("");

            await reloadWorkspaces();

            // Jump straight into the workspace that was just created
            switchWorkspace(data.workspace._id);

        }
        catch(err){

            setError(
                err.response?.data?.message ||
                "Could not create workspace"
            );

        }
        finally{

            setCreating(false);

        }

    };


    const handleAddMember = async (e) => {

        e.preventDefault();

        setMemberMessage("");

        setMemberError("");

        try{

            const data = await addMember(
                currentWorkspaceId,
                memberForm.email,
                memberForm.role
            );

            setDetails(data.workspace);

            setMemberForm({ email:"", role:"MEMBER" });

            setMemberMessage("Member added successfully");

            reloadWorkspaces();

        }
        catch(err){

            setMemberError(
                err.response?.data?.message ||
                "Could not add member"
            );

        }

    };


    const handleRemoveMember = async (userId) => {

        if(!window.confirm("Remove this member from the workspace?")) return;

        try{

            const data = await removeMember(currentWorkspaceId, userId);

            setDetails(data.workspace);

            reloadWorkspaces();

        }
        catch(err){

            setMemberError(
                err.response?.data?.message ||
                "Could not remove member"
            );

        }

    };


    return (

        <Layout>

            <h1 className="text-3xl font-bold mb-6">
                Workspaces
            </h1>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                    {error}
                </div>
            )}


            {/* All workspaces this user belongs to */}
            <div className="bg-white p-5 rounded-xl shadow mb-5">

                <h2 className="font-semibold mb-3">
                    Your Workspaces
                </h2>

                <div className="grid gap-2">

                    {workspaces.length === 0 && (
                        <p className="text-gray-500 text-sm">
                            You are not part of any workspace yet.
                        </p>
                    )}

                    {workspaces.map(ws => (

                        <div
                        key={ws._id}
                        className={`flex justify-between items-center border rounded-lg p-3 ${
                            ws._id === currentWorkspaceId
                                ? "border-blue-400 bg-blue-50"
                                : "border-gray-200"
                        }`}
                        >

                            <div className="flex items-center gap-2 flex-wrap">

                                <span className="font-medium">
                                    {ws.name}
                                </span>

                                <RoleTag role={ws.myRole} />

                                <span className="text-xs text-gray-400">
                                    {ws.memberCount} member(s)
                                </span>

                            </div>

                            {ws._id === currentWorkspaceId ? (

                                <span className="text-xs text-blue-600 font-medium">
                                    Currently viewing
                                </span>

                            ) : (

                                <button
                                onClick={() => switchWorkspace(ws._id)}
                                className="text-sm border px-3 py-1 rounded hover:bg-gray-50"
                                >
                                    Switch
                                </button>

                            )}

                        </div>

                    ))}

                </div>


                <form onSubmit={handleCreate} className="flex gap-2 mt-4 flex-wrap">

                    <input
                    placeholder="New workspace name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border p-2 rounded flex-1 min-w-[200px]"
                    />

                    <button
                    type="submit"
                    disabled={creating}
                    className="bg-black text-white px-4 py-2 rounded disabled:opacity-60"
                    >
                        {creating ? "Creating..." : "Create Workspace"}
                    </button>

                </form>

            </div>


            {/* Members of the workspace currently selected */}
            {loading && (
                <p className="text-gray-500">Loading...</p>
            )}

            {!loading && details && (

                <div className="bg-white p-5 rounded-xl shadow">

                    <h2 className="font-semibold mb-1">
                        Members of {details.name}
                    </h2>

                    <p className="text-xs text-gray-500 mb-3">
                        {isOwner
                            ? "You own this workspace, so you can add and remove members."
                            : "Only the owner of this workspace can manage members."
                        }
                    </p>

                    <div className="grid gap-2 mb-4">

                        {details.members?.map((member) => (

                            <div
                            key={member.user?._id || member._id}
                            className="flex justify-between items-center border-b py-2 gap-2 flex-wrap"
                            >

                                <div className="flex items-center gap-2 flex-wrap">

                                    <span>
                                        {member.user?.name}
                                    </span>

                                    <span className="text-sm text-gray-500">
                                        {member.user?.email}
                                    </span>

                                    <RoleTag role={member.role} />

                                </div>

                                {isOwner && member.role !== "OWNER" && (

                                    <button
                                    onClick={() => handleRemoveMember(member.user?._id)}
                                    className="text-sm text-red-600 hover:underline"
                                    >
                                        Remove
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>


                    {isOwner && (

                        <>

                            <h3 className="font-semibold mb-2 text-sm">
                                Add a Member
                            </h3>

                            <p className="text-xs text-gray-500 mb-2">
                                They must already have an AssetGuard account.
                                Members can add and edit, but only you can delete.
                            </p>

                            {memberMessage && (
                                <p className="text-sm mb-2 text-green-600">
                                    {memberMessage}
                                </p>
                            )}

                            {memberError && (
                                <p className="text-sm mb-2 text-red-500">
                                    {memberError}
                                </p>
                            )}

                            <form onSubmit={handleAddMember} className="flex gap-2 flex-wrap">

                                <input
                                name="email"
                                type="email"
                                placeholder="Member's email"
                                value={memberForm.email}
                                onChange={(e) =>
                                    setMemberForm({ ...memberForm, email: e.target.value })
                                }
                                className="border p-2 rounded flex-1 min-w-[200px]"
                                required
                                />

                                <select
                                value={memberForm.role}
                                onChange={(e) =>
                                    setMemberForm({ ...memberForm, role: e.target.value })
                                }
                                className="border p-2 rounded"
                                >
                                    <option value="MEMBER">Member (can add/edit)</option>
                                    <option value="VIEWER">Viewer (read only)</option>
                                </select>

                                <button
                                type="submit"
                                className="bg-black text-white px-4 py-2 rounded"
                                >
                                    Add
                                </button>

                            </form>

                        </>

                    )}

                </div>

            )}

        </Layout>

    );

}


export default Workspace;
