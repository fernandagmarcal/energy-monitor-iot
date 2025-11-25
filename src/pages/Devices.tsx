import { useState, useEffect } from "react";
import api from "@/lib/api";

type HarmonicRow = {
  harmonic: number;
  V_magnitude: number;
  I_magnitude: number;
};

const Devices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<HarmonicRow[]>([]);
  const [selectedSheet, setSelectedSheet] = useState("plan1");

  // -----------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------

  const extractRows = (resp: any) => {
    if (!resp?.data?.data) return [];
    const sheet = resp.data.data[0];
    return sheet?.data || [];
  };

  const num = (v: any) => Number(v ?? 0);

  // -----------------------------------------------------------
  // Buscar planilha certa
  // -----------------------------------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let file = "/data/Planilha1.xlsx";

      if (selectedSheet === "plan2") file = "/data/Planilha2.xlsx";
      if (selectedSheet === "plan3") file = "/data/Planilha3.xlsx";

      const response = await api.get(file);

      const dataRows = extractRows(response);

      // Transformar planilha → harmônicos (linha = ordem)
      const parsed: HarmonicRow[] = dataRows.map((row: any, index: number) => ({
        harmonic: index + 1,
        V_magnitude: num(row["Tensão em V"]),
        I_magnitude: num(row["Corrente em A"]),
      }));

      setRows(parsed);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedSheet]);

  // -----------------------------------------------------------
  // UI
  // -----------------------------------------------------------

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dispositivos</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Erro</h1>
        <p className="text-red-500">{error}</p>
        <p className="mt-2 text-muted-foreground">
          Verifique se o backend está ativo em <strong>http://localhost:8080</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dispositivos</h1>

      {/* Seleção de planilha */}
      <select
        value={selectedSheet}
        onChange={(e) => setSelectedSheet(e.target.value)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="plan1">Dispositivo — Planilha 1</option>
        <option value="plan2">Dispositivo — Planilha 2</option>
        <option value="plan3">Dispositivo — Planilha 3</option>
      </select>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Harmônico
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Magnitude da Tensão (V)
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Magnitude da Corrente (A)
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-sm">{row.harmonic}</td>
                <td className="px-4 py-2 text-sm">{row.V_magnitude}</td>
                <td className="px-4 py-2 text-sm">{row.I_magnitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;
