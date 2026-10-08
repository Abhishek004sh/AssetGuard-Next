import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { WorkspaceContext } from "../context/WorkspaceContext";


// Small coloured label so the user can always see what they're
// allowed to do in the workspace they're currently looking at.
function RoleBadge({ role }){

    if(!role) return null;

    const styles = {
        OWNER: "bg-green-100 text-green-700",
        MEMBER: "bg-blue-100 text-blue-700",
        VIEWER: "bg-gray-200 text-gray-600"
    };

    return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[role] || styles.VIEWER}`}>
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

        <header className="bg-white shadow px-4 py-3 flex justify-between items-center flex-wrap gap-3">


            <div className="flex items-center gap-2">

                <span className="text-sm text-gray-500">
                    Workspace:
                </span>

                {workspaces.length > 0 ? (

                    <select
                    value={currentWorkspaceId || ""}
                    onChange={(e) => switchWorkspace(e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm bg-white"
                    >

                        {workspaces.map(ws => (

                            <option key={ws._id} value={ws._id}>
                                {ws.name}
                            </option>

                        ))}

                    </select>

                ) : (

                    <span className="text-sm text-gray-400">
                        none
                    </span>

                )}

                <RoleBadge role={role} />

            </div>


            <div className="flex items-center gap-4">

                {user && (
                    <span className="text-sm text-gray-500">
                        Hi, {user.name}
                    </span>
                )}

                <button
                onClick={handleLogout}
                className="text-sm bg-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition"
                >
                    Logout
                </button>

            </div>


        </header>

    );

}


export default Navbar;
