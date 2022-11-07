#!/usr/bin/env ts-node-script
import fs from "fs";
import { run } from "./emulator";
import { EOL } from "os";
import { program } from "commander";
import { execSync } from "child_process";
import { initGpu } from "./emulator/gpu";

program
  .argument("[source]", "source file", "./source.dcabin")
  .option("--debug", "debug mode", false)
  .option("--debug-gpu", "debug gpu mode", false)
  .option("--noGpu", "disable gpu", false)
  .option("--timing-data", "show timing and speed informations", false)
  .option(
    "-as, --assemble",
    "use dasm as input instead of bytecode and assemble it before emulating",
    false
  )
  .option(
    "--delay <delay>",
    "(in ms) add a delay after each instruction for a artificial slow down",
    "0"
  )
  .action((source, options) => {
    // read utf-8 representation of bytecode from given input
    const byteCode = options.assemble
      ? assemble(source)
      : fs.readFileSync(source, { encoding: "utf-8" }).replaceAll(EOL, " ");
    if (options.debug) {
      process.env.DEBUG = "true";
    }

    if (options.debugGpu) {
      process.env.DEBUG_GPU = "true";
    }

    const start = () =>
      run(byteCode, {
        delay: parseInt(options.delay ?? "0") || 0,
        debugGpu: options.debugGpu,
        noGpu: options.noGpu,
        timingData: options.timingData || options.debug,
      });

    if (!options.noGpu) {
      initGpu().then(start);
    } else {
      start();
    }
  });

const assemble = (sourcePath: string): string =>
  execSync("dca-assembler " + sourcePath)
    .toString()
    .replaceAll(EOL, "")
    .trim();

program.parse();
