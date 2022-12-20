const fs = require("fs");
const path = require("path");
const readpuz = require("@confuzzle/readpuz").readpuz;

// TODO when we actual start parsing puz files, we want to convert at least the
// state property into an array; not fun dealing with just a long string
const puz = readpuz(
  fs.readFileSync(path.join(process.cwd(), "src", "testdata", "Cryptic229.puz"))
);

console.log(puz);
