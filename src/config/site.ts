/** Product identity lives here so it can be changed in one place. */
export const site = {
  name: "Under the Hood",
  shortName: "UTH",
  tagline: "Understand how software actually works — and explain it in interviews.",
  description:
    "An interactive engineering textbook, runtime laboratory, interview-preparation platform and personal study planner.",
  repo: "https://github.com/saurabhraghuvanshii",
};

export const nav = [
  { href: "/", label: "Dashboard", icon: "home" },
  { href: "/explore", label: "Explore", icon: "compass" },
  { href: "/paths", label: "Learning paths", icon: "route" },
  { href: "/interview", label: "Interview prep", icon: "messages" },
  { href: "/lab", label: "Runtime lab", icon: "flask" },
  { href: "/design", label: "System design", icon: "network" },
  { href: "/projects", label: "Projects", icon: "hammer" },
  { href: "/planner", label: "Planner", icon: "list" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
  { href: "/revision", label: "Revision", icon: "repeat" },
  { href: "/notes", label: "Notes & bookmarks", icon: "notebook" },
  { href: "/settings", label: "Settings", icon: "settings" },
] as const;
