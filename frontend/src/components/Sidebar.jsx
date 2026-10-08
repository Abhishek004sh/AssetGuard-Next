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

        <div className="w-64 min-h-screen bg-gray-900 text-white p-5">


            <h2 className="text-2xl font-bold mb-8">
                AssetGuard
            </h2>


            <nav className="space-y-1">

                {navItems.map((item) => {

                    const isActive = location.pathname === item.to;

                    return (

                        <Link
                        key={item.to}
                        to={item.to}
                        className={`block px-3 py-2 rounded-lg transition ${
                            isActive
                                ? "bg-blue-500 text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }`}
                        >
                            {item.label}
                        </Link>

                    );

                })}

            </nav>


        </div>

    );

}


export default Sidebar;
