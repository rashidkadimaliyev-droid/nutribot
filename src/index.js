const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const { analyzeFood, calculateNorms, getDietRecommendation, chatWithUser } = require('./claude');
const {
  initDB, getUser, createUser, updateUserProfile,
  addFoodLog, getTodayLog, getTodayTotals,
  checkAndUpdateUsage, incrementUsage
} = require('./database');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN not set!');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Track onboarding state in memory
const onboardingState = {};

// ============ HELPERS ============

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
  const name = msg.from.first_name || 'друг';

  createUser.run(chatId, name);
  const user = getUser.get(chatId);

  if (user && user.calorie_norm) {
    await bot.sendMessage(chatId,
      `С возвращением, ${name}! 👋\n\n` +
      `📸 Отправь фото еды — я посчитаю калории и БЖУ\n` +
      `📊 /today — что съел сегодня\n` +
      `💡 /tip — рекомендация по питанию\n` +
      `⚙️ /profile — изменить параметры\n` +
      `❓ /help — все команды`
    );
  } else {
    await bot.sendMessage(chatId,
      `Привет, ${name}! 👋\n\n` +
      `Я — NutriBot 🥗\n` +
      `Отправь мне фото еды, и я мгновенно посчитаю калории и БЖУ.\n\n` +
      `Давай настроим твой профиль, чтобы я мог давать персональные рекомендации.\n\n` +
      `Какой у тебя пол?`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '👨 Мужской', callback_data: 'gender_male' },
              { text: '👩 Женский', callback_data: 'gender_female' }
            ]
          ]
        }
      }
    );
  }
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser.get(chatId);

  if (!user) {
    return bot.sendMessage(chatId, 'Нажми /start чтобы начать!');
  }

  const totals = getTodayTotals.get(chatId);
  const log = getTodayLog.all(chatId);

  if (totals.meals === 0) {
    return bot.sendMessage(chatId, '📋 Сегодня ты ещё ничего не ел.\n\n📸 Отправь фото еды!');
  }

  let text = `📊 *Сегодня съедено:*\n\n`;

  log.forEach((item, i) => {
    const time = item.logged_at.split(' ')[1]?.substring(0, 5) || '';
    text += `${i + 1}. ${item.food_name} — ${formatNumber(item.calories)} ккал _(${time})_\n`;
  });

  text += `\n─────────────────\n`;
  text += `*Итого:* ${formatNumber(totals.total_calories)} ккал\n`;
  text += `Б: ${formatNumber(totals.total_protein)}г | Ж: ${formatNumber(totals.total_fat)}г | У: ${formatNumber(totals.total_carbs)}г\n`;

  if (user.calorie_norm) {
    text += `\n📈 *Прогресс к дневной норме:*\n`;
    text += `Калории: ${progressBar(totals.total_calories, user.calorie_norm)}\n`;
    text += `Белок:   ${progressBar(totals.total_protein, user.protein_norm)}\n`;
    text += `Жиры:    ${progressBar(totals.total_fat, user.fat_norm)}\n`;
    text += `Углеводы:${progressBar(totals.total_carbs, user.carb_norm)}\n`;
  }

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/tip/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser.get(chatId);

  if (!user || !user.calorie_norm) {
    return bot.sendMessage(chatId, '⚙️ Сначала настрой профиль: /profile');
  }

  const totals = getTodayTotals.get(chatId);
  const norms = {
    calories: user.calorie_norm,
    protein: user.protein_norm,
    fat: user.fat_norm,
    carbs: user.carb_norm
  };

  await bot.sendMessage(chatId, '🤔 Думаю над рекомендацией...');

  const tip = await getDietRecommendation(user, totals, norms);
  if (tip) {
    await bot.sendMessage(chatId, `💡 *Рекомендация:*\n\n${tip}`, { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, 'Не удалось получить рекомендацию. Попробуй позже.');
  }
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  createUser.run(chatId, msg.from.first_name || 'друг');

  await bot.sendMessage(chatId, 'Давай обновим профиль. Какой у тебя пол?', {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '👨 Мужской', callback_data: 'gender_male' },
          { text: '👩 Женский', callback_data: 'gender_female' }
        ]
      ]
    }
  });
});

bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id,
    `🥗 *NutriBot — Команды:*\n\n` +
    `📸 *Отправь фото* — анализ КБЖУ\n` +
    `📊 /today — дневник за сегодня\n` +
    `💡 /tip — рекомендация что съесть\n` +
    `⚙️ /profile — настроить профиль\n` +
    `❓ /help — эта подсказка\n\n` +
    `🆓 Бесплатно: 3 анализа в день\n` +
    `⭐ Премиум: безлимит`,
    { parse_mode: 'Markdown' }
  );
});

// ============ ONBOARDING CALLBACKS ============

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  await bot.answerCallbackQuery(query.id);

  // Gender selection
  if (data.startsWith('gender_')) {
    const gender = data === 'gender_male' ? 'male' : 'female';
    onboardingState[chatId] = { gender, step: 'age' };
    await bot.sendMessage(chatId, '📅 Сколько тебе лет? (напиши число)');
  }

  // Goal selection
  if (data.startsWith('goal_')) {
    const goal = data.replace('goal_', '');
    const state = onboardingState[chatId];

    if (state) {
      const norms = calculateNorms(state.gender, state.age, state.weight, state.height, goal);

      updateUserProfile.run(
        state.gender, state.age, state.weight, state.height, goal,
        norms.calories, norms.protein, norms.fat, norms.carbs,
        chatId
      );

      const goalText = goal === 'lose' ? '🔥 Похудение' : goal === 'gain' ? '💪 Набор массы' : '⚖️ Поддержание';

      await bot.sendMessage(chatId,
        `✅ Профиль настроен!\n\n` +
        `🎯 Цель: ${goalText}\n` +
        `📊 Твоя дневная норма:\n` +
        `├ Калории: ${norms.calories} ккал\n` +
        `├ Белок: ${norms.protein}г\n` +
        `├ Жиры: ${norms.fat}г\n` +
        `└ Углеводы: ${norms.carbs}г\n\n` +
        `📸 Теперь отправь фото еды — я посчитаю КБЖУ!`
      );

      delete onboardingState[chatId];
    }
  }
});

// ============ ONBOARDING TEXT INPUTS ============

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const state = onboardingState[chatId];

  if (msg.photo || msg.text?.startsWith('/')) return;

  // Free-form chat for users not in onboarding
  if (!state) {
    const text = msg.text?.trim();
    if (!text) return;

    const user = getUser.get(chatId);
    const totals = user ? getTodayTotals.get(chatId) : null;

    const reply = await chatWithUser(text, user, totals);
    if (reply) {
      await bot.sendMessage(chatId, reply);
    }
    return;
  }

  const text = msg.text?.trim();
  const num = parseFloat(text);

  if (state.step === 'age') {
    if (isNaN(num) || num < 10 || num > 100) {
      return bot.sendMessage(chatId, '❌ Введи возраст числом (10-100)');
    }
    state.age = num;
    state.step = 'weight';
    await bot.sendMessage(chatId, '⚖️ Какой у тебя вес в кг? (например: 75)');
  }
  else if (state.step === 'weight') {
    if (isNaN(num) || num < 30 || num > 300) {
      return bot.sendMessage(chatId, '❌ Введи вес числом в кг (30-300)');
    }
    state.weight = num;
    state.step = 'height';
    await bot.sendMessage(chatId, '📏 Какой у тебя рост в см? (например: 175)');
  }
  else if (state.step === 'height') {
    if (isNaN(num) || num < 100 || num > 250) {
      return bot.sendMessage(chatId, '❌ Введи рост числом в см (100-250)');
    }
    state.height = num;
    state.step = 'goal';
    await bot.sendMessage(chatId, '🎯 Какая у тебя цель?', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔥 Похудение', callback_data: 'goal_lose' }],
          [{ text: '💪 Набор массы', callback_data: 'goal_gain' }],
          [{ text: '⚖️ Поддержание', callback_data: 'goal_maintain' }]
        ]
      }
    });
  }
});

// ============ PHOTO ANALYSIS ============

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  // Ensure user exists
  createUser.run(chatId, msg.from.first_name || 'друг');

  // Check usage limits
  const usage = checkAndUpdateUsage(chatId);
  if (!usage.allowed) {
    return bot.sendMessage(chatId,
      `⚠️ Ты использовал все 3 бесплатных анализа на сегодня.\n\n` +
      `⭐ Хочешь безлимит? Оформи премиум-подписку!\n` +
      `Завтра бесплатные анализы обновятся.`
    );
  }

  // Send "analyzing" message
  const waitMsg = await bot.sendMessage(chatId, '🔍 Анализирую фото...');

  try {
    // Download photo (largest size)
    const photoSize = msg.photo[msg.photo.length - 1];
    const imageBuffer = await downloadFile(photoSize.file_id);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with Claude Vision
    const result = await analyzeFood(imageBase64);

    if (!result.success) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
      return bot.sendMessage(chatId, '❌ Не удалось проанализировать фото. Попробуй другое.');
    }

    const { data } = result;

    // Save to food log
    for (const item of data.items) {
      addFoodLog.run(chatId, item.name, item.weight_g, item.calories, item.protein, item.fat, item.carbs);
    }

    // Increment usage
    incrementUsage(chatId);

    // Format response
    let text = `✅ *Анализ готов!*\n\n`;

    data.items.forEach((item) => {
      text += `🍽 *${item.name}* (~${formatNumber(item.weight_g)}г)\n`;
      text += `├ Калории: ${formatNumber(item.calories)} ккал\n`;
      text += `├ Белок: ${formatNumber(item.protein)}г\n`;
      text += `├ Жиры: ${formatNumber(item.fat)}г\n`;
      text += `└ Углеводы: ${formatNumber(item.carbs)}г\n\n`;
    });

    if (data.items.length > 1) {
      text += `📊 *Итого:* ${formatNumber(data.total.calories)} ккал `;
      text += `(Б:${formatNumber(data.total.protein)} Ж:${formatNumber(data.total.fat)} У:${formatNumber(data.total.carbs)})\n\n`;
    }

    if (data.comment) {
      text += `💬 ${data.comment}\n\n`;
    }

    // Show daily progress if profile is set up
    const user = getUser.get(chatId);
    if (user && user.calorie_norm) {
      const totals = getTodayTotals.get(chatId);
      text += `─────────────────\n`;
      text += `📈 *За сегодня:* ${formatNumber(totals.total_calories)}/${formatNumber(user.calorie_norm)} ккал\n`;
      text += `${progressBar(totals.total_calories, user.calorie_norm)}\n`;
    }

    const remaining = usage.remaining - 1;
    if (remaining > 0 && !user?.is_premium) {
      text += `\n📸 Осталось анализов: ${remaining}/3`;
    }

    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Photo analysis error:', error);
    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуй ещё раз.');
  }
});

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
