import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, XCircle, AlertCircle, FileText, Sparkles, Stethoscope } from 'lucide-react';

interface DoctorApplicationStatusProps {
  status: {
    has_application: boolean;
    status?: 'pending' | 'approved' | 'rejected';
    specialty?: string;
    crm?: string;
    crm_state?: string;
    rejection_reason?: string;
    reviewed_at?: string;
    reviewed_by?: string;
    created_at?: string;
    documents?: Array<{
      id: number;
      type: string;
      name: string;
      status: string;
    }>;
  };
  onApplyAgain?: () => void;
  onAccessDoctorArea?: () => void;
}

export function DoctorApplicationStatus({ status, onApplyAgain, onAccessDoctorArea }: DoctorApplicationStatusProps) {
  if (!status.has_application) {
    return null;
  }

  // Aprovado: exibir saudação apenas por 24h após a aprovação
  if (status.status === 'approved') {
    if (!status.reviewed_at) return null;
    const reviewedAt = new Date(status.reviewed_at);
    const diffHours = (Date.now() - reviewedAt.getTime()) / (1000 * 60 * 60);
    if (diffHours >= 24) return null;

    return (
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-14 h-14 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-green-500" />
                <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Solicitação Aprovada</span>
              </div>
              <h2 className="text-xl font-bold text-green-800 mb-1">
                Parabéns! Você agora é um médico cadastrado.
              </h2>
              <p className="text-sm text-green-700">
                Sua solicitação foi aprovada pela equipe administrativa. A partir de agora você tem acesso completo à Área do Médico para gerenciar sua agenda e consultas.
              </p>
            </div>
            {onAccessDoctorArea && (
              <Button
                onClick={onAccessDoctorArea}
                className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white"
              >
                <Stethoscope className="w-4 h-4 mr-2" />
                Acessar Área do Médico
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusConfig = () => {
    switch (status.status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Solicitação em Análise',
          description: 'Sua solicitação para se tornar médico está sendo analisada pela equipe administrativa.',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Solicitação Rejeitada',
          description: 'Infelizmente sua solicitação foi rejeitada.',
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Status Desconhecido',
          description: 'Status da solicitação não reconhecido.',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className={`${config.borderColor} border-2 ${config.bgColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${config.color}`} />
          <span>{config.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">{config.description}</p>

        {/* Informações da solicitação */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white rounded-lg border">
          <div>
            <p className="text-sm text-gray-500">CRM</p>
            <p className="font-medium">{status.crm}/{status.crm_state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Especialidade</p>
            <p className="font-medium">{status.specialty || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Data da Solicitação</p>
            <p className="font-medium">{formatDate(status.created_at)}</p>
          </div>
          {status.reviewed_at && (
            <div>
              <p className="text-sm text-gray-500">Data da Revisão</p>
              <p className="font-medium">{formatDate(status.reviewed_at)}</p>
            </div>
          )}
        </div>

        {/* Motivo da rejeição */}
        {status.status === 'rejected' && status.rejection_reason && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-800 mb-2">Motivo da Rejeição:</p>
            <p className="text-sm text-red-700">{status.rejection_reason}</p>
          </div>
        )}

        {/* Documentos enviados */}
        {status.documents && status.documents.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">Documentos Enviados:</p>
            <div className="space-y-2">
              {status.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{doc.name}</span>
                  </div>
                  <Badge variant={doc.status === 'approved' ? 'default' : doc.status === 'rejected' ? 'destructive' : 'secondary'}>
                    {doc.status === 'approved' ? 'Aprovado' : doc.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4">
          {status.status === 'pending' && (
            <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>Aguarde a análise. Você será notificado por email quando houver uma resposta.</span>
            </div>
          )}

          {status.status === 'rejected' && onApplyAgain && (
            <Button onClick={onApplyAgain} variant="outline" className="flex-1">
              Enviar Nova Solicitação
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
