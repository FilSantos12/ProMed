import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Power, Images, GripVertical } from 'lucide-react';
import { ConfirmModal } from './ui/confirm-modal';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useToast } from '../contexts/ToastContext';
import carouselService, { CarouselSlide, CarouselSlideForm } from '../services/carouselService';

const EMPTY_FORM: Partial<CarouselSlideForm> = {
  title: '',
  description: '',
  image_url: '',
  link_url: '',
  is_active: true,
  order: 0,
};

export default function CarouselSlides() {
  const toast = useToast();
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<CarouselSlideForm>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await carouselService.adminList();
      setSlides(data);
    } catch {
      toast.error('Erro ao carregar slides.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSlides(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPreviewError(false);
    setShowForm(true);
  };

  const openEdit = (slide: CarouselSlide) => {
    setEditingId(slide.id);
    setForm({
      title: slide.title,
      description: slide.description ?? '',
      image_url: slide.image_url,
      link_url: slide.link_url ?? '',
      is_active: slide.is_active,
      order: slide.order,
    });
    setPreviewError(false);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title?.trim()) { toast.error('O título é obrigatório.'); return; }
    if (!form.image_url?.trim()) { toast.error('A URL da imagem é obrigatória.'); return; }
    try {
      setSaving(true);
      if (editingId) {
        await carouselService.update(editingId, form);
        toast.success('Slide atualizado!');
      } else {
        await carouselService.create(form);
        toast.success('Slide criado!');
      }
      setShowForm(false);
      loadSlides();
    } catch {
      toast.error('Erro ao salvar slide.');
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
      await carouselService.remove(deletingId);
      toast.success('Slide removido.');
      setSlides((prev) => prev.filter((s) => s.id !== deletingId));
    } catch {
      toast.error('Erro ao remover slide.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const updated = await carouselService.toggleStatus(id);
      setSlides((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(updated.is_active ? 'Slide ativado.' : 'Slide desativado.');
    } catch {
      toast.error('Erro ao alterar status.');
    }
  };

  const activeCount = slides.filter((s) => s.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Images className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-800">Carrossel da Home</h2>
          <span className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5">
            {activeCount} ativo{activeCount !== 1 ? 's' : ''}
          </span>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Slide
        </Button>
      </div>

      {/* Aviso */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
        Os slides ativos aparecem no carrossel da página inicial. Se não houver nenhum cadastrado, o carrossel exibe as imagens padrão.
      </div>

      {/* Formulário */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Editar Slide' : 'Novo Slide'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título *</Label>
                <Input
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Atendimento Humanizado"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Descrição (legenda)</Label>
                <Input
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Cuidado dedicado para cada paciente"
                />
              </div>

              <div className="md:col-span-2">
                <Label>URL da Imagem *</Label>
                <Input
                  value={form.image_url ?? ''}
                  onChange={(e) => { setForm({ ...form, image_url: e.target.value }); setPreviewError(false); }}
                  placeholder="https://... ou /img/banner.png"
                />
                {/* Preview */}
                {form.image_url && !previewError && (
                  <div className="mt-2 h-36 rounded-lg overflow-hidden border bg-gray-50">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewError(true)}
                    />
                  </div>
                )}
                {previewError && (
                  <p className="text-xs text-red-500 mt-1">Não foi possível carregar a imagem. Verifique a URL.</p>
                )}
              </div>

              <div>
                <Label>URL do Link (opcional)</Label>
                <Input
                  value={form.link_url ?? ''}
                  onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-400 mt-1">Se preenchido, o slide será clicável.</p>
              </div>

              <div>
                <Label>Ordem de exibição</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.order ?? 0}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
                <p className="text-xs text-gray-400 mt-1">Menor número = aparece primeiro.</p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="slide_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="slide_active" className="cursor-pointer">Ativo (visível na home)</Label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Criar slide'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center text-gray-400 border-2 border-dashed rounded-xl py-16">
          <Images className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum slide cadastrado. O carrossel usará as imagens padrão.</p>
          <Button variant="outline" className="mt-4" onClick={openCreate}>Criar primeiro slide</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {slides.map((slide) => (
            <Card key={slide.id} className={`transition-opacity ${!slide.is_active ? 'opacity-50' : ''}`}>
              <CardContent className="flex items-center gap-4 py-4">
                {/* Ordem */}
                <div className="flex flex-col items-center gap-1 shrink-0 text-gray-300">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-xs font-mono text-gray-400">{slide.order}</span>
                </div>

                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{slide.title}</p>
                  {slide.description && (
                    <p className="text-xs text-gray-500 truncate">{slide.description}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate mt-0.5">{slide.image_url}</p>
                </div>

                {/* Status badge */}
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${slide.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {slide.is_active ? 'Ativo' : 'Inativo'}
                </span>

                {/* Ações */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleToggle(slide.id)} title={slide.is_active ? 'Desativar' : 'Ativar'}>
                    <Power className={`w-4 h-4 ${slide.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(slide)}>
                    <Pencil className="w-4 h-4 text-blue-600" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(slide.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingId(null); }}
        onConfirm={confirmDelete}
        title="Excluir slide"
        message="Tem certeza que deseja excluir este slide do carrossel? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
