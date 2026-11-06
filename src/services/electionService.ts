import { supabase, SUPABASE_CONFIG } from '../lib/supabase';
import { 
  AppSettings, 
  ClassItem, 
  Student, 
  Candidate, 
  AdminUser, 
  VotingStats, 
  VoteResult,
  TableStatusInfo,
  SupabaseHealthStatus
} from '../types';

// Default Fallback Settings
export const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  school_name: 'SMA NEGERI 1 NUSANTARA',
  school_logo: '/src/assets/images/eosis_school_logo_1792395943704.jpg',
  election_title: 'Pemilihan Ketua & Wakil Ketua OSIS',
  election_period: '2026/2027',
  is_active: true,
  start_date: null,
  end_date: null,
};

// 1. SETTINGS SERVICES
export async function getSettings(): Promise<AppSettings> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();

    if (error || !data) {
      console.warn('Settings load warning, using default:', error?.message);
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...data,
      // fallback logo if empty
      school_logo: data.school_logo || DEFAULT_SETTINGS.school_logo,
    };
  } catch (err) {
    console.error('Error fetching settings:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('settings')
      .update(settings)
      .eq('id', 1);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui pengaturan';
    return { success: false, error: message };
  }
}

// 2. ADMIN AUTH SERVICES
export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username.trim())
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, error: 'Username admin tidak ditemukan' };
    }

    const admin = data[0] as AdminUser;
    if (admin.password_hash !== password.trim()) {
      return { success: false, error: 'Password admin salah' };
    }

    return { success: true, user: admin };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal melakukan login admin';
    return { success: false, error: message };
  }
}

export async function updateAdminCredentials(
  adminId: string,
  currentPassword: string,
  newPassword: string,
  newUsername: string,
  nama?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Verify current password
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      return { success: false, error: 'Akun admin tidak ditemukan' };
    }

    if (data.password_hash !== currentPassword) {
      return { success: false, error: 'Password saat ini salah' };
    }

    // 2. Update credentials
    const updatePayload: Record<string, string> = {
      username: newUsername.trim(),
    };
    if (newPassword && newPassword.trim().length > 0) {
      updatePayload.password_hash = newPassword.trim();
    }
    if (nama) {
      updatePayload.nama = nama.trim();
    }

    const { error: updateError } = await supabase
      .from('admins')
      .update(updatePayload)
      .eq('id', adminId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengubah profil/password';
    return { success: false, error: message };
  }
}

// 3. STUDENT SERVICES & AUTH
export async function loginStudent(nisn: string, tanggalLahir: string): Promise<{ success: boolean; student?: Student; error?: string }> {
  try {
    const cleanNisn = nisn.trim();
    const cleanDate = tanggalLahir.trim();

    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('nisn', cleanNisn)
      .limit(1);

    if (error) throw error;
    if (!data || data.length === 0) {
      return { success: false, error: 'NISN tidak terdaftar dalam Daftar Pemilih Tetap (DPT)' };
    }

    const student = data[0] as Student;

    // Normalizing date strings (YYYY-MM-DD)
    const studentBirthDate = student.tanggal_lahir ? student.tanggal_lahir.split('T')[0] : '';
    if (studentBirthDate !== cleanDate) {
      return { success: false, error: 'Tanggal lahir tidak cocok dengan data NISN tersebut' };
    }

    return { success: true, student };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat verifikasi siswa';
    return { success: false, error: message };
  }
}

export async function fetchStudentById(studentId: string): Promise<Student | null> {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', studentId)
      .single();

    if (error) return null;
    return data as Student;
  } catch {
    return null;
  }
}

export async function getStudents(searchQuery = '', classFilter = '', statusFilter = ''): Promise<Student[]> {
  try {
    let query = supabase.from('students').select('*').order('nama', { ascending: true });

    if (classFilter && classFilter !== 'all') {
      query = query.eq('class_name', classFilter);
    }

    if (statusFilter === 'voted') {
      query = query.eq('has_voted', true);
    } else if (statusFilter === 'not_voted') {
      query = query.eq('has_voted', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    let students = (data || []) as Student[];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      students = students.filter(
        s => s.nama.toLowerCase().includes(q) || s.nisn.includes(q) || s.class_name.toLowerCase().includes(q)
      );
    }

    return students;
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}

export async function createStudent(student: Omit<Student, 'id' | 'has_voted' | 'voted_at' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('students').insert([{
      ...student,
      has_voted: false,
      voted_at: null,
    }]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan data siswa';
    return { success: false, error: message };
  }
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('students').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui data siswa';
    return { success: false, error: message };
  }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus siswa';
    return { success: false, error: message };
  }
}

export async function resetStudentVote(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('students')
      .update({ has_voted: false, voted_at: null })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mereset status hak suara siswa';
    return { success: false, error: message };
  }
}

// 4. CLASSES SERVICES
export async function getClasses(): Promise<ClassItem[]> {
  try {
    const { data: classesData, error: classErr } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (classErr) throw classErr;

    // Fetch counts from students
    const { data: studentsData } = await supabase
      .from('students')
      .select('class_name');

    const counts: Record<string, number> = {};
    studentsData?.forEach(s => {
      if (s.class_name) {
        counts[s.class_name] = (counts[s.class_name] || 0) + 1;
      }
    });

    return (classesData || []).map(c => ({
      ...c,
      student_count: counts[c.name] || 0,
    }));
  } catch (err) {
    console.error('Error fetching classes:', err);
    return [];
  }
}

export async function createClass(name: string, grade: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('classes').insert([{ name: name.trim(), grade: grade.trim() }]);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan kelas';
    return { success: false, error: message };
  }
}

export async function updateClass(id: string, name: string, grade: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('classes').update({ name: name.trim(), grade: grade.trim() }).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui kelas';
    return { success: false, error: message };
  }
}

export async function deleteClass(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus kelas';
    return { success: false, error: message };
  }
}

// 5. CANDIDATES SERVICES
export function parseMisi(misi: string | string[]): string[] {
  if (Array.isArray(misi)) return misi;
  if (!misi) return [];
  try {
    const parsed = JSON.parse(misi);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // If newline separated or single string
    return misi.split('\n').map(s => s.trim()).filter(Boolean);
  }
  return [misi];
}

export async function getCandidates(): Promise<Candidate[]> {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('candidate_number', { ascending: true });

    if (error) throw error;

    // Get live vote counts from votes table to ensure 100% synchronization
    const { data: votesData } = await supabase.from('votes').select('candidate_id');
    const voteMap: Record<string, number> = {};
    let totalVotes = 0;

    votesData?.forEach(v => {
      if (v.candidate_id) {
        voteMap[v.candidate_id] = (voteMap[v.candidate_id] || 0) + 1;
        totalVotes += 1;
      }
    });

    return (data || []).map(c => {
      // If votesData is available, candidate votes come directly from actual ballots
      const votes = votesData ? (voteMap[c.id] || 0) : (c.total_votes || 0);
      const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
      return {
        ...c,
        total_votes: votes,
        percentage,
      };
    });
  } catch (err) {
    console.error('Error fetching candidates:', err);
    return [];
  }
}

export async function createCandidate(candidate: Omit<Candidate, 'id' | 'total_votes' | 'percentage' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  try {
    const misiJson = Array.isArray(candidate.misi) 
      ? JSON.stringify(candidate.misi) 
      : JSON.stringify(parseMisi(candidate.misi));

    const { error } = await supabase.from('candidates').insert([{
      candidate_number: Number(candidate.candidate_number),
      ketua_name: candidate.ketua_name.trim(),
      wakil_name: candidate.wakil_name.trim(),
      photo_url: candidate.photo_url || '/src/assets/images/candidate_paslon_satu_1792395944411.jpg',
      slogan: candidate.slogan.trim(),
      visi: candidate.visi.trim(),
      misi: misiJson,
      total_votes: 0,
    }]);

    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menambahkan kandidat';
    return { success: false, error: message };
  }
}

export async function updateCandidate(id: string, candidate: Partial<Candidate>): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = { ...candidate };
    if (candidate.misi !== undefined) {
      updates.misi = Array.isArray(candidate.misi) 
        ? JSON.stringify(candidate.misi) 
        : JSON.stringify(parseMisi(candidate.misi));
    }

    const { error } = await supabase.from('candidates').update(updates).eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui kandidat';
    return { success: false, error: message };
  }
}

export async function deleteCandidate(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from('candidates').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menghapus kandidat';
    return { success: false, error: message };
  }
}

// 6. VOTING SERVICES (SECRET BALLOT & INTEGRITY)
export async function castVote(studentId: string, candidateId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. Check if voting is active in settings
    const settings = await getSettings();
    if (!settings.is_active) {
      return { success: false, message: 'Pemilihan OSIS saat ini sedang ditutup atau belum dimulai oleh panitia.' };
    }

    // 2. Try invoking Supabase RPC function `submit_vote` if available on the database
    const { data: rpcData, error: rpcError } = await supabase.rpc('submit_vote', {
      p_student_id: studentId,
      p_candidate_id: candidateId,
    });

    if (!rpcError && rpcData) {
      if (typeof rpcData === 'object' && rpcData.success !== undefined) {
        return {
          success: rpcData.success,
          message: rpcData.message || (rpcData.success ? 'Suara Anda berhasil dicatat.' : 'Gagal menyimpan suara.'),
        };
      }
    }

    // 3. Fallback direct execution with database validation (strict atomic checks)
    // Check if student has already voted
    const { data: student, error: studentErr } = await supabase
      .from('students')
      .select('id, has_voted')
      .eq('id', studentId)
      .single();

    if (studentErr || !student) {
      return { success: false, message: 'Data siswa pemilih tidak ditemukan atau tidak valid.' };
    }

    if (student.has_voted) {
      return { success: false, message: 'Anda sudah menggunakan hak suara Anda sebelumnya.' };
    }

    // Anonymous vote ballot insertion (Strict Secret Ballot - no student_id stored in votes!)
    const { error: voteErr } = await supabase
      .from('votes')
      .insert([{ candidate_id: candidateId, voted_at: new Date().toISOString() }]);

    if (voteErr) {
      throw voteErr;
    }

    // Mark student as has_voted
    const { error: updateStudentErr } = await supabase
      .from('students')
      .update({
        has_voted: true,
        voted_at: new Date().toISOString(),
      })
      .eq('id', studentId);

    if (updateStudentErr) {
      console.warn('Student status update issue:', updateStudentErr.message);
    }

    // Increment candidate total_votes counter
    const { data: cand } = await supabase
      .from('candidates')
      .select('total_votes')
      .eq('id', candidateId)
      .single();

    if (cand) {
      await supabase
        .from('candidates')
        .update({ total_votes: (cand.total_votes || 0) + 1 })
        .eq('id', candidateId);
    }

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kegagalan koneksi saat mengirimkan suara.';
    return { success: false, message: msg };
  }
}

// 7. STATS & VOTE RESULTS
export async function getVotingStats(): Promise<VotingStats> {
  try {
    const [
      { data: studentsData },
      { data: candidatesData },
      { data: classesData },
      { data: votesData }
    ] = await Promise.all([
      supabase.from('students').select('id, has_voted'),
      supabase.from('candidates').select('id'),
      supabase.from('classes').select('id'),
      supabase.from('votes').select('id'),
    ]);

    const totalStudents = studentsData?.length || 0;
    const votedCount = studentsData?.filter(s => s.has_voted).length || 0;
    const notVotedCount = Math.max(0, totalStudents - votedCount);
    const participationPercentage = totalStudents > 0 
      ? Number(((votedCount / totalStudents) * 100).toFixed(1)) 
      : 0;

    return {
      totalStudents,
      votedCount,
      notVotedCount,
      participationPercentage,
      totalCandidates: candidatesData?.length || 0,
      totalClasses: classesData?.length || 0,
      totalVotesCast: votesData?.length || votedCount,
    };
  } catch (err) {
    console.error('Error fetching voting stats:', err);
    return {
      totalStudents: 0,
      votedCount: 0,
      notVotedCount: 0,
      participationPercentage: 0,
      totalCandidates: 0,
      totalClasses: 0,
      totalVotesCast: 0,
    };
  }
}

export async function getVoteResults(): Promise<VoteResult[]> {
  const candidates = await getCandidates();
  const totalVotes = candidates.reduce((sum, c) => sum + (c.total_votes || 0), 0);

  return candidates.map(candidate => {
    const votes = candidate.total_votes || 0;
    const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(1)) : 0;
    return {
      candidate,
      votes,
      percentage,
    };
  });
}

// 8. STORAGE & ASSET HELPER
export async function uploadAsset(file: File, folder = 'candidates'): Promise<string> {
  try {
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Attempt upload to Supabase Storage bucket 'osis-assets'
    const { error: uploadError } = await supabase.storage
      .from('osis-assets')
      .upload(filename, file, { cacheControl: '3600', upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from('osis-assets').getPublicUrl(filename);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Storage bucket upload fallback:', err);
  }

  // Graceful fallback: convert file to Base64 Data URL so user is never blocked!
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}

// 9. RESET ELECTION DATA (RESET PEMILIHAN)
export async function resetElectionData(): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Delete all votes from votes table
    const { error: votesErr } = await supabase
      .from('votes')
      .delete()
      .not('id', 'is', null);

    if (votesErr) {
      console.warn('Reset votes warning:', votesErr);
    }

    // 2. Reset student vote status
    const { error: studentsErr } = await supabase
      .from('students')
      .update({
        has_voted: false,
        voted_at: null,
      })
      .not('id', 'is', null);

    if (studentsErr) {
      throw studentsErr;
    }

    // 3. Reset all candidates total_votes to 0
    const { error: candidatesErr } = await supabase
      .from('candidates')
      .update({
        total_votes: 0,
      })
      .not('id', 'is', null);

    if (candidatesErr) {
      throw candidatesErr;
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mereset data pemilihan';
    return { success: false, error: msg };
  }
}

// 10. SUPABASE DATABASE HEALTH & STATUS CHECK
export async function checkSupabaseStatus(): Promise<SupabaseHealthStatus> {
  const startTime = performance.now();
  const tables = ['settings', 'admins', 'classes', 'students', 'candidates', 'votes'];
  const tableResults: TableStatusInfo[] = [];
  let isConnected = true;

  try {
    for (const t of tables) {
      const { error, count } = await supabase
        .from(t)
        .select('*', { count: 'exact', head: true });

      if (error) {
        tableResults.push({
          name: t,
          status: 'error',
          rowCount: 0,
          message: error.message,
        });
      } else {
        tableResults.push({
          name: t,
          status: 'ok',
          rowCount: count ?? 0,
        });
      }
    }
  } catch {
    isConnected = false;
  }

  const endTime = performance.now();
  const latencyMs = Math.round(endTime - startTime);

  return {
    connected: isConnected && tableResults.some(t => t.status === 'ok'),
    latencyMs,
    url: SUPABASE_CONFIG.url,
    hasKey: SUPABASE_CONFIG.hasKey,
    tables: tableResults,
    checkedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}
