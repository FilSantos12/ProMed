import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';
import { User, Stethoscope, FileText, Shield, Mail, Upload, Image, X } from 'lucide-react';

interface CadastroPagesProps {
  type: 'patient' | 'professional';
  onSectionChange: (section: string) => void;
}

export function CadastroPages({ type, onSectionChange }: CadastroPagesProps) {
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: '',
    cpf: '',
    rg: '',
    birthDate: '',
    phone: '',
    email: '',
    
    // Endereço
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    
    // Profissional específico
    crm: '',
    specialty: '',
    university: '',
    graduationYear: '',
    bio: '',
    
    // Termos
    acceptTerms: false,
    acceptPrivacy: false
  });

  const [diplomas, setDiplomas] = useState<File[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDiplomasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDiplomas(prev => [...prev, ...files]);
  };

  const handleCertificatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setCertificates(prev => [...prev, ...files]);
  };

  const removeDiploma = (index: number) => {
    setDiplomas(prev => prev.filter((_, i) => i !== index));
  };

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      alert('Você deve aceitar os termos de uso e política de privacidade.');
      return;
    }

    // Aqui seria feita a integração com o backend
    alert(`Cadastro realizado com sucesso! ${type === 'patient' ? 'Você já pode agendar consultas.' : 'Seu cadastro será analisado em até 48h.'}`);
    
    // Redirect to login
    onSectionChange('login');
  };

  const especialidades = [
    'Cardiologia',
    'Neurologia',
    'Oftalmologia',
    'Ortopedia',
    'Pediatria',
    'Clínica Geral',
    'Endocrinologia',
    'Pneumologia',
    'Ginecologia',
    'Urologia',
    'Dermatologia',
    'Psiquiatria'
  ];

  const states = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {type === 'patient' ? (
              <User className="w-12 h-12 text-blue-600" />
            ) : (
              <Stethoscope className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === 'patient' ? 'Cadastro de Paciente' : 'Cadastro de Profissional'}
          </h1>
          <p className="text-gray-600">
            {type === 'patient' 
              ? 'Crie sua conta para agendar consultas e acompanhar seu histórico médico'
              : 'Junte-se à nossa equipe de profissionais qualificados'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Formulário de Cadastro</span>
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios (*) para concluir seu cadastro
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Dados Pessoais</span>
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

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG *</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => handleInputChange('rg', e.target.value)}
                      placeholder="00.000.000-0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      required
                    />
                  </div>
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

              <Separator />

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Endereço</span>
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => handleInputChange('cep', e.target.value)}
                      placeholder="00000-000"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, Avenida, etc."
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número *</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) => handleInputChange('number', e.target.value)}
                      placeholder="123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={formData.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                      placeholder="Nome do bairro"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleInputChange('state', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Nome da cidade"
                    required
                  />
                </div>
              </div>

              {/* Dados Profissionais (apenas para médicos) */}
              {type === 'professional' && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Stethoscope className="w-5 h-5 text-blue-600" />
                      <span>Dados Profissionais</span>
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="crm">CRM *</Label>
                        <Input
                          id="crm"
                          value={formData.crm}
                          onChange={(e) => handleInputChange('crm', e.target.value)}
                          placeholder="CRM 12345-SP"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade *</Label>
                        <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
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
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="university">Universidade de Formação *</Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) => handleInputChange('university', e.target.value)}
                          placeholder="Nome da universidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Ano de Formação *</Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                          placeholder="2020"
                          min="1950"
                          max={new Date().getFullYear()}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Biografia Profissional</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Descreva sua experiência, especialização e formação complementar..."
                        rows={4}
                      />
                    </div>

                    {/* Upload de Diplomas */}
                    <div className="space-y-2">
                      <Label htmlFor="diplomas">Diplomas *</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <Label 
                          htmlFor="diplomas" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Clique para fazer upload dos diplomas
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG ou PNG (máx. 10MB cada)
                          </span>
                        </Label>
                        <Input
                          id="diplomas"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleDiplomasChange}
                          className="hidden"
                        />
                      </div>
                      {diplomas.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {diplomas.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDiploma(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Upload de Certificados */}
                    <div className="space-y-2">
                      <Label htmlFor="certificates">Certificados e Especializações</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <Label 
                          htmlFor="certificates" 
                          className="cursor-pointer flex flex-col items-center justify-center gap-2"
                        >
                          <Upload className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Clique para fazer upload dos certificados
                          </span>
                          <span className="text-xs text-gray-500">
                            PDF, JPG ou PNG (máx. 10MB cada)
                          </span>
                        </Label>
                        <Input
                          id="certificates"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          multiple
                          onChange={handleCertificatesChange}
                          className="hidden"
                        />
                      </div>
                      {certificates.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {certificates.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCertificate(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Termos e Condições */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>Termos e Condições</span>
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => handleInputChange('acceptTerms', checked as boolean)}
                      required
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Aceito os <button type="button" className="text-blue-600 hover:underline">Termos de Uso</button> e 
                      confirmo que li e compreendi todas as condições.
                    </Label>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="privacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked) => handleInputChange('acceptPrivacy', checked as boolean)}
                      required
                    />
                    <Label htmlFor="privacy" className="text-sm leading-relaxed">
                      Aceito a <button type="button" className="text-blue-600 hover:underline">Política de Privacidade</button> e 
                      autorizo o tratamento dos meus dados pessoais conforme descrito.
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => onSectionChange('login')}
                >
                  Já tenho conta
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={!formData.acceptTerms || !formData.acceptPrivacy}
                >
                  {type === 'patient' ? 'Criar Conta de Paciente' : 'Solicitar Cadastro Profissional'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        {type === 'professional' && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <Shield className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="font-medium text-gray-900">Processo de Verificação</h4>
                <p className="text-sm text-gray-600">
                  Seu cadastro passará por um processo de verificação que inclui validação de documentos 
                  e credenciais profissionais. Este processo leva até 48 horas úteis.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Documentos necessários:</strong> CRM ativo, diploma de graduação, 
                    certificados de especialização (se aplicável).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}