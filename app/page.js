"use client"
import Link from "next/link";
import { useSession } from "next-auth/react";

const playfairStyle = {
  fontFamily: "var(--font-playfair), 'Georgia', 'Times New Roman', serif",
};

const interStyle = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
};

export default function Home() {
  const { data: session } = useSession();
  const contributeLink = session?.user?.name ? `/${session.user.name}#contribute` : "/login";

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-16 py-20 flex flex-col md:flex-row items-center gap-12">

          {/* Left: Text */}
          <div className="flex-1 flex flex-col gap-6 items-start">
            <span
              className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676]"
              style={interStyle}
            >
              Developer Portfolios
            </span>
            <h1 className="text-5xl md:text-6xl font-black leading-[1.08] text-black" style={playfairStyle}>
              Axiora
            </h1>
            <div className="w-12 h-[3px] bg-black"></div>
            <p className="text-[#767676] text-lg leading-relaxed max-w-md" style={interStyle}>
              Create a stunning developer portfolio and generate your professional resume.
            </p>
            <p className="text-[#767676] leading-relaxed max-w-md" style={interStyle}>
              Contribute to shared projects to start collaborating directly with creators.
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              <Link href="/dashboard">
                <button
                  type="button"
                  className="text-white bg-black hover:bg-neutral-800 font-semibold rounded-sm text-sm px-7 py-3 text-center transition-all"
                  style={interStyle}
                >
                  Start Building →
                </button>
              </Link>
              <Link href="/projects">
                <button
                  type="button"
                  className="text-black bg-white border border-black hover:bg-gray-50 font-semibold rounded-sm text-sm px-7 py-3 text-center transition-all"
                  style={interStyle}
                >
                  Explore Projects
                </button>
              </Link>
            </div>
          </div>

          {/* Right: Hero Illustration */}
          <div className="flex-1 flex justify-center items-center">
            <div
              className="bg-white flex items-center justify-center"
              style={{ minWidth: 300, minHeight: 260 }}
            >
              <img
                src="/resume_typing_400.gif"
                width={320}
                height={280}
                alt="Axiora - Build your developer identity"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL RULE ─────────────────────────────────────── */}
      <div className="border-t-4 border-b border-black mx-6 md:mx-16"></div>

      {/* ── FEATURES ───────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-16">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-3" style={interStyle}>
              How It Works
            </p>
            <h2
              className="text-4xl md:text-5xl font-black text-black"
              style={playfairStyle}
            >
              Build, Contribute,
              <br className="hidden md:block" /> and Collaborate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {/* Card 1 — Create Profile */}
            <div className="border border-gray-200 hover:border-black transition-all duration-300 group p-7 flex flex-col gap-5">
              <div
                className="flex justify-center items-center bg-white transition-all rounded-sm py-6"
                style={{ minHeight: 200 }}
              >
                <img
                  src="/axiora_profile_img.png"
                  width={190}
                  height={175}
                  alt="Create Your Profile"
                  className="object-contain"
                />
              </div>
              <div className="w-8 h-[2px] bg-black"></div>
              <p className="font-black text-lg text-black leading-snug" style={playfairStyle}>
                Create Your Profile
              </p>
              <p className="text-[#767676] text-sm leading-relaxed" style={interStyle}>
                Set up your skills, portfolio projects, and personal resume details. Showcase who you are as a developer in minutes.
              </p>
              <Link
                href="/dashboard"
                className="text-xs font-semibold tracking-widest uppercase text-black border-b border-black pb-0.5 w-fit hover:text-[#767676] transition-all"
                style={interStyle}
              >
                Get Started →
              </Link>
            </div>

            {/* Card 2 — Contribute */}
            <div className="border border-gray-200 hover:border-black transition-all duration-300 group p-7 flex flex-col gap-5">
              <div
                className="flex justify-center items-center bg-white transition-all rounded-sm py-6"
                style={{ minHeight: 200 }}
              >
                <img
                  src="/axiora_contribute_img.png"
                  width={190}
                  height={175}
                  alt="Contribute to Projects"
                  className="object-contain"
                />
              </div>
              <div className="w-8 h-[2px] bg-black"></div>
              <p className="font-black text-lg text-black leading-snug" style={playfairStyle}>
                Contribute to Projects
              </p>
              <p className="text-[#767676] text-sm leading-relaxed" style={interStyle}>
                Contribute financial support to join or back interesting projects. Every rupee fuels the next great developer idea.
              </p>
              <Link
                href={contributeLink}
                className="text-xs font-semibold tracking-widest uppercase text-black border-b border-black pb-0.5 w-fit hover:text-[#767676] transition-all"
                style={interStyle}
              >
                Contribute →
              </Link>
            </div>

            {/* Card 3 — Work Together */}
            <div className="border border-gray-200 hover:border-black transition-all duration-300 group p-7 flex flex-col gap-5">
              <div
                className="flex justify-center items-center bg-white transition-all rounded-sm py-6"
                style={{ minHeight: 200 }}
              >
                <img
                  src="/axiora_collaborate_img.png"
                  width={190}
                  height={175}
                  alt="Work Together"
                  className="object-contain"
                />
              </div>
              <div className="w-8 h-[2px] bg-black"></div>
              <p className="font-black text-lg text-black leading-snug" style={playfairStyle}>
                Work Together
              </p>
              <p className="text-[#767676] text-sm leading-relaxed" style={interStyle}>
                Collaborate directly with creators on building next-gen software. Find your co-founder, teammate, or mentor here.
              </p>
              <Link
                href="/collaborate"
                className="text-xs font-semibold tracking-widest uppercase text-black border-b border-black pb-0.5 w-fit hover:text-[#767676] transition-all"
                style={interStyle}
              >
                Collaborate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────── */}
      <section className="bg-black text-white py-10">
        <div className="container mx-auto px-6 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { num: "500+", label: "Portfolios Built" },
            { num: "₹2L+", label: "Contributions Made" },
            { num: "120+", label: "Projects Listed" },
            { num: "80+", label: "Collaborations" },
          ].map(({ num, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <span className="text-3xl font-black" style={playfairStyle}>
                {num}
              </span>
              <span className="text-xs tracking-widest uppercase text-gray-400" style={interStyle}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── EDITORIAL RULE ─────────────────────────────────────── */}
      <div></div>

      {/* ── ABOUT / LEARN MORE ─────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-16">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-3" style={interStyle}>
              About the Platform
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-black mb-5" style={playfairStyle}>
              Learn more about Axiora
            </h2>
            <div className="w-12 h-[3px] bg-black mx-auto mb-6"></div>
          </div>

          {/* Logo + About layout */}
          <div className="flex flex-col md:flex-row items-center gap-14 mb-16">
            {/* Large Logo Display */}
            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="bg-black rounded-2xl p-10 flex items-center justify-center" style={{ width: 220, height: 220 }}>
                <img
                  src="/Axioralogo.jpeg"
                  width={160}
                  height={160}
                  alt="Axiora Logo"
                  className="object-contain rounded-lg"
                />
              </div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#767676] font-semibold" style={interStyle}>
                Axiora
              </p>
            </div>

            {/* Right: description + bullets */}
            <div className="flex-1 flex flex-col gap-6">
              <p className="text-[#767676] leading-relaxed text-base" style={interStyle}>
                Axiora is built for developers who want more than just a résumé. It is a living, breathing professional identity — connecting your skills, projects, and community in one place. From your first side project to your next startup, Axiora grows with you.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "🗂  Build a multi-section developer portfolio in under 10 minutes",
                  "📄  Generate a clean, ATS-friendly PDF resume with one click",
                  "💳  Accept contributions via Razorpay — UPI, Cards, Netbanking",
                  "🔗  Showcase GitHub, LinkedIn & LeetCode stats on your public page",
                  "🤝  Find collaborators and connect with like-minded builders",
                  "🔒  Secure OAuth login via Google, GitHub & LinkedIn",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm text-[#767676]"
                    style={interStyle}
                  >
                    <span className="mt-0.5 text-base">{item.slice(0, 2)}</span>
                    <span className="leading-relaxed">{item.slice(3)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Centered Signature Block */}
          <div className="mt-14 flex flex-col items-center justify-center text-center gap-2">
            <img
              src="/axioresignature01.png"
              alt="Anubhav Singh Signature"
              className="h-64 w-auto object-contain"
            />
            <div style={interStyle} className="text-sm">
              <span className="text-[#767676]">Created by </span>
              <span className="text-black font-bold">Anubhav Singh</span>
              <p className="text-[#767676] text-xs mt-1">Full Stack Developer</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="border-t border-gray-200 pt-12">
            <p
              className="text-center text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-8"
              style={interStyle}
            >
              Find us & connect
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {[
                {
                  name: "GitHub",
                  href: "https://github.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  ),
                },
                {
                  name: "LinkedIn",
                  href: "https://linkedin.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  name: "Twitter / X",
                  href: "https://twitter.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  name: "Instagram",
                  href: "https://instagram.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  ),
                },
                {
                  name: "YouTube",
                  href: "https://youtube.com",
                  icon: (
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  ),
                },
              ].map(({ name, href, icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-gray-300 hover:border-black text-[#767676] hover:text-black transition-all px-5 py-2.5 rounded-sm text-sm font-medium"
                  style={interStyle}
                >
                  {icon}
                  <span>{name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* CTA Strip */}
          <div className="mt-14 bg-black text-white rounded-sm px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img
                src="/Axioralogo.jpeg"
                width={52}
                height={52}
                alt="Axiora"
                className="rounded-lg object-contain flex-shrink-0"
              />
              <div>
                <h3 className="text-2xl font-black mb-1" style={playfairStyle}>
                  Ready to build your portfolio?
                </h3>
                <p className="text-gray-400 text-sm" style={interStyle}>
                  Join developers who are already showcasing their work on Axiora.
                </p>
              </div>
            </div>
            <Link href="/login">
              <button
                type="button"
                className="bg-white text-black font-bold rounded-sm text-sm px-8 py-3 hover:bg-gray-100 transition-all whitespace-nowrap"
                style={interStyle}
              >
                Start for free →
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}