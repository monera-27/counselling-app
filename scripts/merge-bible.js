const fs = require("fs");
const path = require("path");

const bibleFolder = "C:/Users/Akinola/3D Objects/Bible-kjv-master";
const outputFile = path.join(__dirname, "../kjv-full.json");

let allVerses = [];
let totalVerses = 0;

const files = fs.readdirSync(bibleFolder);

files.forEach((file) => {
  if (file.endsWith(".json") && file !== "Books.json") {
    const filePath = path.join(bibleFolder, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const bookData = JSON.parse(fileContent);

    const bookName = bookData.book;

    bookData.chapters.forEach((chapterObj) => {
      const chapterNumber = parseInt(chapterObj.chapter);

      chapterObj.verses.forEach((verseObj) => {
        allVerses.push({
          book: bookName,
          chapter: chapterNumber,
          verse: parseInt(verseObj.verse),
          text: verseObj.text,
        });

        totalVerses++;
      });
    });
  }
});

fs.writeFileSync(outputFile, JSON.stringify(allVerses, null, 2));

console.log("Bible merged successfully.");
console.log("Total verses:", totalVerses);