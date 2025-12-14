import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, LogOut, Stethoscope, User, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
// import { ConfirmModal } from './ui/confirm-modal'; // ← COMENTADO
import { useToast } from '../contexts/ToastContext';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ currentSection, onSectionChange }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const toast = useToast();
  // const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ← COMENTADO
  const [isOpen, setIsOpen] = useState(false);

  // ← MODIFICADO: logout direto, sem modal
  const handleLogout = () => {
    logout();
    toast.info('Você saiu do sistema');
    onSectionChange('');
    setIsOpen(false);
  };

  // ← REMOVIDO handleLogoutClick (não é mais necessário)

  type MenuItem = {
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
  };

  const navigationItems: MenuItem[] = [
    { id: 'home', label: 'Home' },
    { id: 'especialidades', label: 'Especialidades' },
    { id: 'sobre', label: 'Sobre Nós' },
    { id: 'contato', label: 'Contato' },
  ];

  const userMenuItems: MenuItem[] = user
    ? [
      ...(user.role === 'doctor' ? [{ id: 'doctor-area', label: 'Área do Médico', icon: Stethoscope }] : []),
      ...(user.role === 'patient' ? [{ id: 'patient-area', label: 'Área do Paciente', icon: User }] : []),
      ...(user.role === 'admin' ? [{ id: 'admin-area', label: 'Administração', icon: Shield }] : []),
      { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
      { id: 'logout', label: 'Sair', icon: LogOut },
    ]
    : [
      { id: 'login', label: 'Login' },
      { id: 'cadastro-profissional', label: 'Cadastro Médico' },
      { id: 'cadastro-paciente', label: 'Cadastro Paciente' },
    ];

  const handleNavClick = (sectionId: string) => {
    if (sectionId === 'logout') {
      handleLogout(); // ← MODIFICADO: chama direto sem modal
      return;
    }

    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/img/Logo1.JPG" alt="ProMed Logo" className="h-12" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-sm transition-colors hover:text-blue-600 ${
                  currentSection === item.id ? 'text-blue-600 font-medium' : 'text-gray-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Olá, {user?.name}</span>
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentSection === item.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleNavClick(item.id)}
                      className="flex items-center space-x-2"
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {userMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={item.id === 'login' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-semibold">ProMed</span>
                </div>

                {isAuthenticated && (
                  <div className="text-sm text-gray-600 pb-2">Olá, {user?.name}</div>
                )}

                {navigationItems.map((item) => (
                  <Button
                    key={item.id}
                    variant={currentSection === item.id ? 'default' : 'ghost'}
                    className="justify-start"
                    onClick={() => handleNavClick(item.id)}
                  >
                    {item.label}
                  </Button>
                ))}

                <div className="border-t pt-4">
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.id}
                        variant={currentSection === item.id ? 'default' : 'ghost'}
                        className="justify-start mb-2"
                        onClick={() => handleNavClick(item.id)}
                      >
                        {Icon && <Icon className="w-4 h-4 mr-2" />}
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ========================================
          MODAL DE CONFIRMAÇÃO - COMENTADO
          Descomente se quiser voltar a usar
          ======================================== */}
      
      {/* <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sair da conta"
        message="Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o sistema."
        confirmText="Sim, sair"
        cancelText="Cancelar"
        type="warning"
      /> */}
    </>
  );
}