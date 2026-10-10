import { Link, useLocation } from "react-router-dom";


const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/assets", label: "Assets" },
    { to: "/subscriptions", label: "Subscriptions" },
    { to: "/notifications", label: "Notifications" },
    { to: "/workspace", label: "Workspace" }
];


function Sidebar(){

    const location = useLocation();

    return (

        <div className="w-60 shrink-0 min-h-screen bg-ink flex flex-col">

            {/* Wordmark styled like a stamped asset tag: a small brass
                square standing in for the tag, the name set tight beside it. */}
            <div className="flex items-center gap-2.5 px-5 pt-7 pb-8">

                <span className="w-3 h-3 bg-brass shrink-0" aria-hidden="true" />

                <span className="font-display text-lg font-semibold text-white tracking-tight">
                    AssetGuard
                </span>

            </div>

            <nav className="flex-1 px-3">

                {navItems.map((item) => {

                    const isActive = location.pathname === item.to;

                    return (

                        <Link
                        key={item.to}
                        to={item.to}
                        className={`relative flex items-center h-10 pl-4 pr-3 text-sm transition-colors ${
                            isActive
                                ? "text-white font-medium"
                                : "text-slate-300/70 hover:text-white"
                        }`}
                        style={{ color: isActive ? "#ffffff" : undefined }}
                        >
                            {/* Left spine mark on the active item, in place of
                                a filled pill background. */}
                            {isActive && (
                                <span
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-brass"
                                aria-hidden="true"
                                />
                            )}

                            {item.label}

                        </Link>

                    );

                })}

            </nav>

            <div className="flex items-center gap-2 pl-6 pr-5 py-5 text-xs text-slate-400/60 border-t border-white/10">
                <span className="w-1 h-1 rounded-full bg-slate-400/60 shrink-0" aria-hidden="true" />
                <span>Asset &amp; subscription registry</span>
            </div>

        </div>

    );

}


export default Sidebar;
