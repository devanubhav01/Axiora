import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Link from "next/link";

export const metadata = {
  title: "Explore Projects — Axiora",
  description: "Browse all developer projects listed on Axiora. Contribute, collaborate, and connect.",
};

const playfairStyle = {
  fontFamily: "var(--font-playfair), 'Georgia', 'Times New Roman', serif",
};
const interStyle = {
  fontFamily: "var(--font-inter), system-ui, sans-serif",
};

export default async function ProjectsPage() {
  await connectDb();

  // Fetch all users who have at least one project
  const users = await User.find(
    { "projects.0": { $exists: true } },
    { username: 1, name: 1, profilepic: 1, college: 1, skills: 1, projects: 1, github: 1, linkedin: 1 }
  ).lean();

  // Flatten all projects with owner info
  const allProjects = [];
  for (const user of users) {
    for (const project of user.projects || []) {
      if (project.title) {
        allProjects.push({
          ...project,
          ownerUsername: user.username,
          ownerName: user.name || user.username,
          ownerPic: user.profilepic,
          ownerCollege: user.college,
          ownerSkills: user.skills,
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white py-14 px-6 md:px-16">
        <div className="container mx-auto">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#767676] mb-3" style={interStyle}>
            Axiora Projects
          </p>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-4" style={playfairStyle}>
            Explore Projects
          </h1>
          <div className="w-12 h-[3px] bg-black mb-5" />
          <p className="text-[#767676] max-w-xl" style={interStyle}>
            Browse developer projects built and shared by the Axiora community. Contribute financially, collaborate, or just get inspired.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-6 md:px-16 py-14">
        {allProjects.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-4xl mb-4">🛠</p>
            <h2 className="text-2xl font-black text-black mb-2" style={playfairStyle}>No projects yet</h2>
            <p className="text-[#767676] mb-6" style={interStyle}>Be the first to add your project to the community.</p>
            <Link href="/login">
              <button className="bg-black text-white px-6 py-3 text-sm font-semibold rounded-sm hover:bg-neutral-800 transition-all" style={interStyle}>
                Create Your Profile →
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {allProjects.map((project, i) => (
              <div
                key={i}
                className="border border-gray-200 hover:border-black transition-all duration-300 flex flex-col"
              >
                {/* Project card header */}
                <div className="p-6 flex-1 flex flex-col gap-3">
                  <h2 className="text-xl font-black text-black leading-snug" style={playfairStyle}>
                    {project.title}
                  </h2>
                  <div className="w-6 h-[2px] bg-black" />
                  <p className="text-sm text-[#767676] leading-relaxed flex-1" style={interStyle}>
                    {project.description || "No description provided."}
                  </p>

                  {/* Links */}
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {project.link && (
                      <a
                        href={project.link.startsWith("http") ? project.link : `https://${project.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-black border-b border-black pb-0.5 hover:text-[#767676] transition-all"
                        style={interStyle}
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer: owner info + contribute */}
                <div className="border-t border-gray-100 p-5 bg-gray-50 flex items-center justify-between gap-3">
                  <Link href={`/${project.ownerUsername}`} className="flex items-center gap-2 group">
                    <img
                      src={project.ownerPic || "/defaultprofilepic.webp"}
                      width={30}
                      height={30}
                      alt={project.ownerName}
                      className="rounded-full border border-gray-200"
                    />
                    <div>
                      <p className="text-xs font-bold text-black group-hover:underline" style={interStyle}>
                        {project.ownerName}
                      </p>
                      {project.ownerCollege && (
                        <p className="text-[10px] text-[#767676]" style={interStyle}>
                          {project.ownerCollege}
                        </p>
                      )}
                    </div>
                  </Link>
                  <Link href={`/${project.ownerUsername}#contribute`}>
                    <button
                      className="text-xs font-semibold bg-black text-white px-4 py-2 rounded-sm hover:bg-neutral-800 transition-all whitespace-nowrap"
                      style={interStyle}
                    >
                      Contribute
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
