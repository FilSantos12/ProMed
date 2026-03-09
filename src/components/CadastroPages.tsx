import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { User, Stethoscope, FileText, Shield, Mail } from "lucide-react";
import { usePendingAppointment } from "../contexts/PendingAppointmentContext";
import api from "../services/api";
import { Modal } from "./ui/modal";
import { ErrorModal } from "./ui/error-modal";
import { TermsModal } from "./ui/terms-modal";
import { MaskedInput } from "./ui/masked-input";
import { LoadingSpinner } from "./ui/loading-spinner";
import { ProgressBar } from "./ui/progress-bar";
import { specialtyService, Specialty } from "../services/specialtyService";

interface CadastroPagesProps {
  type: "patient" | "professional";
  onSectionChange: (section: string) => void;
  prefilledData?: {
    name?: string;
    email?: string;
    cpf?: string;
    rg?: string;
    phone?: string;
    birthDate?: string;
    gender?: string;
  };
}

export function CadastroPages({
  type,
  onSectionChange,
  prefilledData,
}: CadastroPagesProps) {
  // Hooks
  const { pendingAppointment } = usePendingAppointment();

  // Estados do formulário
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: "",
    cpf: "",
    rg: "",
    birthDate: "",
    phone: "",
    email: "",
    confirmEmail: "",
    gender: "",
    password: "",
    confirmPassword: "",

    // Endereço
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",

    // Profissional específico
    crm: "",
    crmState: "",
    specialty: "",
    university: "",
    graduationYear: "",
    bio: "",
    consultationPrice: "",
    consultationDuration: "30",
    yearsExperience: "",

    // Responsável legal
    guardianName: "",
    guardianCpf: "",
    guardianEmail: "",
    guardianPhone: "",
    guardianAcceptTerms: false,

    // Termos
    acceptTerms: false,
    acceptPrivacy: false,

    // Estrangeiro
    passportNumber: "",
    passportCountry: "",
  });

  // Estrangeiro
  const [isForeigner, setIsForeigner] = useState(false);

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Modais
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUserName, setRegisteredUserName] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Email confirmation
  const [confirmEmailTouched, setConfirmEmailTouched] = useState(false);

  // Verificar se é menor de 18
  const isMinor = (() => {
    if (!formData.birthDate) return false;
    const birth = new Date(formData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    return age < 18;
  })();

  // CEP lookup
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  // Especialidades
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  // Documentos
  const [documents, setDocuments] = useState<{
    diploma: File | null;
    crm_document: File | null;
    specialization: File | null;
    rg_document: File | null;
    photo: File | null;
  }>({
    diploma: null,
    crm_document: null,
    specialization: null,
    rg_document: null,
    photo: null,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Validação de senha
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("As senhas não coincidem. Verifique e tente novamente.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Validação de email
    if (formData.email !== formData.confirmEmail) {
      setErrorMessage("Os emails não coincidem. Verifique e tente novamente.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Médico menor de 18 não pode se cadastrar
    if (isMinor && type === "professional") {
      setErrorMessage("O cadastro de médico é permitido apenas para maiores de 18 anos.");
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Validação do responsável legal (menor de 18)
    if (isMinor) {
      if (!formData.guardianName || !formData.guardianCpf || !formData.guardianEmail || !formData.guardianPhone) {
        setErrorMessage("Preencha todos os dados do responsável legal.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!formData.guardianAcceptTerms) {
        setErrorMessage("O responsável legal precisa aceitar o termo de responsabilidade.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
    }

    // Validação de estrangeiro
    if (isForeigner) {
      if (!formData.passportNumber.trim()) {
        setErrorMessage("O número do passaporte é obrigatório.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!formData.passportCountry.trim()) {
        setErrorMessage("O país de origem é obrigatório.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
    }

    // Validação dos termos
    if (!formData.acceptTerms || !formData.acceptPrivacy) {
      setErrorMessage(
        "Você precisa aceitar os termos e a política de privacidade"
      );
      setShowErrorModal(true);
      setLoading(false);
      return;
    }

    // Se for médico, validar documentos obrigatórios
    if (type === "professional") {
      if (!documents.diploma) {
        setErrorMessage("O diploma de medicina é obrigatório.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!documents.crm_document) {
        setErrorMessage("O comprovante de CRM é obrigatório.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      if (!documents.rg_document) {
        setErrorMessage(isForeigner ? "O passaporte é obrigatório." : "O documento de identidade (RG/CPF) é obrigatório.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
      // Foto só é obrigatória para cadastro inicial (não para paciente virando médico)
      if (!prefilledData && !documents.photo) {
        setErrorMessage("A foto 3x4 é obrigatória.");
        setShowErrorModal(true);
        setLoading(false);
        return;
      }
    }

    // ========================================
    // PREPARAR DADOS COM FORMDATA (para enviar arquivos)
    // ========================================
    let formDataToSend = new FormData();

    // Dados básicos (para todos os tipos de usuário)
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("password_confirmation", formData.confirmPassword);
    formDataToSend.append("is_foreigner", isForeigner ? "1" : "0");
    if (isForeigner) {
      formDataToSend.append("passport_number", formData.passportNumber);
      formDataToSend.append("passport_country", formData.passportCountry);
    } else {
      formDataToSend.append("cpf", formData.cpf);
      formDataToSend.append("rg", formData.rg || "");
    }
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("birth_date", formData.birthDate);
    formDataToSend.append("gender", formData.gender || "Outro");
    formDataToSend.append("role", type === "patient" ? "patient" : "doctor");

    // Dados do responsável legal (menor de 18)
    formDataToSend.append("is_minor", isMinor ? "true" : "false");
    if (isMinor) {
      formDataToSend.append("guardian_name",  formData.guardianName);
      formDataToSend.append("guardian_cpf",   formData.guardianCpf);
      formDataToSend.append("guardian_email", formData.guardianEmail);
      formDataToSend.append("guardian_phone", formData.guardianPhone);
    }

    // Dados de endereço (para todos os tipos de usuário)
    formDataToSend.append("cep", formData.cep || "");
    formDataToSend.append("address", formData.address || "");
    formDataToSend.append("number", formData.number || "");
    formDataToSend.append("complement", formData.complement || "");
    formDataToSend.append("neighborhood", formData.neighborhood || "");
    formDataToSend.append("city", formData.city || "");
    formDataToSend.append("state", formData.state || "");

    // Campos específicos do médico
    if (type === "professional") {
      formDataToSend.append("crm", formData.crm);
      formDataToSend.append("crm_state", formData.crmState);
      formDataToSend.append("specialty_id", formData.specialty);
      formDataToSend.append("bio", formData.bio || "");
      formDataToSend.append(
        "consultation_price",
        formData.consultationPrice || "0"
      );
      formDataToSend.append(
        "consultation_duration",
        formData.consultationDuration || "30"
      );
      formDataToSend.append("university", formData.university || "");
      formDataToSend.append("graduation_year", formData.graduationYear || "");
      formDataToSend.append(
        "years_experience",
        formData.yearsExperience || "0"
      );

      // ========================================
      // ADICIONAR ARQUIVOS
      // ========================================
      if (documents.diploma) {
        formDataToSend.append("diploma", documents.diploma);
      }
      if (documents.crm_document) {
        formDataToSend.append("crm_document", documents.crm_document);
      }
      if (documents.specialization) {
        formDataToSend.append("specialization", documents.specialization);
      }
      if (documents.rg_document) {
        formDataToSend.append("rg_document", documents.rg_document);
      }
      if (documents.photo) {
        formDataToSend.append("photo", documents.photo);
      }
    }

    try {
      // Escolher endpoint baseado no tipo de cadastro
      let endpoint = "/register";

      // Se for profissional e usuário já está logado (tem prefilledData), usar endpoint de aplicação
      if (type === "professional" && prefilledData) {
        endpoint = "/patient/apply-as-doctor";

        // Ajustar nomes dos documentos para o endpoint apply-as-doctor
        const applyFormData = new FormData();
        applyFormData.append("crm", formData.crm);
        applyFormData.append("crm_state", formData.crmState);
        applyFormData.append("specialty_id", formData.specialty);
        applyFormData.append("bio", formData.bio || "");
        applyFormData.append(
          "consultation_price",
          formData.consultationPrice || "0"
        );
        applyFormData.append(
          "consultation_duration",
          formData.consultationDuration || "30"
        );
        applyFormData.append(
          "years_experience",
          formData.yearsExperience || "0"
        );

        // Documentos com nomes corretos para o endpoint apply-as-doctor
        if (documents.diploma) {
          applyFormData.append("diploma_document", documents.diploma);
        }
        if (documents.crm_document) {
          applyFormData.append("crm_document", documents.crm_document);
        }
        if (documents.specialization) {
          applyFormData.append("specialization", documents.specialization);
        }
        if (documents.rg_document) {
          applyFormData.append("identity_document", documents.rg_document);
        }
        // Nota: photo não é enviado para apply-as-doctor pois o usuário já tem avatar

        formDataToSend = applyFormData;
      }

      await api.post(endpoint, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Salvar nome do usuário e abrir modal
      setRegisteredUserName(formData.name);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Erro completo:", err);
      console.error("Resposta do servidor:", err.response?.data);
      console.error("Status:", err.response?.status);

      let errorMsg = "Ocorreu um erro ao realizar o cadastro. Tente novamente.";

      // Mostrar erros de validação do backend
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;

        // Estrangeiro: ignorar erros de CPF, RG e telefone obrigatórios vindos do backend
        if (isForeigner) {
          delete errors.cpf;
          delete errors.rg;
          delete errors.phone;
        }

        // Mapeamento de erros do backend para português
        const errorTranslations: { [key: string]: string } = {
          // Unicidade
          "The cpf has already been taken.": "Este CPF já está cadastrado no sistema.",
          "The email has already been taken.": "Este e-mail já está cadastrado no sistema.",
          "The rg has already been taken.": "Este RG já está cadastrado no sistema.",
          "The phone has already been taken.": "Este telefone já está cadastrado no sistema.",
          "The crm has already been taken.": "Este CRM já está cadastrado no sistema.",
          "The passport number has already been taken.": "Este número de passaporte já está cadastrado no sistema.",
          // Obrigatórios
          "The name field is required.": "O nome completo é obrigatório.",
          "The email field is required.": "O e-mail é obrigatório.",
          "The password field is required.": "A senha é obrigatória.",
          "The phone field is required.": "O telefone é obrigatório.",
          "The cpf field is required.": "O CPF é obrigatório.",
          "The rg field is required.": "O RG é obrigatório.",
          "The birth date field is required.": "A data de nascimento é obrigatória.",
          "The birth_date field is required.": "A data de nascimento é obrigatória.",
          "The gender field is required.": "O gênero é obrigatório.",
          "The crm field is required.": "O CRM é obrigatório.",
          "The crm state field is required.": "O estado do CRM é obrigatório.",
          "The specialty field is required.": "A especialidade é obrigatória.",
          "The passport number field is required.": "O número do passaporte é obrigatório.",
          "The passport country field is required.": "O país de origem é obrigatório.",
          "The role field is required.": "O tipo de cadastro é obrigatório.",
          // Condicionais profissional
          "The crm state field is required when role is professional.": "O estado do CRM é obrigatório para profissionais.",
          "The crm document field is required when role is professional.": "O comprovante de CRM é obrigatório.",
          "The photo field is required when role is professional.": "A foto 3x4 é obrigatória.",
          // Formato / tamanho
          "The email field must be a valid email address.": "Informe um e-mail válido.",
          "The password field must be at least 8 characters.": "A senha deve ter no mínimo 8 caracteres.",
          "The password must be at least 8 characters.": "A senha deve ter no mínimo 8 caracteres.",
          "The password confirmation does not match.": "A confirmação de senha não confere.",
          "The password field confirmation does not match.": "A confirmação de senha não confere.",
          "The cpf field must be 11 digits.": "O CPF deve ter 11 dígitos.",
          "The cpf field format is invalid.": "Formato de CPF inválido.",
          "The phone field must be a valid phone number.": "Número de telefone inválido.",
          "The birth date field must be a valid date.": "Data de nascimento inválida.",
          "The birth_date field must be a valid date.": "Data de nascimento inválida.",
          "The graduation year field must be a number.": "O ano de formação deve ser um número.",
          "The graduation_year field must be a number.": "O ano de formação deve ser um número.",
          "The consultation price field must be a number.": "O valor da consulta deve ser numérico.",
          "The consultation_price field must be a number.": "O valor da consulta deve ser numérico.",
          "The name field must not be greater than 255 characters.": "O nome não pode ter mais de 255 caracteres.",
          "The bio field must not be greater than 1000 characters.": "A biografia não pode ter mais de 1000 caracteres.",
          // Arquivo
          "The rg document field is required.": "O documento de identidade é obrigatório.",
          "The rg_document field is required.": "O documento de identidade é obrigatório.",
          "The diploma field is required.": "O diploma é obrigatório.",
          "The crm document field is required.": "O comprovante de CRM é obrigatório.",
          "The crm_document field is required.": "O comprovante de CRM é obrigatório.",
          "The photo must be an image.": "A foto deve ser uma imagem (JPG, PNG).",
          "The file size must not exceed 5MB.": "O arquivo não pode ultrapassar 5MB.",
        };

        if (Object.keys(errors).length === 0) {
          // Todos os erros eram de campos ignorados (ex: CPF/RG/telefone para estrangeiros)
          // Cadastro pode ter falhado por outro motivo — mostrar mensagem genérica
          setErrorMessage("Ocorreu um erro ao realizar o cadastro. Verifique os dados e tente novamente.");
          setShowErrorModal(true);
          setLoading(false);
          return;
        }

        const firstErrorKey = Object.keys(errors)[0];
        const firstErrorArray = errors[firstErrorKey];
        const firstErrorMessage = Array.isArray(firstErrorArray)
          ? firstErrorArray[0]
          : firstErrorArray;

        // Tentar traduzir pelo mapeamento exato; se não encontrar, usar tradução genérica por padrão
        if (errorTranslations[firstErrorMessage]) {
          errorMsg = errorTranslations[firstErrorMessage];
        } else if (firstErrorMessage.includes("has already been taken")) {
          errorMsg = "Este valor já está em uso. Por favor, utilize outro.";
        } else if (firstErrorMessage.includes("field is required")) {
          errorMsg = "Há campos obrigatórios não preenchidos. Verifique o formulário.";
        } else if (firstErrorMessage.includes("must be at least")) {
          errorMsg = "Um ou mais campos não atendem ao tamanho mínimo exigido.";
        } else if (firstErrorMessage.includes("must be a valid email")) {
          errorMsg = "Informe um e-mail válido.";
        } else if (firstErrorMessage.includes("does not match")) {
          errorMsg = "A confirmação de senha não confere.";
        } else {
          errorMsg = firstErrorMessage;
        }
      }

      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Pré-preencher dados do agendamento pendente se houver
  useEffect(() => {
    if (type === "patient" && pendingAppointment) {
      setFormData((prev) => ({
        ...prev,
        name: pendingAppointment.patient_name || prev.name,
        cpf: pendingAppointment.patient_cpf || prev.cpf,
        phone: pendingAppointment.patient_phone || prev.phone,
        email: pendingAppointment.patient_email || prev.email,
      }));
    }
  }, [pendingAppointment, type]);

  // Preencher dados básicos quando prefilledData for fornecido
  useEffect(() => {
    if (prefilledData) {
      setFormData((prev) => ({
        ...prev,
        name: prefilledData.name || prev.name,
        email: prefilledData.email || prev.email,
        confirmEmail: prefilledData.email || prev.confirmEmail,
        cpf: prefilledData.cpf || prev.cpf,
        rg: prefilledData.rg || prev.rg,
        phone: prefilledData.phone || prev.phone,
        birthDate: prefilledData.birthDate || prev.birthDate,
        gender: prefilledData.gender || prev.gender,
      }));
    }
  }, [prefilledData]);

  // Verificar se campo foi pré-preenchido e deve ser desabilitado
  const isFieldPrefilled = (field: keyof NonNullable<typeof prefilledData>) => {
    return (
      prefilledData &&
      prefilledData[field] !== undefined &&
      prefilledData[field] !== ""
    );
  };

  // Handler para mudança de arquivos
  const handleFileChange = (field: string, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [field]: file }));
  };

  // Buscar endereço pelo CEP via ViaCEP
  useEffect(() => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length !== 8) {
      setCepError(null);
      return;
    }

    const fetchCep = async () => {
      try {
        setLoadingCep(true);
        setCepError(null);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
          setCepError('CEP não encontrado.');
          return;
        }

        setFormData((prev) => ({
          ...prev,
          address: data.logradouro || prev.address,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      } catch {
        setCepError('Erro ao buscar CEP. Tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    };

    fetchCep();
  }, [formData.cep]);

  // Buscar especialidades ao montar o componente
  useEffect(() => {
    const fetchSpecialties = async () => {
      setLoadingSpecialties(true);
      try {
        const data = await specialtyService.getAll();
        setSpecialties(data);
      } catch (error) {
      } finally {
        setLoadingSpecialties(false);
      }
    };

    fetchSpecialties();
  }, []);

  const states = [
    "AC",
    "AL",
    "AP",
    "AM",
    "BA",
    "CE",
    "DF",
    "ES",
    "GO",
    "MA",
    "MT",
    "MS",
    "MG",
    "PA",
    "PB",
    "PR",
    "PE",
    "PI",
    "RJ",
    "RN",
    "RS",
    "RO",
    "RR",
    "SC",
    "SP",
    "SE",
    "TO",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {type === "patient" ? (
              <User className="w-12 h-12 text-blue-600" />
            ) : (
              <Stethoscope className="w-12 h-12 text-blue-600" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {type === "patient"
              ? "Cadastro de Paciente"
              : "Cadastro de Profissional"}
          </h1>
          <p className="text-gray-600">
            {type === "patient"
              ? "Crie sua conta para agendar consultas e acompanhar seu histórico médico"
              : "Junte-se à nossa equipe de profissionais qualificados"}
          </p>
        </div>
        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Formulário de Cadastro</span>
            </CardTitle>
            <CardDescription>
              Preencha todos os campos obrigatórios (*) para concluir seu
              cadastro
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-8">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Dados Pessoais</span>
                </h3>

                {/* Checkbox Estrangeiro */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isForeigner"
                    checked={isForeigner}
                    onCheckedChange={(checked) => {
                      setIsForeigner(!!checked);
                      handleInputChange("cpf", "");
                      handleInputChange("rg", "");
                      handleInputChange("passportNumber", "");
                      handleInputChange("passportCountry", "");
                    }}
                  />
                  <Label htmlFor="isForeigner" className="cursor-pointer font-normal text-gray-700">
                    Sou estrangeiro (não possuo CPF brasileiro)
                  </Label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Digite seu nome completo"
                      required
                      disabled={isFieldPrefilled("name")}
                      className={
                        isFieldPrefilled("name")
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </div>
                  {!isForeigner ? (
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <MaskedInput
                        mask="000.000.000-00"
                        value={formData.cpf}
                        onChange={(value) => handleInputChange("cpf", value)}
                        id="cpf"
                        placeholder="000.000.000-00"
                        required
                        disabled={isFieldPrefilled("cpf")}
                        className={
                          isFieldPrefilled("cpf")
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="passportNumber">Número do Passaporte *</Label>
                      <Input
                        id="passportNumber"
                        value={formData.passportNumber}
                        onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                        placeholder="Ex: AB123456"
                        required
                        maxLength={20}
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {!isForeigner ? (
                    <div className="space-y-2">
                      <Label htmlFor="rg">RG *</Label>
                      <MaskedInput
                        mask="00.000.000-0"
                        value={formData.rg}
                        onChange={(value) => handleInputChange("rg", value)}
                        id="rg"
                        placeholder="00.000.000-0"
                        required
                        disabled={isFieldPrefilled("rg")}
                        className={
                          isFieldPrefilled("rg")
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="passportCountry">País de Origem *</Label>
                      <Input
                        id="passportCountry"
                        value={formData.passportCountry}
                        onChange={(e) => handleInputChange("passportCountry", e.target.value)}
                        placeholder="Ex: Estados Unidos"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        handleInputChange("birthDate", e.target.value)
                      }
                      required
                      disabled={isFieldPrefilled("birthDate")}
                      className={
                        isFieldPrefilled("birthDate")
                          ? "bg-gray-100 cursor-not-allowed"
                          : isMinor && type === "professional"
                          ? "border-red-400"
                          : ""
                      }
                    />
                    {isMinor && type === "professional" && (
                      <p className="text-xs text-red-600 font-medium">
                        O cadastro de médico é permitido apenas para maiores de 18 anos.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Telefone {!isForeigner && "*"}
                      {isForeigner && <span className="text-sm font-normal text-gray-400 ml-1">(opcional)</span>}
                    </Label>
                    {isForeigner ? (
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        disabled={isFieldPrefilled("phone")}
                        className={isFieldPrefilled("phone") ? "bg-gray-100 cursor-not-allowed" : ""}
                      />
                    ) : (
                      <MaskedInput
                        mask="(00) 00000-0000"
                        value={formData.phone}
                        onChange={(value) => handleInputChange("phone", value)}
                        id="phone"
                        placeholder="(11) 99999-9999"
                        required
                        disabled={isFieldPrefilled("phone")}
                        className={isFieldPrefilled("phone") ? "bg-gray-100 cursor-not-allowed" : ""}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gênero *</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value: string) =>
                        handleInputChange("gender", value)
                      }
                      disabled={isFieldPrefilled("gender")}
                    >
                      <SelectTrigger
                        className={
                          isFieldPrefilled("gender")
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="seu@email.com"
                      required
                      disabled={isFieldPrefilled("email")}
                      className={
                        isFieldPrefilled("email")
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail">Confirmar Email *</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={formData.confirmEmail}
                      onChange={(e) =>
                        handleInputChange("confirmEmail", e.target.value)
                      }
                      onBlur={() => setConfirmEmailTouched(true)}
                      placeholder="Confirme seu@email.com"
                      required
                      disabled={isFieldPrefilled("email")}
                      className={
                        isFieldPrefilled("email")
                          ? "bg-gray-100 cursor-not-allowed"
                          : confirmEmailTouched &&
                              formData.confirmEmail &&
                              formData.email !== formData.confirmEmail
                            ? "border-red-500 focus:ring-red-500"
                            : confirmEmailTouched &&
                                formData.confirmEmail &&
                                formData.email === formData.confirmEmail
                              ? "border-green-500 focus:ring-green-500"
                              : ""
                      }
                    />
                    {!isFieldPrefilled("email") &&
                      confirmEmailTouched &&
                      formData.confirmEmail &&
                      formData.email !== formData.confirmEmail && (
                        <p className="text-sm text-red-600">
                          Os emails estão diferentes
                        </p>
                      )}
                    {!isFieldPrefilled("email") &&
                      confirmEmailTouched &&
                      formData.confirmEmail &&
                      formData.email === formData.confirmEmail && (
                        <p className="text-sm text-green-600">
                          ✓ Correto, os emails são iguais
                        </p>
                      )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Mínimo 8 caracteres"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <p className="text-sm text-gray-500"></p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Digite a senha novamente"
                    required
                    disabled={loading}
                    minLength={8}
                    className={
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : formData.confirmPassword &&
                            formData.password === formData.confirmPassword
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                    }
                  />
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600">
                        As senhas não são iguais
                      </p>
                    )}
                  {formData.confirmPassword &&
                    formData.password === formData.confirmPassword && (
                      <p className="text-sm text-green-600">
                        ✓ Correto, as senhas são iguais
                      </p>
                    )}
                </div>
              </div>

              <Separator />

              {/* Endereço */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span>Endereço <span className="text-sm font-normal text-gray-400">(opcional)</span></span>
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="relative">
                      <MaskedInput
                        mask="00000-000"
                        value={formData.cep}
                        onChange={(value) => handleInputChange("cep", value)}
                        id="cep"
                        placeholder="00000-000"
                      />
                      {loadingCep && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <LoadingSpinner size="sm" />
                        </div>
                      )}
                    </div>
                    {cepError && (
                      <p className="text-xs text-red-500">{cepError}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      placeholder="Rua, Avenida, etc."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={formData.number}
                      onChange={(e) =>
                        handleInputChange("number", e.target.value)
                      }
                      placeholder="123"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={formData.complement}
                      onChange={(e) =>
                        handleInputChange("complement", e.target.value)
                      }
                      placeholder="Apto, Bloco, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) =>
                        handleInputChange("neighborhood", e.target.value)
                      }
                      placeholder="Nome do bairro"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value: string) =>
                        handleInputChange("state", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>
              </div>

              {/* Dados Profissionais (apenas para médicos) */}
              {type === "professional" && (
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
                        <MaskedInput
                          mask="000000"
                          value={formData.crm}
                          onChange={(value) =>
                            handleInputChange("crm", value.toUpperCase())
                          }
                          id="crm"
                          placeholder="123456"
                          required
                        />
                      </div>

                      {/* Estado do CRM */}
                      <div className="space-y-2">
                        <Label htmlFor="crmState">Estado do CRM *</Label>
                        <select
                          id="crmState"
                          aria-label="Estado do CRM"
                          value={formData.crmState}
                          onChange={(e) =>
                            handleInputChange("crmState", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Selecione</option>
                          <option value="AC">AC - Acre</option>
                          <option value="AL">AL - Alagoas</option>
                          <option value="AP">AP - Amapá</option>
                          <option value="AM">AM - Amazonas</option>
                          <option value="BA">BA - Bahia</option>
                          <option value="CE">CE - Ceará</option>
                          <option value="DF">DF - Distrito Federal</option>
                          <option value="ES">ES - Espírito Santo</option>
                          <option value="GO">GO - Goiás</option>
                          <option value="MA">MA - Maranhão</option>
                          <option value="MT">MT - Mato Grosso</option>
                          <option value="MS">MS - Mato Grosso do Sul</option>
                          <option value="MG">MG - Minas Gerais</option>
                          <option value="PA">PA - Pará</option>
                          <option value="PB">PB - Paraíba</option>
                          <option value="PR">PR - Paraná</option>
                          <option value="PE">PE - Pernambuco</option>
                          <option value="PI">PI - Piauí</option>
                          <option value="RJ">RJ - Rio de Janeiro</option>
                          <option value="RN">RN - Rio Grande do Norte</option>
                          <option value="RS">RS - Rio Grande do Sul</option>
                          <option value="RO">RO - Rondônia</option>
                          <option value="RR">RR - Roraima</option>
                          <option value="SC">SC - Santa Catarina</option>
                          <option value="SP">SP - São Paulo</option>
                          <option value="SE">SE - Sergipe</option>
                          <option value="TO">TO - Tocantins</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade *</Label>
                        <Select
                          value={formData.specialty}
                          onValueChange={(value: string) =>
                            handleInputChange("specialty", value)
                          }
                          disabled={loadingSpecialties}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                loadingSpecialties
                                  ? "Carregando especialidades..."
                                  : "Selecione a especialidade"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((spec) => (
                              <SelectItem key={spec.id} value={String(spec.id)}>
                                {spec.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {specialties.length === 0 && !loadingSpecialties && (
                          <p className="text-sm text-red-600">
                            Erro ao carregar especialidades. Recarregue a
                            página.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="university">
                          Universidade de Formação *
                        </Label>
                        <Input
                          id="university"
                          value={formData.university}
                          onChange={(e) =>
                            handleInputChange("university", e.target.value)
                          }
                          placeholder="Nome da universidade"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">
                          Ano de Formação *
                        </Label>
                        <Input
                          id="graduationYear"
                          type="number"
                          value={formData.graduationYear}
                          onChange={(e) =>
                            handleInputChange("graduationYear", e.target.value)
                          }
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
                        onChange={(e) =>
                          handleInputChange("bio", e.target.value)
                        }
                        placeholder="Descreva sua experiência, especialização e formação complementar..."
                        rows={4}
                      />
                    </div>

                    {/* Diploma de Medicina */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="diploma"
                        className="flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Diploma de Medicina *</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <input
                          id="diploma"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "diploma",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="diploma"
                          className="cursor-pointer block text-center"
                        >
                          {documents.diploma ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {documents.diploma.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(documents.diploma.size / 1024 / 1024).toFixed(
                                  2
                                )}{" "}
                                MB
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFileChange("diploma", null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FileText className="w-12 h-12 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-600">
                                  Clique para enviar
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG ou PNG (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Comprovante de CRM */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="crm_document"
                        className="flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Comprovante de CRM *</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <input
                          id="crm_document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "crm_document",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="crm_document"
                          className="cursor-pointer block text-center"
                        >
                          {documents.crm_document ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {documents.crm_document.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  documents.crm_document.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFileChange("crm_document", null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FileText className="w-12 h-12 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-600">
                                  Clique para enviar
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG ou PNG (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    {/* Comprovante de Especialização (opcional) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="specialization"
                        className="flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Comprovante de Especialização (opcional)</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <input
                          id="specialization"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "specialization",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor="specialization"
                          className="cursor-pointer block text-center"
                        >
                          {documents.specialization ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {documents.specialization.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  documents.specialization.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFileChange("specialization", null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FileText className="w-12 h-12 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-600">
                                  Clique para enviar
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG ou PNG (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* RG/CPF (opcional) */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="rg_document"
                        className="flex items-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>{isForeigner ? "Passaporte (opcional)" : "RG ou CPF (opcional)"}</span>
                      </Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                        <input
                          id="rg_document"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleFileChange(
                              "rg_document",
                              e.target.files?.[0] || null
                            )
                          }
                          className="hidden"
                        />
                        <label
                          htmlFor="rg_document"
                          className="cursor-pointer block text-center"
                        >
                          {documents.rg_document ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-center">
                                <FileText className="w-8 h-8 text-green-600" />
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {documents.rg_document.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  documents.rg_document.size /
                                  1024 /
                                  1024
                                ).toFixed(2)}{" "}
                                MB
                              </p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleFileChange("rg_document", null);
                                }}
                              >
                                Remover
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <FileText className="w-12 h-12 mx-auto text-gray-400" />
                              <p className="text-sm text-gray-600">
                                <span className="font-semibold text-blue-600">
                                  Clique para enviar
                                </span>
                              </p>
                              <p className="text-xs text-gray-500">
                                PDF, JPG ou PNG (máx. 5MB)
                              </p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Foto 3x4 - apenas para cadastro inicial, não para paciente virando médico */}
                    {!prefilledData && (
                      <div className="space-y-2">
                        <Label
                          htmlFor="photo"
                          className="flex items-center space-x-2"
                        >
                          <User className="w-4 h-4" />
                          <span>Foto 3x4 *</span>
                        </Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors">
                          <input
                            id="photo"
                            type="file"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) =>
                              handleFileChange(
                                "photo",
                                e.target.files?.[0] || null
                              )
                            }
                            className="hidden"
                            required={!prefilledData}
                          />
                          <label
                            htmlFor="photo"
                            className="cursor-pointer block text-center"
                          >
                            {documents.photo ? (
                              <div className="space-y-2">
                                {documents.photo.type.startsWith("image/") && (
                                  <img
                                    src={URL.createObjectURL(documents.photo)}
                                    alt="Preview"
                                    className="mx-auto h-24 w-24 object-cover rounded-lg"
                                  />
                                )}
                                <p className="text-sm font-medium text-gray-900">
                                  {documents.photo.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(documents.photo.size / 1024 / 1024).toFixed(
                                    2
                                  )}{" "}
                                  MB
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFileChange("photo", null);
                                  }}
                                >
                                  Remover
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <User className="w-12 h-12 mx-auto text-gray-400" />
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold text-blue-600">
                                    Clique para enviar
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500">
                                  JPG ou PNG (máx. 5MB)
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Responsável Legal (apenas para menores de 18) */}
              {isMinor && type === "patient" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">
                        <strong>Cadastro de menor de idade:</strong> É obrigatório informar os dados do responsável legal e obter o seu consentimento.
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <span>Responsável Legal</span>
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardianName">Nome completo do responsável *</Label>
                        <Input
                          id="guardianName"
                          value={formData.guardianName}
                          onChange={(e) => handleInputChange("guardianName", e.target.value)}
                          placeholder="Nome do responsável"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardianCpf">CPF do responsável *</Label>
                        <MaskedInput
                          mask="000.000.000-00"
                          value={formData.guardianCpf}
                          onChange={(value) => handleInputChange("guardianCpf", value)}
                          id="guardianCpf"
                          placeholder="000.000.000-00"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="guardianEmail">E-mail do responsável *</Label>
                        <Input
                          id="guardianEmail"
                          type="email"
                          value={formData.guardianEmail}
                          onChange={(e) => handleInputChange("guardianEmail", e.target.value)}
                          placeholder="email@responsavel.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="guardianPhone">Telefone do responsável *</Label>
                        <MaskedInput
                          mask="(00) 00000-0000"
                          value={formData.guardianPhone}
                          onChange={(value) => handleInputChange("guardianPhone", value)}
                          id="guardianPhone"
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <Checkbox
                        id="guardianTerms"
                        checked={formData.guardianAcceptTerms}
                        onCheckedChange={(checked: boolean | "indeterminate") =>
                          handleInputChange("guardianAcceptTerms", checked === true)
                        }
                        required
                      />
                      <Label htmlFor="guardianTerms" className="text-sm leading-relaxed">
                        Declaro ser responsável legal pelo menor e autorizo o cadastro e uso da plataforma ProMed,
                        responsabilizando-me pelas informações fornecidas e pelo acompanhamento das consultas agendadas.
                      </Label>
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
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleInputChange("acceptTerms", checked === true)
                      }
                      required
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      Aceito os{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Termos de Uso
                      </button>{" "}
                      e confirmo que li e compreendi todas as condições.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="privacy"
                      checked={formData.acceptPrivacy}
                      onCheckedChange={(checked: boolean | "indeterminate") =>
                        handleInputChange("acceptPrivacy", checked === true)
                      }
                      required
                    />
                    <Label
                      htmlFor="privacy"
                      className="text-sm leading-relaxed"
                    >
                      Aceito a{" "}
                      <button
                        type="button"
                        onClick={() => setShowPrivacyModal(true)}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        Política de Privacidade
                      </button>{" "}
                      e autorizo o tratamento dos meus dados pessoais conforme
                      descrito.
                    </Label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                {loading && type === "professional" && (
                  <div className="mt-4">
                    <ProgressBar
                      progress={uploadProgress}
                      label="Enviando documentos"
                    />
                  </div>
                )}
                <Button
                  type="button"
                  className="flex-1"
                  disabled={
                    !formData.acceptTerms || !formData.acceptPrivacy || loading
                  }
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    handleRegister(e as any);
                  }}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Cadastrando...</span>
                    </div>
                  ) : type === "patient" ? (
                    "Criar Conta de Paciente"
                  ) : (
                    "Solicitar Cadastro Profissional"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        {type === "professional" && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="space-y-4 text-center">
                <Shield className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="font-medium text-gray-900">
                  Processo de Verificação
                </h4>
                <p className="text-sm text-gray-600">
                  Seu cadastro passará por um processo de verificação que inclui
                  validação de documentos e credenciais profissionais. Este
                  processo leva até 48 horas úteis.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Documentos necessários:</strong> CRM ativo, diploma
                    de graduação, certificados de especialização (se aplicável).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Erro */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />

      {/* Modal de Sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onSectionChange("login");
        }}
        title={
          type === "patient"
            ? "🎉 Bem-vindo à ProMed!"
            : "🩺 Cadastro Profissional Enviado!"
        }
      >
        <div className="space-y-4">
          {type === "patient" ? (
            <>
              <p className="text-lg">
                Olá, <strong>{registeredUserName}</strong>!
              </p>
              <p>Seu cadastro foi realizado com sucesso!</p>
              <p className="text-sm text-gray-500">
                Agora você pode fazer login e agendar suas consultas.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg">
                Olá, <strong>Dr(a). {registeredUserName}</strong>!
              </p>
              <p>Sua solicitação de cadastro foi enviada com sucesso!</p>
              <p className="text-sm text-gray-500">
                Nossa equipe irá analisar seus dados e você receberá um email
                quando seu cadastro for aprovado.
              </p>
            </>
          )}

          <div className="pt-4">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                onSectionChange("login");
              }}
              className="w-full"
            >
              {type === "patient" ? "Fazer Login" : "Entendi"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Termos de Uso */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        type="terms"
      />

      {/* Modal de Política de Privacidade */}
      <TermsModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        type="privacy"
      />
    </div>
  );
}
