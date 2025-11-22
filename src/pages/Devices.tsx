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

  useEffect(() => {
    const fetchHarmonics = async () => {
      try {
        setLoading(true);

        // Endpoint correto do backend
        const response = await api.get("/harmonics");

        if (!response.data) {
          throw new Error("A API retornou vazio");
        }

        const raw = response.data;

        if (!Array.isArray(raw)) {
          throw new Error("Formato inesperado: a API deveria retornar uma lista");
        }

        // Normalização universal dos dados
        const normalized = raw.map((item: any) => ({
          harmonic: Number(
            item.harmonic ??
              item.H ??
              item.ordem ??
              item.h ??
              0
          ),
          V_magnitude: Number(
            item.V_magnitude ??
              item.V ??
              item.v ??
              item.voltage ??
              0
          ),
          I_magnitude: Number(
            item.I_magnitude ??
              item.I ??
              item.i ??
              item.current ??
              0
          ),
        }));

        setRows(normalized);
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setError("Não foi possível carregar os dados. O backend Go está rodando?");
      } finally {
        setLoading(false);
      }
    };

    fetchHarmonics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dispositivos</h1>
        <p className="text-muted-foreground">Carregando dados do servidor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Erro na Conexão</h1>
        <p className="text-red-500">{error}</p>
        <p className="mt-2 text-muted-foreground">
          Certifique-se de que o backend Go está ativo em <strong>http://localhost:8080</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dispositivos</h1>

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
                <td className="px-4 py-2 text-sm text-gray-700">{row.harmonic}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.V_magnitude}</td>
                <td className="px-4 py-2 text-sm text-gray-700">{row.I_magnitude}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;