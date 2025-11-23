# How to Use @sayabackup/utils in Your Apps

## Adding the Package to Your App

### For Backend (apps/backend)

Add to `apps/backend/package.json`:

```bash
pnpm add @sayabackup/utils --filter backend
```

Or manually add to dependencies:

```json
{
  "dependencies": {
    "@sayabackup/utils": "workspace:*"
  }
}
```

### For Frontend (apps/frontend)

Add to `apps/frontend/package.json`:

```bash
pnpm add @sayabackup/utils --filter frontend
```

Or manually add to dependencies:

```json
{
  "dependencies": {
    "@sayabackup/utils": "workspace:*"
  }
}
```

## Usage Examples

### In TypeScript/JavaScript files

```typescript
import {
  capitalize,
  truncate,
  formatDate,
  daysBetween,
} from "@sayabackup/utils";

// String utilities
const title = capitalize("hello world"); // 'Hello world'
const shortText = truncate("This is a very long text", 10); // 'This is...'

// Date utilities
const today = formatDate(new Date()); // '2025-11-23'
const diff = daysBetween(new Date("2025-11-20"), new Date()); // 3
```

### In React Components (Frontend)

```tsx
import { capitalize, formatDate } from "@sayabackup/utils";

export function AlbumCard({ album }) {
  return (
    <View>
      <Text>{capitalize(album.name)}</Text>
      <Text>{formatDate(album.createdAt)}</Text>
    </View>
  );
}
```

### In Backend Routes

```typescript
import { toKebabCase, formatDate } from "@sayabackup/utils";

export const albumRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const slug = toKebabCase(input.name);
      const date = formatDate(new Date());
      // ... rest of your code
    }),
});
```

## Development Workflow

1. **Make changes to utils**: Edit files in `shared/utils/src/`
2. **Build the package**: Run `pnpm build` in `shared/utils/`
3. **Or use watch mode**: Run `pnpm dev` in `shared/utils/` for automatic rebuilding
4. **Use in your apps**: Import and use the utilities

## Adding New Utilities

1. Create a new file in `shared/utils/src/` (e.g., `array-utils.ts`)
2. Export your utilities from that file
3. Add the export to `shared/utils/src/index.ts`:
   ```typescript
   export * from "./array-utils";
   ```
4. Build the package: `pnpm build`

## Turbo Integration

The utils package works seamlessly with Turbo. When you run `pnpm dev` from the root, Turbo will automatically handle dependencies and build order.
