import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

const orientalTheme = create({
  base: "light",
  brandTitle: "Oriental Design System",
  brandUrl: "https://github.com",
  brandTarget: "_self",

  colorPrimary: "#8A5030",
  colorSecondary: "#3D6F61",

  appBg: "#f6efe1",
  appContentBg: "#ffffff",
  appPreviewBg: "#ffffff",
  appBorderColor: "#DDD9CE",
  appBorderRadius: 8,

  fontBase:
    'Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode:
    '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',

  textColor: "#1F110A",
  textInverseColor: "#ffffff",
  textMutedColor: "#6C3D24",

  barTextColor: "#4E2B19",
  barSelectedColor: "#8A5030",
  barHoverColor: "#A76A44",
  barBg: "#FCF5EC",

  inputBg: "#ffffff",
  inputBorder: "#DDD9CE",
  inputTextColor: "#1F110A",
  inputBorderRadius: 6,
});

addons.setConfig({
  theme: orientalTheme,
  panelPosition: "bottom",
  showToolbar: true,
  sidebar: {
    showRoots: true,
  },
});
