import { Pm25BandKey, PsiBandKey } from '../types/psi';

export interface AirQualityBandInfo {
  key: PsiBandKey;
  label: string;
  rangeLabel: string;
  symbol: string;
  hex: string;
  strokeHex: string;
  tintHex: string;
  bgClass: string;
  textClass: string;
  surfaceClass: string;
  borderClass: string;
  summary: string;
  healthyAdvice: string;
  sensitiveAdvice: string;
  outdoorAdvice: string;
  maskAndIndoorAdvice: string;
}

export const PSI_BANDS: AirQualityBandInfo[] = [
  {
    key: 'good',
    label: 'Good',
    rangeLabel: '0–50',
    symbol: '●',
    hex: '#059669',
    strokeHex: '#047857',
    tintHex: '#ECFDF5',
    bgClass: 'bg-emerald-600',
    textClass: 'text-emerald-700',
    surfaceClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    summary: 'Clean air across reporting stations with minimal particulate load.',
    healthyAdvice: 'Continue normal outdoor work, exercise, and daily commutes.',
    sensitiveAdvice: 'Normal activities are safe for elderly, children, and cardiac or respiratory patients.',
    outdoorAdvice: 'All outdoor school programmes, sports events, and physical training may proceed as scheduled.',
    maskAndIndoorAdvice: 'Natural cross-ventilation is recommended; N95 respirators are not needed.',
  },
  {
    key: 'moderate',
    label: 'Moderate',
    rangeLabel: '51–100',
    symbol: '◐',
    hex: '#0284C7',
    strokeHex: '#0369A1',
    tintHex: '#F0F9FF',
    bgClass: 'bg-sky-600',
    textClass: 'text-sky-700',
    surfaceClass: 'bg-sky-50',
    borderClass: 'border-sky-200',
    summary: 'Mild transboundary particulate presence with slight afternoon haze.',
    healthyAdvice: 'Normal activities may continue; stay hydrated during extended outdoor exertion.',
    sensitiveAdvice: 'Monitor for mild irritation; carry prescribed inhalers if asthmatic.',
    outdoorAdvice: 'Routine outdoor activities can proceed; monitor 1-hour PM2.5 spikes before intense drills.',
    maskAndIndoorAdvice: 'Keep windows slightly shaded during afternoon peaks; air purifiers optional.',
  },
  {
    key: 'unhealthy',
    label: 'Unhealthy',
    rangeLabel: '101–200',
    symbol: '▲',
    hex: '#D97706',
    strokeHex: '#B45309',
    tintHex: '#FFFBEB',
    bgClass: 'bg-amber-600',
    textClass: 'text-amber-700',
    surfaceClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
    summary: 'Elevated smoke haze affecting visibility and fine particulate concentration.',
    healthyAdvice: 'Reduce prolonged or strenuous outdoor physical exertion.',
    sensitiveAdvice: 'Minimise prolonged outdoor exertion; elderly, pregnant women, and children should stay indoors where possible.',
    outdoorAdvice: 'Shift vigorous school PE lessons and outdoor sports indoors or reschedule.',
    maskAndIndoorAdvice: 'Close windows and run HEPA air purifiers; wear a fit-checked N95 mask only if spending extended hours outdoors.',
  },
  {
    key: 'very-unhealthy',
    label: 'Very Unhealthy',
    rangeLabel: '201–300',
    symbol: '◆',
    hex: '#EA580C',
    strokeHex: '#C2410C',
    tintHex: '#FFF7ED',
    bgClass: 'bg-orange-600',
    textClass: 'text-orange-700',
    surfaceClass: 'bg-orange-50',
    borderClass: 'border-orange-200',
    summary: 'Dense transboundary haze causing widespread air quality degradation.',
    healthyAdvice: 'Avoid prolonged or strenuous outdoor physical exertion.',
    sensitiveAdvice: 'Avoid all outdoor physical activity; seek medical attention promptly if breathless or wheezing.',
    outdoorAdvice: 'Suspend outdoor mass events, camps, and strenuous training.',
    maskAndIndoorAdvice: 'Seal windows and doors; operate recirculated air-conditioning with HEPA filtration and use N95 masks outdoors.',
  },
  {
    key: 'hazardous',
    label: 'Hazardous',
    rangeLabel: '>300',
    symbol: '✖',
    hex: '#DC2626',
    strokeHex: '#B91C1C',
    tintHex: '#FEF2F2',
    bgClass: 'bg-red-600',
    textClass: 'text-red-700',
    surfaceClass: 'bg-red-50',
    borderClass: 'border-red-200',
    summary: 'Severe particulate emergency with severely reduced urban visibility.',
    healthyAdvice: 'Minimise all outdoor activity and remain indoors in filtered spaces.',
    sensitiveAdvice: 'Remain strictly indoors with windows sealed and active air filtration.',
    outdoorAdvice: 'Cancel all outdoor work and institutional outdoor activities.',
    maskAndIndoorAdvice: 'Continuous indoor HEPA filtration advised; wear properly fitted N95 respirators for essential outdoor transit.',
  },
];

export function getPsiBand(psi: number): AirQualityBandInfo {
  if (psi <= 50) return PSI_BANDS[0];
  if (psi <= 100) return PSI_BANDS[1];
  if (psi <= 200) return PSI_BANDS[2];
  if (psi <= 300) return PSI_BANDS[3];
  return PSI_BANDS[4];
}

export interface Pm25BandInfo {
  key: Pm25BandKey;
  label: string;
  rangeLabel: string;
  symbol: string;
  hex: string;
  textClass: string;
  surfaceClass: string;
}

export function getPm25Band(pm25: number): Pm25BandInfo {
  if (pm25 <= 55) {
    return {
      key: 'normal',
      label: 'Normal',
      rangeLabel: '0–55 µg/m³',
      symbol: '●',
      hex: '#059669',
      textClass: 'text-emerald-700',
      surfaceClass: 'bg-emerald-50',
    };
  }
  if (pm25 <= 150) {
    return {
      key: 'elevated',
      label: 'Elevated',
      rangeLabel: '56–150 µg/m³',
      symbol: '▲',
      hex: '#D97706',
      textClass: 'text-amber-700',
      surfaceClass: 'bg-amber-50',
    };
  }
  if (pm25 <= 250) {
    return {
      key: 'high',
      label: 'High',
      rangeLabel: '151–250 µg/m³',
      symbol: '◆',
      hex: '#EA580C',
      textClass: 'text-orange-700',
      surfaceClass: 'bg-orange-50',
    };
  }
  return {
    key: 'very-high',
    label: 'Very High',
    rangeLabel: '>250 µg/m³',
    symbol: '✖',
    hex: '#DC2626',
    textClass: 'text-red-700',
    surfaceClass: 'bg-red-50',
  };
}
