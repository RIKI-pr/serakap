import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const startMarker = " // --- Komponen Internal untuk Logika Map (harus di dalam <Map>) ---";
const endMarker = "// --- Komponen Peta Rute (RouteMap) ---";

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.slice(0, startIndex) + content.slice(endIndex);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Success");
} else {
  console.log("Failed to find markers.");
}
