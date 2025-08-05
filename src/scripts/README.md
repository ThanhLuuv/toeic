# Part 1 Data Import Scripts

This directory contains scripts to import Part 1 data from `toeic_part1.json` into the Firebase `ai_practice_questions` collection.

## Files

### 1. `importPart1Data.js`
Main import script with functions that can be imported and used in React components.

**Functions:**
- `importPart1Data()` - Imports all Part 1 questions
- `checkExistingData()` - Checks for existing Part 1 data
- `clearPart1Data()` - Removes existing Part 1 data
- `main()` - Main execution function with user prompts

### 2. `consoleImport.js`
Self-contained script that can be copied and pasted into the browser console.

### 3. `DataImportPanel.tsx`
React component providing a UI for data import operations.

### 4. `DataImport.tsx`
Page component that includes the DataImportPanel.

## Usage Methods

### Method 1: Browser Console (Recommended)
1. Open your browser's developer console (F12)
2. Copy the entire content of `consoleImport.js`
3. Paste and execute in the console
4. Follow the prompts to import data

### Method 2: React Component
1. Navigate to `/data-import` in your app
2. Use the UI buttons to:
   - Check existing data
   - Clear existing data
   - Import Part 1 data

### Method 3: Programmatic Import
```javascript
import { importPart1Data } from '../scripts/importPart1Data';

// Import all Part 1 data
await importPart1Data();
```

## Data Structure

The script transforms the Part 1 data to match the `ai_practice_questions` collection structure:

```javascript
{
  questionNumber: number,
  level: string,
  type: string,
  imageDescription: string,
  image: string, // Cloudinary URL
  audio: string, // Cloudinary URL
  mcqSteps: [...],
  audioQuestion: {...},
  originalQuestionIndex: number,
  createdAt: serverTimestamp(),
  status: 'active',
  source: 'part1_import',
  part: 'part1',
  testId: 'test1'
}
```

## Features

- ✅ **Duplicate Prevention**: Checks for existing data before importing
- ✅ **Batch Import**: Processes all 6 questions from the JSON file
- ✅ **Error Handling**: Continues import even if individual questions fail
- ✅ **Progress Tracking**: Shows import progress in console
- ✅ **Data Validation**: Ensures all required fields are present
- ✅ **Safe Deletion**: Confirms before clearing existing data

## Data Source

- **File**: `src/data/toeic_part1.json`
- **Questions**: 6 questions with MCQ steps and audio questions
- **Media**: Images and audio already hosted on Cloudinary
- **Target Collection**: `ai_practice_questions`

## Console Output Example

```
🚀 Starting Part 1 Data Import...
📊 Total questions to import: 6
🔍 Found 0 existing Part 1 questions
📤 Starting import process...
✅ Imported question 1 with ID: abc123...
✅ Imported question 2 with ID: def456...
...
=== Import Summary ===
✅ Successfully imported: 6 questions
❌ Failed imports: 0 questions
📊 Total processed: 6 questions
🎉 Import process completed!
```

## Troubleshooting

### Common Issues

1. **Firebase Permission Error**
   - Ensure your Firebase rules allow write access to `ai_practice_questions`
   - Check if you're authenticated

2. **Import Fails**
   - Check browser console for specific error messages
   - Verify Firebase configuration is correct
   - Ensure network connection is stable

3. **Duplicate Data**
   - Use the "Clear Existing Data" option before importing
   - Check existing data count before proceeding

### Error Recovery

If import fails partway through:
1. Check how many questions were successfully imported
2. Clear existing data if needed
3. Re-run the import script
4. The script will skip already imported questions

## Security Notes

- The script includes confirmation prompts for destructive operations
- All imported data is marked with `source: 'part1_import'` for easy identification
- Use the clear function with caution as it permanently deletes data 