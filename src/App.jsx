import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection,
  query
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  CheckCircle2, 
  Circle, 
  Layout, 
  BookOpen, 
  Code2, 
  BarChart3, 
  RotateCcw, 
  Smartphone,
  ChevronRight,
  Trophy,
  Target
} from 'lucide-react';

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyD2bBu4ugV6D_ggx9Ro9Pwpo8FVnlchmGU",
    authDomain: "my-roadmap-f0b43.firebaseapp.com",
    projectId: "my-roadmap-f0b43",
    storageBucket: "my-roadmap-f0b43.firebasestorage.app",
    messagingSenderId: "829008754321",
    appId: "1:829008754321:web:42d76f599f925c76323130",
    measurementId: "G-SBBJNM42W9"
  };


const ROADMAP_DATA = [
  {
    id: 0,
    title: 'Month 1',
    subtitle: 'Foundation & UI/UX',
    icon: <Layout className="w-5 h-5" />,
    description: 'Learn how to structure information. Master HTML5 semantics and Google UI/UX principles.',
    tasks: [
      { id: 'm1-1', text: 'FreeCodeCamp Responsive Web Design', type: 'Course' },
      { id: 'm1-2', text: 'Google UX Design (Audit Course 1)', type: 'Cert' },
      { id: 'm1-3', text: 'Master CSS Flexbox/Grid layouts', type: 'Skill' },
      { id: 'm1-4', text: 'Build 3 Semantic HTML Wireframes', type: 'Project' }
    ],
    stats: { design: 30, code: 15, logic: 5, viz: 0 }
  },
  {
    id: 1,
    title: 'Month 2',
    subtitle: 'Modern Styling (Tailwind)',
    icon: <Code2 className="w-5 h-5" />,
    description: 'Stop writing raw CSS. Master utility-first design and mobile responsiveness.',
    tasks: [
      { id: 'm2-1', text: 'Scrimba Tailwind CSS Course', type: 'Course' },
      { id: 'm2-2', text: 'Build a fully responsive Dashboard', type: 'Project' },
      { id: 'm2-3', text: 'Implement Dark/Light mode logic', type: 'Skill' },
      { id: 'm2-4', text: 'Design System Documentation', type: 'Architect' }
    ],
    stats: { design: 65, code: 45, logic: 20, viz: 10 }
  },
  {
    id: 2,
    title: 'Month 3',
    subtitle: 'JS Engine & Interactivity',
    icon: <Target className="w-5 h-5" />,
    description: 'The brain of the app. Master DOM manipulation, state, and asynchronous data.',
    tasks: [
      { id: 'm3-1', text: 'JS Algorithms & Data Structures', type: 'Course' },
      { id: 'm3-2', text: 'Complete 15 JavaScript30 projects', type: 'Project' },
      { id: 'm3-3', text: 'Build a custom State Manager', type: 'Logic' },
      { id: 'm3-4', text: 'Fetch & Parse JSON APIs', type: 'Data' }
    ],
    stats: { design: 75, code: 80, logic: 70, viz: 30 }
  },
  {
    id: 3,
    title: 'Month 4',
    subtitle: 'Mastering Data Viz & SPA',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'The final level. Build high-performance interactive reports like a pro.',
    tasks: [
      { id: 'm4-1', text: 'FreeCodeCamp Data Visualization', type: 'Cert' },
      { id: 'm4-2', text: 'Master Chart.js & Recharts', type: 'Skill' },
      { id: 'm4-3', text: 'Build a full Firestore SPA', type: 'Project' },
      { id: 'm4-4', text: 'Optimize Performance & Deployment', type: 'Architect' }
    ],
    stats: { design: 95, code: 95, logic: 90, viz: 100 }
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load Progress from Firestore
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setProgress(docSnap.data().tasks || {});
      } else {
        setProgress({});
      }
      setLoading(false);
    }, (err) => {
      console.error("Firestore error", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleTask = async (taskId) => {
    if (!user) return;
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress');
    await setDoc(docRef, { tasks: newProgress }, { merge: true });
  };

  const resetProgress = async () => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'progress');
    await setDoc(docRef, { tasks: {} });
    setShowResetModal(false);
  };

  const overallProgress = useMemo(() => {
    const total = ROADMAP_DATA.reduce((acc, curr) => acc + curr.tasks.length, 0);
    const completed = Object.values(progress).filter(Boolean).length;
    return Math.round((completed / total) * 100);
  }, [progress]);

  const chartData = useMemo(() => {
    const base = { name: 'Start', design: 0, code: 0, logic: 0, viz: 0 };
    return [base, ...ROADMAP_DATA.map(m => ({
      name: m.title,
      ...m.stats
    }))];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-teal-200 rounded-full mb-4"></div>
          <p className="text-stone-500 font-medium">Syncing progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-24 md:pb-8 flex flex-col">
      {/* Top App Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-20 px-4 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-1.5 rounded-lg text-white">
            <Smartphone size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight">Mastery Roadmap</h1>
        </div>
        <button 
          onClick={() => setShowResetModal(true)}
          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
          title="Reset Progress"
        >
          <RotateCcw size={18} />
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 pt-6 space-y-6">
        
        {/* Progress Card */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider">Your Journey</p>
              <h2 className="text-2xl font-black text-stone-800">{overallProgress}% Complete</h2>
            </div>
            <Trophy className={`w-8 h-8 ${overallProgress === 100 ? 'text-amber-500' : 'text-stone-200'}`} />
          </div>
          <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-teal-600 h-full transition-all duration-700 ease-out" 
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </section>

        {/* Dynamic Chart Section */}
        <section className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 overflow-hidden">
          <h3 className="text-sm font-bold text-stone-500 uppercase mb-4">Skill Projection</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#78716c'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="code" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorLevel)" />
                <Area type="monotone" dataKey="design" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tasks List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-stone-800">{ROADMAP_DATA[activeTab].title} Focus</h3>
            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-md">
              {ROADMAP_DATA[activeTab].subtitle}
            </span>
          </div>
          
          <div className="space-y-3">
            {ROADMAP_DATA[activeTab].tasks.map(task => (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all active:scale-[0.98] ${
                  progress[task.id] 
                    ? 'bg-white border-teal-100 opacity-60' 
                    : 'bg-white border-stone-200 shadow-sm'
                }`}
              >
                <div className={`${progress[task.id] ? 'text-teal-600' : 'text-stone-300'}`}>
                  {progress[task.id] ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${progress[task.id] ? 'line-through text-stone-400' : 'text-stone-800'}`}>
                    {task.text}
                  </p>
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-tight">{task.type}</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-30 shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
        {ROADMAP_DATA.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              activeTab === idx ? 'text-teal-600' : 'text-stone-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeTab === idx ? 'bg-teal-50' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-bold">{tab.title}</span>
          </button>
        ))}
      </nav>

      {/* Reset Modal Overlay */}
      {showResetModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-xl font-bold text-stone-900 mb-2">Reset Progress?</h3>
            <p className="text-stone-500 text-sm mb-6">
              This will permanently clear all your checked tasks from the cloud database. You cannot undo this.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-3 font-bold text-stone-600 bg-stone-100 rounded-2xl hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={resetProgress}
                className="flex-1 py-3 font-bold text-white bg-red-500 rounded-2xl hover:bg-red-600 transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}