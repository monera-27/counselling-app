const fs = require("fs");

const jsonData = JSON.parse(
  fs.readFileSync("kjv-full.json", "utf-8")
);

let csv = "book,chapter,verse,text\n";

jsonData.forEach((row) => {
  // Escape quotes properly
  const text = row.text.replace(/"/g, '""');

  csv += `"${row.book}",${row.chapter},${row.verse},"${text}"\n`;
});

fs.writeFileSync("kjv-full.csv", csv);

console.log("CSV file created successfully.");