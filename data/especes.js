/* =====================================================================
   CATALOGUE DES ESPÈCES — Carnet d'oiseaux (Sredna Gora, Bulgarie)
   ---------------------------------------------------------------------
   Ce fichier est fait pour être corrigé à la main (Bloc-notes, VS Code…).

   Pour chaque espèce :
     id          identifiant unique (minuscules, sans accent, tirets)
                 ⚠ ne le change plus une fois que tu as des observations
     fr, bg, en, la   noms français, bulgare (cyrillique), anglais, latin
     groupe      une clé de GROUPES (liste plus bas)
     presence    une ou plusieurs clés de PRESENCES (en Bulgarie)
     mois        mois où l'espèce est normalement visible dans la région
                 (1 = janvier … 12 = décembre) → filtre « visibles en ce moment »
     habitats    une ou plusieurs clés de HABITATS
     uicn        statut MONDIAL de la Liste rouge UICN : LC, NT, VU, EN, CR
     description 2-3 phrases : taille, plumage, chant, comportement
     aVerifier   true si une info n'est pas sûre → badge « ? » orange
     note        ce qu'il faut vérifier (affiché sur la fiche)

   Règles de prudence suivies :
     - les noms bulgares, présences et statuts dont je ne suis pas certain
       sont marqués aVerifier: true avec une note, plutôt qu'inventés ;
     - les mois sont indicatifs (dates habituelles d'arrivée et de départ).

   ⚠ Après une modification, augmente VERSION dans sw.js pour que ton
     téléphone télécharge la nouvelle version du catalogue.
   ===================================================================== */

window.GROUPES = {
  rapaces:    "Rapaces diurnes",
  nocturnes:  "Rapaces nocturnes",
  echassiers: "Échassiers et limicoles",
  eau:        "Oiseaux d'eau",
  gallinaces: "Gallinacés",
  pigeons:    "Pigeons et tourterelles",
  divers:     "Coucou, huppe, guêpier…",
  martinets:  "Martinets et hirondelles",
  pics:       "Pics",
  corvides:   "Corvidés",
  mesanges:   "Mésanges, sittelles, grimpereaux",
  grives:     "Grives, traquets, gobemouches",
  fauvettes:  "Fauvettes et pouillots",
  fringilles: "Pinsons, bruants, moineaux",
  passereaux: "Autres passereaux"
};

window.PRESENCES = {
  resident:  "Résident",
  estivant:  "Estivant nicheur",
  hivernant: "Hivernant",
  passage:   "De passage"
};

window.HABITATS = {
  foret:    "Forêts",
  montagne: "Montagne et rochers",
  eau:      "Rivières et zones humides",
  village:  "Villages et jardins",
  champs:   "Champs et prairies",
  haies:    "Haies, lisières, vergers"
};

window.UICN = {
  LC: "Préoccupation mineure",
  NT: "Quasi menacé",
  VU: "Vulnérable",
  EN: "En danger",
  CR: "En danger critique"
};

/* Raccourci pour les espèces visibles toute l'année */
var TOUTE_ANNEE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

window.ESPECES = [

  /* ---------- Grèbes, cormorans, hérons, cigognes, canards ---------- */
  {
    id: "grebe-castagneux",
    fr: "Grèbe castagneux", bg: "Малък гмурец", en: "Little Grebe", la: "Tachybaptus ruficollis",
    groupe: "eau", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Le plus petit grèbe d'Europe (25-29 cm), rond comme une balle, qui plonge sans cesse. En plumage nuptial, joues et cou marron-roux avec une tache jaune vif à la base du bec ; brun-beige pâle en hiver. Son trille hennissant, très sonore, trahit sa présence sur les étangs et les rivières lentes."
  },
  {
    id: "grand-cormoran",
    fr: "Grand Cormoran", bg: "Голям корморан", en: "Great Cormorant", la: "Phalacrocorax carbo",
    groupe: "eau", presence: ["hivernant"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau"], uicn: "LC",
    description: "Grand oiseau noir (80-100 cm) au long cou et au bec crochu, qui nage très enfoncé dans l'eau et plonge pour pêcher. Se pose souvent ailes écartées pour les faire sécher. En hiver, des groupes suivent les rivières et les retenues ; vol en ligne ou en V."
  },
  {
    id: "heron-cendre",
    fr: "Héron cendré", bg: "Сива чапла", en: "Grey Heron", la: "Ardea cinerea",
    groupe: "echassiers", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Grand héron gris (90-98 cm) au cou blanc, avec un bandeau noir au-dessus de l'œil prolongé par une fine huppe et un long bec jaune en poignard. Guette immobile au bord de l'eau ou dans les prés. Vole le cou replié, pattes dépassant la queue, en lançant un « kraak » rauque."
  },
  {
    id: "grande-aigrette",
    fr: "Grande Aigrette", bg: "Голяма бяла чапла", en: "Great Egret", la: "Ardea alba",
    groupe: "echassiers", presence: ["hivernant", "passage"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Très grand héron entièrement blanc (85-100 cm), de la taille du Héron cendré, au cou très long en S. Bec jaune en hiver (noir en période nuptiale) et longues pattes sombres. Souvent seule dans les champs labourés ou au bord des rivières en hiver."
  },
  {
    id: "aigrette-garzette",
    fr: "Aigrette garzette", bg: "Малка бяла чапла", en: "Little Egret", la: "Egretta garzetta",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Petit héron tout blanc (55-65 cm), élancé, au bec noir et fin. Signe distinctif : pattes noires terminées par des doigts jaune vif (« chaussons jaunes »). Pêche activement en eau peu profonde, parfois en courant."
  },
  {
    id: "cigogne-noire",
    fr: "Cigogne noire", bg: "Черен щъркел", en: "Black Stork", la: "Ciconia nigra",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Cigogne noire à reflets verts et pourpres (90-100 cm), au ventre blanc, au bec et aux pattes rouges. Discrète, elle niche dans les forêts tranquilles et pêche dans les ruisseaux de montagne. Plane volontiers en spirale très haut."
  },
  {
    id: "cigogne-blanche",
    fr: "Cigogne blanche", bg: "Бял щъркел", en: "White Stork", la: "Ciconia ciconia",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["village", "champs"], uicn: "LC",
    description: "Grand échassier blanc (100-115 cm) aux rémiges noires, au bec et aux pattes rouges. Niche sur les toits, les poteaux et les cheminées des villages, où elle craquette du bec au nid. Arrive fin mars et repart fin août en grands vols tournoyants."
  },
  {
    id: "canard-colvert",
    fr: "Canard colvert", bg: "Зеленоглава патица", en: "Mallard", la: "Anas platyrhynchos",
    groupe: "eau", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Le canard le plus commun (50-65 cm). Le mâle a la tête vert bouteille, un collier blanc et la poitrine brun-pourpre ; la femelle est brune mouchetée. Les deux sexes montrent sur l'aile un miroir bleu bordé de blanc."
  },

  /* ---------- Rapaces diurnes ---------- */
  {
    id: "bondree-apivore",
    fr: "Bondrée apivore", bg: "Осояд", en: "European Honey Buzzard", la: "Pernis apivorus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Rapace de la taille d'une buse (52-60 cm) mais à la tête petite et fine, « de pigeon », et à la longue queue marquée de deux bandes sombres près de la base et d'une large bande au bout. Plumage très variable. Déterre les nids de guêpes ; passe en grand nombre fin août-septembre."
  },
  {
    id: "vautour-percnoptere",
    fr: "Vautour percnoptère", bg: "Египетски лешояд", en: "Egyptian Vulture", la: "Neophron percnopterus",
    groupe: "rapaces", presence: ["estivant"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["montagne"], uicn: "EN",
    description: "Petit vautour (55-65 cm) blanc sale aux rémiges noires, à la face jaune nue et à la queue en losange. En vol, silhouette blanche et noire très contrastée. Niche dans les falaises ; menacé par les empoisonnements et les lignes électriques.",
    aVerifier: true,
    note: "Espèce très rare et en déclin en Bulgarie (surtout Rhodopes orientales) : présence près de Karlovo à confirmer."
  },
  {
    id: "circaete-jean-le-blanc",
    fr: "Circaète Jean-le-Blanc", bg: "Орел змияр", en: "Short-toed Snake Eagle", la: "Circaetus gallicus",
    groupe: "rapaces", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne", "champs", "foret"], uicn: "LC",
    description: "Grand aigle pâle (62-69 cm) au dessous blanc finement barré, à la tête ronde « de hibou » aux yeux jaunes et à la gorge souvent sombre. Fait souvent du surplace face au vent en chassant serpents et lézards sur les pentes ensoleillées."
  },
  {
    id: "aigle-pomarin",
    fr: "Aigle pomarin", bg: "Малък креслив орел", en: "Lesser Spotted Eagle", la: "Clanga pomarina",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Aigle brun moyen (55-65 cm) dont les couvertures sous les ailes sont plus claires que les rémiges, avec souvent une petite tache claire à la base des primaires sur le dessus de l'aile. Niche en forêt et chasse dans les prairies humides, parfois en marchant au sol."
  },
  {
    id: "aigle-royal",
    fr: "Aigle royal", bg: "Скален орел", en: "Golden Eagle", la: "Aquila chrysaetos",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne"], uicn: "LC",
    description: "Très grand aigle sombre (75-88 cm, jusqu'à 2,2 m d'envergure) à la nuque dorée. Les jeunes montrent des taches blanches aux ailes et une queue blanche terminée de noir. Plane les ailes en V léger au-dessus des crêtes et des pentes rocheuses."
  },
  {
    id: "aigle-botte",
    fr: "Aigle botté", bg: "Малък орел", en: "Booted Eagle", la: "Hieraaetus pennatus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Petit aigle de la taille d'une buse (45-53 cm), en forme claire (dessous blanc, rémiges noires) ou sombre. Vu de face, deux petits « phares » blancs à la base des ailes ; une bande pâle sur le dessus de l'aile. Niche dans les forêts de feuillus."
  },
  {
    id: "busard-des-roseaux",
    fr: "Busard des roseaux", bg: "Тръстиков блатар", en: "Western Marsh Harrier", la: "Circus aeruginosus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Le plus grand busard (48-56 cm), qui vole bas au-dessus des roselières et des champs, les ailes relevées en V. Mâle tricolore (brun, gris, bout des ailes noir) ; femelle brun chocolat à calotte et gorge crème."
  },
  {
    id: "busard-saint-martin",
    fr: "Busard Saint-Martin", bg: "Полски блатар", en: "Hen Harrier", la: "Circus cyaneus",
    groupe: "rapaces", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["champs"], uicn: "LC",
    description: "Busard d'hiver des plaines (44-52 cm). Le mâle est gris perle avec le bout des ailes noir ; la femelle est brune avec un large croupion blanc bien visible. Rase les champs et les friches d'un vol chaloupé."
  },
  {
    id: "autour-des-palombes",
    fr: "Autour des palombes", bg: "Голям ястреб", en: "Northern Goshawk", la: "Accipiter gentilis",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Grand épervier puissant (48-62 cm, la femelle a la taille d'une buse), gris-brun dessus et finement barré dessous, avec un sourcil blanc marqué et l'œil orange. Chasseur discret des forêts, capable de prendre geais et pigeons ; queue longue et arrondie."
  },
  {
    id: "epervier-d-europe",
    fr: "Épervier d'Europe", bg: "Малък ястреб", en: "Eurasian Sparrowhawk", la: "Accipiter nisus",
    groupe: "rapaces", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Petit rapace (28-38 cm) aux ailes courtes et arrondies et à la longue queue carrée. Le mâle est gris-bleu dessus et barré de roux dessous ; la femelle, plus grande, est barrée de gris. Surgit en rase-mottes près des mangeoires pour chasser les petits oiseaux."
  },
  {
    id: "epervier-a-pieds-courts",
    fr: "Épervier à pieds courts", bg: "Късопръст ястреб", en: "Levant Sparrowhawk", la: "Accipiter brevipes",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Proche de l'Épervier d'Europe (30-37 cm) mais aux ailes plus pointues, avec le bout des primaires noir bien contrasté sous l'aile claire. Le mâle est gris-bleu à joues grises, l'œil rouge sombre. Niche dans les forêts de plaine et le long des rivières ; migre en groupes.",
    aVerifier: true,
    note: "Nicheur peu commun en Bulgarie, surtout en plaine : présence autour de Karlovo à confirmer."
  },
  {
    id: "milan-noir",
    fr: "Milan noir", bg: "Черна каня", en: "Black Kite", la: "Milvus migrans",
    groupe: "rapaces", presence: ["passage", "estivant"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Rapace brun sombre (48-58 cm) à la queue légèrement échancrée, qu'il tourne sans cesse en vol comme un gouvernail. Opportuniste, il fréquente rivières, décharges et champs fauchés. Surtout vu en migration en Bulgarie, où il est devenu un nicheur rare."
  },
  {
    id: "buse-variable",
    fr: "Buse variable", bg: "Обикновен мишелов", en: "Common Buzzard", la: "Buteo buteo",
    groupe: "rapaces", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["champs", "foret"], uicn: "LC",
    description: "Le rapace le plus commun (48-56 cm), trapu, aux ailes larges et à la queue courte. Plumage très variable, souvent brun avec une bande claire sur la poitrine. Guette sur les poteaux et plane en cercles en miaulant « hiééé »."
  },
  {
    id: "buse-feroce",
    fr: "Buse féroce", bg: "Белоопашат мишелов", en: "Long-legged Buzzard", la: "Buteo rufinus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "champs"], uicn: "LC",
    description: "Grande buse (50-65 cm) à la tête et à la poitrine pâles, au ventre et aux « culottes » plus sombres, et à la queue orangée presque sans barres. Plus grande et plus longue d'ailes que la Buse variable. Fait du surplace au-dessus des pentes sèches et des steppes."
  },
  {
    id: "balbuzard-pecheur",
    fr: "Balbuzard pêcheur", bg: "Орел рибар", en: "Western Osprey", la: "Pandion haliaetus",
    groupe: "rapaces", presence: ["passage"], mois: [3, 4, 5, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Rapace pêcheur (52-60 cm) blanc dessous et brun foncé dessus, avec un bandeau sombre sur l'œil. En vol, ailes longues coudées « en M ». Plonge pattes en avant pour attraper les poissons ; s'observe au passage sur les rivières et les retenues."
  },
  {
    id: "faucon-crecerelle",
    fr: "Faucon crécerelle", bg: "Черношипа ветрушка", en: "Common Kestrel", la: "Falco tinnunculus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Petit faucon roux (31-37 cm) célèbre pour son vol sur place, « en Saint-Esprit », au-dessus des prés. Le mâle a la tête et la queue gris-bleu et le dos roux tacheté de noir ; la femelle est rousse et barrée. Cri aigu « kikiki »."
  },
  {
    id: "faucon-kobez",
    fr: "Faucon kobez", bg: "Вечерна ветрушка", en: "Red-footed Falcon", la: "Falco vespertinus",
    groupe: "rapaces", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["champs"], uicn: "VU",
    description: "Petit faucon (28-34 cm) qui migre en groupes. Le mâle est gris ardoise avec les « culottes » et le dessous de la queue rouge brique ; la femelle a la tête et le dessous orangés et le dos gris barré. Chasse les insectes en vol, souvent perché sur les fils pendant le passage.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (VU ou NT selon les évaluations)."
  },
  {
    id: "faucon-hobereau",
    fr: "Faucon hobereau", bg: "Орко", en: "Eurasian Hobby", la: "Falco subbuteo",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "eau", "champs"], uicn: "LC",
    description: "Faucon élancé (29-35 cm) aux ailes longues et pointues « en faux », comme un grand martinet. Moustaches noires sur joues blanches, dessous rayé et culottes rousses. Capture en vol libellules, hirondelles et martinets."
  },
  {
    id: "faucon-pelerin",
    fr: "Faucon pèlerin", bg: "Сокол скитник", en: "Peregrine Falcon", la: "Falco peregrinus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne"], uicn: "LC",
    description: "Faucon puissant et trapu (38-51 cm), gris ardoise dessus, avec une large moustache noire en forme de casque. Champion de vitesse, il fond en piqué sur les pigeons. Niche dans les falaises et les gorges."
  },

  /* ---------- Gallinacés, rallidés, limicoles, mouettes ---------- */
  {
    id: "perdrix-grise",
    fr: "Perdrix grise", bg: "Яребица", en: "Grey Partridge", la: "Perdix perdix",
    groupe: "gallinaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Petit gallinacé rond (29-31 cm), gris finement vermiculé, à la face orange et avec une tache marron en fer à cheval sur le ventre. Vit en compagnies dans les champs et les friches ; s'envole bruyamment au ras du sol en criant « kirrr-ik »."
  },
  {
    id: "caille-des-bles",
    fr: "Caille des blés", bg: "Пъдпъдък", en: "Common Quail", la: "Coturnix coturnix",
    groupe: "gallinaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["champs"], uicn: "LC",
    description: "Minuscule gallinacé (16-18 cm), brun rayé de crème, presque impossible à voir dans les blés et les prairies. On l'entend surtout : un « paye-tes-dettes » en trois syllabes, répété de jour comme de nuit de mai à juillet."
  },
  {
    id: "faisan-de-colchide",
    fr: "Faisan de Colchide", bg: "Обикновен фазан", en: "Common Pheasant", la: "Phasianus colchicus",
    groupe: "gallinaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Grand gallinacé à très longue queue (mâle 70-90 cm). Le mâle a la tête vert métallique, des caroncules rouges et le corps cuivré ; la femelle est brun-beige tachetée. Son « kok-kok » rauque, suivi d'un battement d'ailes, porte loin."
  },
  {
    id: "gallinule-poule-d-eau",
    fr: "Gallinule poule-d'eau", bg: "Зеленоножка", en: "Common Moorhen", la: "Gallinula chloropus",
    groupe: "eau", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Oiseau d'eau noirâtre (32-35 cm) à la plaque frontale rouge et au bec rouge à pointe jaune, avec une ligne blanche sur le flanc. Nage en hochant la tête et la queue, ce qui montre le dessous blanc de la queue. Étangs, canaux et rivières lentes bordés de végétation."
  },
  {
    id: "petit-gravelot",
    fr: "Petit Gravelot", bg: "Речен дъждосвирец", en: "Little Ringed Plover", la: "Charadrius dubius",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["eau"], uicn: "LC",
    description: "Petit limicole (14-17 cm) brun sable dessus et blanc dessous, avec un collier et un masque noirs et un cercle jaune vif autour de l'œil. Court par à-coups sur les bancs de gravier des rivières, où il niche à même le sol."
  },
  {
    id: "becasse-des-bois",
    fr: "Bécasse des bois", bg: "Горски бекас", en: "Eurasian Woodcock", la: "Scolopax rusticola",
    groupe: "echassiers", presence: ["passage", "hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret"], uicn: "LC",
    description: "Limicole forestier trapu (33-35 cm) au très long bec droit, au plumage couleur de feuilles mortes et aux bandes sombres en travers du crâne. Très mimétique, on la lève souvent par hasard dans les sous-bois humides ; active à l'aube et au crépuscule."
  },
  {
    id: "chevalier-guignette",
    fr: "Chevalier guignette", bg: "Късокрил кюкавец", en: "Common Sandpiper", la: "Actitis hypoleucos",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Petit limicole (19-21 cm) brun dessus et blanc dessous, avec une encoche blanche devant l'aile. Hoche sans arrêt l'arrière du corps. Vole au ras de l'eau, ailes arquées et battements saccadés, en lançant un « hi-di-di » aigu."
  },
  {
    id: "mouette-rieuse",
    fr: "Mouette rieuse", bg: "Речна чайка", en: "Black-headed Gull", la: "Chroicocephalus ridibundus",
    groupe: "eau", presence: ["hivernant", "passage"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Petite mouette (35-39 cm) au bec et aux pattes rouges. Capuchon chocolat au printemps, réduit en hiver à une tache noire derrière l'œil ; en vol, bord avant de l'aile blanc. Suit les rivières et les labours en hiver."
  },

  /* ---------- Pigeons, tourterelles, coucou ---------- */
  {
    id: "pigeon-biset",
    fr: "Pigeon biset", bg: "Скален гълъб", en: "Rock Dove", la: "Columba livia",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Ancêtre du pigeon domestique (31-34 cm) : gris-bleu avec deux barres noires sur l'aile, croupion blanc et reflets verts et pourpres au cou. Les pigeons des villages sont des formes domestiques aux couleurs très variées. Roucoulement grave « rou-rou-rou »."
  },
  {
    id: "pigeon-colombin",
    fr: "Pigeon colombin", bg: "Гълъб хралупар", en: "Stock Dove", la: "Columba oenas",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Pigeon gris-bleu (28-32 cm), plus petit et plus uni que le ramier, sans blanc au cou ni aux ailes, à l'œil sombre. Deux courtes barres noires sur l'aile et bord des ailes sombre en vol. Niche dans les cavités des vieux arbres ; chant « hou-ou » sourd et répété."
  },
  {
    id: "pigeon-ramier",
    fr: "Pigeon ramier", bg: "Гривяк", en: "Common Wood Pigeon", la: "Columba palumbus",
    groupe: "pigeons", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs", "village"], uicn: "LC",
    description: "Le plus grand pigeon (40-42 cm), gris, avec une tache blanche au cou et une bande blanche en travers de l'aile, très visible en vol. Roucoulement en cinq notes « rou-rou-rou, rou-rou ». Grands vols en migration et en hiver."
  },
  {
    id: "tourterelle-des-bois",
    fr: "Tourterelle des bois", bg: "Гургулица", en: "European Turtle Dove", la: "Streptopelia turtur",
    groupe: "pigeons", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "VU",
    description: "Petite tourterelle (26-28 cm) au manteau roux écaillé de noir, avec des stries noires et blanches sur le côté du cou. Ronronnement doux « tourr-tourr ». Espèce en fort déclin en Europe (chasse, disparition des haies)."
  },
  {
    id: "tourterelle-turque",
    fr: "Tourterelle turque", bg: "Гугутка", en: "Eurasian Collared Dove", la: "Streptopelia decaocto",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village"], uicn: "LC",
    description: "Tourterelle beige-gris uni (31-33 cm) avec un demi-collier noir sur la nuque. Omniprésente dans les villages ; chant en trois notes « dou-dou-dou », accentué sur la deuxième. A colonisé l'Europe depuis les Balkans au XXe siècle."
  },
  {
    id: "coucou-gris",
    fr: "Coucou gris", bg: "Обикновена кукувица", en: "Common Cuckoo", la: "Cuculus canorus",
    groupe: "divers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Oiseau gris (32-34 cm) au ventre barré, à longue queue et ailes pointues, qui ressemble en vol à un petit faucon. Le « cou-cou » du mâle s'entend d'avril à juin. La femelle pond dans les nids d'autres passereaux."
  },

  /* ---------- Rapaces nocturnes et engoulevent ---------- */
  {
    id: "effraie-des-clochers",
    fr: "Effraie des clochers", bg: "Забулена сова", en: "Western Barn Owl", la: "Tyto alba",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Chouette pâle (33-39 cm), dorée dessus et blanche dessous, au disque facial en forme de cœur. Niche dans les greniers, les clochers et les granges. Elle ne hulule pas : elle pousse en vol, la nuit, un cri chuintant et rauque."
  },
  {
    id: "petit-duc-scops",
    fr: "Petit-duc scops", bg: "Чухал", en: "Eurasian Scops Owl", la: "Otus scops",
    groupe: "nocturnes", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["village", "haies"], uicn: "LC",
    description: "Minuscule hibou (19-20 cm) gris-brun à aigrettes, parfaitement camouflé contre l'écorce. On l'entend bien plus qu'on ne le voit : un « tiou » flûté répété toutes les 2 à 3 secondes, toute la nuit au printemps, dans les villages et les vergers."
  },
  {
    id: "grand-duc-d-europe",
    fr: "Grand-duc d'Europe", bg: "Бухал", en: "Eurasian Eagle-Owl", la: "Bubo bubo",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "foret"], uicn: "LC",
    description: "Le plus grand hibou (59-73 cm), brun-roux, aux grandes aigrettes et aux yeux orange. Niche dans les falaises, les carrières et les pentes rocheuses. Son chant grave « ou-hou » porte au loin, surtout en fin d'hiver."
  },
  {
    id: "cheveche-d-athena",
    fr: "Chevêche d'Athéna", bg: "Кукумявка", en: "Little Owl", la: "Athene noctua",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Petite chouette trapue (21-23 cm), brune tachetée de blanc, aux yeux jaunes et aux sourcils blancs qui lui donnent un air sévère. Souvent visible de jour sur un toit ou un piquet, en hochant la tête. Cri plaintif « kiou » au crépuscule."
  },
  {
    id: "chouette-hulotte",
    fr: "Chouette hulotte", bg: "Горска улулица", en: "Tawny Owl", la: "Strix aluco",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Chouette ronde (37-39 cm) sans aigrettes, aux yeux noirs, brun-roux ou grise. Le célèbre hululement « hou… hou-hou-hou-houuu » est celui du mâle ; la femelle répond par un « kiwitt » aigu. Forêts de feuillus, parcs et vieux villages."
  },
  {
    id: "hibou-moyen-duc",
    fr: "Hibou moyen-duc", bg: "Горска ушата сова", en: "Long-eared Owl", la: "Asio otus",
    groupe: "nocturnes", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Hibou élancé (35-37 cm) aux longues aigrettes et aux yeux orange, brun strié. En hiver, des dizaines d'individus peuvent se regrouper en dortoir dans les conifères ou les arbres des villages : un beau sujet photo, à condition de ne pas les déranger."
  },
  {
    id: "engoulevent-d-europe",
    fr: "Engoulevent d'Europe", bg: "Обикновен козодой", en: "European Nightjar", la: "Caprimulgus europaeus",
    groupe: "divers", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Oiseau crépusculaire (26-28 cm) au plumage d'écorce, invisible le jour, posé dans l'axe d'une branche. Au crépuscule, le mâle émet pendant des minutes un ronronnement mécanique « errrrr ». En vol, le mâle montre des taches blanches aux ailes et à la queue."
  },

  /* ---------- Martinets, martin-pêcheur, guêpier, rollier, huppe ---------- */
  {
    id: "martinet-noir",
    fr: "Martinet noir", bg: "Черен бързолет", en: "Common Swift", la: "Apus apus",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8],
    habitats: ["village"], uicn: "LC",
    description: "Oiseau entièrement brun-noir (16-17 cm) aux ailes en faux et à la gorge pâle, qui passe sa vie en vol. Ne se pose jamais au sol et niche sous les toits. Des bandes hurlantes « srriii » filent au-dessus des villages de mai à début août."
  },
  {
    id: "martinet-a-ventre-blanc",
    fr: "Martinet à ventre blanc", bg: "Алпийски бързолет", en: "Alpine Swift", la: "Tachymarptis melba",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne", "village"], uicn: "LC",
    description: "Grand martinet (20-22 cm) brun, au ventre et à la gorge blancs séparés par un collier brun. Vol puissant et très rapide au-dessus des falaises et des gorges. Cri : trille sonore et descendant.",
    aVerifier: true,
    note: "Nom bulgare et présence locale (falaises du Balkan et de la Sredna Gora) à confirmer."
  },
  {
    id: "martin-pecheur-d-europe",
    fr: "Martin-pêcheur d'Europe", bg: "Земеродно рибарче", en: "Common Kingfisher", la: "Alcedo atthis",
    groupe: "divers", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Petit oiseau (16-17 cm) au dos bleu turquoise éclatant, au ventre orange et au long bec en poignard. Fuse au ras de l'eau en lançant un « tiiih » perçant. Guette les poissons depuis une branche au-dessus de la rivière : un classique pour le photographe."
  },
  {
    id: "guepier-d-europe",
    fr: "Guêpier d'Europe", bg: "Обикновен пчелояд", en: "European Bee-eater", la: "Merops apiaster",
    groupe: "divers", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Oiseau multicolore (25-29 cm) : gorge jaune, ventre turquoise, dos roux et doré, longues plumes centrales à la queue. Niche en colonies dans des terriers creusés dans les talus sableux. Son cri roulé « prruit » s'entend souvent avant de voir les oiseaux."
  },
  {
    id: "rollier-d-europe",
    fr: "Rollier d'Europe", bg: "Синявица", en: "European Roller", la: "Coracias garrulus",
    groupe: "divers", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Oiseau de la taille d'un geai (29-32 cm), bleu azur et turquoise avec le dos roux et les rémiges bleu-noir. Chasse les gros insectes depuis les fils électriques et les arbres isolés des plaines. Cri rauque « rak-rak »."
  },
  {
    id: "huppe-fasciee",
    fr: "Huppe fasciée", bg: "Папуняк", en: "Eurasian Hoopoe", la: "Upupa epops",
    groupe: "divers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Oiseau rose-orangé (25-29 cm) aux ailes rayées de noir et de blanc, à la huppe érectile et au long bec arqué. Fouille le sol des prairies et des vergers. Son chant doux « houp-houp-houp » lui a donné son nom."
  },

  /* ---------- Pics ---------- */
  {
    id: "torcol-fourmilier",
    fr: "Torcol fourmilier", bg: "Въртошийка", en: "Eurasian Wryneck", la: "Jynx torquilla",
    groupe: "pics", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "village"], uicn: "LC",
    description: "Pic atypique (16-18 cm) au plumage d'écorce gris-brun finement vermiculé, qui ne frappe pas le bois. Se nourrit de fourmis au sol. Chant plaintif et nasillard « kyé-kyé-kyé » au printemps ; tord le cou comme un serpent s'il est dérangé."
  },
  {
    id: "pic-cendre",
    fr: "Pic cendré", bg: "Сив кълвач", en: "Grey-headed Woodpecker", la: "Picus canus",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Pic vert-gris (27-30 cm) à la tête grise, plus petit que le Pic vert, avec une fine moustache noire ; le mâle n'a qu'une tache rouge au front. Chant : série de sifflements mélancoliques qui ralentissent et descendent. Forêts de feuillus et bords de rivières boisés."
  },
  {
    id: "pic-vert",
    fr: "Pic vert", bg: "Зелен кълвач", en: "European Green Woodpecker", la: "Picus viridis",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Grand pic vert (31-33 cm) à calotte rouge et masque noir, au croupion jaune bien visible pendant son vol onduleux. Se nourrit souvent au sol de fourmis. Son cri éclatant « plu-plu-plu-plu » ressemble à un rire."
  },
  {
    id: "pic-noir",
    fr: "Pic noir", bg: "Черен кълвач", en: "Black Woodpecker", la: "Dryocopus martius",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Le plus grand pic d'Europe (40-46 cm), entièrement noir, à l'œil pâle ; calotte rouge chez le mâle, simple tache à l'arrière chez la femelle. Cri « kri-kri-kri » en vol, « kliuu » miaulé une fois posé. Creuse de grandes loges ovales dans les vieux hêtres."
  },
  {
    id: "pic-epeiche",
    fr: "Pic épeiche", bg: "Голям пъстър кълвач", en: "Great Spotted Woodpecker", la: "Dendrocopos major",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Le pic noir et blanc le plus commun (22-23 cm), avec de grandes taches blanches aux épaules et le dessous de la queue rouge vif ; le mâle a une tache rouge à la nuque et les jeunes une calotte rouge. Tambourine brièvement et fort ; cri sec « kix »."
  },
  {
    id: "pic-syriaque",
    fr: "Pic syriaque", bg: "Сирийски пъстър кълвач", en: "Syrian Woodpecker", la: "Dendrocopos syriacus",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Très proche du Pic épeiche (23-25 cm), mais sans la barre noire qui relie la moustache à la nuque (joue blanche « ouverte ») et avec le dessous de la queue rose pâle. Typique des villages, vergers et parcs de Bulgarie."
  },
  {
    id: "pic-mar",
    fr: "Pic mar", bg: "Среден пъстър кълвач", en: "Middle Spotted Woodpecker", la: "Dendrocoptes medius",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Pic noir et blanc (20-22 cm) à calotte entièrement rouge chez les deux sexes, à la face très blanche, aux flancs striés et au dessous de la queue rose. Tambourine rarement ; chant nasillard « couin-couin » au printemps. Spécialiste des vieilles chênaies."
  },
  {
    id: "pic-a-dos-blanc",
    fr: "Pic à dos blanc", bg: "Белогръб кълвач", en: "White-backed Woodpecker", la: "Dendrocopos leucotos",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Grand pic noir et blanc (24-26 cm) au bas du dos blanc, sans taches blanches aux épaules, aux ailes largement barrées de blanc et aux flancs striés ; calotte rouge chez le mâle. Vit dans les vieilles hêtraies riches en bois mort.",
    aVerifier: true,
    note: "Présence en Sredna Gora (vieilles hêtraies) à confirmer."
  },
  {
    id: "pic-epeichette",
    fr: "Pic épeichette", bg: "Малък пъстър кълвач", en: "Lesser Spotted Woodpecker", la: "Dryobates minor",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "eau"], uicn: "LC",
    description: "Le plus petit pic (14-16 cm), de la taille d'un moineau, au dos barré de noir et de blanc et sans rouge sous la queue ; calotte rouge chez le mâle. Discret, souvent dans le haut des arbres, bords de rivières et vergers. Chant : série de « ki-ki-ki » aigus."
  },

  /* ---------- Alouettes et hirondelles ---------- */
  {
    id: "cochevis-huppe",
    fr: "Cochevis huppé", bg: "Качулата чучулига", en: "Crested Lark", la: "Galerida cristata",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Alouette trapue (17-19 cm), brun-beige, à la huppe pointue toujours visible. Fréquente les bords de routes, les terrains vagues et les cours de ferme. Chant mélodieux et flûté ; cri « tu-tu-trui »."
  },
  {
    id: "alouette-lulu",
    fr: "Alouette lulu", bg: "Горска чучулига", en: "Woodlark", la: "Lullula arborea",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies", "foret"], uicn: "LC",
    description: "Petite alouette (15 cm) à queue courte, aux sourcils crème qui se rejoignent sur la nuque et avec une petite marque noire et blanche au bord de l'aile. Magnifique chant en vol qui descend en cascade « lu-lu-lu-lu ». Pâtures boisées et lisières des collines."
  },
  {
    id: "alouette-des-champs",
    fr: "Alouette des champs", bg: "Полска чучулига", en: "Eurasian Skylark", la: "Alauda arvensis",
    groupe: "passereaux", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Alouette brune striée (18-19 cm) à petite huppe, avec les bords de la queue blancs. Le mâle chante longuement en montant très haut dans le ciel, en vol sur place. Grandes troupes en hiver dans les champs."
  },
  {
    id: "hirondelle-de-rochers",
    fr: "Hirondelle de rochers", bg: "Скална лястовица", en: "Eurasian Crag Martin", la: "Ptyonoprogne rupestris",
    groupe: "martinets", presence: ["estivant"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["montagne"], uicn: "LC",
    description: "Hirondelle trapue (14-15 cm) brun-gris uni, sans blanc au croupion, avec des taches blanches visibles sur la queue étalée. Vol plané le long des falaises, des gorges et des ponts. Niche sous les surplombs rocheux."
  },
  {
    id: "hirondelle-rustique",
    fr: "Hirondelle rustique", bg: "Селска лястовица", en: "Barn Swallow", la: "Hirundo rustica",
    groupe: "martinets", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["village", "champs"], uicn: "LC",
    description: "Hirondelle bleu-noir dessus (17-19 cm, filets compris) à la gorge rouge brique et aux longs filets de queue. Niche à l'intérieur des étables et des granges. Gazouillis rapide entrecoupé d'un roulement."
  },
  {
    id: "hirondelle-rousseline",
    fr: "Hirondelle rousseline", bg: "Червенокръста лястовица", en: "Red-rumped Swallow", la: "Cecropis daurica",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Hirondelle (16-17 cm) au croupion et à la nuque roux-orangé, au dessous finement strié et à la queue fourchue sans tache blanche. Construit sous les ponts et les surplombs un nid de boue en forme de bouteille, avec un tunnel d'entrée."
  },
  {
    id: "hirondelle-de-fenetre",
    fr: "Hirondelle de fenêtre", bg: "Градска лястовица", en: "Western House Martin", la: "Delichon urbicum",
    groupe: "martinets", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["village"], uicn: "LC",
    description: "Petite hirondelle (13-15 cm) bleu-noir dessus avec un croupion blanc éclatant et le dessous blanc pur ; queue peu fourchue. Niche en colonies sous les avant-toits, dans des nids de boue fermés."
  },

  /* ---------- Pipits, bergeronnettes, jaseur, cincle, troglodyte ---------- */
  {
    id: "pipit-des-arbres",
    fr: "Pipit des arbres", bg: "Горска бъбрица", en: "Tree Pipit", la: "Anthus trivialis",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "foret", "champs"], uicn: "LC",
    description: "Pipit brun-olive (15 cm) à la poitrine chamoisée nettement striée. Le mâle chante en s'élevant depuis un arbre puis redescend en parachute, ailes ouvertes, en terminant par des « tsia-tsia-tsia ». Clairières et lisières."
  },
  {
    id: "pipit-farlouse",
    fr: "Pipit farlouse", bg: "Ливадна бъбрица", en: "Meadow Pipit", la: "Anthus pratensis",
    groupe: "passereaux", presence: ["hivernant", "passage"], mois: [10, 11, 12, 1, 2, 3, 4],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Petit pipit (14-15 cm) brun-olive strié, très semblable au Pipit des arbres mais plus grêle, aux flancs plus striés et à l'ongle arrière long. Cri fin « ist-ist » à l'envol. En hiver, en petites troupes dans les prés humides et les labours.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (classé NT en 2015, LC depuis ?)."
  },
  {
    id: "pipit-rousseline",
    fr: "Pipit rousseline", bg: "Полска бъбрица", en: "Tawny Pipit", la: "Anthus campestris",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "montagne"], uicn: "LC",
    description: "Grand pipit pâle (16-18 cm), couleur sable presque uni, avec un sourcil crème marqué et une rangée de taches sombres sur l'aile. Sa silhouette rappelle une bergeronnette. Pâturages secs et pentes pierreuses ; chant monotone « tchir-li »."
  },
  {
    id: "bergeronnette-printaniere",
    fr: "Bergeronnette printanière", bg: "Жълта стърчиопашка", en: "Western Yellow Wagtail", la: "Motacilla flava",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Bergeronnette (15-16 cm) au ventre jaune vif et au dos vert olive. En Bulgarie niche surtout la forme à tête noire (« feldegg ») ; d'autres formes à tête grise ou bleue passent en migration. Suit le bétail dans les prés humides."
  },
  {
    id: "bergeronnette-des-ruisseaux",
    fr: "Bergeronnette des ruisseaux", bg: "Планинска стърчиопашка", en: "Grey Wagtail", la: "Motacilla cinerea",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Bergeronnette (17-20 cm) à très longue queue, gris ardoise dessus et jaune soufre dessous, surtout sous la queue ; le mâle a la gorge noire au printemps. Toujours près des torrents et des ruisseaux, sur les pierres. Cri sec « tsi-tsi »."
  },
  {
    id: "bergeronnette-grise",
    fr: "Bergeronnette grise", bg: "Бяла стърчиопашка", en: "White Wagtail", la: "Motacilla alba",
    groupe: "passereaux", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["village", "eau", "champs"], uicn: "LC",
    description: "Bergeronnette noire, grise et blanche (17-19 cm) à longue queue qu'elle agite sans cesse. Court sur les toits, les routes et les berges en attrapant des insectes. Vol onduleux ; cri « tsi-lit »."
  },
  {
    id: "jaseur-boreal",
    fr: "Jaseur boréal", bg: "Копринарка", en: "Bohemian Waxwing", la: "Bombycilla garrulus",
    groupe: "passereaux", presence: ["hivernant"], mois: [11, 12, 1, 2, 3],
    habitats: ["village", "haies"], uicn: "LC",
    description: "Oiseau rose-beige (18-21 cm) à huppe, masque et gorge noirs, aux ailes ornées de « gouttes de cire » rouges et de jaune. Hivernant irrégulier venu du nord : certaines années, des bandes envahissent les arbres à baies des villages."
  },
  {
    id: "cincle-plongeur",
    fr: "Cincle plongeur", bg: "Воден кос", en: "White-throated Dipper", la: "Cinclus cinclus",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau", "montagne"], uicn: "LC",
    description: "Passereau trapu (17-20 cm) brun-noir à large bavette blanche, qui marche sous l'eau des torrents pour chasser les larves. Perché sur une pierre, il fait des « révérences ». Vole vite au ras de l'eau en lançant un « zit »."
  },
  {
    id: "troglodyte-mignon",
    fr: "Troglodyte mignon", bg: "Орехче", en: "Eurasian Wren", la: "Troglodytes troglodytes",
    groupe: "passereaux", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "eau"], uicn: "LC",
    description: "Minuscule boule brune (9-10 cm) à la queue courte toujours dressée. Son chant, en trilles explosifs, est d'une puissance étonnante pour sa taille. Se faufile dans les broussailles, les tas de bois et au bord des ruisseaux."
  },
  {
    id: "accenteur-mouchet",
    fr: "Accenteur mouchet", bg: "Сивогуша завирушка", en: "Dunnock", la: "Prunella modularis",
    groupe: "passereaux", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["haies", "foret"], uicn: "LC",
    description: "Passereau discret (13-14 cm) qui ressemble à un moineau, mais au bec fin, à la tête et la poitrine gris ardoise et aux flancs striés. Se déplace au sol en sautillant près des buissons. Niche dans les forêts de montagne et descend en plaine l'hiver."
  },

  /* ---------- Rougegorge, rossignol, rougequeues, traquets, grives ---------- */
  {
    id: "rougegorge-familier",
    fr: "Rougegorge familier", bg: "Червеногръдка", en: "European Robin", la: "Erithacus rubecula",
    groupe: "grives", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Petit passereau rond (12,5-14 cm) à la face et la poitrine orange bordées de gris et au dos brun. Chante toute l'année, même en hiver, une mélodie fluide et mélancolique. Curieux, il suit souvent le jardinier ou le promeneur."
  },
  {
    id: "rossignol-philomele",
    fr: "Rossignol philomèle", bg: "Южен славей", en: "Common Nightingale", la: "Luscinia megarhynchos",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "eau", "foret"], uicn: "LC",
    description: "Passereau brun (15-16,5 cm) à la queue roux vif, discret dans les fourrés. Son chant puissant et varié, avec des crescendos « piou-piou-piou » et des notes claquantes, retentit de jour comme de nuit d'avril à juin. Très commun dans les haies et les bois de rivière en Bulgarie."
  },
  {
    id: "rougequeue-noir",
    fr: "Rougequeue noir", bg: "Домашна червеноопашка", en: "Black Redstart", la: "Phoenicurus ochruros",
    groupe: "grives", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Passereau (14-15 cm) à la queue rousse frémissante. Le mâle est gris-noir avec une tache blanche sur l'aile ; la femelle est gris-brun uni. Son chant grinçant, comme du papier froissé, est lancé du haut des toits. Quelques-uns passent l'hiver en plaine."
  },
  {
    id: "rougequeue-a-front-blanc",
    fr: "Rougequeue à front blanc", bg: "Градинска червеноопашка", en: "Common Redstart", la: "Phoenicurus phoenicurus",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Passereau élégant (13-14,5 cm) à queue rousse. Le mâle a la face et la gorge noires, le front blanc, la poitrine orange et le dos gris ; la femelle est brun-beige. Vieux vergers, parcs et forêts claires."
  },
  {
    id: "tarier-des-pres",
    fr: "Tarier des prés", bg: "Ръждивогушо ливадно каменарче", en: "Whinchat", la: "Saxicola rubetra",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["champs"], uicn: "LC",
    description: "Petit passereau (12-14 cm) brun strié à large sourcil blanc et poitrine orangée, avec du blanc à la base de la queue. Se perche bien en vue au sommet des hautes herbes et des clôtures. Surtout de passage en plaine ; niche dans les prairies de montagne."
  },
  {
    id: "tarier-patre",
    fr: "Tarier pâtre", bg: "Черногушо ливадно каменарче", en: "European Stonechat", la: "Saxicola rubicola",
    groupe: "grives", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Petit passereau trapu (11,5-13 cm). Le mâle a la tête noire, un demi-collier blanc et la poitrine orange ; la femelle est plus brune. Se tient au sommet des buissons en lançant un « tsac-tsac » de cailloux heurtés. Friches et pâtures ; quelques-uns hivernent."
  },
  {
    id: "traquet-motteux",
    fr: "Traquet motteux", bg: "Сиво каменарче", en: "Northern Wheatear", la: "Oenanthe oenanthe",
    groupe: "grives", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["montagne", "champs"], uicn: "LC",
    description: "Passereau terrestre (14,5-16 cm) au croupion blanc et à la queue blanche marquée d'un « T » noir renversé. Le mâle est gris dessus avec un masque noir. Se tient bien droit sur les pierres des pâturages et des pentes rocailleuses."
  },
  {
    id: "monticole-de-roche",
    fr: "Monticole de roche", bg: "Скален дрозд", en: "Common Rock Thrush", la: "Monticola saxatilis",
    groupe: "grives", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne"], uicn: "LC",
    description: "Grive des pentes rocheuses (17-20 cm). Le mâle est superbe : tête bleu-gris, tache blanche sur le dos, poitrine et queue orange vif ; la femelle est brune et écaillée. Chante en vol ou depuis un rocher.",
    aVerifier: true,
    note: "Présence dans les zones rocheuses de la Sredna Gora à confirmer."
  },
  {
    id: "merle-noir",
    fr: "Merle noir", bg: "Кос", en: "Common Blackbird", la: "Turdus merula",
    groupe: "grives", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Le mâle (24-27 cm) est tout noir, avec le bec et le cercle autour de l'œil jaune-orange ; la femelle est brun sombre. Chant flûté et posé au crépuscule. Fouille les feuilles mortes ; son cri d'alarme « tchok-tchok » est sonore."
  },
  {
    id: "grive-litorne",
    fr: "Grive litorne", bg: "Хвойнов дрозд", en: "Fieldfare", la: "Turdus pilaris",
    groupe: "grives", presence: ["hivernant"], mois: [11, 12, 1, 2, 3],
    habitats: ["champs", "haies", "village"], uicn: "LC",
    description: "Grande grive (22-27 cm) à la tête et au croupion gris, au dos brun-marron et à la poitrine dorée tachetée de noir. Hivernant venu du nord, en bandes bruyantes « tchak-tchak » sur les arbres à baies et dans les prés."
  },
  {
    id: "grive-musicienne",
    fr: "Grive musicienne", bg: "Поен дрозд", en: "Song Thrush", la: "Turdus philomelos",
    groupe: "grives", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Grive brune (20-23 cm) à la poitrine crème couverte de petites taches en pointe de flèche. Chant puissant fait de phrases répétées deux ou trois fois. Casse les coquilles d'escargots sur une pierre qui lui sert d'« enclume »."
  },
  {
    id: "grive-mauvis",
    fr: "Grive mauvis", bg: "Беловежд дрозд", en: "Redwing", la: "Turdus iliacus",
    groupe: "grives", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["haies", "foret", "champs"], uicn: "LC",
    description: "Petite grive (19-23 cm) à large sourcil crème et aux flancs rouge-orangé. Hivernant du nord, souvent mêlée aux litornes dans les vergers et les haies à baies. Cri fin « tsiih » en vol de nuit.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (classée NT en 2015, LC depuis ?)."
  },
  {
    id: "grive-draine",
    fr: "Grive draine", bg: "Имелов дрозд", en: "Mistle Thrush", la: "Turdus viscivorus",
    groupe: "grives", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs"], uicn: "LC",
    description: "La plus grande grive (26-29 cm), gris-brun pâle, à la poitrine couverte de grosses taches rondes et aux coins de la queue blancs. Cri crépitant comme une crécelle. Défend en hiver les touffes de gui, dont elle disperse les graines."
  },

  /* ---------- Rousserolles, fauvettes, pouillots, roitelet ---------- */
  {
    id: "rousserolle-verderolle",
    fr: "Rousserolle verderolle", bg: "Мочурно шаварче", en: "Marsh Warbler", la: "Acrocephalus palustris",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["eau", "haies"], uicn: "LC",
    description: "Fauvette des milieux humides (13-15 cm), brun-olive uni et sans marque, très difficile à distinguer de ses cousines. Son chant est remarquable : un imitateur virtuose qui reprend le chant de dizaines d'espèces. Friches humides, orties et bords de rivière ; arrive tard (mi-mai)."
  },
  {
    id: "rousserolle-turdoide",
    fr: "Rousserolle turdoïde", bg: "Голямо тръстиково шаварче", en: "Great Reed Warbler", la: "Acrocephalus arundinaceus",
    groupe: "fauvettes", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["eau"], uicn: "LC",
    description: "Grosse fauvette des roseaux (16-20 cm), presque de la taille d'une grive, brun chaud avec un sourcil crème. Chant très sonore et grinçant « kara-kara-kiet-kiet », lancé du haut d'un roseau. Roselières des étangs et des rivières."
  },
  {
    id: "hypolais-pale",
    fr: "Hypolaïs pâle", bg: "Малък маслинов присмехулник", en: "Eastern Olivaceous Warbler", la: "Iduna pallida",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["village", "haies", "eau"], uicn: "LC",
    description: "Petite fauvette (12-13,5 cm) gris-brun pâle très terne, au front plat et au bec assez long, qui agite la queue vers le bas. Chant rythmé et répétitif. Saules, jardins et vergers des villages.",
    aVerifier: true,
    note: "Nom bulgare à confirmer."
  },
  {
    id: "fauvette-eperviere",
    fr: "Fauvette épervière", bg: "Ястребогушо коприварче", en: "Barred Warbler", la: "Curruca nisoria",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8],
    habitats: ["haies"], uicn: "LC",
    description: "Grande fauvette (15,5-17 cm) gris-brun au dessous finement barré « d'épervier » et à l'œil jaune vif chez l'adulte. Chant grinçant entrecoupé d'un roulement sec. Haies épineuses et buissons, souvent près de la Pie-grièche écorcheur."
  },
  {
    id: "fauvette-babillarde",
    fr: "Fauvette babillarde", bg: "Малко белогушо коприварче", en: "Lesser Whitethroat", la: "Curruca curruca",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "village"], uicn: "LC",
    description: "Petite fauvette grise (12,5-13,5 cm) aux joues sombres formant un masque et à la gorge blanche, sans roux sur l'aile. Chant : court gazouillis suivi d'un trille sec « tre-tre-tre-tre » sur une seule note. Haies, jardins et broussailles."
  },
  {
    id: "fauvette-grisette",
    fr: "Fauvette grisette", bg: "Голямо белогушо коприварче", en: "Common Whitethroat", la: "Curruca communis",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Fauvette (13-15 cm) à la gorge blanche éclatante et aux ailes bordées de roux ; le mâle a la tête grise. Chant bref et rêche, souvent lancé en vol en s'élevant au-dessus des buissons. Haies, ronciers et friches."
  },
  {
    id: "fauvette-a-tete-noire",
    fr: "Fauvette à tête noire", bg: "Черноглаво коприварче", en: "Eurasian Blackcap", la: "Sylvia atricapilla",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Fauvette grise (13-15 cm) à calotte noire chez le mâle, brun-roux chez la femelle. Chant mélodieux et flûté qui finit en phrase claire et forte. Forêts, parcs et jardins ; quelques individus passent l'hiver."
  },
  {
    id: "pouillot-siffleur",
    fr: "Pouillot siffleur", bg: "Буков певец", en: "Wood Warbler", la: "Phylloscopus sibilatrix",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Pouillot vif (11-12,5 cm), vert-jaune dessus, à gorge jaune vif, ventre blanc pur et long sourcil jaune. Chant typique : un trille qui s'accélère, comme une pièce qui tombe en tournoyant. Hêtraies et chênaies au sous-bois dégagé."
  },
  {
    id: "pouillot-veloce",
    fr: "Pouillot véloce", bg: "Елов певец", en: "Common Chiffchaff", la: "Phylloscopus collybita",
    groupe: "fauvettes", presence: ["estivant", "passage", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Petit pouillot brun-olive terne (10-12 cm) aux pattes sombres, qui agite la queue vers le bas. Son chant égrène son nom anglais : « tchif-tchaf-tchif-tchaf ». Très commun au printemps ; quelques-uns passent l'hiver près de l'eau."
  },
  {
    id: "roitelet-huppe",
    fr: "Roitelet huppé", bg: "Жълтоглаво кралче", en: "Goldcrest", la: "Regulus regulus",
    groupe: "fauvettes", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret"], uicn: "LC",
    description: "Le plus petit oiseau d'Europe (8,5-9,5 cm, 5-6 g), vert olive avec une barre blanche sur l'aile et une calotte jaune bordée de noir (orange au centre chez le mâle). S'agite sans cesse dans les conifères. Niche en montagne ; plus visible en plaine l'hiver, avec les mésanges."
  },

  /* ---------- Gobemouches ---------- */
  {
    id: "gobemouche-gris",
    fr: "Gobemouche gris", bg: "Сива мухоловка", en: "Spotted Flycatcher", la: "Muscicapa striata",
    groupe: "grives", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["village", "foret", "haies"], uicn: "LC",
    description: "Passereau gris-brun (13,5-15 cm) au front et à la poitrine finement striés. Se tient droit sur un perchoir dégagé, s'élance pour attraper un insecte en vol et revient souvent au même poste. Parcs, vergers, lisières et villages."
  },
  {
    id: "gobemouche-nain",
    fr: "Gobemouche nain", bg: "Малка мухоловка", en: "Red-breasted Flycatcher", la: "Ficedula parva",
    groupe: "grives", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Tout petit gobemouche (11-12 cm) brun-gris qui relève souvent la queue, montrant des taches blanches à sa base. Le mâle adulte a la gorge orange-rouge. Discret, dans le feuillage des vieilles hêtraies ; chant tintant qui descend.",
    aVerifier: true,
    note: "Niche dans les hêtraies de montagne en Bulgarie ; présence en Sredna Gora à confirmer."
  },
  {
    id: "gobemouche-a-demi-collier",
    fr: "Gobemouche à demi-collier", bg: "Полуяка мухоловка", en: "Semi-collared Flycatcher", la: "Ficedula semitorquata",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Gobemouche noir et blanc (12-13,5 cm), spécialité des Balkans. Le mâle est intermédiaire entre le Gobemouche noir et le Gobemouche à collier : demi-collier blanc sur le côté du cou, beaucoup de blanc sur l'aile et une barre blanche en plus. Vieilles chênaies et hêtraies claires.",
    aVerifier: true,
    note: "Statut UICN à confirmer (anciennement NT)."
  },
  {
    id: "gobemouche-a-collier",
    fr: "Gobemouche à collier", bg: "Беловрата мухоловка", en: "Collared Flycatcher", la: "Ficedula albicollis",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["foret", "village"], uicn: "LC",
    description: "Gobemouche (12-13,5 cm) dont le mâle noir et blanc porte un collier blanc complet et un croupion blanchâtre. La femelle gris-brun est très difficile à distinguer de celles des espèces voisines. Surtout de passage en avril-mai et en août-septembre."
  },
  {
    id: "gobemouche-noir",
    fr: "Gobemouche noir", bg: "Жалобна мухоловка", en: "European Pied Flycatcher", la: "Ficedula hypoleuca",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9, 10],
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Gobemouche (12-13,5 cm) dont le mâle est noir (ou brun-noir) et blanc, sans collier, avec une petite tache blanche au front et une autre sur l'aile. Migrateur de passage en Bulgarie, souvent vu dans les vergers et les lisières en fin d'été."
  },

  /* ---------- Mésanges, sittelle, tichodrome, grimpereaux ---------- */
  {
    id: "orite-a-longue-queue",
    fr: "Orite à longue queue", bg: "Дългоопашат синигер", en: "Long-tailed Tit", la: "Aegithalos caudatus",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Petite boule rose, noire et blanche (13-15 cm, dont 7-9 cm de queue). En Bulgarie, la tête porte une large bande noire au-dessus de l'œil. Voyage en petites bandes bavardes qui passent d'arbre en arbre en lançant des « srii-srii » ; nid en boule de mousse et de lichens."
  },
  {
    id: "mesange-nonnette",
    fr: "Mésange nonnette", bg: "Лъскавоглав синигер", en: "Marsh Tit", la: "Poecile palustris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Mésange brun-gris (11,5-13 cm) à calotte noire luisante et petite bavette noire, sans barre sur l'aile. Cri explosif « pitchiou ». Forêts de feuillus et vieux vergers ; fait des réserves de graines."
  },
  {
    id: "mesange-lugubre",
    fr: "Mésange lugubre", bg: "Жалобен синигер", en: "Sombre Tit", la: "Poecile lugubris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "montagne", "haies"], uicn: "LC",
    description: "Grande mésange grise des Balkans (13,5-14 cm) à large calotte brun-noir et grande bavette noire qui encadrent des joues blanches. Discrète, dans les chênaies claires, les pentes rocheuses buissonnantes et les vergers. Cri rauque « tchrrr »."
  },
  {
    id: "mesange-noire",
    fr: "Mésange noire", bg: "Боров синигер", en: "Coal Tit", la: "Periparus ater",
    groupe: "mesanges", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Petite mésange (10-11,5 cm) à tête noire et joues blanches, avec une tache blanche sur la nuque et deux barres blanches sur l'aile. Liée aux conifères, où elle cherche les graines au bout des rameaux. Chant rapide « tsiwi-tsiwi ».",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Боров синигер ?) ; liée aux conifères, présence locale à vérifier."
  },
  {
    id: "mesange-bleue",
    fr: "Mésange bleue", bg: "Син синигер", en: "Eurasian Blue Tit", la: "Cyanistes caeruleus",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Petite mésange (10,5-12 cm) à calotte bleu azur, aux joues blanches cerclées de bleu foncé et au ventre jaune. Acrobate qui se suspend au bout des branches. Très fréquente aux mangeoires en hiver."
  },
  {
    id: "mesange-charbonniere",
    fr: "Mésange charbonnière", bg: "Голям синигер", en: "Great Tit", la: "Parus major",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "La plus grande mésange (13,5-15 cm) : tête noire à joues blanches, ventre jaune parcouru d'une bande noire (plus large chez le mâle). Chant sonore « ti-tu, ti-tu » dès la fin de l'hiver. Commune partout, des forêts aux jardins."
  },
  {
    id: "sittelle-torchepot",
    fr: "Sittelle torchepot", bg: "Горска зидарка", en: "Eurasian Nuthatch", la: "Sitta europaea",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Passereau trapu (14 cm) gris-bleu dessus, au bandeau noir sur l'œil et au ventre chamois-roux. Seul oiseau d'Europe à descendre les troncs la tête en bas. Rétrécit l'entrée de son nid avec de la boue ; sifflements forts « tuit-tuit »."
  },
  {
    id: "tichodrome-echelette",
    fr: "Tichodrome échelette", bg: "Скалолазка", en: "Wallcreeper", la: "Tichodroma muraria",
    groupe: "mesanges", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["montagne"], uicn: "LC",
    description: "Oiseau gris (16-17 cm) aux ailes rouge carmin tachées de blanc et au long bec fin arqué, qui grimpe le long des parois en ouvrant les ailes comme un papillon. Hiverne parfois sur les falaises, les gorges et les vieux bâtiments à basse altitude. Une « star » pour les photographes.",
    aVerifier: true,
    note: "Niche en haute montagne ; présence hivernale sur les falaises et carrières des environs à confirmer."
  },
  {
    id: "grimpereau-des-bois",
    fr: "Grimpereau des bois", bg: "Дългопръста дърволазка", en: "Eurasian Treecreeper", la: "Certhia familiaris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Petit passereau (12,5 cm) brun strié dessus, blanc pur dessous, au bec fin arqué, qui grimpe en spirale le long des troncs. Très proche du Grimpereau des jardins : flancs plus blancs, sourcil plus net et chant différent. Plutôt dans les forêts de montagne (hêtraies, conifères)."
  },
  {
    id: "grimpereau-des-jardins",
    fr: "Grimpereau des jardins", bg: "Късопръста дърволазка", en: "Short-toed Treecreeper", la: "Certhia brachydactyla",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Grimpereau (12,5 cm) presque identique au Grimpereau des bois, aux flancs un peu plus brunâtres et au bec plus long. Le meilleur critère est son chant, court et rythmé « ti-ti-titero-tit ». Forêts de feuillus de basse altitude, parcs et vergers."
  },

  /* ---------- Loriot et pies-grièches ---------- */
  {
    id: "loriot-d-europe",
    fr: "Loriot d'Europe", bg: "Авлига", en: "Eurasian Golden Oriole", la: "Oriolus oriolus",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret", "eau", "haies"], uicn: "LC",
    description: "Le mâle (22-25 cm) est jaune d'or éclatant aux ailes noires ; la femelle est vert-jaune. Reste caché dans la cime des grands arbres, au bord des rivières et dans les peupleraies. Son chant flûté « di-de-lio » est bien plus facile à repérer que l'oiseau."
  },
  {
    id: "pie-grieche-ecorcheur",
    fr: "Pie-grièche écorcheur", bg: "Червеногърба сврачка", en: "Red-backed Shrike", la: "Lanius collurio",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Le mâle (16-18 cm) a la tête grise, un masque noir et le dos roux ; la femelle est brune et écaillée. Guette depuis le sommet des buissons épineux, où elle empale parfois ses proies (son « lardoir »). Très commune dans les haies et les pâturages de Bulgarie."
  },
  {
    id: "pie-grieche-a-poitrine-rose",
    fr: "Pie-grièche à poitrine rose", bg: "Черночела сврачка", en: "Lesser Grey Shrike", la: "Lanius minor",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Pie-grièche (19-21 cm) grise dessus, au large masque noir qui couvre le front, aux ailes noires tachées de blanc et au ventre teinté de rose. Se perche sur les fils et les arbres isolés des cultures. Arrive tard (mai) et repart dès août."
  },
  {
    id: "pie-grieche-grise",
    fr: "Pie-grièche grise", bg: "Сива сврачка", en: "Great Grey Shrike", la: "Lanius excubitor",
    groupe: "passereaux", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Grande pie-grièche (24-25 cm) gris clair dessus et blanche dessous, avec un masque noir qui ne passe pas sur le front et une longue queue. Hivernant solitaire, perché bien en vue au sommet d'un arbre isolé ; chasse campagnols et petits oiseaux.",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Сива сврачка ou Голяма сива сврачка)."
  },

  /* ---------- Corvidés ---------- */
  {
    id: "geai-des-chenes",
    fr: "Geai des chênes", bg: "Сойка", en: "Eurasian Jay", la: "Garrulus glandarius",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Corvidé coloré (32-35 cm) rose-beige, à moustache noire et croupion blanc, avec un miroir bleu vif barré de noir sur l'aile. Cri d'alarme rauque « krèèk ». Enterre des glands en automne et contribue ainsi à replanter les chênaies."
  },
  {
    id: "pie-bavarde",
    fr: "Pie bavarde", bg: "Сврака", en: "Eurasian Magpie", la: "Pica pica",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Corvidé noir et blanc (40-51 cm) à très longue queue aux reflets vert métallique. Jacassement sec « tchak-tchak-tchak ». Construit un gros nid d'épines en dôme dans les arbres des villages et des haies."
  },
  {
    id: "choucas-des-tours",
    fr: "Choucas des tours", bg: "Чавка", en: "Western Jackdaw", la: "Coloeus monedula",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "montagne"], uicn: "LC",
    description: "Petit corvidé noir (33-34 cm) à nuque grise et œil blanc-argent. Très sociable, en bandes bruyantes « tchak » autour des clochers, des falaises et des vieux bâtiments, souvent avec les freux en hiver. La forme des Balkans a souvent un demi-collier blanchâtre."
  },
  {
    id: "corbeau-freux",
    fr: "Corbeau freux", bg: "Посевна врана", en: "Rook", la: "Corvus frugilegus",
    groupe: "corvides", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Corvidé noir à reflets violets (44-46 cm) ; l'adulte a la base du bec nue et blanchâtre et des « culottes » ébouriffées. Niche en colonies dans les grands arbres. En hiver, d'immenses bandes venues du nord parcourent les champs de Thrace."
  },
  {
    id: "corneille-mantelee",
    fr: "Corneille mantelée", bg: "Сива врана", en: "Hooded Crow", la: "Corvus cornix",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "eau"], uicn: "LC",
    description: "Corneille (44-51 cm) à la tête, aux ailes et à la queue noires et au corps gris cendré. Omniprésente en Bulgarie, des villages aux bords de rivière. Croassement rauque « kraa »."
  },
  {
    id: "grand-corbeau",
    fr: "Grand Corbeau", bg: "Гарван гробар", en: "Northern Raven", la: "Corvus corax",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "foret", "champs"], uicn: "LC",
    description: "Le plus grand passereau (54-67 cm), entièrement noir, au bec massif, à la gorge hérissée et à la queue en losange en vol. Cri grave et sonore « krok ». Vit en couples en montagne et fait des acrobaties aériennes au printemps."
  },

  /* ---------- Étourneaux et moineaux ---------- */
  {
    id: "etourneau-sansonnet",
    fr: "Étourneau sansonnet", bg: "Обикновен скорец", en: "Common Starling", la: "Sturnus vulgaris",
    groupe: "passereaux", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Passereau noir (19-22 cm) à reflets verts et violets, constellé de points blancs en hiver ; bec jaune au printemps. Imitateur doué. En automne et en hiver, des nuées de milliers d'oiseaux dansent au-dessus des dortoirs."
  },
  {
    id: "etourneau-roselin",
    fr: "Étourneau roselin", bg: "Розов скорец", en: "Rosy Starling", la: "Pastor roseus",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8],
    habitats: ["champs", "village"], uicn: "LC",
    description: "Étourneau (19-22 cm) rose saumon à la tête huppée, aux ailes et à la queue noires à reflets. Arrivées irrégulières : certaines années, des bandes envahissent la Bulgarie en mai-juin pour nicher en colonies dans les talus et les tas de pierres, attirées par les criquets."
  },
  {
    id: "moineau-domestique",
    fr: "Moineau domestique", bg: "Домашно врабче", en: "House Sparrow", la: "Passer domesticus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village"], uicn: "LC",
    description: "Le moineau des villages (14-16 cm). Le mâle a la calotte grise, la nuque marron et une bavette noire ; la femelle est brun-gris terne. Toujours près des maisons et des fermes, en groupes pépiants."
  },
  {
    id: "moineau-friquet",
    fr: "Moineau friquet", bg: "Полско врабче", en: "Eurasian Tree Sparrow", la: "Passer montanus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Moineau plus petit (12,5-14 cm) et plus élégant, à calotte entièrement brun-chocolat et joue blanche marquée d'une tache noire ; mâle et femelle sont identiques. Lisières des villages, vergers et haies."
  },

  /* ---------- Fringilles ---------- */
  {
    id: "pinson-des-arbres",
    fr: "Pinson des arbres", bg: "Обикновена чинка", en: "Common Chaffinch", la: "Fringilla coelebs",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Fringille commun (14-16 cm) aux deux barres blanches sur l'aile. Le mâle a la calotte gris-bleu et la poitrine rose-brique ; la femelle est brun-olive. Chant en cascade terminé par une fioriture, très répandu dans les forêts."
  },
  {
    id: "pinson-du-nord",
    fr: "Pinson du Nord", bg: "Планинска чинка", en: "Brambling", la: "Fringilla montifringilla",
    groupe: "fringilles", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Cousin nordique du pinson (14-16 cm), à la poitrine et aux épaules orange et au croupion blanc ; tête noire chez le mâle en été, brun-gris tacheté en hiver. Hiverne en bandes qui mangent les faînes sous les hêtres ; certaines années, des dortoirs de milliers d'oiseaux."
  },
  {
    id: "grosbec-casse-noyaux",
    fr: "Grosbec casse-noyaux", bg: "Черешарка", en: "Hawfinch", la: "Coccothraustes coccothraustes",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Gros fringille trapu (16,5-18 cm) au bec énorme capable de casser les noyaux de cerise, à la tête orangée, à la nuque grise et à la bavette noire. En vol, larges barres blanches sur l'aile. Discret, souvent à la cime des arbres ; cri sec « tsik »."
  },
  {
    id: "bouvreuil-pivoine",
    fr: "Bouvreuil pivoine", bg: "Червенушка", en: "Eurasian Bullfinch", la: "Pyrrhula pyrrhula",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Fringille trapu (15,5-17,5 cm) à calotte noire et croupion blanc ; le mâle a la poitrine rose-rouge vif, la femelle rose-beige terne. Mange les bourgeons et les baies. Cri doux et flûté « diu ». Plus fréquent à basse altitude en hiver."
  },
  {
    id: "verdier-d-europe",
    fr: "Verdier d'Europe", bg: "Зеленика", en: "European Greenfinch", la: "Chloris chloris",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Fringille vert-olive (14-16 cm) au gros bec clair, avec des bordures jaune vif sur l'aile et la queue. Chant fait de trilles et d'un long « djouiiii » nasillard. Jardins, parcs et lisières."
  },
  {
    id: "linotte-melodieuse",
    fr: "Linotte mélodieuse", bg: "Обикновено конопарче", en: "Common Linnet", la: "Linaria cannabina",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Petit fringille brun (12,5-14 cm) au bec gris. Au printemps, le mâle a le front et la poitrine rouge framboise et la tête grise. En bandes dans les friches, les champs et les broussailles, d'un vol bondissant."
  },
  {
    id: "chardonneret-elegant",
    fr: "Chardonneret élégant", bg: "Щиглец", en: "European Goldfinch", la: "Carduelis carduelis",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Fringille très coloré (12-13,5 cm) : face rouge, tête noire et blanche, larges barres jaune d'or sur les ailes noires. Se nourrit en petites bandes sur les chardons et les cardères. Chant gai et liquide."
  },
  {
    id: "serin-cini",
    fr: "Serin cini", bg: "Диво канарче", en: "European Serin", la: "Serinus serinus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Minuscule fringille (11-12 cm) jaune strié, au croupion jaune vif et au bec très court. Chant grésillant et rapide, comme du verre qui s'entrechoque, lancé d'un vol papillonnant. Jardins, vergers et cimetières des villages."
  },
  {
    id: "tarin-des-aulnes",
    fr: "Tarin des aulnes", bg: "Елшова скатия", en: "Eurasian Siskin", la: "Spinus spinus",
    groupe: "fringilles", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3, 4],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Petit fringille (11-12,5 cm) vert-jaune strié, aux barres jaunes sur l'aile ; le mâle a une calotte et une petite bavette noires. En hiver, en bandes acrobatiques dans les aulnes et les bouleaux du bord des rivières."
  },

  /* ---------- Bruants ---------- */
  {
    id: "bruant-proyer",
    fr: "Bruant proyer", bg: "Сива овесарка", en: "Corn Bunting", la: "Emberiza calandra",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Gros bruant brun-gris strié (16-19 cm), sans marque nette. Chante sur un piquet ou un fil un cliquetis sec, comparé à un trousseau de clés qu'on secoue. Très commun dans les cultures et les prairies de plaine."
  },
  {
    id: "bruant-jaune",
    fr: "Bruant jaune", bg: "Жълта овесарка", en: "Yellowhammer", la: "Emberiza citrinella",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Bruant (16-16,5 cm) dont le mâle a la tête et le ventre jaune vif ; croupion roux. Son chant est une série de notes terminée par une note longue : « ti-ti-ti-ti-ti-tiiiih ». Lisières, haies et campagnes."
  },
  {
    id: "bruant-zizi",
    fr: "Bruant zizi", bg: "Зеленогуша овесарка", en: "Cirl Bunting", la: "Emberiza cirlus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["haies", "village"], uicn: "LC",
    description: "Bruant (15-16,5 cm) dont le mâle a la face rayée de noir et de jaune, la gorge noire et une bande vert-olive sur la poitrine ; croupion brun-olive, et non roux. Chant : trille sec sur une seule note. Pentes chaudes, vergers et haies des villages."
  },
  {
    id: "bruant-fou",
    fr: "Bruant fou", bg: "Сивоглава овесарка", en: "Rock Bunting", la: "Emberiza cia",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "haies"], uicn: "LC",
    description: "Bruant (15-16,5 cm) à la tête gris clair rayée de noir, au ventre roux-orangé uni et au croupion roux. Discret sur les pentes rocheuses buissonnantes, dans les vignes et les lisières ensoleillées. Cri fin « tsi ».",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Сивоглава овесарка ou Планинска овесарка ?)."
  },
  {
    id: "bruant-ortolan",
    fr: "Bruant ortolan", bg: "Градинска овесарка", en: "Ortolan Bunting", la: "Emberiza hortulana",
    groupe: "fringilles", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "haies", "montagne"], uicn: "LC",
    description: "Bruant (15-16,5 cm) à la tête gris-vert, à la gorge et à la moustache jaune pâle, au cercle jaune autour de l'œil et au ventre roux-orangé. Chant mélancolique de quelques notes. Pentes sèches parsemées d'arbres, vignes et cultures."
  },
  {
    id: "bruant-melanocephale",
    fr: "Bruant mélanocéphale", bg: "Черноглава овесарка", en: "Black-headed Bunting", la: "Emberiza melanocephala",
    groupe: "fringilles", presence: ["estivant"], mois: [5, 6, 7, 8],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Grand bruant (16-18 cm) dont le mâle a le capuchon noir, le dessous jaune éclatant et le dos roux ; la femelle est beige pâle. Chante du haut des buissons et des fils dans les cultures et les haies de Thrace. Arrive en mai et repart dès août."
  }
];
