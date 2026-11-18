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
     description_en, description_bg
                 la même description en anglais et en bulgare, affichée quand
                 l'appli est dans cette langue (si elle manque : le français)
     aVerifier   true si une info n'est pas sûre → badge « ? » orange
     note        ce qu'il faut vérifier (affiché sur la fiche)
     note_en, note_bg   la même note en anglais et en bulgare

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
    description: "Le plus petit grèbe d'Europe (25-29 cm), rond comme une balle, qui plonge sans cesse. En plumage nuptial, joues et cou marron-roux avec une tache jaune vif à la base du bec ; brun-beige pâle en hiver. Son trille hennissant, très sonore, trahit sa présence sur les étangs et les rivières lentes.",
    description_en: "Europe’s smallest grebe (25-29 cm), round as a ball and diving constantly. In breeding plumage the cheeks and neck are chestnut-red with a bright yellow spot at the base of the bill; pale buff-brown in winter. Its loud, whinnying trill gives it away on ponds and slow rivers.",
    description_bg: "Най-малкият гмурец в Европа (25-29 см), кръгъл като топка и непрекъснато се гмурка. В брачно оперение бузите и шията са кестеняво-червени, с ярко жълто петно в основата на човката; през зимата е бледо кафеникаво-бежов. Звучната му цвилеща трел издава присъствието му по езерата и бавните реки."
  },
  {
    id: "grand-cormoran",
    fr: "Grand Cormoran", bg: "Голям корморан", en: "Great Cormorant", la: "Phalacrocorax carbo",
    groupe: "eau", presence: ["hivernant"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau"], uicn: "LC",
    description: "Grand oiseau noir (80-100 cm) au long cou et au bec crochu, qui nage très enfoncé dans l'eau et plonge pour pêcher. Se pose souvent ailes écartées pour les faire sécher. En hiver, des groupes suivent les rivières et les retenues ; vol en ligne ou en V.",
    description_en: "Large black bird (80-100 cm) with a long neck and a hooked bill, which swims low in the water and dives to fish. Often perches with its wings spread out to dry. In winter, flocks follow rivers and reservoirs, flying in lines or V-formations.",
    description_bg: "Голяма черна птица (80-100 см) с дълга шия и закривена човка, която плува дълбоко потопена във водата и се гмурка за риба. Често каца с разперени крила, за да ги изсуши. През зимата ята следват реките и язовирите; летят в редица или във формация V."
  },
  {
    id: "heron-cendre",
    fr: "Héron cendré", bg: "Сива чапла", en: "Grey Heron", la: "Ardea cinerea",
    groupe: "echassiers", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Grand héron gris (90-98 cm) au cou blanc, avec un bandeau noir au-dessus de l'œil prolongé par une fine huppe et un long bec jaune en poignard. Guette immobile au bord de l'eau ou dans les prés. Vole le cou replié, pattes dépassant la queue, en lançant un « kraak » rauque.",
    description_en: "Large grey heron (90-98 cm) with a white neck, a black stripe above the eye extending into a thin crest, and a long yellow dagger-like bill. Waits motionless at the water’s edge or in meadows. Flies with its neck folded and its legs projecting beyond the tail, giving a hoarse “kraak”.",
    description_bg: "Голяма сива чапла (90-98 см) с бяла шия, черна ивица над окото, която продължава в тънък гребен, и дълга жълта човка като кинжал. Дебне неподвижно край водата или в ливадите. Лети със свита шия и крака, стърчащи зад опашката, като издава дрезгаво „краак“."
  },
  {
    id: "grande-aigrette",
    fr: "Grande Aigrette", bg: "Голяма бяла чапла", en: "Great Egret", la: "Ardea alba",
    groupe: "echassiers", presence: ["hivernant", "passage"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Très grand héron entièrement blanc (85-100 cm), de la taille du Héron cendré, au cou très long en S. Bec jaune en hiver (noir en période nuptiale) et longues pattes sombres. Souvent seule dans les champs labourés ou au bord des rivières en hiver.",
    description_en: "Very large, all-white heron (85-100 cm), the size of a Grey Heron, with a very long S-shaped neck. Yellow bill in winter (black in the breeding season) and long dark legs. In winter often alone in ploughed fields or along rivers.",
    description_bg: "Много голяма, изцяло бяла чапла (85-100 см), колкото сивата чапла, с много дълга шия във форма на S. Човката е жълта през зимата (черна в брачния период), краката са дълги и тъмни. През зимата често се вижда поединично в изорани ниви или край реки."
  },
  {
    id: "aigrette-garzette",
    fr: "Aigrette garzette", bg: "Малка бяла чапла", en: "Little Egret", la: "Egretta garzetta",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Petit héron tout blanc (55-65 cm), élancé, au bec noir et fin. Signe distinctif : pattes noires terminées par des doigts jaune vif (« chaussons jaunes »). Pêche activement en eau peu profonde, parfois en courant.",
    description_en: "Small, slender, all-white heron (55-65 cm) with a thin black bill. Distinctive feature: black legs ending in bright yellow toes (“yellow slippers”). Fishes actively in shallow water, sometimes running.",
    description_bg: "Малка, стройна, изцяло бяла чапла (55-65 см) с тънка черна човка. Отличителен белег: черни крака, завършващи с ярко жълти пръсти („жълти пантофки“). Лови риба активно в плитка вода, понякога тичайки."
  },
  {
    id: "cigogne-noire",
    fr: "Cigogne noire", bg: "Черен щъркел", en: "Black Stork", la: "Ciconia nigra",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Cigogne noire à reflets verts et pourpres (90-100 cm), au ventre blanc, au bec et aux pattes rouges. Discrète, elle niche dans les forêts tranquilles et pêche dans les ruisseaux de montagne. Plane volontiers en spirale très haut.",
    description_en: "Black stork with a green and purple sheen (90-100 cm), a white belly and a red bill and legs. Shy, it nests in quiet forests and feeds in mountain streams. Often soars in spirals very high up.",
    description_bg: "Черен щъркел със зелен и пурпурен отблясък (90-100 см), с бял корем и червени човка и крака. Потаен, гнезди в спокойни гори и се храни в планински потоци. Често се рее на спирали много високо."
  },
  {
    id: "cigogne-blanche",
    fr: "Cigogne blanche", bg: "Бял щъркел", en: "White Stork", la: "Ciconia ciconia",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["village", "champs"], uicn: "LC",
    description: "Grand échassier blanc (100-115 cm) aux rémiges noires, au bec et aux pattes rouges. Niche sur les toits, les poteaux et les cheminées des villages, où elle craquette du bec au nid. Arrive fin mars et repart fin août en grands vols tournoyants.",
    description_en: "Large white wading bird (100-115 cm) with black flight feathers and a red bill and legs. Nests on roofs, poles and chimneys in villages, where it clatters its bill at the nest. Arrives in late March and leaves in late August in large circling flocks.",
    description_bg: "Голяма бяла газеща птица (100-115 см) с черни махови пера и червени човка и крака. Гнезди по покриви, стълбове и комини в селата, където трака с човка на гнездото. Пристига в края на март и отлита в края на август на големи кръжащи ята."
  },
  {
    id: "canard-colvert",
    fr: "Canard colvert", bg: "Зеленоглава патица", en: "Mallard", la: "Anas platyrhynchos",
    groupe: "eau", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Le canard le plus commun (50-65 cm). Le mâle a la tête vert bouteille, un collier blanc et la poitrine brun-pourpre ; la femelle est brune mouchetée. Les deux sexes montrent sur l'aile un miroir bleu bordé de blanc.",
    description_en: "The commonest duck (50-65 cm). The male has a bottle-green head, a white collar and a purplish-brown breast; the female is mottled brown. Both sexes show a blue speculum edged with white on the wing.",
    description_bg: "Най-обикновената патица (50-65 см). Мъжкият има бутилковозелена глава, бяла яка и пурпурно-кафяви гърди; женската е кафява на петна. И двата пола имат на крилото синьо огледало, обрамчено с бяло."
  },

  /* ---------- Rapaces diurnes ---------- */
  {
    id: "bondree-apivore",
    fr: "Bondrée apivore", bg: "Осояд", en: "European Honey Buzzard", la: "Pernis apivorus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Rapace de la taille d'une buse (52-60 cm) mais à la tête petite et fine, « de pigeon », et à la longue queue marquée de deux bandes sombres près de la base et d'une large bande au bout. Plumage très variable. Déterre les nids de guêpes ; passe en grand nombre fin août-septembre.",
    description_en: "Raptor the size of a Common Buzzard (52-60 cm) but with a small, slim, “pigeon-like” head and a long tail marked with two dark bands near the base and a broad band at the tip. Plumage very variable. Digs out wasp nests; passes through in large numbers in late August and September.",
    description_bg: "Граблива птица с размерите на мишелов (52-60 см), но с малка, тънка глава „като на гълъб“ и дълга опашка с две тъмни ивици близо до основата и широка ивица на края. Оперението е много променливо. Разравя осиени гнезда; прелита в големи количества в края на август и през септември."
  },
  {
    id: "vautour-percnoptere",
    fr: "Vautour percnoptère", bg: "Египетски лешояд", en: "Egyptian Vulture", la: "Neophron percnopterus",
    groupe: "rapaces", presence: ["estivant"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["montagne"], uicn: "EN",
    description: "Petit vautour (55-65 cm) blanc sale aux rémiges noires, à la face jaune nue et à la queue en losange. En vol, silhouette blanche et noire très contrastée. Niche dans les falaises ; menacé par les empoisonnements et les lignes électriques.",
    description_en: "Small vulture (55-65 cm), dirty white with black flight feathers, a bare yellow face and a wedge-shaped tail. In flight, a strongly contrasting black-and-white silhouette. Nests on cliffs; threatened by poisoning and power lines.",
    description_bg: "Малък лешояд (55-65 см), мръсно бял с черни махови пера, гола жълта глава и клиновидна опашка. В полет силуетът е силно контрастен, черно-бял. Гнезди по скали; застрашен е от отравяния и електропроводи.",
    aVerifier: true,
    note: "Espèce très rare et en déclin en Bulgarie (surtout Rhodopes orientales) : présence près de Karlovo à confirmer.",
    note_en: "Very rare and declining species in Bulgaria (mainly in the Eastern Rhodopes): presence near Karlovo to be confirmed.",
    note_bg: "Много рядък и намаляващ вид в България (главно в Източните Родопи): присъствието край Карлово трябва да се потвърди."
  },
  {
    id: "circaete-jean-le-blanc",
    fr: "Circaète Jean-le-Blanc", bg: "Орел змияр", en: "Short-toed Snake Eagle", la: "Circaetus gallicus",
    groupe: "rapaces", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne", "champs", "foret"], uicn: "LC",
    description: "Grand aigle pâle (62-69 cm) au dessous blanc finement barré, à la tête ronde « de hibou » aux yeux jaunes et à la gorge souvent sombre. Fait souvent du surplace face au vent en chassant serpents et lézards sur les pentes ensoleillées.",
    description_en: "Large pale eagle (62-69 cm) with finely barred white underparts, a round “owl-like” head with yellow eyes and an often dark throat. Often hovers into the wind while hunting snakes and lizards on sunny slopes.",
    description_bg: "Голям светъл орел (62-69 см): отдолу е бял с фини напречни ивици, главата е кръгла, „като на сова“, с жълти очи, а гушата често е тъмна. Често зависва срещу вятъра, докато лови змии и гущери по слънчевите склонове."
  },
  {
    id: "aigle-pomarin",
    fr: "Aigle pomarin", bg: "Малък креслив орел", en: "Lesser Spotted Eagle", la: "Clanga pomarina",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Aigle brun moyen (55-65 cm) dont les couvertures sous les ailes sont plus claires que les rémiges, avec souvent une petite tache claire à la base des primaires sur le dessus de l'aile. Niche en forêt et chasse dans les prairies humides, parfois en marchant au sol.",
    description_en: "Medium-sized brown eagle (55-65 cm) whose underwing coverts are paler than the flight feathers, often with a small pale patch at the base of the primaries on the upperwing. Nests in forests and hunts in wet meadows, sometimes walking on the ground.",
    description_bg: "Среден по размер кафяв орел (55-65 см), чиито подкрилни покривни пера са по-светли от маховите, често с малко светло петно в основата на първостепенните махови пера отгоре на крилото. Гнезди в гори и ловува във влажни ливади, понякога ходейки по земята."
  },
  {
    id: "aigle-royal",
    fr: "Aigle royal", bg: "Скален орел", en: "Golden Eagle", la: "Aquila chrysaetos",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne"], uicn: "LC",
    description: "Très grand aigle sombre (75-88 cm, jusqu'à 2,2 m d'envergure) à la nuque dorée. Les jeunes montrent des taches blanches aux ailes et une queue blanche terminée de noir. Plane les ailes en V léger au-dessus des crêtes et des pentes rocheuses.",
    description_en: "Very large dark eagle (75-88 cm, wingspan up to 2.2 m) with a golden nape. Young birds show white wing patches and a white tail with a black tip. Soars with its wings in a shallow V over ridges and rocky slopes.",
    description_bg: "Много голям тъмен орел (75-88 см, размах на крилете до 2,2 м) със златист тил. Младите птици имат бели петна по крилата и бяла опашка с черен край. Рее се с леко вдигнати във V крила над билата и скалистите склонове."
  },
  {
    id: "aigle-botte",
    fr: "Aigle botté", bg: "Малък орел", en: "Booted Eagle", la: "Hieraaetus pennatus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Petit aigle de la taille d'une buse (45-53 cm), en forme claire (dessous blanc, rémiges noires) ou sombre. Vu de face, deux petits « phares » blancs à la base des ailes ; une bande pâle sur le dessus de l'aile. Niche dans les forêts de feuillus.",
    description_en: "Small eagle the size of a Common Buzzard (45-53 cm), in a pale morph (white underparts, black flight feathers) or a dark morph. Seen head-on, it shows two small white “headlights” at the base of the wings; a pale band runs across the upperwing. Nests in broadleaved forests.",
    description_bg: "Малък орел с размерите на мишелов (45-53 см), в светла форма (бял отдолу, с черни махови пера) или тъмна форма. Отпред се виждат две малки бели „фарчета“ в основата на крилата; отгоре на крилото има светла ивица. Гнезди в широколистни гори."
  },
  {
    id: "busard-des-roseaux",
    fr: "Busard des roseaux", bg: "Тръстиков блатар", en: "Western Marsh Harrier", la: "Circus aeruginosus",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Le plus grand busard (48-56 cm), qui vole bas au-dessus des roselières et des champs, les ailes relevées en V. Mâle tricolore (brun, gris, bout des ailes noir) ; femelle brun chocolat à calotte et gorge crème.",
    description_en: "The largest harrier (48-56 cm), flying low over reedbeds and fields with its wings raised in a V. The male is three-coloured (brown, grey, black wingtips); the female is chocolate-brown with a cream crown and throat.",
    description_bg: "Най-едрият блатар (48-56 см), който лети ниско над тръстиките и нивите с вдигнати във V крила. Мъжкият е трицветен (кафяв, сив, с черни върхове на крилата); женската е шоколадовокафява с кремаво теме и гуша."
  },
  {
    id: "busard-saint-martin",
    fr: "Busard Saint-Martin", bg: "Полски блатар", en: "Hen Harrier", la: "Circus cyaneus",
    groupe: "rapaces", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["champs"], uicn: "LC",
    description: "Busard d'hiver des plaines (44-52 cm). Le mâle est gris perle avec le bout des ailes noir ; la femelle est brune avec un large croupion blanc bien visible. Rase les champs et les friches d'un vol chaloupé.",
    description_en: "Winter harrier of the plains (44-52 cm). The male is pearl-grey with black wingtips; the female is brown with a broad, conspicuous white rump. Skims over fields and fallow land with a buoyant, rocking flight.",
    description_bg: "Зимен блатар на равнините (44-52 см). Мъжкият е перленосив с черни върхове на крилата; женската е кафява с широк, добре видим бял кръст. Лети ниско над нивите и запустелите земи с люлеещ се полет."
  },
  {
    id: "autour-des-palombes",
    fr: "Autour des palombes", bg: "Голям ястреб", en: "Northern Goshawk", la: "Accipiter gentilis",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Grand épervier puissant (48-62 cm, la femelle a la taille d'une buse), gris-brun dessus et finement barré dessous, avec un sourcil blanc marqué et l'œil orange. Chasseur discret des forêts, capable de prendre geais et pigeons ; queue longue et arrondie.",
    description_en: "Large, powerful hawk (48-62 cm; the female is the size of a Common Buzzard), grey-brown above and finely barred below, with a bold white eyebrow and an orange eye. A stealthy forest hunter able to take jays and pigeons; long, rounded tail.",
    description_bg: "Голям и силен ястреб (48-62 см; женската е колкото мишелов), сивокафяв отгоре и фино набразден отдолу, с ясна бяла вежда и оранжево око. Потаен горски ловец, способен да хване сойки и гълъби; опашката е дълга и заоблена."
  },
  {
    id: "epervier-d-europe",
    fr: "Épervier d'Europe", bg: "Малък ястреб", en: "Eurasian Sparrowhawk", la: "Accipiter nisus",
    groupe: "rapaces", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Petit rapace (28-38 cm) aux ailes courtes et arrondies et à la longue queue carrée. Le mâle est gris-bleu dessus et barré de roux dessous ; la femelle, plus grande, est barrée de gris. Surgit en rase-mottes près des mangeoires pour chasser les petits oiseaux.",
    description_en: "Small raptor (28-38 cm) with short, rounded wings and a long, square-ended tail. The male is blue-grey above and barred rufous below; the larger female is barred grey. Bursts in at low level near feeders to hunt small birds.",
    description_bg: "Малка граблива птица (28-38 см) с къси, заоблени крила и дълга, право отрязана опашка. Мъжкият е синкавосив отгоре и с ръждиви ивици отдолу; по-едрата женска е със сиви ивици. Изскача ниско над земята край хранилките, за да лови малки птици."
  },
  {
    id: "epervier-a-pieds-courts",
    fr: "Épervier à pieds courts", bg: "Късопръст ястреб", en: "Levant Sparrowhawk", la: "Accipiter brevipes",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Proche de l'Épervier d'Europe (30-37 cm) mais aux ailes plus pointues, avec le bout des primaires noir bien contrasté sous l'aile claire. Le mâle est gris-bleu à joues grises, l'œil rouge sombre. Niche dans les forêts de plaine et le long des rivières ; migre en groupes.",
    description_en: "Close to the Eurasian Sparrowhawk (30-37 cm) but with more pointed wings, the black tips of the primaries contrasting strongly with the pale underwing. The male is blue-grey with grey cheeks and a dark red eye. Nests in lowland forests and along rivers; migrates in flocks.",
    description_bg: "Прилича на малкия ястреб (30-37 см), но крилата са по-заострени, а черните върхове на първостепенните махови пера контрастират силно на светлата долна страна на крилото. Мъжкият е синкавосив със сиви бузи и тъмночервено око. Гнезди в равнинни гори и покрай реки; мигрира на ята.",
    aVerifier: true,
    note: "Nicheur peu commun en Bulgarie, surtout en plaine : présence autour de Karlovo à confirmer.",
    note_en: "Uncommon breeder in Bulgaria, mainly in the lowlands: presence around Karlovo to be confirmed.",
    note_bg: "Сравнително рядък гнездящ вид в България, главно в равнините: присъствието около Карлово трябва да се потвърди."
  },
  {
    id: "milan-noir",
    fr: "Milan noir", bg: "Черна каня", en: "Black Kite", la: "Milvus migrans",
    groupe: "rapaces", presence: ["passage", "estivant"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Rapace brun sombre (48-58 cm) à la queue légèrement échancrée, qu'il tourne sans cesse en vol comme un gouvernail. Opportuniste, il fréquente rivières, décharges et champs fauchés. Surtout vu en migration en Bulgarie, où il est devenu un nicheur rare.",
    description_en: "Dark brown raptor (48-58 cm) with a slightly forked tail that it constantly twists in flight like a rudder. An opportunist, it visits rivers, rubbish dumps and mown fields. In Bulgaria it is mostly seen on migration and has become a rare breeder.",
    description_bg: "Тъмнокафява граблива птица (48-58 см) с леко врязана опашка, която непрекъснато извърта в полет като кормило. Опортюнист, посещава реки, сметища и окосени ливади. В България се вижда главно по време на миграция и е станала рядко гнездяща."
  },
  {
    id: "buse-variable",
    fr: "Buse variable", bg: "Обикновен мишелов", en: "Common Buzzard", la: "Buteo buteo",
    groupe: "rapaces", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["champs", "foret"], uicn: "LC",
    description: "Le rapace le plus commun (48-56 cm), trapu, aux ailes larges et à la queue courte. Plumage très variable, souvent brun avec une bande claire sur la poitrine. Guette sur les poteaux et plane en cercles en miaulant « hiééé ».",
    description_en: "The commonest raptor (48-56 cm), stocky, with broad wings and a short tail. Plumage very variable, often brown with a pale band across the breast. Watches from poles and soars in circles, mewing “hee-yaa”.",
    description_bg: "Най-обикновената граблива птица (48-56 см), набита, с широки крила и къса опашка. Оперението е много променливо, често кафяво със светла ивица на гърдите. Дебне от стълбовете и кръжи във въздуха, като издава мяукащо „хиеее“."
  },
  {
    id: "buse-feroce",
    fr: "Buse féroce", bg: "Белоопашат мишелов", en: "Long-legged Buzzard", la: "Buteo rufinus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "champs"], uicn: "LC",
    description: "Grande buse (50-65 cm) à la tête et à la poitrine pâles, au ventre et aux « culottes » plus sombres, et à la queue orangée presque sans barres. Plus grande et plus longue d'ailes que la Buse variable. Fait du surplace au-dessus des pentes sèches et des steppes.",
    description_en: "Large buzzard (50-65 cm) with a pale head and breast, a darker belly and “trousers”, and an orange tail almost without bars. Bigger and longer-winged than the Common Buzzard. Hovers over dry slopes and steppes.",
    description_bg: "Едър мишелов (50-65 см) със светли глава и гърди, по-тъмни корем и „гащи“ и оранжева опашка почти без ивици. По-голям и с по-дълги крила от обикновения мишелов. Зависва във въздуха над сухите склонове и степите."
  },
  {
    id: "balbuzard-pecheur",
    fr: "Balbuzard pêcheur", bg: "Орел рибар", en: "Western Osprey", la: "Pandion haliaetus",
    groupe: "rapaces", presence: ["passage"], mois: [3, 4, 5, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Rapace pêcheur (52-60 cm) blanc dessous et brun foncé dessus, avec un bandeau sombre sur l'œil. En vol, ailes longues coudées « en M ». Plonge pattes en avant pour attraper les poissons ; s'observe au passage sur les rivières et les retenues.",
    description_en: "Fish-eating raptor (52-60 cm), white below and dark brown above, with a dark band through the eye. In flight, its long wings are bent into an “M”. Plunges feet first to catch fish; seen on passage over rivers and reservoirs.",
    description_bg: "Граблива птица рибоядец (52-60 см), бяла отдолу и тъмнокафява отгоре, с тъмна ивица през окото. В полет дългите крила са пречупени във форма на „М“. Гмурка се с краката напред, за да хване риба; вижда се по време на прелета над реки и язовири."
  },
  {
    id: "faucon-crecerelle",
    fr: "Faucon crécerelle", bg: "Черношипа ветрушка", en: "Common Kestrel", la: "Falco tinnunculus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Petit faucon roux (31-37 cm) célèbre pour son vol sur place, « en Saint-Esprit », au-dessus des prés. Le mâle a la tête et la queue gris-bleu et le dos roux tacheté de noir ; la femelle est rousse et barrée. Cri aigu « kikiki ».",
    description_en: "Small rufous falcon (31-37 cm) famous for hovering over meadows. The male has a blue-grey head and tail and a rufous back spotted with black; the female is rufous and barred. Shrill “kee-kee-kee” call.",
    description_bg: "Малък ръждив сокол (31-37 см), известен с това, че зависва във въздуха над ливадите. Мъжкият е със синкавосиви глава и опашка и ръждив гръб с черни петна; женската е ръждива и на ивици. Остър зов „ки-ки-ки“."
  },
  {
    id: "faucon-kobez",
    fr: "Faucon kobez", bg: "Вечерна ветрушка", en: "Red-footed Falcon", la: "Falco vespertinus",
    groupe: "rapaces", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["champs"], uicn: "VU",
    description: "Petit faucon (28-34 cm) qui migre en groupes. Le mâle est gris ardoise avec les « culottes » et le dessous de la queue rouge brique ; la femelle a la tête et le dessous orangés et le dos gris barré. Chasse les insectes en vol, souvent perché sur les fils pendant le passage.",
    description_en: "Small falcon (28-34 cm) that migrates in flocks. The male is slate-grey with brick-red “trousers” and undertail; the female has an orange head and underparts and a barred grey back. Hunts insects in flight, often perching on wires during passage.",
    description_bg: "Малък сокол (28-34 см), който мигрира на ята. Мъжкият е аспидносив с тухленочервени „гащи“ и подопашие; женската е с оранжеви глава и долна част на тялото и сив гръб на ивици. Лови насекоми в полет, като по време на прелета често каца по жиците.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (VU ou NT selon les évaluations).",
    note_en: "Global IUCN status to be confirmed (VU or NT depending on the assessment).",
    note_bg: "Световният статус по IUCN трябва да се потвърди (VU или NT според оценките)."
  },
  {
    id: "faucon-hobereau",
    fr: "Faucon hobereau", bg: "Орко", en: "Eurasian Hobby", la: "Falco subbuteo",
    groupe: "rapaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "eau", "champs"], uicn: "LC",
    description: "Faucon élancé (29-35 cm) aux ailes longues et pointues « en faux », comme un grand martinet. Moustaches noires sur joues blanches, dessous rayé et culottes rousses. Capture en vol libellules, hirondelles et martinets.",
    description_en: "Slender falcon (29-35 cm) with long, pointed, sickle-shaped wings, like a large swift. Black moustaches on white cheeks, streaked underparts and rufous “trousers”. Catches dragonflies, swallows and swifts in flight.",
    description_bg: "Строен сокол (29-35 см) с дълги, заострени, сърповидни крила, като голям бързолет. Черни „мустаци“ на бели бузи, напетнена на ивици долна страна и ръждиви „гащи“. Лови в полет водни кончета, лястовици и бързолети."
  },
  {
    id: "faucon-pelerin",
    fr: "Faucon pèlerin", bg: "Сокол скитник", en: "Peregrine Falcon", la: "Falco peregrinus",
    groupe: "rapaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne"], uicn: "LC",
    description: "Faucon puissant et trapu (38-51 cm), gris ardoise dessus, avec une large moustache noire en forme de casque. Champion de vitesse, il fond en piqué sur les pigeons. Niche dans les falaises et les gorges.",
    description_en: "Powerful, stocky falcon (38-51 cm), slate-grey above, with a broad black helmet-like moustache. A speed champion, it stoops on pigeons from a great height. Nests on cliffs and in gorges.",
    description_bg: "Силен и набит сокол (38-51 см), аспидносив отгоре, с широки черни „мустаци“ като шлем. Шампион по скорост, спуска се стремглаво върху гълъбите. Гнезди по скали и в клисури."
  },

  /* ---------- Gallinacés, rallidés, limicoles, mouettes ---------- */
  {
    id: "perdrix-grise",
    fr: "Perdrix grise", bg: "Яребица", en: "Grey Partridge", la: "Perdix perdix",
    groupe: "gallinaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Petit gallinacé rond (29-31 cm), gris finement vermiculé, à la face orange et avec une tache marron en fer à cheval sur le ventre. Vit en compagnies dans les champs et les friches ; s'envole bruyamment au ras du sol en criant « kirrr-ik ».",
    description_en: "Small, round gamebird (29-31 cm), finely vermiculated grey, with an orange face and a chestnut horseshoe patch on the belly. Lives in coveys in fields and fallow land; flies off noisily, low over the ground, calling “kirrr-ik”.",
    description_bg: "Малка, закръглена кокошоподобна птица (29-31 см), сива с фини вълнисти шарки, с оранжево лице и кестеняво петно като подкова на корема. Живее на ята в нивите и запустелите земи; излита шумно ниско над земята с вик „кирр-ик“."
  },
  {
    id: "caille-des-bles",
    fr: "Caille des blés", bg: "Пъдпъдък", en: "Common Quail", la: "Coturnix coturnix",
    groupe: "gallinaces", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["champs"], uicn: "LC",
    description: "Minuscule gallinacé (16-18 cm), brun rayé de crème, presque impossible à voir dans les blés et les prairies. On l'entend surtout : un « paye-tes-dettes » en trois syllabes, répété de jour comme de nuit de mai à juillet.",
    description_en: "Tiny gamebird (16-18 cm), brown streaked with cream, almost impossible to see in wheat fields and meadows. Mostly heard: a three-syllable “wet-my-lips”, repeated day and night from May to July.",
    description_bg: "Мъничка кокошоподобна птица (16-18 см), кафява с кремави ивици, почти невъзможна за забелязване в житата и ливадите. Чува се най-вече: трисрично „пъд-пъ-дък“, повтаряно денем и нощем от май до юли."
  },
  {
    id: "faisan-de-colchide",
    fr: "Faisan de Colchide", bg: "Обикновен фазан", en: "Common Pheasant", la: "Phasianus colchicus",
    groupe: "gallinaces", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Grand gallinacé à très longue queue (mâle 70-90 cm). Le mâle a la tête vert métallique, des caroncules rouges et le corps cuivré ; la femelle est brun-beige tachetée. Son « kok-kok » rauque, suivi d'un battement d'ailes, porte loin.",
    description_en: "Large gamebird with a very long tail (male 70-90 cm). The male has a metallic-green head, red facial wattles and a coppery body; the female is spotted buff-brown. Its hoarse “kok-kok”, followed by a whirr of wings, carries far.",
    description_bg: "Едра кокошоподобна птица с много дълга опашка (мъжкият 70-90 см). Мъжкият има металическозелена глава, червени голи петна около очите и медночервеникаво тяло; женската е кафеникаво-бежова на петна. Дрезгавото му „кок-кок“, последвано от пляскане с крила, се чува надалеч."
  },
  {
    id: "gallinule-poule-d-eau",
    fr: "Gallinule poule-d'eau", bg: "Зеленоножка", en: "Common Moorhen", la: "Gallinula chloropus",
    groupe: "eau", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Oiseau d'eau noirâtre (32-35 cm) à la plaque frontale rouge et au bec rouge à pointe jaune, avec une ligne blanche sur le flanc. Nage en hochant la tête et la queue, ce qui montre le dessous blanc de la queue. Étangs, canaux et rivières lentes bordés de végétation.",
    description_en: "Blackish waterbird (32-35 cm) with a red frontal shield, a red bill with a yellow tip and a white line along the flank. Swims jerking its head and tail, showing the white undertail. Ponds, canals and slow rivers fringed with vegetation.",
    description_bg: "Черникава водна птица (32-35 см) с червена челна плочка, червена човка с жълт връх и бяла ивица по хълбока. Плува, като кима с глава и потрепва с опашка, показвайки бялото подопашие. Езера, канали и бавни реки, обрасли с растителност."
  },
  {
    id: "petit-gravelot",
    fr: "Petit Gravelot", bg: "Речен дъждосвирец", en: "Little Ringed Plover", la: "Charadrius dubius",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["eau"], uicn: "LC",
    description: "Petit limicole (14-17 cm) brun sable dessus et blanc dessous, avec un collier et un masque noirs et un cercle jaune vif autour de l'œil. Court par à-coups sur les bancs de gravier des rivières, où il niche à même le sol.",
    description_en: "Small wader (14-17 cm), sandy brown above and white below, with a black collar and mask and a bright yellow eye-ring. Runs in short bursts on river gravel bars, where it nests directly on the ground.",
    description_bg: "Малка брегова птица (14-17 см), пясъчнокафява отгоре и бяла отдолу, с черни яка и маска и ярко жълт пръстен около окото. Тича на пресекулки по чакълестите речни коси, където гнезди направо на земята."
  },
  {
    id: "becasse-des-bois",
    fr: "Bécasse des bois", bg: "Горски бекас", en: "Eurasian Woodcock", la: "Scolopax rusticola",
    groupe: "echassiers", presence: ["passage", "hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret"], uicn: "LC",
    description: "Limicole forestier trapu (33-35 cm) au très long bec droit, au plumage couleur de feuilles mortes et aux bandes sombres en travers du crâne. Très mimétique, on la lève souvent par hasard dans les sous-bois humides ; active à l'aube et au crépuscule.",
    description_en: "Stocky forest wader (33-35 cm) with a very long straight bill, dead-leaf plumage and dark bars across the crown. Superbly camouflaged, it is often flushed by chance in damp woodland; active at dawn and dusk.",
    description_bg: "Набита горска брегова птица (33-35 см) с много дълга права човка, оперение с цвят на сухи листа и тъмни напречни ивици на темето. Отлично маскирана, често излита случайно във влажните гори; активна е на зазоряване и при здрач."
  },
  {
    id: "chevalier-guignette",
    fr: "Chevalier guignette", bg: "Късокрил кюкавец", en: "Common Sandpiper", la: "Actitis hypoleucos",
    groupe: "echassiers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["eau"], uicn: "LC",
    description: "Petit limicole (19-21 cm) brun dessus et blanc dessous, avec une encoche blanche devant l'aile. Hoche sans arrêt l'arrière du corps. Vole au ras de l'eau, ailes arquées et battements saccadés, en lançant un « hi-di-di » aigu.",
    description_en: "Small wader (19-21 cm), brown above and white below, with a white notch in front of the wing. Constantly bobs its rear end. Flies low over the water on bowed wings with flickering beats, giving a shrill “swee-wee-wee”.",
    description_bg: "Малка брегова птица (19-21 см), кафява отгоре и бяла отдолу, с бял клин пред крилото. Непрекъснато поклаща задната част на тялото. Лети ниско над водата с извити крила и пърхащи удари, като издава остро „хи-ди-ди“."
  },
  {
    id: "mouette-rieuse",
    fr: "Mouette rieuse", bg: "Речна чайка", en: "Black-headed Gull", la: "Chroicocephalus ridibundus",
    groupe: "eau", presence: ["hivernant", "passage"], mois: [9, 10, 11, 12, 1, 2, 3, 4],
    habitats: ["eau", "champs"], uicn: "LC",
    description: "Petite mouette (35-39 cm) au bec et aux pattes rouges. Capuchon chocolat au printemps, réduit en hiver à une tache noire derrière l'œil ; en vol, bord avant de l'aile blanc. Suit les rivières et les labours en hiver.",
    description_en: "Small gull (35-39 cm) with a red bill and legs. Chocolate-brown hood in spring, reduced in winter to a black spot behind the eye; in flight, a white leading edge to the wing. Follows rivers and ploughed fields in winter.",
    description_bg: "Малка чайка (35-39 см) с червени човка и крака. През пролетта главата е шоколадовокафява, а през зимата остава само черно петно зад окото; в полет предният ръб на крилото е бял. През зимата следва реките и изораните ниви."
  },

  /* ---------- Pigeons, tourterelles, coucou ---------- */
  {
    id: "pigeon-biset",
    fr: "Pigeon biset", bg: "Скален гълъб", en: "Rock Dove", la: "Columba livia",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Ancêtre du pigeon domestique (31-34 cm) : gris-bleu avec deux barres noires sur l'aile, croupion blanc et reflets verts et pourpres au cou. Les pigeons des villages sont des formes domestiques aux couleurs très variées. Roucoulement grave « rou-rou-rou ».",
    description_en: "Ancestor of the domestic pigeon (31-34 cm): blue-grey with two black wing bars, a white rump and a green and purple sheen on the neck. Village pigeons are domestic forms in very varied colours. Deep cooing “roo-roo-roo”.",
    description_bg: "Прародител на домашния гълъб (31-34 см): синкавосив с две черни ивици на крилото, бял кръст и зелен и пурпурен отблясък на шията. Гълъбите в селата са домашни форми в много разнообразни цветове. Ниско гугукане „гу-гу-гу“."
  },
  {
    id: "pigeon-colombin",
    fr: "Pigeon colombin", bg: "Гълъб хралупар", en: "Stock Dove", la: "Columba oenas",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Pigeon gris-bleu (28-32 cm), plus petit et plus uni que le ramier, sans blanc au cou ni aux ailes, à l'œil sombre. Deux courtes barres noires sur l'aile et bord des ailes sombre en vol. Niche dans les cavités des vieux arbres ; chant « hou-ou » sourd et répété.",
    description_en: "Blue-grey pigeon (28-32 cm), smaller and plainer than the Wood Pigeon, with no white on the neck or wings and a dark eye. Two short black wing bars and dark wing edges in flight. Nests in holes in old trees; a muffled, repeated “oo-oo” song.",
    description_bg: "Синкавосив гълъб (28-32 см), по-малък и по-едноцветен от гривяка, без бяло на шията и крилата и с тъмно око. Две къси черни ивици на крилото и тъмни краища на крилата в полет. Гнезди в хралупи на стари дървета; песента е глухо, повтаряно „ху-у“."
  },
  {
    id: "pigeon-ramier",
    fr: "Pigeon ramier", bg: "Гривяк", en: "Common Wood Pigeon", la: "Columba palumbus",
    groupe: "pigeons", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs", "village"], uicn: "LC",
    description: "Le plus grand pigeon (40-42 cm), gris, avec une tache blanche au cou et une bande blanche en travers de l'aile, très visible en vol. Roucoulement en cinq notes « rou-rou-rou, rou-rou ». Grands vols en migration et en hiver.",
    description_en: "The largest pigeon (40-42 cm), grey, with a white neck patch and a white band across the wing, very visible in flight. Five-note cooing “coo-coo-coo, coo-coo”. Large flocks on migration and in winter.",
    description_bg: "Най-големият гълъб (40-42 см), сив, с бяло петно на шията и бяла напречна ивица на крилото, много видима в полет. Гукане от пет срички „гу-гу-гу, гу-гу“. Големи ята по време на миграцията и през зимата."
  },
  {
    id: "tourterelle-des-bois",
    fr: "Tourterelle des bois", bg: "Гургулица", en: "European Turtle Dove", la: "Streptopelia turtur",
    groupe: "pigeons", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "VU",
    description: "Petite tourterelle (26-28 cm) au manteau roux écaillé de noir, avec des stries noires et blanches sur le côté du cou. Ronronnement doux « tourr-tourr ». Espèce en fort déclin en Europe (chasse, disparition des haies).",
    description_en: "Small dove (26-28 cm) with a rufous mantle scaled with black and black-and-white stripes on the side of the neck. Soft purring “turrr-turrr”. A species in steep decline in Europe (hunting, loss of hedgerows).",
    description_bg: "Малка гургулица (26-28 см) с ръждив гръб на черни люспи и черно-бели ивици отстрани на шията. Меко мъркане „търр-търр“. Вид в силен упадък в Европа (лов, изчезване на живите плетове)."
  },
  {
    id: "tourterelle-turque",
    fr: "Tourterelle turque", bg: "Гугутка", en: "Eurasian Collared Dove", la: "Streptopelia decaocto",
    groupe: "pigeons", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village"], uicn: "LC",
    description: "Tourterelle beige-gris uni (31-33 cm) avec un demi-collier noir sur la nuque. Omniprésente dans les villages ; chant en trois notes « dou-dou-dou », accentué sur la deuxième. A colonisé l'Europe depuis les Balkans au XXe siècle.",
    description_en: "Plain buff-grey dove (31-33 cm) with a black half-collar on the nape. Everywhere in villages; three-note song “coo-COO-coo”, stressed on the second note. It colonised Europe from the Balkans in the 20th century.",
    description_bg: "Едноцветна бежово-сива гугутка (31-33 см) с черна полуяка на тила. Среща се навсякъде в селата; песента е от три срички „гу-ГУ-гу“, с ударение на втората. През XX век е заселила Европа, тръгвайки от Балканите."
  },
  {
    id: "coucou-gris",
    fr: "Coucou gris", bg: "Обикновена кукувица", en: "Common Cuckoo", la: "Cuculus canorus",
    groupe: "divers", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Oiseau gris (32-34 cm) au ventre barré, à longue queue et ailes pointues, qui ressemble en vol à un petit faucon. Le « cou-cou » du mâle s'entend d'avril à juin. La femelle pond dans les nids d'autres passereaux.",
    description_en: "Grey bird (32-34 cm) with a barred belly, a long tail and pointed wings, resembling a small falcon in flight. The male’s “cuck-oo” is heard from April to June. The female lays her eggs in other songbirds’ nests.",
    description_bg: "Сива птица (32-34 см) с набразден корем, дълга опашка и заострени крила, която в полет прилича на малък сокол. „Ку-ку“ на мъжкия се чува от април до юни. Женската снася яйцата си в гнездата на други пойни птици."
  },

  /* ---------- Rapaces nocturnes et engoulevent ---------- */
  {
    id: "effraie-des-clochers",
    fr: "Effraie des clochers", bg: "Забулена сова", en: "Western Barn Owl", la: "Tyto alba",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Chouette pâle (33-39 cm), dorée dessus et blanche dessous, au disque facial en forme de cœur. Niche dans les greniers, les clochers et les granges. Elle ne hulule pas : elle pousse en vol, la nuit, un cri chuintant et rauque.",
    description_en: "Pale owl (33-39 cm), golden above and white below, with a heart-shaped facial disc. Nests in lofts, church towers and barns. It doesn’t hoot: at night, in flight, it gives a hoarse, hissing shriek.",
    description_bg: "Светла сова (33-39 см), златиста отгоре и бяла отдолу, с лицев диск във форма на сърце. Гнезди в тавани, камбанарии и плевни. Не бухти: нощем в полет издава дрезгав, съскащ писък."
  },
  {
    id: "petit-duc-scops",
    fr: "Petit-duc scops", bg: "Чухал", en: "Eurasian Scops Owl", la: "Otus scops",
    groupe: "nocturnes", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["village", "haies"], uicn: "LC",
    description: "Minuscule hibou (19-20 cm) gris-brun à aigrettes, parfaitement camouflé contre l'écorce. On l'entend bien plus qu'on ne le voit : un « tiou » flûté répété toutes les 2 à 3 secondes, toute la nuit au printemps, dans les villages et les vergers.",
    description_en: "Tiny grey-brown owl with ear tufts (19-20 cm), perfectly camouflaged against bark. Heard far more often than seen: a fluted “tyoo” repeated every 2-3 seconds, all night long in spring, in villages and orchards.",
    description_bg: "Мъничка сивокафява сова с ушички от пера (19-20 см), отлично маскирана на фона на кората. Много по-често се чува, отколкото се вижда: флейтово „тю“, повтаряно на всеки 2-3 секунди цяла нощ през пролетта, в селата и овощните градини."
  },
  {
    id: "grand-duc-d-europe",
    fr: "Grand-duc d'Europe", bg: "Бухал", en: "Eurasian Eagle-Owl", la: "Bubo bubo",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "foret"], uicn: "LC",
    description: "Le plus grand hibou (59-73 cm), brun-roux, aux grandes aigrettes et aux yeux orange. Niche dans les falaises, les carrières et les pentes rocheuses. Son chant grave « ou-hou » porte au loin, surtout en fin d'hiver.",
    description_en: "The largest owl (59-73 cm), rufous-brown, with large ear tufts and orange eyes. Nests on cliffs, in quarries and on rocky slopes. Its deep “oo-hoo” song carries far, especially in late winter.",
    description_bg: "Най-голямата сова (59-73 см), ръждивокафява, с големи ушички от пера и оранжеви очи. Гнезди по скали, в кариери и по скалисти склонове. Ниската му песен „у-ху“ се чува надалеч, особено в края на зимата."
  },
  {
    id: "cheveche-d-athena",
    fr: "Chevêche d'Athéna", bg: "Кукумявка", en: "Little Owl", la: "Athene noctua",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Petite chouette trapue (21-23 cm), brune tachetée de blanc, aux yeux jaunes et aux sourcils blancs qui lui donnent un air sévère. Souvent visible de jour sur un toit ou un piquet, en hochant la tête. Cri plaintif « kiou » au crépuscule.",
    description_en: "Small, stocky owl (21-23 cm), brown spotted with white, with yellow eyes and white eyebrows that give it a stern look. Often seen by day on a roof or post, bobbing its head. Plaintive “kyoo” call at dusk.",
    description_bg: "Малка, набита сова (21-23 см), кафява на бели петна, с жълти очи и бели вежди, които ѝ придават строг вид. Често се вижда денем на покрив или кол, като кима с глава. Жалостив зов „кю“ при здрач."
  },
  {
    id: "chouette-hulotte",
    fr: "Chouette hulotte", bg: "Горска улулица", en: "Tawny Owl", la: "Strix aluco",
    groupe: "nocturnes", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Chouette ronde (37-39 cm) sans aigrettes, aux yeux noirs, brun-roux ou grise. Le célèbre hululement « hou… hou-hou-hou-houuu » est celui du mâle ; la femelle répond par un « kiwitt » aigu. Forêts de feuillus, parcs et vieux villages.",
    description_en: "Round owl (37-39 cm) without ear tufts, with black eyes, rufous-brown or grey. The famous hoot “hoo… hoo-hoo-hoo-hoooo” is the male’s; the female answers with a shrill “ke-wick”. Broadleaved forests, parks and old villages.",
    description_bg: "Кръгла сова (37-39 см) без ушички от пера, с черни очи, ръждивокафява или сива. Прочутото бухане „ху… ху-ху-ху-хууу“ е на мъжкия; женската отговаря с остро „кюуит“. Широколистни гори, паркове и стари села."
  },
  {
    id: "hibou-moyen-duc",
    fr: "Hibou moyen-duc", bg: "Горска ушата сова", en: "Long-eared Owl", la: "Asio otus",
    groupe: "nocturnes", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Hibou élancé (35-37 cm) aux longues aigrettes et aux yeux orange, brun strié. En hiver, des dizaines d'individus peuvent se regrouper en dortoir dans les conifères ou les arbres des villages : un beau sujet photo, à condition de ne pas les déranger.",
    description_en: "Slender owl (35-37 cm) with long ear tufts and orange eyes, streaked brown. In winter, dozens of birds may gather at roosts in conifers or village trees: a great photo subject, as long as they are not disturbed.",
    description_bg: "Стройна сова (35-37 см) с дълги ушички от пера и оранжеви очи, кафява на надлъжни ивици. През зимата десетки птици могат да нощуват заедно в иглолистни дървета или в дървета в селата: чудесен обект за снимки, стига да не бъдат безпокоени."
  },
  {
    id: "engoulevent-d-europe",
    fr: "Engoulevent d'Europe", bg: "Обикновен козодой", en: "European Nightjar", la: "Caprimulgus europaeus",
    groupe: "divers", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Oiseau crépusculaire (26-28 cm) au plumage d'écorce, invisible le jour, posé dans l'axe d'une branche. Au crépuscule, le mâle émet pendant des minutes un ronronnement mécanique « errrrr ». En vol, le mâle montre des taches blanches aux ailes et à la queue.",
    description_en: "Twilight bird (26-28 cm) with bark-like plumage, invisible by day as it lies along a branch. At dusk the male churrs mechanically for minutes on end: “errrrr”. In flight, the male shows white spots on the wings and tail.",
    description_bg: "Сумрачна птица (26-28 см) с оперение като кора, невидима през деня, когато лежи по дължината на клон. При здрач мъжкият издава в продължение на минути механично бръмчене „еррррр“. В полет мъжкият показва бели петна по крилата и опашката."
  },

  /* ---------- Martinets, martin-pêcheur, guêpier, rollier, huppe ---------- */
  {
    id: "martinet-noir",
    fr: "Martinet noir", bg: "Черен бързолет", en: "Common Swift", la: "Apus apus",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8],
    habitats: ["village"], uicn: "LC",
    description: "Oiseau entièrement brun-noir (16-17 cm) aux ailes en faux et à la gorge pâle, qui passe sa vie en vol. Ne se pose jamais au sol et niche sous les toits. Des bandes hurlantes « srriii » filent au-dessus des villages de mai à début août.",
    description_en: "All dark brown bird (16-17 cm) with sickle-shaped wings and a pale throat, which spends its life on the wing. Never lands on the ground and nests under roofs. Screaming parties, “srreee”, race over villages from May to early August.",
    description_bg: "Изцяло кафяво-черна птица (16-17 см) със сърповидни крила и светла гуша, която прекарва живота си в полет. Никога не каца на земята и гнезди под покривите. Пищящи групи, „срррии“, прелитат стремглаво над селата от май до началото на август."
  },
  {
    id: "martinet-a-ventre-blanc",
    fr: "Martinet à ventre blanc", bg: "Алпийски бързолет", en: "Alpine Swift", la: "Tachymarptis melba",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne", "village"], uicn: "LC",
    description: "Grand martinet (20-22 cm) brun, au ventre et à la gorge blancs séparés par un collier brun. Vol puissant et très rapide au-dessus des falaises et des gorges. Cri : trille sonore et descendant.",
    description_en: "Large brown swift (20-22 cm) with a white belly and throat separated by a brown collar. Powerful, very fast flight over cliffs and gorges. Call: a loud, descending trill.",
    description_bg: "Голям кафяв бързолет (20-22 см) с бели корем и гуша, разделени от кафява яка. Мощен и много бърз полет над скали и клисури. Зов: звучна, низходяща трел.",
    aVerifier: true,
    note: "Nom bulgare et présence locale (falaises du Balkan et de la Sredna Gora) à confirmer.",
    note_en: "Bulgarian name and local presence (cliffs of the Balkan Mountains and Sredna Gora) to be confirmed.",
    note_bg: "Българското име и местното присъствие (скалите на Стара планина и Средна гора) трябва да се потвърдят."
  },
  {
    id: "martin-pecheur-d-europe",
    fr: "Martin-pêcheur d'Europe", bg: "Земеродно рибарче", en: "Common Kingfisher", la: "Alcedo atthis",
    groupe: "divers", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Petit oiseau (16-17 cm) au dos bleu turquoise éclatant, au ventre orange et au long bec en poignard. Fuse au ras de l'eau en lançant un « tiiih » perçant. Guette les poissons depuis une branche au-dessus de la rivière : un classique pour le photographe.",
    description_en: "Small bird (16-17 cm) with a brilliant turquoise-blue back, orange underparts and a long dagger-like bill. Shoots low over the water giving a piercing “teeee”. Watches for fish from a branch above the river: a classic for photographers.",
    description_bg: "Малка птица (16-17 см) с блестящ тюркоазеносин гръб, оранжев корем и дълга човка като кинжал. Стрелва се ниско над водата с пронизително „тиии“. Дебне рибите от клон над реката: класика за фотографите."
  },
  {
    id: "guepier-d-europe",
    fr: "Guêpier d'Europe", bg: "Обикновен пчелояд", en: "European Bee-eater", la: "Merops apiaster",
    groupe: "divers", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Oiseau multicolore (25-29 cm) : gorge jaune, ventre turquoise, dos roux et doré, longues plumes centrales à la queue. Niche en colonies dans des terriers creusés dans les talus sableux. Son cri roulé « prruit » s'entend souvent avant de voir les oiseaux.",
    description_en: "Multicoloured bird (25-29 cm): yellow throat, turquoise underparts, chestnut and golden back, long central tail feathers. Nests in colonies in burrows dug into sandy banks. Its rolling “prruit” call is often heard before the birds are seen.",
    description_bg: "Пъстра птица (25-29 см): жълта гуша, тюркоазен корем, кестеняв и златист гръб, дълги централни пера на опашката. Гнезди на колонии в дупки, изкопани в пясъчни откоси. Търкалящият се зов „пррюит“ често се чува, преди птиците да се видят."
  },
  {
    id: "rollier-d-europe",
    fr: "Rollier d'Europe", bg: "Синявица", en: "European Roller", la: "Coracias garrulus",
    groupe: "divers", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Oiseau de la taille d'un geai (29-32 cm), bleu azur et turquoise avec le dos roux et les rémiges bleu-noir. Chasse les gros insectes depuis les fils électriques et les arbres isolés des plaines. Cri rauque « rak-rak ».",
    description_en: "Jay-sized bird (29-32 cm), azure and turquoise with a chestnut back and blue-black flight feathers. Hunts large insects from power lines and isolated trees in the plains. Harsh “rak-rak” call.",
    description_bg: "Птица с размерите на сойка (29-32 см), лазурносиня и тюркоазена, с кестеняв гръб и синьо-черни махови пера. Лови едри насекоми от електрическите жици и самотните дървета в равнините. Дрезгав зов „рак-рак“."
  },
  {
    id: "huppe-fasciee",
    fr: "Huppe fasciée", bg: "Папуняк", en: "Eurasian Hoopoe", la: "Upupa epops",
    groupe: "divers", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9],
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Oiseau rose-orangé (25-29 cm) aux ailes rayées de noir et de blanc, à la huppe érectile et au long bec arqué. Fouille le sol des prairies et des vergers. Son chant doux « houp-houp-houp » lui a donné son nom.",
    description_en: "Pinkish-orange bird (25-29 cm) with black-and-white barred wings, an erectile crest and a long curved bill. Probes the ground in meadows and orchards. Its soft “hoop-hoop-hoop” song gave it its name.",
    description_bg: "Розово-оранжева птица (25-29 см) с черно-бели ивици на крилата, качулка, която може да изправя, и дълга извита човка. Рови в почвата на ливадите и овощните градини. Мекият му зов „хуп-хуп-хуп“ е дал името му на много езици."
  },

  /* ---------- Pics ---------- */
  {
    id: "torcol-fourmilier",
    fr: "Torcol fourmilier", bg: "Въртошийка", en: "Eurasian Wryneck", la: "Jynx torquilla",
    groupe: "pics", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "village"], uicn: "LC",
    description: "Pic atypique (16-18 cm) au plumage d'écorce gris-brun finement vermiculé, qui ne frappe pas le bois. Se nourrit de fourmis au sol. Chant plaintif et nasillard « kyé-kyé-kyé » au printemps ; tord le cou comme un serpent s'il est dérangé.",
    description_en: "Atypical woodpecker (16-18 cm) with bark-like, finely vermiculated grey-brown plumage, which does not drum on wood. Feeds on ants on the ground. Plaintive, nasal “kyee-kyee-kyee” song in spring; twists its neck like a snake when disturbed.",
    description_bg: "Нетипичен кълвач (16-18 см) с оперение като кора, сивокафяво с фини вълнисти шарки, който не кълве дървото. Храни се с мравки на земята. Жалостива, носова песен „кие-кие-кие“ през пролетта; ако бъде обезпокоен, извива шия като змия."
  },
  {
    id: "pic-cendre",
    fr: "Pic cendré", bg: "Сив кълвач", en: "Grey-headed Woodpecker", la: "Picus canus",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Pic vert-gris (27-30 cm) à la tête grise, plus petit que le Pic vert, avec une fine moustache noire ; le mâle n'a qu'une tache rouge au front. Chant : série de sifflements mélancoliques qui ralentissent et descendent. Forêts de feuillus et bords de rivières boisés.",
    description_en: "Grey-green woodpecker (27-30 cm) with a grey head, smaller than the Green Woodpecker, with a thin black moustache; the male has only a red patch on the forehead. Song: a series of melancholy whistles that slow down and fall in pitch. Broadleaved forests and wooded riverbanks.",
    description_bg: "Сиво-зелен кълвач (27-30 см) със сива глава, по-малък от зеления кълвач, с тънък черен „мустак“; мъжкият има само червено петно на челото. Песен: поредица от меланхолични подсвирквания, които се забавят и понижават. Широколистни гори и залесени речни брегове."
  },
  {
    id: "pic-vert",
    fr: "Pic vert", bg: "Зелен кълвач", en: "European Green Woodpecker", la: "Picus viridis",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Grand pic vert (31-33 cm) à calotte rouge et masque noir, au croupion jaune bien visible pendant son vol onduleux. Se nourrit souvent au sol de fourmis. Son cri éclatant « plu-plu-plu-plu » ressemble à un rire.",
    description_en: "Large green woodpecker (31-33 cm) with a red crown and a black mask, and a yellow rump that shows well in its undulating flight. Often feeds on ants on the ground. Its ringing “plue-plue-plue-plue” call sounds like laughter.",
    description_bg: "Голям зелен кълвач (31-33 см) с червено теме, черна маска и жълт кръст, който се вижда добре при вълнообразния му полет. Често се храни с мравки на земята. Звънкият му зов „плю-плю-плю-плю“ напомня смях."
  },
  {
    id: "pic-noir",
    fr: "Pic noir", bg: "Черен кълвач", en: "Black Woodpecker", la: "Dryocopus martius",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Le plus grand pic d'Europe (40-46 cm), entièrement noir, à l'œil pâle ; calotte rouge chez le mâle, simple tache à l'arrière chez la femelle. Cri « kri-kri-kri » en vol, « kliuu » miaulé une fois posé. Creuse de grandes loges ovales dans les vieux hêtres.",
    description_en: "Europe’s largest woodpecker (40-46 cm), all black with a pale eye; red crown in the male, just a patch at the back of the head in the female. “Kri-kri-kri” call in flight, a mewing “klee-oo” when perched. Excavates large oval holes in old beeches.",
    description_bg: "Най-големият кълвач в Европа (40-46 см), изцяло черен, със светло око; мъжкият е с червено теме, а женската има само петно на тила. Зов „кри-кри-кри“ в полет и мяукащо „клиюю“, когато е кацнал. Издълбава големи овални хралупи в старите букове."
  },
  {
    id: "pic-epeiche",
    fr: "Pic épeiche", bg: "Голям пъстър кълвач", en: "Great Spotted Woodpecker", la: "Dendrocopos major",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Le pic noir et blanc le plus commun (22-23 cm), avec de grandes taches blanches aux épaules et le dessous de la queue rouge vif ; le mâle a une tache rouge à la nuque et les jeunes une calotte rouge. Tambourine brièvement et fort ; cri sec « kix ».",
    description_en: "The commonest black-and-white woodpecker (22-23 cm), with large white shoulder patches and a bright red undertail; the male has a red patch on the nape and young birds a red crown. Drums briefly and loudly; sharp “kix” call.",
    description_bg: "Най-обикновеният черно-бял кълвач (22-23 см), с големи бели петна на раменете и яркочервено подопашие; мъжкият има червено петно на тила, а младите – червено теме. Барабани кратко и силно; рязък зов „кикс“."
  },
  {
    id: "pic-syriaque",
    fr: "Pic syriaque", bg: "Сирийски пъстър кълвач", en: "Syrian Woodpecker", la: "Dendrocopos syriacus",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Très proche du Pic épeiche (23-25 cm), mais sans la barre noire qui relie la moustache à la nuque (joue blanche « ouverte ») et avec le dessous de la queue rose pâle. Typique des villages, vergers et parcs de Bulgarie.",
    description_en: "Very similar to the Great Spotted Woodpecker (23-25 cm), but without the black bar joining the moustache to the nape (“open” white cheek) and with a pale pink undertail. Typical of villages, orchards and parks in Bulgaria.",
    description_bg: "Много прилича на големия пъстър кълвач (23-25 см), но без черната ивица, която свързва „мустака“ с тила („отворена“ бяла буза), и с бледорозово подопашие. Типичен за селата, овощните градини и парковете в България."
  },
  {
    id: "pic-mar",
    fr: "Pic mar", bg: "Среден пъстър кълвач", en: "Middle Spotted Woodpecker", la: "Dendrocoptes medius",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Pic noir et blanc (20-22 cm) à calotte entièrement rouge chez les deux sexes, à la face très blanche, aux flancs striés et au dessous de la queue rose. Tambourine rarement ; chant nasillard « couin-couin » au printemps. Spécialiste des vieilles chênaies.",
    description_en: "Black-and-white woodpecker (20-22 cm) with an all-red crown in both sexes, a very white face, streaked flanks and a pink undertail. Rarely drums; nasal “kwaik-kwaik” song in spring. A specialist of old oak woods.",
    description_bg: "Черно-бял кълвач (20-22 см) с изцяло червено теме и при двата пола, много бяло лице, напетнени хълбоци и розово подопашие. Рядко барабани; носова песен „куейк-куейк“ през пролетта. Специалист на старите дъбови гори."
  },
  {
    id: "pic-a-dos-blanc",
    fr: "Pic à dos blanc", bg: "Белогръб кълвач", en: "White-backed Woodpecker", la: "Dendrocopos leucotos",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Grand pic noir et blanc (24-26 cm) au bas du dos blanc, sans taches blanches aux épaules, aux ailes largement barrées de blanc et aux flancs striés ; calotte rouge chez le mâle. Vit dans les vieilles hêtraies riches en bois mort.",
    description_en: "Large black-and-white woodpecker (24-26 cm) with a white lower back, no white shoulder patches, broadly white-barred wings and streaked flanks; red crown in the male. Lives in old beech woods rich in dead wood.",
    description_bg: "Голям черно-бял кълвач (24-26 см) с бяла долна част на гърба, без бели петна на раменете, с широки бели ивици по крилата и напетнени хълбоци; мъжкият е с червено теме. Живее в стари букови гори, богати на мъртва дървесина.",
    aVerifier: true,
    note: "Présence en Sredna Gora (vieilles hêtraies) à confirmer.",
    note_en: "Presence in Sredna Gora (old beech woods) to be confirmed.",
    note_bg: "Присъствието в Средна гора (стари букови гори) трябва да се потвърди."
  },
  {
    id: "pic-epeichette",
    fr: "Pic épeichette", bg: "Малък пъстър кълвач", en: "Lesser Spotted Woodpecker", la: "Dryobates minor",
    groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "eau"], uicn: "LC",
    description: "Le plus petit pic (14-16 cm), de la taille d'un moineau, au dos barré de noir et de blanc et sans rouge sous la queue ; calotte rouge chez le mâle. Discret, souvent dans le haut des arbres, bords de rivières et vergers. Chant : série de « ki-ki-ki » aigus.",
    description_en: "The smallest woodpecker (14-16 cm), sparrow-sized, with a back barred black and white and no red under the tail; red crown in the male. Unobtrusive, often high in the trees, along riverbanks and in orchards. Song: a series of high “kee-kee-kee”.",
    description_bg: "Най-малкият кълвач (14-16 см), колкото врабче, с черно-бели напречни ивици на гърба и без червено под опашката; мъжкият е с червено теме. Потаен, често във високите части на дърветата, край реки и в овощни градини. Песен: поредица от високи „ки-ки-ки“."
  },

  /* ---------- Alouettes et hirondelles ---------- */
  {
    id: "cochevis-huppe",
    fr: "Cochevis huppé", bg: "Качулата чучулига", en: "Crested Lark", la: "Galerida cristata",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Alouette trapue (17-19 cm), brun-beige, à la huppe pointue toujours visible. Fréquente les bords de routes, les terrains vagues et les cours de ferme. Chant mélodieux et flûté ; cri « tu-tu-trui ».",
    description_en: "Stocky lark (17-19 cm), buff-brown, with a pointed crest that is always visible. Frequents roadsides, wasteland and farmyards. Melodious, fluting song; “too-too-tree” call.",
    description_bg: "Набита чучулига (17-19 см), кафеникаво-бежова, със заострена качулка, която винаги се вижда. Среща се край пътищата, по пустеещи терени и в селските дворове. Мелодична, флейтова песен; зов „ту-ту-трюи“."
  },
  {
    id: "alouette-lulu",
    fr: "Alouette lulu", bg: "Горска чучулига", en: "Woodlark", la: "Lullula arborea",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies", "foret"], uicn: "LC",
    description: "Petite alouette (15 cm) à queue courte, aux sourcils crème qui se rejoignent sur la nuque et avec une petite marque noire et blanche au bord de l'aile. Magnifique chant en vol qui descend en cascade « lu-lu-lu-lu ». Pâtures boisées et lisières des collines.",
    description_en: "Small, short-tailed lark (15 cm) with creamy eyebrows that meet on the nape and a small black-and-white mark on the edge of the wing. Beautiful song in flight, falling in a cascade: “loo-loo-loo-loo”. Wooded pastures and hillside woodland edges.",
    description_bg: "Малка чучулига с къса опашка (15 см), с кремави вежди, които се събират на тила, и малък черно-бял белег на ръба на крилото. Прекрасна песен в полет, която се спуска каскадно: „лю-лю-лю-лю“. Пасища с дървета и горски окрайнини по хълмовете."
  },
  {
    id: "alouette-des-champs",
    fr: "Alouette des champs", bg: "Полска чучулига", en: "Eurasian Skylark", la: "Alauda arvensis",
    groupe: "passereaux", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Alouette brune striée (18-19 cm) à petite huppe, avec les bords de la queue blancs. Le mâle chante longuement en montant très haut dans le ciel, en vol sur place. Grandes troupes en hiver dans les champs.",
    description_en: "Streaked brown lark (18-19 cm) with a small crest and white outer tail feathers. The male sings for long periods while climbing very high into the sky and hovering. Large flocks in fields in winter.",
    description_bg: "Кафява чучулига на ивици (18-19 см) с малка качулка и бели крайни пера на опашката. Мъжкият пее продължително, като се издига много високо в небето и пърха на място. През зимата големи ята в нивите."
  },
  {
    id: "hirondelle-de-rochers",
    fr: "Hirondelle de rochers", bg: "Скална лястовица", en: "Eurasian Crag Martin", la: "Ptyonoprogne rupestris",
    groupe: "martinets", presence: ["estivant"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["montagne"], uicn: "LC",
    description: "Hirondelle trapue (14-15 cm) brun-gris uni, sans blanc au croupion, avec des taches blanches visibles sur la queue étalée. Vol plané le long des falaises, des gorges et des ponts. Niche sous les surplombs rocheux.",
    description_en: "Stocky, plain grey-brown martin (14-15 cm) with no white rump and with white spots visible on the spread tail. Glides along cliffs, gorges and bridges. Nests under rocky overhangs.",
    description_bg: "Набита, едноцветно сивокафява лястовица (14-15 см), без бял кръст, с бели петна, които се виждат на разперената опашка. Плъзга се във въздуха покрай скали, клисури и мостове. Гнезди под скални надвеси."
  },
  {
    id: "hirondelle-rustique",
    fr: "Hirondelle rustique", bg: "Селска лястовица", en: "Barn Swallow", la: "Hirundo rustica",
    groupe: "martinets", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["village", "champs"], uicn: "LC",
    description: "Hirondelle bleu-noir dessus (17-19 cm, filets compris) à la gorge rouge brique et aux longs filets de queue. Niche à l'intérieur des étables et des granges. Gazouillis rapide entrecoupé d'un roulement.",
    description_en: "Swallow, blue-black above (17-19 cm including streamers), with a brick-red throat and long tail streamers. Nests inside cowsheds and barns. Fast twittering song interspersed with a rattle.",
    description_bg: "Лястовица, синьо-черна отгоре (17-19 см заедно с дългите пера на опашката), с тухленочервена гуша и дълги външни пера на опашката. Гнезди вътре в оборите и плевните. Бързо чуруликане, прекъсвано от тракаща трел."
  },
  {
    id: "hirondelle-rousseline",
    fr: "Hirondelle rousseline", bg: "Червенокръста лястовица", en: "Red-rumped Swallow", la: "Cecropis daurica",
    groupe: "martinets", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Hirondelle (16-17 cm) au croupion et à la nuque roux-orangé, au dessous finement strié et à la queue fourchue sans tache blanche. Construit sous les ponts et les surplombs un nid de boue en forme de bouteille, avec un tunnel d'entrée.",
    description_en: "Swallow (16-17 cm) with a rufous-orange rump and nape, finely streaked underparts and a forked tail without white spots. Builds a bottle-shaped mud nest with an entrance tunnel under bridges and overhangs.",
    description_bg: "Лястовица (16-17 см) с ръждивооранжеви кръст и тил, фино напетнена долна страна и вилообразна опашка без бели петна. Под мостовете и надвесите строи кално гнездо във форма на бутилка с входен тунел."
  },
  {
    id: "hirondelle-de-fenetre",
    fr: "Hirondelle de fenêtre", bg: "Градска лястовица", en: "Western House Martin", la: "Delichon urbicum",
    groupe: "martinets", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["village"], uicn: "LC",
    description: "Petite hirondelle (13-15 cm) bleu-noir dessus avec un croupion blanc éclatant et le dessous blanc pur ; queue peu fourchue. Niche en colonies sous les avant-toits, dans des nids de boue fermés.",
    description_en: "Small martin (13-15 cm), blue-black above with a gleaming white rump and pure white underparts; shallowly forked tail. Nests in colonies under eaves, in closed mud nests.",
    description_bg: "Малка лястовица (13-15 см), синьо-черна отгоре, с бляскаво бял кръст и чисто бяла долна страна; опашката е слабо врязана. Гнезди на колонии под стрехите, в затворени кални гнезда."
  },

  /* ---------- Pipits, bergeronnettes, jaseur, cincle, troglodyte ---------- */
  {
    id: "pipit-des-arbres",
    fr: "Pipit des arbres", bg: "Горска бъбрица", en: "Tree Pipit", la: "Anthus trivialis",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "foret", "champs"], uicn: "LC",
    description: "Pipit brun-olive (15 cm) à la poitrine chamoisée nettement striée. Le mâle chante en s'élevant depuis un arbre puis redescend en parachute, ailes ouvertes, en terminant par des « tsia-tsia-tsia ». Clairières et lisières.",
    description_en: "Olive-brown pipit (15 cm) with a buff, boldly streaked breast. The male sings as it rises from a tree, then parachutes down with open wings, ending with “seea-seea-seea”. Clearings and woodland edges.",
    description_bg: "Маслиненокафява бъбрица (15 см) с охрени гърди с ясни надлъжни петна. Мъжкият пее, като се издига от дърво, а после се спуска като парашут с разперени крила, завършвайки с „сиа-сиа-сиа“. Поляни и горски окрайнини."
  },
  {
    id: "pipit-farlouse",
    fr: "Pipit farlouse", bg: "Ливадна бъбрица", en: "Meadow Pipit", la: "Anthus pratensis",
    groupe: "passereaux", presence: ["hivernant", "passage"], mois: [10, 11, 12, 1, 2, 3, 4],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Petit pipit (14-15 cm) brun-olive strié, très semblable au Pipit des arbres mais plus grêle, aux flancs plus striés et à l'ongle arrière long. Cri fin « ist-ist » à l'envol. En hiver, en petites troupes dans les prés humides et les labours.",
    description_en: "Small streaked olive-brown pipit (14-15 cm), very like the Tree Pipit but slighter, with more streaked flanks and a long hind claw. Thin “ist-ist” call when flushed. In winter, in small flocks in wet meadows and ploughed fields.",
    description_bg: "Малка маслиненокафява бъбрица на ивици (14-15 см), много подобна на горската бъбрица, но по-слаба, с по-напетнени хълбоци и дълъг заден нокът. Тънък зов „ист-ист“ при излитане. През зимата на малки ята във влажни ливади и изорани ниви.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (classé NT en 2015, LC depuis ?).",
    note_en: "Global IUCN status to be confirmed (listed NT in 2015, LC since then?).",
    note_bg: "Световният статус по IUCN трябва да се потвърди (NT през 2015 г., LC след това?)."
  },
  {
    id: "pipit-rousseline",
    fr: "Pipit rousseline", bg: "Полска бъбрица", en: "Tawny Pipit", la: "Anthus campestris",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "montagne"], uicn: "LC",
    description: "Grand pipit pâle (16-18 cm), couleur sable presque uni, avec un sourcil crème marqué et une rangée de taches sombres sur l'aile. Sa silhouette rappelle une bergeronnette. Pâturages secs et pentes pierreuses ; chant monotone « tchir-li ».",
    description_en: "Large, pale pipit (16-18 cm), almost plain and sandy-coloured, with a bold creamy eyebrow and a row of dark spots on the wing. Its shape recalls a wagtail. Dry pastures and stony slopes; monotonous “chir-lee” song.",
    description_bg: "Голяма светла бъбрица (16-18 см), почти едноцветна, с пясъчен цвят, ясна кремава вежда и редица тъмни петна на крилото. Силуетът ѝ напомня стърчиопашка. Сухи пасища и каменисти склонове; монотонна песен „чир-ли“."
  },
  {
    id: "bergeronnette-printaniere",
    fr: "Bergeronnette printanière", bg: "Жълта стърчиопашка", en: "Western Yellow Wagtail", la: "Motacilla flava",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "eau"], uicn: "LC",
    description: "Bergeronnette (15-16 cm) au ventre jaune vif et au dos vert olive. En Bulgarie niche surtout la forme à tête noire (« feldegg ») ; d'autres formes à tête grise ou bleue passent en migration. Suit le bétail dans les prés humides.",
    description_en: "Wagtail (15-16 cm) with a bright yellow belly and an olive-green back. In Bulgaria the black-headed form (“feldegg”) is the main breeder; other forms with grey or blue heads pass through on migration. Follows cattle in wet meadows.",
    description_bg: "Стърчиопашка (15-16 см) с яркожълт корем и маслиненозелен гръб. В България гнезди главно черноглавата форма („feldegg“); други форми със сиви или сини глави преминават по време на миграцията. Следва добитъка във влажните ливади."
  },
  {
    id: "bergeronnette-des-ruisseaux",
    fr: "Bergeronnette des ruisseaux", bg: "Планинска стърчиопашка", en: "Grey Wagtail", la: "Motacilla cinerea",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau"], uicn: "LC",
    description: "Bergeronnette (17-20 cm) à très longue queue, gris ardoise dessus et jaune soufre dessous, surtout sous la queue ; le mâle a la gorge noire au printemps. Toujours près des torrents et des ruisseaux, sur les pierres. Cri sec « tsi-tsi ».",
    description_en: "Very long-tailed wagtail (17-20 cm), slate-grey above and sulphur-yellow below, especially under the tail; the male has a black throat in spring. Always near mountain torrents and streams, on the stones. Sharp “tsi-tsi” call.",
    description_bg: "Стърчиопашка с много дълга опашка (17-20 см), аспидносива отгоре и серножълта отдолу, особено под опашката; мъжкият има черна гуша през пролетта. Винаги край бързеи и потоци, по камъните. Рязък зов „ци-ци“."
  },
  {
    id: "bergeronnette-grise",
    fr: "Bergeronnette grise", bg: "Бяла стърчиопашка", en: "White Wagtail", la: "Motacilla alba",
    groupe: "passereaux", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["village", "eau", "champs"], uicn: "LC",
    description: "Bergeronnette noire, grise et blanche (17-19 cm) à longue queue qu'elle agite sans cesse. Court sur les toits, les routes et les berges en attrapant des insectes. Vol onduleux ; cri « tsi-lit ».",
    description_en: "Black, grey and white wagtail (17-19 cm) with a long tail that it wags constantly. Runs on roofs, roads and riverbanks catching insects. Undulating flight; “tsee-lit” call.",
    description_bg: "Черно-сиво-бяла стърчиопашка (17-19 см) с дълга опашка, която непрекъснато поклаща. Тича по покривите, пътищата и бреговете, като лови насекоми. Вълнообразен полет; зов „ци-лит“."
  },
  {
    id: "jaseur-boreal",
    fr: "Jaseur boréal", bg: "Копринарка", en: "Bohemian Waxwing", la: "Bombycilla garrulus",
    groupe: "passereaux", presence: ["hivernant"], mois: [11, 12, 1, 2, 3],
    habitats: ["village", "haies"], uicn: "LC",
    description: "Oiseau rose-beige (18-21 cm) à huppe, masque et gorge noirs, aux ailes ornées de « gouttes de cire » rouges et de jaune. Hivernant irrégulier venu du nord : certaines années, des bandes envahissent les arbres à baies des villages.",
    description_en: "Pinkish-buff bird (18-21 cm) with a crest, a black mask and throat, and wings decorated with red “wax droplets” and yellow. An irregular winter visitor from the north: in some years, flocks invade the berry trees in villages.",
    description_bg: "Розово-бежова птица (18-21 см) с качулка, черни маска и гуша и крила, украсени с червени „восъчни капчици“ и жълто. Нередовен зимен гост от север: в някои години ята нахлуват по дърветата с плодове в селата."
  },
  {
    id: "cincle-plongeur",
    fr: "Cincle plongeur", bg: "Воден кос", en: "White-throated Dipper", la: "Cinclus cinclus",
    groupe: "passereaux", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["eau", "montagne"], uicn: "LC",
    description: "Passereau trapu (17-20 cm) brun-noir à large bavette blanche, qui marche sous l'eau des torrents pour chasser les larves. Perché sur une pierre, il fait des « révérences ». Vole vite au ras de l'eau en lançant un « zit ».",
    description_en: "Stocky songbird (17-20 cm), blackish-brown with a broad white bib, which walks underwater in mountain torrents to hunt larvae. Perched on a stone, it bobs up and down as if bowing. Flies fast and low over the water calling “zit”.",
    description_bg: "Набита пойна птица (17-20 см), черникавокафява с широк бял „лигавник“, която ходи под водата в бързеите, за да лови ларви. Кацнала на камък, тя прави „реверанси“. Лети бързо и ниско над водата, като издава „зит“."
  },
  {
    id: "troglodyte-mignon",
    fr: "Troglodyte mignon", bg: "Орехче", en: "Eurasian Wren", la: "Troglodytes troglodytes",
    groupe: "passereaux", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "eau"], uicn: "LC",
    description: "Minuscule boule brune (9-10 cm) à la queue courte toujours dressée. Son chant, en trilles explosifs, est d'une puissance étonnante pour sa taille. Se faufile dans les broussailles, les tas de bois et au bord des ruisseaux.",
    description_en: "Tiny brown ball (9-10 cm) with a short tail that is always cocked. Its song, made of explosive trills, is astonishingly loud for its size. Creeps through undergrowth, woodpiles and streamsides.",
    description_bg: "Мъничко кафяво топче (9-10 см) с къса, винаги вирната опашка. Песента му от експлозивни трели е изненадващо силна за размерите му. Промъква се из храсталаците, купчините дърва и край потоците."
  },
  {
    id: "accenteur-mouchet",
    fr: "Accenteur mouchet", bg: "Сивогуша завирушка", en: "Dunnock", la: "Prunella modularis",
    groupe: "passereaux", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["haies", "foret"], uicn: "LC",
    description: "Passereau discret (13-14 cm) qui ressemble à un moineau, mais au bec fin, à la tête et la poitrine gris ardoise et aux flancs striés. Se déplace au sol en sautillant près des buissons. Niche dans les forêts de montagne et descend en plaine l'hiver.",
    description_en: "Unobtrusive songbird (13-14 cm) resembling a sparrow but with a fine bill, a slate-grey head and breast and streaked flanks. Hops on the ground near bushes. Breeds in mountain forests and comes down to the lowlands in winter.",
    description_bg: "Незабележима пойна птица (13-14 см), която прилича на врабче, но с тънка човка, аспидносиви глава и гърди и напетнени хълбоци. Подскача по земята край храстите. Гнезди в планинските гори, а през зимата слиза в равнините."
  },

  /* ---------- Rougegorge, rossignol, rougequeues, traquets, grives ---------- */
  {
    id: "rougegorge-familier",
    fr: "Rougegorge familier", bg: "Червеногръдка", en: "European Robin", la: "Erithacus rubecula",
    groupe: "grives", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Petit passereau rond (12,5-14 cm) à la face et la poitrine orange bordées de gris et au dos brun. Chante toute l'année, même en hiver, une mélodie fluide et mélancolique. Curieux, il suit souvent le jardinier ou le promeneur.",
    description_en: "Small, round songbird (12.5-14 cm) with an orange face and breast edged with grey and a brown back. Sings all year round, even in winter, a flowing, melancholy melody. Curious, it often follows gardeners and walkers.",
    description_bg: "Малка, закръглена пойна птица (12,5-14 см) с оранжеви лице и гърди, обрамчени със сиво, и кафяв гръб. Пее през цялата година, дори през зимата, плавна и меланхолична мелодия. Любопитна, често следва градинаря или разхождащия се."
  },
  {
    id: "rossignol-philomele",
    fr: "Rossignol philomèle", bg: "Южен славей", en: "Common Nightingale", la: "Luscinia megarhynchos",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "eau", "foret"], uicn: "LC",
    description: "Passereau brun (15-16,5 cm) à la queue roux vif, discret dans les fourrés. Son chant puissant et varié, avec des crescendos « piou-piou-piou » et des notes claquantes, retentit de jour comme de nuit d'avril à juin. Très commun dans les haies et les bois de rivière en Bulgarie.",
    description_en: "Brown songbird (15-16.5 cm) with a bright rufous tail, keeping out of sight in thickets. Its powerful, varied song, with “piu-piu-piu” crescendos and clicking notes, rings out day and night from April to June. Very common in hedges and riverside woods in Bulgaria.",
    description_bg: "Кафява пойна птица (15-16,5 см) с яркоръждива опашка, която се крие в гъсталаците. Мощната ѝ и разнообразна песен с кресчендо „пю-пю-пю“ и щракащи звуци се чува денем и нощем от април до юни. Много е разпространена в живите плетове и крайречните гори в България."
  },
  {
    id: "rougequeue-noir",
    fr: "Rougequeue noir", bg: "Домашна червеноопашка", en: "Black Redstart", la: "Phoenicurus ochruros",
    groupe: "grives", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["village", "montagne"], uicn: "LC",
    description: "Passereau (14-15 cm) à la queue rousse frémissante. Le mâle est gris-noir avec une tache blanche sur l'aile ; la femelle est gris-brun uni. Son chant grinçant, comme du papier froissé, est lancé du haut des toits. Quelques-uns passent l'hiver en plaine.",
    description_en: "Songbird (14-15 cm) with a quivering rufous tail. The male is grey-black with a white wing patch; the female is plain grey-brown. Its scratchy song, like crumpled paper, is delivered from rooftops. A few spend the winter in the lowlands.",
    description_bg: "Пойна птица (14-15 см) с трептяща ръждива опашка. Мъжкият е сиво-черен с бяло петно на крилото; женската е едноцветно сивокафява. Скърцащата ѝ песен, като смачкана хартия, се чува от покривите. Някои птици зимуват в равнините."
  },
  {
    id: "rougequeue-a-front-blanc",
    fr: "Rougequeue à front blanc", bg: "Градинска червеноопашка", en: "Common Redstart", la: "Phoenicurus phoenicurus",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Passereau élégant (13-14,5 cm) à queue rousse. Le mâle a la face et la gorge noires, le front blanc, la poitrine orange et le dos gris ; la femelle est brun-beige. Vieux vergers, parcs et forêts claires.",
    description_en: "Elegant songbird (13-14.5 cm) with a rufous tail. The male has a black face and throat, a white forehead, an orange breast and a grey back; the female is buff-brown. Old orchards, parks and open forests.",
    description_bg: "Елегантна пойна птица (13-14,5 см) с ръждива опашка. Мъжкият има черни лице и гуша, бяло чело, оранжеви гърди и сив гръб; женската е кафеникаво-бежова. Стари овощни градини, паркове и светли гори."
  },
  {
    id: "tarier-des-pres",
    fr: "Tarier des prés", bg: "Ръждивогушо ливадно каменарче", en: "Whinchat", la: "Saxicola rubetra",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["champs"], uicn: "LC",
    description: "Petit passereau (12-14 cm) brun strié à large sourcil blanc et poitrine orangée, avec du blanc à la base de la queue. Se perche bien en vue au sommet des hautes herbes et des clôtures. Surtout de passage en plaine ; niche dans les prairies de montagne.",
    description_en: "Small streaked brown songbird (12-14 cm) with a broad white eyebrow, an orange breast and white at the base of the tail. Perches conspicuously on top of tall grass and fences. Mostly on passage in the lowlands; breeds in mountain meadows.",
    description_bg: "Малка кафява пойна птица на ивици (12-14 см) с широка бяла вежда, оранжеви гърди и бяло в основата на опашката. Каца на видно място по върховете на високите треви и оградите. В равнините се вижда главно по време на прелета; гнезди в планинските ливади."
  },
  {
    id: "tarier-patre",
    fr: "Tarier pâtre", bg: "Черногушо ливадно каменарче", en: "European Stonechat", la: "Saxicola rubicola",
    groupe: "grives", presence: ["estivant", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Petit passereau trapu (11,5-13 cm). Le mâle a la tête noire, un demi-collier blanc et la poitrine orange ; la femelle est plus brune. Se tient au sommet des buissons en lançant un « tsac-tsac » de cailloux heurtés. Friches et pâtures ; quelques-uns hivernent.",
    description_en: "Small, stocky songbird (11.5-13 cm). The male has a black head, a white half-collar and an orange breast; the female is browner. Sits on top of bushes giving a “tsak-tsak” like two pebbles knocked together. Fallow land and pastures; a few winter here.",
    description_bg: "Малка, набита пойна птица (11,5-13 см). Мъжкият има черна глава, бяла полуяка и оранжеви гърди; женската е по-кафява. Стои по върховете на храстите и издава „цак-цак“, като удряни едно в друго камъчета. Запустели земи и пасища; някои зимуват."
  },
  {
    id: "traquet-motteux",
    fr: "Traquet motteux", bg: "Сиво каменарче", en: "Northern Wheatear", la: "Oenanthe oenanthe",
    groupe: "grives", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["montagne", "champs"], uicn: "LC",
    description: "Passereau terrestre (14,5-16 cm) au croupion blanc et à la queue blanche marquée d'un « T » noir renversé. Le mâle est gris dessus avec un masque noir. Se tient bien droit sur les pierres des pâturages et des pentes rocailleuses.",
    description_en: "Ground-dwelling songbird (14.5-16 cm) with a white rump and a white tail marked with a black inverted “T”. The male is grey above with a black mask. Stands upright on stones in pastures and on rocky slopes.",
    description_bg: "Наземна пойна птица (14,5-16 см) с бял кръст и бяла опашка с черно обърнато „Т“. Мъжкият е сив отгоре с черна маска. Стои изправено върху камъните на пасищата и скалистите склонове."
  },
  {
    id: "monticole-de-roche",
    fr: "Monticole de roche", bg: "Скален дрозд", en: "Common Rock Thrush", la: "Monticola saxatilis",
    groupe: "grives", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["montagne"], uicn: "LC",
    description: "Grive des pentes rocheuses (17-20 cm). Le mâle est superbe : tête bleu-gris, tache blanche sur le dos, poitrine et queue orange vif ; la femelle est brune et écaillée. Chante en vol ou depuis un rocher.",
    description_en: "Thrush of rocky slopes (17-20 cm). The male is superb: blue-grey head, white patch on the back, bright orange breast and tail; the female is brown and scaly. Sings in flight or from a rock.",
    description_bg: "Дрозд на скалистите склонове (17-20 см). Мъжкият е великолепен: синкавосива глава, бяло петно на гърба, яркооранжеви гърди и опашка; женската е кафява и на люспи. Пее в полет или от скала.",
    aVerifier: true,
    note: "Présence dans les zones rocheuses de la Sredna Gora à confirmer.",
    note_en: "Presence in the rocky areas of Sredna Gora to be confirmed.",
    note_bg: "Присъствието в скалистите райони на Средна гора трябва да се потвърди."
  },
  {
    id: "merle-noir",
    fr: "Merle noir", bg: "Кос", en: "Common Blackbird", la: "Turdus merula",
    groupe: "grives", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Le mâle (24-27 cm) est tout noir, avec le bec et le cercle autour de l'œil jaune-orange ; la femelle est brun sombre. Chant flûté et posé au crépuscule. Fouille les feuilles mortes ; son cri d'alarme « tchok-tchok » est sonore.",
    description_en: "The male (24-27 cm) is all black, with a yellow-orange bill and eye-ring; the female is dark brown. Calm, fluting song at dusk. Rummages through dead leaves; its “chok-chok” alarm call is loud.",
    description_bg: "Мъжкият (24-27 см) е изцяло черен, с жълто-оранжеви човка и пръстен около окото; женската е тъмнокафява. Спокойна, флейтова песен при здрач. Рови из сухите листа; тревожният му зов „чок-чок“ е звучен."
  },
  {
    id: "grive-litorne",
    fr: "Grive litorne", bg: "Хвойнов дрозд", en: "Fieldfare", la: "Turdus pilaris",
    groupe: "grives", presence: ["hivernant"], mois: [11, 12, 1, 2, 3],
    habitats: ["champs", "haies", "village"], uicn: "LC",
    description: "Grande grive (22-27 cm) à la tête et au croupion gris, au dos brun-marron et à la poitrine dorée tachetée de noir. Hivernant venu du nord, en bandes bruyantes « tchak-tchak » sur les arbres à baies et dans les prés.",
    description_en: "Large thrush (22-27 cm) with a grey head and rump, a chestnut-brown back and a golden breast spotted with black. A winter visitor from the north, in noisy “chak-chak” flocks in berry trees and meadows.",
    description_bg: "Едър дрозд (22-27 см) със сиви глава и кръст, кестеняво-кафяв гръб и златисти гърди на черни петна. Зимен гост от север, на шумни ята „чак-чак“ по дърветата с плодове и в ливадите."
  },
  {
    id: "grive-musicienne",
    fr: "Grive musicienne", bg: "Поен дрозд", en: "Song Thrush", la: "Turdus philomelos",
    groupe: "grives", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Grive brune (20-23 cm) à la poitrine crème couverte de petites taches en pointe de flèche. Chant puissant fait de phrases répétées deux ou trois fois. Casse les coquilles d'escargots sur une pierre qui lui sert d'« enclume ».",
    description_en: "Brown thrush (20-23 cm) with a cream breast covered in small arrowhead spots. Powerful song made of phrases repeated two or three times. Breaks snail shells on a stone that serves as its “anvil”.",
    description_bg: "Кафяв дрозд (20-23 см) с кремави гърди, покрити с малки петна като върхове на стрели. Мощна песен от фрази, повтаряни по два-три пъти. Чупи черупките на охлювите в камък, който му служи за „наковалня“."
  },
  {
    id: "grive-mauvis",
    fr: "Grive mauvis", bg: "Беловежд дрозд", en: "Redwing", la: "Turdus iliacus",
    groupe: "grives", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["haies", "foret", "champs"], uicn: "LC",
    description: "Petite grive (19-23 cm) à large sourcil crème et aux flancs rouge-orangé. Hivernant du nord, souvent mêlée aux litornes dans les vergers et les haies à baies. Cri fin « tsiih » en vol de nuit.",
    description_en: "Small thrush (19-23 cm) with a broad creamy eyebrow and orange-red flanks. A winter visitor from the north, often mixed with Fieldfares in orchards and berry hedges. Thin “tseeh” call when migrating at night.",
    description_bg: "Малък дрозд (19-23 см) с широка кремава вежда и червено-оранжеви хълбоци. Зимен гост от север, често заедно с хвойновите дроздове в овощните градини и живите плетове с плодове. Тънък зов „цийй“ при нощната миграция.",
    aVerifier: true,
    note: "Statut UICN mondial à confirmer (classée NT en 2015, LC depuis ?).",
    note_en: "Global IUCN status to be confirmed (listed NT in 2015, LC since then?).",
    note_bg: "Световният статус по IUCN трябва да се потвърди (NT през 2015 г., LC след това?)."
  },
  {
    id: "grive-draine",
    fr: "Grive draine", bg: "Имелов дрозд", en: "Mistle Thrush", la: "Turdus viscivorus",
    groupe: "grives", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "champs"], uicn: "LC",
    description: "La plus grande grive (26-29 cm), gris-brun pâle, à la poitrine couverte de grosses taches rondes et aux coins de la queue blancs. Cri crépitant comme une crécelle. Défend en hiver les touffes de gui, dont elle disperse les graines.",
    description_en: "The largest thrush (26-29 cm), pale grey-brown, with a breast covered in large round spots and white tail corners. Rattling call like a wooden rattle. In winter it defends clumps of mistletoe, whose seeds it spreads.",
    description_bg: "Най-едрият дрозд (26-29 см), бледо сивокафяв, с гърди, покрити с едри кръгли петна, и бели ъгли на опашката. Пращящ зов като дървена тракалка. През зимата брани туфите имел, чиито семена разпространява."
  },

  /* ---------- Rousserolles, fauvettes, pouillots, roitelet ---------- */
  {
    id: "rousserolle-verderolle",
    fr: "Rousserolle verderolle", bg: "Мочурно шаварче", en: "Marsh Warbler", la: "Acrocephalus palustris",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["eau", "haies"], uicn: "LC",
    description: "Fauvette des milieux humides (13-15 cm), brun-olive uni et sans marque, très difficile à distinguer de ses cousines. Son chant est remarquable : un imitateur virtuose qui reprend le chant de dizaines d'espèces. Friches humides, orties et bords de rivière ; arrive tard (mi-mai).",
    description_en: "Warbler of damp places (13-15 cm), plain olive-brown with no markings, very hard to tell from its relatives. Its song is remarkable: a virtuoso mimic that copies the songs of dozens of species. Damp scrub, nettle beds and riverbanks; arrives late (mid-May).",
    description_bg: "Шаварче на влажните места (13-15 см), едноцветно маслиненокафяво, без белези, много трудно за различаване от сродните видове. Песента му е забележителна: виртуозен имитатор, който повтаря песните на десетки видове. Влажни запустели места, коприва и речни брегове; пристига късно (средата на май)."
  },
  {
    id: "rousserolle-turdoide",
    fr: "Rousserolle turdoïde", bg: "Голямо тръстиково шаварче", en: "Great Reed Warbler", la: "Acrocephalus arundinaceus",
    groupe: "fauvettes", presence: ["estivant"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["eau"], uicn: "LC",
    description: "Grosse fauvette des roseaux (16-20 cm), presque de la taille d'une grive, brun chaud avec un sourcil crème. Chant très sonore et grinçant « kara-kara-kiet-kiet », lancé du haut d'un roseau. Roselières des étangs et des rivières.",
    description_en: "Big reed warbler (16-20 cm), almost thrush-sized, warm brown with a creamy eyebrow. Very loud, grating song “karra-karra-kreet-kreet”, delivered from the top of a reed. Reedbeds on ponds and rivers.",
    description_bg: "Едро тръстиково шаварче (16-20 см), почти колкото дрозд, топлокафяво с кремава вежда. Много звучна, скърцаща песен „кара-кара-киет-киет“, изпълнявана от върха на тръстиката. Тръстикови масиви по езерата и реките."
  },
  {
    id: "hypolais-pale",
    fr: "Hypolaïs pâle", bg: "Малък маслинов присмехулник", en: "Eastern Olivaceous Warbler", la: "Iduna pallida",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8, 9],
    habitats: ["village", "haies", "eau"], uicn: "LC",
    description: "Petite fauvette (12-13,5 cm) gris-brun pâle très terne, au front plat et au bec assez long, qui agite la queue vers le bas. Chant rythmé et répétitif. Saules, jardins et vergers des villages.",
    description_en: "Small, very drab pale grey-brown warbler (12-13.5 cm) with a flat forehead and a fairly long bill, which flicks its tail downwards. Rhythmic, repetitive song. Willows, gardens and orchards in villages.",
    description_bg: "Малък, много невзрачен бледо сивокафяв присмехулник (12-13,5 см) с плоско чело и доста дълга човка, който потрепва с опашка надолу. Ритмична, повтаряща се песен. Върби, градини и овощни градини в селата.",
    aVerifier: true,
    note: "Nom bulgare à confirmer.",
    note_en: "Bulgarian name to be confirmed.",
    note_bg: "Българското име трябва да се потвърди."
  },
  {
    id: "fauvette-eperviere",
    fr: "Fauvette épervière", bg: "Ястребогушо коприварче", en: "Barred Warbler", la: "Curruca nisoria",
    groupe: "fauvettes", presence: ["estivant"], mois: [5, 6, 7, 8],
    habitats: ["haies"], uicn: "LC",
    description: "Grande fauvette (15,5-17 cm) gris-brun au dessous finement barré « d'épervier » et à l'œil jaune vif chez l'adulte. Chant grinçant entrecoupé d'un roulement sec. Haies épineuses et buissons, souvent près de la Pie-grièche écorcheur.",
    description_en: "Large grey-brown warbler (15.5-17 cm) with finely “hawk-barred” underparts and a bright yellow eye in adults. Grating song interspersed with a dry rattle. Thorny hedges and bushes, often near Red-backed Shrikes.",
    description_bg: "Голямо сивокафяво коприварче (15,5-17 см) с фини напречни ивици отдолу, „като на ястреб“, и яркожълто око при възрастните. Скърцаща песен, прекъсвана от суха тракаща трел. Трънливи живи плетове и храсти, често близо до червеногърбата сврачка."
  },
  {
    id: "fauvette-babillarde",
    fr: "Fauvette babillarde", bg: "Малко белогушо коприварче", en: "Lesser Whitethroat", la: "Curruca curruca",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "village"], uicn: "LC",
    description: "Petite fauvette grise (12,5-13,5 cm) aux joues sombres formant un masque et à la gorge blanche, sans roux sur l'aile. Chant : court gazouillis suivi d'un trille sec « tre-tre-tre-tre » sur une seule note. Haies, jardins et broussailles.",
    description_en: "Small grey warbler (12.5-13.5 cm) with dark cheeks forming a mask and a white throat, with no rufous on the wing. Song: a short warble followed by a dry, single-note rattle “tre-tre-tre-tre”. Hedges, gardens and scrub.",
    description_bg: "Малко сиво коприварче (12,5-13,5 см) с тъмни бузи, образуващи маска, и бяла гуша, без ръждиво на крилото. Песен: кратко чуруликане, последвано от суха трел на един тон „тре-тре-тре-тре“. Живи плетове, градини и храсталаци."
  },
  {
    id: "fauvette-grisette",
    fr: "Fauvette grisette", bg: "Голямо белогушо коприварче", en: "Common Whitethroat", la: "Curruca communis",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Fauvette (13-15 cm) à la gorge blanche éclatante et aux ailes bordées de roux ; le mâle a la tête grise. Chant bref et rêche, souvent lancé en vol en s'élevant au-dessus des buissons. Haies, ronciers et friches.",
    description_en: "Warbler (13-15 cm) with a gleaming white throat and rufous-edged wings; the male has a grey head. Short, scratchy song, often delivered in a song flight rising above the bushes. Hedges, bramble patches and fallow land.",
    description_bg: "Коприварче (13-15 см) с бляскаво бяла гуша и крила с ръждиви краища; мъжкият е със сива глава. Кратка, дрезгава песен, често изпълнявана в полет, докато се издига над храстите. Живи плетове, къпинаци и запустели земи."
  },
  {
    id: "fauvette-a-tete-noire",
    fr: "Fauvette à tête noire", bg: "Черноглаво коприварче", en: "Eurasian Blackcap", la: "Sylvia atricapilla",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [3, 4, 5, 6, 7, 8, 9, 10],
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Fauvette grise (13-15 cm) à calotte noire chez le mâle, brun-roux chez la femelle. Chant mélodieux et flûté qui finit en phrase claire et forte. Forêts, parcs et jardins ; quelques individus passent l'hiver.",
    description_en: "Grey warbler (13-15 cm) with a black cap in the male and a rufous-brown one in the female. Melodious, fluting song ending in a clear, loud phrase. Forests, parks and gardens; a few birds spend the winter.",
    description_bg: "Сиво коприварче (13-15 см) с черна шапчица при мъжкия и ръждивокафява при женската. Мелодична, флейтова песен, която завършва с ясна и силна фраза. Гори, паркове и градини; някои птици зимуват."
  },
  {
    id: "pouillot-siffleur",
    fr: "Pouillot siffleur", bg: "Буков певец", en: "Wood Warbler", la: "Phylloscopus sibilatrix",
    groupe: "fauvettes", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Pouillot vif (11-12,5 cm), vert-jaune dessus, à gorge jaune vif, ventre blanc pur et long sourcil jaune. Chant typique : un trille qui s'accélère, comme une pièce qui tombe en tournoyant. Hêtraies et chênaies au sous-bois dégagé.",
    description_en: "Lively leaf warbler (11-12.5 cm), yellowish-green above, with a bright yellow throat, a pure white belly and a long yellow eyebrow. Typical song: an accelerating trill, like a coin spinning as it falls. Beech and oak woods with open undergrowth.",
    description_bg: "Подвижен певец (11-12,5 см), зеленикавожълт отгоре, с яркожълта гуша, чисто бял корем и дълга жълта вежда. Типична песен: трел, която се ускорява, като монета, която пада и се върти. Букови и дъбови гори с открит подлес."
  },
  {
    id: "pouillot-veloce",
    fr: "Pouillot véloce", bg: "Елов певец", en: "Common Chiffchaff", la: "Phylloscopus collybita",
    groupe: "fauvettes", presence: ["estivant", "passage", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Petit pouillot brun-olive terne (10-12 cm) aux pattes sombres, qui agite la queue vers le bas. Son chant égrène son nom anglais : « tchif-tchaf-tchif-tchaf ». Très commun au printemps ; quelques-uns passent l'hiver près de l'eau.",
    description_en: "Small, dull olive-brown leaf warbler (10-12 cm) with dark legs, which dips its tail. Its song spells out its English name: “chiff-chaff-chiff-chaff”. Very common in spring; a few spend the winter near water.",
    description_bg: "Малък, невзрачен маслиненокафяв певец (10-12 см) с тъмни крака, който потрепва с опашка надолу. Песента му повтаря английското му име: „чиф-чаф-чиф-чаф“. Много разпространен през пролетта; някои зимуват край водата."
  },
  {
    id: "roitelet-huppe",
    fr: "Roitelet huppé", bg: "Жълтоглаво кралче", en: "Goldcrest", la: "Regulus regulus",
    groupe: "fauvettes", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret"], uicn: "LC",
    description: "Le plus petit oiseau d'Europe (8,5-9,5 cm, 5-6 g), vert olive avec une barre blanche sur l'aile et une calotte jaune bordée de noir (orange au centre chez le mâle). S'agite sans cesse dans les conifères. Niche en montagne ; plus visible en plaine l'hiver, avec les mésanges.",
    description_en: "Europe's smallest bird (8.5-9.5 cm, 5-6 g), olive-green with a white wing bar and a yellow crown bordered with black (orange in the centre in the male). Constantly on the move in conifers. Breeds in the mountains; easier to see in the lowlands in winter, with the tits.",
    description_bg: "Най-малката птица в Европа (8,5-9,5 см, 5-6 г), маслиненозелена, с бяла ивица на крилото и жълто теме, обрамчено с черно (оранжево в средата при мъжкия). Непрекъснато се движи из иглолистните дървета. Гнезди в планините; през зимата се вижда по-често в равнините, заедно със синигерите."
  },

  /* ---------- Gobemouches ---------- */
  {
    id: "gobemouche-gris",
    fr: "Gobemouche gris", bg: "Сива мухоловка", en: "Spotted Flycatcher", la: "Muscicapa striata",
    groupe: "grives", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["village", "foret", "haies"], uicn: "LC",
    description: "Passereau gris-brun (13,5-15 cm) au front et à la poitrine finement striés. Se tient droit sur un perchoir dégagé, s'élance pour attraper un insecte en vol et revient souvent au même poste. Parcs, vergers, lisières et villages.",
    description_en: "Grey-brown songbird (13.5-15 cm) with a finely streaked forehead and breast. Sits upright on an open perch, sallies out to catch an insect in flight and often returns to the same spot. Parks, orchards, woodland edges and villages.",
    description_bg: "Сивокафява пойна птица (13,5-15 см) с фини ивици по челото и гърдите. Стои изправена на открито място, излита, за да улови насекомо във въздуха, и често се връща на същото място. Паркове, овощни градини, горски покрайнини и села."
  },
  {
    id: "gobemouche-nain",
    fr: "Gobemouche nain", bg: "Малка мухоловка", en: "Red-breasted Flycatcher", la: "Ficedula parva",
    groupe: "grives", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Tout petit gobemouche (11-12 cm) brun-gris qui relève souvent la queue, montrant des taches blanches à sa base. Le mâle adulte a la gorge orange-rouge. Discret, dans le feuillage des vieilles hêtraies ; chant tintant qui descend.",
    description_en: "Tiny grey-brown flycatcher (11-12 cm) that often cocks its tail, showing white patches at its base. The adult male has an orange-red throat. Unobtrusive, in the foliage of old beech woods; tinkling, descending song.",
    description_bg: "Съвсем малка сивокафява мухоловка (11-12 см), която често вдига опашката си и показва бели петна в основата ѝ. Възрастният мъжки има оранжевочервена гуша. Незабележима, в листака на старите букови гори; звънлива, низходяща песен.",
    aVerifier: true,
    note: "Niche dans les hêtraies de montagne en Bulgarie ; présence en Sredna Gora à confirmer.",
    note_en: "Breeds in mountain beech forests in Bulgaria; presence in Sredna Gora to be confirmed.",
    note_bg: "Гнезди в планинските букови гори в България; присъствието в Средна гора трябва да се потвърди."
  },
  {
    id: "gobemouche-a-demi-collier",
    fr: "Gobemouche à demi-collier", bg: "Полуяка мухоловка", en: "Semi-collared Flycatcher", la: "Ficedula semitorquata",
    groupe: "grives", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["foret"], uicn: "LC",
    description: "Gobemouche noir et blanc (12-13,5 cm), spécialité des Balkans. Le mâle est intermédiaire entre le Gobemouche noir et le Gobemouche à collier : demi-collier blanc sur le côté du cou, beaucoup de blanc sur l'aile et une barre blanche en plus. Vieilles chênaies et hêtraies claires.",
    description_en: "Black-and-white flycatcher (12-13.5 cm), a Balkan speciality. The male is intermediate between the Pied and Collared Flycatchers: a white half-collar on the side of the neck, lots of white on the wing and an extra white wing bar. Old oak woods and open beech woods.",
    description_bg: "Черно-бяла мухоловка (12-13,5 см), характерна за Балканите. Мъжкият е нещо средно между жалобната и беловратата мухоловка: бяла полуяка отстрани на шията, много бяло по крилото и една допълнителна бяла ивица. Стари дъбови гори и светли букови гори.",
    aVerifier: true,
    note: "Statut UICN à confirmer (anciennement NT).",
    note_en: "IUCN status to be confirmed (formerly NT).",
    note_bg: "Статусът по IUCN трябва да се потвърди (по-рано NT)."
  },
  {
    id: "gobemouche-a-collier",
    fr: "Gobemouche à collier", bg: "Беловрата мухоловка", en: "Collared Flycatcher", la: "Ficedula albicollis",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9],
    habitats: ["foret", "village"], uicn: "LC",
    description: "Gobemouche (12-13,5 cm) dont le mâle noir et blanc porte un collier blanc complet et un croupion blanchâtre. La femelle gris-brun est très difficile à distinguer de celles des espèces voisines. Surtout de passage en avril-mai et en août-septembre.",
    description_en: "Flycatcher (12-13.5 cm) whose black-and-white male has a complete white collar and a whitish rump. The grey-brown female is very hard to tell from those of related species. Mostly seen on passage in April-May and August-September.",
    description_bg: "Мухоловка (12-13,5 см), чийто черно-бял мъжки има пълна бяла яка и белезникав кръст. Сивокафявата женска много трудно се различава от женските на сродните видове. Вижда се главно по време на прелета през април-май и август-септември."
  },
  {
    id: "gobemouche-noir",
    fr: "Gobemouche noir", bg: "Жалобна мухоловка", en: "European Pied Flycatcher", la: "Ficedula hypoleuca",
    groupe: "grives", presence: ["passage"], mois: [4, 5, 8, 9, 10],
    habitats: ["foret", "haies", "village"], uicn: "LC",
    description: "Gobemouche (12-13,5 cm) dont le mâle est noir (ou brun-noir) et blanc, sans collier, avec une petite tache blanche au front et une autre sur l'aile. Migrateur de passage en Bulgarie, souvent vu dans les vergers et les lisières en fin d'été.",
    description_en: "Flycatcher (12-13.5 cm) whose male is black (or brownish-black) and white, with no collar, a small white patch on the forehead and another on the wing. A passage migrant in Bulgaria, often seen in orchards and woodland edges in late summer.",
    description_bg: "Мухоловка (12-13,5 см), чийто мъжки е черен (или кафявочерен) и бял, без яка, с малко бяло петно на челото и друго на крилото. В България се среща по време на прелета, често в овощните градини и горските покрайнини в края на лятото."
  },

  /* ---------- Mésanges, sittelle, tichodrome, grimpereaux ---------- */
  {
    id: "orite-a-longue-queue",
    fr: "Orite à longue queue", bg: "Дългоопашат синигер", en: "Long-tailed Tit", la: "Aegithalos caudatus",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Petite boule rose, noire et blanche (13-15 cm, dont 7-9 cm de queue). En Bulgarie, la tête porte une large bande noire au-dessus de l'œil. Voyage en petites bandes bavardes qui passent d'arbre en arbre en lançant des « srii-srii » ; nid en boule de mousse et de lichens.",
    description_en: "Small pink, black and white ball (13-15 cm, 7-9 cm of which is tail). In Bulgaria, the head has a broad black stripe above the eye. Travels in small chattering flocks that move from tree to tree calling “sree-sree”; ball-shaped nest of moss and lichens.",
    description_bg: "Малко розово-черно-бяло топче (13-15 см, от които 7-9 см опашка). В България главата има широка черна ивица над окото. Движи се на малки бъбриви ята, които прелитат от дърво на дърво и издават „сри-сри“; гнездо като топка от мъх и лишеи."
  },
  {
    id: "mesange-nonnette",
    fr: "Mésange nonnette", bg: "Лъскавоглав синигер", en: "Marsh Tit", la: "Poecile palustris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Mésange brun-gris (11,5-13 cm) à calotte noire luisante et petite bavette noire, sans barre sur l'aile. Cri explosif « pitchiou ». Forêts de feuillus et vieux vergers ; fait des réserves de graines.",
    description_en: "Grey-brown tit (11.5-13 cm) with a glossy black cap and a small black bib, with no wing bar. Explosive “pitchoo” call. Broadleaved woods and old orchards; stores seeds.",
    description_bg: "Сивокафяв синигер (11,5-13 см) с лъскава черна шапчица и малък черен „лигавник“, без ивица на крилото. Експлозивен зов „пичу“. Широколистни гори и стари овощни градини; прави запаси от семена."
  },
  {
    id: "mesange-lugubre",
    fr: "Mésange lugubre", bg: "Жалобен синигер", en: "Sombre Tit", la: "Poecile lugubris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "montagne", "haies"], uicn: "LC",
    description: "Grande mésange grise des Balkans (13,5-14 cm) à large calotte brun-noir et grande bavette noire qui encadrent des joues blanches. Discrète, dans les chênaies claires, les pentes rocheuses buissonnantes et les vergers. Cri rauque « tchrrr ».",
    description_en: "Large grey Balkan tit (13.5-14 cm) with a broad blackish-brown cap and a large black bib framing white cheeks. Unobtrusive, in open oak woods, scrubby rocky slopes and orchards. Harsh “chrrr” call.",
    description_bg: "Едър сив синигер на Балканите (13,5-14 см) с широка кафявочерна шапчица и голям черен „лигавник“, които обрамчват белите бузи. Незабележим, в светлите дъбови гори, храсталачните скалисти склонове и овощните градини. Дрезгав зов „чррр“."
  },
  {
    id: "mesange-noire",
    fr: "Mésange noire", bg: "Боров синигер", en: "Coal Tit", la: "Periparus ater",
    groupe: "mesanges", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Petite mésange (10-11,5 cm) à tête noire et joues blanches, avec une tache blanche sur la nuque et deux barres blanches sur l'aile. Liée aux conifères, où elle cherche les graines au bout des rameaux. Chant rapide « tsiwi-tsiwi ».",
    description_en: "Small tit (10-11.5 cm) with a black head and white cheeks, a white patch on the nape and two white wing bars. Tied to conifers, where it searches for seeds at the tips of twigs. Fast “tsee-wee, tsee-wee” song.",
    description_bg: "Малък синигер (10-11,5 см) с черна глава и бели бузи, с бяло петно на тила и две бели ивици на крилото. Свързан с иглолистните дървета, където търси семена по върховете на клонките. Бърза песен „ци-ви, ци-ви“.",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Боров синигер ?) ; liée aux conifères, présence locale à vérifier.",
    note_en: "Bulgarian name to be confirmed (Боров синигер?); tied to conifers, local presence to be checked.",
    note_bg: "Българското име трябва да се потвърди (Боров синигер?); свързан с иглолистните дървета, местното присъствие трябва да се провери."
  },
  {
    id: "mesange-bleue",
    fr: "Mésange bleue", bg: "Син синигер", en: "Eurasian Blue Tit", la: "Cyanistes caeruleus",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Petite mésange (10,5-12 cm) à calotte bleu azur, aux joues blanches cerclées de bleu foncé et au ventre jaune. Acrobate qui se suspend au bout des branches. Très fréquente aux mangeoires en hiver.",
    description_en: "Small tit (10.5-12 cm) with an azure-blue cap, white cheeks ringed with dark blue and a yellow belly. An acrobat that hangs from the tips of branches. Very common at feeders in winter.",
    description_bg: "Малък синигер (10,5-12 см) с лазурносиня шапчица, бели бузи, обрамчени с тъмносиньо, и жълт корем. Акробат, който виси по върховете на клоните. Много чест гост на хранилките през зимата."
  },
  {
    id: "mesange-charbonniere",
    fr: "Mésange charbonnière", bg: "Голям синигер", en: "Great Tit", la: "Parus major",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "La plus grande mésange (13,5-15 cm) : tête noire à joues blanches, ventre jaune parcouru d'une bande noire (plus large chez le mâle). Chant sonore « ti-tu, ti-tu » dès la fin de l'hiver. Commune partout, des forêts aux jardins.",
    description_en: "The largest tit (13.5-15 cm): black head with white cheeks, yellow belly with a black stripe down the middle (broader in the male). Ringing “tee-cher, tee-cher” song from late winter. Common everywhere, from forests to gardens.",
    description_bg: "Най-едрият синигер (13,5-15 см): черна глава с бели бузи, жълт корем с черна ивица по средата (по-широка при мъжкия). Звучна песен „ти-тю, ти-тю“ още от края на зимата. Разпространен навсякъде, от горите до градините."
  },
  {
    id: "sittelle-torchepot",
    fr: "Sittelle torchepot", bg: "Горска зидарка", en: "Eurasian Nuthatch", la: "Sitta europaea",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Passereau trapu (14 cm) gris-bleu dessus, au bandeau noir sur l'œil et au ventre chamois-roux. Seul oiseau d'Europe à descendre les troncs la tête en bas. Rétrécit l'entrée de son nid avec de la boue ; sifflements forts « tuit-tuit ».",
    description_en: "Stocky songbird (14 cm), blue-grey above, with a black eye-stripe and buff-orange underparts. The only European bird that climbs down tree trunks head first. Narrows the entrance of its nest hole with mud; loud “tweet-tweet” whistles.",
    description_bg: "Набита пойна птица (14 см), синкавосива отгоре, с черна ивица през окото и жълтеникаво-ръждив корем. Единствената птица в Европа, която слиза по стволовете с главата надолу. Стеснява входа на гнездото си с кал; силно подсвирква „туит-туит“."
  },
  {
    id: "tichodrome-echelette",
    fr: "Tichodrome échelette", bg: "Скалолазка", en: "Wallcreeper", la: "Tichodroma muraria",
    groupe: "mesanges", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["montagne"], uicn: "LC",
    description: "Oiseau gris (16-17 cm) aux ailes rouge carmin tachées de blanc et au long bec fin arqué, qui grimpe le long des parois en ouvrant les ailes comme un papillon. Hiverne parfois sur les falaises, les gorges et les vieux bâtiments à basse altitude. Une « star » pour les photographes.",
    description_en: "Grey bird (16-17 cm) with crimson wings spotted with white and a long, thin, curved bill, which climbs rock faces flicking its wings open like a butterfly. Sometimes winters on cliffs, in gorges and on old buildings at low altitude. A “star” for photographers.",
    description_bg: "Сива птица (16-17 см) с карминеночервени крила на бели петна и дълга, тънка, извита човка, която се катери по скалните стени, като разтваря крилата си като пеперуда. Понякога зимува по скалите, в ждреловете и по старите сгради в ниските части. Истинска „звезда“ за фотографите.",
    aVerifier: true,
    note: "Niche en haute montagne ; présence hivernale sur les falaises et carrières des environs à confirmer.",
    note_en: "Breeds high in the mountains; winter presence on local cliffs and quarries to be confirmed.",
    note_bg: "Гнезди високо в планините; зимното присъствие по скалите и кариерите наоколо трябва да се потвърди."
  },
  {
    id: "grimpereau-des-bois",
    fr: "Grimpereau des bois", bg: "Дългопръста дърволазка", en: "Eurasian Treecreeper", la: "Certhia familiaris",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret"], uicn: "LC",
    description: "Petit passereau (12,5 cm) brun strié dessus, blanc pur dessous, au bec fin arqué, qui grimpe en spirale le long des troncs. Très proche du Grimpereau des jardins : flancs plus blancs, sourcil plus net et chant différent. Plutôt dans les forêts de montagne (hêtraies, conifères).",
    description_en: "Small songbird (12.5 cm), streaked brown above and pure white below, with a thin curved bill, which spirals up tree trunks. Very similar to the Short-toed Treecreeper: whiter flanks, a cleaner eyebrow and a different song. Mostly in mountain forests (beech, conifers).",
    description_bg: "Малка пойна птица (12,5 см), кафява на ивици отгоре и чисто бяла отдолу, с тънка извита човка, която се изкачва спираловидно по стволовете. Много прилича на късопръстата дърволазка: по-бели хълбоци, по-ясна вежда и различна песен. Предимно в планинските гори (букови, иглолистни)."
  },
  {
    id: "grimpereau-des-jardins",
    fr: "Grimpereau des jardins", bg: "Късопръста дърволазка", en: "Short-toed Treecreeper", la: "Certhia brachydactyla",
    groupe: "mesanges", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Grimpereau (12,5 cm) presque identique au Grimpereau des bois, aux flancs un peu plus brunâtres et au bec plus long. Le meilleur critère est son chant, court et rythmé « ti-ti-titero-tit ». Forêts de feuillus de basse altitude, parcs et vergers.",
    description_en: "Treecreeper (12.5 cm) almost identical to the Eurasian Treecreeper, with slightly browner flanks and a longer bill. The best clue is its short, rhythmic song “tee-tee-teeteroo-tit”. Lowland broadleaved woods, parks and orchards.",
    description_bg: "Дърволазка (12,5 см), почти еднаква с дългопръстата, с малко по-кафеникави хълбоци и по-дълга човка. Най-сигурният белег е песента ѝ, кратка и ритмична: „ти-ти-титеро-тит“. Широколистни гори в ниските части, паркове и овощни градини."
  },

  /* ---------- Loriot et pies-grièches ---------- */
  {
    id: "loriot-d-europe",
    fr: "Loriot d'Europe", bg: "Авлига", en: "Eurasian Golden Oriole", la: "Oriolus oriolus",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["foret", "eau", "haies"], uicn: "LC",
    description: "Le mâle (22-25 cm) est jaune d'or éclatant aux ailes noires ; la femelle est vert-jaune. Reste caché dans la cime des grands arbres, au bord des rivières et dans les peupleraies. Son chant flûté « di-de-lio » est bien plus facile à repérer que l'oiseau.",
    description_en: "The male (22-25 cm) is brilliant golden yellow with black wings; the female is yellowish-green. Stays hidden in the crowns of tall trees, along rivers and in poplar plantations. Its fluting “dee-de-lee-o” song is far easier to locate than the bird.",
    description_bg: "Мъжкият (22-25 см) е яркожълт като злато, с черни крила; женската е зеленикавожълта. Крие се във върховете на високите дървета, край реките и в тополовите насаждения. Флейтовата му песен „ди-де-лио“ се открива много по-лесно от самата птица."
  },
  {
    id: "pie-grieche-ecorcheur",
    fr: "Pie-grièche écorcheur", bg: "Червеногърба сврачка", en: "Red-backed Shrike", la: "Lanius collurio",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8, 9],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Le mâle (16-18 cm) a la tête grise, un masque noir et le dos roux ; la femelle est brune et écaillée. Guette depuis le sommet des buissons épineux, où elle empale parfois ses proies (son « lardoir »). Très commune dans les haies et les pâturages de Bulgarie.",
    description_en: "The male (16-18 cm) has a grey head, a black mask and a rufous back; the female is brown and scaly. Watches from the tops of thorny bushes, where it sometimes impales its prey (its “larder”). Very common in hedges and pastures in Bulgaria.",
    description_bg: "Мъжкият (16-18 см) има сива глава, черна маска и ръждив гръб; женската е кафява и на люспи. Дебне от върховете на трънливите храсти, където понякога набучва плячката си (своя „склад“). Много е разпространена в живите плетове и пасищата в България."
  },
  {
    id: "pie-grieche-a-poitrine-rose",
    fr: "Pie-grièche à poitrine rose", bg: "Черночела сврачка", en: "Lesser Grey Shrike", la: "Lanius minor",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Pie-grièche (19-21 cm) grise dessus, au large masque noir qui couvre le front, aux ailes noires tachées de blanc et au ventre teinté de rose. Se perche sur les fils et les arbres isolés des cultures. Arrive tard (mai) et repart dès août.",
    description_en: "Shrike (19-21 cm), grey above, with a broad black mask that covers the forehead, black wings marked with white and a pink-tinged belly. Perches on wires and lone trees in farmland. Arrives late (May) and leaves as early as August.",
    description_bg: "Сврачка (19-21 см), сива отгоре, с широка черна маска, която покрива челото, черни крила с бели петна и розовеещ корем. Каца по жиците и самотните дървета сред нивите. Пристига късно (май) и отлита още през август."
  },
  {
    id: "pie-grieche-grise",
    fr: "Pie-grièche grise", bg: "Сива сврачка", en: "Great Grey Shrike", la: "Lanius excubitor",
    groupe: "passereaux", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Grande pie-grièche (24-25 cm) gris clair dessus et blanche dessous, avec un masque noir qui ne passe pas sur le front et une longue queue. Hivernant solitaire, perché bien en vue au sommet d'un arbre isolé ; chasse campagnols et petits oiseaux.",
    description_en: "Large shrike (24-25 cm), pale grey above and white below, with a black mask that does not extend over the forehead and a long tail. A solitary winter visitor, perched in full view on top of a lone tree; hunts voles and small birds.",
    description_bg: "Едра сврачка (24-25 см), светлосива отгоре и бяла отдолу, с черна маска, която не минава през челото, и дълга опашка. Самотен зимуващ вид, кацнал на видно място на върха на самотно дърво; лови полевки и дребни птици.",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Сива сврачка ou Голяма сива сврачка).",
    note_en: "Bulgarian name to be confirmed (Сива сврачка or Голяма сива сврачка).",
    note_bg: "Българското име трябва да се потвърди (Сива сврачка или Голяма сива сврачка)."
  },

  /* ---------- Corvidés ---------- */
  {
    id: "geai-des-chenes",
    fr: "Geai des chênes", bg: "Сойка", en: "Eurasian Jay", la: "Garrulus glandarius",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village"], uicn: "LC",
    description: "Corvidé coloré (32-35 cm) rose-beige, à moustache noire et croupion blanc, avec un miroir bleu vif barré de noir sur l'aile. Cri d'alarme rauque « krèèk ». Enterre des glands en automne et contribue ainsi à replanter les chênaies.",
    description_en: "Colourful pinkish-buff corvid (32-35 cm) with a black moustache and a white rump, and a bright blue, black-barred patch on the wing. Harsh “kraak” alarm call. Buries acorns in autumn and so helps to replant oak woods.",
    description_bg: "Пъстра вранова птица (32-35 см) с розовобежово оперение, черни „мустаци“ и бял кръст, с яркосиньо огледалце на черни ивици на крилото. Дрезгав тревожен зов „краак“. През есента заравя жълъди и така помага за възобновяването на дъбовите гори."
  },
  {
    id: "pie-bavarde",
    fr: "Pie bavarde", bg: "Сврака", en: "Eurasian Magpie", la: "Pica pica",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Corvidé noir et blanc (40-51 cm) à très longue queue aux reflets vert métallique. Jacassement sec « tchak-tchak-tchak ». Construit un gros nid d'épines en dôme dans les arbres des villages et des haies.",
    description_en: "Black-and-white corvid (40-51 cm) with a very long tail glossed metallic green. Dry chattering “chak-chak-chak”. Builds a large domed nest of thorny twigs in trees in villages and hedges.",
    description_bg: "Черно-бяла вранова птица (40-51 см) с много дълга опашка с метално зелен отблясък. Сухо, накъсано стрекотене „чак-чак-чак“. Строи голямо куполовидно гнездо от бодливи клонки по дърветата в селата и живите плетове."
  },
  {
    id: "choucas-des-tours",
    fr: "Choucas des tours", bg: "Чавка", en: "Western Jackdaw", la: "Coloeus monedula",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "montagne"], uicn: "LC",
    description: "Petit corvidé noir (33-34 cm) à nuque grise et œil blanc-argent. Très sociable, en bandes bruyantes « tchak » autour des clochers, des falaises et des vieux bâtiments, souvent avec les freux en hiver. La forme des Balkans a souvent un demi-collier blanchâtre.",
    description_en: "Small black corvid (33-34 cm) with a grey nape and a silvery-white eye. Very sociable, in noisy “chak” flocks around church towers, cliffs and old buildings, often with Rooks in winter. The Balkan form often has a whitish half-collar.",
    description_bg: "Малка черна вранова птица (33-34 см) със сив тил и сребристобяло око. Много общителна, на шумни ята „чак“ около камбанариите, скалите и старите сгради, през зимата често заедно с посевните врани. Балканската форма често има белезникава полуяка."
  },
  {
    id: "corbeau-freux",
    fr: "Corbeau freux", bg: "Посевна врана", en: "Rook", la: "Corvus frugilegus",
    groupe: "corvides", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["champs", "village"], uicn: "LC",
    description: "Corvidé noir à reflets violets (44-46 cm) ; l'adulte a la base du bec nue et blanchâtre et des « culottes » ébouriffées. Niche en colonies dans les grands arbres. En hiver, d'immenses bandes venues du nord parcourent les champs de Thrace.",
    description_en: "Black corvid with a purple gloss (44-46 cm); the adult has a bare, whitish base to the bill and shaggy “trousers”. Nests in colonies in tall trees. In winter, huge flocks from the north roam the fields of Thrace.",
    description_bg: "Черна вранова птица с виолетов отблясък (44-46 см); възрастната птица има гола белезникава основа на човката и рошави „гащи“. Гнезди на колонии във високите дървета. През зимата огромни ята, дошли от север, обикалят полетата на Тракия."
  },
  {
    id: "corneille-mantelee",
    fr: "Corneille mantelée", bg: "Сива врана", en: "Hooded Crow", la: "Corvus cornix",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "eau"], uicn: "LC",
    description: "Corneille (44-51 cm) à la tête, aux ailes et à la queue noires et au corps gris cendré. Omniprésente en Bulgarie, des villages aux bords de rivière. Croassement rauque « kraa ».",
    description_en: "Crow (44-51 cm) with a black head, wings and tail and an ash-grey body. Found everywhere in Bulgaria, from villages to riverbanks. Harsh “kraa” caw.",
    description_bg: "Врана (44-51 см) с черни глава, крила и опашка и пепелявосиво тяло. Среща се навсякъде в България, от селата до бреговете на реките. Дрезгаво грачене „краа“."
  },
  {
    id: "grand-corbeau",
    fr: "Grand Corbeau", bg: "Гарван гробар", en: "Northern Raven", la: "Corvus corax",
    groupe: "corvides", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "foret", "champs"], uicn: "LC",
    description: "Le plus grand passereau (54-67 cm), entièrement noir, au bec massif, à la gorge hérissée et à la queue en losange en vol. Cri grave et sonore « krok ». Vit en couples en montagne et fait des acrobaties aériennes au printemps.",
    description_en: "The largest passerine (54-67 cm), all black, with a massive bill, a shaggy throat and a diamond-shaped tail in flight. Deep, resonant “kronk” call. Lives in pairs in the mountains and performs aerial acrobatics in spring.",
    description_bg: "Най-едрата врабчоподобна птица (54-67 см), изцяло черна, с масивна човка, настръхнала гуша и ромбовидна опашка в полет. Нисък, звучен зов „крок“. Живее на двойки в планините и през пролетта прави въздушни акробатики."
  },

  /* ---------- Étourneaux et moineaux ---------- */
  {
    id: "etourneau-sansonnet",
    fr: "Étourneau sansonnet", bg: "Обикновен скорец", en: "Common Starling", la: "Sturnus vulgaris",
    groupe: "passereaux", presence: ["resident", "hivernant", "passage"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs"], uicn: "LC",
    description: "Passereau noir (19-22 cm) à reflets verts et violets, constellé de points blancs en hiver ; bec jaune au printemps. Imitateur doué. En automne et en hiver, des nuées de milliers d'oiseaux dansent au-dessus des dortoirs.",
    description_en: "Black songbird (19-22 cm) glossed green and purple, covered in white spots in winter; yellow bill in spring. A gifted mimic. In autumn and winter, clouds of thousands of birds dance above their roosts.",
    description_bg: "Черна пойна птица (19-22 см) със зелен и виолетов отблясък, обсипана с бели точици през зимата; жълта човка през пролетта. Талантлив имитатор. През есента и зимата облаци от хиляди птици танцуват над нощувките си."
  },
  {
    id: "etourneau-roselin",
    fr: "Étourneau roselin", bg: "Розов скорец", en: "Rosy Starling", la: "Pastor roseus",
    groupe: "passereaux", presence: ["estivant", "passage"], mois: [5, 6, 7, 8],
    habitats: ["champs", "village"], uicn: "LC",
    description: "Étourneau (19-22 cm) rose saumon à la tête huppée, aux ailes et à la queue noires à reflets. Arrivées irrégulières : certaines années, des bandes envahissent la Bulgarie en mai-juin pour nicher en colonies dans les talus et les tas de pierres, attirées par les criquets.",
    description_en: "Salmon-pink starling (19-22 cm) with a crested head and glossy black wings and tail. Irregular arrivals: in some years, flocks invade Bulgaria in May-June to breed in colonies in banks and stone piles, drawn by swarms of grasshoppers.",
    description_bg: "Скорец (19-22 см) със сьомговорозово оперение, качулата глава и черни крила и опашка с отблясък. Пристига нередовно: в някои години ята нахлуват в България през май-юни, за да гнездят на колонии в насипите и купчините камъни, привлечени от скакалците."
  },
  {
    id: "moineau-domestique",
    fr: "Moineau domestique", bg: "Домашно врабче", en: "House Sparrow", la: "Passer domesticus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village"], uicn: "LC",
    description: "Le moineau des villages (14-16 cm). Le mâle a la calotte grise, la nuque marron et une bavette noire ; la femelle est brun-gris terne. Toujours près des maisons et des fermes, en groupes pépiants.",
    description_en: "The village sparrow (14-16 cm). The male has a grey crown, a chestnut nape and a black bib; the female is dull grey-brown. Always near houses and farms, in chirping groups.",
    description_bg: "Врабчето на селата (14-16 см). Мъжкият има сиво теме, кестеняв тил и черен „лигавник“; женската е невзрачно сивокафява. Винаги близо до къщите и стопанствата, на чуруликащи групи."
  },
  {
    id: "moineau-friquet",
    fr: "Moineau friquet", bg: "Полско врабче", en: "Eurasian Tree Sparrow", la: "Passer montanus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Moineau plus petit (12,5-14 cm) et plus élégant, à calotte entièrement brun-chocolat et joue blanche marquée d'une tache noire ; mâle et femelle sont identiques. Lisières des villages, vergers et haies.",
    description_en: "A smaller (12.5-14 cm), neater sparrow with an all chocolate-brown crown and a white cheek marked with a black spot; male and female look alike. Village edges, orchards and hedges.",
    description_bg: "По-малко (12,5-14 см) и по-елегантно врабче с изцяло шоколадовокафяво теме и бяла буза с черно петно; мъжкият и женската изглеждат еднакво. Покрайнините на селата, овощни градини и живи плетове."
  },

  /* ---------- Fringilles ---------- */
  {
    id: "pinson-des-arbres",
    fr: "Pinson des arbres", bg: "Обикновена чинка", en: "Common Chaffinch", la: "Fringilla coelebs",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Fringille commun (14-16 cm) aux deux barres blanches sur l'aile. Le mâle a la calotte gris-bleu et la poitrine rose-brique ; la femelle est brun-olive. Chant en cascade terminé par une fioriture, très répandu dans les forêts.",
    description_en: "Common finch (14-16 cm) with two white wing bars. The male has a blue-grey crown and a brick-pink breast; the female is olive-brown. Cascading song ending in a flourish; very widespread in forests.",
    description_bg: "Разпространена чинка (14-16 см) с две бели ивици на крилото. Мъжкият има синкавосиво теме и тухленорозови гърди; женската е маслиненокафява. Песен като каскада, завършваща с изящна трел; много разпространена в горите."
  },
  {
    id: "pinson-du-nord",
    fr: "Pinson du Nord", bg: "Планинска чинка", en: "Brambling", la: "Fringilla montifringilla",
    groupe: "fringilles", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3],
    habitats: ["foret", "champs"], uicn: "LC",
    description: "Cousin nordique du pinson (14-16 cm), à la poitrine et aux épaules orange et au croupion blanc ; tête noire chez le mâle en été, brun-gris tacheté en hiver. Hiverne en bandes qui mangent les faînes sous les hêtres ; certaines années, des dortoirs de milliers d'oiseaux.",
    description_en: "Northern cousin of the Chaffinch (14-16 cm), with an orange breast and shoulders and a white rump; the male's head is black in summer, mottled grey-brown in winter. Winters in flocks that feed on beechmast under beech trees; in some years, roosts of thousands of birds.",
    description_bg: "Северен братовчед на обикновената чинка (14-16 см) с оранжеви гърди и рамене и бял кръст; главата на мъжкия е черна през лятото и сивокафява на петна през зимата. Зимува на ята, които се хранят с буков жир под буковете; в някои години — нощувки от хиляди птици."
  },
  {
    id: "grosbec-casse-noyaux",
    fr: "Grosbec casse-noyaux", bg: "Черешарка", en: "Hawfinch", la: "Coccothraustes coccothraustes",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["foret", "village", "haies"], uicn: "LC",
    description: "Gros fringille trapu (16,5-18 cm) au bec énorme capable de casser les noyaux de cerise, à la tête orangée, à la nuque grise et à la bavette noire. En vol, larges barres blanches sur l'aile. Discret, souvent à la cime des arbres ; cri sec « tsik ».",
    description_en: "Big, stocky finch (16.5-18 cm) with a huge bill that can crack cherry stones, an orange-brown head, a grey nape and a black bib. Broad white wing bars in flight. Unobtrusive, often in treetops; dry “tsik” call.",
    description_bg: "Едра, набита чинка (16,5-18 см) с огромна човка, която може да чупи черешови костилки, оранжевееща глава, сив тил и черен „лигавник“. В полет — широки бели ивици на крилото. Незабележима, често във върховете на дърветата; сух зов „цик“."
  },
  {
    id: "bouvreuil-pivoine",
    fr: "Bouvreuil pivoine", bg: "Червенушка", en: "Eurasian Bullfinch", la: "Pyrrhula pyrrhula",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["foret", "haies"], uicn: "LC",
    description: "Fringille trapu (15,5-17,5 cm) à calotte noire et croupion blanc ; le mâle a la poitrine rose-rouge vif, la femelle rose-beige terne. Mange les bourgeons et les baies. Cri doux et flûté « diu ». Plus fréquent à basse altitude en hiver.",
    description_en: "Stocky finch (15.5-17.5 cm) with a black cap and a white rump; the male has a bright pinkish-red breast, the female a dull pinkish-buff one. Eats buds and berries. Soft, fluting “dyoo” call. More frequent at low altitude in winter.",
    description_bg: "Набита чинка (15,5-17,5 см) с черна шапчица и бял кръст; мъжкият има яркорозовочервени гърди, женската — невзрачно розовобежови. Яде пъпки и плодове. Мек, флейтов зов „дю“. През зимата се среща по-често в ниските части."
  },
  {
    id: "verdier-d-europe",
    fr: "Verdier d'Europe", bg: "Зеленика", en: "European Greenfinch", la: "Chloris chloris",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Fringille vert-olive (14-16 cm) au gros bec clair, avec des bordures jaune vif sur l'aile et la queue. Chant fait de trilles et d'un long « djouiiii » nasillard. Jardins, parcs et lisières.",
    description_en: "Olive-green finch (14-16 cm) with a heavy pale bill and bright yellow edges on the wing and tail. Song made of trills and a long, nasal “dzweeee”. Gardens, parks and woodland edges.",
    description_bg: "Маслиненозелена чинка (14-16 см) с дебела светла човка и яркожълти краища на крилото и опашката. Песен от трели и дълго носово „джуиии“. Градини, паркове и горски покрайнини."
  },
  {
    id: "linotte-melodieuse",
    fr: "Linotte mélodieuse", bg: "Обикновено конопарче", en: "Common Linnet", la: "Linaria cannabina",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs", "haies"], uicn: "LC",
    description: "Petit fringille brun (12,5-14 cm) au bec gris. Au printemps, le mâle a le front et la poitrine rouge framboise et la tête grise. En bandes dans les friches, les champs et les broussailles, d'un vol bondissant.",
    description_en: "Small brown finch (12.5-14 cm) with a grey bill. In spring, the male has a raspberry-red forehead and breast and a grey head. In flocks on fallow land, fields and scrub, with a bouncing flight.",
    description_bg: "Малка кафява чинка (12,5-14 см) със сива човка. През пролетта мъжкият има малиновочервени чело и гърди и сива глава. На ята из запустелите земи, нивите и храсталаците, с подскачащ полет."
  },
  {
    id: "chardonneret-elegant",
    fr: "Chardonneret élégant", bg: "Щиглец", en: "European Goldfinch", la: "Carduelis carduelis",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "champs", "haies"], uicn: "LC",
    description: "Fringille très coloré (12-13,5 cm) : face rouge, tête noire et blanche, larges barres jaune d'or sur les ailes noires. Se nourrit en petites bandes sur les chardons et les cardères. Chant gai et liquide.",
    description_en: "Very colourful finch (12-13.5 cm): red face, black-and-white head, broad golden-yellow bars on black wings. Feeds in small flocks on thistles and teasels. Cheerful, liquid song.",
    description_bg: "Много пъстра чинка (12-13,5 см): червено лице, черно-бяла глава, широки златистожълти ивици по черните крила. Храни се на малки ята по магарешките бодили и лугачките. Весела, ромоляща песен."
  },
  {
    id: "serin-cini",
    fr: "Serin cini", bg: "Диво канарче", en: "European Serin", la: "Serinus serinus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["village", "haies"], uicn: "LC",
    description: "Minuscule fringille (11-12 cm) jaune strié, au croupion jaune vif et au bec très court. Chant grésillant et rapide, comme du verre qui s'entrechoque, lancé d'un vol papillonnant. Jardins, vergers et cimetières des villages.",
    description_en: "Tiny streaked yellow finch (11-12 cm) with a bright yellow rump and a very short bill. Fast, sizzling song, like clinking glass, often given in a fluttering song flight. Village gardens, orchards and cemeteries.",
    description_bg: "Мъничка жълта чинка на ивици (11-12 см) с яркожълт кръст и много къса човка. Бърза, цвърчаща песен, като звън на стъкло, често изпълнявана в пърхащ полет. Градини, овощни градини и гробища в селата."
  },
  {
    id: "tarin-des-aulnes",
    fr: "Tarin des aulnes", bg: "Елшова скатия", en: "Eurasian Siskin", la: "Spinus spinus",
    groupe: "fringilles", presence: ["hivernant"], mois: [10, 11, 12, 1, 2, 3, 4],
    habitats: ["foret", "eau"], uicn: "LC",
    description: "Petit fringille (11-12,5 cm) vert-jaune strié, aux barres jaunes sur l'aile ; le mâle a une calotte et une petite bavette noires. En hiver, en bandes acrobatiques dans les aulnes et les bouleaux du bord des rivières.",
    description_en: "Small streaked yellowish-green finch (11-12.5 cm) with yellow wing bars; the male has a black cap and a small black bib. In winter, in acrobatic flocks in alders and birches along rivers.",
    description_bg: "Малка зеленикавожълта чинка на ивици (11-12,5 см) с жълти ивици на крилото; мъжкият има черни шапчица и малък „лигавник“. През зимата — на акробатични ята по елшите и брезите край реките."
  },

  /* ---------- Bruants ---------- */
  {
    id: "bruant-proyer",
    fr: "Bruant proyer", bg: "Сива овесарка", en: "Corn Bunting", la: "Emberiza calandra",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["champs"], uicn: "LC",
    description: "Gros bruant brun-gris strié (16-19 cm), sans marque nette. Chante sur un piquet ou un fil un cliquetis sec, comparé à un trousseau de clés qu'on secoue. Très commun dans les cultures et les prairies de plaine.",
    description_en: "Large, streaked grey-brown bunting (16-19 cm) with no clear markings. Sings from a post or wire: a dry jingle, often compared to a bunch of keys being shaken. Very common in farmland and lowland meadows.",
    description_bg: "Едра сивокафява овесарка на ивици (16-19 см), без ясни белези. Пее от кол или жица сухо подрънкване, което напомня разклатена връзка ключове. Много разпространена сред нивите и равнинните ливади."
  },
  {
    id: "bruant-jaune",
    fr: "Bruant jaune", bg: "Жълта овесарка", en: "Yellowhammer", la: "Emberiza citrinella",
    groupe: "fringilles", presence: ["resident", "hivernant"], mois: TOUTE_ANNEE,
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Bruant (16-16,5 cm) dont le mâle a la tête et le ventre jaune vif ; croupion roux. Son chant est une série de notes terminée par une note longue : « ti-ti-ti-ti-ti-tiiiih ». Lisières, haies et campagnes.",
    description_en: "Bunting (16-16.5 cm) whose male has a bright yellow head and belly; rufous rump. Its song is a series of notes ending in a long one: “ti-ti-ti-ti-ti-teeeee”. Woodland edges, hedges and open countryside.",
    description_bg: "Овесарка (16-16,5 см), чийто мъжки има яркожълти глава и корем; ръждив кръст. Песента ѝ е поредица от ноти, завършваща с една дълга: „ти-ти-ти-ти-ти-тиии“. Горски покрайнини, живи плетове и открити полета."
  },
  {
    id: "bruant-zizi",
    fr: "Bruant zizi", bg: "Зеленогуша овесарка", en: "Cirl Bunting", la: "Emberiza cirlus",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["haies", "village"], uicn: "LC",
    description: "Bruant (15-16,5 cm) dont le mâle a la face rayée de noir et de jaune, la gorge noire et une bande vert-olive sur la poitrine ; croupion brun-olive, et non roux. Chant : trille sec sur une seule note. Pentes chaudes, vergers et haies des villages.",
    description_en: "Bunting (15-16.5 cm) whose male has a face striped black and yellow, a black throat and an olive-green breast band; olive-brown rump, not rufous. Song: a dry trill on a single note. Warm slopes, orchards and village hedges.",
    description_bg: "Овесарка (15-16,5 см), чийто мъжки има лице на черни и жълти ивици, черна гуша и маслиненозелена ивица на гърдите; маслиненокафяв, а не ръждив кръст. Песен: суха трел на един тон. Топли склонове, овощни градини и живи плетове в селата."
  },
  {
    id: "bruant-fou",
    fr: "Bruant fou", bg: "Сивоглава овесарка", en: "Rock Bunting", la: "Emberiza cia",
    groupe: "fringilles", presence: ["resident"], mois: TOUTE_ANNEE,
    habitats: ["montagne", "haies"], uicn: "LC",
    description: "Bruant (15-16,5 cm) à la tête gris clair rayée de noir, au ventre roux-orangé uni et au croupion roux. Discret sur les pentes rocheuses buissonnantes, dans les vignes et les lisières ensoleillées. Cri fin « tsi ».",
    description_en: "Bunting (15-16.5 cm) with a pale grey head striped with black, plain orange-rufous underparts and a rufous rump. Unobtrusive on scrubby rocky slopes, in vineyards and on sunny woodland edges. Thin “tsee” call.",
    description_bg: "Овесарка (15-16,5 см) със светлосива глава на черни ивици, едноцветен ръждивооранжев корем и ръждив кръст. Незабележима по храсталачните скалисти склонове, в лозята и слънчевите горски покрайнини. Тънък зов „ци“.",
    aVerifier: true,
    note: "Nom bulgare à confirmer (Сивоглава овесарка ou Планинска овесарка ?).",
    note_en: "Bulgarian name to be confirmed (Сивоглава овесарка or Планинска овесарка?).",
    note_bg: "Българското име трябва да се потвърди (Сивоглава овесарка или Планинска овесарка?)."
  },
  {
    id: "bruant-ortolan",
    fr: "Bruant ortolan", bg: "Градинска овесарка", en: "Ortolan Bunting", la: "Emberiza hortulana",
    groupe: "fringilles", presence: ["estivant", "passage"], mois: [4, 5, 6, 7, 8, 9],
    habitats: ["champs", "haies", "montagne"], uicn: "LC",
    description: "Bruant (15-16,5 cm) à la tête gris-vert, à la gorge et à la moustache jaune pâle, au cercle jaune autour de l'œil et au ventre roux-orangé. Chant mélancolique de quelques notes. Pentes sèches parsemées d'arbres, vignes et cultures.",
    description_en: "Bunting (15-16.5 cm) with a greenish-grey head, a pale yellow throat and moustache, a yellow eye-ring and orange-rufous underparts. Melancholy song of a few notes. Dry slopes dotted with trees, vineyards and farmland.",
    description_bg: "Овесарка (15-16,5 см) със сивозелена глава, бледожълти гуша и „мустаци“, жълт пръстен около окото и ръждивооранжев корем. Меланхолична песен от няколко ноти. Сухи склонове с пръснати дървета, лозя и обработваеми земи."
  },
  {
    id: "bruant-melanocephale",
    fr: "Bruant mélanocéphale", bg: "Черноглава овесарка", en: "Black-headed Bunting", la: "Emberiza melanocephala",
    groupe: "fringilles", presence: ["estivant"], mois: [5, 6, 7, 8],
    habitats: ["haies", "champs"], uicn: "LC",
    description: "Grand bruant (16-18 cm) dont le mâle a le capuchon noir, le dessous jaune éclatant et le dos roux ; la femelle est beige pâle. Chante du haut des buissons et des fils dans les cultures et les haies de Thrace. Arrive en mai et repart dès août.",
    description_en: "Large bunting (16-18 cm) whose male has a black hood, brilliant yellow underparts and a rufous back; the female is pale buff. Sings from the tops of bushes and wires in the farmland and hedges of Thrace. Arrives in May and leaves as early as August.",
    description_bg: "Едра овесарка (16-18 см); мъжкият има черна глава, яркожълта долна страна на тялото и ръждив гръб, а женската е бледобежова. Пее от върховете на храстите и жиците сред нивите и живите плетове на Тракия. Пристига през май и отлита още през август."
  }
];
