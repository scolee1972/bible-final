import { FormEvent, useEffect, useMemo, useState } from "react";

type LanguageCode = "ko" | "en" | "es" | "fr" | "zh" | "ja" | "ru" | "he" | "pt";
type TabId = "home" | "bible" | "journal" | "hymn" | "support" | "member";
type SupportTab = "account" | "mobile" | "ars";
type Theme = "anxiety" | "gratitude" | "healing" | "relationship" | "guidance" | "forgiveness" | "work" | "faith" | "hope";
type Testament = "ot" | "nt";

type Localized = Partial<Record<LanguageCode, string>>;

interface Verse {
  id: string;
  theme: Theme;
  ref: Localized;
  text: Localized;
}

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  birth: string;
  gender: "male" | "female";
  marketing: boolean;
  privacy: boolean;
  createdAt: number;
}

interface PrayerEntry {
  id: string;
  createdAt: number;
  dateISO: string;
  userId: string;
  language: LanguageCode;
  prayer: string;
  themes: Theme[];
  verses: Verse[];
  opening: string;
  advice: string;
  closing: string;
}

interface AdviceResult {
  themes: Theme[];
  verses: Verse[];
  opening: string;
  advice: string;
  closing: string;
  usedAI: boolean;
}

interface BibleVersion {
  id: string;
  name: string;
  lang: LanguageCode;
}

interface BankInfo {
  bank: string;
  account: string;
  holder: string;
  contact: string;
}

interface Copy {
  appName: string;
  home: string;
  bible: string;
  journal: string;
  hymn: string;
  support: string;
  member: string;
  guest: string;
  pray: string;
  prayerPlaceholder: string;
  todayWord: string;
  getWordAgain: string;
  contextVerses: string;
  pastoralAdvice: string;
  openingLabel: string;
  closingLabel: string;
  faithJournal: string;
  noJournal: string;
  selectedDateEntries: string;
  bibleSetting: string;
  testament: string;
  oldTestament: string;
  newTestament: string;
  book: string;
  versions: string;
  max2: string;
  hymnTitle: string;
  hymnNumber: string;
  score: string;
  lyric: string;
  openScore: string;
  openLyric: string;
  ccmDaily: string;
  shuffleCCM: string;
  openVideo: string;
  supportTitle: string;
  accountSupport: string;
  mobileSupport: string;
  arsSupport: string;
  amount: string;
  customAmount: string;
  applySupport: string;
  login: string;
  logout: string;
  signup: string;
  username: string;
  checkDup: string;
  dupOk: string;
  dupFail: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  birth: string;
  male: string;
  female: string;
  marketing: string;
  privacy: string;
  save: string;
  loginFail: string;
  masterPanel: string;
  members: string;
  count: string;
  joined: string;
  adminBankEdit: string;
  holiday: string;
  aiBadge: string;
}

const STORAGE_USERS = "md-users-v1";
const STORAGE_ENTRIES = "md-entries-v1";
const STORAGE_SESSION = "md-session-v1";
const STORAGE_BANK = "md-bank-v1";
const MASTER_ID = "master_admin";
const MASTER_PW = "GraceAdmin2026!";
const DONATION_PRESETS = [5000, 10000, 20000, 30000, 50000, 100000] as const;

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80";

const LANGS: Array<{ id: LanguageCode; label: string; locale: string }> = [
  { id: "ko", label: "한국어", locale: "ko-KR" },
  { id: "en", label: "English", locale: "en-US" },
  { id: "es", label: "Espanol", locale: "es-ES" },
  { id: "fr", label: "Francais", locale: "fr-FR" },
  { id: "zh", label: "中文", locale: "zh-CN" },
  { id: "ja", label: "日本語", locale: "ja-JP" },
  { id: "ru", label: "Русский", locale: "ru-RU" },
  { id: "he", label: "עברית", locale: "he-IL" },
  { id: "pt", label: "Portugues", locale: "pt-PT" },
];

const COPY: Record<LanguageCode, Copy> = {
  ko: {
    appName: "나만의 기도일기",
    home: "홈",
    bible: "번역",
    journal: "동행일기",
    hymn: "찬송",
    support: "후원",
    member: "회원",
    guest: "게스트",
    pray: "기도드리기",
    prayerPlaceholder: "오늘의 바램, 걱정, 고민을 기도문으로 자유롭게 적어주세요.",
    todayWord: "오늘의 말씀",
    getWordAgain: "말씀\n다시 받기",
    contextVerses: "기도 맥락 맞춤 성경 구절",
    pastoralAdvice: "목회적 조언",
    openingLabel: "은혜의 문장",
    closingLabel: "격려의 마무리",
    faithJournal: "동행일기",
    noJournal: "해당 날짜 기록이 없습니다.",
    selectedDateEntries: "선택 날짜 기록",
    bibleSetting: "성경 설정",
    testament: "구분",
    oldTestament: "구약",
    newTestament: "신약",
    book: "성경 책",
    versions: "번역본",
    max2: "번역본은 최대 2개 선택 가능합니다.",
    hymnTitle: "찬송가/CCM",
    hymnNumber: "찬송가 번호 (1-645)",
    score: "악보",
    lyric: "가사",
    openScore: "악보 열기",
    openLyric: "가사 열기",
    ccmDaily: "오늘의 무료 CCM 추천",
    shuffleCCM: "다른 추천",
    openVideo: "영상 열기",
    supportTitle: "사역 후원",
    accountSupport: "계좌 후원",
    mobileSupport: "휴대폰 후원",
    arsSupport: "ARS 후원",
    amount: "후원금액",
    customAmount: "직접입력",
    applySupport: "후원하기",
    login: "로그인",
    logout: "로그아웃",
    signup: "회원가입",
    username: "아이디",
    checkDup: "중복확인",
    dupOk: "사용 가능한 아이디입니다.",
    dupFail: "이미 사용 중인 아이디입니다.",
    password: "비밀번호",
    name: "이름",
    phone: "전화번호",
    email: "이메일",
    birth: "생년월일",
    male: "남자",
    female: "여자",
    marketing: "(선택) 이메일 수신 동의",
    privacy: "(필수) 개인정보 처리 동의",
    save: "저장",
    loginFail: "아이디 또는 비밀번호를 확인해 주세요.",
    masterPanel: "마스터 관리",
    members: "가입 회원",
    count: "기도 수",
    joined: "가입일",
    adminBankEdit: "계좌 정보 수정",
    holiday: "절기",
    aiBadge: "AI 상담",
  },
  en: { appName: "Word Companion AI", home: "Home", bible: "Bible", journal: "Journal", hymn: "Hymn", support: "Support", member: "Member", guest: "Guest", pray: "Pray", prayerPlaceholder: "Write your prayer freely.", todayWord: "Today's Word", getWordAgain: "Get\nWord Again", contextVerses: "Context-matched Verses", pastoralAdvice: "Pastoral Advice", openingLabel: "Opening", closingLabel: "Closing", faithJournal: "Journal", noJournal: "No entries on this date.", selectedDateEntries: "Entries", bibleSetting: "Bible Settings", testament: "Testament", oldTestament: "Old Testament", newTestament: "New Testament", book: "Book", versions: "Versions", max2: "Select up to 2 versions.", hymnTitle: "Hymn/CCM", hymnNumber: "Hymn Number (1-645)", score: "Score", lyric: "Lyrics", openScore: "Open Score", openLyric: "Open Lyrics", ccmDaily: "Daily Free CCM", shuffleCCM: "Shuffle", openVideo: "Open Video", supportTitle: "Mission Support", accountSupport: "Account Support", mobileSupport: "Mobile Support", arsSupport: "ARS Support", amount: "Amount", customAmount: "Custom", applySupport: "Support", login: "Login", logout: "Logout", signup: "Sign Up", username: "Username", checkDup: "Check", dupOk: "Available username.", dupFail: "Username already used.", password: "Password", name: "Name", phone: "Phone", email: "Email", birth: "Birth", male: "Male", female: "Female", marketing: "(Optional) Email updates", privacy: "(Required) Privacy agreement", save: "Save", loginFail: "Invalid credentials.", masterPanel: "Master Admin", members: "Members", count: "Prayers", joined: "Joined", adminBankEdit: "Edit Bank Info", holiday: "Holiday", aiBadge: "AI" },
  es: {} as Copy,
  fr: {} as Copy,
  zh: {} as Copy,
  ja: {} as Copy,
  ru: {} as Copy,
  he: {} as Copy,
  pt: {} as Copy,
};

for (const code of ["es", "fr", "zh", "ja", "ru", "he", "pt"] as LanguageCode[]) {
  COPY[code] = COPY.en;
}

const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "krv", name: "개역개정", lang: "ko" },
  { id: "hrv", name: "개역한글", lang: "ko" },
  { id: "co", name: "공동번역", lang: "ko" },
  { id: "kjv", name: "KJV", lang: "en" },
  { id: "esv", name: "ESV", lang: "en" },
  { id: "nasb", name: "NASB", lang: "en" },
  { id: "rvr", name: "RVR1960", lang: "es" },
  { id: "lsg", name: "LSG", lang: "fr" },
  { id: "cuv", name: "和合本", lang: "zh" },
  { id: "kougo", name: "口語訳", lang: "ja" },
  { id: "synodal", name: "Синодальный", lang: "ru" },
  { id: "hebrew", name: "עברית מודרנית", lang: "he" },
  { id: "ara", name: "Almeida Revista", lang: "pt" },
];

const BOOKS_OT = ["창세기", "출애굽기", "레위기", "민수기", "신명기", "시편", "잠언", "이사야", "예레미야"];
const BOOKS_NT = ["마태복음", "마가복음", "누가복음", "요한복음", "사도행전", "로마서", "고린도전서", "에베소서", "요한계시록"];

const THEME_KEYWORDS: Record<Theme, string[]> = {
  anxiety: ["불안", "염려", "두려움", "걱정", "panic", "anxiety", "fear", "ansioso"],
  gratitude: ["감사", "고마움", "은혜", "thank", "grateful", "gratitude"],
  healing: ["치유", "아픔", "병", "상처", "healing", "sick", "pain"],
  relationship: ["관계", "가정", "부부", "친구", "용납", "family", "relationship"],
  guidance: ["인도", "결정", "선택", "길", "guidance", "direction", "discern"],
  forgiveness: ["용서", "죄", "회개", "forgive", "forgiveness", "repent"],
  work: ["직장", "일", "진로", "사업", "work", "career", "job"],
  faith: ["믿음", "신앙", "확신", "faith", "trust", "belief"],
  hope: ["소망", "희망", "미래", "기대", "hope", "future"],
};

const VERSES: Verse[] = [
  { id: "v1", theme: "anxiety", ref: { ko: "빌립보서 4:6-7", en: "Philippians 4:6-7" }, text: { ko: "아무 것도 염려하지 말고 기도와 간구로 하나님께 아뢰라.", en: "Do not be anxious about anything, but in every situation, by prayer present your requests to God." } },
  { id: "v2", theme: "anxiety", ref: { ko: "이사야 41:10", en: "Isaiah 41:10" }, text: { ko: "두려워하지 말라 내가 너와 함께 함이라.", en: "Do not fear, for I am with you." } },
  { id: "v3", theme: "hope", ref: { ko: "예레미야 29:11", en: "Jeremiah 29:11" }, text: { ko: "너희에게 미래와 희망을 주려 하는 생각이라.", en: "I know the plans I have for you, plans to give you hope and a future." } },
  { id: "v4", theme: "guidance", ref: { ko: "잠언 3:5-6", en: "Proverbs 3:5-6" }, text: { ko: "마음을 다하여 여호와를 신뢰하라.", en: "Trust in the Lord with all your heart." } },
  { id: "v5", theme: "healing", ref: { ko: "시편 147:3", en: "Psalm 147:3" }, text: { ko: "상심한 자들을 고치시며 상처를 싸매시는도다.", en: "He heals the brokenhearted and binds up their wounds." } },
  { id: "v6", theme: "forgiveness", ref: { ko: "요한일서 1:9", en: "1 John 1:9" }, text: { ko: "우리가 죄를 자백하면 그는 미쁘시고 의로우사 사하신다.", en: "If we confess our sins, he is faithful and just to forgive us." } },
  { id: "v7", theme: "relationship", ref: { ko: "에베소서 4:2-3", en: "Ephesians 4:2-3" }, text: { ko: "겸손과 온유로 사랑 가운데 서로 용납하라.", en: "Be completely humble and gentle; be patient, bearing with one another in love." } },
  { id: "v8", theme: "work", ref: { ko: "골로새서 3:23", en: "Colossians 3:23" }, text: { ko: "무슨 일을 하든지 마음을 다하여 주께 하듯 하라.", en: "Whatever you do, work at it with all your heart, as working for the Lord." } },
  { id: "v9", theme: "faith", ref: { ko: "히브리서 11:1", en: "Hebrews 11:1" }, text: { ko: "믿음은 바라는 것들의 실상이다.", en: "Faith is confidence in what we hope for." } },
  { id: "v10", theme: "gratitude", ref: { ko: "데살로니가전서 5:16-18", en: "1 Thessalonians 5:16-18" }, text: { ko: "범사에 감사하라.", en: "Give thanks in all circumstances." } },
  { id: "v11", theme: "hope", ref: { ko: "로마서 15:13", en: "Romans 15:13" }, text: { ko: "소망의 하나님이 기쁨과 평강을 충만하게 하시기를 원하노라.", en: "May the God of hope fill you with all joy and peace." } },
  { id: "v12", theme: "guidance", ref: { ko: "시편 32:8", en: "Psalm 32:8" }, text: { ko: "내가 네 갈 길을 가르쳐 보이고 너를 주목하여 훈계하리로다.", en: "I will instruct you and teach you in the way you should go." } },
];

const OPENING_A = [
  "사랑하는 성도님, 오늘도 기도의 자리로 오신 것을 축복합니다.",
  "주님의 이름으로 문안드립니다. 이 기도는 은혜의 시작입니다.",
  "하나님은 지금도 성도님의 마음을 세밀하게 듣고 계십니다.",
  "지금의 기도는 약함의 표시가 아니라 믿음의 행동입니다.",
  "주님 앞에 마음을 올려 드린 이 순간이 회복의 문이 됩니다.",
  "성도님의 탄식과 눈물도 하나님께는 귀한 기도입니다.",
  "오늘 기도 제목 안에 주님의 위로가 이미 시작되었습니다.",
  "예수님의 평강이 성도님의 생각과 마음을 지키시길 축복합니다.",
  "말씀으로 다시 서기를 소망하는 마음 자체가 은혜입니다.",
  "기도는 현실을 도피하는 길이 아니라 하나님과 동행하는 길입니다.",
];

const OPENING_B = [
  "두려움을 평안으로",
  "상처를 회복으로",
  "혼란을 분별로",
  "지침을 새 힘으로",
  "염려를 감사로",
  "낙심을 소망으로",
  "갈등을 화해로",
  "눈물을 기쁨으로",
  "막막함을 인도로",
  "어둠을 빛으로",
];

const OPENING_C = [
  "오늘의 걸음에서",
  "관계의 자리에서",
  "일터의 자리에서",
  "가정의 자리에서",
  "기도의 골방에서",
];

const EXAMPLE_A = [
  "직장에서 평가가 두려워 밤마다 잠들지 못하던 성도가 있었습니다. 그는 하루 10분 말씀 묵상과 짧은 기도로 마음을 정돈했고, 몇 주 후 같은 상황 속에서도 흔들림이 줄었습니다.",
  "관계 갈등으로 교회 출석조차 힘들어하던 집사가 있었습니다. 감정을 먼저 쏟기보다 시편 한 편을 읽고 대화를 시작하자 대화의 톤이 달라지고 회복의 길이 열렸습니다.",
  "진로 앞에서 마음이 조급했던 청년이 있었습니다. 그는 결정 자체보다 '주님과 동행하는 사람'이 되는 것을 먼저 목표로 삼았고, 결과적으로 더 건강한 선택을 하게 되었습니다.",
  "가정의 긴장 속에서 매일 짧은 감사기도를 드린 가정이 있었습니다. 문제는 즉시 사라지지 않았지만 서로를 대하는 말이 바뀌며 분위기가 바뀌었습니다.",
  "건강 문제로 불안을 겪던 권사님이 계셨습니다. 검사 결과를 기다리는 동안 말씀 카드를 붙잡고 기도했더니, 두려움에 눌리기보다 하나님을 신뢰하는 힘이 자랐습니다.",
  "경제적 압박으로 낙심하던 집사님이 있었습니다. 그는 현실을 부정하지 않고 구체적 계획과 기도를 병행했고, 공동체의 도움 속에서 다시 일어섰습니다.",
  "자녀 문제로 마음이 무너지던 부모가 있었습니다. 정답을 강요하기보다 먼저 함께 기도하며 듣는 태도로 바꾸었더니 관계가 서서히 회복되었습니다.",
  "반복되는 실패로 자신을 정죄하던 성도가 있었습니다. 용서의 말씀을 매일 고백하며 작은 순종을 쌓자 자책의 늪에서 벗어나기 시작했습니다.",
];

const EXAMPLE_B = [
  "그 변화는 하루아침에 오지 않았지만 방향은 분명히 달라졌습니다.",
  "문제의 크기보다 하나님의 임재가 더 크게 느껴지기 시작했습니다.",
  "환경은 같아도 마음의 중심이 주님께 고정되기 시작했습니다.",
  "상황이 정리되기 전에 먼저 마음이 정돈되었습니다.",
  "감정의 파도 속에서도 말씀이 닻이 되어 주었습니다.",
  "멈춰 있던 삶의 리듬이 기도 안에서 다시 살아났습니다.",
  "관계의 문이 한 번에 열리진 않았지만 닫힌 문에 빛이 스며들었습니다.",
  "두려움을 없애는 대신 두려움보다 큰 신뢰가 세워졌습니다.",
];

const EXAMPLE_C = [
  "그는 매일 말씀 한 절을 손으로 써서 지갑에 넣고 다녔습니다.",
  "그는 대화 전에 30초 침묵기도를 먼저 드렸습니다.",
  "그는 잠들기 전 감사 제목 세 가지를 기록했습니다.",
  "그는 감정이 커질 때 시편 한 편을 소리 내어 읽었습니다.",
  "그는 중요한 선택 앞에서 하루를 더 기도하며 기다렸습니다.",
  "그는 공동체에 도움을 요청하고 함께 중보를 받았습니다.",
];

const CLOSINGS = [
  "주님께서 오늘 성도님의 길을 지키시고, 내일의 걸음을 평강으로 인도하시길 축복합니다.",
  "성도님의 기도는 하나님 보좌 앞에서 결코 작지 않습니다. 담대히 계속 기도하십시오.",
  "예수 그리스도의 은혜가 오늘의 무게를 이길 새 힘으로 임하시길 축복합니다.",
  "지금 붙잡은 말씀이 오늘의 버팀목이 되고, 내일의 간증이 되길 축복합니다.",
];

const FREE_CCM_LINKS = [
  "https://www.youtube.com/watch?v=0e7v5f8mM8c",
  "https://www.youtube.com/watch?v=PjN3JkA8rY4",
  "https://www.youtube.com/watch?v=QvLxZEU02uI",
  "https://www.youtube.com/watch?v=8KQ7jGf12V8",
  "https://www.youtube.com/watch?v=eB6zQ8v4h-I",
  "https://www.youtube.com/watch?v=sx8WqzY1h2M",
  "https://www.youtube.com/watch?v=I2nA4R8dG9Y",
];

const getText = (lang: LanguageCode) => COPY[lang] || COPY.en;
const pick = <T,>(arr: T[], seed: number) => arr[Math.abs(seed) % arr.length];

const hash = (text: string) => {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h << 5) - h + text.charCodeAt(i);
  return Math.abs(h);
};

const getDateISO = (time: number) => new Date(time).toISOString().slice(0, 10);

const easterDate = (year: number) => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
};

const holidaysOf = (year: number) => {
  const easter = easterDate(year);
  const ash = new Date(easter);
  ash.setDate(easter.getDate() - 46);
  const palm = new Date(easter);
  palm.setDate(easter.getDate() - 7);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);
  const arr = [
    { key: "01-01", name: "신년감사주일" },
    { key: `${String(ash.getMonth() + 1).padStart(2, "0")}-${String(ash.getDate()).padStart(2, "0")}`, name: "사순절 시작" },
    { key: `${String(palm.getMonth() + 1).padStart(2, "0")}-${String(palm.getDate()).padStart(2, "0")}`, name: "종려주일" },
    { key: `${String(easter.getMonth() + 1).padStart(2, "0")}-${String(easter.getDate()).padStart(2, "0")}`, name: "부활주일" },
    { key: `${String(pentecost.getMonth() + 1).padStart(2, "0")}-${String(pentecost.getDate()).padStart(2, "0")}`, name: "성령강림주일" },
    { key: "12-25", name: "성탄절" },
  ];
  return arr;
};

const detectThemes = (prayer: string): Theme[] => {
  const low = prayer.toLowerCase();
  const scores = (Object.keys(THEME_KEYWORDS) as Theme[]).map((theme) => ({
    theme,
    score: THEME_KEYWORDS[theme].reduce((acc, word) => acc + (low.includes(word.toLowerCase()) ? 1 : 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);
  const picked = scores.filter((s) => s.score > 0).slice(0, 3).map((s) => s.theme);
  return picked.length ? picked : ["hope", "guidance", "faith"];
};

const pickVerses = (themes: Theme[], prayer: string): Verse[] => {
  const seed = hash(prayer + themes.join("|"));
  const out: Verse[] = [];
  for (let i = 0; i < themes.length && out.length < 3; i += 1) {
    const pool = VERSES.filter((v) => v.theme === themes[i]);
    if (pool.length) out.push(pool[(seed + i) % pool.length]);
  }
  if (out.length < 3) {
    const pool = [...VERSES].sort((a, b) => hash(a.id + prayer) - hash(b.id + prayer));
    for (const v of pool) {
      if (!out.find((x) => x.id === v.id)) out.push(v);
      if (out.length === 3) break;
    }
  }
  return out.slice(0, 3);
};

const generateOpeningPool = () => {
  const rows: string[] = [];
  for (const a of OPENING_A) {
    for (const b of OPENING_B) {
      for (const c of OPENING_C) {
        rows.push(`${a} ${c} 주님께서 ${b}로 이끄실 것을 믿습니다.`);
      }
    }
  }
  return rows;
};

const generateCasePool = () => {
  const rows: string[] = [];
  for (const a of EXAMPLE_A) {
    for (const b of EXAMPLE_B) {
      for (const c of EXAMPLE_C) {
        rows.push(`${a} ${b} ${c}`);
      }
    }
  }
  return rows;
};

const OPENING_POOL = generateOpeningPool();
const CASE_POOL = generateCasePool();

const localAdvice = (prayer: string, lang: LanguageCode): AdviceResult => {
  const themes = detectThemes(prayer);
  const verses = pickVerses(themes, prayer);
  const seed = hash(prayer + lang + Date.now().toString());
  const opening = pick(OPENING_POOL, seed);
  const caseOne = pick(CASE_POOL, seed + 11);
  const caseTwo = pick(CASE_POOL, seed + 29);
  const closing = pick(CLOSINGS, seed + 7);

  const advice = [
    `기도의 내용은 "${prayer}"입니다. 하나님은 이 기도의 정황과 마음의 결을 이미 알고 계십니다.`,
    "",
    `${verses[0].ref[lang] || verses[0].ref.ko} 말씀은 지금 가장 먼저 마음을 붙들어야 할 중심을 알려줍니다. ${verses[0].text[lang] || verses[0].text.ko}`,
    "",
    `${verses[1].ref[lang] || verses[1].ref.ko} 말씀은 상황을 바꾸기 전에 시선을 하나님께 고정시키라고 권면합니다. ${verses[1].text[lang] || verses[1].text.ko}`,
    "",
    `${verses[2].ref[lang] || verses[2].ref.ko} 말씀은 오늘의 선택을 믿음의 방향으로 정렬하도록 도와줍니다. ${verses[2].text[lang] || verses[2].text.ko}`,
    "",
    `예를 들면, ${caseOne}`,
    "",
    `또 다른 현장에서는, ${caseTwo}`,
    "",
    "그래서 오늘은 문제를 한 번에 해결하려 하기보다, 말씀 한 절을 소리 내어 고백하고 짧게라도 기도의 호흡을 이어가십시오. 그 작은 순종이 내일의 큰 분별을 준비합니다.",
  ].join("\n");

  return { themes, verses, opening, advice, closing, usedAI: false };
};

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const App = () => {
  const [lang, setLang] = useState<LanguageCode>("ko");
  const [tab, setTab] = useState<TabId>("home");
  const [supportTab, setSupportTab] = useState<SupportTab>("account");
  const [testament, setTestament] = useState<Testament>("ot");
  const [book, setBook] = useState(BOOKS_OT[0]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["krv"]);

  const [users, setUsers] = useState<User[]>(() => readJson<User[]>(STORAGE_USERS, []));
  const [entries, setEntries] = useState<PrayerEntry[]>(() => readJson<PrayerEntry[]>(STORAGE_ENTRIES, []));
  const [sessionUser, setSessionUser] = useState<string>(() => localStorage.getItem(STORAGE_SESSION) || "");
  const [bankInfo, setBankInfo] = useState<BankInfo>(() =>
    readJson<BankInfo>(STORAGE_BANK, { bank: "국민은행", account: "000-000-00-000000", holder: "나만의 기도일기", contact: "contact@example.com" }),
  );

  const [prayer, setPrayer] = useState("");
  const [result, setResult] = useState<AdviceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [todayWord, setTodayWord] = useState<Verse>(() => VERSES[0]);

  const [signupForm, setSignupForm] = useState({ username: "", password: "", name: "", phone: "", email: "", birth: "", gender: "male" as "male" | "female", marketing: false, privacy: false });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [dupChecked, setDupChecked] = useState<"idle" | "ok" | "dup">("idle");
  const [pickedDate, setPickedDate] = useState(getDateISO(Date.now()));

  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [amount, setAmount] = useState<number>(10000);
  const [customAmount, setCustomAmount] = useState("");

  const [hymnNumber, setHymnNumber] = useState(1);
  const [ccmIndex, setCcmIndex] = useState(() => new Date().getDate() % FREE_CCM_LINKS.length);

  const t = getText(lang);
  const currentUser = useMemo(() => users.find((u) => u.id === sessionUser) || null, [users, sessionUser]);
  const isMaster = currentUser?.username === MASTER_ID;

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
  }, [entries]);
  useEffect(() => {
    if (sessionUser) localStorage.setItem(STORAGE_SESSION, sessionUser);
    else localStorage.removeItem(STORAGE_SESSION);
  }, [sessionUser]);
  useEffect(() => {
    localStorage.setItem(STORAGE_BANK, JSON.stringify(bankInfo));
  }, [bankInfo]);

  useEffect(() => {
    const seed = new Date().toDateString();
    setTodayWord(VERSES[hash(seed) % VERSES.length]);
  }, []);

  useEffect(() => {
    setBook(testament === "ot" ? BOOKS_OT[0] : BOOKS_NT[0]);
  }, [testament]);

  const visibleEntries = useMemo(() => {
    if (!currentUser) return [] as PrayerEntry[];
    if (isMaster) return entries;
    return entries.filter((e) => e.userId === currentUser.id);
  }, [entries, currentUser, isMaster]);

  const selectedDateEntries = useMemo(
    () => visibleEntries.filter((e) => e.dateISO === pickedDate).sort((a, b) => b.createdAt - a.createdAt),
    [visibleEntries, pickedDate],
  );

  const holidayLabel = useMemo(() => {
    const d = new Date();
    const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const hit = holidaysOf(d.getFullYear()).find((h) => h.key === key);
    return hit?.name || "";
  }, []);

  const toggleVersion = (id: string) => {
    setSelectedVersions((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const checkDup = () => {
    if (!signupForm.username.trim()) return;
    const exists = users.some((u) => u.username.toLowerCase() === signupForm.username.trim().toLowerCase()) || signupForm.username.trim() === MASTER_ID;
    setDupChecked(exists ? "dup" : "ok");
  };

  const submitSignup = (e: FormEvent) => {
    e.preventDefault();
    if (dupChecked !== "ok" || !signupForm.privacy || !signupForm.username || !signupForm.password || !signupForm.name) return;
    const user: User = {
      id: crypto.randomUUID(),
      username: signupForm.username.trim(),
      password: signupForm.password,
      name: signupForm.name,
      phone: signupForm.phone,
      email: signupForm.email,
      birth: signupForm.birth,
      gender: signupForm.gender,
      marketing: signupForm.marketing,
      privacy: signupForm.privacy,
      createdAt: Date.now(),
    };
    setUsers((prev) => [user, ...prev]);
    setSignupForm({ username: "", password: "", name: "", phone: "", email: "", birth: "", gender: "male", marketing: false, privacy: false });
    setDupChecked("idle");
  };

  const submitLogin = (e: FormEvent) => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (username === MASTER_ID && password === MASTER_PW) {
      const existing = users.find((u) => u.username === MASTER_ID);
      if (existing) setSessionUser(existing.id);
      else {
        const master: User = {
          id: crypto.randomUUID(),
          username: MASTER_ID,
          password: MASTER_PW,
          name: "Master",
          phone: "",
          email: "",
          birth: "",
          gender: "male",
          marketing: false,
          privacy: true,
          createdAt: Date.now(),
        };
        setUsers((prev) => [master, ...prev]);
        setSessionUser(master.id);
      }
      setLoginForm({ username: "", password: "" });
      return;
    }
    const user = users.find((u) => u.username === username && u.password === password);
    if (!user) {
      alert(t.loginFail);
      return;
    }
    setSessionUser(user.id);
    setLoginForm({ username: "", password: "" });
  };

  const praySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prayer.trim()) return;
    if (!currentUser) {
      alert("로그인 후 이용해 주세요.");
      setTab("member");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayer, language: lang, versions: selectedVersions, testament, book }),
      });
      let aiResult: AdviceResult | null = null;
      if (response.ok) {
        const data = await response.json();
        if (data?.ok && data?.result) {
          const themes = detectThemes(prayer);
          const verses = pickVerses(themes, prayer);
          aiResult = {
            themes,
            verses,
            opening: data.result.opening,
            advice: data.result.advice,
            closing: data.result.closing,
            usedAI: true,
          };
        }
      }

      const finalResult = aiResult || localAdvice(prayer, lang);
      setResult(finalResult);
      const entry: PrayerEntry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        dateISO: getDateISO(Date.now()),
        userId: currentUser.id,
        language: lang,
        prayer,
        themes: finalResult.themes,
        verses: finalResult.verses,
        opening: finalResult.opening,
        advice: finalResult.advice,
        closing: finalResult.closing,
      };
      setEntries((prev) => [entry, ...prev]);
      setPrayer("");
    } catch {
      const fallback = localAdvice(prayer, lang);
      setResult(fallback);
    } finally {
      setLoading(false);
    }
  };

    const formatDate = (time: number) => { const loc = LANGS.find((l) => l.id === lang)?.locale || "ko-KR"; const d = new Date(time); const y = d.getFullYear(); const m = d.getMonth() + 1; const day = d.getDate(); const w = ["일","월","화","수","목","금","토"][d.getDay()]; return `${y}년 ${m}월 ${day}일 ${w}요일`; };
  const hymnLinks = useMemo(() => {
    const n = Math.min(645, Math.max(1, hymnNumber));
    return {
      score: `https://hymnary.org/search?qu=number%3A${n}`,
      lyric: `https://hymnary.org/search?qu=lyrics%20${n}`,
    };
  }, [hymnNumber]);

  const ccmLink = FREE_CCM_LINKS[ccmIndex % FREE_CCM_LINKS.length];

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="bg-blue-700 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-md items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-black tracking-tight">{t.appName}</h1>
            <p className="mt-1 text-sm text-blue-100">{formatDate(Date.now())} · {currentUser?.name || t.guest} · {holidayLabel ? `${t.holiday}: ${holidayLabel}` : ""}</p>
          </div>
          <select value={lang} onChange={(e) => setLang(e.target.value as LanguageCode)} className="rounded-lg border border-blue-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800">
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>{l.label}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="mx-auto max-w-md space-y-4 px-3 pt-4">
        {tab === "home" && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-3">
              <form onSubmit={praySubmit} className="space-y-3">
                <textarea value={prayer} onChange={(e) => setPrayer(e.target.value)} placeholder={t.prayerPlaceholder} className="h-40 w-full rounded-xl border border-slate-300 p-3 text-base outline-none focus:border-blue-500" />
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-blue-700 py-3 text-lg font-bold text-white disabled:opacity-50">{loading ? "..." : t.pray}</button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="text-3xl font-extrabold text-blue-700">{t.todayWord}</h2>
                <button className="whitespace-pre-line text-right text-lg font-bold text-blue-700" onClick={() => setTodayWord(VERSES[Math.floor(Math.random() * VERSES.length)])}>{t.getWordAgain}</button>
              </div>
              <p className="text-2xl font-black">{todayWord.ref[lang] || todayWord.ref.ko || todayWord.ref.en}</p>
              <p className="mt-2 text-xl leading-9">{todayWord.text[lang] || todayWord.text.ko || todayWord.text.en}</p>
              <img src={FALLBACK_IMAGE} alt="verse" className="mt-3 h-44 w-full rounded-xl object-cover" />
            </section>

            {result && (
              <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-extrabold text-blue-700">{t.contextVerses}</h3>
                  {result.usedAI && <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{t.aiBadge}</span>}
                </div>
                {result.verses.map((v) => (
                  <div key={v.id} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-xl font-extrabold">{v.ref[lang] || v.ref.ko || v.ref.en}</p>
                    <p className="mt-1 text-lg leading-8">{v.text[lang] || v.text.ko || v.text.en}</p>
                  </div>
                ))}
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                  <p className="text-xl font-extrabold text-blue-700">{t.openingLabel}</p>
                  <p className="mt-1 whitespace-pre-wrap text-lg leading-8">{result.opening}</p>
                  <p className="mt-3 text-xl font-extrabold text-blue-700">{t.pastoralAdvice}</p>
                  <p className="mt-1 whitespace-pre-wrap text-lg leading-8">{result.advice}</p>
                  <p className="mt-3 text-xl font-extrabold text-blue-700">{t.closingLabel}</p>
                  <p className="mt-1 whitespace-pre-wrap text-lg leading-8">{result.closing}</p>
                </div>
              </section>
            )}
          </>
        )}

        {tab === "bible" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <h2 className="text-2xl font-extrabold text-blue-700">{t.bibleSetting}</h2>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-600">{t.testament}</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setTestament("ot")} className={`rounded-lg border px-3 py-2 font-bold ${testament === "ot" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{t.oldTestament}</button>
                <button onClick={() => setTestament("nt")} className={`rounded-lg border px-3 py-2 font-bold ${testament === "nt" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{t.newTestament}</button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-600">{t.book}</p>
              <select value={book} onChange={(e) => setBook(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {(testament === "ot" ? BOOKS_OT : BOOKS_NT).map((b) => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <p className="mb-2 text-sm font-bold text-slate-600">{t.versions}</p>
              <p className="mb-2 text-xs text-slate-500">{t.max2}</p>
              <div className="grid grid-cols-2 gap-2">
                {BIBLE_VERSIONS.map((v) => (
                  <button key={v.id} onClick={() => toggleVersion(v.id)} className={`rounded-lg border px-3 py-2 text-left text-sm font-semibold ${selectedVersions.includes(v.id) ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{v.name}</button>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "journal" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <h2 className="text-2xl font-extrabold text-blue-700">{t.faithJournal}</h2>
            <input type="date" value={pickedDate} onChange={(e) => setPickedDate(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            <p className="text-sm font-bold text-slate-600">{t.selectedDateEntries}: {selectedDateEntries.length}</p>
            {selectedDateEntries.length === 0 && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{t.noJournal}</p>}
            {selectedDateEntries.map((entry) => (
              <article key={entry.id} className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleTimeString()}</p>
                <p className="mt-1 text-base font-semibold">{entry.prayer}</p>
                <div className="mt-2 space-y-1">
                  {entry.verses.map((v) => <p key={v.id} className="text-sm font-semibold text-blue-700">{v.ref[entry.language] || v.ref.ko || v.ref.en}</p>)}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{entry.advice}</p>
              </article>
            ))}
          </section>
        )}

        {tab === "hymn" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <h2 className="text-2xl font-extrabold text-blue-700">{t.hymnTitle}</h2>
            <label className="text-sm font-bold text-slate-600">{t.hymnNumber}</label>
            <input type="number" min={1} max={645} value={hymnNumber} onChange={(e) => setHymnNumber(Math.min(645, Math.max(1, Number(e.target.value) || 1)))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            <div className="grid grid-cols-2 gap-2">
              <a href={hymnLinks.score} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-700 px-3 py-2 text-center font-bold text-white">{t.openScore}</a>
              <a href={hymnLinks.lyric} target="_blank" rel="noreferrer" className="rounded-lg bg-slate-700 px-3 py-2 text-center font-bold text-white">{t.openLyric}</a>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-sm font-bold text-slate-700">{t.lyric}</p>
              <p className="mt-1 text-sm text-slate-600">{`[${lang.toUpperCase()}] Hymn #${hymnNumber}. 공개 악보/가사 사이트 링크를 사용해 전체 악보와 가사를 확인하실 수 있습니다.`}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-lg font-extrabold text-blue-700">{t.ccmDaily}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => setCcmIndex((prev) => (prev + 1) % FREE_CCM_LINKS.length)} className="rounded-lg border border-slate-300 px-3 py-2 font-bold">{t.shuffleCCM}</button>
                <a href={ccmLink} target="_blank" rel="noreferrer" className="rounded-lg bg-blue-700 px-3 py-2 text-center font-bold text-white">{t.openVideo}</a>
              </div>
            </div>
          </section>
        )}

        {tab === "support" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="rounded-xl bg-orange-500 p-4 text-center text-white">
              <p className="text-2xl">♡</p>
              <h2 className="text-2xl font-black">{t.supportTitle}</h2>
            </div>

            <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button onClick={() => setSupportTab("account")} className={`rounded-md px-2 py-2 text-sm font-bold ${supportTab === "account" ? "bg-white text-blue-700" : "text-slate-500"}`}>{t.accountSupport}</button>
              <button onClick={() => setSupportTab("mobile")} className={`rounded-md px-2 py-2 text-sm font-bold ${supportTab === "mobile" ? "bg-white text-blue-700" : "text-slate-500"}`}>{t.mobileSupport}</button>
              <button onClick={() => setSupportTab("ars")} className={`rounded-md px-2 py-2 text-sm font-bold ${supportTab === "ars" ? "bg-white text-blue-700" : "text-slate-500"}`}>{t.arsSupport}</button>
            </div>

            {supportTab === "account" && (
              <div className="rounded-xl border border-slate-300 p-4">
                <h3 className="text-3xl font-black">{t.accountSupport}</h3>
                <div className="mt-3 rounded-xl bg-slate-100 p-3 text-center">
                  <p className="text-sm text-slate-500">은행</p>
                  <p className="text-2xl font-black">{bankInfo.bank}</p>
                  <p className="mt-2 text-sm text-slate-500">계좌번호</p>
                  <p className="text-2xl font-black text-blue-700">{bankInfo.account}</p>
                  <p className="mt-2 text-sm text-slate-500">예금주</p>
                  <p className="text-2xl font-black">{bankInfo.holder}</p>
                  <p className="mt-2 text-sm text-slate-500">문의</p>
                  <p className="text-sm font-semibold">{bankInfo.contact}</p>
                </div>
                {isMaster && (
                  <div className="mt-3 space-y-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-sm font-bold text-blue-700">{t.adminBankEdit}</p>
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={bankInfo.bank} onChange={(e) => setBankInfo((prev) => ({ ...prev, bank: e.target.value }))} />
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={bankInfo.account} onChange={(e) => setBankInfo((prev) => ({ ...prev, account: e.target.value }))} />
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={bankInfo.holder} onChange={(e) => setBankInfo((prev) => ({ ...prev, holder: e.target.value }))} />
                    <input className="w-full rounded-lg border border-slate-300 px-3 py-2" value={bankInfo.contact} onChange={(e) => setBankInfo((prev) => ({ ...prev, contact: e.target.value }))} />
                  </div>
                )}
              </div>
            )}

            {supportTab === "mobile" && (
              <div className="rounded-xl border border-slate-300 p-4">
                <h3 className="text-3xl font-black">{t.mobileSupport}</h3>
                <div className="mt-3 space-y-2">
                  <input placeholder={t.name} value={donorName} onChange={(e) => setDonorName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input placeholder={t.phone} value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <p className="text-sm font-bold text-slate-600">{t.amount}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {DONATION_PRESETS.map((v) => (
                      <button key={v} onClick={() => setAmount(v)} className={`rounded-lg border px-3 py-2 font-bold ${amount === v ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{v.toLocaleString()}원</button>
                    ))}
                    <button onClick={() => setAmount(Number(customAmount) || 0)} className="rounded-lg border border-slate-300 px-3 py-2 font-bold">{t.customAmount}</button>
                  </div>
                  <input type="number" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} placeholder={t.customAmount} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <button onClick={() => alert(`${t.applySupport}: ${amount.toLocaleString()}원`)} className="w-full rounded-lg bg-blue-700 py-3 text-lg font-bold text-white">{t.applySupport}</button>
                </div>
              </div>
            )}

            {supportTab === "ars" && (
              <div className="rounded-xl border border-slate-300 p-4">
                <h3 className="text-3xl font-black">{t.arsSupport}</h3>
                <div className="mt-3 rounded-xl bg-slate-100 p-4 text-center">
                  <p className="text-4xl">📞</p>
                  <p className="text-4xl font-black text-blue-700">060-700-####</p>
                </div>
              </div>
            )}
          </section>
        )}

        {tab === "member" && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
            <h2 className="text-2xl font-extrabold text-blue-700">{t.member}</h2>
            {!currentUser ? (
              <>
                <form onSubmit={submitSignup} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <h3 className="text-xl font-black">{t.signup}</h3>
                  <div className="flex gap-2">
                    <input value={signupForm.username} onChange={(e) => { setSignupForm((p) => ({ ...p, username: e.target.value })); setDupChecked("idle"); }} placeholder={t.username} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                    <button type="button" onClick={checkDup} className="rounded-lg border border-blue-700 px-3 py-2 font-bold text-blue-700">{t.checkDup}</button>
                  </div>
                  {dupChecked === "ok" && <p className="text-sm text-emerald-700">{t.dupOk}</p>}
                  {dupChecked === "dup" && <p className="text-sm text-rose-700">{t.dupFail}</p>}
                  <input type="password" value={signupForm.password} onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))} placeholder={t.password} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input value={signupForm.name} onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))} placeholder={t.name} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input value={signupForm.phone} onChange={(e) => setSignupForm((p) => ({ ...p, phone: e.target.value }))} placeholder={t.phone} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input type="email" value={signupForm.email} onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))} placeholder={t.email} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input type="date" value={signupForm.birth} onChange={(e) => setSignupForm((p) => ({ ...p, birth: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setSignupForm((p) => ({ ...p, gender: "male" }))} className={`rounded-lg border px-3 py-2 font-bold ${signupForm.gender === "male" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{t.male}</button>
                    <button type="button" onClick={() => setSignupForm((p) => ({ ...p, gender: "female" }))} className={`rounded-lg border px-3 py-2 font-bold ${signupForm.gender === "female" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300"}`}>{t.female}</button>
                  </div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={signupForm.marketing} onChange={(e) => setSignupForm((p) => ({ ...p, marketing: e.target.checked }))} />{t.marketing}</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={signupForm.privacy} onChange={(e) => setSignupForm((p) => ({ ...p, privacy: e.target.checked }))} />{t.privacy}</label>
                  <button type="submit" className="w-full rounded-lg bg-blue-700 py-2 font-bold text-white">{t.save}</button>
                </form>

                <form onSubmit={submitLogin} className="space-y-2 rounded-xl border border-slate-200 p-3">
                  <h3 className="text-xl font-black">{t.login}</h3>
                  <input value={loginForm.username} onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))} placeholder={t.username} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} placeholder={t.password} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
                  <button className="w-full rounded-lg bg-slate-800 py-2 font-bold text-white">{t.login}</button>
                  <p className="text-xs text-slate-500">master: {MASTER_ID} / {MASTER_PW}</p>
                </form>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-lg font-bold">{currentUser.name} ({currentUser.username})</p>
                  <p className="text-sm text-slate-600">{t.count}: {entries.filter((e) => e.userId === currentUser.id).length}</p>
                  <button onClick={() => setSessionUser("")} className="mt-2 rounded-lg bg-slate-800 px-3 py-2 text-white">{t.logout}</button>
                </div>
                {isMaster && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <h3 className="text-xl font-black text-blue-700">{t.masterPanel}</h3>
                    <div className="mt-2 space-y-2">
                      {users.map((u) => (
                        <div key={u.id} className="rounded-lg bg-white p-2 text-sm">
                          <p className="font-bold">{u.username} · {u.name}</p>
                          <p>{t.count}: {entries.filter((e) => e.userId === u.id).length}</p>
                          <p>{t.joined}: {new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-md grid-cols-6">
          {([
            ["home", t.home],
            ["bible", t.bible],
            ["journal", t.journal],
            ["hymn", t.hymn],
            ["support", t.support],
            ["member", t.member],
          ] as Array<[TabId, string]>).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`py-2 text-center text-sm font-semibold ${tab === id ? "text-blue-700" : "text-slate-500"}`}>{label}</button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;
