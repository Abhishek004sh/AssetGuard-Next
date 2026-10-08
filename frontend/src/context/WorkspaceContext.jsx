import {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback
} from "react";

import { AuthContext } from "./AuthContext";
import { getMyWorkspaces } from "../services/workspace.service";


// Context + provider live together here to keep the project simple.
// eslint-disable-next-line react-refresh/only-export-components
export const WorkspaceContext = createContext();


export const WorkspaceProvider = ({ children }) => {

    const { token } = useContext(AuthContext);

    const [workspaces, setWorkspaces] = useState([]);

    const [currentWorkspaceId, setCurrentWorkspaceId] = useState(
        localStorage.getItem("workspaceId") || null
    );

    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);


    const loadWorkspaces = useCallback(async () => {

        if (!token) {

            setWorkspaces([]);

            setLoadingWorkspaces(false);

            return;

        }

        try {

            const data = await getMyWorkspaces();

            const list = data.workspaces || [];

            setWorkspaces(list);

            // If nothing is selected yet, or the saved one no longer
            // exists, fall back to the first workspace.
            const savedId = localStorage.getItem("workspaceId");

            const stillValid = list.some(ws => ws._id === savedId);

            if (!stillValid) {

                const firstId = list.length ? list[0]._id : null;

                if (firstId) {
                    localStorage.setItem("workspaceId", firstId);
                } else {
                    localStorage.removeItem("workspaceId");
                }

                setCurrentWorkspaceId(firstId);

            }
            else {

                setCurrentWorkspaceId(savedId);

            }

        }
        catch {

            setWorkspaces([]);

        }
        finally {

            setLoadingWorkspaces(false);

        }

    }, [token]);


    useEffect(() => {

        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadWorkspaces();

    }, [loadWorkspaces]);


    const switchWorkspace = (id) => {

        localStorage.setItem("workspaceId", id);

        setCurrentWorkspaceId(id);

    };


    const currentWorkspace =
        workspaces.find(ws => ws._id === currentWorkspaceId) || null;

    // Role of the logged-in user inside the selected workspace.
    // The backend enforces this too - this is only for hiding buttons.
    const role = currentWorkspace ? currentWorkspace.myRole : null;

    const isOwner = role === "OWNER";

    const canEdit = role === "OWNER" || role === "MEMBER";


    return (

        <WorkspaceContext.Provider
            value={{
                workspaces,
                currentWorkspace,
                currentWorkspaceId,
                role,
                isOwner,
                canEdit,
                loadingWorkspaces,
                switchWorkspace,
                reloadWorkspaces: loadWorkspaces
            }}
        >

            {children}

        </WorkspaceContext.Provider>

    );

};
