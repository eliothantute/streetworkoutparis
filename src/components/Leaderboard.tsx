import { UserProfile } from '../types';
import { Award, Zap, CheckCircle, TrendingUp, History, User } from 'lucide-react';

interface LeaderboardProps {
  userProfile: UserProfile;
  activityLogs: string[];
}

export default function Leaderboard({
  userProfile,
  activityLogs
}: LeaderboardProps) {
  const currentXp = userProfile.xp;
  const xpNeededForNextLevel = userProfile.level * 300;
  const percentage = Math.min(100, Math.round((currentXp / xpNeededForNextLevel) * 100));

  const getフランスAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'zap': return <Zap className="w-4 h-4 text-zinc-400" />;
      case 'message-square': return <Award className="w-4 h-4 text-zinc-400" />;
      case 'award': return <Award className="w-4 h-4 text-zinc-400" />;
      case 'moon': return <Award className="w-4 h-4 text-zinc-400" />;
      case 'users': return <Award className="w-4 h-4 text-zinc-400" />;
      default: return <Award className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-5 p-4 overflow-y-auto custom-scroll font-mono text-xs">
      
      {/* Profile Overview Card */}
      <div className="p-4 rounded border border-zinc-900 bg-zinc-950 flex flex-col gap-3.5 relative overflow-hidden">
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
            <User className="w-5 h-5 stroke-[1.5]" />
          </div>

          <div className="flex flex-col select-none">
            <h3 className="font-sans font-bold text-sm text-zinc-100 leading-tight">
              {userProfile.username}
            </h3>
            <span className="text-[9.5px] text-zinc-500 mt-0.5 leading-none uppercase tracking-wider font-semibold">
              Athlète de Calisthénie
            </span>
          </div>
        </div>

        {/* Level Indicator */}
        <div className="flex items-end justify-between border-t border-zinc-900/60 pt-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9.5px] text-zinc-550 uppercase font-semibold leading-none">Rang Actuel</span>
            <span className="text-zinc-100 text-sm font-bold font-sans">
              Niveau {userProfile.level}
            </span>
          </div>

          <div className="flex flex-col items-end gap-0.5 text-right font-mono text-[10px]">
            <span className="text-[9.5px] text-zinc-550 uppercase font-semibold leading-none">Progression</span>
            <span className="text-zinc-400 mt-0.5">
              {currentXp} / {xpNeededForNextLevel} XP <strong className="text-zinc-100">({percentage}%)</strong>
            </span>
          </div>
        </div>

        {/* Minimal Black/White progress layout */}
        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-900/40">
          <div
            style={{ width: `${percentage}%` }}
            className="h-full bg-zinc-200 rounded-full transition-all duration-500"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 border-t border-zinc-900/60 pt-3 text-[10.5px]">
          <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900/50">
            <span className="text-[9px] text-[#71717a] font-bold uppercase block">Séances validées</span>
            <strong className="text-zinc-300 font-sans text-[12.5px] block mt-1">{userProfile.sessionsCompleted} séances</strong>
          </div>
          <div className="bg-zinc-900/20 p-2.5 rounded border border-zinc-900/50">
            <span className="text-[9px] text-[#71717a] font-bold uppercase block">Points d'XP totaux</span>
            <strong className="text-zinc-300 font-sans text-[12.5px] block mt-1">{userProfile.xp} XP</strong>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 leading-none">
          <History className="w-3.5 h-3.5" />
          <span>Journal d'activité en temps réel</span>
        </h3>

        <div className="flex flex-col bg-zinc-950 p-2 border border-zinc-900 rounded h-40 overflow-y-auto custom-scroll flex-1 font-mono text-[10.5px] leading-snug">
          {activityLogs.length > 0 ? (
            <div className="flex flex-col gap-2">
              {activityLogs.map((log, index) => {
                // Translate standard generic logs to french for elegant experience
                let frenchLog = log;
                if (frenchLog.includes("Shared current location!")) {
                  frenchLog = frenchLog.replace("Shared current location! Distance to all Paris street gym spots computed.", "Coordonnées GPS partagées ! Calcul de la distance vers les spots parisiens.");
                } else if (frenchLog.includes("Added spot review")) {
                  frenchLog = frenchLog.replace("Added spot review & feedback for", "Avis publié pour");
                } else if (frenchLog.includes("Pinned brand new calisthenics spot")) {
                  frenchLog = frenchLog.replace("Pinned brand new calisthenics spot", "Ajout du tout nouveau spot de calisthénie");
                } else if (frenchLog.includes("Created community workout meetup")) {
                  frenchLog = frenchLog.replace("Created community workout meetup", "Événement d'entraînement créé :");
                } else if (frenchLog.includes("Joined calisthenics group meetup")) {
                  frenchLog = frenchLog.replace("Joined calisthenics group meetup", "S'est inscrit à la séance collective");
                } else if (frenchLog.includes("Chalked up: Started active training session")) {
                  frenchLog = frenchLog.replace("Chalked up: Started active training session at", "Séance de sport commencée à");
                } else if (frenchLog.includes("Workout session completed")) {
                  frenchLog = frenchLog.replace("Workout session completed at", "Entraînement validé à");
                  frenchLog = frenchLog.replace("Duration", "Durée");
                } else if (frenchLog.includes("Unlocked Badge")) {
                  frenchLog = frenchLog.replace("Unlocked Badge", "Trophée débloqué !");
                }
                
                return (
                  <div
                    key={index}
                    className="p-1.5 bg-zinc-900/35 border border-zinc-900/30 rounded text-zinc-400 hover:text-zinc-300 transition-colors flex gap-2 items-start"
                  >
                    <TrendingUp className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                    <span className="font-sans text-[11px] font-medium leading-relaxed">{frenchLog}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center text-zinc-600 text-xs py-4 p-4 font-sans">
              <span>Aucune activité enregistrée. Rejoignez un rassemblement ou terminez une séance d'entraînement !</span>
            </div>
          )}
        </div>
      </div>

      {/* Achievements Unlocked sections */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 leading-none">
          <Award className="w-3.5 h-3.5" />
          <span>Hauts faits & Trophées ({userProfile.achievements.filter((a) => a.unlocked).length}/{userProfile.achievements.length})</span>
        </h3>

        <div className="flex flex-col gap-2">
          {userProfile.achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3 rounded border flex gap-3.5 items-center transition-all duration-200 ${
                ach.unlocked
                  ? 'bg-zinc-900/20 border-zinc-800'
                  : 'bg-transparent border-zinc-900/60 opacity-45'
              }`}
            >
              <div className="p-2 bg-zinc-900 border border-zinc-850 rounded shrink-0 flex items-center justify-center">
                {getフランスAchievementIcon(ach.icon)}
              </div>

              <div className="flex-1 flex flex-col font-sans">
                <div className="flex items-center gap-1.5 leading-none">
                  <h4 className={`font-bold text-xs ${ach.unlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                    {ach.title}
                  </h4>
                  <span className="font-mono text-[9px] text-zinc-400 font-semibold text-[8px]">+{ach.xpValue} XP</span>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              {ach.unlocked && (
                <CheckCircle className="w-4 h-4 text-zinc-150 shrink-0 select-none" />
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
