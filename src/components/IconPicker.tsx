import React, { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Heart,
  Brain,
  Eye,
  Ear,
  Bone,
  Activity,
  Stethoscope,
  Pill,
  Syringe,
  TestTube,
  Microscope,
  Thermometer,
  Baby,
  User,
  Users,
  Shield,
  Cross,
  Hospital,
  Ambulance,
  Bandage,
  Clipboard,
  HeartPulse,
} from "lucide-react";

// Estilos customizados para scrollbar - SEMPRE VISÍVEL
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 6px;
    border: 2px solid #f3f4f6;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
`;

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  label?: string;
}

interface IconOption {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Mapa de traduções PT-BR
const ICON_TRANSLATIONS: Record<string, string> = {
  Heart: "Coração",
  Brain: "Cérebro",
  Eye: "Olho",
  Ear: "Orelha",
  Bone: "Osso",
  Activity: "Atividade",
  HeartPulse: "Pulso Cardíaco",
  FileHeart: "Prontuário",
  Stethoscope: "Estetoscópio",
  Pill: "Pílula",
  Syringe: "Seringa",
  TestTube: "Tubo de Ensaio",
  Microscope: "Microscópio",
  Thermometer: "Termômetro",
  Clipboard: "Prancheta",
  Radar: "Radar",
  Baby: "Bebê",
  User: "Usuário",
  Users: "Usuários",
  UserCircle: "Perfil",
  UserCheck: "Aprovado",
  Hospital: "Hospital",
  Ambulance: "Ambulância",
  Cross: "Cruz",
  Shield: "Escudo",
  Bandage: "Curativo",
  CheckCircle: "Confirmado",
  XCircle: "Cancelado",
  AlertCircle: "Alerta",
  Info: "Informação",
  Zap: "Raio",
  Target: "Alvo",
  Circle: "Círculo",
  Square: "Quadrado",
  Triangle: "Triângulo",
  Star: "Estrela",
  Plus: "Mais",
  Sparkles: "Brilho",
  Sun: "Sol",
  Moon: "Lua",
  Cloud: "Nuvem",
  Droplet: "Gota",
};

const MEDICAL_ICONS: Record<string, IconOption[]> = {
  Especialidades: [
    { name: "Heart", label: "Coração", icon: Heart },
    { name: "Brain", label: "Cérebro", icon: Brain },
    { name: "Eye", label: "Olho", icon: Eye },
    { name: "Ear", label: "Orelha", icon: Ear },
    { name: "Bone", label: "Osso", icon: Bone },
    { name: "Activity", label: "Atividade", icon: Activity },
    { name: "HeartPulse", label: "Batimento", icon: HeartPulse },
    { name: "Baby", label: "Bebê", icon: Baby },
  ],
  Equipamentos: [
    { name: "Stethoscope", label: "Estetoscópio", icon: Stethoscope },
    { name: "Pill", label: "Medicamento", icon: Pill },
    { name: "Syringe", label: "Seringa", icon: Syringe },
    { name: "TestTube", label: "Exame", icon: TestTube },
    { name: "Microscope", label: "Laboratório", icon: Microscope },
    { name: "Thermometer", label: "Termômetro", icon: Thermometer },
    { name: "Clipboard", label: "Prontuário", icon: Clipboard },
    { name: "Bandage", label: "Curativo", icon: Bandage },
  ],
  Instituições: [
    { name: "Hospital", label: "Hospital", icon: Hospital },
    { name: "Ambulance", label: "Emergência", icon: Ambulance },
    { name: "Cross", label: "Saúde", icon: Cross },
    { name: "Shield", label: "Proteção", icon: Shield },
    { name: "Users", label: "Equipe", icon: Users },
    { name: "User", label: "Paciente", icon: User },
  ],
};

export const IconPicker: React.FC<IconPickerProps> = ({
  value,
  onChange,
  label = "Ícone",
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Especialidades");

  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    setShowPicker(false);
  };

  // Encontrar o ícone atual
  const getCurrentIcon = () => {
    for (const category of Object.values(MEDICAL_ICONS)) {
      const found = category.find((item) => item.name === value);
      if (found) return found.icon;
    }
    return Heart; // Ícone padrão
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <>
      <style>{scrollbarStyles}</style>
      <div className="space-y-2">
        <Label>{label}</Label>

        <div className="flex gap-2">
          {/* Preview do ícone selecionado */}
          <div className="flex items-center justify-center w-16 h-10 border rounded-md bg-gray-50">
            <CurrentIcon className="w-6 h-6 text-gray-700" />
          </div>

          {/* Nome do ícone */}
          <div className="flex-1 flex items-center px-3 border rounded-md bg-white">
            <span className="text-sm text-gray-600">
              {value ? ICON_TRANSLATIONS[value] || value : "Nenhum selecionado"}
            </span>
          </div>

          {/* Botão para abrir o picker */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPicker(!showPicker)}
            className="px-4"
          >
            {showPicker ? "Fechar" : "Selecionar"}
          </Button>
        </div>

        {/* Picker de ícones */}
        {showPicker && (
          <div className="border rounded-lg p-3 bg-white shadow-lg mt-2">
            {/* Tabs de categorias */}
            <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b">
              {Object.keys(MEDICAL_ICONS).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                    activeCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Grid de ícones profissionais com barra de rolagem */}
            <div
              className="custom-scrollbar grid grid-cols-5 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 overflow-y-scroll"
              style={{
                height: "180px",
                scrollbarWidth: "auto",
                scrollbarColor: "#3b82f6 #f3f4f6",
              }}
            >
              {MEDICAL_ICONS[activeCategory as keyof typeof MEDICAL_ICONS].map(
                (item) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleIconSelect(item.name)}
                      className={`
                    flex flex-col items-center justify-center p-2 rounded-md border transition-all
                    hover:border-blue-400 hover:bg-white hover:shadow-sm
                    ${
                      value === item.name
                        ? "border-blue-600 bg-blue-50 shadow-sm"
                        : "border-gray-300 bg-white"
                    }
                  `}
                      title={item.label}
                    >
                      <IconComponent
                        className={`w-5 h-5 mb-1 ${value === item.name ? "text-blue-600" : "text-gray-700"}`}
                      />
                      <span
                        className={`text-[10px] font-medium text-center leading-tight ${value === item.name ? "text-blue-600" : "text-gray-600"}`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            {/* Dica */}
            <div className="mt-2 p-1.5 bg-blue-50 rounded text-[10px] text-blue-700 text-center">
              Clique no ícone desejado para selecionar
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500">
          Selecione um ícone profissional para representar a especialidade
        </p>
      </div>
    </>
  );
};

export default IconPicker;
