import {
  Bit,
  Byte,
  BYTE_LENGTH,
  HALF_WORD_LENGTH,
  HalfWord,
  Instruction,
  MAX_BYTE_VALUE,
  MAX_HALF_WORD_VALUE,
} from "@danielhammerl/dca-architecture";

export const hexToDec = (hex: string): number => parseInt(hex.replaceAll("#", ""), 16);
export const decToHex = (dec: number, withPrefix: boolean = true): string => {
  if (dec < 0) {
    throw new Error("decToHex only supports positive numbers and zero");
  }
  return (withPrefix ? "#" : "") + dec.toString(16);
};

export const decToByte = (dec: number): Byte => {
  if (dec < 0) {
    throw new Error("decToByte only supports positive numbers and zero");
  }
  const normalizedValue = dec % (MAX_BYTE_VALUE + 1);
  return normalizedValue.toString(2).padStart(BYTE_LENGTH, "0") as Byte;
};
export const byteToDec = (byte: Byte): number => parseInt(byte, 2);

export const decToHalfWord = (dec: number): HalfWord => {
  if (dec < 0) {
    throw new Error("decToHalfWord only supports positive numbers and zero");
  }
  const normalizedValue = dec % (MAX_HALF_WORD_VALUE + 1);
  const halfWordAsString = normalizedValue.toString(2).padStart(HALF_WORD_LENGTH, "0");
  return byteStringToHalfWord(halfWordAsString);
};

export const halfWordToDec = (halfWord: HalfWord): number => {
  const normalizedValue = halfWord.join("");
  return parseInt(normalizedValue, 2);
};

export const byteStringToHalfWord = (byteString: string): HalfWord => {
  const normalizedValue = byteString.padStart(HALF_WORD_LENGTH, "0");
  const first = normalizedValue.substring(0, BYTE_LENGTH) as Byte;
  const last = normalizedValue.substring(BYTE_LENGTH, HALF_WORD_LENGTH) as Byte;
  return [first, last];
};

export const isBit = (data: string): data is Bit => {
  return data === "1" || data === "0";
};

export const isByte = (data: string): data is Byte => {
  return data.length === BYTE_LENGTH && data.replaceAll("1", "").replaceAll("0", "").length === 0;
};

export const isHalfWord = (data: string[]): data is HalfWord => {
  return data.every(isByte);
};

export const getBaseLog = (x: number, y: number): number => {
  return Math.log(y) / Math.log(x);
};

export const isDebug = () => process.env.DEBUG === "true";

export const logOnDebug = (...data: any) => {
  if (isDebug()) {
    console.log(...data);
  }
};

export const hrtimeToHumanReadableString = (time: bigint): string => {
  let counter = 0;
  let tempTime = time;
  const suffix = ["ns", "µs", "ms", "s"];
  while (tempTime >= 10000 && counter < 3) {
    tempTime = tempTime / BigInt(1000);
    counter++;
  }
  return "~" + tempTime.toString() + suffix[counter];
};

export const averageOfBigIntArray = (arr: bigint[]): bigint =>
  arr.reduce((a, b) => a + b, BigInt(0)) / BigInt(arr.length);
