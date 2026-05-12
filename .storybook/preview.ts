import React from "react";
import type { Preview } from "@storybook/react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "../messages/en.json";
import "../app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        NextIntlClientProvider,
        { locale: "en", messages: enMessages },
        React.createElement(Story)
      ),
  ],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#ffffff" },
        { name: "dark", value: "#0a0a0a" },
      ],
    },
  },
};

export default preview;
