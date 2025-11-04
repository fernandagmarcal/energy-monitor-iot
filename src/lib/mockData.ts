import { Device, Telemetry, Event, AlarmRule } from "@/types/energy";

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
