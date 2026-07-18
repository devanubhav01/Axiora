"use client"
import React, { useEffect, useState } from 'react'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchuser, updateProfile } from '@/actions/useractions'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

const Dashboard = () => {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [form, setform] = useState({})
    const [otpModal, setOtpModal] = useState(false)
    const [enteredOtp, setEnteredOtp] = useState("")
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [sendingOtp, setSendingOtp] = useState(false)
    const [verifyingOtp, setVerifyingOtp] = useState(false)
    const [notification, setNotification] = useState(null)

    const showNotification = (type, message) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }

    useEffect(() => {
        if (!session) {
            router.push('/login')
        }
        else {
            getData()
        }
    }, [session])

    const handlePhoneChange = (e) => {
        setform({ ...form, phone: e.target.value, phoneVerified: false })
    }

    // Formats a raw phone number into E.164 (e.g. 9876543210 -> +919876543210).
    // Assumes India (+91) if the user didn't type a country code.
    const toE164 = (raw) => {
        const digits = raw.replace(/[^\d+]/g, "")
        if (digits.startsWith("+")) return digits
        return `+91${digits}`
    }

    const sendOTP = async () => {
        if (!form.phone || form.phone.trim().length < 10) {
            showNotification("error", "Please enter a valid phone number.")
            return
        }
        setSendingOtp(true)
        try {
            // (Re)create the invisible reCAPTCHA each time we send, so a stale
            // verifier from a previous attempt doesn't cause "already rendered" errors.
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
            }
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            })

            const phoneNumber = toE164(form.phone.trim())
            const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
            setConfirmationResult(result)
            setOtpModal(true)
            showNotification("success", "OTP sent! Check your phone.")
        } catch (err) {
            console.error("OTP send error:", err)
            if (err.code === "auth/invalid-phone-number") {
                showNotification("error", "That phone number looks invalid. Include the country code, e.g. +91XXXXXXXXXX.")
            } else if (err.code === "auth/too-many-requests") {
                showNotification("error", "Too many attempts. Please wait a bit and try again.")
            } else {
                showNotification("error", "Couldn't send OTP: " + err.message)
            }
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear()
            }
        } finally {
            setSendingOtp(false)
        }
    }

    const verifyOTP = async () => {
        if (!confirmationResult) {
            showNotification("error", "Please request a new OTP first.")
            return
        }
        setVerifyingOtp(true)
        try {
            await confirmationResult.confirm(enteredOtp)
            setform(prev => ({ ...prev, phoneVerified: true }))
            setOtpModal(false)
            setEnteredOtp("")
            setConfirmationResult(null)
            showNotification("success", "Phone number verified successfully!")
        } catch (err) {
            console.error("OTP verify error:", err)
            showNotification("error", "Invalid OTP. Please try again.")
        } finally {
            setVerifyingOtp(false)
        }
    }

    const getData = async () => {
        if (!session || !session.user || !session.user.email) return;
        let u = await fetchuser(session.user.email)
        if (!u) {
            showNotification("error", "User profile not found. Please log in again.");
            return;
        }
        
        // Populate project form fields from the array if they exist
        if (u.projects && u.projects.length > 0) {
            u.project1_title = u.projects[0]?.title || "";
            u.project1_desc = u.projects[0]?.description || "";
            u.project1_link = u.projects[0]?.link || "";
        }
        if (u.projects && u.projects.length > 1) {
            u.project2_title = u.projects[1]?.title || "";
            u.project2_desc = u.projects[1]?.description || "";
            u.project2_link = u.projects[1]?.link || "";
        }
        if (u.projects && u.projects.length > 2) {
            u.project3_title = u.projects[2]?.title || "";
            u.project3_desc = u.projects[2]?.description || "";
            u.project3_link = u.projects[2]?.link || "";
        }

        setform(u)
    }

    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        // Validate phone verification if a phone number is entered
        if (form.phone && form.phone.trim().length > 0 && !form.phoneVerified) {
            showNotification("error", "Please verify your contact number before saving.");
            return;
        }

        // Construct projects array from individual fields
        const projects = [];
        if (form.project1_title || form.project1_desc || form.project1_link) {
            projects.push({
                title: form.project1_title || "",
                description: form.project1_desc || "",
                link: form.project1_link || ""
            });
        }
        if (form.project2_title || form.project2_desc || form.project2_link) {
            projects.push({
                title: form.project2_title || "",
                description: form.project2_desc || "",
                link: form.project2_link || ""
            });
        }
        if (form.project3_title || form.project3_desc || form.project3_link) {
            projects.push({
                title: form.project3_title || "",
                description: form.project3_desc || "",
                link: form.project3_link || ""
            });
        }

        const payload = {
            ...form,
            projects
        };

        // Clean helper fields from payload to save space
        delete payload.project1_title;
        delete payload.project1_desc;
        delete payload.project1_link;
        delete payload.project2_title;
        delete payload.project2_desc;
        delete payload.project2_link;
        delete payload.project3_title;
        delete payload.project3_desc;
        delete payload.project3_link;

        let a = await updateProfile(payload, session.user.email)
        if (a && a.error) {
            showNotification("error", a.error);
        } else {
            // Update the session so the username changes in Navbar links
            await update()
            showNotification("success", "Portfolio saved! Redirecting to your portfolio...");
            // Redirect to public portfolio after toast
            setTimeout(() => {
                router.push(`/${form.username || session.user.name}`)
            }, 1800)
        }
    }

    return (
        <>
            {notification && (
                <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-lg shadow-lg border text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${
                    notification.type === 'success' 
                        ? 'bg-green-50 text-green-800 border-green-200' 
                        : 'bg-red-50 text-red-800 border-red-200'
                }`}>
                    <span>{notification.type === 'success' ? '✅' : '❌'}</span>
                    <span>{notification.message}</span>
                </div>
            )}

            <div className='container mx-auto py-10 px-6 bg-white min-h-screen'>
                <div className='text-center my-5'>
                    <h1 className='text-3xl font-bold text-black'>Portfolio Builder</h1>
                    <p className='text-[#767676] mt-2 mb-4 max-w-xl mx-auto'>Fill in your details and save — your public portfolio will be live instantly at <span className='font-bold text-black'>axiora.app/{form.username || '...'}</span></p>
                    {(form.username || session?.user?.name) && (
                        <Link href={`/${form.username || session.user.name}`} target="_blank">
                            <button type="button" className='text-black border border-black hover:bg-black hover:text-white font-semibold rounded-lg text-sm px-5 py-2 transition-all'>
                                👁 View My Portfolio
                            </button>
                        </Link>
                    )}
                </div>

                <form className="max-w-2xl mx-auto space-y-6" action={handleSubmit}>
                    
                    {/* Section 1: Basic Information */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">1. Personal Information</h2>
                        
                        <div>
                            <label htmlFor="name" className="block mb-2 text-sm font-semibold text-black">Full Name</label>
                            <input value={form.name ? form.name : ""} onChange={handleChange} type="text" name='name' id="name" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter your full name" />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-semibold text-black">Email Address (Linked to Account)</label>
                            <input value={form.email ? form.email : ""} disabled type="email" name='email' id="email" className="block w-full p-3 text-gray-500 border border-gray-200 rounded-lg bg-gray-50 text-sm outline-none cursor-not-allowed" placeholder="Enter your email address" />
                        </div>
                        
                        <div>
                            <label htmlFor="username" className="block mb-2 text-sm font-semibold text-black">Username (Portfolio Slug)</label>
                            <input value={form.username ? form.username : ""} onChange={handleChange} type="text" name='username' id="username" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Choose a username" />
                        </div>
                        
                        <div>
                            <label htmlFor="profilepic" className="block mb-2 text-sm font-semibold text-black">Profile Picture URL</label>
                            <input value={form.profilepic ? form.profilepic : ""} onChange={handleChange} type="text" name='profilepic' id="profilepic" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter profile image URL" />
                        </div>

                        <div>
                            <label htmlFor="coverpic" className="block mb-2 text-sm font-semibold text-black">Cover Banner URL</label>
                            <input value={form.coverpic ? form.coverpic : ""} onChange={handleChange} type="text" name='coverpic' id="coverpic" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter cover banner image URL" />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-black">Contact Number</label>
                            <div className="flex gap-2">
                                <input 
                                    value={form.phone ? form.phone : ""} 
                                    onChange={handlePhoneChange} 
                                    type="text" 
                                    name='phone' 
                                    id="phone" 
                                    className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400 flex-1" 
                                    placeholder="Enter your contact number" 
                                />
                                {form.phoneVerified ? (
                                    <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-4 rounded-lg select-none whitespace-nowrap">
                                        Verified ✅
                                    </span>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={sendOTP} 
                                        disabled={!form.phone || form.phone.trim().length < 10 || sendingOtp}
                                        className="bg-black text-white hover:bg-neutral-800 disabled:bg-gray-150 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold rounded-lg text-xs px-4 py-2 text-center transition-all whitespace-nowrap"
                                    >
                                        {sendingOtp ? "Sending..." : "Verify Number"}
                                    </button>
                                )}
                            </div>
                            {/* Firebase renders its invisible reCAPTCHA widget into this div */}
                            <div id="recaptcha-container"></div>
                        </div>
                    </div>

                    {/* Section 2: Education */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">2. Education & Graduation</h2>
                        
                        <div>
                            <label htmlFor="college" className="block mb-2 text-sm font-semibold text-black">College / University Name</label>
                            <input value={form.college ? form.college : ""} onChange={handleChange} type="text" name='college' id="college" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter college name" />
                        </div>

                        <div>
                            <label htmlFor="graduationYear" className="block mb-2 text-sm font-semibold text-black">Graduation Year</label>
                            <input value={form.graduationYear ? form.graduationYear : ""} onChange={handleChange} type="text" name='graduationYear' id="graduationYear" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="e.g. 2026" />
                        </div>
                    </div>

                    {/* Section 3: Social & Coding Links */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">3. Profiles & Coding Platforms</h2>
                        
                        <div>
                            <label htmlFor="github" className="block mb-2 text-sm font-semibold text-black">GitHub Profile URL or Username</label>
                            <input value={form.github ? form.github : ""} onChange={handleChange} type="text" name='github' id="github" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="e.g. https://github.com/username" />
                        </div>

                        <div>
                            <label htmlFor="linkedin" className="block mb-2 text-sm font-semibold text-black">LinkedIn Profile URL</label>
                            <input value={form.linkedin ? form.linkedin : ""} onChange={handleChange} type="text" name='linkedin' id="linkedin" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="e.g. https://linkedin.com/in/username" />
                        </div>

                        <div>
                            <label htmlFor="leetcode" className="block mb-2 text-sm font-semibold text-black">LeetCode Username</label>
                            <input value={form.leetcode ? form.leetcode : ""} onChange={handleChange} type="text" name='leetcode' id="leetcode" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="e.g. leetcode_user" />
                        </div>
                    </div>

                    {/* Section 4: Skills & Achievements */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">4. Skills, Certifications & Achievements</h2>
                        
                        <div>
                            <label htmlFor="skills" className="block mb-2 text-sm font-semibold text-black">Skills (Comma Separated)</label>
                            <input value={form.skills ? form.skills : ""} onChange={handleChange} type="text" name='skills' id="skills" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="e.g. Next.js, React, Node.js, Python, MongoDB" />
                        </div>

                        <div>
                            <label htmlFor="certifications" className="block mb-2 text-sm font-semibold text-black">Certifications (One per line)</label>
                            <textarea value={form.certifications ? form.certifications : ""} onChange={handleChange} name='certifications' id="certifications" rows={3} className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="AWS Certified Solutions Architect&#10;Google Cloud Digital Leader" />
                        </div>

                        <div>
                            <label htmlFor="achievements" className="block mb-2 text-sm font-semibold text-black">Achievements (One per line)</label>
                            <textarea value={form.achievements ? form.achievements : ""} onChange={handleChange} name='achievements' id="achievements" rows={3} className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Winner of Hackathon 2026&#10;5-Star Coder on CodeChef" />
                        </div>
                    </div>

                    {/* Section 5: Projects */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-6">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">5. Project Showcase (Up to 3 Projects)</h2>
                        
                        {/* Project 1 */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-black text-sm">Project #1</h3>
                            <div>
                                <input value={form.project1_title ? form.project1_title : ""} onChange={handleChange} type="text" name='project1_title' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Title" />
                            </div>
                            <div>
                                <textarea value={form.project1_desc ? form.project1_desc : ""} onChange={handleChange} name='project1_desc' rows={2} className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Brief Description" />
                            </div>
                            <div>
                                <input value={form.project1_link ? form.project1_link : ""} onChange={handleChange} type="text" name='project1_link' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Live Demo or GitHub Link" />
                            </div>
                        </div>

                        {/* Project 2 */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-black text-sm">Project #2</h3>
                            <div>
                                <input value={form.project2_title ? form.project2_title : ""} onChange={handleChange} type="text" name='project2_title' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Title" />
                            </div>
                            <div>
                                <textarea value={form.project2_desc ? form.project2_desc : ""} onChange={handleChange} name='project2_desc' rows={2} className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Brief Description" />
                            </div>
                            <div>
                                <input value={form.project2_link ? form.project2_link : ""} onChange={handleChange} type="text" name='project2_link' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Live Demo or GitHub Link" />
                            </div>
                        </div>

                        {/* Project 3 */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <h3 className="font-bold text-black text-sm">Project #3</h3>
                            <div>
                                <input value={form.project3_title ? form.project3_title : ""} onChange={handleChange} type="text" name='project3_title' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Title" />
                            </div>
                            <div>
                                <textarea value={form.project3_desc ? form.project3_desc : ""} onChange={handleChange} name='project3_desc' rows={2} className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Brief Description" />
                            </div>
                            <div>
                                <input value={form.project3_link ? form.project3_link : ""} onChange={handleChange} type="text" name='project3_link' className="block w-full p-2.5 text-black border border-gray-300 rounded-lg bg-white text-xs focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Project Live Demo or GitHub Link" />
                            </div>
                        </div>
                    </div>

                    {/* Section 6: Razorpay */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm space-y-4">
                        <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2">6. Project Collaboration Payments</h2>
                        
                        <div>
                            <label htmlFor="razorpayid" className="block mb-2 text-sm font-semibold text-black">Razorpay Key ID</label>
                            <input value={form.razorpayid ? form.razorpayid : ""} onChange={handleChange} type="text" name='razorpayid' id="razorpayid" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter Razorpay Key ID" />
                        </div>
                        
                        <div>
                            <label htmlFor="razorpaysecret" className="block mb-2 text-sm font-semibold text-black">Razorpay Key Secret</label>
                            <input value={form.razorpaysecret ? form.razorpaysecret : ""} onChange={handleChange} type="text" name='razorpaysecret' id="razorpaysecret" className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-sm focus:border-black focus:ring-1 focus:ring-black outline-none placeholder-gray-400" placeholder="Enter Razorpay Key Secret" />
                        </div>
                    </div>

                    {/* Submit Button + View Portfolio */}
                    <div className="pt-4 flex flex-col gap-3">
                        <button type="submit" className="block w-full p-4 text-white bg-black hover:bg-neutral-800 font-bold rounded-lg text-sm text-center transition-all cursor-pointer shadow-md">
                            Save & Publish Portfolio →
                        </button>
                        <Link href="/projects">
                            <button type="button" className="block w-full p-3 text-black bg-white border border-gray-300 hover:border-black font-semibold rounded-lg text-sm text-center transition-all">
                                Explore All Projects
                            </button>
                        </Link>
                    </div>
                </form>
            </div>

            {otpModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <h3 className="text-lg font-bold text-black">OTP Verification</h3>
                        <p className="text-sm text-gray-600">Enter the 6-digit OTP code sent to <span className="font-semibold text-black">{form.phone}</span>.</p>

                        <input 
                            value={enteredOtp} 
                            onChange={(e) => setEnteredOtp(e.target.value)} 
                            type="text" 
                            maxLength={6}
                            placeholder="Enter 6-digit OTP" 
                            className="block w-full p-3 text-black border border-gray-300 rounded-lg bg-white text-center text-lg font-bold tracking-widest outline-none focus:border-black"
                        />
                        
                        <div className="flex gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => { setOtpModal(false); setEnteredOtp(""); }}
                                className="flex-1 p-3 text-black bg-gray-100 hover:bg-gray-200 font-semibold rounded-lg text-sm text-center transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                onClick={verifyOTP}
                                disabled={verifyingOtp || enteredOtp.length < 6}
                                className="flex-1 p-3 text-white bg-black hover:bg-neutral-800 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold rounded-lg text-sm text-center transition-all"
                            >
                                {verifyingOtp ? "Verifying..." : "Verify"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Dashboard
