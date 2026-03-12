import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, Megaphone, ExternalLink, Stethoscope, User, Users } from 'lucide-react';
import { ConfirmModal } from './ui/confirm-modal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useToast } from '../contexts/ToastContext';
import advertisementService, { Advertisement, AdvertisementForm } from '../services/advertisementService';

const CATEGORY_LABELS: Record<Advertisement['category'], string> = {
  medicamento: 'Medicamento',
  campanha: 'Campanha',
  dispositivo: 'Dispositivo',
  educacao: 'Educação',
  outro: 'Outro',
};

const CATEGORY_COLORS: Record<Advertisement['category'], string> = {
  medicamento: 'bg-blue-100 text-blue-800',
  campanha: 'bg-green-100 text-green-800',
  dispositivo: 'bg-purple-100 text-purple-800',
  educacao: 'bg-orange-100 text-orange-800',
  outro: 'bg-gray-100 text-gray-800',
};

const AUDIENCE_CONFIG: Record<Advertisement['target_audience'], { label: string; color: string; Icon: React.ComponentType<{ className?: string }> }> = {
  medico:   { label: 'Médicos',        color: 'bg-blue-100 text-blue-800',    Icon: Stethoscope },
  paciente: { label: 'Pacientes',      color: 'bg-emerald-100 text-emerald-800', Icon: User },
  todos:    { label: 'Todos',          color: 'bg-gray-100 text-gray-700',    Icon: Users },
};

const FILTER_OPTIONS = [
  { value: 'todos_filtro', label: 'Todos os anúncios' },
  { value: 'medico',   label: 'Somente Médicos' },
  { value: 'paciente', label: 'Somente Pacientes' },
  { value: 'todos',    label: 'Público Geral' },
];

const EMPTY_FORM: Partial<AdvertisementForm> = {
  title: '',
  description: '',
  image_url: '',
  link_url: '',
  link_text: 'Saiba mais',
  category: 'outro',
  target_audience: 'todos',
  is_active: true,
  starts_at: null,
  ends_at: null,
  order: 0,
};

export default function Advertisements() {
  const toast = useToast();
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<AdvertisementForm>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [audienceFilter, setAudienceFilter] = useState<string>('todos_filtro');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await advertisementService.adminList();
      setAds(data);
    } catch {
      toast.error('Erro ao carregar anúncios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  const filteredAds = audienceFilter === 'todos_filtro'
    ? ads
    : ads.filter((a) => a.target_audience === audienceFilter);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (ad: Advertisement) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      description: ad.description ?? '',
      image_url: ad.image_url ?? '',
      link_url: ad.link_url ?? '',
      link_text: ad.link_text,
      category: ad.category,
      target_audience: ad.target_audience,
      is_active: ad.is_active,
      starts_at: ad.starts_at,
      ends_at: ad.ends_at,
      order: ad.order,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('O título é obrigatório.');
      return;
    }
    try {
      setSaving(true);
      if (editingId) {
        await advertisementService.update(editingId, form);
        toast.success('Anúncio atualizado!');
      } else {
        await advertisementService.create(form);
        toast.success('Anúncio criado!');
      }
      setShowForm(false);
      loadAds();
    } catch {
      toast.error('Erro ao salvar anúncio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;
    try {
      await advertisementService.remove(deletingId);
      toast.success('Anúncio removido.');
      setAds((prev) => prev.filter((a) => a.id !== deletingId));
    } catch {
      toast.error('Erro ao remover anúncio.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await advertisementService.toggleStatus(id);
      setAds((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(updated.is_active ? 'Anúncio ativado.' : 'Anúncio desativado.');
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  // Contadores por público
  const countByAudience = (aud: Advertisement['target_audience']) => ads.filter((a) => a.target_audience === aud).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Gerenciar Anúncios</h2>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Anúncio
        </Button>
      </div>

      {/* Cards de resumo por público */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <Stethoscope className="w-5 h-5 text-blue-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-blue-700">{countByAudience('medico')}</p>
          <p className="text-xs text-blue-600">Para Médicos</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <User className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
          <p className="text-2xl font-bold text-emerald-700">{countByAudience('paciente')}</p>
          <p className="text-xs text-emerald-600">Para Pacientes</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <Users className="w-5 h-5 text-gray-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-700">{countByAudience('todos')}</p>
          <p className="text-xs text-gray-500">Público Geral</p>
        </div>
      </div>

      {/* Filtro por público */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Filtrar:</span>
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAudienceFilter(opt.value)}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
              audienceFilter === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Formulario */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Editar Anúncio' : 'Novo Anúncio'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título *</Label>
                <Input
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Campanha Março Lilás"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Breve descrição do anúncio..."
                  rows={3}
                />
              </div>

              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={form.image_url ?? ''}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>URL do Link</Label>
                <Input
                  value={form.link_url ?? ''}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>Texto do Botão</Label>
                <Input
                  value={form.link_text ?? 'Saiba mais'}
                  onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                  placeholder="Saiba mais"
                />
              </div>

              <div>
                <Label>Categoria</Label>
                <select
                  value={form.category ?? 'outro'}
                  onChange={(e) => setForm({ ...form, category: e.target.value as Advertisement['category'] })}
                  className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="medicamento">Medicamento</option>
                  <option value="campanha">Campanha</option>
                  <option value="dispositivo">Dispositivo</option>
                  <option value="educacao">Educação</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Público-alvo — destaque visual */}
              <div className="md:col-span-2">
                <Label>Público-alvo *</Label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {((['medico', 'paciente', 'todos'] as Advertisement['target_audience'][]).map((aud) => {
                    const cfg = AUDIENCE_CONFIG[aud];
                    const { Icon } = cfg;
                    const selected = form.target_audience === aud;
                    return (
                      <button
                        key={aud}
                        type="button"
                        onClick={() => setForm({ ...form, target_audience: aud })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
                        {cfg.label}
                      </button>
                    );
                  }))}
                </div>
              </div>

              <div>
                <Label>Início (opcional)</Label>
                <Input
                  type="date"
                  value={form.starts_at ? form.starts_at.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value || null })}
                />
              </div>

              <div>
                <Label>Fim (opcional)</Label>
                <Input
                  type="date"
                  value={form.ends_at ? form.ends_at.split('T')[0] : ''}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value || null })}
                />
              </div>

              <div>
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order ?? 0}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active" className="cursor-pointer">Ativo</Label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar anúncio'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center text-gray-400 border-2 border-dashed rounded-xl py-16">
          <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {audienceFilter === 'todos_filtro'
              ? 'Nenhum anúncio cadastrado.'
              : `Nenhum anúncio para "${FILTER_OPTIONS.find((f) => f.value === audienceFilter)?.label}".`}
          </p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>
            Criar anúncio
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAds.map((ad) => {
            const audienceCfg = AUDIENCE_CONFIG[ad.target_audience];
            const { Icon: AudIcon } = audienceCfg;
            return (
              <Card key={ad.id} className={`transition-opacity ${!ad.is_active ? 'opacity-50' : ''}`}>
                <CardContent className="flex items-center gap-4 py-4">
                  {/* Thumbnail */}
                  {ad.image_url ? (
                    <img
                      src={ad.image_url}
                      alt={ad.title}
                      className="w-14 h-14 rounded-lg object-cover border shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gray-100 border flex items-center justify-center shrink-0">
                      <Megaphone className="w-6 h-6 text-gray-300" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[ad.category]}`}>
                        {CATEGORY_LABELS[ad.category]}
                      </span>
                      {/* Badge de público-alvo */}
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${audienceCfg.color}`}>
                        <AudIcon className="w-3 h-3" />
                        {audienceCfg.label}
                      </span>
                      {!ad.is_active && (
                        <span className="text-xs text-gray-400 border rounded px-2 py-0.5">Inativo</span>
                      )}
                      {ad.ends_at && new Date(ad.ends_at) < new Date() && (
                        <span className="text-xs text-red-500 border border-red-200 rounded px-2 py-0.5">Expirado</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-800 truncate">{ad.title}</p>
                    {ad.description && (
                      <p className="text-xs text-gray-500 truncate">{ad.description}</p>
                    )}
                    {ad.link_url && (
                      <a
                        href={ad.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {ad.link_url.length > 50 ? ad.link_url.slice(0, 50) + '…' : ad.link_url}
                      </a>
                    )}
                  </div>

                  {/* Acoes */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => handleToggle(ad.id)} title={ad.is_active ? 'Desativar' : 'Ativar'}>
                      <Power className={`w-4 h-4 ${ad.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(ad)}>
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(ad.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Excluir anúncio"
        message="Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
