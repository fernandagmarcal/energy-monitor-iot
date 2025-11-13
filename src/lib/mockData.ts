import { Device, Telemetry, Event, AlarmRule, User, WaveformPoint, HarmonicData, EnergyConsumption } from "@/types/energy";

export const mockDevices: Device[] = [
  {
    deviceId: "med-TRF-01",
    name: "Medição TRF 01",
    location: "Quadro Geral / Bloco A",
    phases: ["A", "B", "C"],
    status: "online",
    lastSeen: new Date(Date.now() - 15000).toISOString(),
    fwVersion: "1.2.3",
    unit: "Unidade Principal"
  },
  {
    deviceId: "med-TRF-02",
    name: "Medição TRF 02",
    location: "Quadro Geral / Bloco B",
    phases: ["A", "B", "C"],
    status: "online",
    lastSeen: new Date(Date.now() - 8000).toISOString(),
    fwVersion: "1.2.3",
    unit: "Unidade Principal"
  },
  {
    deviceId: "med-QD-301",
    name: "QD Produção 301",
    location: "Produção / Setor 3",
    phases: ["A", "B", "C"],
    status: "online",
    lastSeen: new Date(Date.now() - 25000).toISOString(),
    fwVersion: "1.2.1",
    unit: "Unidade Produção"
  },
  {
    deviceId: "med-QD-405",
    name: "QD Administrativo",
    location: "Administrativo / 4º Andar",
    phases: ["A", "B", "C"],
    status: "offline",
    lastSeen: new Date(Date.now() - 180000).toISOString(),
    fwVersion: "1.1.8",
    unit: "Unidade Administrativa"
  },
  {
    deviceId: "med-CCM-01",
    name: "CCM Principal",
    location: "Casa de Máquinas",
    phases: ["A", "B", "C"],
    status: "online",
    lastSeen: new Date(Date.now() - 5000).toISOString(),
    fwVersion: "1.2.3",
    unit: "Unidade Industrial"
  }
];

export const generateTelemetry = (deviceId: string): Telemetry => {
  const baseV = 220;
  const variation = (Math.random() - 0.5) * 10;
  
  return {
    ts: new Date().toISOString(),
    deviceId,
    V: {
      A: baseV + variation + (Math.random() - 0.5) * 2,
      B: baseV + variation + (Math.random() - 0.5) * 2,
      C: baseV + variation + (Math.random() - 0.5) * 2,
    },
    I: {
      A: 5 + Math.random() * 10,
      B: 5 + Math.random() * 10,
      C: 5 + Math.random() * 10,
    },
    P: 3.5 + Math.random() * 3,
    Q: 0.8 + Math.random() * 0.8,
    S: 3.6 + Math.random() * 3.2,
    FP: 0.88 + Math.random() * 0.11,
    freq: 59.9 + Math.random() * 0.2,
    THD: {
      V: 2 + Math.random() * 4,
      I: 3 + Math.random() * 6,
    },
  };
};

export const mockEvents: Event[] = [
  {
    id: "evt-9031",
    deviceId: "med-TRF-01",
    type: "Subtensão",
    severity: "Alto",
    tsStart: new Date(Date.now() - 3600000).toISOString(),
    tsEnd: new Date(Date.now() - 3580000).toISOString(),
    status: "resolvido",
    details: { fase: "B", Vmin: 197.4, limite: 198.0 },
  },
  {
    id: "evt-9032",
    deviceId: "med-QD-301",
    type: "Fator de Potência Baixo",
    severity: "Médio",
    tsStart: new Date(Date.now() - 7200000).toISOString(),
    status: "confirmado",
    details: { FP: 0.87, limite: 0.92, duracao: "2h 15min" },
    comments: "Carga indutiva identificada. Banco de capacitores programado."
  },
  {
    id: "evt-9033",
    deviceId: "med-TRF-02",
    type: "THD Elevado",
    severity: "Alto",
    tsStart: new Date(Date.now() - 1800000).toISOString(),
    status: "ativo",
    details: { THD_I: 8.7, limite: 5.0, fase: "A" },
  },
  {
    id: "evt-9034",
    deviceId: "med-QD-405",
    type: "Perda de Comunicação",
    severity: "Crítico",
    tsStart: new Date(Date.now() - 180000).toISOString(),
    status: "ativo",
    details: { duracao: "3min", ultimoContato: new Date(Date.now() - 180000).toISOString() },
  },
  {
    id: "evt-9035",
    deviceId: "med-CCM-01",
    type: "Variação de Frequência",
    severity: "Médio",
    tsStart: new Date(Date.now() - 900000).toISOString(),
    tsEnd: new Date(Date.now() - 870000).toISOString(),
    status: "resolvido",
    details: { freqMin: 59.72, freqMax: 60.28, limite: "±0.2 Hz" },
  },
];

export const mockAlarmRules: AlarmRule[] = [
  {
    id: "rule-001",
    name: "Fator de Potência Crítico",
    deviceIds: ["all"],
    metric: "FP",
    condition: "<",
    threshold: 0.92,
    window: 15,
    severity: "Alto",
    enabled: true,
    channels: ["app", "email"],
  },
  {
    id: "rule-002",
    name: "THD Tensão Elevado",
    deviceIds: ["all"],
    metric: "THD.V",
    condition: ">",
    threshold: 5.0,
    window: 5,
    severity: "Médio",
    enabled: true,
    channels: ["app"],
  },
  {
    id: "rule-003",
    name: "Subtensão",
    deviceIds: ["med-TRF-01", "med-TRF-02"],
    metric: "V",
    condition: "<",
    threshold: 198,
    window: 1,
    severity: "Crítico",
    enabled: true,
    channels: ["app", "email", "sms"],
  },
];

export const mockHistoricalData = (deviceId: string, hours: number = 24) => {
  const data: Telemetry[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100;

  for (let i = 0; i < 100; i++) {
    const ts = new Date(now - (100 - i) * interval);
    const telemetry = generateTelemetry(deviceId);
    telemetry.ts = ts.toISOString();
    data.push(telemetry);
  }

  return data;
};

export const mockUsers: User[] = [
  { id: "1", name: "João Silva", email: "joao.silva@empresa.com", role: "Administrador", avatar: "" },
  { id: "2", name: "Maria Santos", email: "maria.santos@empresa.com", role: "Gestor", avatar: "" },
  { id: "3", name: "Pedro Oliveira", email: "pedro.oliveira@empresa.com", role: "Técnico", avatar: "" },
];

export const mockWaveformData = (deviceId: string): WaveformPoint[] => {
  const points: WaveformPoint[] = [];
  const numPoints = 100;
  const now = new Date();
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const phaseShift = 0.3;
    
    points.push({
      point: i,
      V: 127 + 50 * Math.sin(angle),
      I: 3 + 1.5 * Math.sin(angle - phaseShift),
      timestamp: new Date(now.getTime() - (numPoints - i) * 20).toISOString(),
    });
  }
  
  return points;
};

export const mockHarmonicData = (): HarmonicData[] => {
  return [
    { harmonic: 1, V_magnitude: 100, I_magnitude: 100, V_phase: 0, I_phase: 0 },
    { harmonic: 3, V_magnitude: 2.8, I_magnitude: 4.2, V_phase: 45, I_phase: 30 },
    { harmonic: 5, V_magnitude: 1.5, I_magnitude: 3.8, V_phase: -20, I_phase: -15 },
    { harmonic: 7, V_magnitude: 0.9, I_magnitude: 2.1, V_phase: 10, I_phase: 5 },
    { harmonic: 9, V_magnitude: 0.5, I_magnitude: 1.2, V_phase: -5, I_phase: -10 },
    { harmonic: 11, V_magnitude: 0.3, I_magnitude: 0.8, V_phase: 15, I_phase: 20 },
    { harmonic: 13, V_magnitude: 0.2, I_magnitude: 0.5, V_phase: -8, I_phase: -12 },
  ];
};

export const mockEnergyConsumption = (period: string): EnergyConsumption[] => {
  const data: EnergyConsumption[] = [];
  const now = new Date();
  
  let numPeriods = 24;
  let intervalMs = 60 * 60 * 1000;
  
  if (period === "7d") {
    numPeriods = 7;
    intervalMs = 24 * 60 * 60 * 1000;
  } else if (period === "30d") {
    numPeriods = 30;
    intervalMs = 24 * 60 * 60 * 1000;
  } else if (period === "12m") {
    numPeriods = 12;
    intervalMs = 30 * 24 * 60 * 60 * 1000;
  }
  
  for (let i = 0; i < numPeriods; i++) {
    const baseEnergy = period === "24h" ? 3 : period === "7d" ? 65 : period === "30d" ? 60 : 1800;
    const variation = Math.random() * 0.3 - 0.15;
    
    data.push({
      timestamp: new Date(now.getTime() - (numPeriods - i) * intervalMs).toISOString(),
      energyKWh: baseEnergy * (1 + variation),
      avgPower: baseEnergy * (1 + variation) * (period === "24h" ? 1 : 1 / 24),
      maxPower: baseEnergy * (1 + variation + 0.2) * (period === "24h" ? 1.5 : 1.5 / 24),
      minPower: baseEnergy * (1 + variation - 0.1) * (period === "24h" ? 0.5 : 0.5 / 24),
    });
  }
  
  return data;
};
