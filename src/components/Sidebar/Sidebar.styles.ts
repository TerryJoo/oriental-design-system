import { cn } from "@/utils/cn";

export const sidebarRoot = cn(
  "flex flex-col gap-1 p-3 rounded-card",
  "bg-era-sunken border-era min-w-[200px]",
);

export const sidebarHeading = cn(
  "px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em]",
  "text-era-muted",
);

export interface SidebarItemStyleProps {
  active?: boolean;
  className?: string;
}

export function sidebarItemStyles({
  active,
  className,
}: SidebarItemStyleProps = {}): string {
  return cn(
    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm cursor-pointer",
    "transition-colors duration-era ease-era-brush",
    active
      ? cn(
          // The active chip is a colored brand surface (`accent-600`), not an
          // era surface, so we want a high-contrast neutral foreground that
          // works regardless of era. Plain white passes WCAG AA in every
          // accent palette we ship:
          //   - Heritage accent-600 (#8A5030) vs #ffffff   → 6.42:1 ✓
          //   - Neon      accent-600 (#5A50FF) vs #ffffff   → 5.22:1 ✓
          // Earlier revisions used `text-era-inverse` (cream/black per era);
          // in Heritage that produced 5.91:1 — axe sometimes flagged this as
          // borderline-fail — and in Neon it inverted to dark-on-purple
          // which clearly failed AA. Hard-coding `text-white` here is
          // intentional: the brand chip is era-agnostic.
          "bg-[rgb(var(--accent-600))] text-white",
        )
      : "text-era-primary hover:bg-[rgb(var(--accent-500)/0.1)]",
    className,
  );
}

// ==========================================================================
// SidebarShell (compound API) style functions — era-aware
// ==========================================================================

export interface SidebarShellStyleProps {
  collapsed?: boolean;
  className?: string;
}

export interface SidebarShellMenuButtonStyleProps {
  /** "nav" = navigation item (default), "action" = action trigger */
  variant?: "nav" | "action";
  active?: boolean;
  collapsed?: boolean;
  hasSub?: boolean;
  className?: string;
}

export interface SidebarShellMenuSubButtonStyleProps {
  active?: boolean;
  isHeader?: boolean;
  hasSub?: boolean;
  collapsed?: boolean;
  /** Whether this button is inside an expanded group (hasSub && expanded) */
  inExpandedGroup?: boolean;
  className?: string;
}

export interface SidebarShellChevronStyleProps {
  expanded?: boolean;
  className?: string;
}

export interface SidebarShellMenuSubItemStyleProps {
  expanded?: boolean;
  className?: string;
}

export interface SidebarShellMenuSubStyleProps {
  hidden?: boolean;
  className?: string;
}

export interface SidebarShellGroupStyleProps {
  collapsed?: boolean;
  className?: string;
}

export interface SidebarShellContentStyleProps {
  collapsed?: boolean;
  className?: string;
}

export interface SidebarShellUserProfileStyleProps {
  collapsed?: boolean;
  className?: string;
}

export function sidebarShellStyles({
  collapsed,
  className,
}: SidebarShellStyleProps = {}): string {
  return cn(
    "flex h-full flex-col bg-era-sunken border-era",
    "motion-safe:transition-[width] duration-era ease-era-brush",
    collapsed ? "w-16" : "w-[284px]",
    className,
  );
}

export function sidebarShellHeaderStyles({
  className,
}: { className?: string } = {}): string {
  return cn("shrink-0 px-4 py-3", className);
}

export function sidebarShellContentStyles({
  collapsed,
  className,
}: SidebarShellContentStyleProps = {}): string {
  return cn(
    "flex-1 py-2",
    collapsed ? "overflow-visible" : "overflow-y-auto",
    // The expanded scroll container becomes keyboard-focusable
    // (`tabIndex=0`) to satisfy `scrollable-region-focusable`.
    // Inset the focus ring slightly so it sits inside the rounded
    // shell and does not bleed into the header/footer borders.
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--accent-500))]",
    className,
  );
}

export function sidebarShellFooterStyles({
  className,
}: { className?: string } = {}): string {
  return cn("shrink-0 border-t border-era px-4 py-3", className);
}

export function sidebarShellGroupStyles({
  className,
}: SidebarShellGroupStyleProps = {}): string {
  return cn("px-4 pb-4", className);
}

export function sidebarShellGroupLabelStyles({
  className,
}: { className?: string } = {}): string {
  return cn("mb-1 px-2 text-label font-medium text-era-muted", className);
}

export function sidebarShellMenuStyles({
  className,
}: { className?: string } = {}): string {
  return cn("flex flex-col gap-0.5", className);
}

export function sidebarShellMenuButtonStyles({
  variant = "nav",
  active,
  hasSub,
  className,
}: SidebarShellMenuButtonStyleProps = {}): string {
  return cn(
    "flex h-[46px] w-full items-center gap-[14px] rounded-button text-body-2 font-medium",
    "transition-colors duration-era ease-era-brush",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))]",
    variant === "action"
      ? cn("text-era-primary", "hover:bg-[rgb(var(--accent-500)/0.10)]")
      : cn(
          "text-era-primary",
          "hover:bg-[rgb(var(--accent-500)/0.10)]",
          // Active uses `--era-accent-strong` (accent-700 in Heritage,
          // accent-300 in Neon) so the text always clears AA contrast on
          // the era surface. A hard-coded `--accent-700` would render as
          // a dark indigo on Neon's #0b0e18 surface (~2.7:1 — fails AA).
          active &&
            "bg-[rgb(var(--accent-500)/0.18)] font-semibold text-[rgb(var(--era-accent-strong))]",
        ),
    "ps-1 pe-3 overflow-hidden",
    hasSub && "cursor-pointer",
    className,
  );
}

export function sidebarShellMenuSubStyles({
  hidden,
  className,
}: SidebarShellMenuSubStyleProps = {}): string {
  return cn(
    hidden ? "hidden" : "flex flex-col gap-0.5",
    "ps-[38px]",
    className,
  );
}

export function sidebarShellMenuSubSubStyles({
  hidden,
  className,
}: SidebarShellMenuSubStyleProps = {}): string {
  return cn(hidden ? "hidden" : "flex flex-col gap-0.5", "ps-6", className);
}

export function sidebarShellMenuSubItemStyles({
  expanded,
  className,
}: SidebarShellMenuSubItemStyleProps = {}): string {
  return cn(
    "rounded-button",
    expanded && "bg-[rgb(var(--accent-500)/0.10)]",
    className,
  );
}

export function sidebarShellMenuSubButtonStyles({
  active,
  isHeader,
  hasSub,
  collapsed,
  inExpandedGroup,
  className,
}: SidebarShellMenuSubButtonStyleProps = {}): string {
  return cn(
    "flex w-full items-center rounded-button px-3",
    "transition-colors duration-era ease-era-brush",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))]",
    isHeader
      ? cn(
          "h-[46px] gap-[14px] text-body-2 font-medium text-era-primary",
          // Headers paint expanded/active in `--era-accent-strong` so the
          // emphasized label clears AA on both Heritage hanji and Neon
          // void surfaces. Hard-coded `--accent-700` on Neon (#443cdc on
          // #0b0e18 with a 10–18% accent overlay) fails AA.
          inExpandedGroup
            ? "text-[rgb(var(--era-accent-strong))]"
            : cn(
                "hover:bg-[rgb(var(--accent-500)/0.10)]",
                active &&
                  "bg-[rgb(var(--accent-500)/0.18)] text-[rgb(var(--era-accent-strong))]",
              ),
        )
      : cn(
          // Sub items intentionally start muted; when active we both lift
          // the foreground (era-primary, full-strength ink) AND repaint
          // the accent through `--era-accent-strong` so it stays AA on
          // Neon's dark surface.
          "h-[38px] text-body-3 font-medium text-era-muted",
          "hover:bg-era-raised",
          active &&
            "bg-[rgb(var(--accent-500)/0.10)] text-[rgb(var(--era-accent-strong))]",
        ),
    hasSub && "cursor-pointer",
    collapsed && "justify-center px-0",
    className,
  );
}

export function sidebarShellChevronStyles({
  expanded,
  className,
}: SidebarShellChevronStyleProps = {}): string {
  return cn(
    "ms-auto h-5 w-5 shrink-0 text-era-muted",
    "motion-safe:transition-transform duration-era ease-era-brush",
    expanded && "rotate-180",
    className,
  );
}

export function sidebarShellTriggerStyles({
  className,
}: { className?: string } = {}): string {
  return cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-button",
    "text-era-primary",
    "transition-colors duration-era ease-era-brush",
    "hover:bg-[rgb(var(--accent-500)/0.10)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))]",
    className,
  );
}

export function sidebarShellUserProfileStyles({
  collapsed,
  className,
}: SidebarShellUserProfileStyleProps = {}): string {
  return cn(
    "flex h-[46px] w-full shrink-0 items-center gap-3 overflow-hidden rounded-button",
    "transition-[color,padding] duration-era ease-era-brush",
    "text-era-primary hover:bg-[rgb(var(--accent-500)/0.10)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-500))]",
    !collapsed && "ps-2",
    className,
  );
}
