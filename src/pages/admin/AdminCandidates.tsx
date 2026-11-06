import React, { useState, useEffect } from 'react';
import { Candidate } from '../../types';
import { 
  getCandidates, 
  createCandidate, 
  updateCandidate, 
  deleteCandidate,
  uploadAsset,
  parseMisi
} from '../../services/electionService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  Award, 
  Quote, 
  ListPlus, 
  X, 
  Loader2, 
  AlertCircle,
  FileImage
} from 'lucide-react';

export const AdminCandidates: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [formData, setFormData] = useState({
    candidate_number: 1,
    ketua_name: '',
    wakil_name: '',
    photo_url: '',
    slogan: '',
    visi: '',
    misiList: [''] as string[],
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Candidate | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const data = await getCandidates();
    setCandidates(data);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingCandidate(null);
    const nextNumber = candidates.length > 0 
      ? Math.max(...candidates.map(c => c.candidate_number)) + 1 
      : 1;

    setFormData({
      candidate_number: nextNumber,
      ketua_name: '',
      wakil_name: '',
      photo_url: '/src/assets/images/candidate_paslon_satu_1792395944411.jpg',
      slogan: '',
      visi: '',
      misiList: ['Meningkatkan transparansi dan komunikasi antar siswa', 'Mengembangkan kegiatan ekstrakurikuler unggulan'],
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c: Candidate) => {
    setEditingCandidate(c);
    setFormData({
      candidate_number: c.candidate_number,
      ketua_name: c.ketua_name,
      wakil_name: c.wakil_name,
      photo_url: c.photo_url || '',
      slogan: c.slogan || '',
      visi: c.visi,
      misiList: parseMisi(c.misi),
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await uploadAsset(file, 'candidates');
      setFormData(prev => ({ ...prev, photo_url: url }));
    } catch {
      setModalError('Gagal mengunggah foto');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleMisiChange = (index: number, val: string) => {
    const updated = [...formData.misiList];
    updated[index] = val;
    setFormData({ ...formData, misiList: updated });
  };

  const addMisiItem = () => {
    setFormData({ ...formData, misiList: [...formData.misiList, ''] });
  };

  const removeMisiItem = (index: number) => {
    if (formData.misiList.length <= 1) return;
    setFormData({
      ...formData,
      misiList: formData.misiList.filter((_, i) => i !== index),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ketua_name.trim() || !formData.wakil_name.trim() || !formData.visi.trim()) {
      setModalError('Nama Ketua, Nama Wakil, dan Visi wajib diisi');
      return;
    }

    const cleanMisi = formData.misiList.map(m => m.trim()).filter(Boolean);
    if (cleanMisi.length === 0) {
      setModalError('Minimal satu poin misi harus dicantumkan');
      return;
    }

    setModalLoading(true);
    setModalError('');

    let res;
    if (editingCandidate) {
      res = await updateCandidate(editingCandidate.id, {
        candidate_number: Number(formData.candidate_number),
        ketua_name: formData.ketua_name.trim(),
        wakil_name: formData.wakil_name.trim(),
        photo_url: formData.photo_url,
        slogan: formData.slogan.trim(),
        visi: formData.visi.trim(),
        misi: cleanMisi,
      });
    } else {
      res = await createCandidate({
        candidate_number: Number(formData.candidate_number),
        ketua_name: formData.ketua_name.trim(),
        wakil_name: formData.wakil_name.trim(),
        photo_url: formData.photo_url,
        slogan: formData.slogan.trim(),
        visi: formData.visi.trim(),
        misi: cleanMisi,
      });
    }

    setModalLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      setModalError(res.error || 'Gagal menyimpan calon kandidat');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await deleteCandidate(deleteTarget.id);
    setDeleteLoading(false);

    if (res.success) {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } else {
      alert(res.error || 'Gagal menghapus kandidat');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Calon Kandidat</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Data Calon Ketua &amp; Wakil Ketua OSIS
          </h1>
          <p className="text-xs text-slate-500">
            Kelola nomor urut paslon, foto resmi, nama, visi, misi, serta slogan kampanye
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Paslon Baru</span>
        </button>
      </div>

      {/* Candidates List / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          <span className="text-xs">Memuat data kandidat...</span>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          Belum ada pasangan calon yang terdaftar. Klik tombol di atas untuk menambahkan paslon.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => {
            const misiItems = parseMisi(c.misi);
            return (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={c.photo_url || '/src/assets/images/candidate_paslon_satu_1792395944411.jpg'}
                      alt={`${c.ketua_name} & ${c.wakil_name}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/candidate_paslon_satu_1792395944411.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-white font-mono font-bold text-lg w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                      {c.candidate_number < 10 ? `0${c.candidate_number}` : c.candidate_number}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200/80 shadow-xs">
                      Paslon #{c.candidate_number}
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Names */}
                    <div className="mb-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                        Pasangan Calon
                      </div>
                      <h3 className="text-base font-bold text-slate-900">
                        {c.ketua_name}
                      </h3>
                      <p className="text-sm font-medium text-slate-600">
                        &amp; {c.wakil_name}
                      </p>
                    </div>

                    {/* Slogan */}
                    {c.slogan && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3 text-xs text-slate-700 italic flex items-start gap-2">
                        <Quote className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">&ldquo;{c.slogan}&rdquo;</span>
                      </div>
                    )}

                    {/* Visi */}
                    <div className="text-xs text-slate-600 mb-3">
                      <span className="font-bold text-slate-800 block mb-0.5">Visi:</span>
                      <p className="line-clamp-2 text-slate-600 leading-relaxed bg-slate-50/60 p-2 rounded-lg">
                        {c.visi}
                      </p>
                    </div>

                    {/* Misi Preview */}
                    <div className="text-xs text-slate-600">
                      <span className="font-bold text-slate-800 block mb-1">Misi ({misiItems.length} Poin):</span>
                      <ul className="space-y-1 text-slate-500 pl-1">
                        {misiItems.slice(0, 2).map((m, i) => (
                          <li key={i} className="truncate flex items-center gap-1.5">
                            <span className="font-mono text-indigo-600 text-[10px] font-bold">{i + 1}.</span>
                            <span className="truncate">{m}</span>
                          </li>
                        ))}
                        {misiItems.length > 2 && (
                          <li className="text-[11px] text-slate-400 italic">
                            +{misiItems.length - 2} poin misi lainnya
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Votes count */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs font-mono tabular-nums">
                    <span className="text-slate-400">Total Suara: </span>
                    <strong className="text-indigo-700 font-bold">{c.total_votes || 0}</strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Edit Paslon"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget(c);
                        setIsDeleteOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
                      title="Hapus Paslon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Candidate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCandidate ? `Edit Paslon No. ${editingCandidate.candidate_number}` : 'Tambah Pasangan Calon Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor Urut
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={formData.candidate_number}
                    onChange={(e) => setFormData({ ...formData, candidate_number: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono font-bold"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Calon Ketua
                  </label>
                  <input
                    type="text"
                    value={formData.ketua_name}
                    onChange={(e) => setFormData({ ...formData, ketua_name: e.target.value })}
                    placeholder="Nama lengkap calon ketua"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Calon Wakil Ketua
                </label>
                <input
                  type="text"
                  value={formData.wakil_name}
                  onChange={(e) => setFormData({ ...formData, wakil_name: e.target.value })}
                  placeholder="Nama lengkap calon wakil ketua"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                  required
                />
              </div>

              {/* Foto Upload & URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Foto Resmi Paslon (Upload ke Supabase Storage atau URL)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 shrink-0">
                    {formData.photo_url ? (
                      <img
                        src={formData.photo_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/src/assets/images/candidate_paslon_satu_1792395944411.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <FileImage className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-colors text-[11px] font-medium border border-slate-200">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? 'Mengunggah...' : 'Pilih File Foto'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="Atau tempel URL gambar..."
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Slogan */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Slogan / Tagline Paslon
                </label>
                <input
                  type="text"
                  value={formData.slogan}
                  onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                  placeholder="Misal: Bergerak Bersama, Menginspirasi Sesama"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
                />
              </div>

              {/* Visi */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visi Paslon
                </label>
                <textarea
                  rows={2}
                  value={formData.visi}
                  onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                  placeholder="Rumusan visi kepengurusan OSIS..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white resize-none"
                  required
                />
              </div>

              {/* Misi dynamic list */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700">
                    Poin-Poin Misi
                  </label>
                  <button
                    type="button"
                    onClick={addMisiItem}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
                  >
                    <ListPlus className="w-3.5 h-3.5" />
                    <span>Tambah Misi</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formData.misiList.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-400 w-4 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={m}
                        onChange={(e) => handleMisiChange(idx, e.target.value)}
                        placeholder={`Misi butir ke-${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                        required
                      />
                      {formData.misiList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMisiItem(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading || uploadingImage}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Data Paslon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Hapus Data Calon Kandidat?"
        message={`Apakah Anda yakin ingin menghapus Paslon No. ${deleteTarget?.candidate_number} (${deleteTarget?.ketua_name} & ${deleteTarget?.wakil_name})? Seluruh data suara terkait paslon ini akan ikut terhapus.`}
        confirmLabel="Ya, Hapus Paslon"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

    </div>
  );
};
