/* =========================================================
   Your details, in one place.
   Change a value here and it updates on every page: the footer email and
   copy button, the social icons, the "Download resume" button, the email in
   the password dialog and the chat's contact answer.

   Project names, descriptions, images and case studies live in
   js/projects.js. Page text (hero, About story) lives in the HTML files;
   see README.md.
   ========================================================= */
window.SITE = {
  name: "Pallav Bhatnagar",
  role: "UX builder",

  // Shown in the footer, the password dialog and the chat.
  email: "bhatnagarpallav@outlook.com",

  // The file behind the "Download resume" button. Replace the PDF in
  // assets/documents/resume/ and keep the same name, or change this path.
  resume: "/assets/documents/resume/resume.pdf",

  // Social icons in the footer, in this order. Each icon is an SVG file in
  // assets/icons/social/: replace a file to change an icon. To add a network,
  // save its icon there (a 24 x 24 line icon, drawn in black) and add a line.
  // Leave a link as "#" to keep the icon without a destination for now.
  socials: [
    { name: "LinkedIn", url: "#", icon: "/assets/icons/social/linkedin.svg" },
    { name: "Behance", url: "#", icon: "/assets/icons/social/behance.svg" },
    { name: "Dribbble", url: "#", icon: "/assets/icons/social/dribbble.svg" }
  ]
};
