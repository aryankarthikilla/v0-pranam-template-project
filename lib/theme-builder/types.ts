export interface ThemeColors {
  background: string
  foreground: string
  card: string
  "card-foreground": string
  popover: string
  "popover-foreground": string
  primary: string
  "primary-foreground": string
  secondary: string
  "secondary-foreground": string
  muted: string
  "muted-foreground": string
  accent: string
  "accent-foreground": string
  destructive: string
  "destructive-foreground": string
  border: string
  input: string
  ring: string
  success?: string
  "success-foreground"?: string
  warning?: string
  "warning-foreground"?: string
  info?: string
  "info-foreground"?: string
}

export interface ComponentStyles {
  borderRadius?: string
  borderWidth?: string
  fontSize?: string
  fontWeight?: string
  padding?: string
  margin?: string
  height?: string
  minHeight?: string
  maxHeight?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  boxShadow?: string
  transition?: string
  transform?: string
  opacity?: string
  backdropBlur?: string
  letterSpacing?: string
  lineHeight?: string
}

export interface ThemeComponents {
  button: ComponentStyles
  input: ComponentStyles
  card: ComponentStyles
  dialog?: ComponentStyles
  dropdown?: ComponentStyles
  tooltip?: ComponentStyles
  badge?: ComponentStyles
  avatar?: ComponentStyles
  checkbox?: ComponentStyles
  radio?: ComponentStyles
  switch?: ComponentStyles
  slider?: ComponentStyles
  progress?: ComponentStyles
  tabs?: ComponentStyles
  accordion?: ComponentStyles
  alert?: ComponentStyles
  breadcrumb?: ComponentStyles
  navigation?: ComponentStyles
  sidebar?: ComponentStyles
  header?: ComponentStyles
  footer?: ComponentStyles
  table?: ComponentStyles
  form?: ComponentStyles
  label?: ComponentStyles
  textarea?: ComponentStyles
  select?: ComponentStyles
  combobox?: ComponentStyles
  calendar?: ComponentStyles
  datePicker?: ComponentStyles
  timePicker?: ComponentStyles
  colorPicker?: ComponentStyles
  fileUpload?: ComponentStyles
  pagination?: ComponentStyles
  skeleton?: ComponentStyles
  spinner?: ComponentStyles
  toast?: ComponentStyles
  modal?: ComponentStyles
  popover?: ComponentStyles
  sheet?: ComponentStyles
  drawer?: ComponentStyles
  menubar?: ComponentStyles
  contextMenu?: ComponentStyles
  hoverCard?: ComponentStyles
  collapsible?: ComponentStyles
  resizable?: ComponentStyles
  scrollArea?: ComponentStyles
  separator?: ComponentStyles
  toolbar?: ComponentStyles
  toggle?: ComponentStyles
  toggleGroup?: ComponentStyles
}

export interface ThemeData {
  colors: ThemeColors
  components: ThemeComponents
  typography?: {
    fontFamily?: string
    headingFontFamily?: string
    fontSize?: Record<string, string>
    fontWeight?: Record<string, string>
    lineHeight?: Record<string, string>
    letterSpacing?: Record<string, string>
  }
  spacing?: Record<string, string>
  borderRadius?: Record<string, string>
  boxShadow?: Record<string, string>
  animation?: Record<string, string>
  breakpoints?: Record<string, string>
}

export interface Theme {
  id: string
  name: string
  description?: string
  author_id?: string
  author_name?: string
  is_public: boolean
  is_featured: boolean
  theme_data: ThemeData
  preview_image?: string
  downloads_count: number
  likes_count: number
  created_at: string
  updated_at: string
}

export interface ThemeBuilderState {
  currentTheme: ThemeData
  previewMode: boolean
  selectedComponent: keyof ThemeComponents | null
  selectedColorCategory: keyof ThemeColors | null
  isDirty: boolean
}
