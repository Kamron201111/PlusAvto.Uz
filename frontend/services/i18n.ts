import { toCyrillic } from './transliterate';

export type Lang = 'uz' | 'kr';

const UZ = {
  app_name: "PlusAvto.Uz",
  app_desc: "O'zbekistonda haydovchilik guvohnomasi olish uchun online test platformasi. Biletlar, darslar va testlar.",
  not_active: "Siz faol emassiz",
  active: "Faol",

  menu_topic: "Mavzu bo'yicha trenirovkani boshlash",
  menu_exam: "Imtihon topshirish",
  menu_mistakes: "Mening xato savollarim",
  menu_premium: "Obuna sotib olish",
  menu_profile: "Profil",
  menu_courses: "Video kurslar",
  menu_vazifalar: "Vazifalar",

  qa_group: "Savol-javob guruhi",
  buy_subscription: "Obuna sotib olish",

  my_favorite: "Mening sevimli savollarim",
  my_mistakes: "Mening xato savollarim",
  all_mistakes: "Barcha xato qilingan savollar",
  topic_training: "Mavzu bo'yicha trenirovkani boshlash",
  ticket_training: "Biletlar bo'yicha trenirovkani boshlash",
  random_test: "Random test",

  exam_by_topics: "Mavzular bo'yicha imtihon topshirish",
  interim_control: "Oraliq nazorat",
  exam_topshirish: "Imtihon topshirish",
  vazifa_topshirish: "Vazifa topshirish",

  login_title: "Tizimga kirish",
  phone: "Telefon raqam",
  password: "Parol",
  password_placeholder: "Parolingizni kiriting",
  login_btn: "Tizimga kirish",
  forgot_password: "Parolni unutdingizmi?",
  no_account: "Siz hali ro'yxatdan o'tmadingizmi?",
  register_link: "Ro'yxatdan o'tish",

  register_title: "Ro'yxatdan o'tish",
  your_name: "Ismingiz",
  name_placeholder: "Ism Familiya",
  new_password_placeholder: "Yangi parol kiriting",
  register_btn: "Ro'yxatdan o'tish",
  already_have: "Akkauntingiz bormi?",
  login_link: "Kirish",

  lang_uz: "Uzbek",
  lang_kr: "Kiril",
  theme_light: "Light",
  theme_system: "System",
  theme_dark: "Dark",

  back: "Orqaga",
  next: "Keyingi",
  previous: "Oldingi",
  finish_test: "Testni yakunlash",
  view_explanation: "Izohni ko'rish",
  hide_explanation: "Izohni yashirish",
  cancel: "Bekor qilish",
  save: "Saqlash",
  choose: "Tanlang",

  profile: "Profil",
  name: "Ism",
  telegram: "Telegram",
  email: "Email",
  subscription_status: "Obuna holati",
  subscription_expires: "Obuna tugash vaqti",
  upload_photo: "Rasm yuklash",
  logout: "Chiqish",

  result: "Natija",
  correct: "To'g'ri",
  wrong: "Xato",
  passed: "Imtihondan o'tdingiz",
  failed: "Imtihondan o'tolmadingiz",
  retry: "Qayta urinish",
  home: "Bosh sahifa",

  no_mistakes: "Xato savollar yo'q",
  no_mistakes_desc: "Hali xato qilmadingiz",

  premium_title: "Obuna sotib olish",
  premium_desc: "Cheksiz testlar va video darslar",
  card_number: "Karta raqami",
  card_owner: "Karta egasi",
  copy: "Nusxa olish",
  copied: "Nusxa olindi",

  premium_required: "Bu funksiya faqat Premium foydalanuvchilarga",
  premium_required_desc: "Obuna sotib olib, barcha imkoniyatlardan foydalaning",
  buy_premium_btn: "Obuna sotib olish",

  admin_panel: "Admin Panel",
  add: "Qo'shish",
  edit: "Tahrirlash",
  delete: "O'chirish",
  search: "Qidirish...",
  no_data: "Ma'lumot yo'q",
  loading: "Yuklanmoqda...",
  confirm_delete: "O'chirishni tasdiqlaysizmi?",
};

function toKr<T extends Record<string, string>>(obj: T): T {
  const r: any = {};
  for (const k in obj) r[k] = toCyrillic(obj[k]);
  return r;
}

const dict: Record<Lang, typeof UZ> = {
  uz: UZ,
  kr: toKr(UZ),
};

export function t(lang: Lang, key: keyof typeof UZ): string {
  return dict[lang]?.[key] || UZ[key] || key;
}

export const languages: { code: Lang; label: string }[] = [
  { code: 'uz', label: 'Uzbek' },
  { code: 'kr', label: 'Kiril' },
];
