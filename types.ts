
export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight: number;
}

export interface SpinResult {
  option: WheelOption;
  timestamp: number;
}
