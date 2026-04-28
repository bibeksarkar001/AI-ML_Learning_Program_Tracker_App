import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

// --- CONFIGURATION ---
// PASTE YOUR ACTUAL FIREBASE KEYS HERE
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
    title: 'Month 1: Structure & Design',
    subtitle: 'Foundation & UI/UX IA',
    icon: '🏗️',
    description: 'Lay the foundation. Before writing complex logic, you must understand how to structure information and design intuitive interfaces. You will learn HTML semantics, basic CSS, and Information Architecture principles.',
    courses: [
      { name: 'Responsive Web Design Certification', provider: 'FreeCodeCamp', link: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/' },
      { name: 'Google UX Design Professional Cert (Audit)', provider: 'Coursera', link: 'https://www.coursera.org/professional-certificates/google-ux-design' }
    ],
    objectives: [
      'Master HTML5 semantic tags for SEO and accessibility',
      'Understand CSS Flexbox & Grid depth',
      'Learn high-fidelity wireframing and prototyping',
      'Grasp Information Architecture (IA) logic'
    ],
    tasks: [
      { id: 'm1-1', text: 'Complete FreeCodeCamp HTML/CSS Basics' },
      { id: 'm1-2', text: 'Build a semantic personal portfolio' },
      { id: 'm1-3', text: 'Audit Google UX Course: Empathize & Define' },
      { id: 'm1-4', text: 'Create a low-fi wireframe for an SPA' }
    ],
    chartData: { design: 30, code: 20, logic: 5, data: 0 }
  },
  {
    id: 1,
    title: 'Month 2: Modern Styling',
    icon: '🎨',
    subtitle: 'Tailwind CSS & Design Systems',
    description: 'Speed up your development and ensure pixel-perfect, responsive designs. Tailwind CSS is the industry standard for rapid UI development without leaving your HTML file.',
    courses: [
      { name: 'Learn Tailwind CSS', provider: 'Scrimba', link: 'https://scrimba.com/learn/tailwind' },
      { name: 'Modern CSS Layouts', provider: 'Web.dev', link: 'https://web.dev/learn/css/' }
    ],
    objectives: [
      'Master utility-first CSS concepts and efficiency',
      'Build fully responsive layouts without custom media queries',
      'Implement consistent design systems and palettes',
      'Handle advanced hover, focus, and group states'
    ],
    tasks: [
      { id: 't2-1', text: 'Master Tailwind Config & Customization' },
      { id: 't2-2', text: 'Rebuild portfolio with Utility-First CSS' },
      { id: 't2-3', text: 'Implement a Dark/Light mode toggle' },
      { id: 't2-4', text: 'Build a multi-column dashboard grid' }
    ],
    chartData: { design: 70, code: 50, logic: 20, data: 10 }
  },
  {
    id: 2,
    title: 'Month 3: The Engine',
    icon: '⚡',
    subtitle: 'JavaScript & State Management',
    description: 'This is the most critical phase. You will learn vanilla JavaScript to handle user interactions, manipulate the DOM, and manage application state without heavy frameworks.',
    courses: [
      { name: 'JavaScript Algorithms and Data Structures', provider: 'FreeCodeCamp', link: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/' },
      { name: 'JavaScript30 (30 Day Challenge)', provider: 'Wes Bos', link: 'https://javascript30.com/' }
    ],
    objectives: [
      'Master ES6+ syntax (Promises, Async/Await)',
      'Understand DOM manipulation and Event Delegation',
      'Learn fundamental data structures (Stacks, Queues, Maps)',
      'Implement basic reactive state management'
    ],
    tasks: [
      { id: 't3-1', text: 'Complete FCC Basic JS & ES6 Modules' },
      { id: 't3-2', text: 'Build an interactive CRUD To-Do App' },
      { id: 't3-3', text: 'Complete first 15 JavaScript30 projects' },
      { id: 't3-4', text: 'Create a custom search filter for data lists' }
    ],
    chartData: { design: 80, code: 85, logic: 75, data: 30 }
  },
  {
    id: 3,
    title: 'Month 4: Data & Interactivity',
    icon: '📊',
    subtitle: 'SPA Architecture & Visualization',
    description: 'Bring it all together. Learn to fetch, process, and visualize data using libraries like Recharts. You will combine logic, styling, and data into a single HTML architecture.',
    courses: [
      { name: 'Data Visualization Certification', provider: 'FreeCodeCamp', link: 'https://www.freecodecamp.org/learn/data-visualization/' },
      { name: 'Professional Git/GitHub Workflow', provider: 'GitHub', link: 'https://skills.github.com/' }
    ],
    objectives: [
      'Master JSON data handling and API fetching',
      'Implement dynamic, reactive charts and graphs',
      'Design complex SPA architectures with routing',
      'Deploy full-stack interactive reports to GitHub'
    ],
    tasks: [
      { id: 't4-1', text: 'Connect App to a real-time Database (Firebase)' },
      { id: 't4-2', text: 'Build an interactive Finance or Crypto Tracker' },
      { id: 't4-3', text: 'Implement Auth-protected user routes' },
      { id: 't4-4', text: 'Final Capstone: Build and Deploy this Roadmap App' }
    ],
    chartData: { design: 95, code: 95, logic: 95, data: 100 }
  }
];

function App() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'roadmap_progress', user.uid);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setProgress(docSnap.data().tasks || {});
    });
  }, [user]);

  const toggleTask = async (taskId) => {
    if (!user) return;
    const newProgress = { ...progress, [taskId]: !progress[taskId] };
    await setDoc(doc(db, 'roadmap_progress', user.uid), { tasks: newProgress }, { merge: true });
  };

  const overallProgress = useMemo(() => {
    const total = ROADMAP_DATA.reduce((acc, curr) => acc + curr.tasks.length, 0);
    const completed = Object.values(progress).filter(Boolean).length;
    return Math.round((completed / total) * 100) || 0;
  }, [progress]);

  const chartProgression = useMemo(() => [
    { name: 'Start', design: 0, code: 0, logic: 0, data: 0 },
    ...ROADMAP_DATA.map(m => ({ name: m.title.split(':')[0], ...m.chartData }))
  ], []);

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-400">
      <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
      <p className="font-bold uppercase tracking-widest text-xs">Syncing your progress...</p>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-stone-200 p-8 text-center">
            <div className="inline-block bg-teal-600 p-4 rounded-3xl text-white mb-6 text-4xl">🎯</div>
            <h1 className="text-3xl font-black text-stone-900 mb-2">Mastery Roadmap</h1>
            <p className="text-stone-500 mb-8">Login to track your 4-month journey from beginner to SPA Architect.</p>
            <button 
              onClick={() => signInWithPopup(auth, provider)}
              className="w-full flex items-center justify-center gap-3 bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-all active:scale-95"
            >
              <span className="text-xl">G</span> Continue with Google
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans text-stone-800 selection:bg-teal-100">
      {/* HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src={user?.photoURL} className="w-9 h-9 rounded-full ring-2 ring-teal-50" alt="p" />
          <div className="hidden sm:block">
            <h1 className="font-black text-stone-900 leading-tight tracking-tight">Hi, {user?.displayName?.split(' ')[0]}</h1>
            <p className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Level: Professional Architect</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-stone-400 uppercase">Overall Progress</p>
            <p className="text-xl font-black text-teal-700">{overallProgress}%</p>
          </div>
          <button onClick={() => signOut(auth)} className="text-stone-300 hover:text-red-500 transition-colors">⎋</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-8 space-y-8">
        
        {/* DASHBOARD OVERVIEW */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-black text-stone-900 mb-4 flex items-center gap-3">
                Program Overview <span className="text-teal-600 text-sm font-bold bg-teal-50 px-3 py-1 rounded-full uppercase">Interactive</span>
              </h2>
              <p className="text-stone-500 leading-relaxed mb-6">
                This curriculum transforms beginners into elite Frontend Architects. You aren't just learning to code; you are learning to design systems, manage data flow, and create high-performance interactive experiences.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="text-2xl">🏆</div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">Industry-Standard Portfolio</p>
                    <p className="text-xs text-stone-400">4 massive projects to prove your skill.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="text-2xl">🎓</div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">High-Value Certifications</p>
                    <p className="text-xs text-stone-400">Google and FCC certified modules included.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <p className="text-center text-[10px] font-black uppercase text-stone-400 tracking-widest mb-4">Projected Skill Progression</p>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartProgression}>
                    <defs>
                      <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                    <XAxis dataKey="name" hide />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Area type="monotone" dataKey="code" stroke="#0d9488" strokeWidth={4} fillOpacity={1} fill="url(#colorLevel)" />
                    <Area type="monotone" dataKey="design" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* MODULE EXPLORER */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* NAVIGATION */}
          <aside className="w-full lg:w-80 flex flex-row lg:flex-col gap-3 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
            {ROADMAP_DATA.map((mod, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex-shrink-0 flex lg:flex-row items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  activeTab === idx ? 'bg-teal-600 border-teal-600 text-white shadow-lg shadow-teal-100' : 'bg-white border-stone-200 text-stone-500 hover:border-teal-200'
                }`}
              >
                <span className="text-2xl">{mod.icon}</span>
                <div>
                    <p className={`font-black text-xs uppercase tracking-widest ${activeTab === idx ? 'text-teal-100' : 'text-stone-400'}`}>Module {idx+1}</p>
                    <p className="font-bold text-sm whitespace-nowrap">{mod.title.split(':')[0]}</p>
                </div>
              </button>
            ))}
          </aside>

          {/* DETAIL VIEW */}
          <section className="flex-1 bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-stone-200 min-h-[500px] flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl">{ROADMAP_DATA[activeTab].icon}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-900">{ROADMAP_DATA[activeTab].title}</h2>
              </div>
              <p className="text-stone-500 font-bold text-sm uppercase tracking-widest mb-4 text-teal-600">{ROADMAP_DATA[activeTab].subtitle}</p>
              <p className="text-stone-600 leading-relaxed text-lg">{ROADMAP_DATA[activeTab].description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-tighter text-stone-400">Direct Course Access</h4>
                {ROADMAP_DATA[activeTab].courses.map((course, i) => (
                  <a key={i} href={course.link} target="_blank" className="block p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:bg-teal-50 hover:border-teal-100 transition-all group">
                    <p className="font-bold text-stone-800">{course.name}</p>
                    <p className="text-xs text-teal-600 font-bold uppercase mt-1">Provider: {course.provider} ↗</p>
                  </a>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="font-black text-xs uppercase tracking-tighter text-stone-400">Core Objectives</h4>
                <ul className="space-y-3">
                  {ROADMAP_DATA[activeTab].objectives.map((obj, i) => (
                    <li key={i} className="flex gap-3 text-sm text-stone-600 font-medium leading-tight">
                        <span className="text-teal-500">✔</span> {obj}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-auto bg-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-black text-xl mb-6">Module Checklist</h3>
                    <div className="space-y-3">
                    {ROADMAP_DATA[activeTab].tasks.map(task => (
                        <button 
                          key={task.id} 
                          onClick={() => toggleTask(task.id)}
                          className="w-full flex items-center gap-4 text-left group"
                        >
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            progress[task.id] ? 'bg-teal-500 border-teal-500' : 'border-stone-700 group-hover:border-teal-500'
                          }`}>
                            {progress[task.id] && <span className="text-[10px]">✔</span>}
                          </div>
                          <span className={`font-medium text-sm sm:text-base ${progress[task.id] ? 'line-through text-stone-600' : 'text-stone-300'}`}>
                            {task.text}
                          </span>
                        </button>
                    ))}
                    </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute -bottom-10 -right-10 text-8xl opacity-10 rotate-12">{ROADMAP_DATA[activeTab].icon}</div>
            </div>
          </section>
        </div>

        {/* SETTINGS / RESET */}
        <div className="flex justify-center pt-8">
            <button 
              onClick={() => setShowReset(true)}
              className="text-stone-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-colors"
            >
              Reset All Progress
            </button>
        </div>
      </main>

      {/* RESET MODAL */}
      {showReset && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center">
                <h2 className="text-xl font-black mb-2">Are you sure?</h2>
                <p className="text-stone-500 mb-8">This will permanently clear your progress for all months in the cloud database.</p>
                <div className="flex gap-4">
                    <button onClick={() => setShowReset(false)} className="flex-1 py-3 bg-stone-100 rounded-xl font-bold">Cancel</button>
                    <button 
                      onClick={async () => {
                        await setDoc(doc(db, 'roadmap_progress', user.uid), { tasks: {} });
                        setProgress({});
                        setShowReset(false);
                      }}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
                    >
                      Reset
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
