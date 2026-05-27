/**
 * Canonical contact / identity. Every component imports from here.
 * If a URL or handle changes, change it once.
 */

export const person = {
  name: "Shashank Dhiman",
  firstName: "Shashank",
  role: "Backend Engineer",
  location: "India",
  locationDetail: "Open to remote & relocation",
  email: "dhimanshashank15@gmail.com",
  phone: "+91 88476 80989",

  github: {
    url: "https://github.com/dhimanshashank",
    handle: "@dhimanshashank",
  },
  linkedin: {
    url: "https://www.linkedin.com/in/shashank-dhiman-358535219/",
    label: "LinkedIn",
  },
  leetcode: {
    url: "https://leetcode.com/u/shashankdhiman/",
    label: "LeetCode",
  },
  blog: {
    // Long-form writing lives on GitHub Pages for now
    proctoringSystem:
      "https://dhimanshashank.github.io/proctoring-system-architecture/",
  },
} as const;
