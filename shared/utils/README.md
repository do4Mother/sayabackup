# @sayabackup/utils

Shared utilities package for the sayabackup monorepo.

## Installation

This package is automatically available to all workspace packages. To use it in your app:

```bash
pnpm add @sayabackup/utils --filter your-app-name
```

Or add it to your package.json:

```json
{
  "dependencies": {
    "@sayabackup/utils": "workspace:*"
  }
}
```

## Usage

```typescript
import { capitalize, formatDate, isToday } from '@sayabackup/utils';

const name = capitalize('john doe'); // 'John doe'
const today = formatDate(new Date()); // '2025-11-23'
const isTodayCheck = isToday(new Date()); // true
```

## Development

```bash
# Build the package
pnpm build

# Watch mode for development
pnpm dev

# Type check
pnpm type-check
```

## Available Utilities

### String Utilities
- `capitalize(str)` - Capitalizes the first letter of a string
- `truncate(str, maxLength)` - Truncates a string and adds ellipsis
- `toKebabCase(str)` - Converts string to kebab-case
- `toCamelCase(str)` - Converts string to camelCase

### Date Utilities
- `formatDate(date)` - Formats a date to YYYY-MM-DD
- `isToday(date)` - Checks if a date is today
- `daysBetween(date1, date2)` - Gets the number of days between two dates
