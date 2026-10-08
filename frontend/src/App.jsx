import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./routes/PrivateRoute";
import Assets from "./pages/Assets";
import Subscriptions from "./pages/Subscriptions";
import Notifications from "./pages/Notifications";
import Workspace from "./pages/Workspace";


function App(){

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route 
          path="/login"
          element={<Login />}
        />


        <Route
          path="/register"
          element={<Register />}
        />


        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              
              <Dashboard />

            </PrivateRoute>
          }
        />

        <Route
          path="/assets"
          element={
          <PrivateRoute>
            <Assets/>
          </PrivateRoute>
        }
        />

        <Route
          path="/subscriptions"
          element={
          <PrivateRoute>
            <Subscriptions/>
          </PrivateRoute>
        }
        />

        <Route
          path="/notifications"
          element={
          <PrivateRoute>
            <Notifications/>
          </PrivateRoute>
        }
        />

        <Route
          path="/workspace"
          element={
          <PrivateRoute>
            <Workspace/>
          </PrivateRoute>
        }
        />

        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;