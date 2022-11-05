#!/usr/bin/env ts-node-script
import fs from "fs";
import { run } from "./emulator";
import { EOL } from "os";
import {initGpu} from "./emulator/gpu";

initGpu();

// read utf-8 representation of bytecode from given input
const sourceCode = fs
  .readFileSync(process.argv[2] || "./source.dcabin", { encoding: "utf-8" })
  .replaceAll(EOL, " ");

if (process.argv[3] === "--debug") {
  process.env.DEBUG = "true";
}

run(sourceCode);
