import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { LogIn } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { usePendingAppointment } from "../contexts/PendingAppointmentContext";
import { LoadingSpinner } from "./ui/loading-spinner";
import { ErrorModal } from "./ui/error-modal";
import { SuccessModal } from "./ui/success-modal";
import { StatusModal } from "./ui/status-modal";
import { ValidatedInput } from "./ValidatedInput";
import { useFormValidation } from "../hooks/useFormValidation";
import { validateEmail, validatePassword } from "../utils/validators";
import { useToast } from "../contexts/ToastContext";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

interface LoginPageProps {
  onSectionChange: (section: string) => void;
}

export function LoginPage({ onSectionChange }: LoginPageProps) {
  const { login } = useAuth();
  const toast = useToast();
  const { hasPendingAppointment, completePendingAppointment } =
    usePendingAppointment();

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusInfo, setStatusInfo] = useState<{
    status: "pending" | "rejected" | "inactive" | "error";
    message: string;
    rejectionNotes?: string;
  } | null>(null);

  const {
    errors,
    validateField,
    handleBlur,
    validateAll,
    shouldShowError,
    isFieldValid,
  } = useFormValidation({
    email: { validate: validateEmail },
    password: { validate: validatePassword },
  });

  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage("");
    validateField(field, value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateAll(loginData);
    if (!isValid) {
      toast.warning("Preencha todos os campos corretamente");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setShowSuccessModal(false);

    try {
      await login(loginData.email, loginData.password);

      setShowErrorModal(false);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const activeRole = user.active_role || user.role;

      setSuccessMessage(`Bem-vindo, ${user.name}!`);
      setShowSuccessModal(true);

      if (hasPendingAppointment && activeRole === "patient") {
        setTimeout(async () => {
          setShowSuccessModal(false);
          try {
            await completePendingAppointment(user.id, false);
          } finally {
            onSectionChange("patient-area");
          }
        }, 2000);
      } else {
        setTimeout(() => {
          setShowSuccessModal(false);
          if (activeRole === "admin") {
            onSectionChange("admin-area");
          } else if (activeRole === "doctor") {
            onSectionChange("doctor-area");
          } else {
            onSectionChange("patient-area");
          }
        }, 2000);
      }
    } catch (err: any) {
      setShowSuccessModal(false);

      const status = err.response?.data?.status;
      const message = err.response?.data?.message;
      const rejectionNotes = err.response?.data?.rejection_notes;

      if (err.response?.status === 403 && status) {
        setStatusInfo({
          status: status as "pending" | "rejected" | "inactive" | "error",
          message: message || "Acesso negado.",
          rejectionNotes,
        });
        setShowStatusModal(true);
      } else if (err.response?.status === 401) {
        setErrorMessage(message || "Email ou senha incorretos.");
        setShowErrorModal(true);
      } else {
        setErrorMessage(message || "Erro ao fazer login. Tente novamente.");
        setShowErrorModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () =>
    loginData.email && loginData.password && !errors.email && !errors.password;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-gray-600">Acesse sua conta na ProMed</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LogIn className="w-5 h-5 text-blue-600" />
              <span>Entrar</span>
            </CardTitle>
            <CardDescription>
              Acesse sua conta com email e senha
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <ValidatedInput
                  id="email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleBlur("email")}
                  placeholder="seu@email.com"
                  disabled={loading}
                  error={errors.email}
                  showError={shouldShowError("email")}
                  isValid={isFieldValid("email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <ValidatedInput
                  id="password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  onBlur={() => handleBlur("password")}
                  placeholder="Sua senha"
                  disabled={loading}
                  error={errors.password}
                  showError={shouldShowError("password")}
                  isValid={isFieldValid("password")}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading || !isFormValid()}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>

            <Separator className="my-4" />

            <div className="text-center space-y-2">
              <Button
                variant="link"
                className="text-sm"
                onClick={() => onSectionChange("cadastro-paciente")}
                disabled={loading}
              >
                Não tem conta? Cadastre-se como Paciente
              </Button>
              <br />
              <Button
                variant="link"
                className="text-sm"
                onClick={() => onSectionChange("cadastro-profissional")}
                disabled={loading}
              >
                É médico? Cadastre-se aqui
              </Button>
              <br />
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setShowForgotPasswordModal(true)}
                disabled={loading}
              >
                Esqueceu sua senha?
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credenciais de Teste */}
        <Card className="mt-4 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-2">🔐 Credenciais de Teste:</p>
              <p>
                <strong>Admin:</strong> admin@promed.com / admin123
              </p>
            </div>
          </CardContent>
        </Card>

        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
        />

        {statusInfo && (
          <StatusModal
            isOpen={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            status={statusInfo.status}
            message={statusInfo.message}
            rejectionNotes={statusInfo.rejectionNotes}
          />
        )}

        <ErrorModal
          isOpen={showErrorModal}
          onClose={() => setShowErrorModal(false)}
          message={errorMessage}
        />

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const activeRole = user.active_role || user.role;
            if (activeRole === "admin") {
              onSectionChange("admin-area");
            } else if (activeRole === "doctor") {
              onSectionChange("doctor-area");
            } else {
              onSectionChange("patient-area");
            }
          }}
          title="Login realizado com sucesso!"
          message={successMessage}
        />
      </div>
    </div>
  );
}
