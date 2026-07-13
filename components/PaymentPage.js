"use client"
import React, { useEffect, useState } from 'react'
import Script from 'next/script'
import { fetchuser, fetchpayments, initiate } from '@/actions/useractions'
import { useSearchParams } from 'next/navigation'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Bounce } from 'react-toastify';
import { useRouter } from 'next/navigation'

const playfairStyle = { fontFamily: "var(--font-playfair), 'Georgia', 'Times New Roman', serif" };
const interStyle = { fontFamily: "var(--font-inter), system-ui, sans-serif" };

// Level → Tailwind bg class for the streak grid
const LEVEL_COLORS = ["bg-gray-100", "bg-neutral-300", "bg-neutral-400", "bg-neutral-600", "bg-black"];

const PaymentPage = ({ username }) => {
    const [paymentform, setPaymentform] = useState({ name: "", message: "", amount: "" })
    const [currentUser, setcurrentUser] = useState({})
    const [payments, setPayments] = useState([])
    const [githubData, setGithubData] = useState(null)
    const [leetcodeData, setLeetcodeData] = useState(null)
    const [loadingGH, setLoadingGH] = useState(false)
    const [loadingLC, setLoadingLC] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        getData()
    }, [username])

    useEffect(() => {
        if (searchParams.get("payment") === "success") {
            toast.success('Thank you for your contribution!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
            });
            router.push(`/${username}`)
        }
    }, [searchParams])

    // Scroll to #contribute anchor on load or when user state loads
    useEffect(() => {
        const checkAndScroll = () => {
            if (typeof window !== "undefined" && window.location.hash === "#contribute") {
                const el = document.getElementById("contribute");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        };

        checkAndScroll();
        // Run with short timeouts to handle loading states and rendering delays
        const timer1 = setTimeout(checkAndScroll, 200);
        const timer2 = setTimeout(checkAndScroll, 600);
        const timer3 = setTimeout(checkAndScroll, 1200);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [currentUser, username, searchParams]);

    const handleChange = (e) => {
        setPaymentform({ ...paymentform, [e.target.name]: e.target.value })
    }

    const getData = async () => {
        let u = await fetchuser(username)
        setcurrentUser(u)
        let dbpayments = await fetchpayments(username)
        setPayments(dbpayments)

        // Auto-fetch GitHub data if github handle is set
        if (u.github) {
            const ghHandle = u.github.startsWith("http")
                ? u.github.replace(/.*github\.com\//, "")
                : u.github
            setLoadingGH(true)
            try {
                const ghRes = await fetch(`/api/github?username=${ghHandle}`)
                if (ghRes.ok) setGithubData(await ghRes.json())
            } catch (_) { }
            setLoadingGH(false)
        }

        // Auto-fetch LeetCode data if leetcode handle is set
        if (u.leetcode) {
            setLoadingLC(true)
            try {
                const lcRes = await fetch(`/api/leetcode?username=${u.leetcode}`)
                if (lcRes.ok) setLeetcodeData(await lcRes.json())
            } catch (_) { }
            setLoadingLC(false)
        }
    }

    const pay = async (amount) => {
        try {
            if (!currentUser.razorpayid || !currentUser.razorpaysecret) {
                toast.error('This user has not set up their Razorpay payment gateway. Please ask them to configure it in their Dashboard.', {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "light",
                    transition: Bounce,
                });
                return;
            }
            const paymentData = {
                name: paymentform.name || "Anonymous",
                message: paymentform.message || "Supported project",
                amount: amount / 100
            };
            let a = await initiate(amount, username, paymentData)
            let orderId = a.id
            var options = {
                "key": currentUser.razorpayid,
                "amount": amount,
                "currency": "INR",
                "name": "Axiora Collaboration",
                "description": `Contribution for ${username}`,
                "image": currentUser.profilepic || "/defaultprofilepic.webp",
                "order_id": orderId,
                "callback_url": `${process.env.NEXT_PUBLIC_URL}/api/razorpay`,
                "prefill": {
                    "name": paymentData.name,
                    "email": currentUser.email,
                },
                "theme": { "color": "#000000" }
            }
            var rzp1 = new window.Razorpay(options);
            rzp1.open();
        } catch (error) {
            console.error(error)
            toast.error('Payment failed. Please try again later.', {
                position: "top-right",
                autoClose: 5000,
                theme: "light",
                transition: Bounce,
            });
        }
    }

    // Render the real GitHub contribution grid (from API) or a seeded fallback
    const renderStreakGrid = () => {
        let grid;
        if (githubData?.contributionGrid) {
            // Real data from GitHub events API
            grid = githubData.contributionGrid;
        } else {
            // Seeded fallback while loading or if no GitHub handle
            const seed = githubData?.public_repos || 12;
            grid = [];
            for (let w = 0; w < 36; w++) {
                const week = [];
                for (let d = 0; d < 7; d++) {
                    const val = (w * seed + d * 5 + 7) % 7;
                    const level = val === 0 ? 0 : val <= 2 ? 1 : val <= 4 ? 2 : val <= 5 ? 3 : 4;
                    week.push(level);
                }
                grid.push(week);
            }
        }

        return (
            <div className="flex gap-[3px] overflow-x-auto py-3 scrollbar-none justify-start md:justify-center border border-gray-100 rounded-lg p-4 bg-gray-50">
                {grid.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-[3px] flex-shrink-0">
                        {week.map((level, di) => (
                            <div
                                key={di}
                                className={`w-[10px] h-[10px] rounded-[1.5px] ${LEVEL_COLORS[level] || "bg-gray-100"}`}
                                title={`Activity level: ${level}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
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
            <Script src="https://checkout.razorpay.com/v1/checkout.js"></Script>

            {/* Banner Section */}
            <div className='cover w-full bg-gray-100 relative h-48 md:h-[280px]'>
                <img
                    className='object-cover w-full h-full border-b border-gray-200'
                    src={currentUser.coverpic || "/statue.webp"}
                    alt="cover banner"
                />
                <div className='absolute -bottom-16 left-6 md:left-12 border-white overflow-hidden border-4 rounded-full w-32 h-32 md:w-36 md:h-36 bg-white shadow-sm'>
                    <img
                        className='rounded-full object-cover w-full h-full'
                        src={currentUser.profilepic || "/defaultprofilepic.webp"}
                        alt="profile avatar"
                    />
                </div>
            </div>

            {/* Profile Intro */}
            <div className="px-6 md:px-12 pt-20 pb-6 bg-white border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                    <div>
                        <h1 className='text-3xl font-black text-black' style={playfairStyle}>
                            {currentUser.name || `@${username}`}
                        </h1>
                        <p className='text-[#767676] text-sm font-semibold mt-1' style={interStyle}>@{username}</p>

                        {(currentUser.college || currentUser.graduationYear) && (
                            <p className='text-[#767676] text-sm mt-2' style={interStyle}>
                                🏫 {currentUser.college} {currentUser.graduationYear ? `| Class of ${currentUser.graduationYear}` : ""}
                            </p>
                        )}

                        {currentUser.phone && currentUser.phoneVerified && (
                            <p className='text-[#767676] text-sm mt-1.5' style={interStyle}>
                                📞 {currentUser.phone}
                            </p>
                        )}
                    </div>

                    {/* Social & Coding Links */}
                    <div className="flex flex-wrap gap-2">
                        {currentUser.github && (
                            <a href={currentUser.github.startsWith("http") ? currentUser.github : `https://github.com/${currentUser.github}`} target="_blank" rel="noreferrer"
                                className="bg-black text-white hover:bg-neutral-800 text-xs px-3.5 py-2 rounded-sm font-semibold transition-all"
                                style={interStyle}>
                                GitHub
                            </a>
                        )}
                        {currentUser.linkedin && (
                            <a href={currentUser.linkedin.startsWith("http") ? currentUser.linkedin : `https://linkedin.com/in/${currentUser.linkedin}`} target="_blank" rel="noreferrer"
                                className="bg-white text-black border border-black hover:bg-black hover:text-white text-xs px-3.5 py-2 rounded-sm font-semibold transition-all"
                                style={interStyle}>
                                LinkedIn
                            </a>
                        )}
                        {currentUser.leetcode && (
                            <a href={`https://leetcode.com/${currentUser.leetcode}`} target="_blank" rel="noreferrer"
                                className="bg-gray-100 text-black border border-gray-300 hover:bg-gray-200 text-xs px-3.5 py-2 rounded-sm font-semibold transition-all"
                                style={interStyle}>
                                LeetCode
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Portfolio Grid */}
            <div className="px-6 md:px-12 py-10 bg-white">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Left Column (Portfolio Sections) - Width 2/3 */}
                    <div className="w-full lg:w-2/3 space-y-10">

                        {/* Skills Section */}
                        {currentUser.skills && (
                            <div className="space-y-3">
                                <div className="w-8 h-[2px] bg-black" />
                                <h2 className="text-2xl font-black text-black" style={playfairStyle}>Skills & Expertise</h2>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {currentUser.skills.split(",").map((skill, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-50 text-black border border-gray-200 text-xs px-3 py-1.5 rounded-sm font-semibold"
                                            style={interStyle}
                                        >
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Projects Showcase */}
                        <div className="space-y-4">
                            <div className="w-8 h-[2px] bg-black" />
                            <h2 className="text-2xl font-black text-black" style={playfairStyle}>Project Showcase</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentUser.projects && currentUser.projects.length > 0 ? (
                                    currentUser.projects.map((proj, index) => (
                                        <div key={index} className="border border-gray-200 hover:border-black transition-all duration-300 p-5 bg-white flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-black text-lg text-black" style={playfairStyle}>{proj.title}</h3>
                                                <div className="w-6 h-[2px] bg-black my-2" />
                                                <p className="text-sm text-[#767676] line-clamp-3" style={interStyle}>{proj.description}</p>
                                            </div>
                                            {proj.link && (
                                                <a
                                                    href={proj.link.startsWith("http") ? proj.link : `https://${proj.link}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-4 text-xs font-bold text-black border-b border-black pb-0.5 w-fit hover:text-[#767676] transition-all"
                                                    style={interStyle}
                                                >
                                                    View Project Source / Demo →
                                                </a>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-6 text-sm text-[#767676] border border-dashed border-gray-200 rounded-sm" style={interStyle}>
                                        No featured projects added yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Certifications & Achievements */}
                        {(currentUser.certifications || currentUser.achievements) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {currentUser.certifications && (
                                    <div className="space-y-3">
                                        <div className="w-8 h-[2px] bg-black" />
                                        <h2 className="text-2xl font-black text-black" style={playfairStyle}>Certifications</h2>
                                        <ul className="list-none space-y-2">
                                            {currentUser.certifications.split("\n").map((cert, index) => (
                                                <li key={index} className="text-sm text-[#333333] font-medium flex items-start gap-2" style={interStyle}>
                                                    <span className="mt-1 text-xs text-[#767676]">▸</span>{cert.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {currentUser.achievements && (
                                    <div className="space-y-3">
                                        <div className="w-8 h-[2px] bg-black" />
                                        <h2 className="text-2xl font-black text-black" style={playfairStyle}>Achievements</h2>
                                        <ul className="list-none space-y-2">
                                            {currentUser.achievements.split("\n").map((ach, index) => (
                                                <li key={index} className="text-sm text-[#333333] font-medium flex items-start gap-2" style={interStyle}>
                                                    <span className="mt-1 text-xs text-[#767676]">▸</span>{ach.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GitHub Stats (real data) */}
                        {githubData && (
                            <div className="space-y-4">
                                <div className="w-8 h-[2px] bg-black" />
                                <h2 className="text-2xl font-black text-black" style={playfairStyle}>GitHub Overview</h2>
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                        <p className="text-xs text-[#767676] font-bold uppercase tracking-widest" style={interStyle}>Repositories</p>
                                        <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{githubData.public_repos}</p>
                                    </div>
                                    <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                        <p className="text-xs text-[#767676] font-bold uppercase tracking-widest" style={interStyle}>Followers</p>
                                        <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{githubData.followers}</p>
                                    </div>
                                    <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                        <p className="text-xs text-[#767676] font-bold uppercase tracking-widest" style={interStyle}>Following</p>
                                        <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{githubData.following}</p>
                                    </div>
                                </div>
                                {githubData.bio && <p className="text-sm text-[#767676] italic" style={interStyle}>&ldquo;{githubData.bio}&rdquo;</p>}

                                {/* Top Repos */}
                                {githubData.repos?.length > 0 && (
                                    <div className="space-y-2 mt-3">
                                        <p className="text-xs font-bold uppercase text-[#767676] tracking-widest" style={interStyle}>Top Repositories</p>
                                        {githubData.repos.slice(0, 4).map((repo) => (
                                            <a key={repo.name} href={repo.url} target="_blank" rel="noreferrer"
                                                className="flex items-center justify-between border border-gray-100 hover:border-black px-4 py-3 transition-all group">
                                                <div>
                                                    <p className="text-sm font-bold text-black group-hover:underline" style={interStyle}>{repo.name}</p>
                                                    {repo.description && <p className="text-xs text-[#767676] line-clamp-1 mt-0.5" style={interStyle}>{repo.description}</p>}
                                                </div>
                                                <div className="flex gap-3 text-xs text-[#767676] shrink-0" style={interStyle}>
                                                    {repo.language && <span className="border border-gray-200 px-2 py-0.5 rounded-sm">{repo.language}</span>}
                                                    <span>⭐ {repo.stars}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {loadingGH && (
                            <div className="text-sm text-[#767676] py-4" style={interStyle}>Loading GitHub data...</div>
                        )}

                        {/* Activity Streak Grid — real GitHub events data */}
                        <div className="space-y-3">
                            <div className="w-8 h-[2px] bg-black" />
                            <h2 className="text-2xl font-black text-black" style={playfairStyle}>Activity Streak</h2>
                            <p className="text-xs text-[#767676] mb-2 font-medium" style={interStyle}>
                                {githubData?.contributionGrid
                                    ? "Real GitHub public activity over the last 36 weeks."
                                    : "Visual representation of developer activity over the last 36 weeks."}
                            </p>
                            {/* Legend */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] text-[#767676]" style={interStyle}>Less</span>
                                {LEVEL_COLORS.map((cls, i) => (
                                    <div key={i} className={`w-[10px] h-[10px] rounded-[1.5px] ${cls}`} />
                                ))}
                                <span className="text-[10px] text-[#767676]" style={interStyle}>More</span>
                            </div>
                            {renderStreakGrid()}
                        </div>

                        {/* LeetCode Stats */}
                        {(leetcodeData || loadingLC) && (
                            <div className="space-y-3">
                                <div className="w-8 h-[2px] bg-black" />
                                <h2 className="text-2xl font-black text-black" style={playfairStyle}>Competitive Programming</h2>
                                {loadingLC ? (
                                    <div className="text-sm text-[#767676] py-4" style={interStyle}>Loading LeetCode stats...</div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-4 gap-3">
                                            <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                                <p className="text-xs text-[#767676] font-bold uppercase tracking-widest" style={interStyle}>Total</p>
                                                <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{leetcodeData.totalSolved}</p>
                                            </div>
                                            <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                                <p className="text-xs text-green-600 font-bold uppercase tracking-widest" style={interStyle}>Easy</p>
                                                <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{leetcodeData.easySolved}</p>
                                            </div>
                                            <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                                <p className="text-xs text-yellow-600 font-bold uppercase tracking-widest" style={interStyle}>Medium</p>
                                                <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{leetcodeData.mediumSolved}</p>
                                            </div>
                                            <div className="border border-gray-200 p-4 text-center bg-gray-50">
                                                <p className="text-xs text-red-600 font-bold uppercase tracking-widest" style={interStyle}>Hard</p>
                                                <p className="text-2xl font-black text-black mt-1" style={playfairStyle}>{leetcodeData.hardSolved}</p>
                                            </div>
                                        </div>
                                        {leetcodeData.ranking && (
                                            <p className="text-xs text-[#767676] font-medium" style={interStyle}>
                                                Global Ranking: <span className="font-black text-black">#{leetcodeData.ranking?.toLocaleString()}</span>
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                    </div>


                    {/* Right Column — Contribution payment & leaderboard */}
                    <div className="w-full lg:w-1/3 space-y-6">

                        {/* ── CONTRIBUTE SECTION — scroll anchor ── */}
                        <div id="contribute" className="border border-gray-200 p-6 bg-white scroll-mt-20">
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-2" style={interStyle}>
                                Contribute to Projects
                            </p>
                            <h2 className="text-2xl font-black text-black mb-1" style={playfairStyle}>
                                Contribute to Collaborate
                            </h2>
                            <div className="w-8 h-[2px] bg-black mb-4" />
                            <div className='flex gap-4 flex-col'>
                                <div>
                                    <input onChange={handleChange} value={paymentform.name} name='name' type="text"
                                        className='w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm rounded-sm'
                                        placeholder='Your Name'
                                        style={interStyle}
                                    />
                                </div>
                                <input onChange={handleChange} value={paymentform.message} name='message' type="text"
                                    className='w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm rounded-sm'
                                    placeholder='Collaboration Message'
                                    style={interStyle}
                                />
                                <input onChange={handleChange} value={paymentform.amount} name="amount" type="text"
                                    className='w-full p-3 bg-white border border-gray-300 text-black placeholder-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm rounded-sm'
                                    placeholder='Amount (₹)'
                                    style={interStyle}
                                />
                                <button
                                    onClick={() => pay(Number.parseInt(paymentform.amount || "0") * 100)}
                                    type="button"
                                    className="text-white bg-black hover:bg-neutral-800 font-bold text-sm px-5 py-3.5 text-center w-full disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:border transition-all cursor-pointer rounded-sm"
                                    disabled={!paymentform.amount || Number.isNaN(Number(paymentform.amount)) || Number(paymentform.amount) <= 0}
                                    style={interStyle}
                                >
                                    Contribute & Connect →
                                </button>
                                <p className="text-center text-[10px] text-[#767676]" style={interStyle}>
                                    💡 Desktop localhost par Google Pay/UPI direct open nahi hota. Card / Netbanking choose karein.
                                </p>
                            </div>

                            <div className='flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100'>
                                <button className='bg-gray-50 border border-gray-200 text-black text-xs px-3 py-2 font-semibold hover:bg-gray-100 transition-all flex-1 rounded-sm' onClick={() => pay(1000)} style={interStyle}>₹10</button>
                                <button className='bg-gray-50 border border-gray-200 text-black text-xs px-3 py-2 font-semibold hover:bg-gray-100 transition-all flex-1 rounded-sm' onClick={() => pay(2000)} style={interStyle}>₹20</button>
                                <button className='bg-gray-50 border border-gray-200 text-black text-xs px-3 py-2 font-semibold hover:bg-gray-100 transition-all flex-1 rounded-sm' onClick={() => pay(3000)} style={interStyle}>₹30</button>
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="border border-gray-200 p-6 bg-white">
                            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-2" style={interStyle}>Backers</p>
                            <h2 className="text-2xl font-black text-black mb-1" style={playfairStyle}>Project Contributors</h2>
                            <div className="w-8 h-[2px] bg-black mb-4" />
                            <ul className="space-y-4">
                                {payments.length === 0 ? (
                                    <li className="text-sm text-[#767676] text-center py-4" style={interStyle}>No contributions yet.</li>
                                ) : (
                                    payments.map((p, i) => (
                                        <li key={i} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0">
                                            <img width={28} height={28} src="/defaultprofilepic.webp" alt="avatar" className="rounded-full border border-gray-200 mt-0.5" />
                                            <div className="text-xs text-black" style={interStyle}>
                                                <span className="font-bold">{p.name}</span> contributed <span className="font-extrabold">₹{p.amount}</span>
                                                <p className="text-[#767676] italic mt-1 font-medium">&quot;{p.message}&quot;</p>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>

                    </div>

                </div>
            </div>
        </>
    )
}

export default PaymentPage