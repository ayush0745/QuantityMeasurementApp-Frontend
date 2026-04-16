export type MeasurementType = 'LengthUnit' | 'TemperatureUnit' | 'VolumeUnit' | 'WeightUnit';
export type UnitCategory = 'length' | 'temperature' | 'volume' | 'weight';
export type OperationType = 'convert' | 'compare' | 'add' | 'subtract' | 'divide';

export interface Quantity {
  value: number;
  unit: string;
  measurementType: MeasurementType;
}

export interface ConvertResponse {
  value: number;
  unit: string;
}

export interface HistoryItem {
  operation: string;
  thisValue: number;
  thisUnit: string;
  thatValue?: number;
  thatUnit?: string;
  resultString: string;
  createdAt: string;
}

export const UNIT_MAPS: Record<UnitCategory, { type: MeasurementType; units: string[] }> = {
  length:      { type: 'LengthUnit',      units: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'] },
  temperature: { type: 'TemperatureUnit', units: ['CELSIUS', 'FAHRENHEIT'] },
  volume:      { type: 'VolumeUnit',      units: ['LITRE', 'MILLILITRE', 'GALLON'] },
  weight:      { type: 'WeightUnit',      units: ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'] }
};
