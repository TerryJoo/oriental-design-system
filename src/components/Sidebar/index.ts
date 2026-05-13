// Flat (legacy) Sidebar
export {
  Sidebar,
  type SidebarProps,
  type SidebarItem,
  type SidebarSection,
} from "./Sidebar";

// Compound SidebarShell.* components
export {
  SidebarShell,
  SidebarTrigger,
  useSidebarShellContext,
  type SidebarShellProps,
  type SidebarTriggerProps,
} from "./SidebarShell";

export {
  SidebarShellHeader,
  SidebarShellContent,
  SidebarShellFooter,
  SidebarShellGroup,
  SidebarShellGroupLabel,
  type SidebarShellHeaderProps,
  type SidebarShellContentProps,
  type SidebarShellFooterProps,
  type SidebarShellGroupProps,
  type SidebarShellGroupLabelProps,
} from "./SidebarShellLayout";

export {
  SidebarShellMenu,
  SidebarShellMenuItem,
  SidebarShellMenuButton,
  SidebarShellMenuSub,
  SidebarShellMenuSubItem,
  SidebarShellMenuSubButton,
  type SidebarShellMenuProps,
  type SidebarShellMenuItemProps,
  type SidebarShellMenuButtonProps,
  type SidebarShellMenuSubProps,
  type SidebarShellMenuSubItemProps,
  type SidebarShellMenuSubButtonProps,
} from "./SidebarShellMenu";

export {
  SidebarShellUserProfile,
  type SidebarShellUserProfileProps,
  type SidebarShellUser,
} from "./SidebarShellUserProfile";

// Style functions and style-prop types
export {
  // Flat sidebar
  sidebarRoot,
  sidebarHeading,
  sidebarItemStyles,
  type SidebarItemStyleProps,
  // SidebarShell compound API
  sidebarShellStyles,
  sidebarShellHeaderStyles,
  sidebarShellContentStyles,
  sidebarShellFooterStyles,
  sidebarShellGroupStyles,
  sidebarShellGroupLabelStyles,
  sidebarShellMenuStyles,
  sidebarShellMenuButtonStyles,
  sidebarShellMenuSubStyles,
  sidebarShellMenuSubSubStyles,
  sidebarShellMenuSubItemStyles,
  sidebarShellMenuSubButtonStyles,
  sidebarShellChevronStyles,
  sidebarShellTriggerStyles,
  sidebarShellUserProfileStyles,
  type SidebarShellStyleProps,
  type SidebarShellContentStyleProps,
  type SidebarShellGroupStyleProps,
  type SidebarShellMenuButtonStyleProps,
  type SidebarShellMenuSubStyleProps,
  type SidebarShellMenuSubItemStyleProps,
  type SidebarShellMenuSubButtonStyleProps,
  type SidebarShellChevronStyleProps,
  type SidebarShellUserProfileStyleProps,
} from "./Sidebar.styles";
