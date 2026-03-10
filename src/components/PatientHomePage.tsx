import { useState, useEffect } from 'react';
import { ExternalLink, Megaphone, Pill, Monitor, GraduationCap, Tag, AlertCircle, Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import advertisementService, { Advertisement } from '../services/advertisementService';

const CATEGORY_CONFIG: Record<
  Advertisement['category'],
  { label: string; color: string; bgColor: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  medicamento: {
    label: 'Medicamento',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    Icon: Pill,
  },
  campanha: {
    label: 'Campanha',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    Icon: Megaphone,
  },
  dispositivo: {
    label: 'Dispositivo',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    Icon: Monitor,
  },
  educacao: {
    label: 'Educação',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200',
    Icon: GraduationCap,
  },
  outro: {
    label: 'Informativo',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50 border-gray-200',
    Icon: Tag,
  },
};

const CATEGORY_BADGE_VARIANT: Record<Advertisement['category'], string> = {
  medicamento: 'bg-blue-100 text-blue-800',
  campanha: 'bg-green-100 text-green-800',
  dispositivo: 'bg-purple-100 text-purple-800',
  educacao: 'bg-orange-100 text-orange-800',
  outro: 'bg-gray-100 text-gray-800',
};

function AdCard({ ad }: { ad: Advertisement }) {
  const config = CATEGORY_CONFIG[ad.category];
  const { Icon } = config;
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`rounded-xl border-2 overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow ${config.bgColor}`}>
      {/* Imagem */}
      {ad.image_url && !imgError ? (
        <div className="h-44 overflow-hidden">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className={`h-44 flex items-center justify-center ${config.bgColor}`}>
          <Icon className={`w-16 h-16 opacity-20 ${config.color}`} />
        </div>
      )}

      {/* Conteudo */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_BADGE_VARIANT[ad.category]}`}>
            {config.label}
          </span>
          <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">Patrocinado</span>
        </div>

        <div className="flex-1">
          <h3 className={`font-semibold text-base leading-snug mb-1 ${config.color}`}>{ad.title}</h3>
          {ad.description && (
            <p className="text-sm text-gray-600 line-clamp-3">{ad.description}</p>
          )}
        </div>

        {ad.link_url && (
          <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="mt-auto">
            <Button size="sm" variant="outline" className="w-full gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              {ad.link_text || 'Saiba mais'}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

export function PatientHomePage() {
  const { user } = useAuth();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'Paciente';

  useEffect(() => {
    advertisementService
      .getActive()
      .then(setAds)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">

        {/* Boas-vindas */}
        <div
          className="rounded-2xl p-8 shadow-lg"
          style={{ background: 'linear-gradient(to right, #059669, #065f46)', color: '#fff' }}
        >
          <p className="text-sm font-medium mb-1 uppercase tracking-wider" style={{ color: '#a7f3d0' }}>
            Bem-vindo de volta
          </p>
          <h1 className="text-3xl font-bold mb-2">Olá, {firstName}!</h1>
          <p className="text-base max-w-lg" style={{ color: '#d1fae5' }}>
            Confira informações de saúde, campanhas de prevenção e novidades pensadas para você.
          </p>
        </div>

        {/* Bloco de anuncios */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Heart className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-800">Saúde & Bem-estar</h2>
            <span className="ml-2 text-xs text-gray-400 font-medium border border-gray-200 rounded px-2 py-0.5">
              Conteúdo Patrocinado
            </span>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border-2 border-gray-100 bg-gray-100 animate-pulse h-72" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex items-center gap-3 text-gray-500 bg-white border rounded-xl p-6">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="text-sm">Não foi possível carregar os conteúdos no momento.</span>
            </div>
          )}

          {!loading && !error && ads.length === 0 && (
            <div className="text-center text-gray-400 bg-white border-2 border-dashed rounded-xl py-16">
              <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum conteúdo disponível no momento.</p>
            </div>
          )}

          {!loading && !error && ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>

        {/* Nota de conformidade */}
        <p className="text-xs text-gray-400 text-center pb-4">
          Os conteúdos patrocinados são de responsabilidade exclusiva dos anunciantes. O ProMed não endossa
          produtos ou serviços de terceiros. Consulte sempre um profissional de saúde.
        </p>
      </div>
    </div>
  );
}
