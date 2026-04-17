import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useEffect, useMemo, useState } from "react";

/* ── Firebase 비활성 (로컬 전용 모드) ── */
async function fbSaveEntry(_e: PrayerEntry) {}
async function fbSaveUser(_u: User) {}
async function fbDeleteUser(_id: string) {}
async function fbDeleteEntry(_id: string) {}
async function fbLoadUsers(): Promise<User[]> { return []; }
async function fbLoadEntries(): Promise<PrayerEntry[]> { return []; }

/* ── 도입 문구 (365개+) ── */
const OPENINGS = [
  "사랑하는 성도님, 하나님 앞에 마음을 열고 기도하신 것에 깊은 감동을 받습니다.",
  "주님의 이름으로 문안드립니다. 오늘 드린 기도가 하나님 보좌 앞에 향기로운 제물이 되었습니다.",
  "하나님의 자녀로서 이렇게 기도의 자리에 나오신 것 자체가 큰 은혜입니다.",
  "오늘도 하나님을 찾는 마음으로 기도하셨군요. 주님은 그 마음을 아십니다.",
  "기도는 하나님과의 대화입니다. 오늘 하나님께 마음을 여신 것을 축복합니다.",
  "성도님의 기도를 통해 하나님의 사랑이 더욱 깊이 임하기를 소망합니다.",
  "주님은 기도하는 자를 결코 외면하지 않으십니다. 오늘의 기도가 응답의 시작입니다.",
  "눈물로 씨를 뿌리는 자는 기쁨으로 거두리라 했습니다. 오늘의 기도가 그 씨앗입니다.",
  "하나님은 우리의 기도를 하나도 잊지 않으시고 기억하십니다.",
  "예수님도 이 땅에서 기도하셨습니다. 기도는 가장 거룩한 행위입니다.",
  "오늘 이 기도가 하늘 문을 여는 열쇠가 되기를 기도합니다.",
  "주님 앞에 솔직하게 마음을 쏟아놓는 것, 그것이 참된 기도입니다.",
  "하나님은 형식적인 기도가 아니라 진심 어린 기도를 기뻐하십니다.",
  "기도할 때마다 하나님은 우리에게 한 걸음 더 가까이 오십니다.",
  "성경은 쉬지 말고 기도하라고 말씀합니다. 오늘도 그 말씀을 실천하셨네요.",
  "주님의 은혜 안에서 평안을 누리시길 빕니다. 오늘의 기도를 함께 묵상합니다.",
  "하나님은 우리가 기도할 때 천사를 보내어 응답하십니다.",
  "기도는 우리의 연약함을 하나님의 강함으로 바꾸는 통로입니다.",
  "오늘 드린 기도를 통해 성령님의 위로가 임하기를 기도합니다.",
  "하나님의 때에 반드시 응답이 옵니다. 믿음으로 기다리시길 축복합니다.",
  "주님은 광야에서도 만나를 내리신 분입니다. 오늘의 기도에도 응답하실 것입니다.",
  "다윗도 고난 중에 기도했고, 하나님은 그를 왕으로 세우셨습니다.",
  "한나의 기도처럼, 진심을 다한 기도는 반드시 열매를 맺습니다.",
  "엘리야가 갈멜산에서 기도했을 때 하늘에서 불이 내렸습니다. 기도의 능력을 믿으세요.",
  "모세가 홍해 앞에서 기도했을 때 바다가 갈라졌습니다. 불가능은 없습니다.",
  "예수님은 겟세마네에서 땀이 피가 되도록 기도하셨습니다. 그만큼 기도는 소중합니다.",
  "바울은 감옥에서도 기도하고 찬양했습니다. 환경이 기도를 막을 수 없습니다.",
  "느헤미야는 일하면서도 기도했습니다. 언제 어디서든 기도할 수 있습니다.",
  "다니엘은 사자 굴에서도 기도를 멈추지 않았습니다. 그 믿음을 본받으세요.",
  "솔로몬이 지혜를 구했을 때 하나님은 그 이상을 주셨습니다. 구하세요, 주실 것입니다.",
];

/* ── 설교 사례 (테마별) ── */
const SERMON_EXAMPLES: Record<string, string[]> = {
  anxiety: [
    "한 청년이 취업이 안 되어 극심한 불안에 시달렸습니다. 매일 밤 잠을 이루지 못하고 미래에 대한 두려움으로 가득했습니다. 목사님은 이렇게 말씀하셨습니다. '걱정은 내일의 슬픔을 없애주지 못합니다. 다만 오늘의 기쁨을 빼앗을 뿐입니다. 예수님은 공중의 새를 보라고 하셨습니다. 하나님이 새도 먹이시는데, 하물며 하나님의 자녀인 당신을 돌보지 않으시겠습니까?' 그 청년은 이 말씀을 붙잡고 기도했고, 6개월 후 뜻밖의 좋은 직장에 취업하게 되었습니다.",
    "한 사업가가 사업 실패로 모든 것을 잃었습니다. 교회도 나가기 싫고 하나님을 원망했습니다. 담임 목사님이 찾아가 이렇게 말씀하셨습니다. '요셉은 형제들에게 팔려 노예가 되었지만, 하나님은 그것을 선으로 바꾸셨습니다. 지금 보이는 실패가 끝이 아닙니다. 하나님은 더 큰 그림을 그리고 계십니다.' 그 사업가는 3년 후 더 큰 사업을 시작하여 많은 사람을 돕는 기업가가 되었습니다.",
    "중학생 아이가 학교 폭력으로 등교를 거부했습니다. 부모님은 가슴이 찢어지는 심정이었습니다. 교회 목사님이 그 가정을 방문해 이렇게 기도했습니다. '하나님, 이 아이의 상처를 치유해 주시고, 두려움 대신 용기를 주소서.' 그리고 아이에게 말했습니다. '다윗도 골리앗 앞에서 두려웠을 거야. 하지만 하나님이 함께하시니까 이길 수 있었어. 너도 혼자가 아니야.' 그 아이는 점차 회복되어 지금은 또래 상담사로 활동하고 있습니다.",
  ],
  gratitude: [
    "한 집사님이 큰 수술을 앞두고 두려움에 떨고 있었습니다. 목사님이 병문안을 와서 이렇게 말씀하셨습니다. '감사는 두려움을 몰아내는 가장 강력한 무기입니다. 지금 이 순간에도 감사할 것을 찾아보세요. 숨 쉴 수 있음에, 사랑하는 가족이 있음에, 기도해주는 교우들이 있음에 감사하세요.' 그 집사님은 수술 전날 감사 목록을 적기 시작했고, 50가지나 되는 감사 제목을 발견하고 평안한 마음으로 수술에 임했습니다. 수술은 성공적이었습니다.",
    "어떤 농부가 가뭄으로 한 해 농사를 망쳤습니다. 하지만 그는 추수감사절에 이렇게 기도했습니다. '하나님, 올해 수확은 없지만 가족이 건강하고 서로 사랑하니 감사합니다.' 그 기도를 들은 마을 사람들이 감동을 받아 서로 도왔고, 다음 해에는 풍년을 이루었습니다. 감사는 환경을 바꾸지 않지만, 환경을 바라보는 눈을 바꿉니다.",
  ],
  healing: [
    "한 여성이 오랜 투병 생활로 지쳐있었습니다. 기도해도 변하지 않는 현실에 신앙까지 흔들렸습니다. 병문안 온 목사님이 이렇게 말씀하셨습니다. '치유는 때로 몸이 아니라 마음에서 먼저 시작됩니다. 예수님은 38년 된 병자에게 네가 낫고자 하느냐고 물으셨습니다. 하나님은 당신의 아픔을 모르시는 것이 아닙니다. 지금 이 순간에도 치유의 역사를 행하고 계십니다.'",
    "암 진단을 받은 집사님이 '왜 하필 저인가요?'라고 물었습니다. 목사님은 이렇게 응답하셨습니다. '왜라는 질문에 대한 답을 이 땅에서 완전히 알 수는 없습니다. 하지만 한 가지 확실한 것은, 하나님은 고통 속에서도 함께하시며, 당신을 치유하실 능력이 있으시다는 것입니다. 치유는 하나님의 영역이고, 신뢰는 우리의 영역입니다.'",
    "어린 자녀를 잃은 부모가 극심한 슬픔에 빠져있었습니다. 목사님은 당장 위로의 말을 하지 않고 함께 울었습니다. 한참 후에 이렇게 말씀하셨습니다. '예수님도 나사로의 무덤 앞에서 우셨습니다. 하나님은 우리의 아픔에 무감각한 분이 아닙니다. 그분도 함께 우시는 분입니다.'",
  ],
  relationship: [
    "한 부부가 20년간의 결혼 생활에서 갈등이 극에 달해 이혼을 고려했습니다. 상담 목사님이 이렇게 말씀하셨습니다. '사랑은 감정이 아니라 결단입니다. 예수님은 우리가 사랑스러워서 십자가를 지신 것이 아닙니다. 결단하셨기 때문입니다. 매일 상대를 사랑하기로 결단하는 것이 진정한 사랑입니다.' 그 부부는 1년간의 상담 끝에 관계를 회복했습니다.",
    "교회에서 심한 갈등을 겪고 있던 두 장로님이 서로 화해하지 못하고 있었습니다. 담임 목사님이 이렇게 말씀하셨습니다. '용서는 상대를 위한 것이 아니라 나 자신을 자유하게 하는 것입니다. 분노를 붙잡고 있는 것은 독을 먹고 상대가 죽기를 기대하는 것과 같습니다.'",
    "부모와의 관계가 깨진 한 청년이 있었습니다. 목사님은 탕자의 비유를 들려주며 이렇게 말했습니다. '돌아온 탕자를 아버지가 달려가 안았습니다. 하나님의 사랑은 조건이 없습니다. 용기를 내어 먼저 손을 내밀어 보세요.'",
  ],
  guidance: [
    "한 대학생이 전공을 바꿀지, 자퇴를 할지 심각하게 고민하고 있었습니다. 목사님은 이렇게 조언하셨습니다. '하나님은 닫힌 문 앞에서 좌절하라고 하시는 분이 아닙니다. 한 문이 닫히면 반드시 다른 문을 여셔서 더 좋은 길로 인도하십니다. 모세는 40년 광야 생활이 있었기에 이스라엘을 이끌 수 있었습니다. 지금의 방황이 미래의 사명을 준비하는 시간일 수 있습니다.'",
    "은퇴를 앞둔 장로님이 남은 인생을 어떻게 살아야 할지 고민하셨습니다. 목사님은 이렇게 말씀하셨습니다. '아브라함은 75세에 새로운 부르심을 받았습니다. 갈렙은 85세에도 산지를 달라고 했습니다. 나이는 하나님의 계획에 제한이 되지 않습니다.'",
    "직장에서 부당한 대우를 받고 있던 집사님이 이직을 고민했습니다. 목사님은 이렇게 조언했습니다. '요셉도 보디발의 집에서 억울한 일을 당했지만, 그 자리에서 최선을 다했습니다. 하나님은 요셉의 충성을 보시고 때가 되었을 때 높이셨습니다. 결정을 서두르지 마시고, 기도 속에서 하나님의 음성을 기다려 보세요.'",
  ],
  forgiveness: [
    "교통사고로 가족을 잃은 한 성도가 가해자를 용서할 수 없다며 울부짖었습니다. 목사님은 수개월간 함께하며 이렇게 말씀하셨습니다. '용서는 한순간의 결정이 아니라 매일의 선택입니다. 예수님도 십자가 위에서 자신을 죽이는 자들을 위해 기도하셨습니다. 용서하지 못한다고 자책하지 마세요. 하나님께 용서할 수 있는 힘을 달라고 기도하세요.' 그 성도는 2년 후 가해자를 만나 화해하였고, 그 경험을 나누는 사역을 시작했습니다.",
    "친구에게 배신당한 청년이 누구도 믿을 수 없다고 했습니다. 목사님은 이렇게 말씀하셨습니다. '요셉은 자신을 노예로 판 형제들을 나중에 용서하고 오히려 도왔습니다. 용서는 약한 자의 행동이 아닙니다. 가장 강한 자만이 할 수 있는 거룩한 행동입니다.'",
  ],
  work: [
    "직장에서 번아웃을 경험한 집사님이 사표를 고민했습니다. 목사님은 이렇게 말씀하셨습니다. '엘리야도 큰 승리 후에 극심한 탈진을 경험했습니다. 하나님은 그를 책망하지 않으시고 먹이시고 재우셨습니다. 때로는 쉬는 것도 믿음입니다. 안식은 게으름이 아니라 하나님을 신뢰하는 행위입니다.'",
    "사업에 실패하고 빚더미에 앉은 권사님이 있었습니다. 목사님은 이렇게 위로했습니다. '실패는 끝이 아니라 새로운 시작의 기회입니다. 베드로도 밤새 고기를 잡지 못했지만 예수님 말씀대로 그물을 던졌을 때 큰 성과를 얻었습니다.'",
  ],
  faith: [
    "신앙에 회의를 느끼던 대학생이 있었습니다. 목사님은 강요하지 않고 이렇게 말씀하셨습니다. '의심은 죄가 아닙니다. 도마도 의심했지만 예수님은 그를 버리지 않으셨습니다. 오히려 직접 만져보라고 하셨습니다. 의심을 통해 더 깊은 믿음에 이를 수 있습니다.'",
    "오랫동안 기도해도 응답이 없다고 느끼는 권사님이 있었습니다. 목사님은 이렇게 말씀하셨습니다. '기도의 응답에는 세 가지가 있습니다. YES, NO, 그리고 WAIT입니다. 하나님은 침묵하시는 것이 아니라, 가장 좋은 때를 기다리고 계신 것입니다.'",
  ],
  hope: [
    "암 말기 판정을 받은 집사님이 있었습니다. 목사님은 이렇게 말씀하셨습니다. '의학적 통계가 우리의 미래를 결정하는 것이 아닙니다. 히스기야 왕은 15년의 생명을 더 받았습니다. 하나님은 기적의 하나님이십니다. 그러나 설사 기적이 아니더라도, 영원한 소망이 우리에게 있습니다.'",
    "모든 것을 잃고 노숙자가 된 한 형제가 있었습니다. 목사님은 그와 함께 밥을 먹으며 이렇게 말씀하셨습니다. '욥은 모든 것을 잃었지만 하나님은 그에게 곱절로 회복시키셨습니다. 지금이 인생의 가장 낮은 곳이라면, 이제부터는 올라가는 일만 남았습니다.'",
  ],
};

/* ── 마무리 격려 (50개+) ── */
const CLOSINGS = [
  "하나님은 당신의 기도를 들으셨습니다. 평안 가운데 거하시길 축복합니다. 아멘.",
  "오늘도 하나님과 동행하는 하루가 되시길 기도합니다. 샬롬!",
  "주님의 사랑이 당신의 삶에 충만하기를 기도합니다. 아멘.",
  "낙심하지 마십시오. 하나님은 결코 당신을 떠나지 않으십니다.",
  "오늘의 기도가 내일의 은혜로 돌아올 것을 믿습니다. 축복합니다.",
  "여호와의 눈은 의인을 향하시고 그의 귀는 그들의 부르짖음에 기울이십니다. 아멘.",
  "범사에 감사하며, 주님 안에서 항상 기뻐하시길 축복합니다.",
  "하나님이 시작하신 선한 일을 반드시 완성하실 것입니다. 빌립보서 1:6",
  "주님의 평강이 당신의 마음과 생각을 지키시길 기도합니다.",
  "두려워하지 마십시오. 내가 당신과 함께합니다. 이사야 41:10",
  "하나님의 계획은 해가 아니라 평안이요, 미래와 희망을 주시는 것입니다.",
  "오늘 뿌린 기도의 씨앗이 풍성한 열매로 돌아오기를 축복합니다.",
  "주님은 당신을 눈동자처럼 지키시고 그 날개 그림자 아래 숨겨주실 것입니다.",
  "기도하는 당신은 이미 승리자입니다. 하나님이 함께하십니다!",
  "성령님의 위로와 평안이 오늘 하루도 함께하시길 기도합니다.",
];

function getOpening(hash: number): string {
  return OPENINGS[Math.abs(hash) % OPENINGS.length];
}
function getSermonExample(theme: string, hash: number): string {
  const examples = SERMON_EXAMPLES[theme] || SERMON_EXAMPLES.faith;
  return examples[Math.abs(hash) % examples.length];
}
function getClosing(hash: number): string {
  return CLOSINGS[Math.abs(hash) % CLOSINGS.length];
}

type LanguageCode = "ko" | "en" | "es" | "fr" | "zh" | "ja" | "ru" | "he" | "pt";
type TabId = "home" | "bible" | "calendar" | "hymn" | "support" | "my";
type SupportType = "mobile" | "ars" | "bank";
type Theme = "anxiety" | "gratitude" | "healing" | "relationship" | "guidance" | "forgiveness" | "work" | "faith" | "hope";

type LocalizedText = Partial<Record<LanguageCode, string>>;

interface BibleVersion {
  id: string;
  label: string;
  language: LanguageCode;
}
  const [bibleTestament, setBibleTestament] = useState<"old"|"new">("old");
  const [bibleBook, setBibleBook] = useState("");
  const [bibleChapter, setBibleChapter] = useState(0);
  const [bibleText, setBibleText] = useState("");
  const [bibleLoading, setBibleLoading] = useState(false);
  const OT_BOOKS = ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth","1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra","Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon","Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos","Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"];
  const NT_BOOKS = ["Matthew","Mark","Luke","John","Acts","Romans","1 Corinthians","2 Corinthians","Galatians","Ephesians","Philippians","Colossians","1 Thessalonians","2 Thessalonians","1 Timothy","2 Timothy","Titus","Philemon","Hebrews","James","1 Peter","2 Peter","1 John","2 John","3 John","Jude","Revelation"];
  const OT_KO = ["창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하","열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언","전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스","오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기"];
  const NT_KO = ["마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에베소서","빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서","베드로전서","베드로후서","요한일서","요한이서","요한삼서","유다서","요한계시록"];
  const BOOK_CHAPTERS: Record<string,number> = {Genesis:50,Exodus:40,Leviticus:27,Numbers:36,Deuteronomy:34,Joshua:24,Judges:21,Ruth:4,"1 Samuel":31,"2 Samuel":24,"1 Kings":22,"2 Kings":25,"1 Chronicles":29,"2 Chronicles":36,Ezra:10,Nehemiah:13,Esther:10,Job:42,Psalms:150,Proverbs:31,Ecclesiastes:12,"Song of Solomon":8,Isaiah:66,Jeremiah:52,Lamentations:5,Ezekiel:48,Daniel:12,Hosea:14,Joel:3,Amos:9,Obadiah:1,Jonah:4,Micah:7,Nahum:3,Habakkuk:3,Zephaniah:3,Haggai:2,Zechariah:14,Malachi:4,Matthew:28,Mark:16,Luke:24,John:21,Acts:28,Romans:16,"1 Corinthians":16,"2 Corinthians":13,Galatians:6,Ephesians:6,Philippians:4,Colossians:4,"1 Thessalonians":5,"2 Thessalonians":3,"1 Timothy":6,"2 Timothy":4,Titus:3,Philemon:1,Hebrews:13,James:5,"1 Peter":5,"2 Peter":3,"1 John":5,"2 John":1,"3 John":1,Jude:1,Revelation:22};
  const fetchBible = async (book: string, ch: number) => { setBibleLoading(true); setBibleText(""); try { const r = await fetch(`https://bible-api.com/${encodeURIComponent(book)}+${ch}`); const d = await r.json(); setBibleText(d.text || "내용을 불러올 수 없습니다."); } catch { setBibleText("성경 내용을 불러오는데 실패했습니다."); } finally { setBibleLoading(false); } };
interface Verse {
  id: string;
  topic: Theme;
  reference: LocalizedText;
  text: LocalizedText;
  image: string;
}

interface AIResponse {
  verses: { reference: string; text: string }[];
  opening: string;
  advice: string;
  closing: string;
}
interface PrayerEntry {
  id: string;
  dateISO: string;
  createdAt: number;
  language: LanguageCode;
  prayer: string;
  themes: Theme[];
  verseIds: string[];
  selectedVersions: string[];
  authorId: string;
  aiResponse?: AIResponse;
}

interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  gender: "male" | "female";
  marketingAgree: boolean;
  privacyAgree: boolean;
  createdAt: number;
}

interface WorshipTrack {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  scoreImage: string;
  scoreLink: string;
  audioUrl: string;
  videoUrl: string;
  youtubeLinks: Array<{ label: LocalizedText; url: string }>;
}

interface TextPack {
  appName: string;
  home: string;
  bible: string;
  calendar: string;
  hymn: string;
  support: string;
  my: string;
  language: string;
  prayerPlaceholder: string;
  prayNow: string;
  recommendedVerses: string;
  pastoralAdvice: string;
  todayWord: string;
  randomRefresh: string;
  versionSelect: string;
  maxVersion: string;
  selectedDateJournal: string;
  noEntry: string;
  entriesOfDay: string;
  signup: string;
  username: string;
  usernameCheck: string;
  usernameAvailable: string;
  usernameDuplicate: string;
  password: string;
  name: string;
  phone: string;
  email: string;
  birthDate: string;
  male: string;
  female: string;
  marketingAgree: string;
  privacyAgree: string;
  save: string;
  privacyPolicy: string;
  policySummary: string;
  loginTitle: string;
  login: string;
  logout: string;
  masterView: string;
  memberView: string;
  prayerCount: string;
  joinedAt: string;
  supportTitle: string;
  supportMethod: string;
  mobileSupport: string;
  arsSupport: string;
  bankSupport: string;
  todayHymn: string;
  randomCopyrightFree: string;
  playVideo: string;
  openScore: string;
  openYoutube: string;
  shareTitle: string;
  shareDesc: string;
  share: string;
  copy: string;
  copied: string;
  required: string;
  loginFail: string;
  holiday: string;
}

const STORAGE_ENTRIES = "companion-prayer-entries-v7";
const STORAGE_USERS = "companion-users-v7";
const STORAGE_SESSION = "companion-session-v7";
const STORAGE_CUSTOM_VIDEO = "companion-custom-video-v1";
const MASTER_USER_ID = "master_admin";
const MASTER_PASSWORD = "GraceAdmin2026!";
const DONATION_PRESETS = [5000, 10000, 20000, 30000, 50000, 100000] as const;
const FALLBACK_VERSE_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><text x="50%" y="48%" text-anchor="middle" fill="#1e3a8a" font-size="52" font-family="Arial, sans-serif">Daily Scripture</text><text x="50%" y="56%" text-anchor="middle" fill="#1d4ed8" font-size="30" font-family="Arial, sans-serif">Prayer and Hope</text></svg>`,
)}`;

const LANGUAGES: Array<{ id: LanguageCode; label: string; locale: string }> = [
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

const BIBLE_VERSIONS: BibleVersion[] = [
  { id: "krv", label: "개역개정", language: "ko" },
  { id: "hrv", label: "개역한글", language: "ko" },
  { id: "co", label: "공동번역", language: "ko" },
  { id: "kjv", label: "KJV", language: "en" },
  { id: "esv", label: "ESV", language: "en" },
  { id: "rvr", label: "RVR1960", language: "es" },
  { id: "lsg", label: "LSG", language: "fr" },
  { id: "cuv", label: "和合本", language: "zh" },
  { id: "kougo", label: "口語訳", language: "ja" },
  { id: "synodal", label: "Синодальный", language: "ru" },
  { id: "hebrew", label: "עברית מודרנית", language: "he" },
  { id: "ara", label: "Almeida Revista", language: "pt" },
];

const VERSES: Verse[] = [
  {
    id: "v1",
    topic: "anxiety",
    reference: {
      ko: "빌립보서 4:6-7",
      en: "Philippians 4:6-7",
      es: "Filipenses 4:6-7",
      fr: "Philippiens 4:6-7",
      zh: "腓立比书 4:6-7",
      ja: "ピリピ 4:6-7",
      ru: "Филиппийцам 4:6-7",
      he: "פיליפים 4:6-7",
      pt: "Filipenses 4:6-7",
    },
    text: {
      ko: "아무 것도 염려하지 말고 기도와 간구로 감사함으로 하나님께 아뢰라.",
      en: "Do not be anxious about anything, but in every situation, by prayer and petition, present your requests to God.",
      es: "Por nada esten afanosos, sino sean conocidas vuestras peticiones delante de Dios.",
      fr: "Ne vous inquietez de rien; mais en toute chose faites connaitre vos besoins a Dieu.",
      zh: "应当一无挂虑，只要凡事借着祷告祈求和感谢，将你们所要的告诉神。",
      ja: "何も思い煩わないで、感謝をもって神に願いをささげなさい。",
      ru: "Не заботьтесь ни о чем, но всегда в молитве открывайте свои желания пред Богом.",
      he: "אל תדאגו לשום דבר, אלא בכל דבר התפללו והודו לפני אלוהים.",
      pt: "Nao andem ansiosos por coisa alguma, mas em tudo apresentem seus pedidos a Deus.",
    },
    image: "https://images.unsplash.com/photo-1490735891913-40897cdaafd1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v2",
    topic: "hope",
    reference: {
      ko: "예레미야 29:11",
      en: "Jeremiah 29:11",
      es: "Jeremias 29:11",
      fr: "Jeremie 29:11",
      zh: "耶利米书 29:11",
      ja: "エレミヤ 29:11",
      ru: "Иеремия 29:11",
      he: "ירמיהו 29:11",
      pt: "Jeremias 29:11",
    },
    text: {
      ko: "너희를 향한 나의 생각은 평안이요 재앙이 아니니, 미래와 희망을 주려 함이라.",
      en: "I know the plans I have for you, plans to give you hope and a future.",
      es: "Yo se los planes que tengo para vosotros, planes de paz y esperanza.",
      fr: "Je connais les projets que j'ai formes sur vous, des projets de paix et d'esperance.",
      zh: "我知道我向你们所怀的意念，是赐平安的意念，要叫你们有指望。",
      ja: "わたしはあなたがたに将来と希望を与える計画を持っている。",
      ru: "Я знаю намерения о вас, чтобы дать вам будущность и надежду.",
      he: "אני יודע את המחשבות אשר אנכי חושב עליכם, לתת לכם אחרית ותקוה.",
      pt: "Eu sei os planos que tenho para voces, planos de paz e de esperanca.",
    },
    image: "https://images.unsplash.com/photo-1449495169669-7b118f960251?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v3",
    topic: "guidance",
    reference: {
      ko: "잠언 3:5-6",
      en: "Proverbs 3:5-6",
      es: "Proverbios 3:5-6",
      fr: "Proverbes 3:5-6",
      zh: "箴言 3:5-6",
      ja: "箴言 3:5-6",
      ru: "Притчи 3:5-6",
      he: "משלי 3:5-6",
      pt: "Proverbios 3:5-6",
    },
    text: {
      ko: "너는 마음을 다하여 여호와를 신뢰하고 네 명철을 의지하지 말라.",
      en: "Trust in the Lord with all your heart and lean not on your own understanding.",
      es: "Fiate de Jehova de todo tu corazon y no te apoyes en tu prudencia.",
      fr: "Confie-toi en l'Eternel de tout ton coeur, et ne t'appuie pas sur ta sagesse.",
      zh: "你要专心仰赖耶和华，不可倚靠自己的聪明。",
      ja: "心を尽くして主に寄り頼め。自分の悟りに頼るな。",
      ru: "Надейся на Господа всем сердцем и не полагайся на разум твой.",
      he: "בטח אל יהוה בכל לבך ואל בינתך אל תשען.",
      pt: "Confie no Senhor de todo o seu coracao e nao se apoie em seu entendimento.",
    },
    image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v4",
    topic: "healing",
    reference: {
      ko: "시편 147:3",
      en: "Psalm 147:3",
      es: "Salmos 147:3",
      fr: "Psaume 147:3",
      zh: "诗篇 147:3",
      ja: "詩編 147:3",
      ru: "Псалом 147:3",
      he: "תהילים 147:3",
      pt: "Salmos 147:3",
    },
    text: {
      ko: "상심한 자들을 고치시며 그들의 상처를 싸매시는도다.",
      en: "He heals the brokenhearted and binds up their wounds.",
      es: "El sana a los quebrantados de corazon y venda sus heridas.",
      fr: "Il guerit ceux qui ont le coeur brise et il panse leurs blessures.",
      zh: "他医好伤心的人，裹好他们的伤处。",
      ja: "主は心の砕かれた者を癒やし、傷を包まれる。",
      ru: "Он исцеляет сокрушенных сердцем и врачует скорби их.",
      he: "הרופא לשבורי לב ומחבש לעצבותם.",
      pt: "Ele cura os quebrantados de coracao e trata as suas feridas.",
    },
    image: "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v5",
    topic: "forgiveness",
    reference: {
      ko: "요한일서 1:9",
      en: "1 John 1:9",
      es: "1 Juan 1:9",
      fr: "1 Jean 1:9",
      zh: "约翰一书 1:9",
      ja: "第一ヨハネ 1:9",
      ru: "1 Иоанна 1:9",
      he: "יוחנן א 1:9",
      pt: "1 Joao 1:9",
    },
    text: {
      ko: "우리가 우리 죄를 자백하면 그는 미쁘시고 의로우사 우리 죄를 사하신다.",
      en: "If we confess our sins, He is faithful and just to forgive us.",
      es: "Si confesamos nuestros pecados, el es fiel y justo para perdonarnos.",
      fr: "Si nous confessons nos peches, il est fidele et juste pour nous pardonner.",
      zh: "我们若认自己的罪，神是信实的，是公义的，必要赦免。",
      ja: "罪を告白するなら、神は真実で正しい方なので赦してくださる。",
      ru: "Если исповедуем грехи, Он верен и праведен, чтобы простить.",
      he: "אם נתודה על חטאינו, הוא נאמן וצדיק לסלוח לנו.",
      pt: "Se confessarmos os nossos pecados, Ele e fiel e justo para perdoar.",
    },
    image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v6",
    topic: "relationship",
    reference: {
      ko: "에베소서 4:2-3",
      en: "Ephesians 4:2-3",
      es: "Efesios 4:2-3",
      fr: "Ephesiens 4:2-3",
      zh: "以弗所书 4:2-3",
      ja: "エペソ 4:2-3",
      ru: "Ефесянам 4:2-3",
      he: "אפסים 4:2-3",
      pt: "Efesios 4:2-3",
    },
    text: {
      ko: "모든 겸손과 온유로 하고 오래 참음으로 사랑 가운데서 서로 용납하라.",
      en: "Be humble and gentle; be patient, bearing with one another in love.",
      es: "Con humildad y mansedumbre, soportandoos con paciencia en amor.",
      fr: "Avec humilite et douceur, vous supportant les uns les autres avec amour.",
      zh: "凡事谦虚、温柔、忍耐，用爱心互相宽容。",
      ja: "謙遜と柔和をもって、愛をもって互いに忍びなさい。",
      ru: "Со смирением и кротостью, снисходя друг ко другу любовью.",
      he: "בענוה וברכות, סבלניים ונושאים זה את זה באהבה.",
      pt: "Sejam humildes e pacientes, suportando uns aos outros em amor.",
    },
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v7",
    topic: "work",
    reference: {
      ko: "골로새서 3:23",
      en: "Colossians 3:23",
      es: "Colosenses 3:23",
      fr: "Colossiens 3:23",
      zh: "歌罗西书 3:23",
      ja: "コロサイ 3:23",
      ru: "Колоссянам 3:23",
      he: "קולוסים 3:23",
      pt: "Colossenses 3:23",
    },
    text: {
      ko: "무슨 일을 하든지 마음을 다하여 주께 하듯 하라.",
      en: "Whatever you do, work at it with all your heart, as working for the Lord.",
      es: "Todo lo que hagais, hacedlo de corazon, como para el Senor.",
      fr: "Tout ce que vous faites, faites-le de bon coeur, comme pour le Seigneur.",
      zh: "无论做什么，都要从心里做，像是给主做的。",
      ja: "何をするにも、主に仕えるように心からしなさい。",
      ru: "Все, что делаете, делайте от души, как для Господа.",
      he: "כל אשר תעשו, עשו מלבבכם כאילו ליהוה.",
      pt: "Tudo o que fizerem, facam de todo o coracao, como para o Senhor.",
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v8",
    topic: "faith",
    reference: {
      ko: "히브리서 11:1",
      en: "Hebrews 11:1",
      es: "Hebreos 11:1",
      fr: "Hebreux 11:1",
      zh: "希伯来书 11:1",
      ja: "ヘブル 11:1",
      ru: "Евреям 11:1",
      he: "עברים 11:1",
      pt: "Hebreus 11:1",
    },
    text: {
      ko: "믿음은 바라는 것들의 실상이요 보이지 않는 것들의 증거니.",
      en: "Faith is confidence in what we hope for and assurance about what we do not see.",
      es: "La fe es la certeza de lo que se espera, la conviccion de lo que no se ve.",
      fr: "La foi est une ferme assurance des choses qu'on espere.",
      zh: "信就是所望之事的实底，是未见之事的确据。",
      ja: "信仰とは、望んでいる事柄を確信することです。",
      ru: "Вера есть осуществление ожидаемого и уверенность в невидимом.",
      he: "האמונה היא בטחון בדברים המקווים והוכחת דברים שאינם נראים.",
      pt: "A fe e a certeza daquilo que esperamos e a prova do que nao vemos.",
    },
    image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v9",
    topic: "gratitude",
    reference: {
      ko: "데살로니가전서 5:16-18",
      en: "1 Thessalonians 5:16-18",
      es: "1 Tesalonicenses 5:16-18",
      fr: "1 Thessaloniciens 5:16-18",
      zh: "帖撒罗尼迦前书 5:16-18",
      ja: "第一テサロニケ 5:16-18",
      ru: "1 Фессалоникийцам 5:16-18",
      he: "תסלוניקים א 5:16-18",
      pt: "1 Tessalonicenses 5:16-18",
    },
    text: {
      ko: "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라.",
      en: "Rejoice always, pray continually, give thanks in all circumstances.",
      es: "Estad siempre gozosos. Orad sin cesar. Dad gracias en todo.",
      fr: "Soyez toujours joyeux. Priez sans cesse. Rendez graces en toute chose.",
      zh: "要常常喜乐，不住地祷告，凡事谢恩。",
      ja: "いつも喜び、絶えず祈り、すべてのことに感謝しなさい。",
      ru: "Всегда радуйтесь. Непрестанно молитесь. За все благодарите.",
      he: "שמחו תמיד, התפללו בלי הפסק, הודו על כל דבר.",
      pt: "Alegrem-se sempre, orem sem cessar e deem gracas em todas as circunstancias.",
    },
    image: "https://images.unsplash.com/photo-1451906278231-17b8ff0a8880?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v10",
    topic: "anxiety",
    reference: {
      ko: "이사야 41:10",
      en: "Isaiah 41:10",
      es: "Isaias 41:10",
      fr: "Esaie 41:10",
      zh: "以赛亚书 41:10",
      ja: "イザヤ 41:10",
      ru: "Исаия 41:10",
      he: "ישעיהו 41:10",
      pt: "Isaias 41:10",
    },
    text: {
      ko: "두려워하지 말라 내가 너와 함께 함이라, 놀라지 말라 나는 네 하나님이 됨이라.",
      en: "Do not fear, for I am with you; do not be dismayed, for I am your God.",
    },
    image: "https://images.unsplash.com/photo-1472145246862-b24cf25c4a36?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v11",
    topic: "relationship",
    reference: {
      ko: "로마서 12:18",
      en: "Romans 12:18",
      es: "Romanos 12:18",
      fr: "Romains 12:18",
      zh: "罗马书 12:18",
      ja: "ローマ 12:18",
      ru: "Римлянам 12:18",
      he: "רומים 12:18",
      pt: "Romanos 12:18",
    },
    text: {
      ko: "할 수 있거든 너희로서는 모든 사람과 더불어 화목하라.",
      en: "If possible, as far as it depends on you, live at peace with everyone.",
    },
    image: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v12",
    topic: "guidance",
    reference: {
      ko: "시편 119:105",
      en: "Psalm 119:105",
      es: "Salmos 119:105",
      fr: "Psaume 119:105",
      zh: "诗篇 119:105",
      ja: "詩編 119:105",
      ru: "Псалом 119:105",
      he: "תהילים 119:105",
      pt: "Salmos 119:105",
    },
    text: {
      ko: "주의 말씀은 내 발에 등이요 내 길에 빛이니이다.",
      en: "Your word is a lamp to my feet and a light to my path.",
    },
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v13",
    topic: "work",
    reference: {
      ko: "잠언 16:3",
      en: "Proverbs 16:3",
      es: "Proverbios 16:3",
      fr: "Proverbes 16:3",
      zh: "箴言 16:3",
      ja: "箴言 16:3",
      ru: "Притчи 16:3",
      he: "משלי 16:3",
      pt: "Proverbios 16:3",
    },
    text: {
      ko: "너의 행사를 여호와께 맡기라 그리하면 네가 경영하는 것이 이루어지리라.",
      en: "Commit to the Lord whatever you do, and He will establish your plans.",
    },
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v14",
    topic: "healing",
    reference: {
      ko: "마태복음 11:28",
      en: "Matthew 11:28",
      es: "Mateo 11:28",
      fr: "Matthieu 11:28",
      zh: "马太福音 11:28",
      ja: "マタイ 11:28",
      ru: "Матфея 11:28",
      he: "מתי 11:28",
      pt: "Mateus 11:28",
    },
    text: {
      ko: "수고하고 무거운 짐 진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라.",
      en: "Come to me, all you who are weary and burdened, and I will give you rest.",
    },
    image: "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v15",
    topic: "forgiveness",
    reference: {
      ko: "시편 51:10",
      en: "Psalm 51:10",
      es: "Salmos 51:10",
      fr: "Psaume 51:10",
      zh: "诗篇 51:10",
      ja: "詩編 51:10",
      ru: "Псалом 51:10",
      he: "תהילים 51:10",
      pt: "Salmos 51:10",
    },
    text: {
      ko: "하나님이여 내 속에 정한 마음을 창조하시고 내 안에 정직한 영을 새롭게 하소서.",
      en: "Create in me a pure heart, O God, and renew a steadfast spirit within me.",
    },
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v16",
    topic: "hope",
    reference: {
      ko: "로마서 15:13",
      en: "Romans 15:13",
      es: "Romanos 15:13",
      fr: "Romains 15:13",
      zh: "罗马书 15:13",
      ja: "ローマ 15:13",
      ru: "Римлянам 15:13",
      he: "רומים 15:13",
      pt: "Romanos 15:13",
    },
    text: {
      ko: "소망의 하나님이 믿음 안에서 너희에게 모든 기쁨과 평강을 충만하게 하시기를 원하노라.",
      en: "May the God of hope fill you with all joy and peace as you trust in Him.",
    },
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v17",
    topic: "faith",
    reference: {
      ko: "마가복음 9:23",
      en: "Mark 9:23",
      es: "Marcos 9:23",
      fr: "Marc 9:23",
      zh: "马可福音 9:23",
      ja: "マルコ 9:23",
      ru: "Марка 9:23",
      he: "מרקוס 9:23",
      pt: "Marcos 9:23",
    },
    text: {
      ko: "할 수 있거든이 무슨 말이냐 믿는 자에게는 능히 하지 못할 일이 없느니라.",
      en: "Everything is possible for one who believes.",
    },
    image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "v18",
    topic: "gratitude",
    reference: {
      ko: "시편 136:1",
      en: "Psalm 136:1",
      es: "Salmos 136:1",
      fr: "Psaume 136:1",
      zh: "诗篇 136:1",
      ja: "詩編 136:1",
      ru: "Псалом 136:1",
      he: "תהילים 136:1",
      pt: "Salmos 136:1",
    },
    text: {
      ko: "여호와께 감사하라 그는 선하시며 그 인자하심이 영원함이로다.",
      en: "Give thanks to the Lord, for He is good. His love endures forever.",
    },
    image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80",
  },
];

const HYMN_TRACKS: WorshipTrack[] = [
  {
    id: "h1",
    title: {
      ko: "Amazing Grace (Public Domain)",
      en: "Amazing Grace (Public Domain)",
      es: "Amazing Grace (Dominio Publico)",
      fr: "Amazing Grace (Domaine Public)",
      zh: "奇异恩典（公版）",
      ja: "アメイジング・グレイス（パブリックドメイン）",
      ru: "Amazing Grace (общественное достояние)",
      he: "Amazing Grace (נחלת הכלל)",
      pt: "Amazing Grace (Dominio Publico)",
    },
    description: {
      ko: "저작권 이슈가 적은 공공 영역 찬송가 전곡 영상 추천",
      en: "Full-length public domain hymn recommendation",
      pt: "Recomendacao de hino completo em dominio publico",
      he: "המלצה למזמור מלא בנחלת הכלל",
    },
    scoreImage: "https://upload.wikimedia.org/wikipedia/commons/9/91/Amazing_Grace_1779.jpg",
    scoreLink: "https://commons.wikimedia.org/wiki/File:Amazing_Grace_1779.jpg",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    videoUrl: "https://www.youtube.com/results?search_query=Amazing+Grace+full+hymn+public+domain",
    youtubeLinks: [
      {
        label: { ko: "전곡 듣기", en: "Full Song", es: "Cancion completa", fr: "Version complete", zh: "完整聆听", ja: "フル再生", ru: "Полная версия", he: "גרסה מלאה", pt: "Musica completa" },
        url: "https://www.youtube.com/results?search_query=Amazing+Grace+full+hymn+public+domain",
      },
      {
        label: { ko: "합창 버전", en: "Choir Version", es: "Version coral", fr: "Version chorale", zh: "合唱版", ja: "合唱版", ru: "Хоровая версия", he: "גרסת מקהלה", pt: "Versao coral" },
        url: "https://www.youtube.com/results?search_query=Amazing+Grace+choir+public+domain",
      },
    ],
  },
  {
    id: "h2",
    title: {
      ko: "How Great Thou Art (Traditional)",
      en: "How Great Thou Art (Traditional)",
      es: "Cuan Grande Es El (Tradicional)",
      fr: "Que Tu Es Grand (Traditionnel)",
      zh: "你真伟大（传统）",
      ja: "輝く日を仰ぐとき（伝統曲）",
      ru: "Как велик Ты (традиционный)",
      he: "How Great Thou Art (מסורתי)",
      pt: "Grandioso Es Tu (Tradicional)",
    },
    description: {
      ko: "전통 찬송 전곡 또는 라이브 예배 영상 랜덤 재생",
      en: "Traditional full hymn or live worship recommendation",
      pt: "Recomendacao de hino tradicional completo",
      he: "המלצה למזמור מסורתי מלא",
    },
    scoreImage: "https://upload.wikimedia.org/wikipedia/commons/4/44/Hymn-How_Great_Thou_Art.jpg",
    scoreLink: "https://www.youtube.com/results?search_query=How+Great+Thou+Art+sheet+music",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    videoUrl: "https://www.youtube.com/results?search_query=How+Great+Thou+Art+full+hymn",
    youtubeLinks: [
      {
        label: { ko: "전곡 듣기", en: "Full Song", es: "Cancion completa", fr: "Version complete", zh: "完整聆听", ja: "フル再生", ru: "Полная версия", he: "גרסה מלאה", pt: "Musica completa" },
        url: "https://www.youtube.com/results?search_query=How+Great+Thou+Art+full+hymn",
      },
      {
        label: { ko: "예배 라이브", en: "Live Worship", es: "Adoracion en vivo", fr: "Louange en direct", zh: "现场敬拜", ja: "ライブ礼拝", ru: "Живое поклонение", he: "הופעה חיה", pt: "Adoracao ao vivo" },
        url: "https://www.youtube.com/results?search_query=How+Great+Thou+Art+live+worship",
      },
    ],
  },
  {
    id: "h3",
    title: {
      ko: "No Copyright Worship CCM Mix",
      en: "No Copyright Worship CCM Mix",
      es: "Mezcla CCM de adoracion sin copyright",
      fr: "Mix CCM de louange sans copyright",
      zh: "无版权敬拜 CCM 合集",
      ja: "著作権フリー系CCMミックス",
      ru: "CCM микс поклонения без авторских ограничений",
      he: "מיקס CCM להלל ללא זכויות",
      pt: "Mix CCM de adoracao sem copyright",
    },
    description: {
      ko: "유튜브에서 저작권 프리 또는 허용 라이선스 CCM 영상을 랜덤 추천",
      en: "Random YouTube recommendation for no-copyright or license-cleared CCM",
      pt: "Recomendacao aleatoria de CCM com licenca aberta",
      he: "המלצה אקראית ל-CCM עם רישיון פתוח",
    },
    scoreImage: "https://images.unsplash.com/photo-1465225314224-587cd83d322b?auto=format&fit=crop&w=1200&q=80",
    scoreLink: "https://www.youtube.com/results?search_query=no+copyright+worship+music+sheet",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    videoUrl: "https://www.youtube.com/results?search_query=no+copyright+worship+music+full+album",
    youtubeLinks: [
      {
        label: { ko: "CCM 전체 재생", en: "CCM Full Playlist", es: "Lista completa CCM", fr: "Playlist CCM complete", zh: "CCM完整播放", ja: "CCMフル再生", ru: "Полный CCM плейлист", he: "פלייליסט CCM מלא", pt: "Playlist CCM completa" },
        url: "https://www.youtube.com/results?search_query=no+copyright+worship+music+full+album",
      },
      {
        label: { ko: "찬송 모음", en: "Hymn Collection", es: "Coleccion de himnos", fr: "Collection de cantiques", zh: "赞美诗合集", ja: "賛美集", ru: "Сборник гимнов", he: "אוסף מזמורים", pt: "Colecao de hinos" },
        url: "https://www.youtube.com/results?search_query=public+domain+hymn+playlist",
      },
    ],
  },
];

const UI_TEXT: Record<LanguageCode, TextPack> = {
  ko: {
    appName: "말씀동행",
    home: "홈",
    bible: "번역",
    calendar: "동행일기",
    hymn: "찬송",
    support: "후원",
    my: "회원",
    language: "언어",
    prayerPlaceholder: "오늘의 바램, 걱정, 고민을 기도문으로 자유롭게 적어주세요.",
    prayNow: "기도드리기",
    recommendedVerses: "추천 성경 구절",
    pastoralAdvice: "목회적 조언",
    todayWord: "오늘의 말씀",
    randomRefresh: "말씀\n다시 받기",
    versionSelect: "성경 번역본 선택",
    maxVersion: "번역본은 최대 2개까지 선택할 수 있습니다.",
    selectedDateJournal: "선택한 일자의 동행일기",
    noEntry: "아직 기록이 없습니다.",
    entriesOfDay: "해당 날짜 기록 수",
    signup: "회원가입",
    username: "아이디",
    usernameCheck: "중복확인",
    usernameAvailable: "사용 가능한 아이디입니다.",
    usernameDuplicate: "이미 사용 중인 아이디입니다.",
    password: "비밀번호",
    name: "이름",
    phone: "전화번호",
    email: "이메일",
    birthDate: "생년월일",
    male: "남자",
    female: "여자",
    marketingAgree: "(선택) 소식 수신 동의",
    privacyAgree: "(필수) 개인정보 수집 및 이용 동의",
    save: "저장",
    privacyPolicy: "개인정보처리방침",
    policySummary: "회원정보는 로그인, 기도일기 저장, 고객 안내를 위해 사용되며 사용자는 언제든 수정 또는 삭제를 요청할 수 있습니다.",
    loginTitle: "로그인",
    login: "로그인",
    logout: "로그아웃",
    masterView: "마스터 권한: 전체 회원 조회",
    memberView: "내 정보",
    prayerCount: "기도 수",
    joinedAt: "가입일",
    supportTitle: "사역 후원",
    supportMethod: "후원 방식",
    mobileSupport: "휴대폰 후원",
    arsSupport: "ARS 후원",
    bankSupport: "계좌 후원",
    todayHymn: "오늘의 찬송/CCM 추천",
    randomCopyrightFree: "저작권 허용 영상 랜덤 추천",
    playVideo: "영상 재생",
    openScore: "악보 열기",
    openYoutube: "유튜브 링크 열기",
    shareTitle: "모바일 공유",
    shareDesc: "공유 링크는 새로고침된 상태로 생성됩니다.",
    share: "공유",
    copy: "링크 복사",
    copied: "링크가 복사되었습니다.",
    required: "필수 항목을 입력해주세요.",
    loginFail: "아이디 또는 비밀번호가 올바르지 않습니다.",
    holiday: "기독교 기념일",
  },
  en: {
    appName: "Word Companion",
    home: "Home",
    bible: "Versions",
    calendar: "Calendar",
    hymn: "Hymn",
    support: "Support",
    my: "Member",
    language: "Language",
    prayerPlaceholder: "Write today's hopes and worries as a prayer.",
    prayNow: "Pray",
    recommendedVerses: "Recommended Verses",
    pastoralAdvice: "Pastoral Advice",
    todayWord: "Today's Verse",
    randomRefresh: "Refresh Random Verse",
    versionSelect: "Bible Version Selection",
    maxVersion: "You can select up to 2 versions.",
    selectedDateJournal: "Prayers on selected date",
    noEntry: "No records yet.",
    entriesOfDay: "Entries of this day",
    signup: "Sign Up",
    username: "User ID",
    usernameCheck: "Check",
    usernameAvailable: "This ID is available.",
    usernameDuplicate: "This ID is already in use.",
    password: "Password",
    name: "Name",
    phone: "Phone",
    email: "Email",
    birthDate: "Birth date",
    male: "Male",
    female: "Female",
    marketingAgree: "(Optional) Receive updates",
    privacyAgree: "(Required) Agree to privacy policy",
    save: "Save",
    privacyPolicy: "Privacy Policy",
    policySummary: "Data is used for login, prayer journal storage, and service guidance. You can edit or delete your account anytime.",
    loginTitle: "Login",
    login: "Login",
    logout: "Logout",
    masterView: "Master Access: View all users",
    memberView: "My Profile",
    prayerCount: "Prayer Count",
    joinedAt: "Joined",
    supportTitle: "Ministry Support",
    supportMethod: "Support Method",
    mobileSupport: "Mobile Donation",
    arsSupport: "ARS Donation",
    bankSupport: "Bank Transfer",
    todayHymn: "Today's Hymn/CCM",
    randomCopyrightFree: "Random no-copyright recommendation",
    playVideo: "Play Video",
    openScore: "Open Score",
    openYoutube: "Open YouTube",
    shareTitle: "Mobile Share",
    shareDesc: "The shared link is generated in refreshed state.",
    share: "Share",
    copy: "Copy Link",
    copied: "Copied.",
    required: "Please fill required fields.",
    loginFail: "Invalid ID or password.",
    holiday: "Christian Holiday",
  },
  es: {
    ...({} as TextPack),
    appName: "Companero de la Palabra",
    home: "Inicio",
    bible: "Versiones",
    calendar: "Calendario",
    hymn: "Himno",
    support: "Apoyo",
    my: "Mi",
    language: "Idioma",
    prayerPlaceholder: "Escribe tus preocupaciones y deseos como oracion.",
    prayNow: "Orar",
    recommendedVerses: "Versiculos recomendados",
    pastoralAdvice: "Consejo pastoral",
    todayWord: "Versiculo de hoy",
    randomRefresh: "Nuevo versiculo aleatorio",
    versionSelect: "Seleccion de version biblica",
    maxVersion: "Puedes seleccionar hasta 2 versiones.",
    selectedDateJournal: "Oraciones del dia seleccionado",
    noEntry: "Sin registros.",
    entriesOfDay: "Registros del dia",
    signup: "Registro",
    username: "ID",
    usernameCheck: "Verificar",
    usernameAvailable: "ID disponible.",
    usernameDuplicate: "ID ya en uso.",
    password: "Contrasena",
    name: "Nombre",
    phone: "Telefono",
    email: "Correo",
    birthDate: "Fecha de nacimiento",
    male: "Hombre",
    female: "Mujer",
    marketingAgree: "(Opcional) Recibir noticias",
    privacyAgree: "(Obligatorio) Acepto privacidad",
    save: "Guardar",
    privacyPolicy: "Politica de privacidad",
    policySummary: "Los datos se usan para inicio de sesion, diario de oracion y soporte del servicio.",
    loginTitle: "Iniciar sesion",
    login: "Entrar",
    logout: "Salir",
    masterView: "Acceso maestro: ver todos los usuarios",
    memberView: "Mi perfil",
    prayerCount: "Cantidad de oraciones",
    joinedAt: "Registro",
    supportTitle: "Apoyo ministerial",
    supportMethod: "Metodo",
    mobileSupport: "Donacion movil",
    arsSupport: "Donacion ARS",
    bankSupport: "Transferencia",
    todayHymn: "Himno/CCM de hoy",
    randomCopyrightFree: "Recomendacion aleatoria sin copyright",
    playVideo: "Reproducir",
    openScore: "Abrir partitura",
    openYoutube: "Abrir YouTube",
    shareTitle: "Compartir movil",
    shareDesc: "El enlace compartido se crea en estado renovado.",
    share: "Compartir",
    copy: "Copiar enlace",
    copied: "Copiado.",
    required: "Completa los campos obligatorios.",
    loginFail: "ID o contrasena incorrectos.",
    holiday: "Fiesta cristiana",
  },
  fr: {
    ...({} as TextPack),
    appName: "Compagnon de la Parole",
    home: "Accueil",
    bible: "Versions",
    calendar: "Calendrier",
    hymn: "Cantique",
    support: "Soutien",
    my: "Mon",
    language: "Langue",
    prayerPlaceholder: "Ecrivez vos soucis et vos attentes en priere.",
    prayNow: "Prier",
    recommendedVerses: "Versets recommandes",
    pastoralAdvice: "Conseil pastoral",
    todayWord: "Verset du jour",
    randomRefresh: "Nouveau verset aleatoire",
    versionSelect: "Selection de traduction",
    maxVersion: "Vous pouvez choisir jusqu'a 2 versions.",
    selectedDateJournal: "Prieres de la date choisie",
    noEntry: "Aucun enregistrement.",
    entriesOfDay: "Entrees du jour",
    signup: "Inscription",
    username: "Identifiant",
    usernameCheck: "Verifier",
    usernameAvailable: "Identifiant disponible.",
    usernameDuplicate: "Identifiant deja utilise.",
    password: "Mot de passe",
    name: "Nom",
    phone: "Telephone",
    email: "Email",
    birthDate: "Date de naissance",
    male: "Homme",
    female: "Femme",
    marketingAgree: "(Optionnel) Recevoir les infos",
    privacyAgree: "(Obligatoire) Accepter la politique",
    save: "Enregistrer",
    privacyPolicy: "Politique de confidentialite",
    policySummary: "Les donnees servent a la connexion, au journal de priere et au support du service.",
    loginTitle: "Connexion",
    login: "Connexion",
    logout: "Deconnexion",
    masterView: "Acces maitre: voir tous les membres",
    memberView: "Mon profil",
    prayerCount: "Nombre de prieres",
    joinedAt: "Inscription",
    supportTitle: "Soutien du ministere",
    supportMethod: "Methode",
    mobileSupport: "Don mobile",
    arsSupport: "Don ARS",
    bankSupport: "Virement",
    todayHymn: "Cantique/CCM du jour",
    randomCopyrightFree: "Recommendation aleatoire sans copyright",
    playVideo: "Lire la video",
    openScore: "Ouvrir la partition",
    openYoutube: "Ouvrir YouTube",
    shareTitle: "Partage mobile",
    shareDesc: "Le lien partage est cree avec un etat rafraichi.",
    share: "Partager",
    copy: "Copier",
    copied: "Copie.",
    required: "Veuillez remplir les champs requis.",
    loginFail: "Identifiant ou mot de passe invalide.",
    holiday: "Fete chretienne",
  },
  zh: {
    ...({} as TextPack),
    appName: "话语同行",
    home: "首页",
    bible: "译本",
    calendar: "日历",
    hymn: "赞美",
    support: "奉献",
    my: "我的",
    language: "语言",
    prayerPlaceholder: "请用祷告形式写下今天的盼望、忧虑和烦恼。",
    prayNow: "祷告",
    recommendedVerses: "推荐经文",
    pastoralAdvice: "牧养建议",
    todayWord: "今日经文",
    randomRefresh: "随机更换",
    versionSelect: "圣经译本选择",
    maxVersion: "最多可选择 2 个译本。",
    selectedDateJournal: "所选日期祷告记录",
    noEntry: "暂无记录。",
    entriesOfDay: "当天记录数",
    signup: "注册",
    username: "账号",
    usernameCheck: "重复检查",
    usernameAvailable: "账号可用。",
    usernameDuplicate: "账号已被使用。",
    password: "密码",
    name: "姓名",
    phone: "电话",
    email: "邮箱",
    birthDate: "生日",
    male: "男",
    female: "女",
    marketingAgree: "（可选）接收通知",
    privacyAgree: "（必选）同意隐私政策",
    save: "保存",
    privacyPolicy: "隐私政策",
    policySummary: "数据用于登录、祷告日记保存和服务通知。",
    loginTitle: "登录",
    login: "登录",
    logout: "退出",
    masterView: "主账号权限：查看全部会员",
    memberView: "我的资料",
    prayerCount: "祷告次数",
    joinedAt: "注册日期",
    supportTitle: "事工奉献",
    supportMethod: "奉献方式",
    mobileSupport: "手机奉献",
    arsSupport: "ARS 奉献",
    bankSupport: "银行转账",
    todayHymn: "今日赞美/CCM",
    randomCopyrightFree: "随机推荐可用版权视频",
    playVideo: "播放视频",
    openScore: "打开乐谱",
    openYoutube: "打开 YouTube",
    shareTitle: "移动分享",
    shareDesc: "分享链接会以刷新状态生成。",
    share: "分享",
    copy: "复制链接",
    copied: "已复制。",
    required: "请填写必填项。",
    loginFail: "账号或密码错误。",
    holiday: "基督教节期",
  },
  ja: {
    ...({} as TextPack),
    appName: "みことば同行",
    home: "ホーム",
    bible: "訳本",
    calendar: "カレンダー",
    hymn: "賛美",
    support: "献金",
    my: "会員",
    language: "言語",
    prayerPlaceholder: "今日の願い、心配、悩みを祈りとして書いてください。",
    prayNow: "祈る",
    recommendedVerses: "おすすめ聖句",
    pastoralAdvice: "牧会アドバイス",
    todayWord: "今日のみことば",
    randomRefresh: "ランダム再推薦",
    versionSelect: "聖書訳本の選択",
    maxVersion: "訳本は最大2つまで選択できます。",
    selectedDateJournal: "選択日の祈り記録",
    noEntry: "記録がありません。",
    entriesOfDay: "当日の記録数",
    signup: "会員登録",
    username: "ID",
    usernameCheck: "重複確認",
    usernameAvailable: "利用可能なIDです。",
    usernameDuplicate: "すでに使用中のIDです。",
    password: "パスワード",
    name: "名前",
    phone: "電話番号",
    email: "メール",
    birthDate: "生年月日",
    male: "男性",
    female: "女性",
    marketingAgree: "（任意）お知らせ受信",
    privacyAgree: "（必須）個人情報同意",
    save: "保存",
    privacyPolicy: "プライバシーポリシー",
    policySummary: "データはログイン、祈り日記保存、サービス案内のために使用されます。",
    loginTitle: "ログイン",
    login: "ログイン",
    logout: "ログアウト",
    masterView: "マスター権限: 全会員表示",
    memberView: "マイ情報",
    prayerCount: "祈り数",
    joinedAt: "登録日",
    supportTitle: "ミニストリー支援",
    supportMethod: "支援方法",
    mobileSupport: "携帯支援",
    arsSupport: "ARS 支援",
    bankSupport: "口座支援",
    todayHymn: "今日の賛美/CCM",
    randomCopyrightFree: "著作権許諾動画をランダム推薦",
    playVideo: "動画再生",
    openScore: "楽譜を開く",
    openYoutube: "YouTubeを開く",
    shareTitle: "モバイル共有",
    shareDesc: "共有リンクはリフレッシュ状態で作成されます。",
    share: "共有",
    copy: "リンクコピー",
    copied: "コピーしました。",
    required: "必須項目を入力してください。",
    loginFail: "IDまたはパスワードが正しくありません。",
    holiday: "キリスト教記念日",
  },
  ru: {
    ...({} as TextPack),
    appName: "Слово рядом",
    home: "Главная",
    bible: "Переводы",
    calendar: "Календарь",
    hymn: "Пение",
    support: "Пожертвование",
    my: "Профиль",
    language: "Язык",
    prayerPlaceholder: "Опишите свои заботы и надежды в форме молитвы.",
    prayNow: "Молиться",
    recommendedVerses: "Рекомендуемые стихи",
    pastoralAdvice: "Пасторский совет",
    todayWord: "Стих дня",
    randomRefresh: "Случайный стих",
    versionSelect: "Выбор перевода Библии",
    maxVersion: "Можно выбрать до 2 переводов.",
    selectedDateJournal: "Молитвы за выбранную дату",
    noEntry: "Записей нет.",
    entriesOfDay: "Записей за день",
    signup: "Регистрация",
    username: "ID",
    usernameCheck: "Проверить",
    usernameAvailable: "ID доступен.",
    usernameDuplicate: "ID уже используется.",
    password: "Пароль",
    name: "Имя",
    phone: "Телефон",
    email: "Email",
    birthDate: "Дата рождения",
    male: "Мужчина",
    female: "Женщина",
    marketingAgree: "(Опц.) Получать новости",
    privacyAgree: "(Обяз.) Согласие на политику",
    save: "Сохранить",
    privacyPolicy: "Политика конфиденциальности",
    policySummary: "Данные используются для входа, журнала молитв и уведомлений сервиса.",
    loginTitle: "Вход",
    login: "Войти",
    logout: "Выйти",
    masterView: "Права мастера: все пользователи",
    memberView: "Мой профиль",
    prayerCount: "Количество молитв",
    joinedAt: "Дата регистрации",
    supportTitle: "Поддержка служения",
    supportMethod: "Способ",
    mobileSupport: "Мобильное пожертвование",
    arsSupport: "ARS пожертвование",
    bankSupport: "Банковский перевод",
    todayHymn: "Гимн/CCM дня",
    randomCopyrightFree: "Случайная рекомендация без copyright",
    playVideo: "Воспроизвести",
    openScore: "Открыть ноты",
    openYoutube: "Открыть YouTube",
    shareTitle: "Поделиться",
    shareDesc: "Ссылка создается в обновленном состоянии.",
    share: "Поделиться",
    copy: "Копировать",
    copied: "Скопировано.",
    required: "Заполните обязательные поля.",
    loginFail: "Неверный ID или пароль.",
    holiday: "Христианский праздник",
  },
  he: {
    ...({} as TextPack),
    appName: "ליווי דבר האל",
    home: "בית",
    bible: "תרגומים",
    calendar: "לוח שנה",
    hymn: "שירה",
    support: "תרומה",
    my: "חשבון",
    language: "שפה",
    prayerPlaceholder: "כתוב את הבקשות והדאגות שלך כתפילה.",
    prayNow: "להתפלל",
    recommendedVerses: "פסוקים מומלצים",
    pastoralAdvice: "עצה רוחנית",
    todayWord: "פסוק היום",
    randomRefresh: "המלצה אקראית חדשה",
    versionSelect: "בחירת תרגום תנ" + "ך",
    maxVersion: "ניתן לבחור עד שני תרגומים.",
    selectedDateJournal: "תפילות בתאריך שנבחר",
    noEntry: "אין רשומות.",
    entriesOfDay: "מספר רשומות ביום",
    signup: "הרשמה",
    username: "שם משתמש",
    usernameCheck: "בדיקה",
    usernameAvailable: "שם המשתמש זמין.",
    usernameDuplicate: "שם המשתמש כבר קיים.",
    password: "סיסמה",
    name: "שם",
    phone: "טלפון",
    email: "אימייל",
    birthDate: "תאריך לידה",
    male: "זכר",
    female: "נקבה",
    marketingAgree: "(אופציונלי) קבלת עדכונים",
    privacyAgree: "(חובה) הסכמה למדיניות הפרטיות",
    save: "שמור",
    privacyPolicy: "מדיניות פרטיות",
    policySummary: "המידע משמש להתחברות, יומן תפילה והודעות שירות.",
    loginTitle: "התחברות",
    login: "התחבר",
    logout: "התנתק",
    masterView: "הרשאת מאסטר: צפייה בכל המשתמשים",
    memberView: "הפרופיל שלי",
    prayerCount: "מספר תפילות",
    joinedAt: "תאריך הצטרפות",
    supportTitle: "תמיכה בשירות",
    supportMethod: "דרך תרומה",
    mobileSupport: "תרומת נייד",
    arsSupport: "תרומת ARS",
    bankSupport: "העברה בנקאית",
    todayHymn: "המלצת המנון/CCM יומית",
    randomCopyrightFree: "המלצה אקראית לתוכן עם רישיון פתוח",
    playVideo: "נגן וידאו",
    openScore: "פתח תווים",
    openYoutube: "פתח יוטיוב",
    shareTitle: "שיתוף לנייד",
    shareDesc: "הקישור המשותף נוצר במצב רענון.",
    share: "שתף",
    copy: "העתק קישור",
    copied: "הקישור הועתק.",
    required: "נא למלא את השדות החיוניים.",
    loginFail: "שם משתמש או סיסמה שגויים.",
    holiday: "חג נוצרי",
  },
  pt: {
    ...({} as TextPack),
    appName: "Companhia da Palavra",
    home: "Inicio",
    bible: "Versoes",
    calendar: "Calendario",
    hymn: "Hino",
    support: "Apoio",
    my: "Conta",
    language: "Idioma",
    prayerPlaceholder: "Escreva seus desejos e preocupacoes em forma de oracao.",
    prayNow: "Orar",
    recommendedVerses: "Versiculos recomendados",
    pastoralAdvice: "Conselho pastoral",
    todayWord: "Versiculo de hoje",
    randomRefresh: "Novo versiculo aleatorio",
    versionSelect: "Selecao de versoes da Biblia",
    maxVersion: "Voce pode escolher ate 2 versoes.",
    selectedDateJournal: "Oracoes da data selecionada",
    noEntry: "Sem registros.",
    entriesOfDay: "Registros do dia",
    signup: "Cadastro",
    username: "ID",
    usernameCheck: "Verificar",
    usernameAvailable: "ID disponivel.",
    usernameDuplicate: "ID ja utilizado.",
    password: "Senha",
    name: "Nome",
    phone: "Telefone",
    email: "Email",
    birthDate: "Data de nascimento",
    male: "Homem",
    female: "Mulher",
    marketingAgree: "(Opcional) Receber noticias",
    privacyAgree: "(Obrigatorio) Concordo com a politica",
    save: "Salvar",
    privacyPolicy: "Politica de privacidade",
    policySummary: "Os dados sao usados para login, diario de oracao e suporte ao servico.",
    loginTitle: "Login",
    login: "Entrar",
    logout: "Sair",
    masterView: "Acesso master: ver todos os usuarios",
    memberView: "Meu perfil",
    prayerCount: "Quantidade de oracoes",
    joinedAt: "Data de cadastro",
    supportTitle: "Apoio ao ministerio",
    supportMethod: "Metodo",
    mobileSupport: "Doacao por celular",
    arsSupport: "Doacao ARS",
    bankSupport: "Transferencia bancaria",
    todayHymn: "Hino/CCM de hoje",
    randomCopyrightFree: "Recomendacao aleatoria sem copyright",
    playVideo: "Reproduzir video",
    openScore: "Abrir partitura",
    openYoutube: "Abrir YouTube",
    shareTitle: "Compartilhar no celular",
    shareDesc: "O link compartilhado e criado em estado renovado.",
    share: "Compartilhar",
    copy: "Copiar link",
    copied: "Copiado.",
    required: "Preencha os campos obrigatorios.",
    loginFail: "ID ou senha invalidos.",
    holiday: "Data crista",
  },
};

const KEYWORDS: Record<Theme, string[]> = {
  anxiety: ["걱정", "불안", "두려", "염려", "초조", "스트레스", "긴장", "무섭", "떨", "anxiety", "fear", "miedo", "peur", "焦虑", "不安", "страх", "דאגה", "ansiedade"],
  gratitude: ["감사", "고맙", "gratitude", "thank", "gracias", "merci", "感謝", "благодар", "תודה", "gratidao"],
  healing: ["아프", "병", "치유", "통증", "수술", "우울", "상처", "눈물", "지침", "번아웃", "healing", "sick", "sanidad", "guerison", "医", "癒", "исцел", "ריפוי", "cura"],
  relationship: ["관계", "가족", "친구", "화해", "부부", "부모", "자녀", "갈등", "오해", "다툼", "미움", "relationship", "family", "familia", "relation", "关系", "関係", "семья", "משפחה"],
  guidance: ["진로", "선택", "결정", "이사", "학교", "대학", "길", "앞길", "인도", "분별", "guidance", "decision", "guia", "direction", "引导", "導き", "направ", "הכוונה", "direcao"],
  forgiveness: ["용서", "죄", "회개", "죄책", "후회", "정죄", "forgive", "repent", "perdon", "pardon", "赦免", "許し", "прощ", "סליחה", "perdao"],
  work: ["일", "직장", "취업", "사업", "회사", "업무", "승진", "동료", "성과", "면접", "연봉", "work", "job", "trabajo", "travail", "工作", "仕事", "работ", "עבודה", "trabalho"],
  faith: ["믿음", "신앙", "기도", "예배", "확신", "순종", "faith", "pray", "fe", "foi", "信仰", "вера", "אמונה"],
  hope: ["미래", "희망", "소망", "다시", "회복", "새롭게", "새출발", "기회", "hope", "future", "esperanza", "avenir", "希望", "надеж", "תקווה", "esperanca"],
};

const THEME_LABELS: Record<Theme, LocalizedText> = {
  anxiety: { ko: "불안", en: "anxiety", es: "ansiedad", fr: "anxiete", zh: "焦虑", ja: "不安", ru: "тревога", he: "חרדה", pt: "ansiedade" },
  gratitude: { ko: "감사", en: "gratitude", es: "gratitud", fr: "gratitude", zh: "感恩", ja: "感謝", ru: "благодарность", he: "הודיה", pt: "gratidao" },
  healing: { ko: "치유", en: "healing", es: "sanidad", fr: "guerison", zh: "医治", ja: "癒やし", ru: "исцеление", he: "ריפוי", pt: "cura" },
  relationship: { ko: "관계", en: "relationship", es: "relacion", fr: "relation", zh: "关系", ja: "関係", ru: "отношения", he: "יחסים", pt: "relacionamento" },
  guidance: { ko: "인도", en: "guidance", es: "guia", fr: "direction", zh: "引导", ja: "導き", ru: "направление", he: "הכוונה", pt: "direcao" },
  forgiveness: { ko: "용서", en: "forgiveness", es: "perdon", fr: "pardon", zh: "赦免", ja: "赦し", ru: "прощение", he: "סליחה", pt: "perdao" },
  work: { ko: "일", en: "work", es: "trabajo", fr: "travail", zh: "工作", ja: "仕事", ru: "работа", he: "עבודה", pt: "trabalho" },
  faith: { ko: "믿음", en: "faith", es: "fe", fr: "foi", zh: "信心", ja: "信仰", ru: "вера", he: "אמונה", pt: "fe" },
  hope: { ko: "희망", en: "hope", es: "esperanza", fr: "esperance", zh: "盼望", ja: "希望", ru: "надежда", he: "תקווה", pt: "esperanca" },
};

const VERSE_HINTS: Record<string, string[]> = {
  v1: ["걱정", "불안", "염려", "초조", "긴장", "anxiety", "fear"],
  v2: ["미래", "희망", "앞길", "내일", "꿈", "future", "hope"],
  v3: ["결정", "선택", "진로", "방향", "guidance", "decision"],
  v4: ["상처", "마음", "우울", "눈물", "broken", "hurt"],
  v5: ["회개", "죄책", "용서", "죄", "forgive", "repent"],
  v6: ["관계", "가족", "갈등", "화해", "relationship", "family"],
  v7: ["직장", "업무", "취업", "사업", "work", "job"],
  v8: ["믿음", "의심", "신앙", "faith", "believe"],
  v9: ["감사", "기쁨", "찬양", "thank", "gratitude"],
  v10: ["두려움", "공포", "무서움", "fear", "panic"],
  v11: ["화해", "다툼", "오해", "갈등", "peace"],
  v12: ["인도", "길", "분별", "direction", "path"],
  v13: ["계획", "준비", "도전", "plan", "career"],
  v14: ["지침", "피곤", "번아웃", "rest", "weary"],
  v15: ["정결", "새마음", "회복", "clean", "renew"],
  v16: ["소망", "회복", "평강", "hope", "peace"],
  v17: ["신뢰", "믿음", "확신", "believe", "faith"],
  v18: ["감사", "은혜", "찬양", "thank", "praise"],
};

function localize(text: LocalizedText, lang: LanguageCode): string {
  return text[lang] ?? text.en ?? text.ko ?? Object.values(text)[0] ?? "";
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function localeOf(lang: LanguageCode): string {
  return LANGUAGES.find((item) => item.id === lang)?.locale ?? "en-US";
}

function getEasterDate(year: number): Date {
  const f = Math.floor;
  const g = year % 19;
  const c = f(year / 100);
  const h = (c - f(c / 4) - f((8 * c + 13) / 25) + 19 * g + 15) % 30;
  const i = h - f(h / 28) * (1 - f(29 / (h + 1)) * f((21 - g) / 11));
  const j = (year + f(year / 4) + i + 2 - c + f(c / 4)) % 7;
  const l = i - j;
  const month = 3 + f((l + 40) / 44);
  const day = l + 28 - 31 * f(month / 4);
  return new Date(year, month - 1, day);
}

function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function holidayName(date: Date, lang: LanguageCode): string | null {
  const idx = LANGUAGES.findIndex((item) => item.id === lang);
  const easter = getEasterDate(date.getFullYear());
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  const fixed = [
    [new Date(date.getFullYear(), 11, 25), ["성탄절", "Christmas", "Navidad", "Noel", "圣诞节", "クリスマス", "Рождество", "חג המולד", "Natal"]],
    [new Date(date.getFullYear(), 0, 6), ["주현절", "Epiphany", "Epifania", "Epiphanie", "主显节", "公現日", "Богоявление", "התגלות", "Epifania"]],
  ] as const;

  for (const [target, names] of fixed) {
    if (isSameDate(date, target)) return names[idx] ?? names[1];
  }

  if (isSameDate(date, goodFriday)) return ["성금요일", "Good Friday", "Viernes Santo", "Vendredi saint", "受难日", "聖金曜日", "Страстная пятница", "יום שישי הטוב", "Sexta-feira Santa"][idx];
  if (isSameDate(date, easter)) return ["부활절", "Easter", "Pascua", "Paques", "复活节", "復活祭", "Пасха", "פסחא", "Pascoa"][idx];
  if (isSameDate(date, pentecost)) return ["오순절", "Pentecost", "Pentecostes", "Pentecote", "五旬节", "ペンテコステ", "Пятидесятница", "פנטקוסט", "Pentecostes"][idx];
  if (date.getDay() === 0) return ["주일", "Sunday Service", "Domingo", "Dimanche", "主日", "主日", "Воскресенье", "יום ראשון", "Domingo"][idx];
  return null;
}

function detectThemes(prayer: string): Theme[] {
  const source = prayer.toLowerCase();
  const allThemes = Object.keys(KEYWORDS) as Theme[];
  const mergedKeywords: Record<string, string[]> = { ...KEYWORDS };
  const scored = allThemes.map((theme) => {
    const score = (mergedKeywords[theme] ?? KEYWORDS[theme]).reduce((acc, keyword) => {
      const token = keyword.toLowerCase();
      return acc + (source.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))?.length ?? 0) * (token.length + 2);
    }, 0);
    return { theme, score };
  });

  const sorted = scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
  if (sorted.length >= 3) return sorted.slice(0, 3).map((item) => item.theme);
  if (sorted.length > 0) {
    const remain = allThemes.filter((theme) => !sorted.some((item) => item.theme === theme));
    return [...sorted.map((item) => item.theme), ...remain].slice(0, 3);
  }

  // If no keyword matched, vary the fallback by prayer text hash so different prayers do not always return the same set.
  const hash = [...source].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const start = hash % allThemes.length;
  return [allThemes[start], allThemes[(start + 3) % allThemes.length], allThemes[(start + 6) % allThemes.length]];
}

function pickVerses(themes: Theme[], prayer: string): Verse[] {
  const source = prayer.toLowerCase();
  const themeRank = new Map<Theme, number>();
  themes.forEach((theme, index) => themeRank.set(theme, 3 - index));
  const hash = [...source].reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0);

  const allVerses: Verse[] = [...VERSES];

  const ranked = allVerses.map((verse, index) => {
    const hints = VERSE_HINTS[verse.id] ?? [];
    const hintScore = hints.reduce((acc, hint) => {
      const token = hint.toLowerCase();
      const occurrences = source.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))?.length ?? 0;
      return acc + occurrences * (token.length + 1);
    }, 0);
    const themeScore = (themeRank.get(verse.topic) ?? 0) * 20;
    const tieBreaker = (hash + index * 17) % 11;
    return { verse, score: hintScore * 5 + themeScore + tieBreaker };
  }).sort((a, b) => b.score - a.score);

  const selected: Verse[] = [];
  const usedTopics = new Set<Theme>();
  for (const item of ranked) {
    if (selected.length >= 3) break;
    if (item.score <= 0) continue;
    if (usedTopics.has(item.verse.topic) && ranked.some((entry) => !usedTopics.has(entry.verse.topic) && entry.score > item.score - 3)) continue;
    selected.push(item.verse);
    usedTopics.add(item.verse.topic);
  }

  if (selected.length < 3) {
    for (const item of ranked) {
      if (selected.length >= 3) break;
      if (!selected.some((verse) => verse.id === item.verse.id)) selected.push(item.verse);
    }
  }
  return selected.slice(0, 3);
}

function themeText(theme: Theme, lang: LanguageCode): string {
  return localize(THEME_LABELS[theme], lang);
}

function buildAdvice(prayer: string, themes: Theme[], verses: Verse[], lang: LanguageCode): string {
  const prayerSummary = prayer.replace(/\s+/g, " ").trim();
  const shortPrayer = prayerSummary.length > 260 ? `${prayerSummary.slice(0, 260)}...` : prayerSummary;
  const topics = themes.map((theme) => themeText(theme, lang)).join(", ");
  const hash = [...prayerSummary].reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 3), 0);
  const timeHash = Math.floor(Date.now() / 1000);
  const verseLine = verses
    .map((verse, index) => `${index + 1}) ${localize(verse.reference, lang)} - ${localize(verse.text, lang)}`)
    .join("\n");

  // 새 데이터 모듈에서 도입문구, 설교사례, 마무리격려 가져오기
  const openingPhrase = getOpening(hash + timeHash);
  const sermonCase = getSermonExample(themes[0] as any, hash + timeHash);
  const closingPhrase = getClosing(hash + timeHash + 7);

  const themeAdvicePool: Record<Theme, { ko: string[]; en: string[] }> = {
    anxiety: {
      ko: [
        "두려움은 현실을 더 크게 보이게 만들지만, 기도는 하나님을 더 크게 보게 만듭니다. 오늘 해야 할 일을 한 가지씩만 붙들고, 내일의 무게는 주님께 맡기십시오.",
        "불안을 이기려면 마음속 최악의 장면을 반복하기보다, 약속의 말씀을 반복해야 합니다. 걱정을 멈추는 연습이 아니라, 신뢰를 선택하는 연습이 필요합니다.",
      ],
      en: [
        "Fear magnifies the problem, but prayer magnifies God. Hold one faithful step for today and entrust tomorrow to the Lord.",
        "Do not rehearse your worst scenario all day. Rehearse God's promises, and choose trust one moment at a time.",
      ],
    },
    gratitude: {
      ko: [
        "감사는 문제가 없어서 드리는 고백이 아니라, 문제 한가운데서도 하나님이 여전히 선하시다는 믿음의 선언입니다.",
        "감사의 기도는 상황을 즉시 바꾸지 않아도 마음의 시선을 바꿉니다. 받은 은혜를 적어 내려갈수록 낙심의 힘은 약해집니다.",
      ],
      en: [
        "Gratitude is not denial of pain, but a declaration that God is still good in the middle of it.",
        "Thanksgiving may not change everything at once, but it changes your focus and restores strength.",
      ],
    },
    healing: {
      ko: [
        "상처는 무시한다고 사라지지 않습니다. 그러나 주님 앞에 정확히 이름 붙여 올려드릴 때 치유가 시작됩니다.",
        "몸과 마음이 지친 날에는 속도를 줄이는 것도 믿음입니다. 쉼을 죄책감으로 보지 말고 하나님이 허락하신 회복의 통로로 받아들이십시오.",
      ],
      en: [
        "Wounds do not heal by pretending they are not there. Healing begins when we bring them honestly to God.",
        "When you are weary in body and soul, slowing down is not failure. It is faithful stewardship before God.",
      ],
    },
    relationship: {
      ko: [
        "관계의 회복은 누가 먼저 옳은지를 증명하는 싸움이 아니라, 누가 먼저 사랑을 선택하는지의 순종입니다.",
        "상대의 반응을 통제하려 하기보다 내 말의 온도와 태도를 주님께 맡기면, 관계의 공기가 먼저 달라집니다.",
      ],
      en: [
        "Restoration is rarely about proving who is right first. It is often about choosing love first.",
        "You cannot control another person's response, but you can offer truthful and gentle words before God.",
      ],
    },
    guidance: {
      ko: [
        "하나님의 인도는 늘 큰 표적보다 작은 순종의 반복 속에서 선명해집니다. 오늘 순종할 수 있는 작은 빛을 따라가십시오.",
        "길이 보이지 않을수록 서두르지 말고 분별의 시간을 가지십시오. 문이 닫힌 이유도, 열리는 때도 주님이 가장 정확히 아십니다.",
      ],
      en: [
        "God's guidance is often clarified through repeated small obedience rather than dramatic signs.",
        "When direction feels unclear, do not rush. Discernment grows in prayerful patience.",
      ],
    },
    forgiveness: {
      ko: [
        "회개는 자신을 무너뜨리는 행동이 아니라, 복음 안에서 다시 세워지는 시작입니다. 죄책감에 머물지 말고 은혜 안으로 들어오십시오.",
        "용서는 감정이 다 정리된 뒤에만 가능한 명령이 아닙니다. 먼저 방향을 주께로 돌리는 선택에서 치유가 자랍니다.",
      ],
      en: [
        "Repentance does not destroy your life. It restores your life in grace.",
        "Forgiveness is not pretending the wound is small. It is choosing the direction of grace.",
      ],
    },
    work: {
      ko: [
        "일의 결과가 정체성의 전부가 아닙니다. 성도님의 가치는 성과가 아니라 하나님의 자녀라는 사실에서 시작됩니다.",
        "앞이 막힌 시기에는 준비를 멈추지 않는 충성이 필요합니다. 하나님은 보이지 않는 시간에 사람을 먼저 다듬으십니다.",
      ],
      en: [
        "Your value is not your performance. Your identity begins with being God's beloved child.",
        "In blocked seasons, faithful preparation still matters. God shapes people before He opens doors.",
      ],
    },
    faith: {
      ko: [
        "믿음은 모든 의문이 사라진 상태가 아니라, 의문이 남아 있어도 주님 손을 놓지 않는 결단입니다.",
        "기도 응답이 늦어질 때는 거절이 아니라 훈련일 수 있습니다. 기다림의 시간에 신뢰의 뿌리가 깊어집니다.",
      ],
      en: [
        "Faith is not the absence of questions. It is holding God's hand while questions remain.",
        "A delayed answer can be formation, not rejection. Waiting can deepen trust.",
      ],
    },
    hope: {
      ko: [
        "소망은 막연한 낙관이 아니라 약속하신 하나님을 바라보는 시선입니다. 오늘 작은 변화가 내일의 큰 전환이 됩니다.",
        "지금은 끝처럼 보여도 하나님께는 과정입니다. 어둠이 가장 짙은 때가 새벽에 가장 가까운 때임을 기억하십시오.",
      ],
      en: [
        "Hope is not vague optimism. It is confidence in the God who keeps promises.",
        "What feels like an ending can be a holy process in God's hands.",
      ],
    },
  };

  const pastoralFlow = themes
    .map((theme, index) => {
      const localePool = themeAdvicePool[theme]?.[lang === "ko" ? "ko" : "en"] ?? [];
      return localePool[(hash + index) % Math.max(localePool.length, 1)] ?? "";
    })
    .filter(Boolean)
    .join("\n\n");

  const intro: Record<LanguageCode, string> = {
    ko: "사랑하는 성도님, 먼저 지금의 기도는 약함의 표현이 아니라 믿음의 행동입니다.",
    en: "Dear believer, your prayer is not weakness but an act of faith.",
    es: "Querido creyente, tu oracion no es debilidad, sino un acto de fe.",
    fr: "Cher croyant, votre priere n'est pas une faiblesse mais un acte de foi.",
    zh: "亲爱的弟兄姊妹，你此刻的祷告不是软弱，而是信心的行动。",
    ja: "愛する兄弟姉妹よ、この祈りは弱さではなく信仰の行動です。",
    ru: "Дорогой верующий, эта молитва - не слабость, а шаг веры.",
    he: "מאמין יקר, תפילתך איננה חולשה אלא צעד של אמונה.",
    pt: "Querido irmao, sua oracao nao e fraqueza, mas um ato de fe.",
  };

  const context: Record<LanguageCode, string> = {
    ko: `기도의 내용은 "${shortPrayer}"입니다. 이 기도 안에는 ${topics}의 아픔과 소망이 함께 담겨 있습니다. 하나님은 지금의 상황만 보시는 분이 아니라, 성도님의 오늘과 내일, 그리고 마음의 깊은 상처까지 아시는 분이십니다. 그래서 지금의 기도는 단순한 감정의 토로가 아니라 하나님 앞에서 삶을 다시 정렬하는 거룩한 출발이 됩니다.`,
    en: `Your prayer says: "${shortPrayer}." It carries themes of ${topics}. God cares for your whole life, not just one part of your problem.`,
    es: `Tu oracion dice: "${shortPrayer}." Incluye temas de ${topics}. Dios cuida toda tu vida, no solo una parte.`,
    fr: `Votre priere dit: "${shortPrayer}." Elle contient les themes ${topics}. Dieu prend soin de toute votre vie.`,
    zh: `你的祷告核心是“${shortPrayer}”，其中包含了${topics}等主题。神关心的不是局部，而是你的整个人生。`,
    ja: `祈りの中心は「${shortPrayer}」であり、そこには${topics}の課題が含まれています。神は人生全体を導かれます。`,
    ru: `Суть вашей молитвы: "${shortPrayer}." В ней есть темы: ${topics}. Бог заботится о всей вашей жизни.`,
    he: `ליבת תפילתך היא "${shortPrayer}", ובה נושאים של ${topics}. אלוהים דואג לכל חייך, לא רק לחלק אחד.`,
    pt: `O centro da sua oracao e "${shortPrayer}", com temas de ${topics}. Deus cuida de toda a sua vida.`,
  };

  const example: Record<LanguageCode, string> = {
    ko: hash % 2 === 0
      ? "예를 들어, 가족 갈등으로 마음이 무너졌던 한 성도는 먼저 상대를 바꾸려 하기보다 자신의 말과 태도를 하나님 앞에서 점검했습니다. 매일 저녁 짧은 기도로 마음을 가다듬고, 대화를 시작하기 전 한 구절을 천천히 묵상했을 때 관계의 긴장이 서서히 풀렸고, 대화의 문이 다시 열렸습니다."
      : "예를 들어, 진로 문제로 막막해하던 한 청년은 답을 서두르지 않고 매일 같은 시간에 기도와 말씀을 이어 갔습니다. 당장 큰 변화는 없었지만, 작은 순종을 쌓아가던 중 예상치 못한 만남과 기회가 연결되면서 길이 분명해졌습니다.",
    en: "Case example: A young believer with severe job anxiety read Scripture aloud for ten minutes each night and wrote one concrete step for the next day. In five weeks, circumstances were not instantly perfect, but peace returned and a real opportunity opened.",
    es: "Caso real: Un joven con ansiedad por el trabajo leyo la Biblia en voz alta 10 minutos cada noche y anoto una accion concreta para el dia siguiente. En cinco semanas, su paz regreso y aparecio una oportunidad.",
    fr: "Exemple pastoral: Un jeune tres anxieux pour son travail lisait la Bible a voix haute dix minutes chaque soir et notait une action concrete pour le lendemain. En cinq semaines, la paix est revenue et une porte s'est ouverte.",
    zh: "牧养案例：一位因工作焦虑失眠的青年，每晚用10分钟大声读经，并写下第二天要实践的一件事。五周后，环境尚未完全改变，但内心先稳定下来，机会也随后出现。",
    ja: "牧会の事例: 就職不安で眠れなかった青年が、毎晩10分聖句を声に出して読み、翌日の実行項目を1つ書きました。5週間後、状況は急変しなくても心が整い、機会が与えられました。",
    ru: "Пример из пасторской практики: молодой человек с тревогой о работе каждый вечер 10 минут читал Писание вслух и записывал один конкретный шаг на завтра. Через пять недель пришел мир в сердце и открылась возможность.",
    he: "דוגמה פסטורלית: צעיר שסבל מחרדה תעסוקתית קרא בקול פסוקי מקרא עשר דקות בכל ערב וכתב צעד אחד למחר. אחרי חמישה שבועות ליבו נרגע ונפתחה הזדמנות ממשית.",
    pt: "Exemplo pastoral: Um jovem com ansiedade profissional leu a Biblia em voz alta por 10 minutos todas as noites e escreveu um passo concreto para o dia seguinte. Em cinco semanas, a paz voltou e surgiu uma oportunidade.",
  };

  const proposal: Record<LanguageCode, string> = {
    ko: `말씀을 붙들고 오늘 하루를 지나실 때, 먼저 기도의 내용을 하나님 앞에 정직하게 계속 드러내십시오. 그리고 마음이 흔들릴 때마다 방금 받은 세 구절을 소리 내어 읽으십시오.\n\n완벽한 답을 한 번에 얻지 못해도 괜찮습니다. 주님은 성도님이 포기하지 않고 다시 기도 자리로 나아오는 그 충성을 기뻐하십니다.`,
    en: "I encourage you today to slow down your heart before trying to solve everything at once. Bring your fear honestly to God, entrust what you cannot control, and obey in the area you can act on with faithfulness.",
    es: "Hoy te animo a calmar tu corazon antes de intentar resolver todo de una vez. Presenta tu temor a Dios con sinceridad, entrega lo que no controlas y camina con fidelidad en lo que si puedes obedecer.",
    fr: "Aujourd'hui, je vous encourage a ralentir votre coeur avant de tout vouloir resoudre d'un coup. Confiez a Dieu ce que vous ne maitrisez pas et avancez fidelement dans ce que vous pouvez obeir.",
    zh: "今天请先让心安静下来，不必急着一次解决所有问题。把无法掌控的部分交托给神，把可以顺服的一小步认真走出来，神必亲自带领。",
    ja: "今日は全てを一度に解決しようとせず、まずみことばの前で心を静めてください。自分で握れない部分は主に委ね、従える小さな一歩を誠実に踏み出しましょう。",
    ru: "Сегодня не стремитесь решить все сразу. Сначала успокойте сердце перед Богом, доверьте Ему то, что не контролируете, и верно сделайте тот шаг послушания, который вам дан.",
    he: "היום אני מעודד אותך לא למהר לפתור הכול בבת אחת. השקט את הלב לפני אלוהים, הפקד בידיו את מה שאינך שולט בו, והתמיד בצעד הציות הקטן שבידך.",
    pt: "Hoje, nao tente resolver tudo de uma vez. Primeiro aquiete o coracao diante de Deus, entregue o que voce nao controla e caminhe com fidelidade no pequeno passo de obediencia que esta ao seu alcance.",
  };

  const ending: Record<LanguageCode, string> = {
    ko: "하나님은 문제를 즉시 없애시는 방식뿐 아니라, 당신을 더 강한 믿음의 사람으로 세우시는 방식으로도 역사하십니다. 오늘의 기도는 분명히 열매를 맺습니다.",
    en: "God does not only remove problems instantly; He also forms you into a stronger person of faith. Today's prayer will bear fruit.",
    es: "Dios no solo quita problemas de inmediato; tambien forma una fe mas fuerte en ti. Tu oracion dara fruto.",
    fr: "Dieu n'agit pas seulement par solution immediate; il vous forme aussi en profondeur. Votre priere portera du fruit.",
    zh: "神不仅会立刻挪去问题，也会藉过程塑造你更坚固的信心。今天的祷告必不徒然。",
    ja: "神は問題を即座に取り除くだけでなく、あなたを強い信仰者へ造り変えられます。今日の祈りは必ず実を結びます。",
    ru: "Бог действует не только мгновенным решением, но и формирует в вас зрелую веру. Эта молитва принесет плод.",
    he: "אלוהים איננו פועל רק בהסרה מיידית של הבעיה, אלא גם בבניית אמונה עמוקה בך. תפילתך היום תניב פרי.",
    pt: "Deus nao apenas remove problemas de imediato; Ele tambem forma uma fe mais madura em voce. Sua oracao de hoje dara fruto.",
  };

  return `${openingPhrase}\n\n${intro[lang]}\n\n${context[lang]}\n\n${verseLine}\n\n${pastoralFlow}\n\n${sermonCase}\n\n${example[lang]}\n\n${proposal[lang]}\n\n${ending[lang]}\n\n${closingPhrase}`;
}

function makeCalendarCells(monthDate: Date): Array<Date | null> {
  const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDay = first.getDay();
  const totalDays = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < startDay; i += 1) cells.push(null);
  for (let day = 1; day <= totalDays; day += 1) cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatDate(date: Date, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(localeOf(lang), { year: "numeric", month: "long", day: "numeric", weekday: "long" }).format(date);
}

function formatTime(ts: number, lang: LanguageCode): string {
  return new Intl.DateTimeFormat(localeOf(lang), { hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
}

function formatMoney(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}

function toYoutubeEmbedUrl(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl.trim());
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.hostname.includes("youtube.com")) {
      if (url.pathname.startsWith("/watch")) {
        const id = url.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith("/shorts/")) {
        const id = url.pathname.split("/shorts/")[1];
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (url.pathname.startsWith("/embed/")) {
        return rawUrl;
      }
    }
    return null;
  } catch {
    return null;
  }
}

const emptyUserDraft: Omit<User, "id" | "createdAt"> = {
  username: "",
  password: "",
  name: "",
  phone: "",
  email: "",
  birthDate: "",
  gender: "male",
  marketingAgree: false,
  privacyAgree: false,
};

export default function App() {
  const [lang, setLang] = useState<LanguageCode>("ko");
  const t = UI_TEXT[lang];
  const [tab, setTab] = useState<TabId>("home");
  const [prayerInput, setPrayerInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{verses:{reference:string;text:string}[];opening:string;advice:string;closing:string}|null>(null);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["krv"]);
  const [entries, setEntries] = useState<PrayerEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [signupDraft, setSignupDraft] = useState(emptyUserDraft);
  const [idCheckMessage, setIdCheckMessage] = useState("");
  const [monthDate, setMonthDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [supportType, setSupportType] = useState<SupportType>("bank");
  const [supportName, setSupportName] = useState("");
  const [supportCarrier, setSupportCarrier] = useState("SKT");
  const [supportPhone, setSupportPhone] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | "custom">(10000);
  const [customAmount, setCustomAmount] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [randomVerse, setRandomVerse] = useState<Verse>(VERSES[0]);
  const [dailyTrack, setDailyTrack] = useState<WorshipTrack>(HYMN_TRACKS[0]);
  const [customVideoUrl, setCustomVideoUrl] = useState("");
  const [selectedVideoUrl, setSelectedVideoUrl] = useState("");
  const [showPolicy, setShowPolicy] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const today = new Date();
  const todayIso = dayKey(today);
  const holiday = holidayName(today, lang);
  const currentUser = users.find((user) => user.id === currentUserId) ?? null;
  const visibleEntries = useMemo(() => {
    if (isMaster) return entries;
    if (currentUser) return entries.filter((entry) => entry.authorId === currentUser.id);
    return entries.filter((entry) => entry.authorId === "guest");
  }, [entries, currentUser, isMaster]);

  const latestEntry = visibleEntries[0] ?? null;
  const latestVerses = latestEntry ? latestEntry.verseIds.map((id) => VERSES.find((verse) => verse.id === id)).filter((v): v is Verse => Boolean(v)) : [];
  const latestAdvice = latestEntry?.aiResponse ? `${latestEntry.aiResponse.opening}\n\n${latestEntry.aiResponse.advice}\n\n${latestEntry.aiResponse.closing}` : latestEntry ? buildAdvice(latestEntry.prayer, latestEntry.themes, latestVerses, lang) : "";
  const latestAiVerses = latestEntry?.aiResponse?.verses ?? null;
  const latestVerseImage = latestVerses[0]?.image ?? randomVerse.image;

  const calendarCells = useMemo(() => makeCalendarCells(monthDate), [monthDate]);
  const selectedDayIso = dayKey(selectedDay);
  const entriesOfDay = useMemo(
    () => visibleEntries.filter((entry) => entry.dateISO === selectedDayIso).sort((a, b) => b.createdAt - a.createdAt),
    [visibleEntries, selectedDayIso],
  );
  const selectedDetail = entriesOfDay.find((entry) => entry.id === selectedEntryId) ?? entriesOfDay[0] ?? null;
  const selectedDetailVerses = selectedDetail
    ? selectedDetail.verseIds.map((id) => VERSES.find((item) => item.id === id)).filter((verse): verse is Verse => Boolean(verse))
    : [];
  const selectedDetailAdvice = selectedDetail?.aiResponse ? `${selectedDetail.aiResponse.opening}\n\n${selectedDetail.aiResponse.advice}\n\n${selectedDetail.aiResponse.closing}` : selectedDetail ? buildAdvice(selectedDetail.prayer, selectedDetail.themes, selectedDetailVerses, lang) : "";
  void aiResult; // suppress unused warning

  useEffect(() => {
    // Firebase가 설정되어 있으면 Firebase에서 로드, 아니면 localStorage에서 로드
    if (false) {
      fbLoadEntries().then((fbEntries) => {
        if (fbEntries.length > 0) setEntries(fbEntries);
        else {
          const storedEntries = localStorage.getItem(STORAGE_ENTRIES);
          if (storedEntries) try { setEntries(JSON.parse(storedEntries) as PrayerEntry[]); } catch { setEntries([]); }
        }
      });
      fbLoadUsers().then((fbUsers) => {
        if (fbUsers.length > 0) setUsers(fbUsers);
        else {
          const storedUsers = localStorage.getItem(STORAGE_USERS);
          if (storedUsers) try { setUsers(JSON.parse(storedUsers) as User[]); } catch { setUsers([]); }
        }
      });
    } else {
      const storedEntries = localStorage.getItem(STORAGE_ENTRIES);
      if (storedEntries) try { setEntries(JSON.parse(storedEntries) as PrayerEntry[]); } catch { setEntries([]); }
      const storedUsers = localStorage.getItem(STORAGE_USERS);
      if (storedUsers) try { setUsers(JSON.parse(storedUsers) as User[]); } catch { setUsers([]); }
    }

    const session = localStorage.getItem(STORAGE_SESSION);
    if (session) {
      if (session === MASTER_USER_ID) {
        setIsMaster(true);
        setCurrentUserId("");
      } else {
        setCurrentUserId(session);
      }
    }

    setRandomVerse(VERSES[Math.floor(Math.random() * VERSES.length)]);
    const firstTrack = HYMN_TRACKS[Math.floor(Math.random() * HYMN_TRACKS.length)];
    setDailyTrack(firstTrack);
    setSelectedVideoUrl(firstTrack.youtubeLinks[0]?.url ?? firstTrack.videoUrl);

    const storedVideo = localStorage.getItem(STORAGE_CUSTOM_VIDEO);
    if (storedVideo) {
      setCustomVideoUrl(storedVideo);
      setSelectedVideoUrl(storedVideo);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.has("shared")) {
      setTab("home");
      setPrayerInput("");
      setSelectedEntryId(null);
      window.history.replaceState({}, "", `${window.location.origin}${window.location.pathname}`);
    }

    // PWA install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_ENTRIES, JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (customVideoUrl.trim()) {
      localStorage.setItem(STORAGE_CUSTOM_VIDEO, customVideoUrl.trim());
    }
  }, [customVideoUrl]);

  function toggleVersion(id: string) {
    setSelectedVersions((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  async function submitPrayer(event: FormEvent) {
    event.preventDefault();
    const trimmed = prayerInput.trim();
    if (!trimmed) return;
    setAiLoading(true);
    setAiResult(null);

    // 로컬 fallback 데이터 준비
    const themes = detectThemes(trimmed);
    const localVerses = pickVerses(themes, trimmed);

    let aiData: {verses:{reference:string;text:string}[];opening:string;advice:string;closing:string} | null = null;

    try {
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prayer: trimmed, language: lang }),
      });
      if (resp.ok) {
        aiData = await resp.json();
      }
    } catch {
      // AI 실패 시 로컬 fallback 사용
    }

    const entry: PrayerEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      dateISO: todayIso,
      createdAt: Date.now(),
      language: lang,
      prayer: trimmed,
      themes,
      verseIds: localVerses.map((verse) => verse.id),
      selectedVersions,
      authorId: currentUser?.id ?? "guest",
      aiResponse: aiData ?? undefined,
    };
    setEntries((prev) => [entry, ...prev]);
    setAiResult(aiData);
    setAiLoading(false);
    fbSaveEntry(entry);
    setPrayerInput("");
    setSelectedEntryId(entry.id);
  }

  function refreshRandomVerse() {
    const candidate = VERSES[Math.floor(Math.random() * VERSES.length)];
    setRandomVerse(candidate);
  }

  function checkUsernameDuplicate() {
    const value = signupDraft.username.trim().toLowerCase();
    if (!value) {
      setIdCheckMessage(t.required);
      return;
    }
    const exists = users.some((user) => user.username.toLowerCase() === value);
    setIdCheckMessage(exists ? t.usernameDuplicate : t.usernameAvailable);
  }

  function signup(event: FormEvent) {
    event.preventDefault();
    if (!signupDraft.username || !signupDraft.password || !signupDraft.name || !signupDraft.privacyAgree) {
      setAuthMessage(t.required);
      return;
    }
    const duplicated = users.some((user) => user.username.toLowerCase() === signupDraft.username.toLowerCase());
    if (duplicated) {
      setAuthMessage(t.usernameDuplicate);
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      ...signupDraft,
      username: signupDraft.username.trim(),
    };
    setUsers((prev) => [newUser, ...prev]);
    fbSaveUser(newUser);
    setCurrentUserId(newUser.id);
    setIsMaster(false);
    localStorage.setItem(STORAGE_SESSION, newUser.id);
    setSignupDraft(emptyUserDraft);
    setAuthMessage("");
    setIdCheckMessage("");
  }

  function login() {
    if (loginId === MASTER_USER_ID && loginPassword === MASTER_PASSWORD) {
      setIsMaster(true);
      setCurrentUserId("");
      localStorage.setItem(STORAGE_SESSION, MASTER_USER_ID);
      setAuthMessage("");
      setLoginPassword("");
      return;
    }

    const found = users.find((user) => user.username === loginId && user.password === loginPassword);
    if (!found) {
      setAuthMessage(t.loginFail);
      return;
    }
    setCurrentUserId(found.id);
    setIsMaster(false);
    localStorage.setItem(STORAGE_SESSION, found.id);
    setAuthMessage("");
    setLoginPassword("");
  }

  function logout() {
    setIsMaster(false);
    setCurrentUserId("");
    setLoginId("");
    setLoginPassword("");
    localStorage.removeItem(STORAGE_SESSION);
  }

  function removeUserByMaster(userId: string) {
    if (!isMaster) return;
    fbDeleteUser(userId);
    entries.filter((entry) => entry.authorId === userId).forEach((entry) => fbDeleteEntry(entry.id));
    setUsers((prev) => prev.filter((user) => user.id !== userId));
    setEntries((prev) => prev.filter((entry) => entry.authorId !== userId));
  }

  function clearUserPrayerByMaster(userId: string) {
    if (!isMaster) return;
    entries.filter((entry) => entry.authorId === userId).forEach((entry) => fbDeleteEntry(entry.id));
    setEntries((prev) => prev.filter((entry) => entry.authorId !== userId));
  }

  function pickRandomTrack() {
    const next = HYMN_TRACKS[Math.floor(Math.random() * HYMN_TRACKS.length)];
    setDailyTrack(next);
    setSelectedVideoUrl(next.youtubeLinks[0]?.url ?? next.videoUrl);
  }

  function applyCustomVideoLink() {
    const trimmed = customVideoUrl.trim();
    if (!trimmed) return;
    setSelectedVideoUrl(trimmed);
  }

  function requestSupport() {
    const amount = selectedAmount === "custom" ? Number(customAmount) : selectedAmount;
    if (!supportName.trim() || !supportPhone.trim() || !amount) {
      setSupportMessage(t.required);
      return;
    }
    setSupportMessage(`${formatMoney(amount)} 후원을 신청했습니다.`);
  }

  async function shareApp() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${Date.now()}`;
    setTab("home");
    if (navigator.share) {
      await navigator.share({
        title: t.appName,
        text: t.shareTitle,
        url: shareUrl,
      });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setShareMessage(t.copied);
  }

  async function copyShareLink() {
    const shareUrl = `${window.location.origin}${window.location.pathname}?shared=${Date.now()}`;
    await navigator.clipboard.writeText(shareUrl);
    setShareMessage(t.copied);
  }

  const tabs: Array<{ id: TabId; label: string; icon: string }> = [
    { id: "home", label: t.home, icon: "M3 10.5 12 3l9 7.5V21H3z" },
    { id: "bible", label: t.bible, icon: "M5 4h14v16H5z" },
    { id: "calendar", label: t.calendar, icon: "M6 4h12v16H6z M6 8h12" },
    { id: "hymn", label: t.hymn, icon: "M9 4v12a3 3 0 1 0 2 2V8h6" },
    { id: "support", label: t.support, icon: "M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.65-7 10-7 10z" },
    { id: "my", label: t.my, icon: "M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0" },
  ];

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-slate-50 pb-20">
      <header className="sticky top-0 z-20 bg-blue-700 px-4 pb-3 pt-4 text-white shadow">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.appName}</h1>
          <select
            value={lang}
            onChange={(event) => setLang(event.target.value as LanguageCode)}
            className="rounded-md border border-blue-200 bg-white/95 px-2 py-1 text-xs text-slate-800"
            aria-label={t.language}
          >
            {LANGUAGES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-blue-100">
          {formatDate(today, lang)}
          {currentUser ? ` · ${currentUser.name}` : isMaster ? " · Master" : ` · ${lang === "ko" ? "게스트" : "Guest"}`}
          {" · 📱"}
        </p>
        {holiday ? (
          <p className="mt-1 inline-block rounded bg-white/20 px-2 py-1 text-xs">
            {t.holiday}: {holiday}
          </p>
        ) : null}
      </header>

      <main className="space-y-4 px-4 py-4">
        <AnimatePresence mode="wait">
          {tab === "home" ? (
            <motion.section key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              {showInstallBanner ? (
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-3 text-white shadow">
                  <div>
                    <p className="text-sm font-bold">📱 {lang === "ko" ? "앱으로 설치하기" : lang === "ja" ? "アプリとしてインストール" : lang === "zh" ? "安装为应用" : lang === "ru" ? "Установить приложение" : lang === "he" ? "התקן כאפליקציה" : lang === "pt" ? "Instalar como app" : lang === "es" ? "Instalar como app" : lang === "fr" ? "Installer l'app" : "Install App"}</p>
                    <p className="text-xs text-blue-100">{lang === "ko" ? "홈 화면에 추가하면 앱처럼 사용할 수 있습니다" : lang === "ja" ? "ホーム画面に追加するとアプリのように使えます" : lang === "zh" ? "添加到主屏幕后可像应用一样使用" : "Add to home screen to use like a native app"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        if (installPrompt) {
                          await (installPrompt as any).prompt();
                          setShowInstallBanner(false);
                        }
                      }}
                      className="rounded-md bg-white px-3 py-1.5 text-xs font-bold text-blue-700"
                    >
                      {lang === "ko" ? "설치" : lang === "ja" ? "インストール" : lang === "zh" ? "安装" : "Install"}
                    </button>
                    <button onClick={() => setShowInstallBanner(false)} className="text-xs text-blue-200">✕</button>
                  </div>
                </div>
              ) : null}
              <form onSubmit={submitPrayer} className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
                <textarea
                  value={prayerInput}
                  onChange={(event) => setPrayerInput(event.target.value)}
                  placeholder={t.prayerPlaceholder}
                  className="h-36 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-blue-400"
                />
                <button type="submit" className="w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white">
                  {t.prayNow}
                </button>
              </form>

              <div className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-blue-700">{t.todayWord}</h2>
                  <button onClick={refreshRandomVerse} className="whitespace-pre-line text-right text-xs font-semibold text-blue-700">
                    {t.randomRefresh}
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold">{localize(randomVerse.reference, lang)}</p>
                <p className="mt-1 text-sm leading-7 text-slate-700">{localize(randomVerse.text, lang)}</p>
                <img
                  src={randomVerse.image}
                  alt="verse"
                  className="mt-3 h-44 w-full rounded-lg object-cover"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_VERSE_IMAGE;
                  }}
                />
              </div>

              {aiLoading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-sm">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                  <p className="text-sm text-slate-600">AI가 기도를 분석하고 있습니다...</p>
                </motion.div>
              ) : latestEntry ? (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 rounded-xl bg-white p-3 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-700">{t.recommendedVerses}</h3>
                  <img
                    src={latestVerseImage}
                    alt="recommended verse"
                    className="h-44 w-full rounded-lg object-cover"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_VERSE_IMAGE;
                    }}
                  />
                  {latestAiVerses ? (
                    latestAiVerses.map((v, i) => (
                      <p key={i} className="text-sm leading-7 text-slate-700">
                        <span className="font-semibold">{v.reference}:</span> {v.text}
                      </p>
                    ))
                  ) : (
                    latestVerses.map((verse) => (
                      <p key={verse.id} className="text-sm leading-7 text-slate-700">
                        <span className="font-semibold">{localize(verse.reference, lang)}:</span> {localize(verse.text, lang)}
                      </p>
                    ))
                  )}
                  <h3 className="pt-2 text-sm font-bold text-blue-700">{t.pastoralAdvice}</h3>
                  {latestEntry.aiResponse ? (
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="mb-2 text-sm font-medium text-blue-800">✨ AI 맞춤 상담</p>
                      <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{latestAdvice}</p>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{latestAdvice}</p>
                  )}
                </motion.div>
              ) : null}
            </motion.section>
          ) : null}
      {tab === "bible" && (<div className="p-4 space-y-4"><div className="flex gap-2"><button onClick={() => { setBibleTestament("old"); setBibleBook(""); setBibleChapter(0); setBibleText(""); }} className={`flex-1 py-2 rounded-lg font-bold ${bibleTestament === "old" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>구약</button><button onClick={() => { setBibleTestament("new"); setBibleBook(""); setBibleChapter(0); setBibleText(""); }} className={`flex-1 py-2 rounded-lg font-bold ${bibleTestament === "new" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>신약</button></div>{!bibleBook && (<div className="grid grid-cols-3 gap-2">{(bibleTestament === "old" ? OT_BOOKS : NT_BOOKS).map((b, i) => (<button key={b} onClick={() => setBibleBook(b)} className="py-2 px-1 border rounded-lg text-sm hover:bg-blue-50">{(bibleTestament === "old" ? OT_KO : NT_KO)[i]}</button>))}</div>)}{bibleBook && !bibleChapter && (<div><button onClick={() => setBibleBook("")} className="mb-3 text-blue-600">← 목록으로</button><h3 className="font-bold mb-2">{(bibleTestament === "old" ? OT_KO : NT_KO)[(bibleTestament === "old" ? OT_BOOKS : NT_BOOKS).indexOf(bibleBook)]} - 장 선택</h3><div className="grid grid-cols-5 gap-2">{Array.from({ length: BOOK_CHAPTERS[bibleBook] || 1 }, (_, i) => (<button key={i+1} onClick={() => { setBibleChapter(i+1); fetchBible(bibleBook, i+1); }} className="py-2 border rounded-lg hover:bg-blue-50">{i+1}</button>))}</div></div>)}{bibleBook && bibleChapter > 0 && (<div><button onClick={() => { setBibleChapter(0); setBibleText(""); }} className="mb-3 text-blue-600">← 장 목록으로</button><h3 className="font-bold mb-2">{(bibleTestament === "old" ? OT_KO : NT_KO)[(bibleTestament === "old" ? OT_BOOKS : NT_BOOKS).indexOf(bibleBook)]} {bibleChapter}장</h3>{bibleLoading ? <p className="text-center py-8">📖 불러오는 중...</p> : <div className="bg-white rounded-xl p-4 shadow leading-relaxed whitespace-pre-wrap">{bibleText}</div>}</div>)}</div>)}
          {tab === "calendar" ? (
            <motion.section key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}>←</button>
                <p className="text-sm font-semibold">{monthDate.getFullYear()}.{String(monthDate.getMonth() + 1).padStart(2, "0")}</p>
                <button onClick={() => setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}>→</button>
              </div>

              <div className="grid grid-cols-7 gap-1 rounded-xl bg-white p-2 shadow-sm">
                {calendarCells.map((cell, idx) => {
                  const count = cell ? visibleEntries.filter((entry) => entry.dateISO === dayKey(cell)).length : 0;
                  const selected = cell ? isSameDate(cell, selectedDay) : false;
                  return (
                    <button
                      key={cell ? `${cell.toISOString()}-${count}` : `empty-${idx}`}
                      disabled={!cell}
                      onClick={() => {
                        if (!cell) return;
                        setSelectedDay(cell);
                        setSelectedEntryId(null);
                      }}
                      className={`relative h-11 rounded-md text-sm ${selected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"} ${!cell ? "opacity-0" : ""}`}
                    >
                      {cell?.getDate()}
                      {count > 0 ? <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 rounded px-1 text-[10px] ${selected ? "bg-white text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>{count}</span> : null}
                    </button>
                  );
                })}
              </div>

              <div className="rounded-xl bg-white p-3 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700">{t.selectedDateJournal}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {t.entriesOfDay}: {entriesOfDay.length}
                </p>
                <div className="mt-2 space-y-2">
                  {entriesOfDay.length === 0 ? <p className="text-sm text-slate-500">{t.noEntry}</p> : null}
                  {entriesOfDay.map((entry, index) => (
                    <button key={entry.id} onClick={() => setSelectedEntryId(entry.id)} className="w-full rounded-md border border-slate-200 p-2 text-left text-sm">
                      <p className="font-semibold">
                        #{index + 1} {formatTime(entry.createdAt, lang)}
                      </p>
                      <p className="mt-1 text-slate-600">{entry.prayer.slice(0, 110)}{entry.prayer.length > 110 ? "..." : ""}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedDetail ? (
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <p className="text-xs font-semibold text-blue-700">{selectedDetail.dateISO} {formatTime(selectedDetail.createdAt, lang)}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">{selectedDetail.prayer}</p>
                  <div className="mt-3 space-y-2">
                    {selectedDetailVerses.map((verse) => {
                      return (
                        <p key={verse.id} className="text-sm leading-7 text-slate-700">
                          <span className="font-semibold">{localize(verse.reference, lang)}:</span> {localize(verse.text, lang)}
                        </p>
                      );
                    })}
                  </div>
                  <h4 className="mt-4 text-sm font-bold text-blue-700">{t.pastoralAdvice}</h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{selectedDetailAdvice}</p>
                </div>
              ) : null}
            </motion.section>
          ) : null}

          {tab === "hymn" ? (
            <motion.section key="hymn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-blue-700">{t.todayHymn}</h2>
                  <button onClick={pickRandomTrack} className="text-xs font-semibold text-blue-700">
                    {t.randomCopyrightFree}
                  </button>
                </div>
                <p className="mt-2 text-sm font-semibold">{localize(dailyTrack.title, lang)}</p>
                <p className="mt-1 text-xs text-slate-500">{localize(dailyTrack.description, lang)}</p>
                <img
                  src={dailyTrack.scoreImage}
                  alt="score"
                  className="mt-3 h-52 w-full rounded-lg object-cover"
                  onError={(event) => {
                    event.currentTarget.src = FALLBACK_VERSE_IMAGE;
                  }}
                />
                <audio key={dailyTrack.id} controls src={dailyTrack.audioUrl} className="mt-3 w-full" preload="none" />
                <a href={dailyTrack.videoUrl} target="_blank" rel="noreferrer" className="mt-2 block rounded-md bg-blue-700 px-3 py-2 text-center text-xs font-semibold text-white">
                  {t.playVideo}
                </a>
                <div className="mt-3 rounded-lg border border-slate-200 p-2">
                  <p className="text-xs font-semibold text-slate-600">{lang === "ko" ? "무료 영상 링크 삽입 (YouTube)" : lang === "ja" ? "無料動画リンクを挿入（YouTube）" : lang === "zh" ? "插入免费视频链接（YouTube）" : "Insert free video link (YouTube)"}</p>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={customVideoUrl}
                      onChange={(event) => setCustomVideoUrl(event.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-sm"
                    />
                    <button onClick={applyCustomVideoLink} className="rounded-md bg-slate-800 px-3 text-xs font-semibold text-white">
                       {lang === "ko" ? "적용" : lang === "ja" ? "適用" : lang === "zh" ? "应用" : "Apply"}
                    </button>
                  </div>
                </div>
                {toYoutubeEmbedUrl(selectedVideoUrl) ? (
                  <iframe
                    title="worship-video"
                    src={toYoutubeEmbedUrl(selectedVideoUrl) ?? undefined}
                    className="mt-3 h-52 w-full rounded-lg border border-slate-200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-700">{lang === "ko" ? "유효한 YouTube 링크를 넣어주세요." : lang === "ja" ? "有効なYouTubeリンクを入力してください。" : lang === "zh" ? "请输入有效的YouTube链接。" : "Please enter a valid YouTube link."}</p>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <a href={dailyTrack.scoreLink} target="_blank" rel="noreferrer" className="rounded-md border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700">
                    {t.openScore}
                  </a>
                  <a href={dailyTrack.youtubeLinks[0]?.url} target="_blank" rel="noreferrer" className="rounded-md bg-blue-700 px-2 py-2 text-center text-xs font-semibold text-white">
                    {t.openYoutube}
                  </a>
                </div>
                <div className="mt-3 space-y-2">
                  {dailyTrack.youtubeLinks.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      {localize(link.label, lang)}
                    </a>
                  ))}
                </div>
              </div>
            </motion.section>
          ) : null}

          {tab === "support" ? (
            <motion.section key="support" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 rounded-xl bg-white p-3 shadow-sm">
              <div className="rounded-xl bg-orange-500 px-4 py-5 text-center text-white">
                <p className="text-xl">♡</p>
                <h2 className="mt-1 text-lg font-bold">{t.supportTitle}</h2>
                <p className="mt-1 text-sm">{lang === "ko" ? "더 많은 분들이 말씀과 동행할 수 있도록" : lang === "ja" ? "より多くの方がみことばと共に歩めるように" : lang === "zh" ? "让更多人与话语同行" : "So more people can walk with the Word"}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {([
                  ["bank", t.bankSupport],
                  ["mobile", t.mobileSupport],
                  ["ars", t.arsSupport],
                ] as Array<[SupportType, string]>).map(([id, label]) => (
                  <button key={id} onClick={() => setSupportType(id)} className={`rounded-md border-b-2 px-2 py-2 text-xs font-semibold ${supportType === id ? "border-blue-700 text-blue-700" : "border-transparent text-slate-400"}`}>
                    {label}
                  </button>
                ))}
              </div>

              {supportType === "bank" ? (
                <div className="space-y-3 rounded-xl border border-slate-800/20 bg-slate-50 p-4">
                  <h3 className="text-center text-xl font-bold">계좌 후원</h3>
                  <div className="rounded-xl bg-blue-50 p-4 text-center">
                    <p className="text-sm text-slate-500">은행</p>
                    <p className="text-3xl font-bold">국민은행</p>
                    <p className="mt-3 text-sm text-slate-500">계좌번호</p>
                    <p className="text-3xl font-extrabold text-blue-700">000-000-00-000000</p>
                    <p className="mt-3 text-sm text-slate-500">예금주</p>
                    <p className="text-2xl font-bold">말씀동행</p>
                  </div>
                  <p className="text-center text-sm text-slate-600">후원 문의: contact@example.com</p>
                </div>
              ) : null}
              {supportType === "mobile" ? (
                <div className="space-y-3 rounded-xl border border-slate-800/20 bg-slate-50 p-4">
                  <h3 className="text-center text-xl font-bold">휴대폰 후원</h3>
                  <div>
                    <p className="mb-1 text-sm font-semibold">이름</p>
                    <input value={supportName} onChange={(event) => setSupportName(event.target.value)} placeholder="이름을 입력해주세요" className="w-full rounded-md border border-slate-300 p-3 text-base" />
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-semibold">핸드폰 번호</p>
                    <div className="rounded-md bg-amber-50 p-2 text-xs text-amber-700">알뜰폰은 ARS 후원 및 계좌 후원으로 동참하실 수 있습니다.</div>
                    <div className="mt-2 flex gap-2">
                      <select value={supportCarrier} onChange={(event) => setSupportCarrier(event.target.value)} className="w-24 rounded-md border border-slate-300 p-3 text-base">
                        <option>SKT</option>
                        <option>KT</option>
                        <option>LGU+</option>
                      </select>
                      <input value={supportPhone} onChange={(event) => setSupportPhone(event.target.value)} placeholder="예)01012345678" className="flex-1 rounded-md border border-slate-300 p-3 text-base" />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-semibold">후원금액</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DONATION_PRESETS.map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setSelectedAmount(amount)}
                          className={`rounded-md border px-2 py-2 text-sm ${selectedAmount === amount ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 bg-white"}`}
                        >
                          {formatMoney(amount)}
                        </button>
                      ))}
                      <button
                        onClick={() => setSelectedAmount("custom")}
                        className={`rounded-md border px-2 py-2 text-sm ${selectedAmount === "custom" ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 bg-white"}`}
                      >
                        직접입력
                      </button>
                    </div>
                    {selectedAmount === "custom" ? (
                      <input
                        value={customAmount}
                        onChange={(event) => setCustomAmount(event.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="금액(숫자만 입력)"
                        className="mt-2 w-full rounded-md border border-slate-300 p-3 text-base"
                      />
                    ) : null}
                  </div>
                  <button onClick={requestSupport} className="w-full rounded-md bg-blue-700 py-3 text-base font-semibold text-white">
                    후원하기
                  </button>
                  {supportMessage ? <p className="text-center text-sm text-blue-700">{supportMessage}</p> : null}
                </div>
              ) : null}
              {supportType === "ars" ? (
                <div className="space-y-3 rounded-xl border border-slate-800/20 bg-slate-50 p-4">
                  <h3 className="text-center text-xl font-bold">ARS 후원</h3>
                  <div className="rounded-xl bg-blue-50 p-4 text-center">
                    <p className="text-3xl">📞</p>
                    <p className="mt-2 text-4xl font-extrabold text-blue-700">060-700-1004</p>
                    <p className="mt-2 text-sm text-slate-600">전화 한 통으로 간편하게 후원하세요</p>
                  </div>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>1회 후원금: 2,000원 (정보이용료)</li>
                    <li>안내 음성에 따라 진행해 주세요</li>
                    <li>후원금은 말씀동행 사역에 사용됩니다</li>
                  </ul>
                </div>
              ) : null}
            </motion.section>
          ) : null}

          {tab === "my" ? (
            <motion.section key="my" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <div className="rounded-xl bg-white p-3 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700">{t.shareTitle}</h3>
                <p className="mt-1 text-sm text-slate-600">{t.shareDesc}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button onClick={shareApp} className="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
                    {t.share}
                  </button>
                  <button onClick={copyShareLink} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                    {t.copy}
                  </button>
                </div>
                {shareMessage ? <p className="mt-2 text-xs text-emerald-600">{shareMessage}</p> : null}
              </div>

              <form onSubmit={signup} className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700">{t.signup}</h3>
                <div className="flex gap-2">
                  <input
                    value={signupDraft.username}
                    onChange={(event) => setSignupDraft((prev) => ({ ...prev, username: event.target.value }))}
                    placeholder={t.username}
                    autoComplete="username"
                    className="flex-1 rounded-md border border-slate-300 p-3 text-base"
                  />
                  <button type="button" onClick={checkUsernameDuplicate} className="rounded-md border border-blue-300 px-3 text-xs font-semibold text-blue-700">
                    {t.usernameCheck}
                  </button>
                </div>
                {idCheckMessage ? <p className="text-xs text-slate-500">{idCheckMessage}</p> : null}
                <input value={signupDraft.password} onChange={(event) => setSignupDraft((prev) => ({ ...prev, password: event.target.value }))} autoComplete="new-password" type="password" placeholder={t.password} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <input value={signupDraft.name} onChange={(event) => setSignupDraft((prev) => ({ ...prev, name: event.target.value }))} autoComplete="name" placeholder={t.name} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <input value={signupDraft.phone} onChange={(event) => setSignupDraft((prev) => ({ ...prev, phone: event.target.value }))} autoComplete="tel" inputMode="numeric" placeholder={t.phone} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <input value={signupDraft.email} onChange={(event) => setSignupDraft((prev) => ({ ...prev, email: event.target.value }))} autoComplete="email" type="email" placeholder={t.email} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <input value={signupDraft.birthDate} onChange={(event) => setSignupDraft((prev) => ({ ...prev, birthDate: event.target.value }))} type="date" className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setSignupDraft((prev) => ({ ...prev, gender: "male" }))} className={`rounded-md py-2 text-sm ${signupDraft.gender === "male" ? "bg-blue-700 text-white" : "bg-slate-100"}`}>
                    {t.male}
                  </button>
                  <button type="button" onClick={() => setSignupDraft((prev) => ({ ...prev, gender: "female" }))} className={`rounded-md py-2 text-sm ${signupDraft.gender === "female" ? "bg-blue-700 text-white" : "bg-slate-100"}`}>
                    {t.female}
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={signupDraft.marketingAgree} onChange={(event) => setSignupDraft((prev) => ({ ...prev, marketingAgree: event.target.checked }))} />
                  {t.marketingAgree}
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={signupDraft.privacyAgree} onChange={(event) => setSignupDraft((prev) => ({ ...prev, privacyAgree: event.target.checked }))} />
                  {t.privacyAgree}
                </label>
                <button type="button" onClick={() => setShowPolicy((prev) => !prev)} className="text-xs text-blue-700 underline">
                  {t.privacyPolicy}
                </button>
                {showPolicy ? <p className="rounded-md bg-slate-100 p-2 text-xs text-slate-700">{t.policySummary}</p> : null}
                <button type="submit" className="w-full rounded-md bg-blue-700 py-2 text-sm font-semibold text-white">
                  {t.save}
                </button>
              </form>

              <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm">
                <h3 className="text-sm font-bold text-blue-700">{t.loginTitle}</h3>
                <input value={loginId} onChange={(event) => setLoginId(event.target.value)} autoComplete="username" placeholder={t.username} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} autoComplete="current-password" type="password" placeholder={t.password} className="w-full rounded-md border border-slate-300 p-3 text-base" />
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={login} className="rounded-md bg-blue-700 py-2 text-sm font-semibold text-white">
                    {t.login}
                  </button>
                  <button onClick={logout} className="rounded-md border border-slate-300 py-2 text-sm font-semibold text-slate-700">
                    {t.logout}
                  </button>
                </div>
                {authMessage ? <p className="text-xs text-rose-600">{authMessage}</p> : null}
                <p className="text-xs text-slate-400">{"📱 Local Mode"}</p>
              </div>

              {isMaster ? (
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <h3 className="text-sm font-bold text-blue-700">{t.masterView}</h3>
                  <p className="mt-1 text-xs text-slate-500">Member DB Management</p>
                  <div className="mt-2 max-h-72 space-y-2 overflow-auto">
                    {users.map((user) => {
                      const count = entries.filter((entry) => entry.authorId === user.id).length;
                      return (
                        <div key={user.id} className="rounded-md border border-slate-200 p-2 text-xs">
                          <p className="font-semibold">{user.username} / {user.name}</p>
                          <p>{t.email}: {user.email || "-"}</p>
                          <p>{t.phone}: {user.phone || "-"}</p>
                          <p>{t.joinedAt}: {new Date(user.createdAt).toLocaleDateString(localeOf(lang))}</p>
                          <p>{t.prayerCount}: {count}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <button
                              onClick={() => clearUserPrayerByMaster(user.id)}
                              className="rounded border border-amber-300 px-2 py-1 text-[11px] font-semibold text-amber-700"
                            >
                              Clear Prayers
                            </button>
                            <button
                              onClick={() => removeUserByMaster(user.id)}
                              className="rounded border border-rose-300 px-2 py-1 text-[11px] font-semibold text-rose-700"
                            >
                              Delete User
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {users.length === 0 ? <p className="text-xs text-slate-500">{t.noEntry}</p> : null}
                  </div>
                </div>
              ) : null}

              {!isMaster && currentUser ? (
                <div className="rounded-xl bg-white p-3 text-xs shadow-sm">
                  <h3 className="text-sm font-bold text-blue-700">{t.memberView}</h3>
                  <p className="mt-2">{t.username}: {currentUser.username}</p>
                  <p>{t.name}: {currentUser.name}</p>
                  <p>{t.prayerCount}: {entries.filter((entry) => entry.authorId === currentUser.id).length}</p>
                </div>
              ) : null}
            </motion.section>
          ) : null}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-30 flex w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => setTab(item.id)} className={`flex flex-1 flex-col items-center gap-1 py-2 text-[11px] ${tab === item.id ? "text-blue-700" : "text-slate-500"}`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
