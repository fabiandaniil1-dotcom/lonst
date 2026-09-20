/* Demo dataset. Replace with API responses when a backend is connected. */
window.EVENTU_DATA = {
  categories: [
    { id: 'all',      ua: 'Усі',          en: 'All' },
    { id: 'music',    ua: 'Музика',       en: 'Music' },
    { id: 'lecture',  ua: 'Лекції',       en: 'Lectures' },
    { id: 'career',   ua: 'Кар\u2019єра', en: 'Career' },
    { id: 'sport',    ua: 'Спорт',        en: 'Sport' },
    { id: 'theatre',  ua: 'Театр',        en: 'Theatre' },
    { id: 'workshop', ua: 'Воркшопи',     en: 'Workshops' }
  ],

  venues: [
    { id: 'main',    x: 30, y: 32, ua: 'Головний корпус, Велика аудиторія', en: 'Main building, Great Hall',      capUa: '480 місць',  capEn: '480 seats' },
    { id: 'library', x: 66, y: 24, ua: 'Наукова бібліотека, атріум',        en: 'Library atrium',                 capUa: '160 місць',  capEn: '160 seats' },
    { id: 'club',    x: 22, y: 68, ua: 'Студентський клуб «Підвал»',        en: 'Student club «Pidval»',          capUa: '250 місць',  capEn: '250 seats' },
    { id: 'gym',     x: 74, y: 62, ua: 'Спорткомплекс, зала №2',            en: 'Sports complex, hall 2',         capUa: '900 місць',  capEn: '900 seats' },
    { id: 'lab',     x: 48, y: 50, ua: 'Корпус IT, коворкінг 3.14',         en: 'IT building, coworking 3.14',    capUa: '60 місць',   capEn: '60 seats' }
  ],

  events: [
    {
      id: 'ev-01', cat: 'music', venue: 'club',
      date: '2026-10-03T19:00', duration: 180, price: 120, seats: 250, taken: 214,
      ink: '#2B3CF0', paper: '#FFD84D',
      ua: { title: 'Осінній джем студентських гуртів', host: 'Рада студентського клубу',
            desc: 'Шість університетських гуртів, одна сцена й одна репетиція на всіх. Двері о 18:30, перший акорд о 19:00. Бар з безалкогольними напоями працює весь вечір.' },
      en: { title: 'Autumn jam of student bands', host: 'Student club council',
            desc: 'Six campus bands, one stage, one shared rehearsal. Doors at 18:30, first chord at 19:00. Soft-drink bar runs all evening.' }
    },
    {
      id: 'ev-02', cat: 'lecture', venue: 'main',
      date: '2026-10-07T17:30', duration: 90, price: 0, seats: 480, taken: 301,
      ink: '#FF5C3E', paper: '#1A1136',
      ua: { title: 'Відкрита лекція: як читати наукові статті', host: 'Д-р Олена Гайдук, кафедра методології',
            desc: 'Практичне заняття для першого та другого курсів: структура статті, де шукати слабкі місця, як перевіряти джерела за 15 хвилин. Візьміть ноутбук.' },
      en: { title: 'Open lecture: how to read a research paper', host: 'Dr. Olena Haiduk, methodology dept.',
            desc: 'A working session for first and second years: paper anatomy, where the weak spots hide, how to check sources in 15 minutes. Bring a laptop.' }
    },
    {
      id: 'ev-03', cat: 'career', venue: 'library',
      date: '2026-10-11T11:00', duration: 240, price: 0, seats: 160, taken: 158,
      ink: '#17A57A', paper: '#EAE6F0',
      ua: { title: 'Ярмарок стажувань: 24 компанії', host: 'Центр карʼєри',
            desc: 'Живі співбесіди без попереднього запису, стенди ІТ, логістики, агро й медіа. Приносьте резюме у двох примірниках — принтер в атріумі буде зайнятий.' },
      en: { title: 'Internship fair: 24 companies', host: 'Career centre',
            desc: 'Walk-in interviews, stands from IT, logistics, agri and media. Bring two printed CVs — the atrium printer will be busy.' }
    },
    {
      id: 'ev-04', cat: 'sport', venue: 'gym',
      date: '2026-10-14T18:00', duration: 120, price: 60, seats: 900, taken: 512,
      ink: '#FFD84D', paper: '#2B3CF0',
      ua: { title: 'Дербі факультетів: баскетбол, фінал', host: 'Спортивний клуб університету',
            desc: 'Фізмат проти економістів, реванш за минулий рік. Сектор для вболівальників за студентським квитком, барабани дозволені, димові шашки — ні.' },
      en: { title: 'Faculty derby: basketball final', host: 'University sports club',
            desc: 'Physics vs Economics, a rematch of last year. Fan sector opens with a student card; drums allowed, flares are not.' }
    },
    {
      id: 'ev-05', cat: 'theatre', venue: 'main',
      date: '2026-10-18T19:30', duration: 135, price: 90, seats: 480, taken: 96,
      ink: '#1A1136', paper: '#FF5C3E',
      ua: { title: 'Студентський театр: «Тіні забутих предків»', host: 'Театральна студія «Мансарда»',
            desc: 'Прем’єра переосмисленої постановки за Коцюбинським. Дві дії з антрактом на 15 хвилин, субтитри англійською на бічному екрані.' },
      en: { title: 'Student theatre: «Shadows of Forgotten Ancestors»', host: 'Mansarda theatre studio',
            desc: 'Premiere of a reworked staging after Kotsiubynsky. Two acts with a 15-minute interval; English subtitles on the side screen.' }
    },
    {
      id: 'ev-06', cat: 'workshop', venue: 'lab',
      date: '2026-10-22T16:00', duration: 150, price: 150, seats: 60, taken: 41,
      ink: '#2B3CF0', paper: '#EAE6F0',
      ua: { title: 'Воркшоп: перший pull request у відкритий проєкт', host: 'IT-спільнота кампусу',
            desc: 'Від форку до рев’ю за одне заняття. Потрібен ноутбук з git та акаунт GitHub. Виходите із зарахованим внеском у реальний репозиторій.' },
      en: { title: 'Workshop: your first pull request', host: 'Campus IT community',
            desc: 'From fork to review in one session. Bring a laptop with git and a GitHub account. You leave with a merged contribution to a real repo.' }
    },
    {
      id: 'ev-07', cat: 'music', venue: 'library',
      date: '2026-10-26T18:30', duration: 75, price: 80, seats: 160, taken: 133,
      ink: '#FF5C3E', paper: '#FFD84D',
      ua: { title: 'Камерний вечір: фортепіано в атріумі', host: 'Кафедра музичного мистецтва',
            desc: 'Шопен, Сільвестров і дві студентські композиції під скляним дахом бібліотеки. Без антракту, вхід після початку неможливий.' },
      en: { title: 'Chamber evening: piano in the atrium', host: 'Music department',
            desc: 'Chopin, Silvestrov and two student pieces under the library glass roof. No interval; late entry is not possible.' }
    },
    {
      id: 'ev-08', cat: 'lecture', venue: 'lab',
      date: '2026-11-02T15:00', duration: 100, price: 0, seats: 60, taken: 22,
      ink: '#17A57A', paper: '#1A1136',
      ua: { title: 'Дискусія: штучний інтелект і академічна доброчесність', host: 'Комісія з етики досліджень',
            desc: 'Що вважається допомогою, а що підміною роботи. Відкритий мікрофон у другій половині — приходьте зі своїми кейсами.' },
      en: { title: 'Debate: AI and academic integrity', host: 'Research ethics board',
            desc: 'Where help ends and substitution begins. Open mic in the second half — bring your own cases.' }
    }
  ],

  reviews: [
    { id: 'r1', name: 'Марта К.', rating: 5, date: '2026-09-02',
      ua: 'Бронювала квиток на джем за дві хвилини з телефона. Код прийшов одразу, на вході просто показала екран.',
      en: 'Booked a jam ticket in two minutes from my phone. The code arrived instantly and I just showed the screen at the door.' },
    { id: 'r2', name: 'Andrii S.', rating: 4, date: '2026-08-21',
      ua: 'Зручно, що видно скільки місць лишилось. Хотілось би нагадування за день до події.',
      en: 'Good that remaining seats are visible. I would like a reminder the day before the event.' },
    { id: 'r3', name: 'Оксана П.', rating: 5, date: '2026-08-14',
      ua: 'Скасувала бронь за годину до лекції — місце одразу повернулось в загальний пул. Чесно.',
      en: 'Cancelled an hour before the lecture and the seat went straight back to the pool. Fair.' }
  ]
};
