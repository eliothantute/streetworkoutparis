import { WorkoutSpot, UserProfile } from '../types';

export const INITIAL_SPOTS: WorkoutSpot[] = [
  {
    id: 'grands-explorateurs',
    name: 'Jardin des Grands-Explorateurs',
    locationName: 'Avenue de l\'Observatoire, Paris 6ème',
    coordinates: [48.8415, 2.3368],
    description: 'Une magnifique aire de street workout nichée au cœur du jardin historique des Grands-Explorateurs Marco-Polo, entre l\'Avenue de l\'Observatoire et la Rue d\'Assas, à deux pas du Jardin du Luxembourg. Elle offre un cadre majestueux entouré d\'arbres anciens et de statues célèbres. L\'équipement est récent, moderne et parfaitement intégré au paysage verdoyant.',
    equipment: [
      'pullup_bars',
      'dip_bars',
      'parallel_bars',
      'monkey_bars',
      'swedish_wall',
      'ab_bench'
    ],
    safetyFloor: true,
    shade: 'full',
    lighting: false,
    waterSource: true,
    difficulty: 'all',
    busyHours: [5, 2, 1, 0, 0, 5, 15, 30, 45, 40, 50, 60, 75, 70, 65, 80, 95, 90, 85, 70, 50, 30, 15, 8],
    activeUsers: 3,
    imageUrl: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=800&auto=format&fit=crop&q=60',
    reviews: [
      {
        id: 'r1',
        author: 'Guillaume_SW',
        rating: 5,
        equipmentRating: 5,
        crowdRating: 4,
        content: 'Cadre exceptionnel juste à côté du Jardin du Luxembourg. C\'est tellement agréable d\'avoir des barres de traction flambant neuves sous d\'immenses arbres centenaires. Le sol souple amortissant est parfait !',
        date: '2026-06-01T17:30:00Z'
      },
      {
        id: 'r2',
        author: 'Camille_K',
        rating: 4,
        equipmentRating: 4,
        crowdRating: 3,
        content: 'Très ombragé, ce qui est sauve la mise en plein été. Un filet d\'eau potable à proximité pour remplir la gourde. Très bonne ambiance.',
        date: '2026-05-28T10:15:00Z'
      }
    ],
    reports: [
      {
        id: 'rep1',
        type: 'condition',
        status: 'perfect',
        description: 'Agrès en parfait état, structure solide et aucun jeu.',
        date: '2026-06-01T08:00:00Z'
      }
    ],
    scheduledWorkouts: [
      {
        id: 'sw1',
        title: 'Session Renfo Standard',
        time: '18:15',
        date: 'Aujourd\'hui',
        hostName: 'Guillaume_SW',
        attendeesCount: 3,
        userJoined: false,
        difficulty: 'all'
      }
    ]
  },
  {
    id: 'henri-christine',
    name: 'Square Henri Christiné',
    locationName: 'Place du Colonel Fabien, Paris 10ème',
    coordinates: [48.8778, 2.3687],
    description: 'Situé sur la Place du Colonel Fabien près du dynamique Canal Saint-Martin, ce spot emblématique du 10ème arrondissement offre une ambiance typiquement urbaine sous la ligne aérienne du métro parisien. Conçu pour le fitness et le renforcement musculaire lourd, il est idéal pour les Street Workouts énergiques au cœur du quartier populaire.',
    equipment: [
      'pullup_bars',
      'dip_bars',
      'parallel_bars',
      'pushup_bars',
      'low_bars'
    ],
    safetyFloor: true,
    shade: 'partial',
    lighting: true,
    waterSource: true,
    difficulty: 'beginner',
    busyHours: [0, 0, 0, 0, 0, 10, 25, 40, 50, 45, 55, 65, 80, 85, 70, 75, 88, 90, 80, 60, 40, 20, 10, 5],
    activeUsers: 2,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=60',
    reviews: [
      {
        id: 'r3',
        author: 'Yanis_L',
        rating: 4,
        equipmentRating: 4,
        crowdRating: 4,
        content: 'Idéal si vous aimez l\'ambiance industrielle et urbaine parisienne. Les barres de dips sont très larges et solides. Accès très facile directement à la sortie du métro Colonel Fabien.',
        date: '2026-05-30T14:20:00Z'
      }
    ],
    reports: [
      {
        id: 'rep2',
        type: 'condition',
        status: 'good',
        description: 'Toutes les barres sont propres, le sol est en bon état.',
        date: '2026-05-29T16:00:00Z'
      }
    ],
    scheduledWorkouts: [
      {
        id: 'sw2',
        title: 'Circuit Dips & Tractions débutants',
        time: '08:00',
        date: 'Demain',
        hostName: 'Coach_Marc',
        attendeesCount: 2,
        userJoined: false,
        difficulty: 'beginner'
      }
    ]
  },
  {
    id: 'ile-aux-cygnes',
    name: 'Île aux Cygnes',
    locationName: 'Sous le Pont de Grenelle, Paris 15ème',
    coordinates: [48.8501, 2.2798],
    description: 'Sûrement l\'un des spots les plus incroyables de la capitale, situé sur une île piétonne artificielle bordée par la Seine. Installé à la pointe de l\'Île aux Cygnes, directement sous le Pont de Grenelle et au pied de la célèbre réplique parisienne de la Statue de la Liberté. Vous vous entraînez au son de l\'eau avec une vue imprenable sur la Tour Eiffel et la silhouette urbaine de Beaugrenelle.',
    equipment: [
      'pullup_bars',
      'parallel_bars',
      'monkey_bars',
      'rings',
      'swedish_wall',
      'ab_bench'
    ],
    safetyFloor: true,
    shade: 'partial',
    lighting: true,
    waterSource: true,
    difficulty: 'intermediate',
    busyHours: [0, 0, 0, 0, 0, 5, 10, 20, 30, 45, 50, 60, 70, 80, 85, 90, 100, 95, 80, 65, 40, 20, 5, 0],
    activeUsers: 4,
    imageUrl: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=800&auto=format&fit=crop&q=60',
    reviews: [
      {
        id: 'r4',
        author: 'Sarah_Libre',
        rating: 5,
        equipmentRating: 5,
        crowdRating: 5,
        content: 'Faire ses pushups au pied de la Statue de la Liberté avec une vue magique sur la Seine et la Tour Eiffel, c\'est juste magique. Une brise très fraîche circule toujours ici, parfait pour la canicule !',
        date: '2026-06-01T20:10:00Z'
      },
      {
        id: 'r5',
        author: 'NicoBarz',
        rating: 5,
        equipmentRating: 4,
        crowdRating: 5,
        content: 'Spot magnifique, entièrement sans voiture. Très complet avec d\'excellents anneaux métalliques suspendus de manière robuste. Mon spot préféré à Paris !',
        date: '2026-05-25T18:45:00Z'
      }
    ],
    reports: [
      {
        id: 'rep3',
        type: 'condition',
        status: 'perfect',
        description: 'La structure a été repeinte récemment. Aucun défaut à signaler.',
        date: '2026-05-31T11:00:00Z'
      }
    ],
    scheduledWorkouts: [
      {
        id: 'sw3',
        title: 'Statics & Sunset Workout',
        time: '18:45',
        date: 'Aujourd\'hui',
        hostName: 'NicoBarz',
        attendeesCount: 5,
        userJoined: false,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'allee-de-longchamp',
    name: 'Allée de Longchamp',
    locationName: 'Bois de Boulogne, Paris 16ème',
    coordinates: [48.8680, 2.2475],
    description: 'Une installation sportive entourée par la nature luxuriante du Bois de Boulogne, le long de l\'Allée de Longchamp. Véritable havre de paix, ce spot de calisthénie combine le grand air, le parfum des forêts de pins et de chênes, et des barres d\'acier de haute qualité. Parfait pour les séances hybrides de course à pied et de musculation au poids du corps.',
    equipment: [
      'pullup_bars',
      'parallel_bars',
      'monkey_bars',
      'ab_bench',
      'pushup_bars'
    ],
    safetyFloor: false,
    shade: 'full',
    lighting: false,
    waterSource: false,
    difficulty: 'intermediate',
    busyHours: [0, 0, 0, 0, 0, 10, 20, 35, 50, 65, 70, 75, 80, 70, 60, 65, 75, 70, 55, 40, 20, 5, 0, 0],
    activeUsers: 0,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=60',
    reviews: [
      {
        id: 'r7',
        author: 'MaxenceRuns',
        rating: 4,
        equipmentRating: 4,
        crowdRating: 2,
        content: 'Très calme, totalement plongé sous la canopée forestière. J\'y fais ma halte traction lors de mes footings du dimanche au Bois de Boulogne. Pas d\'eau potable sur place, pensez à amener un thermos !',
        date: '2026-05-24T09:30:00Z'
      }
    ],
    reports: [
      {
        id: 'rep4',
        type: 'condition',
        status: 'good',
        description: 'Structure très robuste qui résiste parfaitement au climat forestier humide. Sol en copeaux naturels.',
        date: '2026-05-27T14:00:00Z'
      }
    ],
    scheduledWorkouts: [
      {
        id: 'sw4',
        title: 'Run & Reps Oxygénation',
        time: '10:00',
        date: 'Samedi',
        hostName: 'MaxenceRuns',
        attendeesCount: 4,
        userJoined: false,
        difficulty: 'intermediate'
      }
    ]
  },
  {
    id: 'jardin-des-voltiges',
    name: 'Jardin des Voltiges',
    locationName: 'Parc de la Villette, Paris 19ème',
    coordinates: [48.8953, 2.3895],
    description: 'Le Jardin des Voltiges est tout simplement le plus grand et le plus complet des parcs de street workout à Paris (et l\'un des fleurons en Europe). Situé en plein cœur du Parc de la Villette, à proximité de la Cité des Sciences et du Canal de l\'Ourcq, cet espace de plus de 1500m² rassemble des cages de freestyle Kenguru PRO géantes, des anneaux de gymnastique, des échelles horizontales et verticales, et des barres d\'équilibres. C\'est le haut lieu de rassemblement des meilleurs athlètes français.',
    equipment: [
      'pullup_bars',
      'dip_bars',
      'parallel_bars',
      'rings',
      'monkey_bars',
      'swedish_wall',
      'ab_bench',
      'pushup_bars',
      'low_bars',
      'handstand_wall'
    ],
    safetyFloor: true,
    shade: 'partial',
    lighting: true,
    waterSource: true,
    difficulty: 'advanced',
    busyHours: [0, 0, 0, 0, 0, 5, 15, 30, 45, 45, 55, 60, 75, 70, 65, 80, 90, 85, 75, 60, 40, 20, 5, 0],
    activeUsers: 8,
    imageUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&auto=format&fit=crop&q=60',
    reviews: [
      {
        id: 'r8',
        author: 'FreestyleElite',
        rating: 5,
        equipmentRating: 5,
        crowdRating: 5,
        content: 'Le temple absolu en Île-de-France ! On y croise les légendes de la discipline. Le matériel est le même qu\'aux championnats du monde (Kenguru PRO). Les barres sont larges, les distances parfaites et le sol hyper protecteur.',
        date: '2026-05-27T15:50:00Z'
      }
    ],
    reports: [],
    scheduledWorkouts: [
      {
        id: 'sw5',
        title: 'Entraînement Force Statics & Freestyle',
        time: '14:30',
        date: 'Aujourd\'hui',
        hostName: 'FreestyleElite',
        attendeesCount: 7,
        userJoined: false,
        difficulty: 'advanced'
      }
    ]
  }
];

export const INITIAL_USER: UserProfile = {
  username: 'Eliot_Calisthenics',
  level: 1,
  xp: 120,
  sessionsCompleted: 4,
  achievements: [
    {
      id: 'first-session',
      title: 'Première Magnésie',
      description: 'Terminer votre toute première séance d\'entraînement de calisthénie sur le terrain.',
      icon: 'zap',
      unlocked: true,
      unlockedAt: '2026-05-28T16:00:00Z',
      xpValue: 50
    },
    {
      id: 'spot-reviewer',
      title: 'Critique d\'Acier',
      description: 'Soumettre votre premier avis ou rapport sur l\'état d\'un parc parisien.',
      icon: 'message-square',
      unlocked: true,
      unlockedAt: '2026-05-29T19:15:00Z',
      xpValue: 70
    },
    {
      id: 'muscle-up-master',
      title: 'Explorateur Urbain',
      description: 'S\'entraîner (Chalk up) sur au moins 3 spots différents dans Paris.',
      icon: 'award',
      unlocked: false,
      xpValue: 150
    },
    {
      id: 'night-owl',
      title: 'Oiseau de Nuit',
      description: 'S\'entraîner après le coucher du soleil sur un spot disposant d\'un éclairage public.',
      icon: 'moon',
      unlocked: false,
      xpValue: 100
    },
    {
      id: 'meetup-leader',
      title: 'Meneur de Troupe',
      description: 'Planifier et héberger un entraînement groupé ou rejoindre une session existante.',
      icon: 'users',
      unlocked: false,
      xpValue: 120
    }
  ]
};
