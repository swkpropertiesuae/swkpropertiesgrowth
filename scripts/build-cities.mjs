// Regenerates data/cities.json from src/growth/city-seed.mjs. Run: npm run cities
import fs from "node:fs";
import { CITY_LIST, cityStats } from "../src/growth/cities.mjs";
fs.mkdirSync("data", { recursive: true });
fs.writeFileSync("data/cities.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), stats: cityStats(), cities: CITY_LIST }, null, 1) + "\n");
console.log(`data/cities.json: ${CITY_LIST.length} cities`);
