
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentList } from './components/StudentList';
import { AssessmentForm } from './components/AssessmentForm';
import { ClassList } from './components/ClassList';
import { StudentHistory } from './components/StudentHistory';
import { TextGenerator } from './components/TextGenerator';
import { CompetencyManager } from './components/CompetencyManager';
import { RemedialList } from './components/RemedialList';
import { CoordinationPanel } from './components/CoordinationPanel';
import { Auth } from './components/Auth';
import { ViewState, Student, Assessment, SchoolClass, UserRole, UserProfile, Competency } from './types';
import { Menu, CheckCircle, User, X, Users, School, Loader2, AlertTriangle, Trash2, Check, ArrowRight, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) fetchProfile(session.user.id);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        clearData();
      } else if (session?.user) {
        fetchProfile(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase!.from('profiles').select('*').eq('id', uid).single();
    if (data) setUserProfile(data);
  };

  const clearData = () => {
    setStudents([]);
    setAssessments([]);
    setClasses([]);
    setCompetencies([]);
    setCurrentView(ViewState.DASHBOARD);
  };

  useEffect(() => {
    if (session && supabase) {
      loadAllData();
    }
  }, [session]);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [resClasses, resStudents, resAssessments, resComps] = await Promise.all([
        supabase!.from('classes').select('*'),
        supabase!.from('students').select('*'),
        supabase!.from('assessments').select('*').order('date', { ascending: false }),
        supabase!.from('competencies').select('*').order('name', { ascending: true })
      ]);
      if (resClasses.data) setClasses(resClasses.data);
      if (resStudents.data) setStudents(resStudents.data);
      if (resAssessments.data) setAssessments(resAssessments.data);
      if (resComps.data) setCompetencies(resComps.data);
    } catch (err) {
      console.error("Erro Supabase Load:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSaveStatus = () => {
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 800);
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const addStudent = async (ns: Omit<Student, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('students').insert([ns]).select();
    if (error) {
      alert("Erro ao cadastrar aluno: " + error.message);
      return;
    }
    if (data) setStudents([data[0], ...students]);
  };

  const updateStudent = async (us: Student) => {
    handleSaveStatus();
    const { error } = await supabase!.from('students').update(us).eq('id', us.id);
    if (error) {
      alert("Erro ao atualizar aluno: " + error.message);
      return;
    }
    setStudents(students.map(s => s.id === us.id ? us : s));
  };

  const executeDeleteStudent = async () => {
    if (!studentToDelete) return;
    handleSaveStatus();
    const { error } = await supabase!.from('students').delete().eq('id', studentToDelete.id);
    if (!error) {
      setStudents(students.filter(s => s.id !== studentToDelete.id));
      setStudentToDelete(null);
    } else {
      alert("Erro ao excluir: " + error.message);
    }
  };

  const addClass = async (nc: Omit<SchoolClass, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('classes').insert([{ 
      ...nc, 
      teacherId: userProfile?.id 
    }]).select();
    
    if (error) {
      alert("Erro ao cadastrar turma: " + error.message);
      return;
    }
    if (data) setClasses([data[0], ...classes]);
  };

  const updateClass = async (c: SchoolClass) => {
    handleSaveStatus();
    const { error } = await supabase!.from('classes').update(c).eq('id', c.id);
    if (error) {
      alert("Erro ao atualizar turma: " + error.message);
      return;
    }
    setClasses(classes.map(cl => cl.id === c.id ? c : cl));
  };

  const deleteClass = async (id: string) => {
    if (!confirm("Excluir esta turma?")) return;
    const { error } = await supabase!.from('classes').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir turma: " + error.message);
      return;
    }
    setClasses(classes.filter(c => c.id !== id));
  };

  const saveAssessment = async (a: Omit<Assessment, 'id'>) => {
    handleSaveStatus();
    const { data, error } = await supabase!.from('assessments').insert([{ 
      ...a, 
      teacherId: userProfile?.id 
    }]).select();
    
    if (error) {
      alert("Erro ao salvar avaliação: " + error.message);
      return;
    }
    if (data) {
      setAssessments([data[0], ...assessments]);
      setCurrentView(ViewState.DASHBOARD);
    }
  };

  // Funções para Gerenciamento de Competências (Critérios)
  const addCompetency = async (nc: Omit<Competency, 'id'>) => {
    handleSaveStatus();
    // CORREÇÃO: Usando 'teacherId' para manter o padrão das outras tabelas
    const { data, error } = await supabase!.from('competencies').insert([{ 
      ...nc, 
      teacherId: userProfile?.id 
    }]).select();

    if (error) {
      alert("Erro ao salvar critério: " + error.message);
      console.error("Supabase Error (addCompetency):", error);
      return;
    }
    if (data) setCompetencies([...competencies, data[0]]);
  };

  const updateCompetency = async (uc: Competency) => {
    handleSaveStatus();
    const { error } = await supabase!.from('competencies').update(uc).eq('id', uc.id);
    if (error) {
      alert("Erro ao atualizar critério: " + error.message);
      return;
    }
    setCompetencies(competencies.map(c => c.id === uc.id ? uc : c));
  };

  const deleteCompetency = async (id: string) => {
    if (!confirm("Excluir este critério de avaliação?")) return;
    handleSaveStatus();
    const { error } = await supabase!.from('competencies').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir critério: " + error.message);
      return;
    }
    setCompetencies(competencies.filter(c => c.id !== id));
  };

  const toggleRemedial = async (studentId: string, details?: any) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    handleSaveStatus();
    const isEntering = !student.inRemedial;
    
    const update = {
      inRemedial: isEntering,
      remedialStartDate: isEntering ? (details?.startDate || new Date().toISOString()) : null,
      remedialEntryLevel: isEntering ? (details?.entryLevel || student.readingLevel) : null,
    };

    const { error } = await supabase!.from('students').update(update).eq('id', studentId);
    if (error) {
      alert("Erro ao atualizar reforço: " + error.message);
      return;
    }
    
    setStudents(students.map(s => s.id === studentId ? { 
      ...s, 
      inRemedial: isEntering,
      remedialStartDate: update.remedialStartDate as any,
      remedialEntryLevel: update.remedialEntryLevel as any
    } : s));
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  if (authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Autenticando...</p>
    </div>
  );

  if (!session) return <Auth />;

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden relative w-full">
      {/* Backdrop Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] md:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      
      {/* Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-[110] transform transition-transform duration-300 md:relative md:translate-x-0 w-72 md:w-64 shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:block'}
      `}>
        <Sidebar 
          currentView={currentView} 
          onNavigate={(v) => { setCurrentView(v); setMobileMenuOpen(false); }} 
          userRole={userProfile?.role}
          isMobile={true}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
      </div>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-100 p-3 md:p-4 flex items-center justify-between shrink-0 z-30 shadow-sm px-4 md:px-8">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setMobileMenuOpen(true)} className="p-2 md:hidden hover:bg-gray-100 rounded-xl transition-colors"><Menu size={24} /></button>
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-2xl border border-primary-100">
                <Users size={14} className="text-primary-600" />
                <span className="text-[10px] font-black text-primary-700 uppercase tracking-widest">Alunos: {students.length}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {dataLoading && <Loader2 size={16} className="animate-spin text-primary-400" />}
            {saveStatus !== 'idle' && (
              <div className={`text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 border transition-all ${
                saveStatus === 'saving' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'
              }`}>
                {saveStatus === 'saving' ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12}/>}
                <span className="hidden xs:inline uppercase tracking-widest">{saveStatus === 'saving' ? 'PROCESSANDO...' : 'SALVO'}</span>
              </div>
            )}
            
            <button 
              onClick={() => setShowProfileModal(true)} 
              className="flex items-center gap-3 pl-4 py-1.5 pr-2 hover:bg-gray-50 rounded-3xl transition-all border-l-2 border-gray-100 ml-2 focus:outline-none group active:scale-95"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 leading-none">Operador: {userProfile?.role}</p>
                <p className="text-xs font-black text-gray-900 leading-none uppercase truncate max-w-[140px] group-hover:text-primary-600 transition-colors">
                  {userProfile?.name || 'Sessão Ativa'}
                </p>
              </div>
              <div className="bg-gray-900 p-2.5 rounded-2xl shadow-lg border border-gray-800 ring-2 ring-transparent group-hover:ring-primary-100 transition-all">
                <User size={18} className="text-white" />
              </div>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 custom-scrollbar w-full relative">
          <div className="max-w-7xl mx-auto w-full">
            {currentView === ViewState.DASHBOARD && <Dashboard students={students} assessments={assessments} classes={classes} />}
            {currentView === ViewState.COORDINATION_PANEL && <CoordinationPanel assessments={assessments} students={students} classes={classes} />}
            {currentView === ViewState.CLASSES && <ClassList classes={classes} students={students} onAddClass={addClass} onUpdateClass={updateClass} onDeleteClass={deleteClass} onViewStudents={(id) => { setSelectedClassId(id); setCurrentView(ViewState.STUDENTS); }} />}
            {currentView === ViewState.STUDENTS && <StudentList students={students} classes={classes} assessments={assessments} onAddStudent={addStudent} onUpdateStudent={updateStudent} onDeleteStudent={(id) => setStudentToDelete(students.find(s => s.id === id) || null)} onViewHistory={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} onToggleRemedial={(id) => toggleRemedial(id)} initialClassId={selectedClassId} />}
            {currentView === ViewState.STUDENT_HISTORY && students.find(s => s.id === selectedStudentId) && <StudentHistory student={students.find(s => s.id === selectedStudentId)!} assessments={assessments.filter(a => a.studentId === selectedStudentId)} onBack={() => setCurrentView(ViewState.STUDENTS)} />}
            {currentView === ViewState.ASSESSMENT && <AssessmentForm students={students} classes={classes} onSave={saveAssessment} onCancel={() => setCurrentView(ViewState.DASHBOARD)} />}
            {currentView === ViewState.GENERATOR && <TextGenerator />}
            {currentView === ViewState.REMEDIAL && <RemedialList students={students} classes={classes} onToggleRemedial={toggleRemedial} onViewStudent={(id) => { setSelectedStudentId(id); setCurrentView(ViewState.STUDENT_HISTORY); }} />}
            {currentView === ViewState.COMPETENCIES && <CompetencyManager competencies={competencies} onAdd={addCompetency} onUpdate={updateCompetency} onDelete={deleteCompetency} />}
          </div>
        </div>
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-fade-in ring-1 ring-black/5 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Minha Conta</h2>
              <button onClick={() => setShowProfileModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"><X size={20}/></button>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 shadow-inner">
                <div className="mb-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Operador Logado</p>
                  <p className="font-black text-sm text-gray-900 truncate uppercase">{userProfile?.name}</p>
                </div>
                <div className="mb-4">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">E-mail</p>
                  <p className="font-bold text-xs text-gray-600 truncate">{userProfile?.email}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Nível de Acesso</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                    <CheckCircle size={10} />
                    <p className="font-black text-[10px] uppercase tracking-tight">{userProfile?.role}</p>
                  </div>
                </div>
              </div>
              <button onClick={handleSignOut} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                <LogOut size={16} /> ENCERRAR SESSÃO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl animate-fade-in" onClick={() => setStudentToDelete(null)} />
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 animate-fade-in flex flex-col overflow-hidden ring-1 ring-black/5">
            <div className="p-8 bg-purple-600 text-white flex justify-between items-center relative">
              <div>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none">Confirmar Exclusão</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-80">Ação irreversível de sistema</p>
              </div>
              <button onClick={() => setStudentToDelete(null)} className="p-3 hover:bg-white/20 rounded-full transition-all text-white"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 ring-4 ring-red-50/50">
                  <AlertTriangle size={40} />
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm font-medium">Você está prestes a remover o registro de:</p>
                  <p className="text-lg font-black text-gray-900 uppercase mt-1 tracking-tight">{studentToDelete.name}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setStudentToDelete(null)} className="flex-1 py-4 font-black text-gray-400 text-[11px] uppercase tracking-[0.2em] hover:text-gray-600">CANCELAR</button>
                <button onClick={executeDeleteStudent} className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Check size={16} /> CONFIRMAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
