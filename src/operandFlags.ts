export enum operandFlags {
  allValue,
  valueMemory,
  memoryValue,
  memoryMemory,
}

interface ReadOperandFlagsReturn {
  first: "memory" | "value";
  second: "memory" | "value";
}

export const readOperandFlags = (data: number): ReadOperandFlagsReturn => {
  switch (data) {
    case operandFlags.allValue: {
      return {
        first: "value",
        second: "value",
      };
    }
    case operandFlags.valueMemory: {
      return {
        first: "value",
        second: "memory",
      };
    }
    case operandFlags.memoryValue: {
      return {
        first: "memory",
        second: "value",
      };
    }
    case operandFlags.memoryMemory: {
      return {
        first: "memory",
        second: "memory",
      };
    }
    default: {
      throw new Error("Invalid operand flags " + data);
    }
  }
};

