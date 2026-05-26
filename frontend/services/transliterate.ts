// O'zbek Lotin ↔ Kirill transliteratsiya — eng to'liq kutubxona
// Asoslandi: rasmiy O'zbek transliteratsiya qoidalari

// Lotin → Kirill mapping (uzun birikmalar avval)
const L2C: [string, string][] = [
  ["Yo'", "Ё"], ["yo'", "ё"], ["YO'", "Ё"],
  ["Sh", "Ш"], ["sh", "ш"], ["SH", "Ш"],
  ["Ch", "Ч"], ["ch", "ч"], ["CH", "Ч"],
  ["Ng", "Нг"], ["ng", "нг"], ["NG", "НГ"],
  ["Yo", "Ё"], ["yo", "ё"], ["YO", "Ё"],
  ["Yu", "Ю"], ["yu", "ю"], ["YU", "Ю"],
  ["Ya", "Я"], ["ya", "я"], ["YA", "Я"],
  ["Ye", "Е"], ["ye", "е"], ["YE", "Е"],
  ["Ts", "Ц"], ["ts", "ц"], ["TS", "Ц"],
  ["o'", "ў"], ["O'", "Ў"],
  ["g'", "ғ"], ["G'", "Ғ"],
  ["a", "а"], ["A", "А"], ["b", "б"], ["B", "Б"],
  ["d", "д"], ["D", "Д"], ["e", "е"], ["E", "Е"],
  ["f", "ф"], ["F", "Ф"], ["g", "г"], ["G", "Г"],
  ["h", "ҳ"], ["H", "Ҳ"], ["i", "и"], ["I", "И"],
  ["j", "ж"], ["J", "Ж"], ["k", "к"], ["K", "К"],
  ["l", "л"], ["L", "Л"], ["m", "м"], ["M", "М"],
  ["n", "н"], ["N", "Н"], ["o", "о"], ["O", "О"],
  ["p", "п"], ["P", "П"], ["q", "қ"], ["Q", "Қ"],
  ["r", "р"], ["R", "Р"], ["s", "с"], ["S", "С"],
  ["t", "т"], ["T", "Т"], ["u", "у"], ["U", "У"],
  ["v", "в"], ["V", "В"], ["x", "х"], ["X", "Х"],
  ["y", "й"], ["Y", "Й"], ["z", "з"], ["Z", "З"],
];

// Kirill → Lotin mapping (uzun birikmalar avval)
const C2L: [string, string][] = [
  ["Нг", "Ng"], ["нг", "ng"], ["НГ", "NG"],
  ["Ё", "Yo"], ["ё", "yo"],
  ["Ю", "Yu"], ["ю", "yu"],
  ["Я", "Ya"], ["я", "ya"],
  ["Ш", "Sh"], ["ш", "sh"],
  ["Ч", "Ch"], ["ч", "ch"],
  ["Ц", "Ts"], ["ц", "ts"],
  ["Ў", "O'"], ["ў", "o'"],
  ["Ғ", "G'"], ["ғ", "g'"],
  ["Қ", "Q"], ["қ", "q"],
  ["Ҳ", "H"], ["ҳ", "h"],
  ["А", "A"], ["а", "a"], ["Б", "B"], ["б", "b"],
  ["В", "V"], ["в", "v"], ["Г", "G"], ["г", "g"],
  ["Д", "D"], ["д", "d"], ["Е", "E"], ["е", "e"],
  ["Ж", "J"], ["ж", "j"], ["З", "Z"], ["з", "z"],
  ["И", "I"], ["и", "i"], ["Й", "Y"], ["й", "y"],
  ["К", "K"], ["к", "k"], ["Л", "L"], ["л", "l"],
  ["М", "M"], ["м", "m"], ["Н", "N"], ["н", "n"],
  ["О", "O"], ["о", "o"], ["П", "P"], ["п", "p"],
  ["Р", "R"], ["р", "r"], ["С", "S"], ["с", "s"],
  ["Т", "T"], ["т", "t"], ["У", "U"], ["у", "u"],
  ["Ф", "F"], ["ф", "f"], ["Х", "X"], ["х", "x"],
  ["Ъ", "'"], ["ъ", "'"],
  ["Ь", ""], ["ь", ""],
  ["Э", "E"], ["э", "e"],
];

function convert(text: string, map: [string, string][]): string {
  if (!text) return text;
  let r = "";
  let i = 0;
  while (i < text.length) {
    let matched = false;
    for (const [from, to] of map) {
      if (text.substr(i, from.length) === from) {
        r += to;
        i += from.length;
        matched = true;
        break;
      }
    }
    if (!matched) { r += text[i]; i++; }
  }
  return r;
}

export function toCyrillic(text: string): string {
  return convert(text, L2C);
}

export function toLatin(text: string): string {
  return convert(text, C2L);
}

// Matnda qaysi alifbo borligini aniqlash
export function detectScript(text: string): 'latin' | 'cyrillic' | 'mixed' | 'unknown' {
  if (!text) return 'unknown';
  let latin = 0, cyrillic = 0;
  for (const ch of text) {
    if (/[a-zA-Z']/.test(ch)) latin++;
    else if (/[а-яА-ЯёЁўЎқҚғҒҳҲ]/.test(ch)) cyrillic++;
  }
  if (latin > 0 && cyrillic > 0) return 'mixed';
  if (latin > 0) return 'latin';
  if (cyrillic > 0) return 'cyrillic';
  return 'unknown';
}

// Asosiy adaptText — qaysi tilda yozilganini avtomatik aniqlaydi va kerakli tilga o'giradi
export function adaptText(text: string | null | undefined, targetLang: 'uz' | 'kr'): string {
  if (!text) return "";
  const script = detectScript(text);
  // Lotinda yozilgan va kerakli til kr bo'lsa → kirillga
  if (targetLang === 'kr' && script === 'latin') return toCyrillic(text);
  // Kirillda yozilgan va kerakli til uz bo'lsa → lotinga
  if (targetLang === 'uz' && script === 'cyrillic') return toLatin(text);
  // Boshqa hollarda - asl matn
  return text;
}
