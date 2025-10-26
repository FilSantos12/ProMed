import React, { useState } from 'react';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { EspecialidadesPage } from './components/EspecialidadesPage';
import { SobrePage } from './components/SobrePage';
import { ContatoPage } from './components/ContatoPage';
import { AgendamentosPage } from './components/AgendamentosPage';
import { LoginPage } from './components/LoginPage';
import { DoctorArea } from './components/DoctorArea';
import { PatientArea } from './components/PatientArea';
import { AdminArea } from './components/AdminArea';
import { CadastroPages } from './components/CadastroPages';

export default function App() {
  const [currentSection, setCurrentSection] = useState('home');
  const [user, setUser] = useState<any>(null);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    
    // Redirect to appropriate area based on user role
    switch (userData.role) {
      case 'doctor':
        setCurrentSection('doctor-area');
        break;
      case 'patient':
        setCurrentSection('patient-area');
        break;
      case 'admin':
        setCurrentSection('admin-area');
        break;
      default:
        setCurrentSection('home');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentSection('home');
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'home':
        return <HomePage onSectionChange={handleSectionChange} />;
      case 'especialidades':
        return <EspecialidadesPage onSectionChange={handleSectionChange} />;
      case 'sobre':
        return <SobrePage />;
      case 'contato':
        return <ContatoPage onSectionChange={handleSectionChange} />;
      case 'agendamentos':
        return <AgendamentosPage />;
      case 'login':
        return <LoginPage onLogin={handleLogin} onSectionChange={handleSectionChange} />;
      case 'doctor-area':
        return user?.role === 'doctor' ? <DoctorArea user={user} /> : <LoginPage onLogin={handleLogin} onSectionChange={handleSectionChange} />;
      case 'patient-area':
        return user?.role === 'patient' ? <PatientArea user={user} onSectionChange={handleSectionChange} /> : <LoginPage onLogin={handleLogin} onSectionChange={handleSectionChange} />;
      case 'admin-area':
        return user?.role === 'admin' ? <AdminArea user={user} /> : <LoginPage onLogin={handleLogin} onSectionChange={handleSectionChange} />;
      case 'cadastro-profissional':
        return <CadastroPages type="professional" onSectionChange={handleSectionChange} />;
      case 'cadastro-paciente':
        return <CadastroPages type="patient" onSectionChange={handleSectionChange} />;
      default:
        return <HomePage onSectionChange={handleSectionChange} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentSection={currentSection}
        onSectionChange={handleSectionChange}
        user={user}
        onLogin={() => setCurrentSection('login')}
        onLogout={handleLogout}
      />
      
      <main>
        {renderCurrentSection()}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">ProMed</h3>
              <p className="text-gray-400 text-sm">
                Cuidando da sua saúde com excelência há mais de 10 anos.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => handleSectionChange('especialidades')} className="hover:text-white">Especialidades</button></li>
                <li><button onClick={() => handleSectionChange('agendamentos')} className="hover:text-white">Agendamento</button></li>
                <li><button onClick={() => handleSectionChange('sobre')} className="hover:text-white">Sobre Nós</button></li>
                <li><button onClick={() => handleSectionChange('contato')} className="hover:text-white">Contato</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Pacientes</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => handleSectionChange('cadastro-paciente')} className="hover:text-white">Cadastro</button></li>
                <li><button onClick={() => handleSectionChange('login')} className="hover:text-white">Área do Paciente</button></li>
                <li><button onClick={() => handleSectionChange('agendamentos')} className="hover:text-white">Resultados de Exames</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>(11) 3456-7890</li>
                <li>contato@promed.com</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 ProMed. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}