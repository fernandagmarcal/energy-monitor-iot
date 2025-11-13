import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface AlertThresholds {
  voltage_max: number;
  voltage_min: number;
  power_factor_min: number;
  thd_voltage_max: number;
  thd_current_max: number;
  current_max: number;
  frequency_min: number;
  frequency_max: number;
}

const AdminLimites = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thresholds, setThresholds] = useState<AlertThresholds>({
    voltage_max: 230.0,
    voltage_min: 200.0,
    power_factor_min: 0.92,
    thd_voltage_max: 5.0,
    thd_current_max: 8.0,
    current_max: 100.0,
    frequency_min: 59.8,
    frequency_max: 60.2,
  });

  useEffect(() => {
    if (user) {
      fetchThresholds();
    }
  }, [user]);

  const fetchThresholds = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_thresholds')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setThresholds({
          voltage_max: Number(data.voltage_max),
          voltage_min: Number(data.voltage_min),
          power_factor_min: Number(data.power_factor_min),
          thd_voltage_max: Number(data.thd_voltage_max),
          thd_current_max: Number(data.thd_current_max),
          current_max: Number(data.current_max),
          frequency_min: Number(data.frequency_min),
          frequency_max: Number(data.frequency_max),
        });
      }
    } catch (error: any) {
      toast.error('Erro ao carregar limites de alerta');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('alert_thresholds')
        .upsert({
          user_id: user?.id,
          ...thresholds,
        });

      if (error) throw error;

      toast.success('Limites de alerta salvos com sucesso!');
    } catch (error: any) {
      toast.error('Erro ao salvar limites de alerta');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof AlertThresholds, value: string) => {
    setThresholds(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites de Alerta</CardTitle>
        <CardDescription>
          Configure os limites operacionais para geração de alertas automáticos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="voltage_max">Tensão Máxima (V)</Label>
              <Input
                id="voltage_max"
                type="number"
                step="0.01"
                value={thresholds.voltage_max}
                onChange={(e) => handleChange('voltage_max', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="voltage_min">Tensão Mínima (V)</Label>
              <Input
                id="voltage_min"
                type="number"
                step="0.01"
                value={thresholds.voltage_min}
                onChange={(e) => handleChange('voltage_min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="power_factor_min">Fator de Potência Mínimo</Label>
              <Input
                id="power_factor_min"
                type="number"
                step="0.01"
                value={thresholds.power_factor_min}
                onChange={(e) => handleChange('power_factor_min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_max">Corrente Máxima (A)</Label>
              <Input
                id="current_max"
                type="number"
                step="0.01"
                value={thresholds.current_max}
                onChange={(e) => handleChange('current_max', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thd_voltage_max">THD Tensão Máximo (%)</Label>
              <Input
                id="thd_voltage_max"
                type="number"
                step="0.01"
                value={thresholds.thd_voltage_max}
                onChange={(e) => handleChange('thd_voltage_max', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thd_current_max">THD Corrente Máximo (%)</Label>
              <Input
                id="thd_current_max"
                type="number"
                step="0.01"
                value={thresholds.thd_current_max}
                onChange={(e) => handleChange('thd_current_max', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_min">Frequência Mínima (Hz)</Label>
              <Input
                id="frequency_min"
                type="number"
                step="0.01"
                value={thresholds.frequency_min}
                onChange={(e) => handleChange('frequency_min', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency_max">Frequência Máxima (Hz)</Label>
              <Input
                id="frequency_max"
                type="number"
                step="0.01"
                value={thresholds.frequency_max}
                onChange={(e) => handleChange('frequency_max', e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminLimites;
