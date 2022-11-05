#!/usr/bin/env ts-node-script
import fs from "fs";
import { run } from "./emulator";
import { EOL } from "os";
import { program } from "commander";

program
  .argument("[source]", "source file", "./source.dcabin")
  .option("--debug", "debug mode", false)
  .action((source, options) => {
    const startTime = process.hrtime.bigint();
    // read utf-8 representation of bytecode from given input
    const sourceCode = fs.readFileSync(source, { encoding: "utf-8" }).replaceAll(EOL, " ");
    if (options.debug) {
      process.env.DEBUG = "true";
    }

    run(sourceCode, startTime);
  });

program.parse();
