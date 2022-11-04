import fs from "fs";
import { run } from "./emulator";
import {EOL} from 'os';

const sourceCode = fs.readFileSync("./source.dbin", { encoding: "utf-8" }).replaceAll(EOL, " ");
console.log(sourceCode);

run(sourceCode, process.env.DEBUG === "true");
