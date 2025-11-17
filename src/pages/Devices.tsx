import { useState, useEffect } from "react";
import api from "@/lib/api"; 

type DataRow = Record<string, string>;

const Devices = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/data/Planilha1.xlsx'); 
        
        const dataList: DataRow[] = response.data.data[0].data;

        if (dataList && dataList.length > 0) {
          const firstItemKeys = Object.keys(dataList[0]);
          setHeaders(firstItemKeys); 
          setRows(dataList); 
        }
        
        setError(null);
      } catch (err) {
        console.error("Erro ao buscar dados da API:", err);
        setError("Falha ao carregar dados. O backend Go está rodando?");
      } finally {
        setLoading(false);
      }
    };

    fetchExcelData();
  }, []); 

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
        <p className="text-muted-foreground">Conectando ao backend Go...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Erro na Conexão</h1>
        <p className="text-red-500">{error}</p>
        <p className="mt-2">Verifique o console (F12) e se o servidor `go run main.go` está rodando.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dispositivos</h1>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Devices;