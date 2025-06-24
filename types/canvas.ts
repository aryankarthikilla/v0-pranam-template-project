export interface CanvasElement {
  id: string;
  type: "text" | "image" | "shape" | "chart" | "icon" | "line";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
  visible: boolean;
  opacity: number;

  // Text specific
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  textColor?: string;

  // Shape specific
  shapeType?: "rectangle" | "circle" | "triangle" | "arrow" | "star";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;

  // Image specific
  imageUrl?: string;
  imageFit?: "cover" | "contain" | "fill";

  // Chart specific
  chartType?: "bar" | "line" | "pie" | "doughnut";
  chartData?: any;

  // Icon specific
  iconName?: string;
  iconColor?: string;

  // Line specific
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  lineStyle?: "solid" | "dashed" | "dotted";
  arrowStart?: boolean;
  arrowEnd?: boolean;
}

export interface CanvasSlide {
  id: string;
  subject_id: string;
  title: string;
  elements: CanvasElement[];
  background: {
    type: "color" | "gradient" | "image";
    value: string;
    gradient?: {
      type: "linear" | "radial";
      colors: string[];
      direction: number;
    };
  };
  slide_order: number;
  created_at: string;
  updated_at: string;
}

export interface CanvasState {
  selectedElements: string[];
  clipboard: CanvasElement[];
  history: CanvasSlide[];
  historyIndex: number;
  zoom: number;
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
