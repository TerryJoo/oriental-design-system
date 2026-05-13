/**
 * Core exports — Framework-agnostic.
 *
 * This entry point has NO React dependency. Use it from Astro, Vue, Svelte,
 * vanilla HTML, or any non-React environment.
 *
 * Includes: design tokens, era theme system, `cn()` utility, and component
 * style functions (class generators).
 */

// Utilities
export { cn } from "./utils/cn";

// Tokens
export { colors } from "./tokens/colors";
export { typography } from "./tokens/typography";
export { borderRadius } from "./tokens/spacing";
export { animations } from "./tokens/animations";
export { shadows } from "./tokens/shadows";
export { zIndex } from "./tokens/zIndex";
export { gradients } from "./tokens/gradients";
export {
  textStyles as textStylePresets,
  type TextStylePreset,
} from "./tokens/textStyles";
export { era, type EraTokens } from "./tokens/era";

// Themes
export {
  heritageEra,
  neonEra,
  applyEra,
  type EraName,
  type EraTheme,
} from "./themes";

// Component style functions (framework-agnostic class generators)
export {
  buttonStyles,
  buttonVariants,
  buttonDisabledVariants,
  buttonShapes,
  buttonSizes,
  buttonIconGaps,
  buttonIconSizes,
  buttonIconPadding,
  type ButtonStyleProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonShape,
} from "./components/Button/Button.styles";

export {
  badgeStyles,
  badgeDotStyles,
  badgeVariants,
  badgeSizes,
  badgeShapes,
  type BadgeStyleProps,
  type BadgeVariant,
  type BadgeSize,
  type BadgeShape,
} from "./components/Badge/Badge.styles";

export {
  eraSwitchContainer,
  eraSwitchSizes,
  eraSwitchSegmentSizes,
  eraSwitchSegmentStyles,
  type EraSwitchSize,
  type EraSwitchSegmentStyleProps,
} from "./components/EraSwitch/EraSwitch.styles";

export {
  patternBackgroundClasses,
  patternBackgroundLayerStyle,
  patternBackgroundVariants,
  type PatternVariant,
  type PatternIntensity,
  type PatternBackgroundStyleProps,
} from "./components/PatternBackground/PatternBackground.styles";

export {
  typographyStyles,
  typographyVariants,
  typographyTones,
  type TypographyStyleProps,
  type TypographyVariant,
  type TypographyTone,
} from "./components/Typography/Typography.styles";

export {
  stackStyles,
  stackAlignMap,
  stackDirectionMap,
  stackGapMap,
  stackJustifyMap,
  type StackStyleProps,
  type StackAlign,
  type StackDirection,
  type StackGap,
  type StackJustify,
} from "./components/Stack/Stack.styles";

export {
  separatorStyles,
  separatorFadeStyle,
  separatorOrientationMap,
  separatorVariantMap,
  type SeparatorStyleProps,
  type SeparatorOrientation,
  type SeparatorVariant,
} from "./components/Separator/Separator.styles";

export {
  cardStyles,
  cardVariants,
  cardPaddings,
  type CardStyleProps,
  type CardVariant,
  type CardPadding,
} from "./components/Card/Card.styles";

export {
  alertStyles,
  alertTitleStyles,
  alertMessageStyles,
  alertIntents,
  type AlertStyleProps,
  type AlertIntent,
} from "./components/Alert/Alert.styles";

export {
  spinnerStyles,
  spinnerSizes,
  type SpinnerStyleProps,
  type SpinnerSize,
} from "./components/Spinner/Spinner.styles";

export {
  loadingDotsContainerStyles,
  loadingDotStyles,
  loadingDotsSpeedMap,
  type LoadingDotsStyleProps,
  type LoadingDotsSpeed,
} from "./components/LoadingDots/LoadingDots.styles";

export {
  tooltipWrapStyles,
  tooltipBubbleStyles,
  tooltipPlacementMap,
  type TooltipStyleProps,
  type TooltipPlacement,
} from "./components/Tooltip/Tooltip.styles";

export {
  inputStyles,
  inputSizes,
  inputVariants,
  type InputStyleProps,
  type InputSize,
  type InputVariant,
} from "./components/Input/Input.styles";

// ── Forms (rest) ─────────────────────────────────────────────
export {
  textFieldWrap,
  textFieldLabel,
  textFieldHelp,
  textFieldHelpError,
} from "./components/TextField/TextField.styles";

export {
  checkboxBoxStyles,
  checkboxBoxSizes,
  checkboxLabelSizes,
  checkboxWrap,
  checkboxCheckmark,
  type CheckboxSize,
} from "./components/Checkbox/Checkbox.styles";

export {
  radioDotStyles,
  radioDotSizes,
  radioLabelSizes,
  radioWrap,
  type RadioSize,
} from "./components/Radio/Radio.styles";

export {
  switchTrackStyles,
  switchThumbStyles,
  switchWrap,
  switchSizes,
  switchThumbSizes,
  type SwitchSize,
} from "./components/Switch/Switch.styles";

export {
  selectStyles,
  type SelectStyleProps,
  type SelectSize,
  type SelectVariant,
} from "./components/Select/Select.styles";

export {
  filterChipStyles,
  filterChipSizes,
  filterChipCountStyles,
  filterContainer,
  type FilterChipStyleProps,
  type FilterChipCountStyleProps,
  type FilterSize,
} from "./components/Filter/Filter.styles";

// ── Display (rest) ───────────────────────────────────────────
export {
  avatarStyles,
  avatarSizes,
  avatarGroup,
  type AvatarStyleProps,
  type AvatarSize,
} from "./components/Avatar/Avatar.styles";

export {
  tagStyles,
  tagSizes,
  tagRemove,
  type TagStyleProps,
  type TagSize,
} from "./components/Tag/Tag.styles";

export {
  coverImageWrap,
  coverImageOverlay,
  coverImageLabel,
  coverImagePattern,
  coverImageRatioMap,
  type CoverImageStyleProps,
  type CoverImageRatio,
} from "./components/CoverImage/CoverImage.styles";

export {
  iconPickerCellStyles,
  iconPickerGrid,
  type IconPickerCellStyleProps,
} from "./components/IconPicker/IconPicker.styles";

// ── Feedback (rest) ──────────────────────────────────────────
export {
  toastStyles,
  toastIntents,
  type ToastStyleProps,
  type ToastIntent,
} from "./components/Toast/Toast.styles";

export {
  skeletonStyles,
  skeletonShapeMap,
  type SkeletonStyleProps,
  type SkeletonShape,
} from "./components/Skeleton/Skeleton.styles";

export {
  progressTrackStyles,
  progressTrack,
  progressBar,
  type ProgressSize,
} from "./components/Progress/Progress.styles";

export {
  emptyStateWrap,
  emptyStateIcon,
  emptyStateTitle,
  emptyStateMessage,
} from "./components/EmptyState/EmptyState.styles";

export {
  syncStatusContainer,
  syncStatusDot,
  syncStatusStateMap,
  type SyncStatusStyleProps,
  type SyncStatusState,
} from "./components/SyncStatus/SyncStatus.styles";

// ── Navigation ───────────────────────────────────────────────
export {
  breadcrumbNav,
  breadcrumbLink,
  breadcrumbCurrent,
  breadcrumbSeparator,
} from "./components/Breadcrumb/Breadcrumb.styles";

export {
  tabsList,
  tabsPanel,
  tabStyles,
  type TabStyleProps,
} from "./components/Tabs/Tabs.styles";

export {
  paginationContainer,
  paginationButtonStyles,
  type PaginationButtonStyleProps,
} from "./components/Pagination/Pagination.styles";

export {
  // Flat (legacy) Sidebar
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
} from "./components/Sidebar/Sidebar.styles";

export {
  pageTreeRoot,
  pageTreeNode,
  pageTreeNodeActive,
  pageTreeCaret,
  pageTreeCaretOpen,
  pageTreeChildren,
} from "./components/PageTree/PageTree.styles";

export {
  stepperRoot,
  stepperStep,
  stepperLabel,
  stepperCircleStyles,
  stepperLine,
  stepperLineDone,
  type StepCircleStyleProps,
} from "./components/Stepper/Stepper.styles";

// ── Overlay (rest) ───────────────────────────────────────────
export {
  modalBackdrop,
  modalPanelStyles,
  modalTitle,
  modalDescription,
  modalFooter,
  type ModalSize,
} from "./components/Modal/Modal.styles";

export {
  popoverWrap,
  popoverPanelStyles,
  popoverPlacementMap,
  type PopoverPanelStyleProps,
  type PopoverPlacement,
} from "./components/Popover/Popover.styles";

export {
  dropdownMenuRoot,
  dropdownMenuItemStyles,
  dropdownMenuSeparator,
  type DropdownMenuItemStyleProps,
} from "./components/DropdownMenu/DropdownMenu.styles";

export {
  commandPaletteRoot,
  commandPaletteInput,
  commandPaletteList,
  commandPaletteItemStyles,
  commandPaletteKbd,
  commandPaletteEmpty,
  type CommandItemStyleProps,
} from "./components/CommandPalette/CommandPalette.styles";

// ── Data ─────────────────────────────────────────────────────
export {
  accordionRoot,
  accordionItem,
  accordionHeader,
  accordionChevron,
  accordionChevronOpen,
  accordionBody,
  accordionBodyClosed,
  accordionBodyOpen,
} from "./components/Accordion/Accordion.styles";

export {
  dataTableRoot,
  dataTableThead,
  dataTableTh,
  dataTableTd,
  dataTableRow,
} from "./components/DataTable/DataTable.styles";

export {
  kanbanBoard,
  kanbanColumn,
  kanbanColumnHeader,
  kanbanCard,
  kanbanCardGrabbed,
  kanbanCardList,
  kanbanLiveRegion,
} from "./components/KanbanBoard/KanbanBoard.styles";

export {
  dragDropList,
  dragDropListInner,
  dragDropItem,
  dragDropItemDragging,
  dragDropHandle,
} from "./components/DragDrop/DragDrop.styles";

export {
  calendarRoot,
  calendarHeader,
  calendarTitle,
  calendarNavButton,
  calendarGrid,
  calendarDow,
  calendarDayStyles,
  type CalendarDayStyleProps,
} from "./components/Calendar/Calendar.styles";

// ── Editor · Media ───────────────────────────────────────────
export {
  markdownEditorRoot,
  markdownEditorToolbar,
  markdownEditorToolButton,
  markdownEditorTextarea,
} from "./components/MarkdownEditor/MarkdownEditor.styles";

export {
  audioRecorderRoot,
  audioRecorderButtonStyles,
  audioRecorderWave,
  audioRecorderWaveBar,
  audioRecorderWaveBarActive,
  audioRecorderTime,
  type RecorderButtonStyleProps,
} from "./components/AudioRecorder/AudioRecorder.styles";

// ── Chat ─────────────────────────────────────────────────────
export {
  promptInputRoot,
  promptInputTextarea,
  promptInputSendStyles,
} from "./components/PromptInput/PromptInput.styles";

export {
  chatBubbleStyles,
  chatBubbleMeta,
  chatThread,
  type ChatBubbleStyleProps,
  type ChatBubbleAuthor,
} from "./components/ChatBubble/ChatBubble.styles";
