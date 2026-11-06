import React, { useState, useEffect } from 'react';
import { Student, ClassItem } from '../../types';
import { 
  getStudents, 
  getClasses, 
  createStudent, 
  updateStudent, 
  deleteStudent, 
  resetStudentVote 
} from '../../services/electionService';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    nisn: '',
    nama: '',
    tanggal_lahir: '',
    class_name: '',
    gender: 'L' as 'L' | 'P',
  });
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // Delete & Reset Modals
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [resetTarget, setResetTarget] = useState<Student | null>(null);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [classFilter, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    const [stData, clData] = await Promise.all([
      getStudents('', classFilter, statusFilter),
      getClasses(),
    ]);
    setStudents(stData);
    setClasses(clData);
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      nisn: '',
      nama: '',
      tanggal_lahir: '',
      class_name: classes[0]?.name || 'X MIPA 1',
      gender: 'L',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormData({
      nisn: s.nisn,
      nama: s.nama,
      tanggal_lahir: s.tanggal_lahir ? s.tanggal_lahir.split('T')[0] : '',
      class_name: s.class_name,
      gender: s.gender || 'L',
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nisn.trim() || !formData.nama.trim() || !formData.tanggal_lahir.trim()) {
      setModalError('Seluruh bidang data wajib diisi');
      return;
    }

    setModalLoading(true);
    setModalError('');

    let res;
    if (editingStudent) {
      res = await updateStudent(editingStudent.id, {
        nisn: formData.nisn.trim(),
        nama: formData.nama.trim(),
        tanggal_lahir: formData.tanggal_lahir.trim(),
        class_name: formData.class_name,
        gender: formData.gender,
      });
    } else {
      res = await createStudent({
        nisn: formData.nisn.trim(),
        nama: formData.nama.trim(),
        tanggal_lahir: formData.tanggal_lahir.trim(),
        class_name: formData.class_name,
        gender: formData.gender,
      });
    }

    setModalLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchData();
    } else {
      setModalError(res.error || 'Gagal menyimpan siswa');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await deleteStudent(deleteTarget.id);
    setDeleteLoading(false);

    if (res.success) {
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } else {
      alert(res.error || 'Gagal menghapus siswa');
    }
  };

  const confirmResetVote = async () => {
    if (!resetTarget) return;
    setResetLoading(true);
    const res = await resetStudentVote(resetTarget.id);
    setResetLoading(false);

    if (res.success) {
      setIsResetOpen(false);
      setResetTarget(null);
      fetchData();
    } else {
      alert(res.error || 'Gagal mereset hak suara');
    }
  };

  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return s.nama.toLowerCase().includes(q) || s.nisn.includes(q) || s.class_name.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Siswa / User</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Data Siswa &amp; Status Hak Suara
          </h1>
          <p className="text-xs text-slate-500">
            Daftar Pemilih Tetap (DPT) Pemilihan OSIS dan kontrol status pemungutan suara
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Siswa Baru</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan NISN atau Nama..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="all">Semua Kelas</option>
            {classes.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none font-medium text-slate-700"
          >
            <option value="all">Semua Status</option>
            <option value="voted">Sudah Memilih</option>
            <option value="not_voted">Belum Memilih</option>
          </select>

          <span className="text-slate-400 font-mono tabular-nums pl-2">
            ({filteredStudents.length} siswa)
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs">Memuat data pemilih...</span>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Tidak ada data siswa yang cocok dengan filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Tanggal Lahir</th>
                  <th className="py-3 px-4 text-center">Status Suara</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, index) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono tabular-nums">
                      {index + 1}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 tabular-nums">
                      {s.nisn}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{s.nama}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({s.gender || 'L'})</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] ${
                        s.class_name.toUpperCase().includes('GURU')
                          ? 'bg-purple-100 text-purple-800 font-semibold border border-purple-200'
                          : 'text-slate-700'
                      }`}>
                        {s.class_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">
                      {s.tanggal_lahir ? s.tanggal_lahir.split('T')[0] : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {s.has_voted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Sudah Memilih</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <XCircle className="w-3 h-3 text-amber-600" />
                          <span>Belum Memilih</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Reset Vote Button if already voted */}
                        {s.has_voted && (
                          <button
                            type="button"
                            onClick={() => {
                              setResetTarget(s);
                              setIsResetOpen(true);
                            }}
                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Reset Hak Suara Siswa (Izinkan Memilih Kembali)"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openEditModal(s)}
                          className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Data Siswa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteTarget(s);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Pemilih'}
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

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor NISN
                </label>
                <input
                  type="text"
                  maxLength={15}
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="Contoh: 0067891234"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={formData.tanggal_lahir}
                  onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kelas
                  </label>
                  <select
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  {modalLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Hapus Data Siswa?"
        message={`Apakah Anda yakin ingin menghapus data siswa "${deleteTarget?.nama}" (NISN: ${deleteTarget?.nisn})?`}
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        variant="danger"
        isLoading={deleteLoading}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* Reset Vote Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetOpen}
        title="Reset Status Hak Suara Siswa?"
        message={`Perhatian: Status hak suara siswa "${resetTarget?.nama}" akan dikembalikan menjadi 'Belum Memilih', sehingga siswa ini dapat login dan memberikan suara kembali.`}
        confirmLabel="Ya, Reset Hak Suara"
        cancelLabel="Batal"
        variant="warning"
        isLoading={resetLoading}
        onConfirm={confirmResetVote}
        onCancel={() => setIsResetOpen(false)}
      />

    </div>
  );
};
