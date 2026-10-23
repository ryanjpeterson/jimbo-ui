// The foundation's Tailwind config, scanning the assembled code too.
import base from "../foundation/tailwind.config.js";

export default { ...base, content: ["./index.html", "./src/**/*.{ts,tsx}", "./.jimbo/**/*.{ts,tsx}"] };
