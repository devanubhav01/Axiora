"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { initiateResumePayment } from "@/actions/useractions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bounce } from "react-toastify";

function CreateResumeContent() {
    const searchParams = useSearchParams();
    const success = searchParams.get("success");
    const id = searchParams.get("id");

    const [form, setForm] = useState({
        name: "",
        email: "",
        college: "",
        cgpa: "",
        linkedin: "",
        github: "",
        leetcode: "",
        codeforces: "",
        skills: "",
        description: "",
        certification: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.email || !form.college) {
            toast.error("Please fill in Name, Email, and College fields.", {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Initiate Resume Payment
            const res = await initiateResumePayment(form);

            // 2. Open Razorpay Checkout Modal
            const options = {
                key: res.keyId,
                amount: res.amount,
                currency: "INR",
                name: "Axiora",
                description: "Resume PDF Generation Fee",
                image: "https://example.com/your_logo",
                order_id: res.orderId,
                callback_url: `${window.location.origin}/api/razorpay`,
                prefill: {
                    name: form.name,
                    email: form.email,
                },
                theme: {
                    color: "#000000",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong. Please try again.", {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        } finally {
            setLoading(false);
        }
    };

    if (success === "true" && id) {
        return (
            <div className="min-h-screen bg-white text-black py-16 px-6 flex flex-col items-center justify-center">
                <div className="max-w-md w-full border border-gray-200 rounded-xl p-8 text-center shadow-sm">
                    <div className="size-16 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-black mb-3">Payment Successful!</h1>
                    <p className="text-[#767676] text-sm mb-6 leading-relaxed">
                        Your professional resume PDF has been generated successfully and sent to your email.
                    </p>
                    <p className="text-[#767676] text-xs mb-8">
                        If you do not see the email shortly (or if SMTP is not configured on the server), you can download the generated file directly using the link below:
                    </p>
                    <div className="flex flex-col gap-3">
                        <a
                            href={`/resumes/${id}.pdf`}
                            download
                            className="bg-black hover:bg-neutral-800 text-white font-semibold py-3 px-6 rounded-lg text-sm transition-all"
                        >
                            Download PDF Directly
                        </a>
                        <a
                            href="/create-resume"
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-black font-semibold py-3 px-6 rounded-lg text-sm transition-all"
                        >
                            Build Another Resume
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="min-h-screen bg-white text-black py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-black mb-2 text-center">Resume Maker</h1>
                    <p className="text-center text-[#767676] mb-10 text-sm">
                        Fill in your professional details below to generate a clean, modern PDF resume. (Fee: ₹1)
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6 border border-gray-200 rounded-xl p-8 bg-white shadow-sm">
                        {/* Section 1: Basic Info */}
                        <div className="border-b border-gray-100 pb-5">
                            <h2 className="text-lg font-bold text-black mb-4">Basic Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="johndoe@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Education */}
                        <div className="border-b border-gray-100 pb-5">
                            <h2 className="text-lg font-bold text-black mb-4">Education</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">College/University *</label>
                                    <input
                                        type="text"
                                        name="college"
                                        value={form.college}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="IIT Delhi"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">CGPA / Percentage</label>
                                    <input
                                        type="text"
                                        name="cgpa"
                                        value={form.cgpa}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="8.5/10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Social & Coding Handles */}
                        <div className="border-b border-gray-100 pb-5">
                            <h2 className="text-lg font-bold text-black mb-4">Profiles & Links</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">LinkedIn Profile URL</label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={form.linkedin}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">GitHub Profile URL</label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={form.github}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">LeetCode Profile URL</label>
                                    <input
                                        type="url"
                                        name="leetcode"
                                        value={form.leetcode}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="https://leetcode.com/username"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-black mb-2">Codeforces Profile URL</label>
                                    <input
                                        type="url"
                                        name="codeforces"
                                        value={form.codeforces}
                                        onChange={handleChange}
                                        className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                        placeholder="https://codeforces.com/profile/username"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Details & Skills */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Professional Summary</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="Briefly describe your career goals, experience, and interests."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Technical Skills</label>
                                <textarea
                                    name="skills"
                                    value={form.skills}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="JavaScript, React, Node.js, C++, Python, Data Structures & Algorithms, Git..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-black mb-2">Certifications & Achievements</label>
                                <textarea
                                    name="certification"
                                    value={form.certification}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full p-3 rounded-lg border border-gray-300 text-black bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none"
                                    placeholder="Certified React Developer (Udemy), 5-Star Coder on CodeChef, Qualified GATE 2026..."
                                />
                            </div>
                        </div>

                        {/* Submit button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white hover:bg-neutral-800 font-bold py-3 px-6 rounded-lg text-sm text-center transition-all cursor-pointer disabled:bg-gray-200 disabled:text-gray-400 disabled:border-gray-200 disabled:border"
                            >
                                {loading ? "Initiating Checkout..." : "Pay ₹1 & Generate Resume"}
                            </button>
                            <p className="text-center text-xs text-[#767676] mt-3">
                                
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default function CreateResume() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white text-black flex items-center justify-center">Loading...</div>}>
            <CreateResumeContent />
        </Suspense>
    );
}
