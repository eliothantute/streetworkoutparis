import React, { useState, useEffect } from 'react';
import {
  WorkoutSpot,
  SpotReview,
  SpotReport,
  EquipmentType,
  ScheduledWorkout,
  UserProfile,
  WorkoutSession
} from '../types';
import {
  X,
  Droplet,
  ShieldAlert,
  ShieldCheck,
  Lightbulb,
  Sun,
  Flame,
  Users,
  Clock,
  MessageSquare,
  AlertOctagon,
  ChevronRight,
  Send,
  Plus,
  Play,
  Square,
  Wind,
  Thermometer,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  MapPin
} from 'lucide-react';

interface SpotDetailsProps {
  spot: WorkoutSpot | null;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateSpot: (updatedSpot: WorkoutSpot, xpEarned: number, activityLog: string) => void;
  onStartSession: (session: WorkoutSession) => void;
  onEndSession: (xpEarned: number, activityLog: string) => void;
}

export default function SpotDetails({
  spot,
  onClose,
  userProfile,
  onUpdateSpot,
  onStartSession,
  onEndSession
}: SpotDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'meetups' | 'reviews'>('info');

  // Météo Live state
  const [weather, setWeather] = useState<{
    temp: number;
    wind: number;
    conditionCode: number;
    conditionText: string;
  } | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useEffect(() => {
    if (!spot) return;
    setWeatherLoading(true);
    let active = true;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${spot.coordinates[0]}&longitude=${spot.coordinates[1]}&current_weather=true`)
      .then((res) => {
        if (!res.ok) throw new Error('Météo indisponible');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (data && data.current_weather) {
          const cw = data.current_weather;
          const code = cw.weathercode ?? cw.weather_code ?? 0;
          
          let txt = 'Beau temps';
          if (code === 0) txt = 'Grand soleil ☀️';
          else if (code >= 1 && code <= 3) txt = 'Partiellement nuageux ⛅';
          else if (code === 45 || code === 48) txt = 'Brouillard 🌫️';
          else if (code >= 51 && code <= 55) txt = 'Bruine légère 🌧️';
          else if (code >= 61 && code <= 65) txt = 'Pluie battante ☔';
          else if (code >= 71 && code <= 75) txt = 'Chutes de neige ❄️';
          else if (code >= 80 && code <= 82) txt = 'Averses de pluie 🌦️';
          else if (code >= 95) txt = 'Risques d\'orage ⛈️';

          setWeather({
            temp: Math.round(cw.temperature),
            wind: Math.round(cw.windspeed),
            conditionCode: code,
            conditionText: txt
          });
        }
        setWeatherLoading(false);
      })
      .catch((err) => {
        console.warn('Weather fetch failed:', err);
        if (active) {
          setWeather(null);
          setWeatherLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [spot?.id, spot?.coordinates]);

  // Review Form state
  const [reviewAuthor, setReviewAuthor] = useState(userProfile.username);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewEquipmentRating, setReviewEquipmentRating] = useState(5);
  const [reviewCrowdRating, setReviewCrowdRating] = useState(3);
  const [reviewContent, setReviewContent] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Meetup Form state
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [meetupTitle, setMeetupTitle] = useState('');
  const [meetupTime, setMeetupTime] = useState('18:00');
  const [meetupDate, setMeetupDate] = useState('Today');
  const [meetupDifficulty, setMeetupDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  // Report Form State
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportType, setReportType] = useState<'condition' | 'cleanliness' | 'crowd'>('condition');
  const [reportStatus, setReportStatus] = useState<'perfect' | 'good' | 'worn' | 'broken'>('good');
  const [reportDesc, setReportDesc] = useState('');

  // Active Session Timer state
  const [timerCount, setTimerCount] = useState(0);
  const isCurrentlyTrainingHere = userProfile.currentSession?.active && userProfile.currentSession?.spotId === spot?.id;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isCurrentlyTrainingHere) {
      const start = new Date(userProfile.currentSession!.startTime).getTime();
      const tick = () => {
        setTimerCount(Math.floor((Date.now() - start) / 1000));
      };
      tick();
      interval = setInterval(tick, 1000);
    } else {
      setTimerCount(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCurrentlyTrainingHere, userProfile.currentSession]);

  if (!spot) return null;

  const averageRating = spot.reviews.length
    ? spot.reviews.reduce((sum, r) => sum + r.rating, 0) / spot.reviews.length
    : 4.0;

  const currentHour = new Date().getHours();

  const handleChalkUp = () => {
    if (!isCurrentlyTrainingHere) {
      if (userProfile.currentSession?.active) {
        alert("Vous êtes déjà en cours d'entraînement sur un autre spot ! Terminez d'abord cette session.");
        return;
      }

      // Start Session
      const newSession: WorkoutSession = {
        spotId: spot.id,
        spotName: spot.name,
        startTime: new Date().toISOString(),
        active: true
      };
      
      onStartSession(newSession);

      const updatedSpot = {
        ...spot,
        activeUsers: spot.activeUsers + 1
      };
      onUpdateSpot(updatedSpot, 20, `Entraînement commencé à "${spot.name}" ! (+20 XP)`);
    } else {
      // Finish Session
      const elapsedMinutes = Math.max(1, Math.round(timerCount / 60));
      const xpReward = Math.min(100, 30 + elapsedMinutes * 2);

      const updatedSpot = {
        ...spot,
        activeUsers: Math.max(0, spot.activeUsers - 1)
      };

      onUpdateSpot(updatedSpot, xpReward, `Entraînement terminé à "${spot.name}". Durée : ${elapsedMinutes} min. (+${xpReward} XP)`);
      onEndSession(xpReward, `Fin d'entraînement à "${spot.name}".`);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewContent.trim()) return;

    const newReview: SpotReview = {
      id: `r-${Date.now()}`,
      author: reviewAuthor || 'Athlète Anonyme',
      rating: reviewRating,
      equipmentRating: reviewEquipmentRating,
      crowdRating: reviewCrowdRating,
      content: reviewContent,
      date: new Date().toISOString()
    };

    const updatedReviews = [newReview, ...spot.reviews];
    const updatedSpot = {
      ...spot,
      reviews: updatedReviews
    };

    onUpdateSpot(updatedSpot, 30, `A laissé un avis sur le spot "${spot.name}". (+30 XP)`);
    setReviewContent('');
    setShowReviewForm(false);
  };

  const handleAddReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDesc.trim()) return;

    const newReport: SpotReport = {
      id: `rep-${Date.now()}`,
      type: reportType,
      status: reportStatus,
      description: reportDesc,
      date: new Date().toISOString()
    };

    const updatedReports = [newReport, ...spot.reports];
    const updatedSpot = {
      ...spot,
      reports: updatedReports
    };

    onUpdateSpot(updatedSpot, 15, `Signalement d'état envoyé pour "${spot.name}". (+15 XP)`);
    setReportDesc('');
    setShowReportForm(false);
  };

  const handleAddMeetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetupTitle.trim()) return;

    const formatFrenchDate = (d: string) => {
      switch(d) {
        case 'Today': return 'Aujourd\'hui';
        case 'Tomorrow': return 'Demain';
        default: return d;
      }
    };

    const newMeetup: ScheduledWorkout = {
      id: `sw-${Date.now()}`,
      title: meetupTitle,
      time: meetupTime,
      date: formatFrenchDate(meetupDate),
      hostName: userProfile.username,
      attendeesCount: 1,
      userJoined: true,
      difficulty: meetupDifficulty
    };

    const updatedMeetups = [...(spot.scheduledWorkouts || []), newMeetup];
    const updatedSpot = {
      ...spot,
      scheduledWorkouts: updatedMeetups
    };

    onUpdateSpot(updatedSpot, 40, `A créé l\'événement "${meetupTitle}" au spot "${spot.name}". (+40 XP)`);
    setMeetupTitle('');
    setShowMeetupForm(false);
  };

  const toggleJoinMeetup = (meetupId: string) => {
    const meetups = spot.scheduledWorkouts || [];
    const updatedMeetups = meetups.map((m) => {
      if (m.id === meetupId) {
        const isJoinedNow = !m.userJoined;
        return {
          ...m,
          userJoined: isJoinedNow,
          attendeesCount: isJoinedNow ? m.attendeesCount + 1 : Math.max(0, m.attendeesCount - 1)
        };
      }
      return m;
    });

    const isJoining = updatedMeetups.find((m) => m.id === meetupId)?.userJoined;
    const logStr = isJoining
      ? `A rejoint l'événement au spot "${spot.name}". (+10 XP)`
      : `S'est désinscrit de l'événement au spot "${spot.name}".`;

    const updatedSpot = {
      ...spot,
      scheduledWorkouts: updatedMeetups
    };

    onUpdateSpot(updatedSpot, isJoining ? 10 : 0, logStr);
  };

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const translateEquipment = (eq: EquipmentType): string => {
    switch (eq) {
      case 'pullup_bars': return 'Poignées & Barres hautes de traction';
      case 'dip_bars': return 'Double station de dips';
      case 'parallel_bars': return 'Barres parallèles de calisthenics';
      case 'rings': return 'Anneaux de gymnastique suspendus';
      case 'monkey_bars': return 'Échelle horizontale / Monkey-bars';
      case 'swedish_wall': return 'Espalier vertical suédois';
      case 'ab_bench': return 'Banc abdominal incliné';
      case 'pushup_bars': return 'Poignées fixes rase-mottes';
      case 'low_bars': return 'Parallettes ou barres basses';
      case 'handstand_wall': return 'Mur rigide d\'appui (Handstand)';
      default: return eq;
    }
  };

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col relative overflow-hidden font-sans text-zinc-350">
      
      {/* Banner / Header Image */}
      <div className="h-44 relative group shrink-0">
        <img
          src={spot.imageUrl}
          alt={spot.name}
          className="w-full h-full object-cover brightness-[0.5] transition-all"
          referrerPolicy="no-referrer"
        />

        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-850 text-zinc-300 font-mono text-[9px] uppercase font-bold">
            Informations Équipement
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-4 inset-x-4 flex flex-col">
          <h2 className="font-display font-extrabold text-xl text-white tracking-tight leading-tight drop-shadow-sm">
            {spot.name}
          </h2>
          <span className="text-brand-accent text-xs font-mono mt-1.5 leading-none font-semibold">
            {spot.locationName}
          </span>
        </div>
      </div>

      {/* Training check-in details panel */}
      <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex flex-col gap-3 shrink-0">
        {isCurrentlyTrainingHere ? (
          <div className="flex flex-col gap-2 p-3 bg-zinc-900/60 border border-zinc-850 rounded">
            <div className="flex justify-between items-center font-mono">
              <span className="flex items-center gap-1.5 text-zinc-200 font-bold text-[11px] uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-accent animate-pulse" />
                Séance en cours
              </span>
              <span className="text-lg font-black text-brand-accent font-display">
                {formatTimer(timerCount)}
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-normal">
              Travaillez vos répétitions, puis validez pour enregistrer vos points d'XP fondamentaux.
            </p>
            <button
              onClick={handleChalkUp}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded bg-brand-accent text-white font-bold text-xs cursor-pointer transition-all hover:brightness-110 uppercase font-mono"
            >
              <Square className="w-3.5 h-3.5 fill-current text-white" />
              Terminer l'entraînement
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 bg-zinc-900/30 p-2.5 rounded border border-zinc-900/80">
            <div className="flex flex-col pl-1 text-xs">
              <span className="text-zinc-350 font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-accent" />
                <span>{spot.activeUsers} athlète{spot.activeUsers !== 1 ? 's' : ''} ici</span>
              </span>
              <span className="text-[10px] text-zinc-550 font-mono mt-0.5">
                {spot.coordinates[0].toFixed(4)}N, {spot.coordinates[1].toFixed(4)}E
              </span>
            </div>

            <button
              onClick={handleChalkUp}
              className="flex items-center gap-1 px-3 py-1.5 bg-brand-accent hover:brightness-110 text-white font-bold rounded text-xs uppercase tracking-wide cursor-pointer transition-all shrink-0 font-mono"
            >
              <Play className="w-3 h-3 fill-current text-white" />
              Chalk Up !
            </button>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-900 bg-zinc-955 px-2 shrink-0 select-none font-mono text-[11px] font-bold">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'info'
              ? 'border-brand-accent text-brand-accent font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-400'
          }`}
        >
          Structure
        </button>
        <button
          onClick={() => setActiveTab('meetups')}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'meetups'
              ? 'border-brand-accent text-brand-accent font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Événements ({spot.scheduledWorkouts?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-1.5 py-3 px-3 border-b-2 transition-all cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-brand-accent text-brand-accent font-black'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Notes ({spot.reviews.length})
        </button>
      </div>

      {/* Scrollable Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5 custom-scroll">
        
        {/* TAB 1: Specs & reports */}
        {activeTab === 'info' && (
          <>
            {/* Spot Description */}
            {spot.description && (
              <div className="p-3.5 rounded bg-zinc-900/35 border border-zinc-900/60 flex flex-col gap-2 font-sans">
                <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-brand-accent" />
                  Sélection Paris.fr
                </span>
                <p className="text-zinc-400 text-xs leading-relaxed font-normal">
                  {spot.description}
                </p>
              </div>
            )}

            {/* Weather widget */}
            <div className="p-3.5 rounded bg-zinc-900/25 border border-zinc-900 flex flex-col gap-2.5 font-sans">
              <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-semibold tracking-wider">
                Météo en direct du spot
              </span>
              
              {weatherLoading ? (
                <div className="flex items-center gap-2 py-1 text-xs text-zinc-500 font-mono">
                  <span className="w-2.5 h-2.5 border-2 border-t-transparent border-zinc-400 rounded-full animate-spin" />
                  <span>Actualisation de la météo...</span>
                </div>
              ) : weather ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded bg-zinc-900">
                        {(() => {
                          const code = weather.conditionCode;
                          if (code === 0) return <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />;
                          if (code >= 1 && code <= 3) return <CloudSun className="w-5 h-5 text-zinc-300" />;
                          if (code === 45 || code === 48) return <Cloud className="w-5 h-5 text-zinc-400" />;
                          if (code >= 51 && code <= 55) return <CloudRain className="w-5 h-5 text-blue-400" />;
                          if (code >= 61 && code <= 65) return <CloudRain className="w-5 h-5 text-blue-500" />;
                          if (code >= 80 && code <= 82) return <CloudRain className="w-5 h-5 text-blue-400" />;
                          if (code >= 95) return <CloudLightning className="w-5 h-5 text-red-400 animate-pulse" />;
                          return <Cloud className="w-5 h-5 text-zinc-300" />;
                        })()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-200 font-bold leading-tight">
                          {weather.conditionText}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono leading-none mt-1">
                          Coordonnées : {spot.coordinates[0].toFixed(3)}N, {spot.coordinates[1].toFixed(3)}E
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3.5 font-mono text-xs">
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Thermometer className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-bold">{weather.temp}°C</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-300">
                        <Wind className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{weather.wind} km/h</span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic condition helper warning */}
                  <div className="text-[10px] font-mono leading-relaxed bg-zinc-900/40 p-2 rounded-md border border-zinc-900/30 text-zinc-450">
                    {(() => {
                      if (weather.conditionCode >= 51) {
                        return "🚨 Pluie signalée. Les barres de traction peuvent être très glissantes ! Privilégiez les poignées ou le renforcement au sol.";
                      }
                      if (weather.temp < 10) {
                        return "❄️ Température fraîche. Prenez soin de faire un échauffement articulaire très progressif pour éviter les blessures.";
                      }
                      if (weather.temp > 28) {
                        return "🔥 Forte chaleur ! Hydratez-vous régulièrement, mouillez votre casquette et dosez bien vos temps de récupération.";
                      }
                      if (weather.wind > 25) {
                        return "💨 Fortes rafales de vent aujourd'hui. Prévoyez un pull coupe-vent pour garder vos muscles au chaud entre les séries.";
                      }
                      return "⚡ Excellentes conditions météorologiques actuellement pour s'entraîner en extérieur ! Profitez-en pour vous surpasser !";
                    })()}
                  </div>
                </div>
              ) : (
                <span className="text-xs text-zinc-500">Météo temporairement non disponible pour ce lieu.</span>
              )}
            </div>

            {/* Characteristics block */}
            <div className="grid grid-cols-2 gap-3 text-xs leading-tight">
              {/* Floor */}
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-900/80 flex gap-2.5 items-center">
                <ShieldCheck className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-semibold">Type de sol</span>
                  <span className="text-zinc-300 font-bold mt-1">
                    {spot.safetyFloor ? 'Gomme souple' : 'Gravier / Copeaux'}
                  </span>
                </div>
              </div>

              {/* Water */}
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-900/80 flex gap-2.5 items-center">
                <Droplet className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-semibold">Fonte d'eau</span>
                  <span className="text-zinc-300 font-bold mt-1">
                    {spot.waterSource ? 'À proximité' : 'Non répertoriée'}
                  </span>
                </div>
              </div>

              {/* Lighting */}
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-900/80 flex gap-2.5 items-center">
                <Lightbulb className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-semibold">Éclairage public</span>
                  <span className="text-zinc-300 font-bold mt-1">
                    {spot.lighting ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>

              {/* Shade */}
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-900/80 flex gap-2.5 items-center">
                <Sun className="w-4 h-4 text-zinc-400" />
                <div className="flex flex-col">
                  <span className="text-[9.5px] text-zinc-550 font-mono uppercase font-semibold">Ensoleillement</span>
                  <span className="text-zinc-300 font-bold mt-1">
                    {spot.shade === 'none' ? 'En plein soleil' : spot.shade === 'partial' ? 'Ombrage partiel' : 'Ombrage complet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Equipment item lists */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[10.5px] font-bold font-mono uppercase tracking-wider text-zinc-500">
                Agrès et Équipements installés
              </h3>
              <div className="flex flex-col rounded-lg border border-zinc-900 overflow-hidden font-sans text-xs">
                {spot.equipment.map((eq, idx) => (
                  <div
                    key={eq}
                    className={`p-3 text-zinc-300 flex justify-between items-center ${
                      idx !== spot.equipment.length - 1 ? 'border-b border-zinc-900/40' : ''
                    }`}
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span className="w-1 h-1 rounded-full bg-zinc-500" />
                      {translateEquipment(eq)}
                    </span>
                    <span className="text-[9px] bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded font-mono">
                      Acier
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Busy levels hourly graph */}
            <div className="flex flex-col gap-2">
              <h3 className="text-[10.5px] font-bold font-mono uppercase tracking-wider text-zinc-500 flex justify-between">
                <span>Affluence horaire moyenne</span>
              </h3>
              <div className="bg-zinc-900/20 p-4 border border-zinc-900 rounded-lg flex flex-col gap-3">
                <div className="h-16 flex items-end gap-[2.5px] select-none">
                  {spot.busyHours.map((value, idx) => {
                    const isNow = idx === currentHour;
                    return (
                      <div
                        key={idx}
                        style={{ height: `${value}%` }}
                        className={`flex-1 rounded-t-[1px] transition-all relative group/bar ${
                          isNow
                            ? 'bg-zinc-200'
                            : 'bg-zinc-800/80 hover:bg-zinc-650'
                        }`}
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-zinc-200 text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity mb-1 z-20 font-mono uppercase select-none">
                          {idx}h : {value}%
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono text-zinc-550 pt-1 border-t border-zinc-900/45">
                  <span>00:00</span>
                  <span>06:00</span>
                  <span>Midi</span>
                  <span>18:00</span>
                  <span>23h</span>
                </div>
              </div>
            </div>

            {/* Report list */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[10.5px] font-bold font-mono uppercase tracking-wider text-zinc-500">
                  État des équipements
                </h3>
                <button
                  onClick={() => setShowReportForm(!showReportForm)}
                  className="text-[10.5px] font-bold text-zinc-300 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Signaler un problème
                </button>
              </div>

              {showReportForm && (
                <form onSubmit={handleAddReport} className="bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg flex flex-col gap-3.5">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold">Catégorie</label>
                      <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value as any)}
                        className="bg-zinc-950 text-zinc-200 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer"
                      >
                        <option value="condition">Infrastructures</option>
                        <option value="cleanliness">Propreté / Déchets</option>
                        <option value="crowd">Affluence / Sécurité</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-zinc-500 uppercase font-bold">État actuel</label>
                      <select
                        value={reportStatus}
                        onChange={(e) => setReportStatus(e.target.value as any)}
                        className="bg-zinc-950 text-zinc-200 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer"
                      >
                        <option value="perfect">Parfait état</option>
                        <option value="good">Bon état standard</option>
                        <option value="worn">Usé / Rouillé</option>
                        <option value="broken">Endommagé / Dangereux</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 text-xs">
                    <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Description</label>
                    <textarea
                      value={reportDesc}
                      onChange={(e) => setReportDesc(e.target.value)}
                      placeholder="Indiquez l'élément endommagé ou l'état général..."
                      className="bg-zinc-950 text-zinc-200 border border-zinc-800 p-2 rounded h-16 resize-none focus:outline-none focus:border-zinc-200 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold transition-all cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={!reportDesc.trim()}
                      className="px-3 py-1.5 rounded bg-zinc-250 hover:bg-zinc-100 font-bold text-zinc-950 transition-all cursor-pointer disabled:opacity-50"
                    >
                      Envoyer
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-2">
                {spot.reports && spot.reports.length > 0 ? (
                  spot.reports.map((report) => (
                    <div key={report.id} className="p-3 rounded bg-zinc-900/30 border border-zinc-900 text-xs flex gap-3">
                      <div className="pt-0.5">
                        {report.status === 'perfect' && <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />}
                        {report.status === 'good' && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {report.status === 'worn' && <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />}
                        {report.status === 'broken' && <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />}
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-center font-mono text-[10px]">
                          <span className="font-bold text-zinc-300 capitalize">
                            {report.type === 'condition' ? 'Infrastructures' : report.type === 'cleanliness' ? 'Propreté' : 'Affluence'} •{' '}
                            <span className={report.status === 'perfect' || report.status === 'good' ? 'text-emerald-500' : 'text-amber-500'}>
                              {report.status === 'perfect' ? 'Parfait' : report.status === 'good' ? 'Bon' : report.status === 'worn' ? 'Usé' : 'Cassé'}
                            </span>
                          </span>
                          <span className="text-zinc-550">
                            {new Date(report.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-zinc-400 mt-1">{report.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center rounded border border-dashed border-zinc-900 text-zinc-650 text-xs">
                    Aucun incident signalé récemment. Les agrès sont considérés stables.
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: Meetups */}
        {activeTab === 'meetups' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10.5px] font-bold font-mono uppercase tracking-wider text-zinc-500">
                Séances groupées programmées
              </h3>
              <button
                onClick={() => setShowMeetupForm(!showMeetupForm)}
                className="text-[10.5px] font-bold text-zinc-300 flex items-center gap-1 hover:underline cursor-pointer font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                Créer un événement
              </button>
            </div>

            {showMeetupForm && (
              <form onSubmit={handleAddMeetup} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col gap-3 font-sans">
                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase">Nom de l'entraînement</label>
                  <input
                    type="text"
                    required
                    value={meetupTitle}
                    onChange={(e) => setMeetupTitle(e.target.value)}
                    placeholder="Ex: Séance Dips & Tractions lestées"
                    className="bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 p-2 rounded focus:outline-none focus:border-zinc-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase">Date de début</label>
                    <select
                      value={meetupDate}
                      onChange={(e) => setMeetupDate(e.target.value)}
                      className="bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer"
                    >
                      <option value="Today">Aujourd'hui</option>
                      <option value="Tomorrow">Demain</option>
                      <option value="Ce mercredi">Ce mercredi</option>
                      <option value="Ce samedi">Ce samedi</option>
                      <option value="Ce dimanche">Ce dimanche</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase">Heure</label>
                    <input
                      type="text"
                      required
                      value={meetupTime}
                      onChange={(e) => setMeetupTime(e.target.value)}
                      placeholder="Ex: 18:30"
                      className="bg-zinc-950 text-xs text-zinc-200 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase">Niveau ciblé</label>
                  <div className="grid grid-cols-4 gap-1 font-mono">
                    {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setMeetupDifficulty(lvl)}
                        className={`py-1 rounded text-[9.5px] border font-bold capitalize cursor-pointer ${
                          meetupDifficulty === lvl
                            ? 'bg-zinc-800 border-zinc-500 text-zinc-100'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-500'
                        }`}
                      >
                        {lvl === 'all' ? 'tous' : lvl === 'beginner' ? 'déb.' : lvl === 'intermediate' ? 'inter.' : 'avancé'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 text-xs font-mono pt-1">
                  <button
                    type="button"
                    onClick={() => setShowMeetupForm(false)}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-zinc-250 hover:bg-zinc-100 font-bold text-zinc-950 cursor-pointer shadow-sm"
                  >
                    Publier l'événement
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3 font-sans">
              {spot.scheduledWorkouts && spot.scheduledWorkouts.length > 0 ? (
                spot.scheduledWorkouts.map((meetup) => (
                  <div
                    key={meetup.id}
                    className={`p-3.5 rounded border flex justify-between items-center gap-3 ${
                      meetup.userJoined
                        ? 'bg-zinc-900/60 border-zinc-700'
                        : 'bg-zinc-900/10 border-zinc-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-zinc-200">
                          {meetup.title}
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-zinc-900 text-zinc-450 border border-zinc-850">
                          {meetup.difficulty === 'all' ? 'Tous' : meetup.difficulty === 'beginner' ? 'Débutant' : meetup.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-zinc-500 text-[10.5px] font-mono mt-1.5 leading-none">
                        <span className="text-zinc-350">{meetup.date} à {meetup.time}</span>
                        <span>•</span>
                        <span>Par : {meetup.hostName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 font-mono text-zinc-400">
                      <div className="flex flex-col items-end leading-none">
                        <span className="text-xs font-bold text-zinc-200">{meetup.attendeesCount}</span>
                        <span className="text-[8.5px] text-zinc-500 mt-1">Inscrit{meetup.attendeesCount > 1 ? 's' : ''}</span>
                      </div>

                      <button
                        onClick={() => toggleJoinMeetup(meetup.id)}
                        className={`px-2.5 py-1.5 rounded text-[10.5px] font-bold select-none cursor-pointer ${
                          meetup.userJoined
                            ? 'bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-700'
                            : 'bg-zinc-100 text-zinc-950 hover:bg-zinc-200'
                        }`}
                      >
                        {meetup.userJoined ? 'Rejoint ✓' : 'Participer'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center rounded border border-dashed border-zinc-900 text-zinc-650 text-xs">
                  Aucun événement planifié. Cliquez sur "Créer un événement" pour rameuter du monde !
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Reviews */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-4 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-mono font-bold text-zinc-100 leading-none">
                  {averageRating.toFixed(1)}
                </span>
                <div className="flex flex-col leading-none text-zinc-555 font-mono text-[10px]">
                  <span>Note moyenne</span>
                  <span className="mt-0.5 text-amber-500">★ ★ ★ ★ ☆</span>
                </div>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-[10.5px] font-bold text-zinc-300 flex items-center gap-1 hover:underline cursor-pointer font-mono"
              >
                <Plus className="w-3.5 h-3.5" />
                Écrire un avis
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleAddReview} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Général</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="bg-zinc-950 text-amber-504 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((val) => (
                        <option key={val} value={val}>★ {val}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Matériel</label>
                    <select
                      value={reviewEquipmentRating}
                      onChange={(e) => setReviewEquipmentRating(Number(e.target.value))}
                      className="bg-zinc-950 text-zinc-300 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((val) => (
                        <option key={val} value={val}>{val}/5 agrès</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-zinc-500 uppercase font-bold">Frequentat.</label>
                    <select
                      value={reviewCrowdRating}
                      onChange={(e) => setReviewCrowdRating(Number(e.target.value))}
                      className="bg-zinc-950 text-zinc-300 border border-zinc-800 p-1.5 rounded focus:outline-none focus:border-zinc-200 cursor-pointer text-xs"
                    >
                      {[5, 4, 3, 2, 1].map((val) => (
                        <option key={val} value={val}>{val === 5 ? 'Bondé' : val === 3 ? 'Moyen' : 'Calme'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 text-xs">
                  <label className="text-[9px] font-mono text-zinc-500 uppercase font-bold">Avis de l'athlète</label>
                  <textarea
                    required
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Hauteur des barres de traction, stabilité des barres de dips, ambiance de la communauté..."
                    className="bg-zinc-950 text-zinc-200 border border-zinc-800 p-2.5 rounded h-20 resize-none focus:outline-none focus:border-zinc-200 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-bold cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded bg-zinc-250 hover:bg-zinc-100 font-bold text-zinc-950 shadow-sm cursor-pointer"
                  >
                    Publier l'avis
                  </button>
                </div>
              </form>
            )}

            <div className="flex flex-col gap-3">
              {spot.reviews.map((review) => (
                <div key={review.id} className="p-3.5 bg-zinc-900/10 border border-zinc-900 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col leading-none">
                      <span className="text-zinc-200 font-bold text-xs">{review.author}</span>
                      <span className="text-[10px] font-mono text-zinc-550 mt-1">Publié le {new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-[11px] text-amber-550 font-bold">
                      <span>★ {review.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {review.content}
                  </p>

                  <div className="flex gap-4 border-t border-zinc-900/30 pt-2 text-[10px] font-mono text-zinc-550">
                    <span>Agrès : <strong className="text-zinc-400">{review.equipmentRating}/5</strong></span>
                    <span>Affluence : <strong className="text-zinc-400">{review.crowdRating}/5</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
