import React from 'react';
import { WorkoutSpot, EquipmentType } from '../types';
import { Compass, Users, Star, Droplet, Shield, Lightbulb } from 'lucide-react';
import { formatDistance } from '../utils/distance';

interface SpotListItemProps {
  key?: string | number;
  spot: WorkoutSpot;
  isSelected: boolean;
  distance: number | null;
  onSelect: () => void;
}

export default function SpotListItem({
  spot,
  isSelected,
  distance,
  onSelect
}: SpotListItemProps) {
  // Translate equipment type to French friendly labels
  const translateEquipment = (eq: EquipmentType): string => {
    switch (eq) {
      case 'pullup_bars': return 'Traction';
      case 'dip_bars': return 'Dips';
      case 'parallel_bars': return 'Parallèles';
      case 'rings': return 'Anneaux';
      case 'monkey_bars': return 'Échelle v.';
      case 'swedish_wall': return 'Espalier';
      case 'ab_bench': return 'Banc abdois';
      case 'pushup_bars': return 'Grip sol';
      case 'low_bars': return 'Barres basses';
      case 'handstand_wall': return 'Mur Handstand';
      default: return eq;
    }
  };

  const averageRating = spot.reviews.length
    ? spot.reviews.reduce((sum, r) => sum + r.rating, 0) / spot.reviews.length
    : 4.0;

  const difficultyNames = {
    all: 'Tous niveaux',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé'
  };

  const difficultyColors = {
    all: 'text-zinc-400 bg-zinc-900 border-zinc-800',
    beginner: 'text-emerald-400 bg-zinc-900 border-emerald-950',
    intermediate: 'text-amber-400 bg-zinc-900 border-amber-950',
    advanced: 'text-red-400 bg-zinc-900 border-red-950'
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 flex flex-col gap-2.5 relative select-none ${
        isSelected
          ? 'bg-zinc-900/60 border-zinc-200 text-zinc-100'
          : 'bg-transparent border-zinc-900 text-zinc-400 hover:bg-zinc-900/20 hover:border-zinc-800'
      }`}
    >
      {/* Absolute top marker color cue */}
      {isSelected && (
        <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-brand-accent animate-pulse" />
      )}

      {/* Spot Information */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h3 className="font-sans font-medium text-sm text-zinc-100 leading-tight">
            {spot.name}
          </h3>
          <span className="font-mono text-[10.5px] text-zinc-500 mt-1 leading-none">
            {spot.locationName}
          </span>
        </div>

        {/* Rating score */}
        <div className="flex items-center gap-1 shrink-0 text-amber-500 font-mono text-xs">
          <Star className="w-3 h-3 fill-current" />
          <span className="font-bold">{averageRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Modern equipment labels list */}
      <div className="flex flex-wrap gap-1">
        {spot.equipment.slice(0, 3).map((eq) => (
          <span
            key={eq}
            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-400"
          >
            {translateEquipment(eq)}
          </span>
        ))}
        {spot.equipment.length > 3 && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-900 border border-zinc-850 text-zinc-300">
            +{spot.equipment.length - 3} autres
          </span>
        )}
      </div>

      {/* Bottom details indicators footer */}
      <div className="flex items-center justify-between border-t border-zinc-900/40 pt-2 text-[11px] mt-0.5 font-mono">
        <div className="flex items-center gap-2 text-zinc-500">
          {distance !== null ? (
            <div className="flex items-center gap-1 text-zinc-400">
              <Compass className="w-3 h-3 animate-spin-slow" />
              <span>{formatDistance(distance)}</span>
            </div>
          ) : (
            <span>{spot.coordinates[0].toFixed(3)}N, {spot.coordinates[1].toFixed(3)}E</span>
          )}

          {/* Quick symbols of amenities */}
          <div className="flex items-center gap-1">
            {spot.safetyFloor && (
              <Shield className="w-3 h-3 text-zinc-550" title="Sol amortissant" />
            )}
            {spot.waterSource && (
              <Droplet className="w-3 h-3 text-zinc-550" title="Eau potable" />
            )}
            {spot.lighting && (
              <Lightbulb className="w-3 h-3 text-zinc-550" title="Éclairage nocturne" />
            )}
          </div>
        </div>

        {/* Level and active users indicators */}
        <div className="flex items-center gap-1.5 text-[9.5px]">
          {spot.activeUsers > 0 && (
            <span className="flex items-center gap-1 text-cyan-400 font-bold bg-cyan-950/10 px-1 py-0.5 rounded border border-cyan-950/30">
              <Users className="w-2.5 h-2.5" />
              <span>{spot.activeUsers} actif{spot.activeUsers > 1 ? 's' : ''}</span>
            </span>
          )}

          <span
            className={`px-1.5 py-0.5 rounded font-bold border text-[9.5px] ${
              difficultyColors[spot.difficulty]
            }`}
          >
            {difficultyNames[spot.difficulty]}
          </span>
        </div>
      </div>

    </div>
  );
}
