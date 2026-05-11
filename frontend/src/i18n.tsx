import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Lang = 'ru' | 'kk' | 'en'

type Messages = Record<string, { ru: string; kk: string; en: string }>

const messages: Messages = {
  'app.name': {
    ru: 'Комплекс-проект',
    kk: 'Кешенді жоба',
    en: 'Kompleks Project',
  },
  'app.tagline': {
    ru: 'Инженерные изыскания и проекты',
    kk: 'Инженерлік ізденістер мен жобалар',
    en: 'Engineering surveys and projects',
  },
  'nav.dashboard': {
    ru: 'Панель',
    kk: 'Тақта',
    en: 'Dashboard',
  },
  'nav.projects': {
    ru: 'Проекты',
    kk: 'Жобалар',
    en: 'Projects',
  },
  'auth.loginTitle': {
    ru: 'Вход в систему',
    kk: 'Жүйеге кіру',
    en: 'Sign in',
  },
  'auth.loginSubtitle': {
    ru: 'Комплекс-проект — управление проектами',
    kk: 'Кешенді жоба — жобаларды басқару',
    en: 'Kompleks Project — project management',
  },
  'auth.email': {
    ru: 'Email',
    kk: 'Email',
    en: 'Email',
  },
  'auth.password': {
    ru: 'Пароль',
    kk: 'Құпия сөз',
    en: 'Password',
  },
  'auth.loginButton': {
    ru: 'Войти',
    kk: 'Кіру',
    en: 'Sign in',
  },
  'auth.loginBusy': {
    ru: 'Вход…',
    kk: 'Кіру…',
    en: 'Signing in…',
  },
  'layout.logout': {
    ru: 'Выйти',
    kk: 'Шығу',
    en: 'Log out',
  },
  'layout.themeToggle': {
    ru: 'Переключить тему',
    kk: 'Тақырыпты ауыстыру',
    en: 'Toggle theme',
  },
  'layout.themeLight': {
    ru: '☀ Светлая тема',
    kk: '☀ Ашық тақырып',
    en: '☀ Light theme',
  },
  'layout.themeDark': {
    ru: '🌙 Тёмная тема',
    kk: '🌙 Қараңғы тақырып',
    en: '🌙 Dark theme',
  },
  'dashboard.title': {
    ru: 'Панель управления',
    kk: 'Басқару тақтасы',
    en: 'Dashboard',
  },
  'dashboard.subtitle': {
    ru: 'Сводка по проектам, задачам и документообороту',
    kk: 'Жобалар, тапсырмалар және құжат айналымы бойынша жиынтық',
    en: 'Summary of projects, tasks and documents',
  },
  'dashboard.stats.projectsTotal': {
    ru: 'Всего проектов',
    kk: 'Барлық жобалар',
    en: 'Total projects',
  },
  'dashboard.stats.projectsActive': {
    ru: 'Активных',
    kk: 'Белсенді',
    en: 'Active',
  },
  'dashboard.stats.tasksOpen': {
    ru: 'Открытых задач',
    kk: 'Ашық тапсырмалар',
    en: 'Open tasks',
  },
  'dashboard.stats.tasksOverdue': {
    ru: 'Просроченных задач',
    kk: 'Мерзімі өткен тапсырмалар',
    en: 'Overdue tasks',
  },
  'dashboard.stats.tasksOverdueHint': {
    ru: 'Не завершены после срока',
    kk: 'Мерзімі өткен, бірақ аяқталмаған',
    en: 'Not completed after due date',
  },
  'dashboard.blocks.tasksByStatus': {
    ru: 'Задачи по статусам',
    kk: 'Күйі бойынша тапсырмалар',
    en: 'Tasks by status',
  },
  'dashboard.blocks.projectsByStatus': {
    ru: 'Проекты по статусам',
    kk: 'Күйі бойынша жобалар',
    en: 'Projects by status',
  },
  'dashboard.blocks.documentsTotal': {
    ru: 'Документы в системе',
    kk: 'Жүйедегі құжаттар',
    en: 'Documents in system',
  },
  'dashboard.blocks.testsTotal': {
    ru: 'Записей испытаний',
    kk: 'Сынақ жазбалары',
    en: 'Test records',
  },
  'dashboard.recent.title': {
    ru: 'Недавняя активность по задачам',
    kk: 'Тапсырмалар бойынша соңғы белсенділік',
    en: 'Recent task activity',
  },
  'dashboard.recent.subtitle': {
    ru: 'Последние обновлённые задачи по всем проектам',
    kk: 'Барлық жобалардағы соңғы жаңартылған тапсырмалар',
    en: 'Latest updated tasks across all projects',
  },
  'dashboard.recent.duePrefix': {
    ru: 'до',
    kk: 'дейін',
    en: 'due',
  },
  'dashboard.toProjects': {
    ru: 'Перейти к проектам',
    kk: 'Жобаларға өту',
    en: 'Go to projects',
  },
  'common.error.request': {
    ru: 'Ошибка запроса',
    kk: 'Сұрау қателігі',
    en: 'Request error',
  },
  'common.error.generic': {
    ru: 'Ошибка',
    kk: 'Қате',
    en: 'Error',
  },
  'common.error.load': {
    ru: 'Ошибка загрузки',
    kk: 'Жүктеу қатесі',
    en: 'Load error',
  },
  'common.loading': {
    ru: 'Загрузка…',
    kk: 'Жүктелуде…',
    en: 'Loading…',
  },
  'status.project.draft': {
    ru: 'Черновик',
    kk: 'Жоба',
    en: 'Draft',
  },
  'status.project.active': {
    ru: 'Активен',
    kk: 'Белсенді',
    en: 'Active',
  },
  'status.project.on_hold': {
    ru: 'Приостановлен',
    kk: 'Тоқтатылған',
    en: 'On hold',
  },
  'status.project.completed': {
    ru: 'Завершён',
    kk: 'Аяқталған',
    en: 'Completed',
  },
  'status.task.todo': {
    ru: 'К выполнению',
    kk: 'Орындауға',
    en: 'To do',
  },
  'status.task.in_progress': {
    ru: 'В работе',
    kk: 'Орындауда',
    en: 'In progress',
  },
  'status.task.review': {
    ru: 'На проверке',
    kk: 'Тексеруде',
    en: 'In review',
  },
  'status.task.done': {
    ru: 'Готово',
    kk: 'Дайын',
    en: 'Done',
  },
  'status.doc.draft': {
    ru: 'Черновик',
    kk: 'Жоба',
    en: 'Draft',
  },
  'status.doc.review': {
    ru: 'На согласовании',
    kk: 'Келісуде',
    en: 'In approval',
  },
  'status.doc.approved': {
    ru: 'Утверждён',
    kk: 'Бекітілген',
    en: 'Approved',
  },
  'projects.title': {
    ru: 'Проекты',
    kk: 'Жобалар',
    en: 'Projects',
  },
  'projects.subtitle': {
    ru: 'Строительные и инженерные проекты',
    kk: 'Құрылыс және инженерлік жобалар',
    en: 'Construction and engineering projects',
  },
  'projects.csv': {
    ru: 'Экспорт CSV',
    kk: 'CSV экспорттау',
    en: 'Export CSV',
  },
  'projects.new': {
    ru: 'Новый проект',
    kk: 'Жаңа жоба',
    en: 'New project',
  },
  'projects.search.placeholder': {
    ru: 'Поиск по коду, названию, заказчику… ( / для фокуса )',
    kk: 'Код, атау, тапсырыс беруші бойынша іздеу… ( / – фокус )',
    en: 'Search by code, name, customer… ( / to focus )',
  },
  'projects.filter.all': {
    ru: 'Все',
    kk: 'Барлығы',
    en: 'All',
  },
  'projects.table.code': {
    ru: 'Код',
    kk: 'Код',
    en: 'Code',
  },
  'projects.table.name': {
    ru: 'Название',
    kk: 'Атауы',
    en: 'Name',
  },
  'projects.table.customer': {
    ru: 'Заказчик',
    kk: 'Тапсырыс беруші',
    en: 'Customer',
  },
  'projects.table.status': {
    ru: 'Статус',
    kk: 'Күйі',
    en: 'Status',
  },
  'projects.table.favoriteAria': {
    ru: 'Избранное',
    kk: 'Таңдамалы',
    en: 'Favorite',
  },
  'projects.favorite.add': {
    ru: 'В избранное',
    kk: 'Таңдамалыға қосу',
    en: 'Add to favorites',
  },
  'projects.favorite.remove': {
    ru: 'Убрать из избранного',
    kk: 'Таңдамалыдан алып тастау',
    en: 'Remove from favorites',
  },
  'projects.empty.none': {
    ru: 'Нет проектов — создайте первый.',
    kk: 'Жобалар жоқ — біріншісін жасаңыз.',
    en: 'No projects — create the first one.',
  },
  'projects.empty.notFound': {
    ru: 'Ничего не найдено — измените фильтры.',
    kk: 'Ештеңе табылмады — сүзгілерді өзгертіңіз.',
    en: 'Nothing found — adjust filters.',
  },
  'projects.new.title': {
    ru: 'Новый проект',
    kk: 'Жаңа жоба',
    en: 'New project',
  },
  'projects.new.codeLabel': {
    ru: 'Код проекта *',
    kk: 'Жоба коды *',
    en: 'Project code *',
  },
  'projects.new.nameLabel': {
    ru: 'Название *',
    kk: 'Атауы *',
    en: 'Name *',
  },
  'projects.new.customerLabel': {
    ru: 'Заказчик',
    kk: 'Тапсырыс беруші',
    en: 'Customer',
  },
  'projects.new.addressLabel': {
    ru: 'Адрес объекта',
    kk: 'Нысан адресі',
    en: 'Site address',
  },
  'projects.new.cancel': {
    ru: 'Отмена',
    kk: 'Бас тарту',
    en: 'Cancel',
  },
  'projects.new.saveBusy': {
    ru: 'Сохранение…',
    kk: 'Сақталуда…',
    en: 'Saving…',
  },
  'projects.new.save': {
    ru: 'Создать',
    kk: 'Құру',
    en: 'Create',
  },
  'project.error.invalidId': {
    ru: 'Некорректный идентификатор',
    kk: 'Жарамсыз идентификатор',
    en: 'Invalid identifier',
  },
  'project.backToList': {
    ru: '← К проектам',
    kk: '← Жобаларға',
    en: '← Back to projects',
  },
  'project.backAll': {
    ru: '← Все проекты',
    kk: '← Барлық жобалар',
    en: '← All projects',
  },
  'project.copyCode': {
    ru: 'Копировать код',
    kk: 'Кодты көшіру',
    en: 'Copy code',
  },
  'project.copied': {
    ru: 'Скопировано',
    kk: 'Көшірілді',
    en: 'Copied',
  },
  'project.customer': {
    ru: 'Заказчик:',
    kk: 'Тапсырыс беруші:',
    en: 'Customer:',
  },
  'project.status.label': {
    ru: 'Статус',
    kk: 'Күйі',
    en: 'Status',
  },
  'project.manager.label': {
    ru: 'Руководитель',
    kk: 'Жетекші',
    en: 'Manager',
  },
  'project.manager.none': {
    ru: 'Не назначен',
    kk: 'Тағайындалмаған',
    en: 'Not assigned',
  },
  'project.contracts.title': {
    ru: 'Договоры',
    kk: 'Шарттар',
    en: 'Contracts',
  },
  'project.contracts.number': {
    ru: 'Номер',
    kk: 'Нөмірі',
    en: 'Number',
  },
  'project.contracts.date': {
    ru: 'Дата',
    kk: 'Күні',
    en: 'Date',
  },
  'project.contracts.amount': {
    ru: 'Сумма',
    kk: 'Сома',
    en: 'Amount',
  },
  'project.contracts.empty': {
    ru: 'Нет записей',
    kk: 'Жазбалар жоқ',
    en: 'No records',
  },
  'project.phases.title': {
    ru: 'Этапы',
    kk: 'Кезеңдер',
    en: 'Phases',
  },
  'project.phases.empty': {
    ru: 'Этапы не заведены',
    kk: 'Кезеңдер енгізілмеген',
    en: 'No phases defined',
  },
  'project.tasks.title': {
    ru: 'Задачи',
    kk: 'Тапсырмалар',
    en: 'Tasks',
  },
  'project.tasks.table': {
    ru: 'Таблица',
    kk: 'Кесте',
    en: 'Table',
  },
  'project.tasks.board': {
    ru: 'Канбан',
    kk: 'Канбан',
    en: 'Kanban',
  },
  'project.tasks.boardHint': {
    ru: 'В режиме канбана перетаскивайте карточки между колонками, чтобы менять статус.',
    kk: 'Канбан режимінде карточкаларды бағандар арасында сүйреп, күйін өзгертіңіз.',
    en: 'In board view drag cards between columns to change status.',
  },
  'project.tasks.col.title': {
    ru: 'Задача',
    kk: 'Тапсырма',
    en: 'Task',
  },
  'project.tasks.col.due': {
    ru: 'Срок',
    kk: 'Мерзімі',
    en: 'Due date',
  },
  'project.tasks.col.status': {
    ru: 'Статус',
    kk: 'Күйі',
    en: 'Status',
  },
  'project.tasks.new.label': {
    ru: 'Новая задача',
    kk: 'Жаңа тапсырма',
    en: 'New task',
  },
  'project.tasks.new.placeholder': {
    ru: 'Название',
    kk: 'Атауы',
    en: 'Title',
  },
  'project.tasks.phase': {
    ru: 'Этап',
    kk: 'Кезең',
    en: 'Phase',
  },
  'project.tasks.assignee': {
    ru: 'Исполнитель',
    kk: 'Орындаушы',
    en: 'Assignee',
  },
  'project.tasks.due': {
    ru: 'Срок',
    kk: 'Мерзімі',
    en: 'Due date',
  },
  'project.tasks.add': {
    ru: 'Добавить',
    kk: 'Қосу',
    en: 'Add',
  },
  'project.docs.title': {
    ru: 'Документы',
    kk: 'Құжаттар',
    en: 'Documents',
  },
  'project.docs.col.doc': {
    ru: 'Документ',
    kk: 'Құжат',
    en: 'Document',
  },
  'project.docs.col.type': {
    ru: 'Тип',
    kk: 'Түрі',
    en: 'Type',
  },
  'project.docs.col.version': {
    ru: 'Версия',
    kk: 'Нұсқа',
    en: 'Version',
  },
  'project.docs.col.status': {
    ru: 'Статус',
    kk: 'Күйі',
    en: 'Status',
  },
  'project.docs.file': {
    ru: 'Файл',
    kk: 'Файл',
    en: 'File',
  },
  'project.docs.titleLabel': {
    ru: 'Название',
    kk: 'Атауы',
    en: 'Title',
  },
  'project.docs.titlePlaceholder': {
    ru: 'По умолчанию — имя файла',
    kk: 'Әдепкі — файл атауы',
    en: 'Default — file name',
  },
  'project.docs.typeLabel': {
    ru: 'Тип',
    kk: 'Түрі',
    en: 'Type',
  },
  'project.docs.typePlaceholder': {
    ru: 'Отчёт, акт…',
    kk: 'Есеп, акт…',
    en: 'Report, act…',
  },
  'project.docs.upload': {
    ru: 'Загрузить',
    kk: 'Жүктеу',
    en: 'Upload',
  },
  'project.tests.title': {
    ru: 'Испытания и анализ',
    kk: 'Сынақтар және талдау',
    en: 'Tests and analysis',
  },
  'project.tests.protocolPrefix': {
    ru: 'Протокол:',
    kk: 'Хаттама:',
    en: 'Protocol:',
  },
  'project.tests.empty': {
    ru: 'Нет записей об испытаниях',
    kk: 'Сынақтар туралы жазбалар жоқ',
    en: 'No test records',
  },
  'project.tests.nameLabel': {
    ru: 'Наименование испытания *',
    kk: 'Сынақ атауы *',
    en: 'Test name *',
  },
  'project.tests.typeLabel': {
    ru: 'Тип',
    kk: 'Түрі',
    en: 'Type',
  },
  'project.tests.locationLabel': {
    ru: 'Место / участок',
    kk: 'Орын / учаске',
    en: 'Location / area',
  },
  'project.tests.dateLabel': {
    ru: 'Дата',
    kk: 'Күні',
    en: 'Date',
  },
  'project.tests.protocolLabel': {
    ru: 'Протокол (ссылка/номер)',
    kk: 'Хаттама (сілтеме/нөмірі)',
    en: 'Protocol (link/number)',
  },
  'project.tests.summaryLabel': {
    ru: 'Краткое заключение',
    kk: 'Қысқаша қорытынды',
    en: 'Short conclusion',
  },
  'project.tests.add': {
    ru: 'Добавить запись',
    kk: 'Жазба қосу',
    en: 'Add record',
  },
  'kanban.duePrefix': {
    ru: 'До',
    kk: 'Дейін',
    en: 'Due',
  },
}

type I18nCtx = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: keyof typeof messages) => string
}

const I18nContext = createContext<I18nCtx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('kompleks-lang') : null
    if (stored === 'ru' || stored === 'kk' || stored === 'en') return stored
    return 'ru'
  })

  function updateLang(next: Lang) {
    setLang(next)
    try {
      window.localStorage.setItem('kompleks-lang', next)
    } catch {
      // ignore
    }
  }

  function t(key: keyof typeof messages): string {
    const entry = messages[key]
    if (!entry) return key
    return entry[lang]
  }

  return <I18nContext.Provider value={{ lang, setLang: updateLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}

