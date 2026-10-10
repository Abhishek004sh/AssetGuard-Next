import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "../context/WorkspaceContext";


// A small status chip, not an eyebrow label — tells you at a glance what
// you're allowed to do in the workspace you're currently looking at.
function RoleBadge({ role }){

    if(!role) return null;

    const styles = {
        OWNER:  "bg-brass-tint text-brass-strong",
        MEMBER: "bg-moss-tint text-moss",
        VIEWER: "bg-ink/5 text-slate"
    };

    return (
        <span className={`text-xs font-mono px-2 py-0.5 ${styles[role] || styles.VIEWER}`}>
            {role}
        </span>
    );

}


function Navbar(){

    const navigate = useNavigate();

    const { user, logout } = useContext(AuthContext);

    const {
        workspaces,
        currentWorkspaceId,
        role,
        switchWorkspace
    } = useContext(WorkspaceContext);


    const handleLogout = () => {

        logout();

        navigate("/login");

    };


    return (

        <header className="bg-paper border-b border-border px-6 py-3.5 flex justify-between items-center flex-wrap gap-3">


            <div className="flex items-center gap-3">

                <span className="text-xs text-slate font-mono">
                    workspace
                </span>

                {workspaces.length > 0 ? (

                    <select
                    value={currentWorkspaceId || ""}
                    onChange={(e) => switchWorkspace(e.target.value)}
                    className="border border-border bg-surface px-2.5 py-1 text-sm text-ink focus:border-brass"
                    >

                        {workspaces.map(ws => (

                            <option key={ws._id} value={ws._id}>
                                {ws.name}
                            </option>

                        ))}

                    </select>

                ) : (

                    <span className="text-sm text-slate">
                        none yet
                    </span>

                )}

                <RoleBadge role={role} />

            </div>


            <div className="flex items-center gap-4">

                {user && (
                    <span className="text-sm text-slate">
                        {user.name}
                    </span>
                )}

                <button
                onClick={handleLogout}
                className="text-sm border border-border px-3 py-1.5 text-ink hover:border-ink transition-colors"
                >
                    Log out
                </button>

            </div>


        </header>

    );

}


export default Navbar;
