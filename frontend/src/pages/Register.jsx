import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";


function Register() {

    const navigate = useNavigate();

    const { login } = useContext(AuthContext);


    const [form, setForm] = useState({

        name: "",
        email: "",
        password: "",
        role:"OWNER"

    });


    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);


    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        setLoading(true);


        try {

            const res = await api.post(
                "/auth/register",
                form
            );


            // Backend now returns a token on register, so we sign the
            // user in right away instead of sending them to /login.
            login(res.data.token, res.data.user);


            navigate("/dashboard");


        } catch (error) {

            console.log(
                error.response?.data
            );


            setError(
                error.response?.data?.message ||
                "Registration failed"
            );

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

                <h1 className="text-3xl font-bold mb-6">
                    Create Account
                </h1>


                {error && (

                    <p className="text-red-500 mb-4">
                        {error}
                    </p>

                )}


                <form onSubmit={handleSubmit}>


                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border p-3 rounded mb-4"
                        required
                    />


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
                        className="w-full bg-black text-white p-3 rounded"
                    >

                        {loading
                            ? "Creating Account..."
                            : "Register"
                        }

                    </button>


                </form>


                <button
                    onClick={() => navigate("/login")}
                    className="w-full mt-4 text-blue-600"
                >

                    Already have an account? Login

                </button>


            </div>

        </div>

    );

}


export default Register;