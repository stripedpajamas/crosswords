const fs = require("fs");
const path = require("path");
const readpuz = require("@confuzzle/readpuz").readpuz;

const puz = readpuz(
  fs.readFileSync(path.join(process.cwd(), "src", "testdata", "Cryptic229.puz"))
);

console.log(puz);
