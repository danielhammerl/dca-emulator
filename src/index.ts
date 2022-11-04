#!/usr/bin/env ts-node-script
import fs from "fs";
import { run } from "./emulator";
import { EOL } from "os";

const sourceCode = fs
  .readFileSync(process.argv[2] || "./source.dbin", { encoding: "utf-8" })
  .replaceAll(EOL, " ");

if (process.argv[3] === "--debug") {
  process.env.DEBUG = "true";
}

run(sourceCode, process.env.DEBUG === "true");
