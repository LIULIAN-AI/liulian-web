# Storybook Stories

This directory holds Storybook stories for visual development of UI components.

## Run Storybook

```bash
npm run storybook   # http://127.0.0.1:6006
```

## Add a story

Create a `MyComponent.stories.tsx` file alongside the component or in this directory. Example:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { variant: "primary", children: "Click me" },
};
```

## Notes

- Stories under `app/` and `components/` are also auto-discovered (see `.storybook/main.ts`).
- `app/globals.css` is imported in `.storybook/preview.ts` so Tailwind / global styles work.
- Storybook port 6006 needs to be exposed when running inside Docker:
  ```bash
  docker run -p 6006:6006 ...
  ```
