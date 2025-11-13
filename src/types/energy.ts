export interface Device {
  deviceId: string;
  name: string;
  location: string;
  phases: string[];
  status: "online" | "offline";
  lastSeen: string;
  fwVersion: string;
  unit?: string;
}

export interface PhaseData {
  A: number;
  B: number;
  C: number;
}

export interface Telemetry {
  ts: string;
  deviceId: string;
  V: PhaseData;
  I: PhaseData;
  P: number;
  Q: number;
  S: number;
  FP: number;
  freq: number;
  THD: {
    V: number;
    I: number;
  };
}

export interface WaveformPoint {
  point: number;
  V: number;
  I: number;
  timestamp: string;
}

export interface HarmonicData {
  harmonic: number;
  V_magnitude: number;
  I_magnitude: number;
  V_phase: number;
  I_phase: number;
}

export interface EnergyConsumption {
  timestamp: string;
  energyKWh: number;
  avgPower: number;
  maxPower: number;
  minPower: number;
}

export type Severity = "Crítico" | "Alto" | "Médio" | "Info";

export interface Event {
  id: string;
  deviceId: string;
  type: string;
  severity: Severity;
  tsStart: string;
  tsEnd?: string;
  status: "ativo" | "resolvido" | "confirmado";
  details: Record<string, any>;
  comments?: string;
}

export interface AlarmRule {
  id: string;
  name: string;
  deviceIds: string[];
  metric: string;
  condition: ">" | "<" | "between";
  threshold: number | [number, number];
  window: number;
  severity: Severity;
  enabled: boolean;
  channels: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "Administrador" | "Gestor" | "Técnico" | "Visualizador";
  avatar?: string;
}
