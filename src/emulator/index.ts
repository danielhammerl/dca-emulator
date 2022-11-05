import { getRegisterValue, registerDump, setRegisterValue } from "./registers";
import {
  averageOfBigIntArray,
  decToHalfWord,
  halfWordToDec,
  halfWordToHex,
  hrtimeToHumanReadableString,
  isByte,
  isDebug,
  isDebugGpu,
  logOnDebug,
} from "./util";
import { getMemoryCell, setMemoryCell } from "./memory";
import {
  getInstructionFromOpCode,
  InstructionMap,
  instructionToHumanReadable,
} from "./instructions";
import isEqual from "lodash.isequal";
import {
  Byte,
  GPU_ADDRESS_BUS_POINTER,
  gpuInstructionMap,
  GpuInstructions,
  HalfWord,
  Instruction,
} from "@danielhammerl/dca-architecture";
import { RunOptions } from "./types";
import { clear, draw } from "./gpu";
import throttle from "lodash.throttle";

let programFinished: boolean = false;
const instructionDurations: bigint[] = [];
const instructionPureExecTimeDurations: bigint[] = [];
const mainLoopDurations: bigint[] = [];

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
  };

  while (!programFinished) {
    const mainLoopStartTimestamp = process.hrtime.bigint();
    mainLoop(mainLoopOnFinish);

    if (options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    } else {
      // from time to time we have to make a short wait for opengl stuff
      await shortWait();
    }
    const mainLoopEndTimestamp = process.hrtime.bigint();
    const diff = mainLoopEndTimestamp - mainLoopStartTimestamp;
    mainLoopDurations.push(diff);
    logOnDebug("Mainloop took " + hrtimeToHumanReadableString(diff));
  }

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

  const averageMainLoopTime = averageOfBigIntArray(mainLoopDurations);
  // const frequency = BigInt(1) / (fullProgrammDuration / BigInt(instructionDurations.length));
  logOnDebug("Mainloop took " + hrtimeToHumanReadableString(averageMainLoopTime));
};

const shortWait = throttle(() => new Promise((resolve) => setTimeout(resolve, 1 / 1000000)), 500);

const mainLoop = (onFinish: () => void) => {
  logOnDebug("-------------------------------");
  const instructionStart = process.hrtime.bigint();
  const currentInstruction = getRegisterValue("RPC");
  const currentInstructionIndex = halfWordToDec(currentInstruction);
  logOnDebug("Run instruction at: " + halfWordToHex(currentInstruction));
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
    if (isDebug()) {
      registerDump();
    }
  } catch (e) {
    throw new Error(
      "Error while running instruction " + currentInstructionIndex + " with error " + e
    );
  }

  gpuCycle();

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

const gpuCycle = () => {
  const gpuOperationOpCode = getMemoryCell(GPU_ADDRESS_BUS_POINTER);
  const gpuAddressBusPointerIndex = halfWordToDec(GPU_ADDRESS_BUS_POINTER);
  const gpuInstruction = getGpuInstructionFromOpcode(gpuOperationOpCode);

  if (isDebugGpu()) {
    console.log("Reading GPU instruction:" + gpuInstruction);
  }

  if (gpuInstruction === "DRAW") {
    const xPosData: HalfWord = [
      getMemoryCell(gpuAddressBusPointerIndex + 1),
      getMemoryCell(gpuAddressBusPointerIndex + 2),
    ];
    const yPosData: HalfWord = [
      getMemoryCell(gpuAddressBusPointerIndex + 3),
      getMemoryCell(gpuAddressBusPointerIndex + 4),
    ];
    const colorData: HalfWord = [
      getMemoryCell(gpuAddressBusPointerIndex + 5),
      getMemoryCell(gpuAddressBusPointerIndex + 6),
    ];
    const colorDataAsString = colorData.join("");

    const redData = parseInt(colorDataAsString.substring(0, 5), 2); // 5 byte
    const greenData = parseInt(colorDataAsString.substring(5, 11), 2); // 6 byte
    const blueData = parseInt(colorDataAsString.substring(11, 16), 2); // 5 byte

    const xPos = halfWordToDec(xPosData);
    const yPos = halfWordToDec(yPosData);

    const red = (redData / Math.pow(2, 5)) * 255;
    const green = (greenData / Math.pow(2, 6)) * 255;
    const blue = (blueData / Math.pow(2, 5)) * 255;

    draw({ xPos, yPos, color: { red, green, blue } });
  } else if (gpuInstruction === "CLEAR") {
    clear();
  }
};

export const getGpuInstructionFromOpcode = (opcode: Byte): typeof GpuInstructions[number] => {
  const instruction = Object.entries(gpuInstructionMap).find(([_, instructionOpCode]) =>
    isEqual(opcode, instructionOpCode)
  );

  if (!instruction) {
    throw new Error("Invalid gpu opcode " + opcode);
  }

  return instruction[0] as typeof GpuInstructions[number];
};
