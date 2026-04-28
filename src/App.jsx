import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle2, Circle, Layout, Code2, BarChart3, RotateCcw, Smartphone, Trophy, Target, LogOut } from 'lucide-react';

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyD2bBu4ugV6D_ggx9Ro9Pwpo8FVnlchmGU",
    authDomain: "my-roadmap-f0b43.firebaseapp.com",
    projectId: "my-roadmap-f0b43",
    storageBucket: "my-roadmap-f0b43.firebasestorage.app",
    messagingSenderId: "829008754321",
    appId: "1:829008754321:web:42d76f599f925c76323130",
    measurementId: "G-SBBJNM42W9"

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const ROADMAP_DATA = [
  {
    id: 0,
    title: 'Month 1',
    subtitle: 'Foundation & UI/UX',
    icon: <Layout className="w-5 h-5" />,
    tasks: [
      { id: 'm1-1', text: 'FreeCodeCamp Responsive Web Design', type: 'Course' },
      { id: 'm1-2', text: 'Google UX Design (Audit)', type: 'Cert' },
      { id: 'm1-3', text: 'Master CSS Flexbox/Grid', type: 'Skill' }
    ],
    stats: { design: 30, code: 15 }
  },
  {
    id: 1,
    title: 'Month 2',
    subtitle: 'Tailwind Mastery',
    icon: <Code2 className="w-5 h-5" />,
    tasks: [
      { id: 'm2-1', text: 'Scrimba Tailwind CSS Course', type: 'Course' },
      { id: 'm2-2', text: 'Build Responsive Dashboard', type: 'Project' }
    ],
    stats: { design: 65, code: 45 }
  },
  {
    id: 2,
    title: 'Month 3',
    subtitle: 'JavaScript Engine',
    icon: <Target className="w-5 h-5" />,
    tasks: [
      { id: 'm3-1', text: 'JS Algorithms & Data Structures', type: 'Course' },
      { id: 'm3-2', text: '15 JavaScript30 projects', type: 'Project' }
    ],
    stats: { design: 75, code: 80 }
  },
  {
    id: 3,
    title: 'Month 4',
    subtitle: 'Data Viz & SPAs',
    icon: <BarChart3 className="w-5 h-5" />,
    tasks: [
      { id: 'm4-1', text: 'FreeCodeCamp Data Viz', type: 'Cert' },
      { id: 'm4-2', text: 'Build full Firestore SPA', type: 'Project' }
    ],
    stats: { design: 95, code: 95 }
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'roadmap_users', user.uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setProgress(docSnap.data().tasks || {});
    });
  }, [user]);

  const handleLogin = () => signInWithPopup(auth, provider);
  const handleLogout = () => signOut(auth);

  const toggleTask = async (taskId) => {
    if (!user) return;
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    await setDoc(doc(db, 'roadmap_users', user.uid), { 
      tasks: newProgress,
      userEmail: user.email,
      lastUpdated: new Date()
    }, { merge: true });
  };

  const overallProgress = useMemo(() => {
    const total = ROADMAP_DATA.reduce((acc, curr) => acc + curr.tasks.length, 0);
    const completed = Object.values(progress).filter(Boolean).length;
    return Math.round((completed / total) * 100) || 0;
  }, [progress]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-stone-50">Loading...</div>;

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-teal-600 p-4 rounded-3xl text-white mb-6 shadow-xl">
            <Target size={48} />
        </div>
        <h1 className="text-3xl font-black text-stone-900 mb-2">Mastery Roadmap</h1>
        <p className="text-stone-500 mb-8 max-w-xs">Join the program, track your progress, and become a Pro SPA Architect.</p>
        <button 
          onClick={handleLogin}
          className="flex items-center gap-3 bg-white border border-stone-200 px-8 py-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5" alt="G" />
          Continue with Google
        </button>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="min-h-screen bg-stone-50 pb-24 md:pb-10 font-sans">
      <header className="bg-white border-b p-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={user.photoURL} className="w-8 h-8 rounded-full border border-teal-100" alt="me" />
          <div>
            <h1 className="font-bold text-sm leading-tight">Hi, {user.displayName.split(' ')[0]}</h1>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{overallProgress}% Done</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-stone-400 hover:text-red-500 transition-colors"><LogOut size={18} /></button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        <section className="bg-white rounded-2xl p-5 shadow-sm border">
          <div className="flex justify-between items-end mb-4">
            <div><p className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Your Progress</p><h2 className="text-2xl font-black">{overallProgress}%</h2></div>
            <Trophy className={overallProgress === 100 ? 'text-amber-500' : 'text-stone-200'} />
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${overallProgress}%` }} /></div>
        </section>

        <div className="space-y-3">
          <h3 className="font-bold px-1 text-stone-800">{ROADMAP_DATA[activeTab].subtitle}</h3>
          {ROADMAP_DATA[activeTab].tasks.map(task => (
            <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full bg-white p-4 rounded-xl border border-stone-100 flex items-center gap-4 hover:border-teal-200 transition-all">
              <div className={progress[task.id] ? 'text-teal-600' : 'text-stone-300'}>{progress[task.id] ? <CheckCircle2 size={24} /> : <Circle size={24} />}</div>
              <div className="text-left">
                <p className={`font-semibold text-sm ${progress[task.id] ? 'line-through text-stone-300' : 'text-stone-800'}`}>{task.text}</p>
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
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
