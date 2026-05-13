export type EraName = "heritage" | "neon";

export interface EraTheme {
  name: EraName;
  variables: Record<string, string>;
}
