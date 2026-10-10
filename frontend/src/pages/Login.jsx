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

        <div className="min-h-screen flex bg-paper">

            {/* Ink panel - same spine as the app shell, so login feels
                like the front cover of the register rather than a
                separate marketing screen. */}
            <div className="hidden md:flex w-[38%] bg-ink flex-col justify-between p-10">

                <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 bg-brass shrink-0" aria-hidden="true" />
                    <span className="font-display text-lg font-semibold text-white">
                        AssetGuard
                    </span>
                </div>

                <p className="font-display text-2xl text-white/90 leading-snug max-w-xs">
                    One record for every asset and subscription your team owns.
                </p>

            </div>

            <div className="flex-1 flex items-center justify-center p-6">

                <div className="w-full max-w-sm">

                    <h1 className="font-display text-2xl font-semibold text-ink mb-1">
                        Log in
                    </h1>

                    <p className="text-sm text-slate mb-6">
                        Enter your details to reach your workspace.
                    </p>

                    {error && (

                        <p className="bg-rust-tint border border-rust/20 text-rust text-sm px-3 py-2 mb-4">
                            {error}
                        </p>

                    )}


                    <form onSubmit={handleSubmit} className="space-y-3">


                        <input

                        name="email"

                        type="email"

                        placeholder="Email"

                        value={form.email}

                        onChange={handleChange}

                        className="w-full border border-border px-3.5 py-2.5 text-sm text-ink focus:border-brass"

                        required

                        />



                        <input

                        name="password"

                        type="password"

                        placeholder="Password"

                        value={form.password}

                        onChange={handleChange}

                        className="w-full border border-border px-3.5 py-2.5 text-sm text-ink focus:border-brass"

                        required

                        />



                        <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ink text-white py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-60"
                        >

                            {loading ? "Logging in..." : "Log in"}

                        </button>


                    </form>

                    <button
                        type="button"
                        onClick={() => navigate("/register")}
                        className="w-full mt-5 text-sm text-brass-strong hover:underline"
                    >
                        Create a new account
                    </button>

                </div>

            </div>

        </div>

    );



}




export default Login;
