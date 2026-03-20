import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Percent, Save, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

interface PlatformSettingsData {
  service_fee_percentage: number;
}

const PlatformSettings: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feePercentage, setFeePercentage] = useState<string>('0');
  const [originalFee, setOriginalFee] = useState<number>(0);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<PlatformSettingsData>('/admin/platform-settings');
      setFeePercentage(String(data.service_fee_percentage));
      setOriginalFee(data.service_fee_percentage);
    } catch {
      showToast('Erro ao carregar configurações.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const value = parseFloat(feePercentage);
    if (isNaN(value) || value < 0 || value > 100) {
      showToast('Insira um valor entre 0 e 100.', 'error');
      return;
    }

    try {
      setSaving(true);
      await api.put('/admin/platform-settings', { service_fee_percentage: value });
      setOriginalFee(value);
      showToast('Configurações salvas com sucesso!', 'success');
    } catch {
      showToast('Erro ao salvar configurações.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const feeValue = parseFloat(feePercentage) || 0;
  const exampleDoctorPrice = 300;
  const exampleTotal = exampleDoctorPrice + (exampleDoctorPrice * feeValue) / 100;
  const hasChanges = feeValue !== originalFee;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Composição de Valores</h2>
        <p className="text-gray-500 mt-1">
          Defina as taxas aplicadas sobre o valor das consultas.
        </p>
      </div>

      {/* Card de configuração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Percent className="w-5 h-5 text-blue-600" />
            Taxa de Serviço da Plataforma
          </CardTitle>
          <CardDescription>
            Percentual cobrado sobre o valor definido pelo médico em cada consulta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fee">Porcentagem (%)</Label>
            <div className="relative w-48">
              <Input
                id="fee"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={feePercentage}
                onChange={(e) => setFeePercentage(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
          </div>

          {/* Preview do cálculo */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
              <Info className="w-4 h-4" />
              Exemplo de composição
            </div>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Valor do médico (exemplo)</span>
                <span>
                  {exampleDoctorPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Taxa da plataforma ({feeValue.toFixed(2)}%)</span>
                <span>
                  + {((exampleDoctorPrice * feeValue) / 100).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-blue-200 pt-2 mt-1">
                <span>Total cobrado do paciente</span>
                <span>
                  {exampleTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettings;
