import { EMPTY_BYTE, MEMORY_SIZE } from "./consants";
import { Byte, HalfWord } from "./types";
import { halfWordToDec } from "./util";

const memory: Byte[] = Array(MEMORY_SIZE).fill(EMPTY_BYTE);

export function setMemoryCell(cell: number | HalfWord, data: Byte) {
  const cellIndex = typeof cell === "number" ? cell : halfWordToDec(cell);

  if (cellIndex >= MEMORY_SIZE) {
    throw new Error("Memory cell " + cellIndex + " doesnt exist");
  }
  memory[cellIndex] = data;
}

export function getMemoryCell(cell: number | HalfWord): Byte {
  const cellIndex = typeof cell === "number" ? cell : halfWordToDec(cell);
  if (cellIndex >= MEMORY_SIZE) {
    throw new Error("Memory cell " + cellIndex + " doesnt exist");
  }

  return memory[cellIndex];
}
