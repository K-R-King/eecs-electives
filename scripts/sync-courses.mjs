// Copy the course data (prerequisites, terms, units, areas) from EECS Prereqs, which builds and
// checks it, into data/courses.json.
//
// Usage:  npm run sync-data                 (from https://eecs-prereqs.vercel.app/courses.json)
//         npm run sync-data -- ../eecs-prereqs/data/courses.json   (from a local copy)

import fs from "node:fs";

const source = process.argv[2] ?? "https://eecs-prereqs.vercel.app/courses.json";
const text = source.startsWith("http") ? await (await fetch(source)).text() : fs.readFileSync(source, "utf8");
const data = JSON.parse(text);
if (!data.courses || !data.outside) throw new Error(`${source} doesn't look like EECS Prereqs course data`);

fs.writeFileSync(new URL("../data/courses.json", import.meta.url), JSON.stringify(data, null, 2) + "\n");
console.log(`Synced ${Object.keys(data.courses).length} courses (checked ${data.checked}) from ${source}`);
