import fs from "fs";

let content = fs.readFileSync("src/App.tsx", "utf-8");

// We only have two imports that are not at the top. Let's find them and move them.
const importGenAI = 'import { GoogleGenAI, Type } from "@google/genai";\n';
const importVisMap = 'import { APIProvider } from "@vis.gl/react-google-maps";\n';

content = content.replace(importGenAI, "");
content = content.replace(importVisMap, "");

// insert at the top, after the first imports
const firstImport = 'import React, { useState, useMemo, useEffect, useRef } from "react";\n';
content = content.replace(firstImport, firstImport + importGenAI + importVisMap);

fs.writeFileSync("src/App.tsx", content);
console.log("Replaced");
