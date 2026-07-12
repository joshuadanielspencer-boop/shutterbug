import fs from "node:fs/promises";
import path from "node:path";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = path.resolve("codex_temp/song_frequency_data.json");
const outputDir = path.resolve("outputs/song-frequency");
const outputPath = path.join(outputDir, "chapel-song-frequency.xlsx");

const rows = JSON.parse(await fs.readFile(inputPath, "utf8"));

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Song Frequency");

sheet.getRange("A1:C1").values = [[
  "Song Title",
  "Count",
  "Tabs Present",
]];

const body = rows.map((row) => [row.song_title, row.count, row.tabs_present]);
if (body.length > 0) {
  sheet.getRange(`A2:C${body.length + 1}`).values = body;
}

const usedRange = sheet.getRange(`A1:C${body.length + 1}`);
usedRange.format.font.name = "Aptos";
usedRange.format.font.size = 11;
usedRange.format.verticalAlignment = "center";

const header = sheet.getRange("A1:C1");
header.format.font.bold = true;
header.format.fill.color = "#D9EAF7";
header.format.horizontalAlignment = "center";

sheet.getRange(`B2:B${body.length + 1}`).format.horizontalAlignment = "center";
sheet.getRange(`A2:C${body.length + 1}`).format.wrapText = false;

sheet.freezePanes.freezeRows(1);
sheet.getRange("A:C").format.columnWidthPx = 220;
sheet.getRange("A:A").format.columnWidthPx = 280;
sheet.getRange("B:B").format.columnWidthPx = 80;
sheet.getRange("C:C").format.columnWidthPx = 220;

const tableRange = `A1:C${body.length + 1}`;
sheet.tables.add(tableRange, {
  hasHeaders: true,
  style: "TableStyleMedium2",
});

await fs.mkdir(outputDir, { recursive: true });

const inspect = await workbook.inspect({
  kind: "table",
  range: `Song Frequency!A1:C12`,
  include: "values",
  tableMaxRows: 12,
  tableMaxCols: 3,
});
console.log(inspect.ndjson);

await workbook.render({
  sheetName: "Song Frequency",
  range: `A1:C${Math.min(body.length + 1, 25)}`,
  scale: 1.5,
});

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({ outputPath }, null, 2));
