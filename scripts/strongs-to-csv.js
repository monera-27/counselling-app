const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync("strongs-dictionary.json", "utf8")
);

let rows = [
  "id,original,transliteration,pronunciation,definition,language"
];

Object.entries(data).forEach(([id, entry]) => {
  const language = id.startsWith("H") ? "Hebrew" : "Greek";

  rows.push(
    `"${id}","${entry.original || ""}","${entry.transliteration || ""}","${entry.pronunciation || ""}","${entry.definition || ""}","${language}"`
  );
});

fs.writeFileSync("strongs.csv", rows.join("\n"));

console.log("Strong dictionary CSV created successfully.");