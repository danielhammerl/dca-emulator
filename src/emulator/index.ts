import { getRegisterValue, registerDump, setRegisterValue } from "./registers";
import {
  averageOfBigIntArray,
  decToHalfWord,
  halfWordToDec,
  hrtimeToHumanReadableString,
  isByte,
  logOnDebug,
} from "./util";
import { getMemoryCell, setMemoryCell } from "./memory";
import {
  getInstructionFromOpCode,
  InstructionMap,
  instructionToHumanReadable,
} from "./instructions";
import isEqual from "lodash.isequal";
import { Instruction } from "@danielhammerl/dca-architecture";
import { RunOptions } from "./types";

let programFinished: boolean = false;
const instructionDurations: bigint[] = [];
const instructionPureExecTimeDurations: bigint[] = [];

export const run = async (instructionsFromFile: string, startTime: bigint, options: RunOptions) => {
  logOnDebug("starting in debug mode");
  const instructionsFromFileAsArray = instructionsFromFile.split(" ");

  if (instructionsFromFileAsArray.length === 0 || instructionsFromFile.length === 0) {
    console.log("No instructions specified");
    return;
  }

  const instructionsByteLength = instructionsFromFileAsArray.length;

  instructionsFromFileAsArray.forEach((value, index) => {
    if (!isByte(value)) {
      throw new Error("Invalid instruction: " + value + " is not a byte representation");
    }

    setMemoryCell(index, value);
  });

  setRegisterValue("RSP", decToHalfWord(instructionsByteLength), true);

  const mainLoopOnFinish = () => {
    programFinished = true;
    const endTime = process.hrtime.bigint();
    const fullProgrammDuration = endTime - startTime;
    logOnDebug("Program finished in " + hrtimeToHumanReadableString(fullProgrammDuration));
    logOnDebug(
      "A total of " +
        instructionDurations.length +
        " instructions where executed with an average duration of " +
        hrtimeToHumanReadableString(averageOfBigIntArray(instructionDurations)) +
        " (pure exec time is in average " +
        hrtimeToHumanReadableString(averageOfBigIntArray(instructionPureExecTimeDurations)) +
        ")"
    );
    if (options.delay > 0) {
      logOnDebug(
        "Info: Time measurements arent meaningful because an artificial delay of " +
          options.delay +
          "ms was added"
      );
    }
  };

  while (!programFinished) {
    mainLoop(mainLoopOnFinish);

    if (options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
  }
};

const mainLoop = (onFinish: () => void) => {
  logOnDebug("-------------------------------");
  const instructionStart = process.hrtime.bigint();
  const currentInstruction = getRegisterValue("RPC");
  const currentInstructionIndex = halfWordToDec(currentInstruction);
  logOnDebug("Run instruction at: " + currentInstruction);
  const instruction: Instruction = {
    opcode: getMemoryCell(currentInstructionIndex),
    operand1: [
      getMemoryCell(currentInstructionIndex + 1),
      getMemoryCell(currentInstructionIndex + 2),
    ],
    operand2: [
      getMemoryCell(currentInstructionIndex + 3),
      getMemoryCell(currentInstructionIndex + 4),
    ],
  };
  logOnDebug("Instruction is " + instructionToHumanReadable(instruction));
  let instructionExecTimeStart, instructionExecTimeEnd;
  const instructionName = getInstructionFromOpCode(instruction.opcode);
  try {
    instructionExecTimeStart = process.hrtime.bigint();
    InstructionMap[instructionName](instruction.operand1, instruction.operand2);
    instructionExecTimeEnd = process.hrtime.bigint();
    logOnDebug("Instruction finished");
    logOnDebug("cpu dump:");
    logOnDebug(registerDump());
  } catch (e) {
    throw new Error(
      "Error while running instruction " + currentInstructionIndex + " with error " + e
    );
  }

  const nextInstruction = getRegisterValue("RPC");
  const finished = isEqual(nextInstruction, getRegisterValue("RSP"));

  const instructionEnd = process.hrtime.bigint();
  const instructionDuration = instructionEnd - instructionStart;
  const instructionPureExecTimeDuration = instructionExecTimeEnd - instructionExecTimeStart;
  instructionPureExecTimeDurations.push(instructionPureExecTimeDuration);
  instructionDurations.push(instructionDuration);
  logOnDebug(
    "Instruction took " +
      hrtimeToHumanReadableString(instructionDuration) +
      " (pure exec time was " +
      hrtimeToHumanReadableString(instructionPureExecTimeDuration) +
      ")"
  );
  logOnDebug("-------------------------------");
  if (finished) {
    onFinish();
  }
};
