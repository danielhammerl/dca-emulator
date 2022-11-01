import fs from "fs";

const sourceCode = fs.readFileSync("./source.dasm", { encoding: "utf-8" });
console.log(sourceCode);
