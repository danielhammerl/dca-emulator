import { decToHex } from "./util";
import { MAX_MEMORY_SIZE, MEMORY_CELL_DEFAULT_VALUE, MAX_VALUE } from "./consants";

const memory: number[] = Array(MAX_MEMORY_SIZE).fill(MEMORY_CELL_DEFAULT_VALUE);

export function setMemoryCell(cell: number,value: number) {
  if (value >= MAX_VALUE) {
    throw new Error("trying to set a memory cell to more then MEMORY_CELL_MAX_VALUE");
  }
  if (cell >= MAX_MEMORY_SIZE) {
    throw new Error("Memory cell " + cell + " doesnt exist");
  }
  memory[cell] = value;
}

export function getMemoryCell(cell: number) {
  if (cell >= MAX_MEMORY_SIZE) {
    throw new Error("Memory cell " + cell + " doesnt exist");
  }

  return memory[cell];
}

export function showMemoryCell(cell: number) {
  console.log("Memory cell " + decToHex(cell) + " (index: " + cell + ") has value " + decToHex(getMemoryCell(cell)));
}
