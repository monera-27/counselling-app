import csv

BOOK_NAMES = [
  "Genesis","Exodus","Leviticus","Numbers","Deuteronomy",
  "Joshua","Judges","Ruth","1 Samuel","2 Samuel",
  "1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
  "Nehemiah","Esther","Job","Psalms","Proverbs",
  "Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations",
  "Ezekiel","Daniel","Hosea","Joel","Amos",
  "Obadiah","Jonah","Micah","Nahum","Habakkuk",
  "Zephaniah","Haggai","Zechariah","Malachi",
  "Matthew","Mark","Luke","John","Acts",
  "Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians",
  "Philippians","Colossians","1 Thessalonians","2 Thessalonians",
  "1 Timothy","2 Timothy","Titus","Philemon",
  "Hebrews","James","1 Peter","2 Peter",
  "1 John","2 John","3 John","Jude","Revelation"
]

with open("amp_bible.csv", newline="", encoding="utf-8") as infile, \
     open("amp_import.csv", "w", newline="", encoding="utf-8") as outfile:

    reader = csv.reader(infile)
    writer = csv.DictWriter(outfile, fieldnames=["book","chapter","verse","text","version"])
    writer.writeheader()

    for row in reader:
        if len(row) < 4:
            continue  # skip any blank lines
        writer.writerow({
            "book":    BOOK_NAMES[int(row[0]) - 1],
            "chapter": int(row[1]),
            "verse":   int(row[2]),
            "text":    row[3].strip(),
            "version": "amp"
        })

print("Done — amp_import.csv is ready")