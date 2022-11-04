import { halfWordToDec } from "./util";
import { MEMORY_SIZE } from "./consants";
import { Byte, EMPTY_BYTE, HalfWord } from "@danielhammerl/dca-architecture";

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
