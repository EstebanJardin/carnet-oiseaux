# Carnet d'oiseaux · Sredna Gora

Appli web (PWA) pour l'inventaire des oiseaux observés à Mrachenik (Мраченик) et dans la
Sredna Gora (Bulgarie). Elle fonctionne **sans connexion**, s'installe sur un téléphone
Android comme une vraie appli, et s'utilise aussi sur PC.

- **Catalogue** de 147 espèces (noms français, bulgare, anglais, latin), avec la recherche
  sans accents (même en bulgare translittéré : « kos » trouve « Кос ») et des filtres :
  groupe, habitat, présence (plusieurs choix à la fois, par exemple rapaces diurnes +
  rapaces nocturnes), « visibles en ce moment ».
- **Observations** : espèce, date et heure, lieu + GPS, nombre, comportement, météo, notes
  et photos. La date et la position sont reprises des infos EXIF de la photo.
- **Fiche par espèce** : infos du catalogue, chronologie, photos, premières et dernières
  observations.
- **Statistiques** : progression, observations par mois, liste de l'année.
- **Sauvegarde** : export .zip (avec les photos originales) ou .json, import et fusion sur
  un autre appareil, export CSV pour l'inventaire Smokinya, rappel tous les 14 jours.
- **Photos de référence** : une photo libre (Wikimedia Commons) par espèce, disponible hors
  connexion. Dès que tu photographies une espèce, **ta photo la remplace** ; la photo de
  référence reste visible sur la fiche pour comparer. Les crédits (auteur, licence) sont
  sur chaque fiche, dans Sauvegarde > À propos et dans `images/especes/CREDITS.md`.

### Nouveautés de la version 1.5

- **Carte hors ligne** : le bouton **Carte** (dans Mes spots et Mes obs., ou dans le menu
  sur PC) ouvre une vraie carte de la région (Karlovo, Sredna Gora, Stara Planina) avec
  tes spots, tes observations et ta position. Elle se télécharge **une seule fois**, de
  préférence en Wi-Fi (25 Mo environ), puis elle **marche sans réseau**. Si la connexion
  coupe, le téléchargement reprend où il s'était arrêté.
- **Sur la carte** : touche un spot pour voir sa fiche, un point pour voir l'observation,
  un rond chiffré pour zoomer sur un groupe. L'icône des calques (**Que montrer sur la
  carte**) filtre par période et par espèce, et exporte tes spots en KML ou en GPX.
  Un **appui long** sur la carte choisit un point : nouveau spot à cet endroit, ou étape
  d'itinéraire.
- **Placer un spot sans GPS** : sur la page du spot, **Placer sur la carte**. Sur la fiche
  d'un spot, **Déplacer** corrige sa position.
- **Itinéraires** : ajoute des spots ou des points comme étapes, range-les dans l'ordre que
  tu veux, à pied ou en voiture, en partant ou non de ta position. L'itinéraire
  s'enregistre tout seul et **Mes itinéraires** les garde (ils sont aussi dans Mes spots).
- **Vers Google Maps** : **Ouvrir dans Google Maps** lance le trajet guidé (il faut du réseau
  à ce moment-là). Au-delà de 9 étapes, l'itinéraire s'ouvre en plusieurs parties.
  Sans réseau, le fichier **GPX** s'ouvre dans Organic Maps ou OsmAnd (cartes hors ligne
  et guidage). Le fichier **KML** s'importe dans **Google My Maps** (sur PC : crée une
  carte puis **Importer**) et s'affiche ensuite dans Google Maps sur le téléphone.
- Les itinéraires partent dans les sauvegardes et se fusionnent comme le reste.

### Nouveautés de la version 1.4

- **Mes spots** : sur la fiche de chaque oiseau, le bouton **Mes spots** (à côté de
  « Mes observations ») montre les **perchoirs connus** de l'espèce (une note libre : où
  elle se pose d'habitude) et les spots où tu l'as vue. **Tous mes spots** ouvre la liste
  de tes affûts et points d'observation : nom, position GPS, meilleures heures, notes et
  une photo facultative.
- **Page d'un spot** : la distance et la direction depuis ta position (« À 1,2 km au
  nord-est », calculées sans réseau), les liens Carte et Itinéraire (avec réseau), les
  heures de tes observations sur place et les espèces que tu y as vues.
- **Dans le formulaire d'observation**, le champ **Spot** est facultatif : choisis un spot,
  ou **Nouveau spot…** pour le créer sur place. Le lieu et la position GPS du spot sont
  repris si l'observation n'a pas déjà les siens. Sur la page d'un spot, **Nouvelle
  observation ici** remplit tout cela d'avance.
- Les spots et les perchoirs partent dans les sauvegardes, et le CSV a une colonne `spot`.

### Nouveautés de la version 1.3

- **Trois langues** : le bouton **FR / БГ / EN** (en haut à droite) passe toute l'appli en
  français, en bulgare ou en anglais : menus, boutons, messages, dates, fiches et
  descriptions des 147 espèces. Les noms d'oiseaux restent affichés dans les 3 langues,
  celle choisie en premier. Tes propres textes (lieux, notes) ne sont jamais traduits.
- **Export CSV** : les titres des colonnes et les libellés (groupe, comportement, météo)
  suivent la langue de l'appli.
- **Filtres à choix multiples** (1.3.1) : dans le catalogue, les filtres Groupes, Habitats
  et Présence ouvrent une liste à cocher. Coche-en autant que tu veux (par exemple rapaces
  diurnes + rapaces nocturnes) : la liste se met à jour à chaque case.
- **Catalogue vérifié** (1.3.2) : 21 noms bulgares alignés sur l'atlas de la BSPB, statuts
  UICN confirmés. Il ne reste que 5 espèces « à vérifier », dont la présence autour de
  Karlovo n'est pas confirmée.

### Nouveautés de la version 1.2

- **Mode sortie** (Mes obs. > Démarrer une sortie, ou appui long sur l'icône) : tu comptes
  les oiseaux au fil de la balade, un toucher sur **+** = un individu. À la fin, chaque espèce
  devient une observation, et un bilan s'affiche (nouvelles espèces, partage). Si l'appli se
  ferme, la sortie reprend où tu en étais.
- **Chants et cris** : dans le formulaire, enregistre au micro (3 min max) ou importe un
  fichier son. Les sons sont inclus dans les sauvegardes .zip.
- **Saison** (ligne du jour en haut du catalogue) : lever et coucher du soleil, heures dorée
  et bleue, phase de la lune, arrivées et départs du mois, tes premières de l'année.
- **Cibles** (bouton « Cibles » à côté de la ligne du jour, ou « Cible » sur la fiche d'une
  espèce) : les espèces que tu veux trouver, rangées en « à chercher ce mois-ci », « plus tard »
  et « trouvées », avec leurs habitats. La pastille du bouton compte celles de saison, et
  l'appli te félicite quand tu en observes une.
- **Carte à partager** : sur la fiche d'une espèce observée, « Partager » crée une jolie image
  (ta photo, les noms en 4 langues, le lieu, la date) pour WhatsApp, Instagram…

Tes observations et tes photos restent **sur ton appareil** (base IndexedDB du navigateur).
Rien n'est envoyé sur Internet.

---

## 1. Mettre l'appli en ligne avec GitHub Pages (gratuit)

Tu n'as besoin que d'un navigateur sur ton PC.

1. Crée un compte gratuit sur <https://github.com>.
2. En haut à droite, clique sur **+** puis **New repository**.
   - *Repository name* : `carnet-oiseaux`
   - Coche **Public** (obligatoire pour GitHub Pages gratuit).
   - Clique sur **Create repository**.
3. Sur la page du dépôt, clique sur le lien **uploading an existing file**.
4. Ouvre le dossier de l'appli sur ton PC et **glisse-dépose** dans la page :
   `index.html`, `sw.js`, `manifest.webmanifest`, `README.md`
   et les dossiers `carte`, `css`, `data`, `icons`, `images`, `js`.
   N'envoie pas le dossier caché `.claude`, il ne sert qu'aux tests.
5. En bas, clique sur **Commit changes**.
6. Va dans **Settings** (onglet du dépôt) puis **Pages** (menu de gauche) :
   - *Source* : **Deploy from a branch**
   - *Branch* : **main** et **/ (root)**, puis **Save**.
7. Attends 1 à 2 minutes et recharge la page : l'adresse de ton appli s'affiche,
   par exemple `https://ton-pseudo.github.io/carnet-oiseaux/`.

> Le dépôt est public : n'importe qui peut voir le **code** de l'appli. Tes observations
> et tes photos, elles, ne sont **jamais** sur GitHub : elles restent dans ton téléphone.

## 2. Installer l'appli sur ton téléphone Samsung

1. Avec du réseau (Wi-Fi), ouvre **Chrome** sur le téléphone et va à l'adresse de l'appli.
2. Menu **⋮** (en haut à droite), puis **Ajouter à l'écran d'accueil** et **Installer**.
   Avec *Samsung Internet* : menu **≡**, **Ajouter la page à**, **Écran d'accueil**.
3. Ouvre l'appli une première fois depuis la nouvelle icône, toujours avec du réseau :
   elle se met en mémoire.
4. **Test** : active le mode avion et rouvre l'appli. Tout doit fonctionner.
5. La première fois que tu touches **Ma position**, autorise l'accès à la position.

Astuce : un appui long sur l'icône propose **Nouvelle observation** directement.

Sur PC (Chrome ou Edge), ouvre la même adresse puis clique sur l'icône **Installer** dans
la barre d'adresse.

## 3. Sauvegarder et passer du téléphone au PC

Le téléphone et le PC ont **chacun leur propre base** : on passe de l'un à l'autre avec
la sauvegarde.

1. Sur le téléphone, va dans **Sauvegarde** puis **Sauvegarde complète (.zip)**.
   Le fichier arrive dans *Téléchargements*, ou bien utilise **Partager** pour l'envoyer
   vers Google Drive.
2. Copie le fichier sur le PC, par exemple avec le câble USB (dossier *Download*).
3. Sur le PC, va dans **Sauvegarde** puis **Importer** et choisis le fichier.
   Les données sont **fusionnées** : rien n'est écrasé, la version la plus récente de
   chaque observation est gardée, et une observation supprimée ne revient pas. Les
   spots et les perchoirs connus sont fusionnés de la même façon.

Ensuite, **Nouveautés seulement** produit un petit fichier avec ce qui a changé depuis la
dernière sauvegarde. Au-delà de 1 Go, la sauvegarde complète est découpée en plusieurs
fichiers : importe-les ensemble.

⚠ **Ne vide jamais les données de Chrome et ne désinstalle pas l'appli sans avoir fait une
sauvegarde** : c'est là que sont stockées tes observations.

## 4. Corriger ou compléter le catalogue

Tout est dans **`data/especes.js`**, modifiable avec n'importe quel éditeur de texte
(Bloc-notes, VS Code…). Chaque espèce ressemble à ceci :

```js
{
  id: "pic-epeiche",                 // ne plus le changer une fois utilisé
  fr: "Pic épeiche", bg: "Голям пъстър кълвач", en: "Great Spotted Woodpecker", la: "Dendrocopos major",
  groupe: "pics", presence: ["resident"], mois: TOUTE_ANNEE,
  habitats: ["foret", "village"], uicn: "LC",
  description: "…",
  description_en: "…",               // la description en anglais
  description_bg: "…",               // la description en bulgare
  aVerifier: true,                   // facultatif : affiche le badge « ? »
  note: "Ce qu'il faut vérifier"     // facultatif : affiché sur la fiche
                                     // (traduite dans note_en et note_bg)
}
```

Si `description_en` ou `description_bg` manque, la fiche affiche la description française.

- `presence` : `resident`, `estivant`, `hivernant`, `passage` (on peut en mettre plusieurs).
- `mois` : mois de présence habituelle (1 = janvier). Sert au filtre « visibles en ce moment ».
- `uicn` : statut **mondial** de la Liste rouge (`LC`, `NT`, `VU`, `EN`, `CR`).
- Les noms bulgares suivent l'atlas des oiseaux nicheurs de la BSPB (Българско дружество
  за защита на птиците, [atlas.bspb.org](https://atlas.bspb.org)) et les statuts UICN ont
  été vérifiés sur BirdLife DataZone (novembre 2026).
- Les **5 espèces** encore marquées `aVerifier: true` vivent en Bulgarie, mais leur présence
  autour de Karlovo n'est pas confirmée (le filtre « Infos à vérifier » du catalogue les
  affiche). Si tu en observes une, garde une photo, puis retire le `aVerifier` et la note.

### Corriger une traduction

Les textes de l'appli en anglais et en bulgare sont dans **`data/traductions.js`**, une ligne
par texte : `"texte français": ["English", "Български"],`. Change seulement l'anglais ou le
bulgare (jamais le français de gauche, c'est lui que l'appli cherche), garde les
`{mots entre accolades}`, puis augmente la version (voir 5). Si une traduction manque,
l'appli affiche le français.

### Changer une photo de référence

Les photos sont dans `images/especes/` : `<id>.jpg` (fiche, 640 px maximum) et
`mini/<id>.jpg` (vignette carrée 160 × 160). Pour en changer une, remplace les deux
fichiers et mets à jour son crédit (auteur, licence, source) dans `data/photos.js`.
Change aussi sa petite empreinte `v:` (n'importe quelle nouvelle valeur) pour que les
téléphones la retéléchargent. Choisis une photo **sous licence libre** (Wikimedia Commons)
et cite toujours son auteur.

## 5. Mettre à jour l'appli

Après **toute** modification (y compris `data/especes.js`) :

1. Ouvre `sw.js` et augmente la version : `const VERSION = 'v1.0.1';`
2. Renvoie les fichiers modifiés sur GitHub (**Add file**, **Upload files**, **Commit**).
3. Sur le téléphone, ouvre l'appli avec du réseau : un bandeau
   **« Nouvelle version disponible »** apparaît. Touche **Mettre à jour**.

Tes observations ne sont pas touchées par une mise à jour.

## 6. Export CSV (inventaire Smokinya)

**Sauvegarde**, puis **Tableau des observations (.csv)**. Le fichier est en UTF-8 avec le
séparateur `;`, et s'ouvre directement dans Excel ou LibreOffice (le cyrillique compris).

Colonnes (appli en français) : `date ; heure ; espece_fr ; nom_latin ; nom_bulgare ;
nom_anglais ; groupe ; nombre ; lieu ; latitude ; longitude ; precision_m ; comportement ;
meteo ; temperature_c ; notes ; nb_photos ; id_observation ; nb_sons ; id_sortie ; spot`

Les titres des colonnes et les libellés (groupe, comportement, météo) suivent la langue de
l'appli : passe-la en bulgare ou en anglais avant l'export si besoin.

Si Smokinya utilise un autre modèle de colonnes, la fonction `csv()` se trouve dans
`js/sauvegarde.js` (les titres traduits sont dans `data/traductions.js`, « …||colonne CSV »).

## 7. Bon à savoir

- **Photos** : l'original est gardé intact pour le téléchargement (`espece_date.jpg`).
  Une copie allégée de 1600 px sert à l'affichage. Les photos au format HEIC
  (« photos haute efficacité » de Samsung) sont gardées mais sans aperçu : préfère le JPEG.
- **GPS des photos** : Android cache parfois la position des photos choisies dans la
  galerie. Sur le terrain, le bouton **Ma position** est plus fiable, et il marche sans
  réseau.
- **Carte** : une fois téléchargée, la carte de l'appli, la distance et la direction vers un
  spot marchent sans réseau. Les liens vers **Google Maps** (Itinéraire, Y aller avec
  Google Maps), eux, ont besoin de réseau. La carte occupe environ 25 Mo : **Retirer la
  carte du téléphone** (icône des calques sur la carte) libère cette place, tes spots et
  tes observations ne sont pas touchés.
- **Micro** : la première fois que tu touches « Enregistrer », autorise le micro. Les filtres
  « voix » du téléphone sont désactivés pour garder le chant fidèle.
- **Soleil et lune** : calculés sans réseau pour ta dernière position GPS (sinon Karlovo),
  à l'heure de Bulgarie.
- **Espace** : la page Sauvegarde affiche la place utilisée. Installer l'appli sur l'écran
  d'accueil aide le navigateur à « protéger » les données.

## 8. Tester sur ton PC avant de publier (facultatif)

Le service worker ne fonctionne pas en ouvrant `index.html` par double-clic (`file://`).
Pour tester avec toutes les fonctions, lance un petit serveur dans le dossier de l'appli,
par exemple avec Python : `py -m http.server 8080`. Ouvre ensuite <http://localhost:8080>.
En local, le mode hors connexion est désactivé pour ne pas gêner tes autres projets.
Ajoute `?sw=1` à l'adresse pour le tester : <http://localhost:8080/?sw=1>.

## 9. Mettre à jour la carte hors ligne (facultatif)

La carte vient d'OpenStreetMap, à travers la carte mondiale que Protomaps publie chaque jour.
Pour la rafraîchir (nouveaux chemins…) ou agrandir la zone, il faut **Node.js 18** ou plus
sur le PC. Les outils sont dans le dossier `outils/` :

1. Choisis une carte mondiale récente dans la liste
   <https://build-metadata.protomaps.dev/builds.json>
   (par exemple `https://build.protomaps.com/20261117.pmtiles`).
2. Si besoin, change la zone dans `outils/zone-carte.json` : `zone` est la zone détaillée
   (jusqu'au zoom 15), `niveaux` les zones des zooms plus larges.
3. `node outils/extraire-carte.js <adresse> outils/zone-carte.json` donne la taille de
   l'extrait. Ajoute `region.pmtiles` à la fin de la commande pour l'écrire : seuls les
   morceaux utiles sont lus, pas la carte mondiale entière.
4. `node outils/verifier-carte.js region.pmtiles <adresse>` vérifie l'extrait.
5. `node outils/preparer-carte.js …` (les paramètres sont expliqués en haut du fichier)
   remplit le dossier `carte/` et écrit `data/carte.js`.
6. Augmente la version dans `sw.js`, puis publie. Sur le téléphone, la carte affiche
   **Nouvelle carte disponible** : l'ancienne reste utilisable tant que la nouvelle n'est pas
   téléchargée.

Les licences de MapLibre, PMTiles, des styles Protomaps et de la police Noto Sans sont
dans `carte/LICENCES.md`. Données de la carte : © les contributeurs OpenStreetMap (ODbL).

## Structure des fichiers

```
index.html             page unique de l'appli
manifest.webmanifest   nom, icônes, couleurs (installation)
sw.js                  service worker : fonctionnement hors connexion
css/style.css          styles (thèmes clair et sombre, mobile et PC)
data/especes.js        le catalogue des espèces (descriptions en 3 langues)
data/traductions.js    textes de l'appli en anglais et en bulgare
data/photos.js         crédits des photos de référence
images/especes/        photos de référence (fiche + mini/ vignettes, CREDITS.md)
js/utils.js            outils (recherche, dates, réglages, espèces)
js/db.js               base de données IndexedDB
js/photos.js           compression, EXIF, téléchargement, visionneuse
js/zip.js              création et lecture des .zip (sans librairie)
js/astro.js            soleil et lune (calculs hors connexion)
js/sons.js             enregistrement et lecture des chants
js/partage.js          carte « Nouvelle espèce » à partager
js/saison.js           page Saison, ligne du jour
js/cibles.js           page Mes cibles
js/sortie.js           mode sortie (comptage et bilan)
js/spots.js            Mes spots, page d'un spot, perchoirs connus
js/itineraires.js      itinéraires : liens Google Maps, fichiers GPX et KML
js/carte.js            carte hors ligne : téléchargement, affichage, itinéraires
data/carte.js          liste des fichiers de la carte (tailles, empreintes)
carte/                 MapLibre, styles, polices, icônes et région (LICENCES.md)
outils/                découpage et préparation de la carte (Node.js)
js/catalogue.js        rubrique 1 : catalogue
js/observations.js     rubrique 2 : formulaire et listes
js/fiche.js            rubrique 3 : fiche espèce
js/stats.js            rubrique 4 : statistiques
js/sauvegarde.js       export, import, CSV, réglages
js/app.js              navigation, thème, démarrage
icons/                 icônes de l'appli
```

HTML, CSS et JavaScript « vanilla » : aucun framework, aucune étape de construction,
rien n'est chargé depuis un autre site. La seule bibliothèque, MapLibre (pour la carte),
est copiée dans `carte/`.
