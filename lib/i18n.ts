/** Romanian UI strings — aplicația este doar în română */

export const ro = {
  app: {
    name: "NexTB",
    title: "NexTB: Transport București",
    description:
      "STB în timp real: tramvaie, autobuze și troleibuze în București, cu detalii vehicule, status AC și hărți de traseu.",
    tagline: "Transport București",
    manifestDescription: "Tracker STB în timp real pentru București",
  },
  legal: {
    termsTitle: "Termeni și condiții",
    privacyTitle: "Politica de confidențialitate",
    lastUpdated: "Ultima actualizare: iulie 2026",
    backHome: "Înapoi la pagina principală",
    terms: {
      intro:
        "Prin utilizarea NexTB („aplicația”), acceptați acești termeni. NexTB este un proiect independent, neafiliat cu STB SA, TPBI sau dezvoltatorii aplicației oficiale InfoTB.",
      unofficial:
        "NexTB nu este aplicația oficială STB. Este un instrument neoficial, oferit ca atare, fără garanții de acuratețe sau disponibilitate.",
      images:
        "Imaginile vehiculelor sunt utilizate exclusiv în scop necomercial, pentru identificarea tipurilor și modelelor de vehicule în beneficiul călătorilor. Nu revendicăm drepturi asupra acestor ilustrații.",
      publicData:
        "Datele despre autobuze, tramvaie, troleibuze, trasee și stații provin din surse publice sau comunitare (GTFS TPBI, metrouusor.com, transport-in-comun.ro, mo-bi.ro) și sunt prezentate fără modificări comerciale.",
      liveData:
        "Datele în timp real sunt preluate de la surse terțe. Pot exista întârzieri, erori sau indisponibilitate temporară. Verificați informațiile critice prin canalele oficiale STB.",
      acReports:
        "Rapoartele de AC defect sunt opiniile comunității de utilizatori, nu declarații oficiale STB. Statusul AC poate fi greșit.",
      respect:
        "Respectăm munca STB și a echipei InfoTB. NexTB este conceput ca un supliment informativ, nu ca o critică la adresa serviciilor oficiale.",
      liability:
        "Dezvoltatorul nu este responsabil pentru decizii de călătorie luate pe baza datelor din aplicație.",
    },
    privacy: {
      intro:
        "NexTB respectă confidențialitatea utilizatorilor. Nu este necesar un cont și nu colectăm date personale identificabile.",
      localStorage:
        "Preferințele (temă, favorite, setări de afișare) sunt stocate local în browserul dumneavoastră prin localStorage. Aceste date nu părăsesc dispozitivul.",
      acVotes:
        "La raportarea statusului AC, se transmite un identificator anonim hashuit server-ului, reprezentând ID-ul dvs. unic. Nu stocăm nume, email sau locație.",
      noAnalytics:
        "Nu folosim servicii de analiză sau tracking în prezent.",
      thirdParty:
        "Cererile de date live sunt transmise către mo-bi.ro / TPBI. Alertele provin de la STB. Consultați politicile acestor servicii pentru detalii suplimentare.",
      contact: "Pentru întrebări: cristian@koders.ro",
    },
  },
  github: {
    label: "Vezi codul sursă",
    repo: "github.com/rocristoi/nextb-web",
  },
  marketing: {
    openApp: "Deschide aplicația",
    openAppShort: "Deschide",
  },
  nav: {
    home: "Acasă",
    settings: "Setări",
    lines: "Linii",
    map: "Hartă",
    faultyAc: "AC defect",
    alerts: "Alerte",
    more: "Mai mult",
    lookup: "Căutare vehicul",
    fleetStats: "Statistici",
  },
  home: {
    title: "Acasă",
    subtitle: "Stațiile tale favorite",
    emptyTitle: "Nicio stație favorită",
    emptyHint: "Caută o stație pe hartă și apasă steaua pentru a o salva aici.",
    openMap: "Deschide harta",
    linesActive: (n: number) => (n === 1 ? "1 rută activă" : `${n} rute active`),
    soonest: "Cel mai aproape",
    alertOnLine: "Alertă activă pe linie",
    favoriteAdded: "Stație adăugată la favorite",
    favoriteRemoved: "Stație eliminată din favorite",
    addFavorite: "Adaugă la favorite",
    removeFavorite: "Elimină din favorite",
    disclaimerBanner:
      "NexTB este un proiect independent care completează InfoTB -nu îl înlocuiește. Pentru informații oficiale, consultați aplicația oficială InfoTB.",
    dismissBanner: "Am înțeles",
  },
  comfort: {
    great: "Confortabil",
    ok: "Acceptabil",
    poor: "Aglomerat",
    recommended: "Recomandat",
    acUncertain: "AC incert",
  },
  stopsAway: {
    label: (n: number) => `~${n} ${n == 1 ? "stație" : "stații"}`,
  },
  map: {
    loadingStops: "Se încarcă stațiile…",
    loadError:
      "Nu s-au putut încărca datele hărții. Încearcă din nou curând.",
    centerLocation: "Locația mea",
    myLocation: "Locația mea",
    stop: (id: string) => `Stația ${id}`,
    searchPlaceholder: "Caută o stație…",
    noSearchResults: "Nicio stație găsită",
  },
  theme: {
    light: "Temă deschisă",
    dark: "Temă închisă",
    switchToLight: "Comută la tema deschisă",
    switchToDark: "Comută la tema închisă",
  },
  station: {
    loading: "Se încarcă…",
    fallbackName: "Stație",
    close: "Închide",
    closePanel: "Închide panoul stației",
    serversBusy: "Serverele STB sunt ocupate",
    loadError: "Nu s-au putut încărca datele stației",
    retry: "Încearcă din nou peste câteva momente",
    noLines: "Nicio linie nu deservește această stație.",
    ac: "AC",
    noAc: "Fără AC",
    acUncertain: "AC incert",
    viewFleetInfo: "Vezi informații parc",
    trackVehicle: "Urmărește pe hartă",
    viewOnLine: "Vezi pe linie",
  },
  eta: {
    now: "Acum",
    oneMin: "1 min",
    minutes: (n: number) => `${n} ${n == 1 ? "minut" : "minute"}`,
    over17: "17+",
    minUnit: "min",
    unknown: "Necunoscut",
    dash: "—",
    dashShort: "-",
    over17Full: "17+ min",
  },
  lines: {
    title: "Linii",
    subtitle: "Caută trasee și vezi pozițiile vehiculelor în timp real",
    searchPlaceholder: "Caută linii…  (apasă /)",
    liveMap: "Hartă traseu live",
    noResults: "Nicio linie găsită",
    noResultsHint: "Încearcă alt termen de căutare.",
    noResultsEmpty: "Nu există linii de afișat.",
    enableRegionalHint: "Activează operatorii regionali din Setări pentru mai multe linii.",
    lineHeader: (name: string) => `Linia ${name}`,
    back: "Înapoi",
    tour: "Tur",
    retour: "Retur",
    vehicle: (id: string | number) => `Vehicul #${id}`,
    plate: "Număr",
    passengers: "Pasageri",
    viewFleetInfo: "Informații parc",
    hasAlert: "Alertă activă",
    alertCount: (n: number) => `${n} ${n == 1 ? "alertă activă" : "alerte active"}`,
  },
  fleet: {
    vehicle: (id: string | number) => `Vehicul #${id}`,
    depot: "Autobază",
    vin: "VIN",
    km: "Kilometraj (2010–2012)",
    ac: "Climatizare",
    source: (text: string) => `Sursă: ${text}`,
    statsTitle: "Statisticile noastre",
    statsSubtitle: "Parcul de vehicule, rețeaua GTFS și alte date pe care aplicația le folosește",
    tabBuses: "Autobuze",
    tabTrolleybuses: "Troleibuze",
    tabTrams: "Tramvaie",
    tabNetwork: "Rețea",
    byDepot: "Pe autobază",
    kmDistribution: "Kilometraj Citaro",
    dataDisclaimer: "Date parc: 2010–2019. Informațiile pot fi incorecte.",
    otokar: "Otokar Kent",
    citaro: "Mercedes Citaro",
    cityTour: "City Tour",
    total: (n: number) => `${n} ${n == 1 ? "vehicul" : "vehicule"}`,
    active: "Active",
    retired: "Retrase",
    withAc: "Cu AC",
    byManufacturer: "Pe producător",
    byModel: "Pe model",
    byType: "Pe tip",
    byDecade: "Pe deceniu",
    linesTram: "Rute tramvai",
    linesBus: "Rute autobuz",
    linesTrolley: "Rute troleibuz",
    totalLines: "Total rute",
    totalStops: "Stații GTFS",
    acReports: "Rapoarte AC",
    citaroAcRetrofit: "Citaro cu AC retroactiv",
    kmKnown: "Citaro cu km cunoscut",
    sourceMetrouusor: "Sursă: metrouusor.com",
    sourceTransportInComun: "Sursă: transport-in-comun.ro",
    sourceGtfs: "Sursă: GTFS TPBI",
    observations: "Observații",
    yearBuilt: "An fabricație",
    imported: "Adus în parc",
    manufacturer: "Producător",
    modelType: "Tip",
    axles: "Nr. osii",
  },
  lookup: {
    title: "Căutare vehicul",
    subtitle: "Caută după număr de înmatriculare sau ID parc",
    placeholder: "ex. B-423-STB sau 6423",
    noResults: "Niciun vehicul găsit",
    notFound: "Vehicul negăsit",
    liveOnLine: "În circulație",
    notInService: "Nu este în circulație acum",
    viewLine: "Urmărește pe hartă",
    trackLive: "Urmărește live",
    onLine: (name: string) => `Live pe linia ${name}`,
    back: "Înapoi",
    vehicleTitle: (id: string | number) => `Vehicul #${id}`,
    fleetDetails: "Detalii parc",
    liveStatus: "Status circulație",
    viewDetails: "Vezi detalii",
    passengersOnBoard: "Pasageri la bord",
    currentlyOnLine: (name: string) => `În circulație pe linia ${name}`,
    offlineHint: "Vehiculul nu transmite date live momentan.",
    inventoryId: "ID parc",
  },
  settings: {
    title: "Setări",
    subtitle: "Personalizează-ți experiența",
    display: "Afișare",
    appearance: "Temă",
    appearanceHint: "Alege modul luminos sau întunecat",
    additionalInfo: "Informații suplimentare vehicul",
    additionalInfoHint: "Număr, ID, statistici secundare",
    primaryDetail: "Detaliu principal",
    primaryDetailHint: "Afișat prominent pe cardurile vehiculelor",
    passengers: "Pasageri",
    about: "Despre",
    version: "Versiune",
    developer: "Dezvoltator",
    disclaimer: "NexTB este un proiect independent, neoficial. Datele live provin din surse publice.",
    terms: "Termeni și condiții",
    privacy: "Confidențialitate",
    github: "Cod sursă",
    regionalOperators: "Operatori regionali",
    regionalOperatorsHint: "Afișează linii STV, STCM și altele",
  },
  alerts: {
    title: "Alerte STB",
    subtitle: "Notificările oficiale STB",
    active: (count: number) =>
      count === 1 ? "alertă activă" : "alerte active",
    activeCount: (count: number) =>
      `${count} ${count === 1 ? "alertă activă" : "alerte active"}`,
    updating: "Se actualizează",
    allClear: "Totul e în regulă",
    noAlerts: "Nicio perturbare activă momentan.",
    readMore: "Citește mai mult",
    showLess: "Arată mai puțin",
    viewAll: "Vezi toate alertele",
    back: "Înapoi",
    justNow: "Chiar acum",
    minutesAgo: (n: number) => `acum ${n} ${n == 1 ? "minut" : "minute"}`,
    hoursAgo: (n: number) => `acum ${n} ${n == 1 ? "oră" : "ore"}`,
    daysAgo: (n: number) => `acum ${n} ${n == 1 ? "zi" : "zile"}`,
    affectsFavorites: "Afectează stațiile tale favorite",
  },
  faulty: {
    title: "AC defect",
    subtitle: "Raportează sau verifică statusul AC al vehiculelor",
    howItWorks: "Cum funcționează",
    howItWorksText:
      "Raportează statusul aerului condiționat: defect sau funcțional. La 1–4 raportări, statusul devine „incert”. La 5+ raportări, vehiculul apare cu statusul de AC defect.",
    vehicleIdPlaceholder: "ID vehicul",
    reportBroken: "AC defect",
    reportWorking: "AC funcționează",
    enterNumber: "Introdu un număr de vehicul.",
    voteRecorded: "Raport înregistrat!",
    networkError: "Eroare de rețea. Verifică conexiunea.",
    reportedList: "Vehicule raportate",
    noReports: "Niciun vehicul raportat momentan.",
    brokenVotes: (n: number) => `${n} ${n == 1 ? "raportare" : "raportări"} defect`,
    workingVotes: (n: number) => `${n} ${n == 1 ? "raportare" : "raportări"} OK`,
    confidence: {
      ok: "AC OK",
      uncertain: "AC incert",
      broken: "AC defect",
      none: "Fără AC",
    },
    add: "Adaugă",
    remove: "Elimină",
    added: (n: string) => `Vehiculul ${n} a fost adăugat cu succes!`,
    removed: (n: string) => `Vehiculul ${n} a fost eliminat cu succes!`,
  },
  install: {
    title: "Instalează NexTB",
    description: "Adaugă nexTB pe ecranul principal al dispozitivului tău pentru accesibilitate.",
    install: "Instalează",
    notNow: "Nu acum",
    dismiss: "Respinge",
  },
  toast: {
    success: "Succes",
    error: "Eroare",
    dismiss: "Închide",
  },
  vehicleType: {
    tram: "Tramvai",
    bus: "Autobuz",
    trolleybus: "Troleibuz",
    unknown: "Necunoscut",
    line: (type: string) => `${type}`,
  },
  api: {
    malformedRequest: "Cerere invalidă",
    vehicleExists: "Vehiculul există deja în listă!",
    vehicleAdded: "Vehicul adăugat cu succes",
    vehicleNotOnList: "Vehiculul nu este în listă!",
    vehicleRemoved: "Vehicul eliminat cu succes",
    voteRecorded: "Raport înregistrat",
    serverError: "Eroare de server",
    stopsLoadError: "Nu s-au putut încărca stațiile.",
    missingStationId: "Lipsește ID-ul stației",
    serviceUnavailable: "Serviciu indisponibil",
    provideDetails: "Furnizează detalii suplimentare",
    rateLimited: "Prea multe cereri. Încearcă mai târziu.",
    vehicleNoAc: "Acest vehicul nu are climatizare din fabrică.",
  },
} as const;

export function vehicleTypeLabel(type: string): string {
  const t = type.toLowerCase();
  if (t.includes("tram") || t === "tramvai") return ro.vehicleType.tram;
  if (t.includes("trolley") || t === "troleibuz") return ro.vehicleType.trolleybus;
  if (t.includes("bus") || t === "autobuz") return ro.vehicleType.bus;
  if (t === "unknown" || t === "necunoscut") return ro.vehicleType.unknown;
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function lineTypeLineLabel(type: string): string {
  return `${vehicleTypeLabel(type)}`;
}

export function comfortLabel(tier: "great" | "ok" | "poor"): string {
  return ro.comfort[tier];
}

export function acConfidenceLabel(c: "ok" | "uncertain" | "broken" | "none"): string {
  return ro.faulty.confidence[c];
}
