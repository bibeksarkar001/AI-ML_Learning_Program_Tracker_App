import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, Layout, Code2, BarChart3, RotateCcw, Smartphone, Trophy, Target } from 'lucide-react';

// 1. YOUR FIREBASE CONFIG (Replace with your actual keys)
const firebaseConfig = {
    apiKey: "AIzaSyD2bBu4ugV6D_ggx9Ro9Pwpo8FVnlchmGU",
    authDomain: "my-roadmap-f0b43.firebaseapp.com",
    projectId: "my-roadmap-f0b43",
    storageBucket: "my-roadmap-f0b43.firebasestorage.app",
    messagingSenderId: "829008754321",
    appId: "1:829008754321:web:42d76f599f925c76323130",
    measurementId: "G-SBBJNM42W9"
};

// 2. INITIALIZE FIREBASE (This MUST be before the App function)
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'learning-roadmap-tracker';

const ROADMAP_DATA = [
  {
    id: 0,
    title: 'Month 1',
    subtitle: 'Foundation & UI/UX',
    icon: <Layout className="w-5 h-5" />,
    description: 'Learn structure & user experience principles.',
    tasks: [
      { id: 'm1-1', text: 'FreeCodeCamp Responsive Web Design', type: 'Course' },
      { id: 'm1-2', text: 'Google UX Design (Audit)', type: 'Cert' },
      { id: 'm1-3', text: 'Master CSS Flexbox/Grid', type: 'Skill' }
    ],
    stats: { design: 30, code: 15, logic: 5, viz: 0 }
  },
  {
    id: 1,
    title: 'Month 2',
    subtitle: 'Tailwind Mastery',
    icon: <Code2 className="w-5 h-5" />,
    description: 'Master utility-first design and responsiveness.',
    tasks: [
      { id: 'm2-1', text: 'Scrimba Tailwind CSS Course', type: 'Course' },
      { id: 'm2-2', text: 'Build Responsive Dashboard', type: 'Project' }
    ],
    stats: { design: 65, code: 45, logic: 20, viz: 10 }
  },
  {
    id: 2,
    title: 'Month 3',
    subtitle: 'JavaScript Engine',
    icon: <Target className="w-5 h-5" />,
    description: 'Master DOM logic, state, and APIs.',
    tasks: [
      { id: 'm3-1', text: 'JS Algorithms & Data Structures', type: 'Course' },
      { id: 'm3-2', text: '15 JavaScript30 projects', type: 'Project' }
    ],
    stats: { design: 75, code: 80, logic: 70, viz: 30 }
  },
  {
    id: 3,
    title: 'Month 4',
    subtitle: 'Data Viz & SPAs',
    icon: <BarChart3 className="w-5 h-5" />,
    description: 'Build high-performance interactive reports.',
    tasks: [
      { id: 'm4-1', text: 'FreeCodeCamp Data Viz', type: 'Cert' },
      { id: 'm4-2', text: 'Build full Firestore SPA', type: 'Project' }
    ],
    stats: { design: 95, code: 95, logic: 90, viz: 100 }
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'roadmap_users', user.uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setProgress(docSnap.data().tasks || {});
      setLoading(false);
    });
  }, [user]);

  const toggleTask = async (taskId) => {
    if (!user) return;
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    await setDoc(doc(db, 'roadmap_users', user.uid), { tasks: newProgress }, { merge: true });
  };

  const overallProgress = useMemo(() => {
    const total = ROADMAP_DATA.reduce((acc, curr) => acc + curr.tasks.length, 0);
    const completed = Object.values(progress).filter(Boolean).length;
    return Math.round((completed / total) * 100) || 0;
  }, [progress]);

  const chartData = useMemo(() => [
    { name: 'Start', code: 0, design: 0 },
    ...ROADMAP_DATA.map(m => ({ name: m.title, code: m.stats.code, design: m.stats.design }))
  ], []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-stone-500">Syncing...</div>;

  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-10 font-sans">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 p-1.5 rounded-lg text-white"><Smartphone size={20} /></div>
          <h1 className="font-bold">Mastery Tracker</h1>
        </div>
        <button onClick={() => setShowResetModal(true)} className="p-2 text-stone-400"><RotateCcw size={18} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <section className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex justify-between items-end mb-4">
            <div><p className="text-xs font-bold text-stone-400 uppercase">Progress</p><h2 className="text-2xl font-black">{overallProgress}%</h2></div>
            <Trophy className={overallProgress === 100 ? 'text-amber-500' : 'text-stone-200'} />
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${overallProgress}%` }} /></div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm border h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" hide />
              <Tooltip />
              <Area type="monotone" dataKey="code" stroke="#0d9488" fill="#0d9488" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <div className="space-y-3">
          <h3 className="font-bold px-1">{ROADMAP_DATA[activeTab].subtitle}</h3>
          {ROADMAP_DATA[activeTab].tasks.map(task => (
            <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full bg-white p-4 rounded-xl border flex items-center gap-4">
              <div className={progress[task.id] ? 'text-teal-600' : 'text-stone-300'}>{progress[task.id] ? <CheckCircle2 size={24} /> : <Circle size={24} />}</div>
              <div className="text-left">
                <p className={`font-semibold text-sm ${progress[task.id] ? 'line-through text-stone-300' : ''}`}>{task.text}</p>
                <span className="text-[10px] font-bold text-stone-400 uppercase">{task.type}</span>
              </div>
            </button>
          ))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex justify-around">
        {ROADMAP_DATA.map((tab, idx) => (
          <button key={idx} onClick={() => setActiveTab(idx)} className={`flex flex-col items-center gap-1 ${activeTab === idx ? 'text-teal-600' : 'text-stone-400'}`}>
            {tab.icon}<span className="text-[10px] font-bold">{tab.title}</span>
          </button>
        ))}
      </nav>

      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-xs w-full">
            <h3 className="font-bold text-lg mb-2">Reset Progress?</h3>
            <div className="flex gap-2">
              <button onClick={() => setShowResetModal(false)} className="flex-1 bg-stone-100 py-2 rounded-xl font-bold">Cancel</button>
              <button onClick={async () => { await setDoc(doc(db, 'roadmap_users', user.uid), { tasks: {} }); setShowResetModal(false); }} className="flex-1 bg-red-500 text-white py-2 rounded-xl font-bold">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. RENDER LOGIC
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
