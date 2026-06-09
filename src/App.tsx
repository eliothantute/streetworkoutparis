import { useState, useEffect } from 'react';
import { WorkoutSpot, UserProfile, WorkoutSession, EquipmentType } from './types';
import { INITIAL_SPOTS, INITIAL_USER } from './data/spots';
import { getDistanceMeters } from './utils/distance';
import WorkoutMap from './components/WorkoutMap';
import SpotListItem from './components/SpotListItem';
import SpotDetails from './components/SpotDetails';
import Leaderboard from './components/Leaderboard';
import AddSpotModal from './components/AddSpotModal';

import {
  Compass,
  Search,
  Plus,
  Flame,
  Activity,
  MapPin,
  Navigation,
  Sun,
  Moon,
  Trash2
} from 'lucide-react';

export default function App() {
  // --- Persistent Storage State ---
  const [spots, setSpots] = useState<WorkoutSpot[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_USER);
  const [activityLogs, setActivityLogs] = useState<string[]>([]);

  // --- Map and Navigation state ---
  const [selectedSpot, setSelectedSpot] = useState<WorkoutSpot | null>(null);
  const [mapTheme, setMapTheme] = useState<'dark' | 'light'>('dark');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // --- Paris Weather state ---
  const [parisWeather, setParisWeather] = useState<{
    temp: number;
    text: string;
    code: number;
  } | null>(null);

  useEffect(() => {
    // Fetch live weather in central Paris on mount
    fetch('https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current_weather=true')
      .then((res) => {
        if (!res.ok) throw new Error('Météo Paris indisponible');
        return res.json();
      })
      .then((data) => {
        if (data && data.current_weather) {
          const temp = Math.round(data.current_weather.temperature);
          const code = data.current_weather.weathercode ?? data.current_weather.weather_code ?? 0;
          let txt = 'Beau temps';
          if (code === 0) txt = 'Grand soleil';
          else if (code >= 1 && code <= 3) txt = 'Partiellement nuageux';
          else if (code >= 51 && code <= 65) txt = 'Pluie';
          else if (code >= 80 && code <= 82) txt = 'Averses';
          else if (code >= 95) txt = 'Orageux';
          setParisWeather({ temp, text: txt, code });
        }
      })
      .catch((err) => console.warn('Paris weather fetch failed:', err));
  }, []);

  // --- Add Spot Mode states ---
  const [addModeActive, setAddModeActive] = useState(false);
  const [pendingCoords, setPendingCoords] = useState<{ lat: number; lng: number } | null>(null);

  // --- Left panel tab switching ---
  const [activePanelTab, setActivePanelTab] = useState<'spots' | 'progression'>('spots');

  // --- Search and Filters states ---
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedEquipmentFilters, setSelectedEquipmentFilters] = useState<EquipmentType[]>([]);
  const [requireSafetyFloor, setRequireSafetyFloor] = useState(false);
  const [requireLighting, setRequireLighting] = useState(false);
  const [requireWater, setRequireWater] = useState(false);
  
  // Sort state: 'distance' | 'rating' | 'occupancy' | 'name'
  const [sortBy, setSortBy] = useState<string>('rating');

  // Load state from localStorage on mount
  useEffect(() => {
    // Spots
    const storedSpots = localStorage.getItem('sw_spots_v1');
    if (storedSpots) {
      try {
        setSpots(JSON.parse(storedSpots));
      } catch (e) {
        setSpots(INITIAL_SPOTS);
      }
    } else {
      setSpots(INITIAL_SPOTS);
      localStorage.setItem('sw_spots_v1', JSON.stringify(INITIAL_SPOTS));
    }

    // User profile
    const storedUser = localStorage.getItem('sw_user_v1');
    if (storedUser) {
      try {
        setUserProfile(JSON.parse(storedUser));
      } catch (e) {
        setUserProfile(INITIAL_USER);
      }
    } else {
      setUserProfile(INITIAL_USER);
      localStorage.setItem('sw_user_v1', JSON.stringify(INITIAL_USER));
    }

    // Action Logs
    const storedLogs = localStorage.getItem('sw_logs_v1');
    if (storedLogs) {
      try {
        setActivityLogs(JSON.parse(storedLogs));
      } catch (e) {
        setActivityLogs([
          'Bienvenue sur Street Workout Paris ! Yannick a terminé une séance de dips.',
          'Yanis_SW a hébergé une session de Calisthenics Freestyle.',
          'Dimitri a publié un avis sur le parcours sportif de Kellermann.'
        ]);
      }
    } else {
      const defaultLogs = [
        'Bienvenue sur Street Workout Paris ! Yannick s\'est entraîné plus tôt.',
        'Pierre s\'est enregistré à la station Champ de Mars.',
        'Un athlète a mis à jour l\'état des Rives de Seine.'
      ];
      setActivityLogs(defaultLogs);
      localStorage.setItem('sw_logs_v1', JSON.stringify(defaultLogs));
    }
  }, []);

  // Request user current location coordinates
  const triggerGeolocation = () => {
    const handleParisFallback = (reason: string) => {
      // Coordinates of central Paris (Châtelet / Hôtel de Ville)
      const centralParis: [number, number] = [48.8566, 2.3522];
      setUserLocation(centralParis);
      setTrackingLoading(false);
      setSortBy('distance');
      logActivity(`Position GPS simulée au cœur de Paris (Châtelet) [${reason}] ! Tri par proximité actif.`, 0);
    };

    if (!navigator.geolocation) {
      handleParisFallback("GPS non géré par votre navigateur");
      return;
    }

    setTrackingLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setTrackingLoading(false);
        setSortBy('distance');
        logActivity(`Position GPS partagée ! Tri par proximité actif.`, 0);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable: ', err.message);
        // Fallback silently to Paris Center instead of interrupting with alerts
        handleParisFallback("Autorisation restreinte ou hors zone");
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  // Helper utility to write a log and award XP
  const logActivity = (message: string, xpEarned: number) => {
    setActivityLogs((prev) => {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = `[${timestamp}] ${message}`;
      const updated = [newLog, ...prev].slice(0, 50);
      localStorage.setItem('sw_logs_v1', JSON.stringify(updated));
      return updated;
    });

    if (xpEarned > 0) {
      setUserProfile((prev) => {
        const totalXp = prev.xp + xpEarned;
        const xpNeeded = prev.level * 300;
        let newLevel = prev.level;
        let finalXp = totalXp;

        if (finalXp >= xpNeeded) {
          finalXp = finalXp - xpNeeded;
          newLevel += 1;
          setTimeout(() => {
            alert(`🏆 NIVEAU SUPÉRIEUR ! Vous passez niveau d'athlète ${newLevel} ! Continuez de vous entraîner !`);
          }, 300);
        }

        const updatedProfile = {
          ...prev,
          level: newLevel,
          xp: finalXp
        };
        localStorage.setItem('sw_user_v1', JSON.stringify(updatedProfile));
        return updatedProfile;
      });
    }
  };

  // Starts a workout session
  const handleStartSession = (session: WorkoutSession) => {
    const updatedProfile = {
      ...userProfile,
      currentSession: session
    };
    setUserProfile(updatedProfile);
    localStorage.setItem('sw_user_v1', JSON.stringify(updatedProfile));

    // Evaluate night owl criteria
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 19 || currentHour < 5;
    const currentSpot = spots.find((s) => s.id === session.spotId);
    if (isNight && currentSpot?.lighting) {
      unlockAchievement('night-owl');
    }
  };

  // Ends a training session
  const handleEndSession = (xpEarned: number, activityLogMsg: string) => {
    setUserProfile((prev) => {
      const updatedProfile = {
        ...prev,
        sessionsCompleted: prev.sessionsCompleted + 1,
        currentSession: undefined
      };
      localStorage.setItem('sw_user_v1', JSON.stringify(updatedProfile));
      checkCompletedSessionsAchievements(updatedProfile.sessionsCompleted);
      return updatedProfile;
    });

    handleVisitSpotTracking(userProfile.currentSession?.spotId || '');
  };

  // Achievement unlock logic
  const unlockAchievement = (id: string) => {
    setUserProfile((prev) => {
      const achievement = prev.achievements.find((a) => a.id === id);
      if (achievement && !achievement.unlocked) {
        const updatedAchievements = prev.achievements.map((a) => {
          if (a.id === id) {
            return {
              ...a,
              unlocked: true,
              unlockedAt: new Date().toISOString()
            };
          }
          return a;
        });

        const updatedProfile = {
          ...prev,
          achievements: updatedAchievements,
          xp: prev.xp + achievement.xpValue
        };
        localStorage.setItem('sw_user_v1', JSON.stringify(updatedProfile));
        
        // Push log
        setActivityLogs((logs) => {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const newLog = `[${timestamp}] 🏆 Trophée débloqué : ${achievement.title} ! (+${achievement.xpValue} XP)`;
          const updated = [newLog, ...logs].slice(0, 50);
          localStorage.setItem('sw_logs_v1', JSON.stringify(updated));
          return updated;
        });

        return updatedProfile;
      }
      return prev;
    });
  };

  const checkCompletedSessionsAchievements = (totalCompleted: number) => {
    if (totalCompleted >= 1) {
      unlockAchievement('first-session');
    }
  };

  const handleVisitSpotTracking = (spotId: string) => {
    if (!spotId) return;
    const visitedStr = localStorage.getItem('sw_visited_spots_registry');
    let visitedList: string[] = [];
    try {
      if (visitedStr) visitedList = JSON.parse(visitedStr);
    } catch (e) {}

    if (!visitedList.includes(spotId)) {
      visitedList.push(spotId);
      localStorage.setItem('sw_visited_spots_registry', JSON.stringify(visitedList));

      if (visitedList.length >= 3) {
        unlockAchievement('muscle-up-master');
      }
    }
  };

  const handleToggleEquipmentFilter = (eq: EquipmentType) => {
    if (selectedEquipmentFilters.includes(eq)) {
      setSelectedEquipmentFilters(selectedEquipmentFilters.filter((item) => item !== eq));
    } else {
      setSelectedEquipmentFilters([...selectedEquipmentFilters, eq]);
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setDifficultyFilter('all');
    setSelectedEquipmentFilters([]);
    setRequireSafetyFloor(false);
    setRequireLighting(false);
    setRequireWater(false);
  };

  const handleUpdateSpot = (updatedSpot: WorkoutSpot, xpAwarded: number, activityLogMsg: string) => {
    setSpots((prev) => {
      const nextSpots = prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s));
      localStorage.setItem('sw_spots_v1', JSON.stringify(nextSpots));
      return nextSpots;
    });
    setSelectedSpot(updatedSpot);
    logActivity(activityLogMsg, xpAwarded);

    if (activityLogMsg.includes('A laissé un avis sur le spot')) {
      unlockAchievement('spot-reviewer');
    }
    if (activityLogMsg.includes('A créé l\'événement') || activityLogMsg.includes('A rejoint l\'événement')) {
      unlockAchievement('meetup-leader');
    }
  };

  const handleMapDoubleClick = (lat: number, lng: number) => {
    setPendingCoords({ lat, lng });
    setAddModeActive(false);
  };

  const handleAddNewSpot = (newSpot: WorkoutSpot) => {
    setSpots((prev) => {
      const combined = [newSpot, ...prev];
      localStorage.setItem('sw_spots_v1', JSON.stringify(combined));
      return combined;
    });
    setPendingCoords(null);
    setSelectedSpot(newSpot);
    logActivity(`A répertorié le nouveau spot "${newSpot.name}" à Paris ! (+50 XP)`, 50);
  };

  const resetToFactoryDefault = () => {
    if (confirm("Réinitialiser l'application ? Vos ajouts personnalisés, progression et historique seront effacés.")) {
      localStorage.clear();
      setSpots(INITIAL_SPOTS);
      setUserProfile(INITIAL_USER);
      setActivityLogs([
        'Données restaurées aux valeurs initiales d\'usine.'
      ]);
      setSelectedSpot(null);
      setUserLocation(null);
      localStorage.setItem('sw_spots_v1', JSON.stringify(INITIAL_SPOTS));
      localStorage.setItem('sw_user_v1', JSON.stringify(INITIAL_USER));
      localStorage.setItem('sw_logs_v1', JSON.stringify(['Données restaurées.']));
    }
  };

  // Filtering & Sorting computation
  const filteredSpots = spots.filter((spot) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      spot.name.toLowerCase().includes(query) ||
      spot.locationName.toLowerCase().includes(query) ||
      spot.equipment.some((eq) => eq.toLowerCase().replace('_', ' ').includes(query));

    const matchesDifficulty = difficultyFilter === 'all' || spot.difficulty === difficultyFilter;
    const matchesEquipment = selectedEquipmentFilters.every((eq) => spot.equipment.includes(eq));

    const matchesFloor = !requireSafetyFloor || spot.safetyFloor;
    const matchesLighting = !requireLighting || spot.lighting;
    const matchesWater = !requireWater || spot.waterSource;

    return matchesSearch && matchesDifficulty && matchesEquipment && matchesFloor && matchesLighting && matchesWater;
  });

  const sortedSpots = [...filteredSpots].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'rating') {
      const scoreA = a.reviews.length ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length : 4.0;
      const scoreB = b.reviews.length ? b.reviews.reduce((s, r) => s + r.rating, 0) / b.reviews.length : 4.0;
      return scoreB - scoreA;
    }
    if (sortBy === 'occupancy') {
      return b.activeUsers - a.activeUsers;
    }
    if (sortBy === 'distance' && userLocation) {
      const distA = getDistanceMeters(userLocation[0], userLocation[1], a.coordinates[0], a.coordinates[1]);
      const distB = getDistanceMeters(userLocation[0], userLocation[1], b.coordinates[0], b.coordinates[1]);
      return distA - distB;
    }
    return 0;
  });

  const getSpotDistance = (spot: WorkoutSpot): number | null => {
    if (!userLocation) return null;
    return getDistanceMeters(userLocation[0], userLocation[1], spot.coordinates[0], spot.coordinates[1]);
  };

  return (
    <div id="street-workout-app" className="w-screen h-screen flex flex-col bg-zinc-950 text-zinc-300 font-sans select-none overflow-hidden antialiased">
      
      {/* Top Navigation bar */}
      <header className="px-5 py-3 bg-zinc-950 border-b border-zinc-900 shrink-0 flex justify-between items-center sm:px-6 relative z-10">
        
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-zinc-900 flex items-center justify-center border border-zinc-850">
            <Flame className="w-4.5 h-4.5 text-zinc-200 stroke-[1.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans font-bold text-[13px] tracking-wider text-zinc-100 uppercase leading-none flex items-center gap-2">
              <span>Street Workout <span className="text-zinc-400">Paris</span></span>
              {parisWeather && (
                <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-905 text-zinc-350 font-mono font-medium tracking-normal lowercase normal-case flex items-center gap-1 leading-none select-none">
                  {parisWeather.code === 0 || (parisWeather.code >= 1 && parisWeather.code <= 3) ? '☀️' : '🌧️'} {parisWeather.temp}°C
                </span>
              )}
            </h1>
            <span className="text-[9.5px] text-zinc-550 font-mono mt-1 leading-none uppercase tracking-wide">
              Parcours et spots de calisthénie
            </span>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          
          {/* Tracking position finder */}
          <button
            onClick={triggerGeolocation}
            disabled={trackingLoading}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold cursor-pointer border leading-none transition-all ${
              userLocation
                ? 'bg-zinc-900 border-zinc-700 text-zinc-100'
                : 'bg-transparent border-zinc-900 text-zinc-550 hover:text-zinc-300 hover:bg-zinc-900/20'
            }`}
          >
            <Navigation className={`w-3 h-3 ${trackingLoading ? 'animate-spin' : ''}`} />
            <span>{userLocation ? 'GPS actif' : 'Proximité'}</span>
          </button>

          {/* Toggle Map themes */}
          <button
            onClick={() => setMapTheme(mapTheme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded bg-transparent border border-zinc-900 text-zinc-550 hover:text-zinc-300 transition-colors cursor-pointer"
            title="Style de la carte"
          >
            {mapTheme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Reset factory */}
          <button
            onClick={resetToFactoryDefault}
            className="p-1.5 rounded bg-transparent border border-zinc-900 text-zinc-650 hover:text-zinc-400 transition-colors cursor-pointer"
            title="Restaurer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative w-full h-full">

        {/* Left Sidebar controls */}
        <div className="w-80 h-full bg-zinc-950 border-r border-zinc-900 flex flex-col shrink-0 overflow-hidden relative z-10">
          
          {/* Tabs header element */}
          <div className="flex border-b border-zinc-900 bg-zinc-955 p-1.5 shrink-0 font-mono text-[10.5px]">
            <button
              onClick={() => setActivePanelTab('spots')}
              className={`flex-1 py-1 px-2 rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
                activePanelTab === 'spots'
                  ? 'bg-zinc-900 text-zinc-100 border border-zinc-850/65'
                  : 'text-zinc-550 hover:text-zinc-400'
              }`}
            >
              <Compass className="w-3 h-3" />
              Spots
            </button>
            <button
              onClick={() => setActivePanelTab('progression')}
              className={`flex-1 py-1 px-2 rounded font-bold transition-all cursor-pointer flex items-center justify-center gap-1 leading-none ${
                activePanelTab === 'progression'
                  ? 'bg-zinc-900 text-zinc-100 border border-zinc-850/65'
                  : 'text-zinc-550 hover:text-zinc-400'
              }`}
            >
              <Activity className="w-3 h-3" />
              Progression
            </button>
          </div>

          {/* TAB 1: Discover Spots */}
          {activePanelTab === 'spots' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Search fields */}
              <div className="p-4 border-b border-zinc-900 flex flex-col gap-3 shrink-0">
                <div className="relative">
                  <span className="absolute inset-y-0 left-2.5 flex items-center justify-center text-zinc-600">
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chercher parc, arrondissement, agrès..."
                    className="w-full bg-zinc-900 border border-zinc-900 rounded py-2 pl-8 pr-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all font-sans"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      X
                    </button>
                  )}
                </div>

                {/* Filters order listings */}
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-550 leading-none">
                  <span className="font-semibold text-zinc-600">TRIER PAR :</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSortBy('rating')}
                      className={`hover:text-zinc-300 transition cursor-pointer ${sortBy === 'rating' ? 'text-zinc-100 font-bold' : 'text-zinc-550'}`}
                    >
                      Note
                    </button>
                    <button
                      onClick={() => setSortBy('occupancy')}
                      className={`hover:text-zinc-300 transition cursor-pointer ${sortBy === 'occupancy' ? 'text-zinc-100 font-bold' : 'text-zinc-550'}`}
                    >
                      Affluence
                    </button>
                    {userLocation && (
                      <button
                        onClick={() => setSortBy('distance')}
                        className={`hover:text-zinc-300 transition cursor-pointer ${sortBy === 'distance' ? 'text-zinc-100 font-bold' : 'text-zinc-550'}`}
                      >
                        Proximité
                      </button>
                    )}
                    <button
                      onClick={() => setSortBy('name')}
                      className={`hover:text-zinc-300 transition cursor-pointer ${sortBy === 'name' ? 'text-zinc-100 font-bold' : 'text-zinc-550'}`}
                    >
                      Nom
                    </button>
                  </div>
                </div>
              </div>

              {/* Subfilters bar details list */}
              <div className="px-4 py-2 border-b border-zinc-900 bg-zinc-950 flex flex-col gap-2.5 shrink-0 max-h-36 overflow-y-auto custom-scroll font-mono text-[9.5px]">
                
                {/* Levels pills */}
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-550 uppercase tracking-wider font-bold">Niveau requis</span>
                  <div className="flex bg-zinc-900/50 p-0.5 rounded border border-zinc-900/80 leading-none">
                    {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setDifficultyFilter(lvl)}
                        className={`flex-1 py-1 rounded text-center cursor-pointer transition-all ${
                          difficultyFilter === lvl
                            ? 'bg-zinc-900 text-zinc-100 font-bold'
                            : 'text-zinc-600 hover:text-zinc-505'
                        }`}
                      >
                        {lvl === 'all' ? 'Tous' : lvl === 'beginner' ? 'Déb.' : lvl === 'intermediate' ? 'Inter.' : 'Avancé'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick sub-amenities check */}
                <div className="flex flex-col gap-1">
                  <span className="text-zinc-555 uppercase tracking-wider font-bold">Éléments installés</span>
                  <div className="flex flex-wrap gap-1">
                    {(['pullup_bars', 'dip_bars', 'parallel_bars', 'rings', 'monkey_bars'] as EquipmentType[]).map((eq) => {
                      const isFilterActive = selectedEquipmentFilters.includes(eq);
                      const labelsFr = {
                        pullup_bars: 'traction',
                        dip_bars: 'dips',
                        parallel_bars: 'parallèles',
                        rings: 'anneaux',
                        monkey_bars: 'échelle'
                      };
                      return (
                        <button
                          key={eq}
                          onClick={() => handleToggleEquipmentFilter(eq)}
                          className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                            isFilterActive
                              ? 'bg-zinc-900 border-zinc-650 text-zinc-200 font-bold'
                              : 'bg-transparent border-zinc-900 text-zinc-550'
                          }`}
                        >
                          {labelsFr[eq as keyof typeof labelsFr] || eq}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Additional Amenities parameters */}
                <div className="flex gap-2 justify-between select-none pt-1.5 border-t border-zinc-900/30 text-zinc-550">
                  <button
                    onClick={() => setRequireSafetyFloor(!requireSafetyFloor)}
                    className={`hover:text-zinc-400 flex items-center gap-1 cursor-pointer ${requireSafetyFloor ? 'text-zinc-200 font-bold' : ''}`}
                  >
                    <span>Sol souple</span>
                  </button>
                  <button
                    onClick={() => setRequireLighting(!requireLighting)}
                    className={`hover:text-zinc-400 flex items-center gap-1 cursor-pointer ${requireLighting ? 'text-zinc-200 font-bold' : ''}`}
                  >
                    <span>Éclairé</span>
                  </button>
                  <button
                    onClick={() => setRequireWater(!requireWater)}
                    className={`hover:text-zinc-400 flex items-center gap-1 cursor-pointer ${requireWater ? 'text-zinc-200 font-bold' : ''}`}
                  >
                    <span>Eau potable</span>
                  </button>
                </div>

                {/* Reset filters */}
                {(difficultyFilter !== 'all' || selectedEquipmentFilters.length > 0 || requireSafetyFloor || requireLighting || requireWater) && (
                  <button
                    onClick={resetFilters}
                    className="w-full text-center text-[9px] font-bold text-zinc-500 hover:underline pt-1 border-t border-zinc-900/30 cursor-pointer"
                  >
                    Effacer les filtres actifs
                  </button>
                )}
              </div>

              {/* Spots List */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scroll">
                {sortedSpots.length > 0 ? (
                  sortedSpots.map((spot) => (
                    <SpotListItem
                      key={spot.id}
                      spot={spot}
                      isSelected={selectedSpot?.id === spot.id}
                      distance={getSpotDistance(spot)}
                      onSelect={() => setSelectedSpot(spot)}
                    />
                  ))
                ) : (
                  <div className="py-12 text-center rounded border border-dashed border-zinc-900 p-4 text-zinc-600 text-xs flex flex-col justify-center items-center gap-2">
                    <MapPin className="w-6 h-6 text-zinc-700" />
                    <span>Aucun parc ne correspond à vos filtres à Paris.</span>
                    <button
                      onClick={resetFilters}
                      className="px-2.5 py-1 bg-zinc-900 border border-zinc-850 text-zinc-300 rounded font-semibold text-[11px] hover:bg-zinc-800 cursor-pointer mt-1"
                    >
                      Effacer tout
                    </button>
                  </div>
                )}

                {/* Known missed spot CTA */}
                <div className="mt-4 p-4 rounded border border-dashed border-zinc-900 bg-zinc-950/40 text-center text-[11px] flex flex-col gap-2.5 leading-relaxed selection:none">
                  <h4 className="font-sans font-bold text-zinc-300">Un spot à rajouter ?</h4>
                  <p className="text-zinc-550">
                    Double-cliquez n'importe où sur la carte pour situer, définir les agrès et répertorier une nouvelle installation.
                  </p>
                  <button
                    onClick={() => {
                      setAddModeActive(!addModeActive);
                      logActivity(addModeActive ? "Mode épingle annulé." : "Mode épingle actif : double-cliquez sur la carte de Paris.", 0);
                    }}
                    className={`w-full py-2 rounded text-[10.5px] uppercase tracking-wide font-mono font-bold cursor-pointer transition-all border ${
                      addModeActive
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-300'
                        : 'bg-transparent border-zinc-900 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {addModeActive ? 'Quitter le mode ajout' : '🎯 Sélectionner sur la carte'}
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Social progression */}
          {activePanelTab === 'progression' && (
            <div className="flex-1 overflow-hidden h-full">
              <Leaderboard userProfile={userProfile} activityLogs={activityLogs} />
            </div>
          )}

        </div>

        {/* Central Map canvas */}
        <div className="flex-1 h-full relative overflow-hidden bg-zinc-950">
          <WorkoutMap
            spots={spots}
            selectedSpot={selectedSpot}
            onSelectSpot={setSelectedSpot}
            userLocation={userLocation}
            addModeActive={addModeActive}
            onMapDoubleClick={handleMapDoubleClick}
            mapTheme={mapTheme}
          />
        </div>

        {/* Slide-over details profile tab */}
        <div className={`transition-all duration-300 shrink-0 h-full overflow-hidden ${
          selectedSpot ? 'w-80 md:w-96 border-l border-zinc-900' : 'w-0'
        }`}>
          <SpotDetails
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            userProfile={userProfile}
            onUpdateSpot={handleUpdateSpot}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
          />
        </div>

        {/* Bottom stationary landing hints card overlay is active when no spot is selected */}
        {!selectedSpot && (
          <div className="absolute bottom-5 right-5 z-[50] bg-zinc-950/95 border border-zinc-900 p-4 rounded max-w-xs shadow-2xl backdrop-blur-md flex flex-col gap-2 transition-all text-xs font-sans">
            <div className="flex items-center gap-1.5 font-bold text-zinc-200">
              <Flame className="w-3.5 h-3.5 text-zinc-300" />
              <span>Calisthénie Paris</span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Explorez et contribuez à l'inventaire libre des structures de street workout d'Île-de-France. Démarrez vos entraînements directement sur le terrain (Chalk Up) pour gagner de l'XP !
            </p>
            <div className="flex flex-col border-t border-zinc-900 pt-2 gap-1 font-mono text-[9px] text-zinc-650 leading-normal">
              <span className="text-zinc-500">Astuces :</span>
              <span>• Cliquez sur un repère pour afficher ses installations.</span>
              <span>• Activez le **Rang d'athlète** pour suivre vos accomplissements.</span>
            </div>
          </div>
        )}

      </main>

      {/* Spot Creation form backdrop modal */}
      {pendingCoords && (
        <AddSpotModal
          lat={pendingCoords.lat}
          lng={pendingCoords.lng}
          onClose={() => setPendingCoords(null)}
          onAddSpot={handleAddNewSpot}
        />
      )}

    </div>
  );
}
