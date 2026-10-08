import { useState,useContext } from "react";

import {AuthContext } from "../context/AuthContext";

import api from "../services/api";

import { useNavigate } from "react-router-dom";


function Login(){

    const navigate = useNavigate();


    const { login } = useContext(AuthContext);



    const [form,setForm] = useState({

        email:"",
        password:""

    });


    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);



    const handleChange=(e)=>{

        setForm({

            ...form,

            [e.target.name]:
            e.target.value

        });

    };



    const handleSubmit=async(e)=>{

        e.preventDefault();

        setError("");

        setLoading(true);


        try{


            const res =
            await api.post(
                "/auth/login",
                form
            );


            const {
                token,
                user
            } = res.data;



            login(token, user);


            navigate("/dashboard");



        }
        catch(error){

            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );

        }
        finally{

            setLoading(false);

        }


    };



    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

                <h1 className="text-3xl font-bold mb-6">
                    Login
                </h1>

                {error && (

                    <p className="text-red-500 mb-4">
                        {error}
                    </p>

                )}


                <form onSubmit={handleSubmit}>


                    <input

                    name="email"

                    type="email"

                    placeholder="Email"

                    value={form.email}

                    onChange={handleChange}

                    className="w-full border p-3 rounded mb-4"

                    required

                    />



                    <input

                    name="password"

                    type="password"

                    placeholder="Password"

                    value={form.password}

                    onChange={handleChange}

                    className="w-full border p-3 rounded mb-4"

                    required

                    />



                    <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white p-3 rounded disabled:opacity-60"
                    >

                        {loading ? "Logging in..." : "Login"}

                    </button>


                </form>

                <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="w-full mt-4 text-blue-600"
                >
                    Create a new account
                </button>


            </div>

        </div>

    );



}




export default Login;
