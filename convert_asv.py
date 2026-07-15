import csv
import re

with open("asvs.csv", newline="", encoding="utf-8") as infile, \
     open("asv_import.csv", "w", newline="", encoding="utf-8") as outfile:

    # Skip the 5 intro lines, then read from the real header on line 6
    for _ in range(5):
        next(infile)

    reader = csv.DictReader(infile)
    writer = csv.DictWriter(outfile, fieldnames=["book","chapter","verse","text","version"])
    writer.writeheader()

    for row in reader:
        # Strip Strong's numbers e.g. {H7225} or {G3056} from the text
        clean_text = re.sub(r"\{[HG]\d+\}", "", row["Text"]).strip()

        writer.writerow({
            "book":    row["Book Name"],
            "chapter": int(row["Chapter"]),
            "verse":   int(row["Verse"]),
            "text":    clean_text,
            "version": "asv"
        })

print("Done — asv_import.csv is ready")