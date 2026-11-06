-- ========================================================
-- SISTEM PEMILIHAN OSIS (E-VOTING OSIS)
-- SUPABASE FULL SCHEMA, CONSTRAINTS, RLS & RPC FUNCTIONS
-- ========================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL PENGATURAN (SETTINGS)
CREATE TABLE IF NOT EXISTS public.settings (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA / SMK NEGERI NUSANTARA',
    school_logo TEXT DEFAULT '/src/assets/images/eosis_school_logo_1792395943704.jpg',
    election_title VARCHAR(255) NOT NULL DEFAULT 'Pemilihan Ketua & Wakil Ketua OSIS',
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed default settings row if empty
INSERT INTO public.settings (id, school_name, school_logo, election_title, election_period, is_active)
VALUES (1, 'SMA NEGERI 1 NUSANTARA', '/src/assets/images/eosis_school_logo_1792395943704.jpg', 'Pemilihan Ketua & Wakil Ketua OSIS', '2026/2027', true)
ON CONFLICT (id) DO NOTHING;

-- 3. TABEL ADMIN
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nama VARCHAR(255) NOT NULL DEFAULT 'Administrator OSIS',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Default admin: username 'admin', password 'admin123'
INSERT INTO public.admins (username, password_hash, nama)
VALUES ('admin', 'admin123', 'Administrator OSIS')
ON CONFLICT (username) DO NOTHING;

-- 4. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    grade VARCHAR(20) NOT NULL DEFAULT 'X',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL SISWA (USER PEMILIH)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nisn VARCHAR(20) UNIQUE NOT NULL,
    nama VARCHAR(255) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    class_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) DEFAULT 'L',
    has_voted BOOLEAN NOT NULL DEFAULT false,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABEL CALON KANDIDAT (PASLON)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_number INT UNIQUE NOT NULL,
    ketua_name VARCHAR(255) NOT NULL,
    wakil_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    slogan TEXT,
    visi TEXT NOT NULL,
    misi TEXT NOT NULL, -- JSON array of strings
    total_votes INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABEL SURAT SUARA (VOTES) - ASAS RAHASIA / SECRET BALLOT
-- Sengaja TIDAK menyimpan student_id agar pilihan siswa 100% anonim dan terjaga kerahasiaannya
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    voted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. DATABASE RPC FUNCTION: SUBMIT VOTE ATOMIK & AMAN
-- Memvalidasi bahwa siswa belum pernah memilih dan pemilihan aktif
CREATE OR REPLACE FUNCTION public.submit_vote(
    p_student_id UUID,
    p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_is_active BOOLEAN;
    v_candidate_exists BOOLEAN;
BEGIN
    -- 1. Cek status aktif pemilihan
    SELECT is_active INTO v_is_active FROM public.settings WHERE id = 1;
    IF v_is_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Pemilihan OSIS saat ini sedang ditutup.');
    END IF;

    -- 2. Cek apakah kandidat valid
    SELECT EXISTS(SELECT 1 FROM public.candidates WHERE id = p_candidate_id) INTO v_candidate_exists;
    IF NOT v_candidate_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kandidat yang dipilih tidak valid.');
    END IF;

    -- 3. Lock student row dan cek apakah sudah memilih
    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF v_has_voted IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak ditemukan.');
    END IF;

    IF v_has_voted = TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara Anda sebelumnya.');
    END IF;

    -- 4. Masukkan suara anonim ke tabel votes
    INSERT INTO public.votes (candidate_id, voted_at)
    VALUES (p_candidate_id, timezone('utc'::text, now()));

    -- 5. Perbarui status siswa menjadi sudah memilih
    UPDATE public.students
    SET has_voted = TRUE,
        voted_at = timezone('utc'::text, now())
    WHERE id = p_student_id;

    -- 6. Tambahkan total perolehan suara kandidat
    UPDATE public.candidates
    SET total_votes = total_votes + 1
    WHERE id = p_candidate_id;

    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat.');
END;
$$;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Read & Write policies for anon client
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public Update Settings" ON public.settings FOR UPDATE USING (true);

CREATE POLICY "Public Read Classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Public All Classes" ON public.classes FOR ALL USING (true);

CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public All Students" ON public.students FOR ALL USING (true);

CREATE POLICY "Public Read Candidates" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public All Candidates" ON public.candidates FOR ALL USING (true);

CREATE POLICY "Public Read Votes" ON public.votes FOR SELECT USING (true);
CREATE POLICY "Public Insert Votes" ON public.votes FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Admins" ON public.admins FOR SELECT USING (true);
CREATE POLICY "Public Update Admins" ON public.admins FOR UPDATE USING (true);

-- 10. STORAGE BUCKET CONFIGURATION (Jalankan jika Supabase Storage diaktifkan)
INSERT INTO storage.buckets (id, name, public)
VALUES ('osis-assets', 'osis-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access Storage"
ON storage.objects FOR ALL
USING (bucket_id = 'osis-assets')
WITH CHECK (bucket_id = 'osis-assets');
