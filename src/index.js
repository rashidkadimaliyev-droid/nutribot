const TelegramBot = require('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const { analyzeFood, calculateNorms, getDietRecommendation, chatWithUser } = require('./claude');
const {
  initDB, getUser, createUser, updateUserProfile,
  addFoodLog, getTodayLog, getTodayTotals,
  checkAndUpdateUsage, incrementUsage, upgradeUser, savePayment,
  checkChatUsage, incrementChatUsage
} = require('./database');
const t = require('./translations');

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
  const name = msg.from.first_name || 'friend';

  createUser.run(chatId, name);
  const user = getUser.get(chatId);

  if (user && user.calorie_norm) {
    await bot.sendMessage(chatId, t.welcome_back(name));
  } else {
    await bot.sendMessage(chatId, t.welcome_new(name), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: t.btn_male, callback_data: 'gender_male' },
            { text: t.btn_female, callback_data: 'gender_female' }
          ]
        ]
      }
    });
  }
});

bot.onText(/\/today/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser.get(chatId);

  if (!user) {
    return bot.sendMessage(chatId, t.no_user);
  }

  const totals = getTodayTotals.get(chatId);
  const log = getTodayLog.all(chatId);

  if (totals.meals === 0) {
    return bot.sendMessage(chatId, t.no_meals_today);
  }

  let text = t.today_header;

  log.forEach((item, i) => {
    const time = item.logged_at.split(' ')[1]?.substring(0, 5) || '';
    text += `${i + 1}. ${item.food_name} — ${formatNumber(item.calories)} kcal _(${time})_\n`;
  });

  text += t.today_separator;
  text += t.today_total(
    formatNumber(totals.total_calories),
    formatNumber(totals.total_protein),
    formatNumber(totals.total_fat),
    formatNumber(totals.total_carbs)
  );

  if (user.calorie_norm) {
    text += t.today_progress_header;
    text += t.today_calories(progressBar(totals.total_calories, user.calorie_norm));
    text += t.today_protein(progressBar(totals.total_protein, user.protein_norm));
    text += t.today_fat(progressBar(totals.total_fat, user.fat_norm));
    text += t.today_carbs(progressBar(totals.total_carbs, user.carb_norm));
  }

  await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
});

bot.onText(/\/tip/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser.get(chatId);

  if (!user || !user.calorie_norm) {
    return bot.sendMessage(chatId, t.tip_no_profile);
  }

  if (user.plan !== 'premium') {
    return bot.sendMessage(chatId, t.tip_premium_only, {
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

  await bot.sendMessage(chatId, t.tip_thinking);

  const tip = await getDietRecommendation(user, totals, norms);
  if (tip) {
    await bot.sendMessage(chatId, t.tip_result(tip), { parse_mode: 'Markdown' });
  } else {
    await bot.sendMessage(chatId, t.tip_error);
  }
});

bot.onText(/\/profile/, async (msg) => {
  const chatId = msg.chat.id;
  createUser.run(chatId, msg.from.first_name || 'friend');

  await bot.sendMessage(chatId, t.profile_ask_gender, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: t.btn_male, callback_data: 'gender_male' },
          { text: t.btn_female, callback_data: 'gender_female' }
        ]
      ]
    }
  });
});

bot.onText(/\/help/, async (msg) => {
  await bot.sendMessage(msg.chat.id, t.help, { parse_mode: 'Markdown' });
});

bot.onText(/\/upgrade/, async (msg) => {
  const chatId = msg.chat.id;
  const user = getUser.get(chatId);

  if (user && user.plan === 'premium') {
    return bot.sendMessage(chatId, t.upgrade_already_premium);
  }

  await bot.sendMessage(chatId, t.upgrade_menu, { parse_mode: 'Markdown' });

  await bot.sendInvoice(
    chatId,
    t.upgrade_invoice_title,
    t.upgrade_invoice_description,
    'premium_monthly',
    '',           // provider_token — empty string for Telegram Stars
    'XTR',        // Telegram Stars currency
    [{ label: 'Premium — 1 month', amount: 100 }]
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
    await bot.sendMessage(chatId, t.ask_age);
  }

  // Upgrade shortcut from tip/chat limit buttons
  if (data === 'open_upgrade') {
    const user = getUser.get(chatId);
    if (user && user.plan === 'premium') {
      return bot.sendMessage(chatId, t.upgrade_already_premium);
    }
    await bot.sendMessage(chatId, t.upgrade_menu, { parse_mode: 'Markdown' });
    await bot.sendInvoice(
      chatId,
      t.upgrade_invoice_title,
      t.upgrade_invoice_description,
      'premium_monthly',
      '',
      'XTR',
      [{ label: 'Premium — 1 month', amount: 100 }]
    );
    return;
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

      const goalText = goal === 'lose' ? t.goal_lose : goal === 'gain' ? t.goal_gain : t.goal_maintain;

      await bot.sendMessage(chatId, t.profile_done(goalText, norms));

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

    const chatUsage = checkChatUsage(chatId);
    if (!chatUsage.allowed) {
      return bot.sendMessage(chatId, t.chat_limit_reached, {
        reply_markup: {
          inline_keyboard: [[{ text: '⭐ Upgrade to Premium', callback_data: 'open_upgrade' }]]
        }
      });
    }

    const totals = user ? getTodayTotals.get(chatId) : null;
    const reply = await chatWithUser(text, user, totals);
    if (reply) {
      incrementChatUsage(chatId);
      await bot.sendMessage(chatId, reply);
    }
    return;
  }

  const text = msg.text?.trim();
  const num = parseFloat(text);

  if (state.step === 'age') {
    if (isNaN(num) || num < 10 || num > 100) {
      return bot.sendMessage(chatId, t.err_age);
    }
    state.age = num;
    state.step = 'weight';
    await bot.sendMessage(chatId, t.ask_weight);
  }
  else if (state.step === 'weight') {
    if (isNaN(num) || num < 30 || num > 300) {
      return bot.sendMessage(chatId, t.err_weight);
    }
    state.weight = num;
    state.step = 'height';
    await bot.sendMessage(chatId, t.ask_height);
  }
  else if (state.step === 'height') {
    if (isNaN(num) || num < 100 || num > 250) {
      return bot.sendMessage(chatId, t.err_height);
    }
    state.height = num;
    state.step = 'goal';
    await bot.sendMessage(chatId, t.ask_goal, {
      reply_markup: {
        inline_keyboard: [
          [{ text: t.btn_goal_lose, callback_data: 'goal_lose' }],
          [{ text: t.btn_goal_gain, callback_data: 'goal_gain' }],
          [{ text: t.btn_goal_maintain, callback_data: 'goal_maintain' }]
        ]
      }
    });
  }
});

// ============ PHOTO ANALYSIS ============

bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;

  // Ensure user exists
  createUser.run(chatId, msg.from.first_name || 'friend');

  // Check usage limits
  const usage = checkAndUpdateUsage(chatId);
  if (!usage.allowed) {
    return bot.sendMessage(chatId, t.limit_reached);
  }

  // Send "analyzing" message
  const waitMsg = await bot.sendMessage(chatId, t.analyzing);

  try {
    // Download photo (largest size)
    const photoSize = msg.photo[msg.photo.length - 1];
    const imageBuffer = await downloadFile(photoSize.file_id);
    const imageBase64 = imageBuffer.toString('base64');

    // Analyze with Claude Vision
    const result = await analyzeFood(imageBase64);

    if (!result.success) {
      await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
      return bot.sendMessage(chatId, t.analysis_failed);
    }

    const { data } = result;

    // Save to food log
    for (const item of data.items) {
      addFoodLog.run(chatId, item.name, item.weight_g, item.calories, item.protein, item.fat, item.carbs);
    }

    // Increment usage
    incrementUsage(chatId);

    // Format response
    let text = t.analysis_header;

    data.items.forEach((item) => {
      text += t.analysis_item(
        item.name,
        formatNumber(item.weight_g),
        formatNumber(item.calories),
        formatNumber(item.protein),
        formatNumber(item.fat),
        formatNumber(item.carbs)
      );
    });

    if (data.items.length > 1) {
      text += t.analysis_total(
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
      text += t.analysis_daily(
        formatNumber(totals.total_calories),
        formatNumber(user.calorie_norm),
        progressBar(totals.total_calories, user.calorie_norm)
      );
    }

    const remaining = usage.remaining - 1;
    if (remaining > 0 && !user?.is_premium) {
      text += t.analyses_remaining(remaining);
    }

    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Photo analysis error:', error);
    await bot.deleteMessage(chatId, waitMsg.message_id).catch(() => {});
    await bot.sendMessage(chatId, t.analysis_error);
  }
});

// ============ PAYMENTS ============

bot.on('pre_checkout_query', async (query) => {
  await bot.answerPreCheckoutQuery(query.id, true);
});

bot.on('message', async (msg) => {
  if (!msg.successful_payment) return;

  const chatId = msg.chat.id;
  const payment = msg.successful_payment;

  upgradeUser(chatId);
  savePayment(
    chatId,
    payment.telegram_payment_charge_id,
    payment.total_amount,
    payment.currency,
    payment.invoice_payload
  );

  await bot.sendMessage(chatId, t.upgrade_success, { parse_mode: 'Markdown' });
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
