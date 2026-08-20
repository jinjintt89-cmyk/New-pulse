import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Plus, Minus, Coffee, Brain, Bell, BellOff,
  Search as SearchIcon, Info, Sun, Cloud, CloudRain, Wind, 
  Thermometer, ExternalLink, Terminal, Monitor, MessageSquare, 
  Mail, Globe, Trash2, CheckCircle, Circle, Play, Pause, 
  SkipBack, SkipForward, Volume2, Music, Waves, Activity, 
  Orbit, Star, Moon, Sun as SunIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS ---

const StarBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      const count = Math.floor((canvas.width * canvas.height) / 2000);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2,
          speed: Math.random() * 0.05 + 0.01,
          opacity: Math.random(),
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#050505');
      gradient.addColorStop(0.5, '#08080c');
      gradient.addColorStop(1, '#050505');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.globalAlpha = star.opacity;
        ctx.fillStyle = star.size > 1.5 ? '#b0c4de' : '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        star.opacity += star.speed;
        if (star.opacity > 1 || star.opacity < 0.2) star.speed = -star.speed;
        star.x += 0.02;
        if (star.x > canvas.width) star.x = 0;
      });
      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 bg-[#050505]" />;
};

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return (
    <div className="flex flex-col items-center justify-center text-white select-none">
      <h1 className="text-8xl font-bold tracking-tighter drop-shadow-2xl">{format(time, 'HH:mm')}</h1>
      <div className="mt-4 flex flex-col items-center">
        <p className="text-2xl font-light text-zinc-400">{format(time, 'EEEE, MMMM do')}</p>
        <p className="text-lg mt-2 text-zinc-500 uppercase tracking-widest">{getGreeting()}, Explorer</p>
      </div>
    </div>
  );
};

const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      setQuery('');
    }
  };
  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl group relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <SearchIcon className="h-5 w-5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search the cosmos..."
        className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 text-white rounded-full py-4 pl-12 pr-6 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
      />
    </form>
  );
};

const WeatherCard: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        setWeather({ temp: data.current_weather.temperature, condition: data.current_weather.weathercode.toString(), windSpeed: data.current_weather.windspeed });
      } catch (err) { console.error(err); }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => fetchWeather(40.7128, -74.0060)
      );
    } else { fetchWeather(40.7128, -74.0060); }
  }, []);
  if (!weather) return null;
  const getWeatherIcon = (code: string) => {
    const c = parseInt(code);
    if (c <= 3) return <Sun className="w-8 h-8 text-yellow-400" />;
    if (c <= 48) return <Cloud className="w-8 h-8 text-zinc-400" />;
    return <CloudRain className="w-8 h-8 text-blue-400" />;
  };
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl flex items-center gap-6">
      <div className="bg-zinc-800/50 p-3 rounded-xl">{getWeatherIcon(weather.condition)}</div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold text-white">{weather.temp}°C</span>
          <Thermometer className="w-4 h-4 text-zinc-500" />
        </div>
        <div className="flex items-center gap-4 mt-1 text-zinc-400 text-sm">
          <span className="flex items-center gap-1"><Wind className="w-3 h-3" />{weather.windSpeed} km/h</span>
          <span className="capitalize">{parseInt(weather.condition) <= 3 ? 'Clear' : 'Cloudy'}</span>
        </div>
      </div>
    </div>
  );
};

const QuickLinks: React.FC = () => {
  const links = [
    { name: 'Browser', url: 'https://google.com', icon: ExternalLink, color: 'hover:text-blue-400' },
    { name: 'Code', url: 'https://github.com', icon: Terminal, color: 'hover:text-white' },
    { name: 'Video', url: 'https://youtube.com', icon: Monitor, color: 'hover:text-red-500' },
    { name: 'Chat', url: 'https://discord.com', icon: MessageSquare, color: 'hover:text-indigo-400' },
    { name: 'Gmail', url: 'https://mail.google.com', icon: Mail, color: 'hover:text-red-400' },
    { name: 'Web', url: '#', icon: Globe, color: 'hover:text-emerald-400' },
  ];
  return (
    <div className="flex gap-4 p-4">
      {links.map((link) => (
        <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className={`p-4 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-2xl text-zinc-500 transition-all duration-300 hover:border-zinc-700 hover:scale-110 ${link.color}`}>
          <link.icon className="w-6 h-6" />
        </a>
      ))}
    </div>
  );
};

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<any[]>(() => {
    const saved = localStorage.getItem('star-todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  useEffect(() => { localStorage.setItem('star-todos', JSON.stringify(todos)); }, [todos]);
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([{ id: Date.now().toString(), text: input, completed: false }, ...todos]);
    setInput('');
  };
  const toggleTodo = (id: string) => { setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)); };
  const removeTodo = (id: string) => { setTodos(todos.filter(t => t.id !== id)); };
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl w-full h-[320px] flex flex-col">
      <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest">Mission Logs</h3>
      <form onSubmit={addTodo} className="relative mb-4">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="New objective..." className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl py-2 pl-4 pr-10 outline-none focus:border-blue-500/50 text-sm" />
        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"><Plus className="w-5 h-5" /></button>
      </form>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-none">
        {todos.map(todo => (
          <div key={todo.id} className="group flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl border border-transparent hover:border-zinc-700">
            <button onClick={() => toggleTodo(todo.id)} className="flex items-center gap-3 text-left">
              {todo.completed ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-zinc-500" />}
              <span className={`text-sm ${todo.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{todo.text}</span>
            </button>
            <button onClick={() => removeTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FocusTimer: React.FC = () => {
  const [workDuration, setWorkDuration] = useState(() => Number(localStorage.getItem('star-work-dur')) || 25);
  const [breakDuration, setBreakDuration] = useState(() => Number(localStorage.getItem('star-break-dur')) || 5);
  const [timeLeft, setTimeLeft] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [notif, setNotif] = useState(true);

  useEffect(() => { if (!isActive) setTimeLeft(mode === 'work' ? workDuration * 60 : breakDuration * 60); }, [workDuration, breakDuration, mode, isActive]);
  useEffect(() => { localStorage.setItem('star-work-dur', workDuration.toString()); localStorage.setItem('star-break-dur', breakDuration.toString()); }, [workDuration, breakDuration]);

  const switchMode = useCallback(() => {
    const next = mode === 'work' ? 'break' : 'work';
    setMode(next);
    setTimeLeft(next === 'work' ? workDuration * 60 : breakDuration * 60);
    setIsActive(false);
    if (notif) {
      new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(() => {});
    }
  }, [mode, workDuration, breakDuration, notif]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) { switchMode(); }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, switchMode]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl w-full flex flex-col items-center gap-6">
      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-2">
          {mode === 'work' ? <Brain className="w-4 h-4 text-blue-400" /> : <Coffee className="w-4 h-4 text-emerald-400" />}
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{mode === 'work' ? 'Work Phase' : 'Break Phase'}</span>
        </div>
        <button onClick={() => setNotif(!notif)}>{notif ? <Bell className="w-4 h-4 text-zinc-400" /> : <BellOff className="w-4 h-4 text-zinc-600" />}</button>
      </div>
      <div className="text-6xl font-mono font-bold text-white tracking-tighter">{formatTime(timeLeft)}</div>
      <div className="flex items-center gap-3">
        <button onClick={() => setTimeLeft(prev => Math.max(0, prev - 60))} className="p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-lg"><Minus className="w-4 h-4" /></button>
        <button onClick={() => setIsActive(!isActive)} className={`px-8 py-3 rounded-xl font-bold uppercase text-xs ${isActive ? 'bg-zinc-800 text-zinc-300' : 'bg-blue-600 text-white'}`}>
          {isActive ? 'Pause' : 'Engage'}
        </button>
        <button onClick={() => setTimeLeft(prev => prev + 60)} className="p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-lg"><Plus className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-zinc-800/50">
        <div>
          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Work</label>
          <input type="number" value={workDuration} onChange={(e) => setWorkDuration(Number(e.target.value))} className="bg-zinc-800/50 border border-zinc-700 rounded-md px-2 py-1 text-xs text-white w-full" />
        </div>
        <div>
          <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Break</label>
          <input type="number" value={breakDuration} onChange={(e) => setBreakDuration(Number(e.target.value))} className="bg-zinc-800/50 border border-zinc-700 rounded-md px-2 py-1 text-xs text-white w-full" />
        </div>
      </div>
    </div>
  );
};

const SystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState({ cpu: 24, ram: 42, disk: 68 });
  useEffect(() => {
    const int = setInterval(() => setMetrics(p => ({
      cpu: Math.max(10, Math.min(95, p.cpu + (Math.random() * 10 - 5))),
      ram: Math.max(30, Math.min(85, p.ram + (Math.random() * 4 - 2))),
      disk: p.disk
    })), 2000);
    return () => clearInterval(int);
  }, []);
  const Bar = ({ label, value, color }: any) => (
    <div className="space-y-1">
      <div className="flex justify-between text-[9px] uppercase text-zinc-500 font-bold"><span>{label}</span><span>{Math.round(value)}%</span></div>
      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${color}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl w-full space-y-4">
      <h3 className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" />Telemetry</h3>
      <Bar label="CPU" value={metrics.cpu} color="bg-blue-500" />
      <Bar label="RAM" value={metrics.ram} color="bg-purple-500" />
      <Bar label="DISK" value={metrics.disk} color="bg-amber-500" />
    </div>
  );
};

const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIdx, setTrackIdx] = useState(0);
  const [vol, setVol] = useState(0.5);
  const [prog, setProg] = useState(0);
  const audio = useRef<HTMLAudioElement | null>(null);
  const playlist = [
    { title: "Space Ambient", url: "https://streaming.radio.co/s5c7b34b17/listen" },
    { title: "Celestial Winds", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" }
  ];
  useEffect(() => { if (audio.current) audio.current.volume = vol; }, [vol]);
  useEffect(() => { isPlaying ? audio.current?.play().catch(() => {}) : audio.current?.pause(); }, [isPlaying, trackIdx]);
  return (
    <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl w-full">
      <audio ref={audio} src={playlist[trackIdx].url} onTimeUpdate={() => setProg((audio.current?.currentTime || 0) / (audio.current?.duration || 1) * 100)} onEnded={() => setTrackIdx((trackIdx + 1) % playlist.length)} />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-white/10">{isPlaying ? <Waves className="w-6 h-6 text-blue-400 animate-pulse" /> : <Music className="w-6 h-6 text-zinc-600" />}</div>
        <div className="flex-1 min-w-0"><h4 className="text-white font-bold text-xs truncate">{playlist[trackIdx].title}</h4><p className="text-zinc-500 text-[9px] uppercase tracking-widest mt-1">Stardance Stream</p></div>
      </div>
      <div className="space-y-4">
        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${prog}%` }} /></div>
        <div className="flex items-center gap-2"><Volume2 className="w-3 h-3 text-zinc-600" /><input type="range" min="0" max="1" step="0.01" value={vol} onChange={(e) => setVol(parseFloat(e.target.value))} className="flex-1 h-1 bg-zinc-800 accent-blue-500 cursor-pointer" /></div>
      </div>
      <div className="flex items-center justify-center gap-8 mt-6">
        <button onClick={() => setTrackIdx((trackIdx - 1 + playlist.length) % playlist.length)}><SkipBack className="w-5 h-5 text-zinc-500" /></button>
        <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 rounded-full bg-white flex items-center justify-center">{isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}</button>
        <button onClick={() => setTrackIdx((trackIdx + 1) % playlist.length)}><SkipForward className="w-5 h-5 text-zinc-500" /></button>
      </div>
    </div>
  );
};

const NasaAPOD: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [show, setShow] = useState(false);
  useEffect(() => { fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY').then(r => r.json()).then(setData).catch(console.error); }, []);
  if (!data) return <div className="aspect-video w-full rounded-2xl bg-zinc-900 animate-pulse border border-zinc-800" />;
  const img = data.media_type === 'image' ? data.url : 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000';
  return (
    <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/30 aspect-video w-full">
      <img src={img} alt="APOD" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <h3 className="text-white font-medium text-sm mb-1">{data.title || 'Celestial View'}</h3>
        <button onClick={() => setShow(true)} className="flex items-center gap-2 text-zinc-300 text-[10px] uppercase font-bold"><Info className="w-3 h-3" />Details</button>
      </div>
      <AnimatePresence>{show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-start mb-4"><h3 className="text-sm font-bold text-white uppercase">{data.title}</h3><button onClick={() => setShow(false)} className="text-zinc-500 text-xs">CLOSE</button></div>
          <p className="text-zinc-400 text-xs leading-relaxed">{data.explanation}</p>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
};

const AstroTerminal: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const messages = ["Init Stardance...", "Uplink Secure...", "Gravity Sensors: OK", "Neural Link: 98.4%", "Hull: 100%", "GPS-X Sync...", "Life Support: GREEN"];
  useEffect(() => {
    let i = 0;
    const int = setInterval(() => { setLogs(p => [...p.slice(-10), messages[i]]); i = (i + 1) % messages.length; }, 4000);
    return () => clearInterval(int);
  }, []);
  return (
    <div className="bg-black/80 backdrop-blur-xl border border-zinc-800 p-4 rounded-xl w-full font-mono text-[9px] h-40 flex flex-col">
      <div className="flex items-center gap-2 mb-2 text-zinc-600 border-b border-zinc-800 pb-2 uppercase tracking-widest font-bold">System Log</div>
      <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-none">
        {logs.map((l, idx) => (
          <div key={idx} className="flex gap-2">
            <span className="text-zinc-800">[{new Date().toLocaleTimeString()}]</span>
            <span className="text-emerald-500/70">{l}</span>
          </div>
        ))}
        <div className="animate-pulse w-1.5 h-3 bg-emerald-500/50 inline-block" />
      </div>
    </div>
  );
};

const CelestialEvents: React.FC = () => {
  const ev = [
    { date: 'OCT 12', title: 'Comet C/2023 A3', icon: Star },
    { date: 'OCT 17', title: 'Super Moon', icon: Moon },
    { date: 'OCT 21', title: 'Orionid Peak', icon: SunIcon },
  ];
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 p-5 rounded-2xl w-full">
      <div className="flex items-center gap-2 mb-4 uppercase tracking-[0.2em] text-[10px] font-bold text-zinc-500 border-b border-zinc-800 pb-3">Calendar</div>
      <div className="space-y-4">
        {ev.map((e, i) => (
          <div key={i} className="flex gap-3 items-center">
            <span className="text-[9px] font-bold text-blue-500 w-12">{e.date}</span>
            <e.icon className="w-3 h-3 text-zinc-600" />
            <h4 className="text-zinc-300 text-[10px] font-medium">{e.title}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuoteCard: React.FC = () => {
  const quotes = [
    { text: "The universe is under no obligation to make sense to you.", author: "Neil deGrasse Tyson" },
    { text: "Somewhere, something incredible is waiting to be known.", author: "Carl Sagan" }
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  return (
    <div className="p-4 text-center">
      <p className="text-zinc-500 italic text-xs leading-relaxed mb-1">"{q.text}"</p>
      <p className="text-zinc-700 text-[8px] uppercase tracking-widest">— {q.author}</p>
    </div>
  );
};

const PlanetTracker: React.FC = () => {
  const planets = [
    { name: 'Mars', dist: '225M km', color: 'bg-red-500' },
    { name: 'Jupiter', dist: '778M km', color: 'bg-orange-400' },
  ];
  return (
    <div className="bg-zinc-900/40 border border-zinc-800 p-5 rounded-2xl w-full">
      <h3 className="text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mb-4"><Orbit className="w-4 h-4 text-purple-400" />Vectors</h3>
      <div className="space-y-4">
        {planets.map(p => (
          <div key={p.name} className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 rounded-full ${p.color}`} />
            <div className="flex-1 flex justify-between items-center text-[10px] uppercase font-mono"><span className="text-zinc-300">{p.name}</span><span className="text-zinc-600">{p.dist}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-blue-500/30 pb-20">
      <StarBackground />
      
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 p-8 flex justify-between items-start z-40 pointer-events-none">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="pointer-events-auto">
          <WeatherCard />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="pointer-events-auto text-right">
          <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold tracking-[0.3em] mb-1 justify-end uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Terminal Online
          </div>
          <div className="text-zinc-600 text-[9px] tracking-tighter uppercase font-mono">NODE_PULSE_7A // 7.66 KM/S</div>
        </motion.div>
      </header>

      {/* Main Console Layout */}
      <main className="container mx-auto px-4 pt-40 flex flex-col items-center gap-16 relative z-10">
        
        {/* Central Core */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-10 w-full">
          <Clock />
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <SearchBar />
            <QuickLinks />
          </div>
        </motion.div>

        {/* Modular Grid System */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          
          {/* Operations Cluster */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] pl-2 border-l border-zinc-800">Operational Intel</div>
            <TodoList />
            <FocusTimer />
          </div>

          {/* Core Processing Cluster */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] pl-2 border-l border-zinc-800">Command Streams</div>
            <AstroTerminal />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NasaAPOD />
              <div className="flex flex-col gap-6">
                <CelestialEvents />
                <QuoteCard />
              </div>
            </div>
          </div>

          {/* Telemetry Cluster */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.3em] pl-2 border-l border-zinc-800">System Dynamics</div>
            <MusicPlayer />
            <SystemMonitor />
            <PlanetTracker />
          </div>

        </div>
      </main>

      {/* Industrial Base Layer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-center bg-black/40 backdrop-blur-md border-t border-zinc-900/50 text-[9px] text-zinc-700 font-mono tracking-[0.2em] uppercase z-40">
        <div className="flex gap-6 mb-2 md:mb-0">
          <span>Sys: OK</span>
          <span>Enc: RSA-4096</span>
          <span className="text-blue-900/50">Pulse v2.5.0</span>
        </div>
        <div className="flex gap-4">
          <span className="text-zinc-800">Stardance Initiative</span>
          <span className="animate-pulse">Active Uplink</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
