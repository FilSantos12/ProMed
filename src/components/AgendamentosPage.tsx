import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { CalendarIcon, Clock, User, FileText } from 'lucide-react';

export function AgendamentosPage() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    email: '',
    observations: ''
  });

  const especialidades = [
    'Cardiologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Clínica Geral',
    'Endocrinologia'
  ];

  const medicos = {
    'Cardiologia': ['Dr. João Santos', 'Dra. Maria Silva', 'Dr. Pedro Costa'],
    'Neurologia': ['Dr. Carlos Oliveira', 'Dra. Ana Santos'],
    'Oftalmologia': ['Dr. Roberto Lima', 'Dra. Julia Ferreira'],
    'Ortopedia': ['Dr. Marcos Souza', 'Dra. Lucia Costa'],
    'Pediatria': ['Dra. Ana Costa', 'Dr. Rafael Silva'],
    'Clínica Geral': ['Dr. Roberto Silva', 'Dra. Carla Santos'],
    'Endocrinologia': ['Dra. Patricia Lima']
  };

  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria feita a integração com o backend
    alert('Agendamento realizado com sucesso! Você receberá uma confirmação por email.');
    
    // Reset form
    setSelectedDate(undefined);
    setSelectedTime('');
    setSelectedSpecialty('');
    setSelectedDoctor('');
    setFormData({
      name: '',
      cpf: '',
      phone: '',
      email: '',
      observations: ''
    });
  };

  const isFormValid = selectedDate && selectedTime && selectedSpecialty && selectedDoctor && 
                     formData.name && formData.cpf && formData.phone && formData.email;

  // Format date for display
  const formatDateDisplay = (date: Date | undefined) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setSelectedDate(new Date(dateValue + 'T00:00:00'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Agendamento de Consultas
          </h1>
          <p className="text-lg text-gray-600">
            Agende sua consulta de forma rápida e fácil. Escolha o especialista, data e horário que melhor se adequam à sua necessidade.
          </p>
        </div>

        {/* Agendamento Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <span>Nova Consulta</span>
            </CardTitle>
            <CardDescription>
              Preencha todos os campos para agendar sua consulta
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Especialidade e Médico */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade *</Label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {especialidades.map((esp) => (
                        <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="doctor">Médico *</Label>
                  <Select 
                    value={selectedDoctor} 
                    onValueChange={setSelectedDoctor}
                    disabled={!selectedSpecialty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o médico" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedSpecialty && medicos[selectedSpecialty as keyof typeof medicos]?.map((med) => (
                        <SelectItem key={med} value={med}>{med}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Data e Horário */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Data da Consulta *</Label>
                  <div className="relative">
                    <Input
                      id="date"
                      type="date"
                      min={getMinDate()}
                      max={getMaxDate()}
                      onChange={handleDateChange}
                      className="w-full"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Atendemos de segunda a domingo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      {horarios.map((hora) => (
                        <SelectItem key={hora} value={hora}>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{hora}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dados do Paciente */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Dados do Paciente</span>
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleInputChange('cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleInputChange('observations', e.target.value)}
                    placeholder="Descreva sintomas, medicamentos em uso ou outras informações relevantes..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Resumo do Agendamento */}
              {(selectedDate || selectedTime || selectedSpecialty || selectedDoctor) && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Resumo do Agendamento:</h4>
                  <div className="space-y-2 text-sm">
                    {selectedSpecialty && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{selectedSpecialty}</Badge>
                      </div>
                    )}
                    {selectedDoctor && (
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span>{selectedDoctor}</span>
                      </div>
                    )}
                    {selectedDate && (
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-blue-600" />
                        <span>{formatDateDisplay(selectedDate)}</span>
                      </div>
                    )}
                    {selectedTime && (
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span>{selectedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full"
                disabled={!isFormValid}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Informações Importantes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Informações Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Documentos Necessários:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• RG ou CNH</li>
                  <li>• CPF</li>
                  <li>• Carteirinha do convênio (se houver)</li>
                  <li>• Exames anteriores relacionados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Política de Cancelamento:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Cancelamento até 24h antes: sem cobrança</li>
                  <li>• Cancelamento com menos de 24h: taxa aplicável</li>
                  <li>• Reagendamento gratuito até 3x</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Chegue com 15 minutos de antecedência. 
                Você receberá uma confirmação por email e SMS com todos os detalhes da consulta.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}