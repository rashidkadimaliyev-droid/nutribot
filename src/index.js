const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const { analyzeFood, analyzeFoodText, calculateNorms, getDietRecommendation, chatWithUser, generateMealPlan, generateShoppingList, generateRecipe, generateWeeklyReport } = require('./claude');
const {
  initDB, getUser, createUser, updateUserProfile,
  addFoodLog, getTodayLog, getTodayTotals,
  getWeekSummary, getLastWeekSummary, getMonthSummary, getPlanUsers,
  checkAndUpdateUsage, incrementUsage, upgradeUser, savePayment,
  checkChatUsage, incrementChatUsage, updateUserLanguage
} = require('./database');
const { t, getLang } = require('./translations');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_ID = 564884556;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Track onboarding state in memory
const onboardingState = {};

// ============ HELPERS ============

function userLang(msg) {
  const user = getUser.get(msg.chat?.id);
  if (user?.language) return getLang(user.language);
  return getLang(msg.from?.language_code);
}

function formatNumber(n) {
  return Math.round(n);
}

function progressBar(current, max) {
  const pct = Math.min(current / max, 1);
  const filled = Math.round(pct * 10);
  const empty = 10 - filled;
  const emoji = pct > 1 ? '🔴' : pct > 0.8 ? '🟡' : '🟢';
  return `${emoji} ${'█'.repeat(filled)}${'░'.repeat(empty)} ${formatNumber(current)}/${formatNumber(max)}`;
}

async function downloadFile(fileId) {
  const file = await bot.getFile(fileId);
  const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

// ============ COMMANDS ============

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const name = msg.from.first_name || 'friend';

  createUser.run(chatId, name, lang);
  const user = getUser.get(chatId);

  if (user && user.calorie_norm) {
    await bot.sendMessage(chatId, t(lang).welcome_back(name));
  } else {
    // New user — first pick language
    await bot.sendMessage(
      chatId,
      '🌐 Choose your language / Выберите язык / Dilinizi seçin / Dil seçin',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🇬🇧 English',    callback_data: 'lang_en' },
              { text: '🇷🇺 Русский',    callback_data: 'lang_ru' },
            ],
            [
              { text: '🇹🇷 Türkçe',     callback_data: 'lang_tr' },
              { text: '🇦🇿 Azərbaycan', callback_data: 'lang_az' },
            ]
          ]
        }
      }
    );
  }
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user) {
    return bot.sendMessage(chatId, t(lang).no_user);
  }

  const totals = getTodayTotals.get(chatId);
  const log = getTodayLog.all(chatId);

  if (totals.meals === 0) {
    return bot.sendMessage(chatId, t(lang).no_meals_today);
  }

  let text = t(lang).today_header;

  log.forEach((item, i) => {
    const time = item.logged_at.split(' ')[1]?.substring(0, 5) || '';
    text += `${i + 1}. ${item.food_name} — ${formatNumber(item.calories)} kcal _(${time})_\n`;
  });

  text += t(lang).today_separator;
  text += t(lang).today_total(
    formatNumber(totals.total_calories),
    formatNumber(totals.total_protein),
    formatNumber(totals.total_fat),
    formatNumber(totals.total_carbs)
  );

  if (user.calorie_norm) {
    text += t(lang).today_progress_header;
    text += t(lang).today_calories(progressBar(totals.total_calories, user.calorie_norm));
    text += t(lang).today_protein(progressBar(totals.total_protein, user.protein_norm));
    text += t(lang).today_fat(progressBar(totals.total_fat, user.fat_norm));
    text += t(lang).today_carbs(progressBar(totals.total_carbs, user.carb_norm));
  }

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/tip/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user || !user.calorie_norm) {
    return bot.sendMessage(chatId, t(lang).tip_no_profile);
  }

  if (user.plan === 'free') {
    return bot.sendMessage(chatId, t(lang).tip_premium_only, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '⭐ Upgrade to Premium', callback_data: 'open_upgrade' }]]
      }
    });
  }

  const totals = getTodayTotals.get(chatId);
  const norms = {
    calories: user.calorie_norm,
    protein: user.protein_norm,
    fat: user.fat_norm,
    carbs: user.carb_norm
  };

  await bot.sendMessage(chatId, t(lang).tip_thinking);

  const tip = await getDietRecommendation(user, totals, norms, lang);
  if (tip) {
    await bot.sendMessage(chatId, t(lang).tip_result(tip), { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, t(lang).tip_error);
  }
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  createUser.run(chatId, msg.from.first_name || 'friend', lang);

  await bot.sendMessage(chatId, t(lang).profile_ask_gender, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: t(lang).btn_male, callback_data: 'gender_male' },
          { text: t(lang).btn_female, callback_data: 'gender_female' }
        ]
      ]
    }
  });
});

bot.onText(/\/help/, async (msg) => {
  const lang = userLang(msg);
  await bot.sendMessage(msg.chat.id, t(lang).help, { parse_mode: 'Markdown' });
});

bot.onText(/\/lang/, async (msg) => {
  const lang = userLang(msg);
  await bot.sendMessage(msg.chat.id, t(lang).lang_select, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '🇬🇧 English',    callback_data: 'lang_en' },
          { text: '🇷🇺 Русский',    callback_data: 'lang_ru' },
        ],
        [
          { text: '🇹🇷 Türkçe',     callback_data: 'lang_tr' },
          { text: '🇦🇿 Azərbaycan', callback_data: 'lang_az' },
        ]
      ]
    }
  });
});

bot.onText(/\/upgrade/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (user && user.plan === 'premium') {
    return bot.sendMessage(chatId, t(lang).upgrade_already_premium);
  }

  await bot.sendMessage(chatId, t(lang).upgrade_menu, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '👑 Premium — 250 ⭐', callback_data: 'buy_premium' }],
        [{ text: '🚀 Pro — 500 ⭐',     callback_data: 'buy_pro' }]
      ]
    }
  });
});

bot.onText(/\/history/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user || user.plan === 'free') {
    return bot.sendMessage(chatId, t(lang).history_premium_only, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '⭐ Upgrade to Premium', callback_data: 'open_upgrade' }]] }
    });
  }

  const week = getWeekSummary(chatId);
  if (week.length === 0) {
    return bot.sendMessage(chatId, t(lang).history_no_data);
  }

  let text = t(lang).history_week_header;
  week.forEach(row => {
    text += t(lang).history_day(row.date, row.total_calories, row.total_protein, row.total_fat, row.total_carbs);
  });

  const month = getMonthSummary(chatId);
  if (month.length > 0) {
    const avg = month.reduce((a, r) => ({
      cal: a.cal + r.total_calories, p: a.p + r.total_protein,
      f: a.f + r.total_fat, c: a.c + r.total_carbs
    }), { cal: 0, p: 0, f: 0, c: 0 });
    const n = month.length;
    text += t(lang).history_month_header;
    text += t(lang).history_avg(avg.cal / n, avg.p / n, avg.f / n, avg.c / n);
  }

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/mealplan/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user || user.plan === 'free') {
    return bot.sendMessage(chatId, t(lang).mealplan_premium_only, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '⭐ Upgrade to Premium', callback_data: 'open_upgrade' }]] }
    });
  }
  if (!user.calorie_norm) {
    return bot.sendMessage(chatId, t(lang).mealplan_no_profile);
  }

  const waitMsg = await bot.sendMessage(chatId, t(lang).mealplan_generating);
  const plan = await generateMealPlan(user, lang);
  await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

  if (plan) {
    await bot.sendMessage(chatId, t(lang).mealplan_header + plan, { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, t(lang).mealplan_error);
  }
});

bot.onText(/\/shoplist/, async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user || user.plan !== 'pro') {
    return bot.sendMessage(chatId, t(lang).shoplist_pro_only, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '🚀 Upgrade to Pro', callback_data: 'buy_pro' }]] }
    });
  }
  if (!user.calorie_norm) {
    return bot.sendMessage(chatId, t(lang).shoplist_no_profile);
  }

  const waitMsg = await bot.sendMessage(chatId, t(lang).shoplist_generating);
  const list = await generateShoppingList(user, lang);
  await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

  if (list) {
    await bot.sendMessage(chatId, t(lang).shoplist_header + list, { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, t(lang).shoplist_error);
  }
});

bot.onText(/\/recipe(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const user = getUser.get(chatId);

  if (!user || user.plan !== 'pro') {
    return bot.sendMessage(chatId, t(lang).recipe_pro_only, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: [[{ text: '🚀 Upgrade to Pro', callback_data: 'buy_pro' }]] }
    });
  }

  const recipeName = match[1]?.trim();
  if (!recipeName) {
    return bot.sendMessage(chatId, t(lang).recipe_usage);
  }

  const waitMsg = await bot.sendMessage(chatId, t(lang).recipe_generating(recipeName), { parse_mode: 'Markdown' });
  const recipe = await generateRecipe(recipeName, user, lang);
  await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});

  if (recipe) {
    await bot.sendMessage(chatId, t(lang).recipe_header(recipeName) + recipe, { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, t(lang).recipe_error);
  }
});

// ============ ADMIN ============

bot.onText(/\/admin(@\w+)?(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  console.log(`[admin] from.id=${msg.from.id} ADMIN_ID=${ADMIN_ID} match=${JSON.stringify(match?.slice(1))}`);
  if (String(msg.from.id) !== String(ADMIN_ID)) return;

  const args   = match[2]?.trim().split(/\s+/);
  const plan   = args?.[0]; // optional: free/premium/pro
  const target = args?.[1] ? parseInt(args[1], 10) : chatId;

  // /admin — show current status + buttons
  if (!plan) {
    const user = getUser.get(chatId);
    const currentPlan = user?.plan || 'free';
    await bot.sendMessage(chatId,
      `🔧 *Admin Panel*\n\nYour plan: *${currentPlan}*`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🆓 Free',    callback_data: 'admin_free' },
            { text: '👑 Premium', callback_data: 'admin_premium' },
            { text: '🚀 Pro',     callback_data: 'admin_pro' }
          ]]
        }
      }
    );
    return;
  }

  // /admin [plan] or /admin [plan] [user_id]
  const validPlans = ['free', 'premium', 'pro'];
  if (!validPlans.includes(plan)) {
    return bot.sendMessage(chatId, `❌ Unknown plan: ${plan}. Use: free / premium / pro`);
  }

  upgradeUser(target, plan);
  const updated = getUser.get(target);
  await bot.sendMessage(chatId, `✅ User \`${target}\` → *${plan}*\nName: ${updated?.name || 'unknown'}`, { parse_mode: 'Markdown' });
});

// ============ ONBOARDING CALLBACKS ============

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const lang = getLang(query.from?.language_code);
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  // Gender selection
  if (data.startsWith('gender_')) {
    const gender = data === 'gender_male' ? 'male' : 'female';
    const stateLang = onboardingState[chatId]?.lang || lang;
    onboardingState[chatId] = { gender, step: 'age', lang: stateLang };
    await bot.sendMessage(chatId, t(stateLang).ask_age);
  }

  // Admin plan switch
  if (data.startsWith('admin_') && String(query.from.id) === String(ADMIN_ID)) {
    const plan = data.replace('admin_', '');
    upgradeUser(chatId, plan);
    await bot.editMessageText(
      `🔧 *Admin Panel*\n\nYour plan: *${plan}* ✅`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🆓 Free',    callback_data: 'admin_free' },
            { text: '👑 Premium', callback_data: 'admin_premium' },
            { text: '🚀 Pro',     callback_data: 'admin_pro' }
          ]]
        }
      }
    );
    return;
  }

  // Upgrade shortcut from tip/chat limit buttons
  if (data === 'open_upgrade') {
    const user = getUser.get(chatId);
    if (user && user.plan === 'premium') {
      return bot.sendMessage(chatId, t(lang).upgrade_already_premium);
    }
    await bot.sendMessage(chatId, t(lang).upgrade_menu, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '👑 Premium — 250 ⭐', callback_data: 'buy_premium' }],
          [{ text: '🚀 Pro — 500 ⭐',     callback_data: 'buy_pro' }]
        ]
      }
    });
    return;
  }

  if (data === 'buy_premium') {
    await bot.sendInvoice(
      chatId,
      t(lang).upgrade_invoice_title,
      t(lang).upgrade_invoice_description,
      'premium_monthly', '', 'XTR',
      [{ label: 'Premium — 1 month', amount: 250 }]
    );
    return;
  }

  if (data === 'buy_pro') {
    await bot.sendInvoice(
      chatId,
      'NutriBot Pro',
      'Shopping lists, full recipes with macros, Claude Sonnet AI chat.',
      'pro_monthly', '', 'XTR',
      [{ label: 'Pro — 1 month', amount: 500 }]
    );
    return;
  }

  // Language selection
  if (data.startsWith('lang_')) {
    const newLang = data.replace('lang_', '');
    updateUserLanguage(chatId, newLang);

    const userAfterLang = getUser.get(chatId);
    if (!userAfterLang?.calorie_norm) {
      // New user — start onboarding in chosen language
      onboardingState[chatId] = { ...(onboardingState[chatId] || {}), lang: newLang };
      const name = query.from.first_name || 'friend';
      await bot.editMessageText(t(newLang).welcome_new(name), {
        chat_id: chatId,
        message_id: query.message.message_id,
        reply_markup: {
          inline_keyboard: [[
            { text: t(newLang).btn_male,   callback_data: 'gender_male' },
            { text: t(newLang).btn_female, callback_data: 'gender_female' }
          ]]
        }
      });
    } else {
      await bot.editMessageText(t(newLang).lang_changed, {
        chat_id: chatId,
        message_id: query.message.message_id
      });
    }
    return;
  }

  // Goal selection — save goal, then ask activity
  if (data.startsWith('goal_')) {
    const goal = data.replace('goal_', '');
    const state = onboardingState[chatId];
    if (state) {
      state.goal = goal;
      state.step = 'activity';
      const sl = state.lang || lang;
      await bot.sendMessage(chatId, t(sl).ask_activity, {
        reply_markup: {
          inline_keyboard: [
            [{ text: t(sl).btn_activity_sedentary, callback_data: 'activity_sedentary' }],
            [{ text: t(sl).btn_activity_light,     callback_data: 'activity_light' }],
            [{ text: t(sl).btn_activity_moderate,  callback_data: 'activity_moderate' }],
            [{ text: t(sl).btn_activity_active,    callback_data: 'activity_active' }]
          ]
        }
      });
    }
  }

  // Activity selection — finalise profile
  if (data.startsWith('activity_')) {
    const activity = data.replace('activity_', '');
    const state = onboardingState[chatId];
    if (state) {
      const sl = state.lang || lang;
      const norms = calculateNorms(state.gender, state.age, state.weight, state.height, state.goal, activity);

      updateUserProfile.run(
        state.gender, state.age, state.weight, state.height, state.goal, activity,
        norms.calories, norms.protein, norms.fat, norms.carbs,
        chatId
      );

      const goalText = { lose: t(sl).goal_lose, gain: t(sl).goal_gain, recomp: t(sl).goal_recomp, maintain: t(sl).goal_maintain }[state.goal] || t(sl).goal_maintain;
      const activityText = { sedentary: t(sl).btn_activity_sedentary, light: t(sl).btn_activity_light, moderate: t(sl).btn_activity_moderate, active: t(sl).btn_activity_active }[activity];

      await bot.sendMessage(chatId, t(sl).profile_done(goalText, activityText, norms));
      delete onboardingState[chatId];
    }
  }
});

// ============ ONBOARDING TEXT INPUTS ============

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const state = onboardingState[chatId];

  if (msg.photo || msg.text?.startsWith('/')) return;

  // Free-form chat for users not in onboarding
  if (!state) {
    const text = msg.text?.trim();
    if (!text) return;

    const user = getUser.get(chatId);

    // First determine if user is logging food or asking a question
    const parsed = await analyzeFoodText(text, lang);

    if (parsed.type === 'food_log' && parsed.items?.length) {
      // Check photo usage limit
      const usage = checkAndUpdateUsage(chatId);
      if (!usage.allowed) {
        return bot.sendMessage(chatId, t(lang).limit_reached);
      }

      // Save items to food log
      for (const item of parsed.items) {
        addFoodLog.run(chatId, item.name, item.weight_g, item.calories, item.protein, item.fat, item.carbs);
      }
      incrementUsage(chatId);

      // Format response (same style as photo analysis)
      let reply = t(lang).analysis_header;
      parsed.items.forEach((item) => {
        reply += t(lang).analysis_item(
          item.name,
          formatNumber(item.weight_g),
          formatNumber(item.calories),
          formatNumber(item.protein),
          formatNumber(item.fat),
          formatNumber(item.carbs)
        );
      });
      if (parsed.items.length > 1) {
        reply += t(lang).analysis_total(
          formatNumber(parsed.total.calories),
          formatNumber(parsed.total.protein),
          formatNumber(parsed.total.fat),
          formatNumber(parsed.total.carbs)
        );
      }
      if (parsed.comment) reply += `💬 ${parsed.comment}\n\n`;

      if (user?.calorie_norm) {
        const totals = getTodayTotals.get(chatId);
        reply += t(lang).analysis_daily(
          formatNumber(totals.total_calories),
          formatNumber(user.calorie_norm),
          progressBar(totals.total_calories, user.calorie_norm)
        );
      }

      return bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
    }

    // Question / conversation flow
    const chatUsage = checkChatUsage(chatId);
    if (!chatUsage.allowed) {
      return bot.sendMessage(chatId, t(lang).chat_limit_reached, {
        reply_markup: {
          inline_keyboard: [[{ text: '⭐ Upgrade to Premium', callback_data: 'open_upgrade' }]]
        }
      });
    }

    const totals = user ? getTodayTotals.get(chatId) : null;
    const isPro = user?.plan === 'pro';
    const reply = await chatWithUser(text, user, totals, isPro, lang);
    if (reply) {
      incrementChatUsage(chatId);
      await bot.sendMessage(chatId, reply);
    }
    return;
  }

  const text = msg.text?.trim();
  const num = parseFloat(text);
  const sl = state.lang || lang;

  if (state.step === 'age') {
    if (isNaN(num) || num < 10 || num > 100) {
      return bot.sendMessage(chatId, t(sl).err_age);
    }
    state.age = num;
    state.step = 'weight';
    await bot.sendMessage(chatId, t(sl).ask_weight);
  }
  else if (state.step === 'weight') {
    if (isNaN(num) || num < 30 || num > 300) {
      return bot.sendMessage(chatId, t(sl).err_weight);
    }
    state.weight = num;
    state.step = 'height';
    await bot.sendMessage(chatId, t(sl).ask_height);
  }
  else if (state.step === 'height') {
    if (isNaN(num) || num < 100 || num > 250) {
      return bot.sendMessage(chatId, t(sl).err_height);
    }
    state.height = num;
    state.step = 'goal';
    await bot.sendMessage(chatId, t(sl).ask_goal, {
      reply_markup: {
        inline_keyboard: [
          [{ text: t(sl).btn_goal_lose,     callback_data: 'goal_lose' }],
          [{ text: t(sl).btn_goal_gain,     callback_data: 'goal_gain' }],
          [{ text: t(sl).btn_goal_recomp,   callback_data: 'goal_recomp' }],
          [{ text: t(sl).btn_goal_maintain, callback_data: 'goal_maintain' }]
        ]
      }
    });
  }
});

// ============ PHOTO ANALYSIS ============

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const lang = userLang(msg);

  // Ensure user exists
  createUser.run(chatId, msg.from.first_name || 'friend', lang);

  // Check usage limits
  const usage = checkAndUpdateUsage(chatId);
  if (!usage.allowed) {
    return bot.sendMessage(chatId, t(lang).limit_reached);
  }

  // Send "analyzing" message
  const waitMsg = await bot.sendMessage(chatId, t(lang).analyzing);

  try {
    // Download photo (largest size)
    const photoSize = msg.photo[msg.photo.length - 1];
    const imageBuffer = await downloadFile(photoSize.file_id);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with Claude Vision (pass caption if user added one)
    const result = await analyzeFood(imageBase64, 'image/jpeg', msg.caption || null, lang);

    if (!result.success) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
      return bot.sendMessage(chatId, t(lang).analysis_failed);
    }

    const { data } = result;

    // Save to food log
    for (const item of data.items) {
      addFoodLog.run(chatId, item.name, item.weight_g, item.calories, item.protein, item.fat, item.carbs);
    }

    // Increment usage
    incrementUsage(chatId);

    // Format response
    let text = t(lang).analysis_header;

    data.items.forEach((item) => {
      text += t(lang).analysis_item(
        item.name,
        formatNumber(item.weight_g),
        formatNumber(item.calories),
        formatNumber(item.protein),
        formatNumber(item.fat),
        formatNumber(item.carbs)
      );
    });

    if (data.items.length > 1) {
      text += t(lang).analysis_total(
        formatNumber(data.total.calories),
        formatNumber(data.total.protein),
        formatNumber(data.total.fat),
        formatNumber(data.total.carbs)
      );
    }

    if (data.comment) {
      text += `💬 ${data.comment}\n\n`;
    }

    // Show daily progress if profile is set up
    const user = getUser.get(chatId);
    if (user && user.calorie_norm) {
      const totals = getTodayTotals.get(chatId);
      text += t(lang).analysis_daily(
        formatNumber(totals.total_calories),
        formatNumber(user.calorie_norm),
        progressBar(totals.total_calories, user.calorie_norm)
      );
    }

    const remaining = usage.remaining - 1;
    if (remaining > 0 && !user?.is_premium) {
      text += t(lang).analyses_remaining(remaining);
    }

    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Photo analysis error:', error);
    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, t(lang).analysis_error);
  }
});

// ============ PAYMENTS ============

bot.on('pre_checkout_query', async (query) => {
  await bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('message', async (msg) => {
  if (!msg.successful_payment) return;

  const chatId = msg.chat.id;
  const lang = userLang(msg);
  const payment = msg.successful_payment;

  const newPlan = payment.invoice_payload === 'pro_monthly' ? 'pro' : 'premium';
  upgradeUser(chatId, newPlan);
  savePayment(
    chatId,
    payment.telegram_payment_charge_id,
    payment.total_amount,
    payment.currency,
    payment.invoice_payload
  );

  await bot.sendMessage(chatId, t(lang).upgrade_success, { parse_mode: 'Markdown' });
});

// ============ WEEKLY REPORT SCHEDULER ============

let lastWeeklyReportDate = null;

async function sendWeeklyReports() {
  const users = getPlanUsers();
  for (const user of users) {
    try {
      const thisWeek = getWeekSummary(user.telegram_id);
      if (thisWeek.length === 0) continue;
      const lastWeek = getLastWeekSummary(user.telegram_id);
      const lang = getLang(user.language);
      const report = await generateWeeklyReport(user, thisWeek, lastWeek, lang);
      if (report) {
        await bot.sendMessage(user.telegram_id, t(lang).weekly_report_header + report, { parse_mode: 'Markdown' });
      }
    } catch (e) {
      console.error(`Weekly report failed for ${user.telegram_id}:`, e.message);
    }
  }
}

setInterval(() => {
  const now = new Date();
  const isSunday = now.getUTCDay() === 0;
  const isReportHour = now.getUTCHours() === 18;
  const today = now.toISOString().split('T')[0];
  if (isSunday && isReportHour && lastWeeklyReportDate !== today) {
    lastWeeklyReportDate = today;
    sendWeeklyReports().catch(e => console.error('Weekly reports error:', e));
  }
}, 60 * 1000); // check every minute

// ============ HEALTH CHECK SERVER ============

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('NutriBot is running');
}).listen(PORT, () => {
  console.log(`Health check server on port ${PORT}`);
});

// Initialize database then start
initDB().then(() => {
  console.log('🥗 NutriBot started!');
}).catch((err) => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
