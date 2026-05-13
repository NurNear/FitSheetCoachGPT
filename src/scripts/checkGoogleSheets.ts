import { google } from "googleapis";
import { env, hasGoogleSheetsConfig } from "../config/env.js";
import { REQUIRED_SHEET_HEADERS } from "../constants/sheets.js";

const configuredSheetNames = {
  Profile: env.PROFILE_SHEET,
  FoodLog: env.FOOD_LOG_SHEET,
  ExerciseLog: env.EXERCISE_LOG_SHEET,
  WeightLog: env.WEIGHT_LOG_SHEET
} as const;

function fail(message: string): never {
  console.error(`Google Sheets check failed: ${message}`);
  process.exit(1);
}

function assertGoogleSheetsConfig(): void {
  if (!hasGoogleSheetsConfig) {
    fail("GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY are required.");
  }
}

function createAuth() {
  return new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
}

async function main(): Promise<void> {
  assertGoogleSheetsConfig();

  const auth = createAuth();
  const sheets = google.sheets("v4");
  const metadata = await sheets.spreadsheets.get({
    auth,
    spreadsheetId: env.GOOGLE_SHEET_ID
  });

  const sheetTitles = new Set(metadata.data.sheets?.map((sheet) => sheet.properties?.title).filter(Boolean));

  for (const [logicalName, sheetName] of Object.entries(configuredSheetNames)) {
    if (!sheetTitles.has(sheetName)) {
      fail(`Missing sheet tab "${sheetName}" for ${logicalName}.`);
    }

    const expectedHeaders = REQUIRED_SHEET_HEADERS[logicalName as keyof typeof REQUIRED_SHEET_HEADERS];
    const endColumn = String.fromCharCode("A".charCodeAt(0) + expectedHeaders.length - 1);
    const range = `${sheetName}!A1:${endColumn}1`;
    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: env.GOOGLE_SHEET_ID,
      range
    });

    const actualHeaders = response.data.values?.[0] ?? [];
    const mismatches = expectedHeaders.filter((header, index) => actualHeaders[index] !== header);

    if (mismatches.length > 0) {
      fail(`Header mismatch in "${sheetName}". Expected: ${expectedHeaders.join(", ")}. Got: ${actualHeaders.join(", ")}.`);
    }
  }

  console.log("Google Sheets check passed.");
  console.log(`Spreadsheet: ${metadata.data.properties?.title ?? env.GOOGLE_SHEET_ID}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  fail(message);
});
