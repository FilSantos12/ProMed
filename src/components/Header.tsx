import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from './ui/sheet';
import { Menu, LogOut, Stethoscope, User, Calendar, Shield, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
// import { ConfirmModal } from './ui/confirm-modal'; // ← COMENTADO
import { useToast } from '../contexts/ToastContext';
import userProfileService, { UserProfile } from '../services/userProfileService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface HeaderProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ currentSection, onSectionChange }: HeaderProps) {
  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const toast = useToast();
  // const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // ← COMENTADO
  const [isOpen, setIsOpen] = useState(false);
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  // Load available profiles when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadAvailableProfiles();
    }
  }, [isAuthenticated, user?.id]);

  const loadAvailableProfiles = async () => {
    try {
      const response = await userProfileService.getAvailableProfiles();
      setAvailableProfiles(response.profiles);
    } catch (err: any) {
      console.error('Erro ao carregar perfis disponíveis:', err);
    }
  };

  const handleSwitchProfile = async (role: 'admin' | 'doctor' | 'patient') => {
    try {
      setLoadingProfiles(true);
      await userProfileService.switchProfile(role);

      // Refresh user data in auth context
      if (refreshUser) {
        await refreshUser();
      }

      toast.success(`Perfil alterado para ${role === 'admin' ? 'Administrador' : role === 'doctor' ? 'Médico' : 'Paciente'}`);

      // Navigate to corresponding area
      const sectionMap = {
        admin: 'admin-area',
        doctor: 'doctor-area',
        patient: 'patient-area'
      };
      onSectionChange(sectionMap[role]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Erro ao trocar de perfil');
    } finally {
      setLoadingProfiles(false);
    }
  };

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
      ...(user.roles?.includes('admin') || user.role === 'admin' ? [{ id: 'admin-area', label: 'Administração', icon: Shield }] : []),
      ...(user.roles?.includes('doctor') || user.role === 'doctor' ? [{ id: 'doctor-area', label: 'Área do Médico', icon: Stethoscope }] : []),
      ...(user.roles?.includes('patient') || user.role === 'patient' ? [{ id: 'patient-area', label: 'Área do Paciente', icon: User }] : []),
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

                {/* Profile Switcher - Only show if user has multiple profiles */}
                {availableProfiles.length > 1 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center space-x-2" disabled={loadingProfiles}>
                        {loadingProfiles ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            {(user?.active_role || user?.role) === 'admin' && <Shield className="w-4 h-4" />}
                            {(user?.active_role || user?.role) === 'doctor' && <Stethoscope className="w-4 h-4" />}
                            {(user?.active_role || user?.role) === 'patient' && <User className="w-4 h-4" />}
                            <span className="text-xs">
                              {(user?.active_role || user?.role) === 'admin' ? 'Admin' : (user?.active_role || user?.role) === 'doctor' ? 'Médico' : 'Paciente'}
                            </span>
                          </>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Trocar Perfil</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {availableProfiles.map((profile) => (
                        <DropdownMenuItem
                          key={profile.role}
                          onClick={() => handleSwitchProfile(profile.role)}
                          className={profile.is_active ? 'bg-blue-50' : ''}
                        >
                          <div className="flex items-center space-x-2">
                            {profile.role === 'admin' && <Shield className="w-4 h-4" />}
                            {profile.role === 'doctor' && <Stethoscope className="w-4 h-4" />}
                            {profile.role === 'patient' && <User className="w-4 h-4" />}
                            <span>{profile.name}</span>
                            {profile.is_active && <span className="text-xs text-blue-600">(Ativo)</span>}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

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
              <SheetTitle className="sr-only">Menu de Navegação ProMed</SheetTitle>
              <SheetDescription className="sr-only">
                Menu principal com opções de navegação e perfil do usuário
              </SheetDescription>
              <div className="flex flex-col space-y-4 mt-8">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Stethoscope className="w-6 h-6 text-blue-600" />
                  <span className="text-lg font-semibold">ProMed</span>
                </div>

                {isAuthenticated && (
                  <div className="pb-4">
                    <div className="text-sm text-gray-600 mb-2">Olá, {user?.name}</div>

                    {/* Profile Switcher for Mobile - Only show if user has multiple profiles */}
                    {availableProfiles.length > 1 && (
                      <div className="space-y-2 border-t pt-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase">Trocar Perfil</div>
                        {availableProfiles.map((profile) => (
                          <Button
                            key={profile.role}
                            variant={profile.is_active ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              handleSwitchProfile(profile.role);
                              setIsOpen(false);
                            }}
                            className="w-full justify-start"
                            disabled={loadingProfiles || profile.is_active}
                          >
                            {profile.role === 'admin' && <Shield className="w-4 h-4 mr-2" />}
                            {profile.role === 'doctor' && <Stethoscope className="w-4 h-4 mr-2" />}
                            {profile.role === 'patient' && <User className="w-4 h-4 mr-2" />}
                            <span>{profile.name}</span>
                            {profile.is_active && <span className="ml-auto text-xs">(Ativo)</span>}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
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