import { getRegisterValue, registerDump, setRegisterValue } from "./registers";
import {
  averageOfBigIntArray,
  decToHalfWord,
  frequencyHumanReadableString,
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
import { buffer, clear, draw } from "./gpu";

let programFinished: boolean = false;
const instructionDurations: bigint[] = [];
const instructionPureExecTimeDurations: bigint[] = [];
const mainLoopDurations: bigint[] = [];

export const run = async (instructionsFromFile: string, options: RunOptions) => {
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

  const startTime = process.hrtime.bigint();
  while (!programFinished) {
    const mainLoopStartTimestamp = process.hrtime.bigint();
    await mainLoop(mainLoopOnFinish, options);

    if (options.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delay));
    }
    const mainLoopEndTimestamp = process.hrtime.bigint();
    const diff = mainLoopEndTimestamp - mainLoopStartTimestamp;
    mainLoopDurations.push(diff);
    logOnDebug("Mainloop took " + hrtimeToHumanReadableString(diff));
  }

  const endTime = process.hrtime.bigint();
  const fullProgrammDuration = endTime - startTime;
  if (options.timingData) {
    console.log("Program finished in " + hrtimeToHumanReadableString(fullProgrammDuration));
    console.log(
      "A total of " +
        instructionDurations.length +
        " instructions were executed with an average duration of " +
        hrtimeToHumanReadableString(averageOfBigIntArray(instructionDurations)) +
        " (pure exec time is in average " +
        hrtimeToHumanReadableString(averageOfBigIntArray(instructionPureExecTimeDurations)) +
        ")"
    );
  }
  if (options.delay > 0 && options.timingData) {
    console.log(
      "Info: Time measurements arent meaningful because an artificial delay of " +
        options.delay +
        "ms was added"
    );
  }

  const averageMainLoopTime = averageOfBigIntArray(mainLoopDurations);
  const durationInSeconds = Number(fullProgrammDuration / BigInt(1_000_000_000));
  const instructionCount = instructionDurations.length;
  const instructionsPerSecond = instructionCount / durationInSeconds;

  const frequency = frequencyHumanReadableString(instructionsPerSecond);
  console.log(
    "Mainloop took " +
      hrtimeToHumanReadableString(averageMainLoopTime) +
      " on average (frequency: " +
      frequency +
      ")"
  );
};

const mainLoop = async (onFinish: () => void, options: RunOptions) => {
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

  if (!options.noGpu) {
    await gpuCycle();
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

const gpuCycle = async () => {
  const gpuOperationOpCode = getMemoryCell(GPU_ADDRESS_BUS_POINTER);
  const gpuAddressBusPointerIndex = halfWordToDec(GPU_ADDRESS_BUS_POINTER);
  const gpuInstruction = getGpuInstructionFromOpcode(gpuOperationOpCode);

  if (isDebugGpu()) {
    console.log("Reading GPU instruction:" + gpuInstruction);
  }

  if (gpuInstruction === "BUFFER") {
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

    buffer({ xPos, yPos, color: { red, green, blue } });
  } else if (gpuInstruction === "DRAW") {
    await draw();
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
