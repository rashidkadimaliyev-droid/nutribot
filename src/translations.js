const langs = {
  en: {
    welcome_back: (name) =>
      `Welcome back, ${name}! 👋\n\n` +
      `📸 Send a food photo — I'll count calories & macros\n` +
      `📊 /today — what you've eaten today\n` +
      `💡 /tip — nutrition recommendation\n` +
      `⚙️ /profile — update your profile\n` +
      `❓ /help — all commands`,

    welcome_new: (name) =>
      `Hi, ${name}! 👋\n\nI'm NutriBot 🥗\n` +
      `Send me a photo of your food and I'll instantly calculate calories & macros.\n\n` +
      `Let's set up your profile so I can give you personal recommendations.\n\n` +
      `What's your gender?`,

    no_user: `Press /start to begin!`,
    no_meals_today: `📋 You haven't eaten anything today.\n\n📸 Send a food photo!`,
    today_header: `📊 *Today's food log:*\n\n`,
    today_separator: `\n─────────────────\n`,
    today_total: (cal, p, f, c) => `*Total:* ${cal} kcal\nP: ${p}g | F: ${f}g | C: ${c}g\n`,
    today_progress_header: `\n📈 *Daily goal progress:*\n`,
    today_calories: (bar) => `Calories: ${bar}\n`,
    today_protein:  (bar) => `Protein:  ${bar}\n`,
    today_fat:      (bar) => `Fat:      ${bar}\n`,
    today_carbs:    (bar) => `Carbs:    ${bar}\n`,

    tip_no_profile: `⚙️ Set up your profile first: /profile`,
    tip_thinking: `🤔 Thinking of a recommendation...`,
    tip_result: (tip) => `💡 *Recommendation:*\n\n${tip}`,
    tip_error: `Couldn't get a recommendation. Please try again later.`,
    tip_premium_only:
      `💡 *Nutrition tips are a Premium feature.*\n\n` +
      `🆓 Free plan includes 3 photo analyses/day.\n` +
      `👑 Premium unlocks unlimited analyses + tips + AI chat.\n\n` +
      `Upgrade for 100 ⭐ Stars/month:`,

    profile_ask_gender: `Let's update your profile. What's your gender?`,

    help:
      `🥗 *NutriBot — Commands:*\n\n` +
      `*🆓 Free*\n` +
      `📸 Send a photo — analyze calories & macros _(3/day)_\n` +
      `💬 Chat with AI nutritionist _(3 msgs/day)_\n` +
      `📊 /today — today's food diary\n` +
      `⚙️ /profile — set up your profile\n` +
      `⭐ /upgrade — get Premium or Pro\n\n` +
      `*👑 Premium (100 ⭐/mo)*\n` +
      `📸 Unlimited photo analyses\n` +
      `💬 Unlimited AI chat\n` +
      `💡 /tip — personalised nutrition tip\n` +
      `📅 /history — weekly & monthly stats\n` +
      `🍽 /mealplan — 7-day meal plan\n\n` +
      `*🚀 Pro (200 ⭐/mo)*\n` +
      `🛒 /shoplist — weekly shopping list\n` +
      `👨‍🍳 /recipe [dish] — full recipe with macros\n\n` +
      `❓ /help — this help message`,

    btn_male: `👨 Male`,
    btn_female: `👩 Female`,
    btn_goal_lose: `🔥 Lose weight`,
    btn_goal_gain: `💪 Gain muscle`,
    btn_goal_recomp: `🔄 Recomposition`,
    btn_goal_maintain: `⚖️ Maintain weight`,

    ask_activity: `🏃 What's your activity level?`,
    btn_activity_sedentary: `🪑 Sedentary (desk job)`,
    btn_activity_light:     `🚶 Lightly active (1-3x/week)`,
    btn_activity_moderate:  `🏋️ Moderately active (3-5x/week)`,
    btn_activity_active:    `⚡ Very active (6-7x/week)`,

    ask_age:    `📅 How old are you? (enter a number)`,
    ask_weight: `⚖️ What's your weight in kg? (e.g. 75)`,
    ask_height: `📏 What's your height in cm? (e.g. 175)`,
    ask_goal:   `🎯 What's your goal?`,

    err_age:    `❌ Please enter your age as a number (10–100)`,
    err_weight: `❌ Please enter your weight in kg (30–300)`,
    err_height: `❌ Please enter your height in cm (100–250)`,

    profile_done: (goalText, activityText, norms) =>
      `✅ Profile set up!\n\n` +
      `🎯 Goal: ${goalText}\n` +
      `🏃 Activity: ${activityText}\n` +
      `📊 Your daily targets:\n` +
      `├ Calories: ${norms.calories} kcal\n` +
      `├ Protein: ${norms.protein}g\n` +
      `├ Fat: ${norms.fat}g\n` +
      `└ Carbs: ${norms.carbs}g\n\n` +
      `📸 Now send a food photo — I'll calculate the macros!`,

    goal_lose: `🔥 Lose weight`,
    goal_gain: `💪 Gain muscle`,
    goal_recomp: `🔄 Recomposition`,
    goal_maintain: `⚖️ Maintain weight`,

    limit_reached:
      `⚠️ You've used all 3 free analyses for today.\n\n` +
      `⭐ Want unlimited? Get a premium subscription!\n` +
      `Free analyses reset tomorrow.`,

    analyzing: `🔍 Analyzing photo...`,
    analysis_failed: `❌ Couldn't analyze the photo. Please try another one.`,
    analysis_error:  `❌ An error occurred. Please try again.`,
    analysis_header: `✅ *Analysis done!*\n\n`,
    analysis_item: (name, weight, cal, p, f, c) =>
      `🍽 *${name}* (~${weight}g)\n` +
      `├ Calories: ${cal} kcal\n` +
      `├ Protein: ${p}g\n` +
      `├ Fat: ${f}g\n` +
      `└ Carbs: ${c}g\n\n`,
    analysis_total: (cal, p, f, c) =>
      `📊 *Total:* ${cal} kcal (P:${p} F:${f} C:${c})\n\n`,
    analysis_daily: (cal, norm, bar) =>
      `─────────────────\n📈 *Today so far:* ${cal}/${norm} kcal\n${bar}\n`,
    analyses_remaining: (n) => `\n📸 Analyses left: ${n}/3`,

    chat_limit_reached:
      `💬 You've used all 3 free chat messages for today.\n\n` +
      `⭐ Upgrade to Premium for unlimited AI nutrition chat!`,

    upgrade_menu:
      `⭐ *NutriBot Premium*\n\n` +
      `🆓 *Free plan:* 3 photo analyses per day\n` +
      `👑 *Premium plan:* unlimited analyses + priority support\n\n` +
      `💫 *Price: 100 Telegram Stars / month*\n\n` +
      `Tap the button below to pay with Telegram Stars:`,
    upgrade_already_premium: `👑 You already have Premium! Enjoy unlimited analyses.`,
    upgrade_success:
      `🎉 *Payment successful!*\n\n👑 You now have *NutriBot Premium*.\nEnjoy unlimited food analyses!`,
    upgrade_invoice_title: `NutriBot Premium`,
    upgrade_invoice_description: `Unlimited food photo analyses. No daily limits.`,

    history_no_data: `📅 No food log entries found for the past 7 days.\n\n📸 Send a food photo to start tracking!`,
    history_week_header: `📅 *Last 7 days:*\n\n`,
    history_month_header: `\n📆 *Last 30 days average:*\n`,
    history_day: (date, cal, p, f, c) => `${date}: *${Math.round(cal)} kcal* (P:${Math.round(p)} F:${Math.round(f)} C:${Math.round(c)})\n`,
    history_avg: (cal, p, f, c) => `Avg/day: *${Math.round(cal)} kcal* | P:${Math.round(p)}g F:${Math.round(f)}g C:${Math.round(c)}g`,
    history_premium_only: `📅 *Weekly & monthly history is a Premium feature.*\n\nUpgrade to see your progress over time:`,

    mealplan_generating: `🍽 Generating your 7-day meal plan...`,
    mealplan_header: `🍽 *Your 7-Day Meal Plan:*\n\n`,
    mealplan_no_profile: `⚙️ Set up your profile first so I can personalise the plan: /profile`,
    mealplan_premium_only: `🍽 *Meal plans are a Premium feature.*\n\nUpgrade to get a personalised 7-day plan:`,
    mealplan_error: `❌ Couldn't generate a meal plan. Please try again.`,

    shoplist_generating: `🛒 Generating your shopping list...`,
    shoplist_header: `🛒 *Your Weekly Shopping List:*\n\n`,
    shoplist_no_profile: `⚙️ Set up your profile first: /profile`,
    shoplist_pro_only: `🛒 *Shopping lists are a Pro feature.*\n\nUpgrade to Pro for shopping lists and advanced recipes:`,
    shoplist_error: `❌ Couldn't generate a shopping list. Please try again.`,

    recipe_usage: `👨‍🍳 Usage: /recipe <dish name>\nExample: /recipe chicken stir-fry`,
    recipe_generating: (name) => `👨‍🍳 Finding recipe for *${name}*...`,
    recipe_header: (name) => `👨‍🍳 *Recipe: ${name}*\n\n`,
    recipe_pro_only: `👨‍🍳 *Recipes are a Pro feature.*\n\nUpgrade to Pro for full recipes with macros:`,
    recipe_error: `❌ Couldn't generate the recipe. Please try again.`,

    weekly_report_header: `📊 *Your Weekly Report*\n\n`,

    lang_select: `🌐 Choose your language:`,
    lang_changed: `✅ Language set to English!`,
  },

  ru: {
    welcome_back: (name) =>
      `С возвращением, ${name}! 👋\n\n` +
      `📸 Отправь фото еды — посчитаю калории и БЖУ\n` +
      `📊 /today — что съел сегодня\n` +
      `💡 /tip — рекомендация по питанию\n` +
      `⚙️ /profile — изменить параметры\n` +
      `❓ /help — все команды`,

    welcome_new: (name) =>
      `Привет, ${name}! 👋\n\nЯ — NutriBot 🥗\n` +
      `Отправь фото еды и я мгновенно посчитаю калории и БЖУ.\n\n` +
      `Давай настроим твой профиль для персональных рекомендаций.\n\n` +
      `Какой у тебя пол?`,

    no_user: `Нажми /start чтобы начать!`,
    no_meals_today: `📋 Сегодня ты ещё ничего не ел.\n\n📸 Отправь фото еды!`,
    today_header: `📊 *Съедено сегодня:*\n\n`,
    today_separator: `\n─────────────────\n`,
    today_total: (cal, p, f, c) => `*Итого:* ${cal} ккал\nБ: ${p}г | Ж: ${f}г | У: ${c}г\n`,
    today_progress_header: `\n📈 *Прогресс к норме:*\n`,
    today_calories: (bar) => `Калории: ${bar}\n`,
    today_protein:  (bar) => `Белок:   ${bar}\n`,
    today_fat:      (bar) => `Жиры:    ${bar}\n`,
    today_carbs:    (bar) => `Углеводы:${bar}\n`,

    tip_no_profile: `⚙️ Сначала настрой профиль: /profile`,
    tip_thinking: `🤔 Думаю над рекомендацией...`,
    tip_result: (tip) => `💡 *Рекомендация:*\n\n${tip}`,
    tip_error: `Не удалось получить рекомендацию. Попробуй позже.`,
    tip_premium_only:
      `💡 *Советы по питанию — функция Premium.*\n\n` +
      `🆓 Бесплатно: 3 анализа фото в день.\n` +
      `👑 Premium: безлимит + советы + AI-чат.\n\n` +
      `Оформить за 100 ⭐ Stars/мес:`,

    profile_ask_gender: `Давай обновим профиль. Какой у тебя пол?`,

    help:
      `🥗 *NutriBot — Команды:*\n\n` +
      `*🆓 Бесплатно*\n` +
      `📸 Фото еды — анализ КБЖУ _(3/день)_\n` +
      `💬 Чат с AI-нутрициологом _(3 сообщения/день)_\n` +
      `📊 /today — дневник за сегодня\n` +
      `⚙️ /profile — настроить профиль\n` +
      `⭐ /upgrade — Premium или Pro\n\n` +
      `*👑 Premium (100 ⭐/мес)*\n` +
      `📸 Безлимитные анализы фото\n` +
      `💬 Безлимитный AI-чат\n` +
      `💡 /tip — персональный совет\n` +
      `📅 /history — статистика за неделю/месяц\n` +
      `🍽 /mealplan — план питания на 7 дней\n\n` +
      `*🚀 Pro (200 ⭐/мес)*\n` +
      `🛒 /shoplist — список покупок на неделю\n` +
      `👨‍🍳 /recipe [блюдо] — рецепт с КБЖУ\n\n` +
      `❓ /help — эта справка`,

    btn_male: `👨 Мужской`,
    btn_female: `👩 Женский`,
    btn_goal_lose: `🔥 Похудение`,
    btn_goal_gain: `💪 Набор массы`,
    btn_goal_recomp: `🔄 Рекомпозиция`,
    btn_goal_maintain: `⚖️ Поддержание`,

    ask_activity: `🏃 Какой у тебя уровень активности?`,
    btn_activity_sedentary: `🪑 Сидячий образ жизни`,
    btn_activity_light:     `🚶 Слабоактивный (1-3 раза/нед)`,
    btn_activity_moderate:  `🏋️ Умеренно активный (3-5 раз/нед)`,
    btn_activity_active:    `⚡ Очень активный (6-7 раз/нед)`,

    ask_age:    `📅 Сколько тебе лет? (напиши число)`,
    ask_weight: `⚖️ Какой у тебя вес в кг? (например: 75)`,
    ask_height: `📏 Какой у тебя рост в см? (например: 175)`,
    ask_goal:   `🎯 Какая у тебя цель?`,

    err_age:    `❌ Введи возраст числом (10–100)`,
    err_weight: `❌ Введи вес числом в кг (30–300)`,
    err_height: `❌ Введи рост числом в см (100–250)`,

    profile_done: (goalText, activityText, norms) =>
      `✅ Профиль настроен!\n\n` +
      `🎯 Цель: ${goalText}\n` +
      `🏃 Активность: ${activityText}\n` +
      `📊 Твоя дневная норма:\n` +
      `├ Калории: ${norms.calories} ккал\n` +
      `├ Белок: ${norms.protein}г\n` +
      `├ Жиры: ${norms.fat}г\n` +
      `└ Углеводы: ${norms.carbs}г\n\n` +
      `📸 Отправь фото еды — посчитаю КБЖУ!`,

    goal_lose: `🔥 Похудение`,
    goal_gain: `💪 Набор массы`,
    goal_recomp: `🔄 Рекомпозиция`,
    goal_maintain: `⚖️ Поддержание`,

    limit_reached:
      `⚠️ Ты использовал все 3 бесплатных анализа на сегодня.\n\n` +
      `⭐ Хочешь безлимит? Оформи Premium!\n` +
      `Завтра бесплатные анализы обновятся.`,

    analyzing: `🔍 Анализирую фото...`,
    analysis_failed: `❌ Не удалось проанализировать фото. Попробуй другое.`,
    analysis_error:  `❌ Произошла ошибка. Попробуй ещё раз.`,
    analysis_header: `✅ *Анализ готов!*\n\n`,
    analysis_item: (name, weight, cal, p, f, c) =>
      `🍽 *${name}* (~${weight}г)\n` +
      `├ Калории: ${cal} ккал\n` +
      `├ Белок: ${p}г\n` +
      `├ Жиры: ${f}г\n` +
      `└ Углеводы: ${c}г\n\n`,
    analysis_total: (cal, p, f, c) =>
      `📊 *Итого:* ${cal} ккал (Б:${p} Ж:${f} У:${c})\n\n`,
    analysis_daily: (cal, norm, bar) =>
      `─────────────────\n📈 *За сегодня:* ${cal}/${norm} ккал\n${bar}\n`,
    analyses_remaining: (n) => `\n📸 Осталось анализов: ${n}/3`,

    chat_limit_reached:
      `💬 Ты использовал все 3 бесплатных сообщения на сегодня.\n\n` +
      `⭐ Оформи Premium для безлимитного AI-чата!`,

    upgrade_menu:
      `⭐ *NutriBot Premium*\n\n` +
      `🆓 *Бесплатно:* 3 анализа фото в день\n` +
      `👑 *Premium:* безлимитные анализы + поддержка\n\n` +
      `💫 *Цена: 100 Telegram Stars / месяц*\n\n` +
      `Нажми кнопку ниже чтобы оплатить Stars:`,
    upgrade_already_premium: `👑 У тебя уже Premium! Наслаждайся безлимитными анализами.`,
    upgrade_success:
      `🎉 *Оплата прошла!*\n\n👑 Теперь у тебя *NutriBot Premium*.\nБезлимитные анализы еды!`,
    upgrade_invoice_title: `NutriBot Premium`,
    upgrade_invoice_description: `Безлимитные анализы фото еды. Без дневных ограничений.`,

    history_no_data: `📅 Нет записей за последние 7 дней.\n\n📸 Отправь фото еды чтобы начать отслеживать!`,
    history_week_header: `📅 *Последние 7 дней:*\n\n`,
    history_month_header: `\n📆 *Среднее за 30 дней:*\n`,
    history_day: (date, cal, p, f, c) => `${date}: *${Math.round(cal)} ккал* (Б:${Math.round(p)} Ж:${Math.round(f)} У:${Math.round(c)})\n`,
    history_avg: (cal, p, f, c) => `Среднее/день: *${Math.round(cal)} ккал* | Б:${Math.round(p)}г Ж:${Math.round(f)}г У:${Math.round(c)}г`,
    history_premium_only: `📅 *История питания — функция Premium.*\n\nОформи Premium чтобы видеть прогресс:`,

    mealplan_generating: `🍽 Составляю план питания на 7 дней...`,
    mealplan_header: `🍽 *Твой план питания на 7 дней:*\n\n`,
    mealplan_no_profile: `⚙️ Сначала настрой профиль: /profile`,
    mealplan_premium_only: `🍽 *Планы питания — функция Premium.*\n\nОформи Premium для персонального плана:`,
    mealplan_error: `❌ Не удалось составить план. Попробуй позже.`,

    shoplist_generating: `🛒 Составляю список покупок...`,
    shoplist_header: `🛒 *Список покупок на неделю:*\n\n`,
    shoplist_no_profile: `⚙️ Сначала настрой профиль: /profile`,
    shoplist_pro_only: `🛒 *Список покупок — функция Pro.*\n\nОформи Pro для списков покупок и рецептов:`,
    shoplist_error: `❌ Не удалось составить список. Попробуй позже.`,

    recipe_usage: `👨‍🍳 Использование: /recipe <название блюда>\nПример: /recipe куриная грудка с рисом`,
    recipe_generating: (name) => `👨‍🍳 Ищу рецепт *${name}*...`,
    recipe_header: (name) => `👨‍🍳 *Рецепт: ${name}*\n\n`,
    recipe_pro_only: `👨‍🍳 *Рецепты — функция Pro.*\n\nОформи Pro для полных рецептов с КБЖУ:`,
    recipe_error: `❌ Не удалось найти рецепт. Попробуй позже.`,

    weekly_report_header: `📊 *Твой еженедельный отчёт*\n\n`,

    lang_select: `🌐 Выберите язык:`,
    lang_changed: `✅ Язык изменён на русский!`,
  },

  tr: {
    welcome_back: (name) =>
      `Tekrar hoş geldin, ${name}! 👋\n\n` +
      `📸 Yemek fotoğrafı gönder — kalori ve makroları hesaplayayım\n` +
      `📊 /today — bugün ne yedin\n` +
      `💡 /tip — beslenme tavsiyesi\n` +
      `⚙️ /profile — profili güncelle\n` +
      `❓ /help — tüm komutlar`,

    welcome_new: (name) =>
      `Merhaba, ${name}! 👋\n\nBen NutriBot 🥗\n` +
      `Yemek fotoğrafı gönder, kalori ve makroları anında hesaplayayım.\n\n` +
      `Kişisel öneriler için profilini ayarlayalım.\n\n` +
      `Cinsiyetin nedir?`,

    no_user: `Başlamak için /start yaz!`,
    no_meals_today: `📋 Bugün henüz bir şey yemedin.\n\n📸 Yemek fotoğrafı gönder!`,
    today_header: `📊 *Bugünkü yemek günlüğü:*\n\n`,
    today_separator: `\n─────────────────\n`,
    today_total: (cal, p, f, c) => `*Toplam:* ${cal} kcal\nP: ${p}g | Y: ${f}g | K: ${c}g\n`,
    today_progress_header: `\n📈 *Günlük hedef ilerlemesi:*\n`,
    today_calories: (bar) => `Kalori:  ${bar}\n`,
    today_protein:  (bar) => `Protein: ${bar}\n`,
    today_fat:      (bar) => `Yağ:     ${bar}\n`,
    today_carbs:    (bar) => `Karb:    ${bar}\n`,

    tip_no_profile: `⚙️ Önce profilini ayarla: /profile`,
    tip_thinking: `🤔 Tavsiye hazırlanıyor...`,
    tip_result: (tip) => `💡 *Tavsiye:*\n\n${tip}`,
    tip_error: `Tavsiye alınamadı. Lütfen tekrar dene.`,
    tip_premium_only:
      `💡 *Beslenme tavsiyeleri Premium özelliğidir.*\n\n` +
      `🆓 Ücretsiz: günde 3 fotoğraf analizi.\n` +
      `👑 Premium: sınırsız analiz + tavsiye + AI sohbet.\n\n` +
      `Ayda 100 ⭐ Stars ile yükselt:`,

    profile_ask_gender: `Profili güncelleyelim. Cinsiyetin nedir?`,

    help:
      `🥗 *NutriBot — Komutlar:*\n\n` +
      `*🆓 Ücretsiz*\n` +
      `📸 Fotoğraf gönder — kalori & makro analizi _(3/gün)_\n` +
      `💬 AI diyetisyenle sohbet _(3 mesaj/gün)_\n` +
      `📊 /today — bugünkü yemek günlüğü\n` +
      `⚙️ /profile — profil ayarları\n` +
      `⭐ /upgrade — Premium veya Pro\n\n` +
      `*👑 Premium (ayda 100 ⭐)*\n` +
      `📸 Sınırsız fotoğraf analizi\n` +
      `💬 Sınırsız AI sohbet\n` +
      `💡 /tip — kişisel beslenme tavsiyesi\n` +
      `📅 /history — haftalık & aylık istatistik\n` +
      `🍽 /mealplan — 7 günlük beslenme planı\n\n` +
      `*🚀 Pro (ayda 200 ⭐)*\n` +
      `🛒 /shoplist — haftalık alışveriş listesi\n` +
      `👨‍🍳 /recipe [yemek] — makrolu tam tarif\n\n` +
      `❓ /help — bu yardım mesajı`,

    btn_male: `👨 Erkek`,
    btn_female: `👩 Kadın`,
    btn_goal_lose: `🔥 Kilo ver`,
    btn_goal_gain: `💪 Kas kazan`,
    btn_goal_recomp: `🔄 Rekomposisyon`,
    btn_goal_maintain: `⚖️ Koru`,

    ask_activity: `🏃 Aktivite seviyeni seç:`,
    btn_activity_sedentary: `🪑 Hareketsiz (masa başı)`,
    btn_activity_light:     `🚶 Az aktif (haftada 1-3)`,
    btn_activity_moderate:  `🏋️ Orta aktif (haftada 3-5)`,
    btn_activity_active:    `⚡ Çok aktif (haftada 6-7)`,

    ask_age:    `📅 Kaç yaşındasın? (sayı yaz)`,
    ask_weight: `⚖️ Kilonu yaz (örn: 75)`,
    ask_height: `📏 Boyunu yaz cm olarak (örn: 175)`,
    ask_goal:   `🎯 Hedefin nedir?`,

    err_age:    `❌ Yaşı sayı olarak gir (10–100)`,
    err_weight: `❌ Kiloyu kg olarak gir (30–300)`,
    err_height: `❌ Boyu cm olarak gir (100–250)`,

    profile_done: (goalText, activityText, norms) =>
      `✅ Profil ayarlandı!\n\n` +
      `🎯 Hedef: ${goalText}\n` +
      `🏃 Aktivite: ${activityText}\n` +
      `📊 Günlük hedefler:\n` +
      `├ Kalori: ${norms.calories} kcal\n` +
      `├ Protein: ${norms.protein}g\n` +
      `├ Yağ: ${norms.fat}g\n` +
      `└ Karbonhidrat: ${norms.carbs}g\n\n` +
      `📸 Yemek fotoğrafı gönder — makroları hesaplayayım!`,

    goal_lose: `🔥 Kilo ver`,
    goal_gain: `💪 Kas kazan`,
    goal_recomp: `🔄 Rekomposisyon`,
    goal_maintain: `⚖️ Koru`,

    limit_reached:
      `⚠️ Bugünkü 3 ücretsiz analizini kullandın.\n\n` +
      `⭐ Sınırsız analiz için Premium al!\n` +
      `Ücretsiz analizler yarın sıfırlanır.`,

    analyzing: `🔍 Fotoğraf analiz ediliyor...`,
    analysis_failed: `❌ Fotoğraf analiz edilemedi. Başka bir fotoğraf dene.`,
    analysis_error:  `❌ Bir hata oluştu. Tekrar dene.`,
    analysis_header: `✅ *Analiz tamamlandı!*\n\n`,
    analysis_item: (name, weight, cal, p, f, c) =>
      `🍽 *${name}* (~${weight}g)\n` +
      `├ Kalori: ${cal} kcal\n` +
      `├ Protein: ${p}g\n` +
      `├ Yağ: ${f}g\n` +
      `└ Karbonhidrat: ${c}g\n\n`,
    analysis_total: (cal, p, f, c) =>
      `📊 *Toplam:* ${cal} kcal (P:${p} Y:${f} K:${c})\n\n`,
    analysis_daily: (cal, norm, bar) =>
      `─────────────────\n📈 *Bugün toplam:* ${cal}/${norm} kcal\n${bar}\n`,
    analyses_remaining: (n) => `\n📸 Kalan analiz: ${n}/3`,

    chat_limit_reached:
      `💬 Bugünkü 3 ücretsiz mesajını kullandın.\n\n` +
      `⭐ Sınırsız AI sohbet için Premium al!`,

    upgrade_menu:
      `⭐ *NutriBot Premium*\n\n` +
      `🆓 *Ücretsiz:* günde 3 fotoğraf analizi\n` +
      `👑 *Premium:* sınırsız analiz + destek\n\n` +
      `💫 *Fiyat: ayda 100 Telegram Stars*\n\n` +
      `Telegram Stars ile ödemek için butona bas:`,
    upgrade_already_premium: `👑 Zaten Premium'sun! Sınırsız analizin var.`,
    upgrade_success:
      `🎉 *Ödeme başarılı!*\n\n👑 Artık *NutriBot Premium* üyesisin.\nSınırsız yemek analizi!`,
    upgrade_invoice_title: `NutriBot Premium`,
    upgrade_invoice_description: `Sınırsız yemek fotoğrafı analizi. Günlük limit yok.`,

    history_no_data: `📅 Son 7 günde kayıt bulunamadı.\n\n📸 Takip etmeye başlamak için yemek fotoğrafı gönder!`,
    history_week_header: `📅 *Son 7 gün:*\n\n`,
    history_month_header: `\n📆 *Son 30 gün ortalaması:*\n`,
    history_day: (date, cal, p, f, c) => `${date}: *${Math.round(cal)} kcal* (P:${Math.round(p)} Y:${Math.round(f)} K:${Math.round(c)})\n`,
    history_avg: (cal, p, f, c) => `Günlük ort: *${Math.round(cal)} kcal* | P:${Math.round(p)}g Y:${Math.round(f)}g K:${Math.round(c)}g`,
    history_premium_only: `📅 *Geçmiş istatistikler Premium özelliğidir.*\n\nİlerlemeyi görmek için Premium al:`,

    mealplan_generating: `🍽 7 günlük beslenme planı hazırlanıyor...`,
    mealplan_header: `🍽 *7 Günlük Beslenme Planın:*\n\n`,
    mealplan_no_profile: `⚙️ Önce profilini ayarla: /profile`,
    mealplan_premium_only: `🍽 *Beslenme planları Premium özelliğidir.*\n\nKişisel plan için Premium al:`,
    mealplan_error: `❌ Plan oluşturulamadı. Tekrar dene.`,

    shoplist_generating: `🛒 Alışveriş listesi hazırlanıyor...`,
    shoplist_header: `🛒 *Haftalık Alışveriş Listesi:*\n\n`,
    shoplist_no_profile: `⚙️ Önce profilini ayarla: /profile`,
    shoplist_pro_only: `🛒 *Alışveriş listesi Pro özelliğidir.*\n\nListeler ve tarifler için Pro al:`,
    shoplist_error: `❌ Liste oluşturulamadı. Tekrar dene.`,

    recipe_usage: `👨‍🍳 Kullanım: /recipe <yemek adı>\nÖrnek: /recipe tavuk sote`,
    recipe_generating: (name) => `👨‍🍳 *${name}* tarifi aranıyor...`,
    recipe_header: (name) => `👨‍🍳 *Tarif: ${name}*\n\n`,
    recipe_pro_only: `👨‍🍳 *Tarifler Pro özelliğidir.*\n\nMakrolu tarifler için Pro al:`,
    recipe_error: `❌ Tarif bulunamadı. Tekrar dene.`,

    weekly_report_header: `📊 *Haftalık Raporun*\n\n`,

    lang_select: `🌐 Dil seçin:`,
    lang_changed: `✅ Dil Türkçe olarak ayarlandı!`,
  },

  az: {
    welcome_back: (name) =>
      `Xoş gəldin, ${name}! 👋\n\n` +
      `📸 Yemək şəkli göndər — kalori və makroları hesablayım\n` +
      `📊 /today — bu gün nə yemisən\n` +
      `💡 /tip — qidalanma məsləhəti\n` +
      `⚙️ /profile — profili yenilə\n` +
      `❓ /help — bütün əmrlər`,

    welcome_new: (name) =>
      `Salam, ${name}! 👋\n\nMən NutriBot 🥗\n` +
      `Yemək şəkli göndər, kalori və makroları dərhal hesablayım.\n\n` +
      `Fərdi tövsiyələr üçün profilini quracağıq.\n\n` +
      `Cinsiyyətin nədir?`,

    no_user: `Başlamaq üçün /start yaz!`,
    no_meals_today: `📋 Bu gün hələ heç nə yeməmisən.\n\n📸 Yemək şəkli göndər!`,
    today_header: `📊 *Bu günkü yemək gündəliyi:*\n\n`,
    today_separator: `\n─────────────────\n`,
    today_total: (cal, p, f, c) => `*Cəmi:* ${cal} kkal\nZ: ${p}q | Y: ${f}q | K: ${c}q\n`,
    today_progress_header: `\n📈 *Gündəlik hədəf irəliləyişi:*\n`,
    today_calories: (bar) => `Kalori:  ${bar}\n`,
    today_protein:  (bar) => `Zülal:   ${bar}\n`,
    today_fat:      (bar) => `Yağ:     ${bar}\n`,
    today_carbs:    (bar) => `Karb:    ${bar}\n`,

    tip_no_profile: `⚙️ Əvvəlcə profili qur: /profile`,
    tip_thinking: `🤔 Məsləhət hazırlanır...`,
    tip_result: (tip) => `💡 *Məsləhət:*\n\n${tip}`,
    tip_error: `Məsləhət alınmadı. Yenidən cəhd et.`,
    tip_premium_only:
      `💡 *Qidalanma məsləhətləri Premium xüsusiyyətidir.*\n\n` +
      `🆓 Pulsuz: gündə 3 foto analizi.\n` +
      `👑 Premium: limitsiz analiz + məsləhət + AI söhbət.\n\n` +
      `Ayda 100 ⭐ Stars ilə yüksəlt:`,

    profile_ask_gender: `Profili yeniləyək. Cinsiyyətin nədir?`,

    help:
      `🥗 *NutriBot — Əmrlər:*\n\n` +
      `*🆓 Pulsuz*\n` +
      `📸 Şəkil göndər — kalori & makro analizi _(3/gün)_\n` +
      `💬 AI diyetoloqla söhbət _(3 mesaj/gün)_\n` +
      `📊 /today — bu günkü yemək gündəliyi\n` +
      `⚙️ /profile — profil ayarları\n` +
      `⭐ /upgrade — Premium və ya Pro\n\n` +
      `*👑 Premium (ayda 100 ⭐)*\n` +
      `📸 Limitsiz foto analizi\n` +
      `💬 Limitsiz AI söhbət\n` +
      `💡 /tip — fərdi qidalanma məsləhəti\n` +
      `📅 /history — həftəlik & aylıq statistika\n` +
      `🍽 /mealplan — 7 günlük qidalanma planı\n\n` +
      `*🚀 Pro (ayda 200 ⭐)*\n` +
      `🛒 /shoplist — həftəlik alış-veriş siyahısı\n` +
      `👨‍🍳 /recipe [yemək] — KBJU ilə tam resept\n\n` +
      `❓ /help — bu yardım mesajı`,

    btn_male: `👨 Kişi`,
    btn_female: `👩 Qadın`,
    btn_goal_lose: `🔥 Arıqlamaq`,
    btn_goal_gain: `💪 Kütlə qazanmaq`,
    btn_goal_recomp: `🔄 Rekomposisiya`,
    btn_goal_maintain: `⚖️ Saxlamaq`,

    ask_activity: `🏃 Aktivlik səviyyəni seç:`,
    btn_activity_sedentary: `🪑 Oturaq həyat tərzi`,
    btn_activity_light:     `🚶 Az aktiv (həftədə 1-3)`,
    btn_activity_moderate:  `🏋️ Orta aktiv (həftədə 3-5)`,
    btn_activity_active:    `⚡ Çox aktiv (həftədə 6-7)`,

    ask_age:    `📅 Neçə yaşın var? (rəqəm yaz)`,
    ask_weight: `⚖️ Çəkini yaz kq ilə (məs: 75)`,
    ask_height: `📏 Boyunu yaz sm ilə (məs: 175)`,
    ask_goal:   `🎯 Hədəfin nədir?`,

    err_age:    `❌ Yaşı rəqəmlə daxil et (10–100)`,
    err_weight: `❌ Çəkini kq ilə daxil et (30–300)`,
    err_height: `❌ Boyu sm ilə daxil et (100–250)`,

    profile_done: (goalText, activityText, norms) =>
      `✅ Profil quruldu!\n\n` +
      `🎯 Hədəf: ${goalText}\n` +
      `🏃 Aktivlik: ${activityText}\n` +
      `📊 Gündəlik normalar:\n` +
      `├ Kalori: ${norms.calories} kkal\n` +
      `├ Zülal: ${norms.protein}q\n` +
      `├ Yağ: ${norms.fat}q\n` +
      `└ Karbohidrat: ${norms.carbs}q\n\n` +
      `📸 Yemək şəkli göndər — KBJU-ni hesablayım!`,

    goal_lose: `🔥 Arıqlamaq`,
    goal_gain: `💪 Kütlə qazanmaq`,
    goal_recomp: `🔄 Rekomposisiya`,
    goal_maintain: `⚖️ Saxlamaq`,

    limit_reached:
      `⚠️ Bu günkü 3 pulsuz analizini işlətdin.\n\n` +
      `⭐ Limitsiz analiz üçün Premium al!\n` +
      `Pulsuz analizlər sabah yenilənir.`,

    analyzing: `🔍 Şəkil analiz edilir...`,
    analysis_failed: `❌ Şəkil analiz edilmədi. Başqa şəkil cəhd et.`,
    analysis_error:  `❌ Xəta baş verdi. Yenidən cəhd et.`,
    analysis_header: `✅ *Analiz hazırdır!*\n\n`,
    analysis_item: (name, weight, cal, p, f, c) =>
      `🍽 *${name}* (~${weight}q)\n` +
      `├ Kalori: ${cal} kkal\n` +
      `├ Zülal: ${p}q\n` +
      `├ Yağ: ${f}q\n` +
      `└ Karbohidrat: ${c}q\n\n`,
    analysis_total: (cal, p, f, c) =>
      `📊 *Cəmi:* ${cal} kkal (Z:${p} Y:${f} K:${c})\n\n`,
    analysis_daily: (cal, norm, bar) =>
      `─────────────────\n📈 *Bu gün cəmi:* ${cal}/${norm} kkal\n${bar}\n`,
    analyses_remaining: (n) => `\n📸 Qalan analiz: ${n}/3`,

    chat_limit_reached:
      `💬 Bu günkü 3 pulsuz mesajını işlətdin.\n\n` +
      `⭐ Limitsiz AI söhbəti üçün Premium al!`,

    upgrade_menu:
      `⭐ *NutriBot Premium*\n\n` +
      `🆓 *Pulsuz:* gündə 3 foto analizi\n` +
      `👑 *Premium:* limitsiz analiz + dəstək\n\n` +
      `💫 *Qiymət: ayda 100 Telegram Stars*\n\n` +
      `Telegram Stars ilə ödəmək üçün düyməyə bas:`,
    upgrade_already_premium: `👑 Artıq Premium üzvüsən! Limitsiz analizin var.`,
    upgrade_success:
      `🎉 *Ödəniş uğurlu oldu!*\n\n👑 İndi *NutriBot Premium* üzvüsən.\nLimitsiz yemək analizi!`,
    upgrade_invoice_title: `NutriBot Premium`,
    upgrade_invoice_description: `Limitsiz yemək şəkli analizi. Gündəlik limit yoxdur.`,

    history_no_data: `📅 Son 7 gündə qeyd tapılmadı.\n\n📸 İzləməyə başlamaq üçün yemək şəkli göndər!`,
    history_week_header: `📅 *Son 7 gün:*\n\n`,
    history_month_header: `\n📆 *Son 30 günün ortalama:*\n`,
    history_day: (date, cal, p, f, c) => `${date}: *${Math.round(cal)} kkal* (Z:${Math.round(p)} Y:${Math.round(f)} K:${Math.round(c)})\n`,
    history_avg: (cal, p, f, c) => `Gündəlik ort: *${Math.round(cal)} kkal* | Z:${Math.round(p)}q Y:${Math.round(f)}q K:${Math.round(c)}q`,
    history_premium_only: `📅 *Keçmiş statistikalar Premium xüsusiyyətidir.*\n\nİrəliləyişi görmək üçün Premium al:`,

    mealplan_generating: `🍽 7 günlük qidalanma planı hazırlanır...`,
    mealplan_header: `🍽 *7 Günlük Qidalanma Planın:*\n\n`,
    mealplan_no_profile: `⚙️ Əvvəlcə profili qur: /profile`,
    mealplan_premium_only: `🍽 *Qidalanma planları Premium xüsusiyyətidir.*\n\nFərdi plan üçün Premium al:`,
    mealplan_error: `❌ Plan yaradılmadı. Yenidən cəhd et.`,

    shoplist_generating: `🛒 Alış-veriş siyahısı hazırlanır...`,
    shoplist_header: `🛒 *Həftəlik Alış-veriş Siyahısı:*\n\n`,
    shoplist_no_profile: `⚙️ Əvvəlcə profili qur: /profile`,
    shoplist_pro_only: `🛒 *Alış-veriş siyahısı Pro xüsusiyyətidir.*\n\nSiyahılar və reseptlər üçün Pro al:`,
    shoplist_error: `❌ Siyahı yaradılmadı. Yenidən cəhd et.`,

    recipe_usage: `👨‍🍳 İstifadə: /recipe <yemək adı>\nNümunə: /recipe toyuq şaşlıq`,
    recipe_generating: (name) => `👨‍🍳 *${name}* resepti axtarılır...`,
    recipe_header: (name) => `👨‍🍳 *Resept: ${name}*\n\n`,
    recipe_pro_only: `👨‍🍳 *Reseptlər Pro xüsusiyyətidir.*\n\nKBJU ilə tam reseptlər üçün Pro al:`,
    recipe_error: `❌ Resept tapılmadı. Yenidən cəhd et.`,

    weekly_report_header: `📊 *Həftəlik Hesabatın*\n\n`,

    lang_select: `🌐 Dil seçin:`,
    lang_changed: `✅ Dil Azərbaycan dilinə dəyişdirildi!`,
  },
};

function getLang(code) {
  if (!code) return 'en';
  const base = code.split('-')[0].toLowerCase();
  return langs[base] ? base : 'en';
}

function t(langCode) {
  return langs[getLang(langCode)] || langs.en;
}

module.exports = { t, getLang };
