import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


function Layout({children}){


    return (

        <div className="flex min-h-screen bg-paper">


            <Sidebar />


            <div className="flex-1 min-w-0">


                <Navbar />


                <main className="p-8 max-w-7xl">

                    {children}

                </main>


            </div>


        </div>

    );

}


export default Layout;