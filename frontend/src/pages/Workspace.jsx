import {
    useEffect,
    useState,
    useContext,
    useCallback
} from "react";

import Layout from "../components/Layout";
import { WorkspaceContext } from "../context/WorkspaceContext";
import {
    inputCls,
    primaryBtnCls,
    secondaryBtnCls,
    PageHeading,
    ErrorBanner,
    Row,
    Tag
} from "../components/ui";

import {
    getWorkspaceById,
    createWorkspace,
    addMember,
    removeMember
} from "../services/workspace.service";


const roleTone = {
    OWNER: "brass",
    MEMBER: "moss",
    VIEWER: "ink"
};


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

            <PageHeading>
                Workspaces
            </PageHeading>

            <ErrorBanner>{error}</ErrorBanner>


            {/* All workspaces this user belongs to */}
            <Row className="mb-6">

                <h2 className="font-display font-semibold text-ink mb-3">
                    Your workspaces
                </h2>

                <div className="flex flex-col gap-px bg-border border border-border">

                    {workspaces.length === 0 && (
                        <p className="text-slate text-sm bg-surface px-4 py-3">
                            You are not part of any workspace yet.
                        </p>
                    )}

                    {workspaces.map(ws => (

                        <div
                        key={ws._id}
                        className={`flex justify-between items-center px-4 py-3 bg-surface ${
                            ws._id === currentWorkspaceId ? "border-l-2 border-l-brass" : ""
                        }`}
                        >

                            <div className="flex items-center gap-2 flex-wrap">

                                <span className="font-medium text-ink">
                                    {ws.name}
                                </span>

                                <Tag tone={roleTone[ws.myRole] || "ink"}>
                                    {ws.myRole}
                                </Tag>

                                <span className="text-xs text-slate">
                                    {ws.memberCount} member{ws.memberCount === 1 ? "" : "s"}
                                </span>

                            </div>

                            {ws._id === currentWorkspaceId ? (

                                <span className="text-xs text-brass-strong font-medium">
                                    Currently viewing
                                </span>

                            ) : (

                                <button
                                onClick={() => switchWorkspace(ws._id)}
                                className="text-sm border border-border px-3 py-1 text-ink hover:border-ink transition-colors"
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
                    className={`${inputCls} flex-1 min-w-[200px]`}
                    />

                    <button
                    type="submit"
                    disabled={creating}
                    className={primaryBtnCls}
                    >
                        {creating ? "Creating..." : "Create workspace"}
                    </button>

                </form>

            </Row>


            {/* Members of the workspace currently selected */}
            {loading && (
                <p className="text-slate text-sm">Loading...</p>
            )}

            {!loading && details && (

                <Row>

                    <h2 className="font-display font-semibold text-ink mb-1">
                        Members of {details.name}
                    </h2>

                    <p className="text-xs text-slate mb-3">
                        {isOwner
                            ? "You own this workspace, so you can add and remove members."
                            : "Only the owner of this workspace can manage members."
                        }
                    </p>

                    <div className="flex flex-col gap-px bg-border border border-border mb-4">

                        {details.members?.map((member) => (

                            <div
                            key={member.user?._id || member._id}
                            className="flex justify-between items-center px-4 py-2.5 gap-2 flex-wrap bg-surface"
                            >

                                <div className="flex items-center gap-2 flex-wrap">

                                    <span className="text-ink">
                                        {member.user?.name}
                                    </span>

                                    <span className="text-sm text-slate">
                                        {member.user?.email}
                                    </span>

                                    <Tag tone={roleTone[member.role] || "ink"}>
                                        {member.role}
                                    </Tag>

                                </div>

                                {isOwner && member.role !== "OWNER" && (

                                    <button
                                    onClick={() => handleRemoveMember(member.user?._id)}
                                    className="text-sm text-rust hover:underline"
                                    >
                                        Remove
                                    </button>

                                )}

                            </div>

                        ))}

                    </div>


                    {isOwner && (

                        <>

                            <h3 className="font-medium text-ink mb-2 text-sm">
                                Add a member
                            </h3>

                            <p className="text-xs text-slate mb-2">
                                They must already have an AssetGuard account.
                                Members can add and edit, but only you can delete.
                            </p>

                            {memberMessage && (
                                <p className="text-sm mb-2 text-moss">
                                    {memberMessage}
                                </p>
                            )}

                            {memberError && (
                                <p className="text-sm mb-2 text-rust">
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
                                className={`${inputCls} flex-1 min-w-[200px]`}
                                required
                                />

                                <select
                                value={memberForm.role}
                                onChange={(e) =>
                                    setMemberForm({ ...memberForm, role: e.target.value })
                                }
                                className={inputCls}
                                style={{ width: "auto" }}
                                >
                                    <option value="MEMBER">Member (can add/edit)</option>
                                    <option value="VIEWER">Viewer (read only)</option>
                                </select>

                                <button
                                type="submit"
                                className={secondaryBtnCls}
                                >
                                    Add
                                </button>

                            </form>

                        </>

                    )}

                </Row>

            )}

        </Layout>

    );

}


export default Workspace;
