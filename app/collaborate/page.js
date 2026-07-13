"use client";
import { useState } from "react";
import Link from "next/link";

const playfairStyle = {
  fontFamily: "var(--font-playfair), 'Georgia', 'Times New Roman', serif",
};
const interStyle = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
};

const benefits = [
  {
    icon: "🧠",
    title: "Find Co-Founders",
    desc: "Connect with developers who share your vision. Build your next startup with the right partner.",
  },
  {
    icon: "🛠",
    title: "Open Source Together",
    desc: "Contribute to projects you care about. Every pull request makes the community stronger.",
  },
  {
    icon: "📚",
    title: "Mentor & Learn",
    desc: "Pair up with a senior dev or guide a junior one. Knowledge shared is knowledge multiplied.",
  },
  {
    icon: "💰",
    title: "Fund Each Other",
    desc: "Use Axiora's contribution system to financially back promising projects and developers.",
  },
  {
    icon: "🌐",
    title: "Remote-First Community",
    desc: "Work with developers across India and beyond — no office required.",
  },
  {
    icon: "🚀",
    title: "Ship Faster",
    desc: "Two developers moving in sync ship features twice as fast. Collaboration is the ultimate productivity hack.",
  },
];

export default function CollaboratePage() {
  const [form, setForm] = useState({ name: "", email: "", github: "", idea: "", lookingFor: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production this would POST to an API endpoint
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white py-14 px-6 md:px-16">
        <div className="container mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-3" style={interStyle}>
            Collaboration Hub
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4" style={playfairStyle}>
            Work Together
          </h1>
          <div className="w-12 h-[3px] bg-black mb-5" />
          <p className="text-[#767676] max-w-xl" style={interStyle}>
            Find your next collaborator, co-founder, or open-source teammate on Axiora. The best software is built by people who care.
          </p>
        </div>
      </div>

      {/* Benefits Grid */}
      <div className="container mx-auto px-6 md:px-16 py-16">
        <h2 className="text-2xl font-black text-black mb-10" style={playfairStyle}>
          Why collaborate on Axiora?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {benefits.map((b) => (
            <div key={b.title} className="border border-gray-200 hover:border-black transition-all p-6 flex flex-col gap-3">
              <span className="text-3xl">{b.icon}</span>
              <div className="w-6 h-[2px] bg-black" />
              <h3 className="font-black text-lg text-black" style={playfairStyle}>{b.title}</h3>
              <p className="text-sm text-[#767676] leading-relaxed" style={interStyle}>{b.desc}</p>
            </div>
          ))}
        </div>

        {/* Interest Form */}
        <div className="max-w-2xl mx-auto border border-gray-200 p-10">
          {submitted ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-black text-black mb-2" style={playfairStyle}>We received your interest!</h2>
              <p className="text-[#767676] mb-6" style={interStyle}>
                We'll connect you with relevant developers from the Axiora community soon.
              </p>
              <Link href="/projects">
                <button className="bg-black text-white px-6 py-3 text-sm font-semibold rounded-sm hover:bg-neutral-800 transition-all" style={interStyle}>
                  Browse Projects →
                </button>
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-black mb-2" style={playfairStyle}>
                Express Your Interest
              </h2>
              <div className="w-8 h-[2px] bg-black mb-6" />
              <p className="text-sm text-[#767676] mb-8" style={interStyle}>
                Tell us what you're building and what kind of collaborator you're looking for.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5" style={interStyle}>Name</label>
                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="w-full border border-gray-300 focus:border-black focus:ring-0 rounded-sm px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                      style={interStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5" style={interStyle}>Email</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full border border-gray-300 focus:border-black focus:ring-0 rounded-sm px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                      style={interStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5" style={interStyle}>GitHub Profile URL</label>
                  <input
                    name="github"
                    value={form.github}
                    onChange={handleChange}
                    placeholder="https://github.com/yourusername"
                    className="w-full border border-gray-300 focus:border-black focus:ring-0 rounded-sm px-4 py-3 text-sm text-black placeholder-gray-400 outline-none"
                    style={interStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5" style={interStyle}>What are you building?</label>
                  <textarea
                    required
                    name="idea"
                    value={form.idea}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your project idea or what you want to work on..."
                    className="w-full border border-gray-300 focus:border-black focus:ring-0 rounded-sm px-4 py-3 text-sm text-black placeholder-gray-400 outline-none resize-none"
                    style={interStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-black mb-1.5" style={interStyle}>Who are you looking for?</label>
                  <select
                    name="lookingFor"
                    value={form.lookingFor}
                    onChange={handleChange}
                    className="w-full border border-gray-300 focus:border-black focus:ring-0 rounded-sm px-4 py-3 text-sm text-black outline-none bg-white"
                    style={interStyle}
                  >
                    <option value="">Select a role</option>
                    <option value="co-founder">Co-Founder</option>
                    <option value="frontend">Frontend Developer</option>
                    <option value="backend">Backend Developer</option>
                    <option value="fullstack">Full-Stack Developer</option>
                    <option value="ml">ML / AI Engineer</option>
                    <option value="designer">UI/UX Designer</option>
                    <option value="mentor">Mentor</option>
                    <option value="any">Open to anyone</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-black text-white font-semibold rounded-sm py-3.5 text-sm hover:bg-neutral-800 transition-all mt-2"
                  style={interStyle}
                >
                  Submit Interest →
                </button>
              </form>
            </>
          )}
        </div>

        {/* CTA to browse profiles */}
        <div className="mt-16 text-center">
          <p className="text-[#767676] mb-4" style={interStyle}>Already on Axiora? Browse developer profiles directly.</p>
          <Link href="/projects">
            <button className="border border-black text-black font-semibold px-7 py-3 text-sm rounded-sm hover:bg-black hover:text-white transition-all" style={interStyle}>
              Browse Projects & Profiles →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
