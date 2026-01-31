# Student Attendance - Simple Clarity Contract

A simple student attendance tracking system built with Clarity smart contracts and Stacks.

## Contract

The contract (`contracts/table.clar`) provides:
- `mark-attendance`: Mark a student as present on a specific date
- `check-attendance`: Check if a student was present on a specific date

## Setup

1. Install dependencies:
```bash
npm install
```

2. Deploy the contract using Clarinet:
```bash
clarinet deploy --testnet
```

3. Update the contract address in `app.js`:
   - Replace `CONTRACT_ADDRESS` with your deployed contract address
   - The contract name is `table`

## Usage

1. Start a local server:
```bash
npm run dev
```

2. Open the app in your browser (usually http://localhost:8080)

3. Connect your Stacks wallet

4. Mark attendance by entering student name and date (format: YYYY-MM-DD)

5. Check attendance by entering student name and date

## Contract Functions

### mark-attendance
- Parameters: `student-name` (string), `date` (string)
- Marks a student as present on the specified date

### check-attendance
- Parameters: `student-name` (string), `date` (string)
- Returns: `true` if present, `false` otherwise

## Testing

Run tests with:
```bash
npm test
```
