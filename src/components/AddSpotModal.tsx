import React, { useState } from 'react';
import { WorkoutSpot, EquipmentType } from '../types';
import { X, Check } from 'lucide-react';

interface AddSpotModalProps {
  lat: number;
  lng: number;
  onClose: () => void;
  onAddSpot: (newSpot: WorkoutSpot) => void;
}

export default function AddSpotModal({
  lat,
  lng,
  onClose,
  onAddSpot
}: AddSpotModalProps) {
  const [name, setName] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [shade, setShade] = useState<'none' | 'partial' | 'full'>('partial');
  const [safetyFloor, setSafetyFloor] = useState(true);
  const [lighting, setLighting] = useState(false);
  const [waterSource, setWaterSource] = useState(true);

  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType[]>(['pullup_bars']);

  const imagePresets = [
    'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=60'
  ];
  const [selectedImage, setSelectedImage] = useState(imagePresets[0]);

  const EQUIPMENT_OPTIONS: { id: EquipmentType; label: string }[] = [
    { id: 'pullup_bars', label: 'Barres hautes de traction' },
    { id: 'dip_bars', label: 'Double station de dips' },
    { id: 'parallel_bars', label: 'Barres parallèles moyennes' },
    { id: 'rings', label: 'Anneaux de gymnastique' },
    { id: 'monkey_bars', label: 'Échelle de suspension' },
    { id: 'swedish_wall', label: 'Espalier vertical suédois' },
    { id: 'ab_bench', label: 'Banc abdominal incliné' },
    { id: 'pushup_bars', label: 'Poignées basses au sol' },
    { id: 'low_bars', label: 'Parallettes ou barres basses' },
    { id: 'handstand_wall', label: 'Mur rigide d\'appui (Handstand)' }
  ];

  const handleToggleEquipment = (eqId: EquipmentType) => {
    if (selectedEquipment.includes(eqId)) {
      if (selectedEquipment.length === 1) return;
      setSelectedEquipment(selectedEquipment.filter((item) => item !== eqId));
    } else {
      setSelectedEquipment([...selectedEquipment, eqId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationName.trim()) return;

    const newSpot: WorkoutSpot = {
      id: `spot-${Date.now()}`,
      name: name.trim(),
      locationName: locationName.trim(),
      coordinates: [lat, lng],
      equipment: selectedEquipment,
      safetyFloor,
      shade,
      lighting,
      waterSource,
      difficulty,
      busyHours: [0, 0, 0, 0, 0, 10, 20, 35, 45, 55, 60, 65, 70, 75, 70, 75, 80, 85, 90, 75, 50, 30, 20, 5],
      activeUsers: 0,
      imageUrl: selectedImage,
      description: description.trim() || 'Une superbe nouvelle aire de street workout pour s\'entraîner durablement à Paris.',
      reviews: [],
      reports: [
        {
          id: `rep-${Date.now()}`,
          type: 'condition',
          status: 'perfect',
          description: 'Spot répertorié. Équipement neuf et parfaitement stable.',
          date: new Date().toISOString()
        }
      ],
      scheduledWorkouts: []
    };

    onAddSpot(newSpot);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-zinc-950 border border-zinc-900 rounded-lg w-full max-w-md shadow-2xl relative overflow-hidden flex flex-col flex-1 max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4.5 border-b border-zinc-900 flex justify-between items-center sm:px-5">
          <div className="flex flex-col select-none">
            <h2 className="font-sans font-bold text-sm text-zinc-100 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-200" />
              Répertorier un nouveau spot de street workout
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 px-1.5 rounded-full bg-zinc-900 text-zinc-400 hover:text-zinc-150 cursor-pointer border border-zinc-850"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4.5 custom-scroll text-zinc-300">
          
          {/* Coordinates indicator */}
          <div className="p-3 bg-zinc-900/40 rounded border border-zinc-900 text-xs font-mono flex justify-between items-center text-zinc-450">
            <span>Coordonnées géographiques :</span>
            <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 text-zinc-300">
              {lat.toFixed(5)}°N, {lng.toFixed(5)}°E
            </span>
          </div>

          {/* Setup inputs info */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Nom du spot</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Agrès du Quai de la Râpée"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs p-2.5 rounded hover:border-zinc-750 focus:outline-none focus:border-zinc-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Arrondissement / Repères géographiques</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Ex: Près du Pont d'Austerlitz, Paris 12ème"
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs p-2.5 rounded hover:border-zinc-750 focus:outline-none focus:border-zinc-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Description & historique du spot</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Ex: Grand portique moderne Kenguru PRO. Très populaire, avec de nombreux agrès robustes..."
                className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs p-2.5 rounded hover:border-zinc-750 focus:outline-none focus:border-zinc-200 resize-none font-sans"
              />
            </div>
          </div>

          {/* Difficulty and Shade */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Difficulté d'accès</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="bg-zinc-900 text-zinc-350 border border-zinc-800 text-xs p-2 rounded cursor-pointer focus:outline-none focus:border-zinc-200"
              >
                <option value="all">Tous niveaux (Débutant à Confirmé)</option>
                <option value="beginner">Débutant Friendly</option>
                <option value="intermediate">Intermédiaire</option>
                <option value="advanced">Confirmé / Force athlétique</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider font-semibold">Ombrage / Soleil</label>
              <select
                value={shade}
                onChange={(e) => setShade(e.target.value as any)}
                className="bg-zinc-900 text-zinc-355 border border-zinc-800 text-xs p-2 rounded cursor-pointer focus:outline-none focus:border-zinc-200"
              >
                <option value="none">Exposition plein soleil</option>
                <option value="partial">Ombrage partiel / Arbres</option>
                <option value="full">Ombrage complet</option>
              </select>
            </div>
          </div>

          {/* Toggle buttons for amenities */}
          <div className="grid grid-cols-3 gap-2 font-mono text-[9px] uppercase tracking-wider font-bold">
            <button
              type="button"
              onClick={() => setSafetyFloor(!safetyFloor)}
              className={`p-2 rounded border cursor-pointer flex flex-col items-center justify-center gap-1 transition-all h-12 leading-none ${
                safetyFloor
                  ? 'bg-zinc-900 border-zinc-500 text-zinc-200'
                  : 'bg-transparent border-zinc-900 text-zinc-550'
              }`}
            >
              <span>Sol amortissant</span>
            </button>

            <button
              type="button"
              onClick={() => setLighting(!lighting)}
              className={`p-2 rounded border cursor-pointer flex flex-col items-center justify-center gap-1 transition-all h-12 leading-none ${
                lighting
                  ? 'bg-zinc-900 border-zinc-500 text-zinc-200'
                  : 'bg-transparent border-zinc-900 text-zinc-550'
              }`}
            >
              <span>Éclairé de nuit</span>
            </button>

            <button
              type="button"
              onClick={() => setWaterSource(!waterSource)}
              className={`p-2 rounded border cursor-pointer flex flex-col items-center justify-center gap-1 transition-all h-12 leading-none ${
                waterSource
                  ? 'bg-zinc-900 border-zinc-500 text-zinc-200'
                  : 'bg-transparent border-zinc-900 text-zinc-550'
              }`}
            >
              <span>Eau potable</span>
            </button>
          </div>

          {/* Equipment Options */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Agrès installés sur place</label>
            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 border border-zinc-900 rounded bg-zinc-950/40 custom-scroll font-mono text-[10px]">
              {EQUIPMENT_OPTIONS.map((opt) => {
                const isSelected = selectedEquipment.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleToggleEquipment(opt.id)}
                    className={`p-2 rounded border flex items-center justify-between text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-zinc-900 border-zinc-700 text-zinc-150'
                        : 'bg-transparent border-zinc-900/60 text-zinc-550'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <div className={`w-3.5 h-3.5 p-0.5 rounded border border-zinc-700 aspect-square flex items-center justify-center ${
                      isSelected ? 'bg-zinc-200 border-zinc-200 text-zinc-950' : 'bg-transparent text-transparent'
                    }`}>
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[3.5]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Image presets */}
          <div className="flex flex-col gap-1 font-sans">
            <label className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Image de couverture du spot</label>
            <div className="grid grid-cols-4 gap-2">
              {imagePresets.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`h-10 rounded overflow-hidden border cursor-pointer transition-all ${
                    selectedImage === img ? 'border-zinc-300 scale-[1.03]' : 'border-zinc-900 opacity-50'
                  }`}
                >
                  <img src={img} alt="Aperçu couverture" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Footer controls */}
          <div className="flex justify-end gap-2 border-t border-zinc-900 pt-4 mt-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-zinc-900 hover:bg-zinc-850 hover:text-zinc-150 text-zinc-400 font-bold transition-all text-xs cursor-pointer border border-zinc-850 shrink-0"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || !locationName.trim()}
              className="px-4 py-2 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-bold text-xs transition-all tracking-wider cursor-pointer disabled:opacity-40"
            >
              Enregistrer le spot
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
