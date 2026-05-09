const t = {
  // /start
  welcome_back: (name) =>
    `Welcome back, ${name}! 👋\n\n` +
    `📸 Send a food photo — I'll count calories & macros\n` +
    `📊 /today — what you've eaten today\n` +
    `💡 /tip — nutrition recommendation\n` +
    `⚙️ /profile — update your profile\n` +
    `❓ /help — all commands`,

  welcome_new: (name) =>
    `Hi, ${name}! 👋\n\n` +
    `I'm NutriBot 🥗\n` +
    `Send me a photo of your food and I'll instantly calculate calories & macros.\n\n` +
    `Let's set up your profile so I can give you personal recommendations.\n\n` +
    `What's your gender?`,

  // /today
  no_user: `Press /start to begin!`,
  no_meals_today: `📋 You haven't eaten anything today.\n\n📸 Send a food photo!`,
  today_header: `📊 *Today's food log:*\n\n`,
  today_separator: `\n─────────────────\n`,
  today_total: (cal, p, f, c) => `*Total:* ${cal} kcal\nP: ${p}g | F: ${f}g | C: ${c}g\n`,
  today_progress_header: `\n📈 *Daily goal progress:*\n`,
  today_calories: (bar) => `Calories: ${bar}\n`,
  today_protein: (bar) => `Protein:  ${bar}\n`,
  today_fat: (bar) => `Fat:      ${bar}\n`,
  today_carbs: (bar) => `Carbs:    ${bar}\n`,

  // /tip
  tip_no_profile: `⚙️ Set up your profile first: /profile`,
  tip_thinking: `🤔 Thinking of a recommendation...`,
  tip_result: (tip) => `💡 *Recommendation:*\n\n${tip}`,
  tip_error: `Couldn't get a recommendation. Please try again later.`,

  // /profile
  profile_ask_gender: `Let's update your profile. What's your gender?`,

  // /help
  help: `🥗 *NutriBot — Commands:*\n\n` +
    `📸 *Send a photo* — analyze calories & macros\n` +
    `📊 /today — today's food diary\n` +
    `💡 /tip — recommendation on what to eat\n` +
    `⚙️ /profile — set up your profile\n` +
    `❓ /help — this help message\n\n` +
    `🆓 Free: 3 analyses per day\n` +
    `⭐ Premium: unlimited`,

  // onboarding buttons
  btn_male: `👨 Male`,
  btn_female: `👩 Female`,
  btn_goal_lose: `🔥 Lose weight`,
  btn_goal_gain: `💪 Gain muscle`,
  btn_goal_maintain: `⚖️ Maintain weight`,

  // onboarding steps
  ask_age: `📅 How old are you? (enter a number)`,
  ask_weight: `⚖️ What's your weight in kg? (e.g. 75)`,
  ask_height: `📏 What's your height in cm? (e.g. 175)`,
  ask_goal: `🎯 What's your goal?`,

  // onboarding errors
  err_age: `❌ Please enter your age as a number (10–100)`,
  err_weight: `❌ Please enter your weight in kg (30–300)`,
  err_height: `❌ Please enter your height in cm (100–250)`,

  // onboarding complete
  profile_done: (goalText, norms) =>
    `✅ Profile set up!\n\n` +
    `🎯 Goal: ${goalText}\n` +
    `📊 Your daily targets:\n` +
    `├ Calories: ${norms.calories} kcal\n` +
    `├ Protein: ${norms.protein}g\n` +
    `├ Fat: ${norms.fat}g\n` +
    `└ Carbs: ${norms.carbs}g\n\n` +
    `📸 Now send a food photo — I'll calculate the macros!`,

  goal_lose: `🔥 Lose weight`,
  goal_gain: `💪 Gain muscle`,
  goal_maintain: `⚖️ Maintain weight`,

  // photo analysis
  limit_reached:
    `⚠️ You've used all 3 free analyses for today.\n\n` +
    `⭐ Want unlimited? Get a premium subscription!\n` +
    `Free analyses reset tomorrow.`,

  analyzing: `🔍 Analyzing photo...`,
  analysis_failed: `❌ Couldn't analyze the photo. Please try another one.`,
  analysis_error: `❌ An error occurred. Please try again.`,

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
    `─────────────────\n` +
    `📈 *Today so far:* ${cal}/${norm} kcal\n` +
    `${bar}\n`,

  analyses_remaining: (n) => `\n📸 Analyses left: ${n}/3`,

  // /upgrade
  upgrade_menu:
    `⭐ *NutriBot Premium*\n\n` +
    `🆓 *Free plan:* 3 photo analyses per day\n` +
    `👑 *Premium plan:* unlimited analyses + priority support\n\n` +
    `💫 *Price: 100 Telegram Stars / month*\n\n` +
    `Tap the button below to pay with Telegram Stars:`,

  upgrade_already_premium: `👑 You already have Premium! Enjoy unlimited analyses.`,
  upgrade_success: `🎉 *Payment successful!*\n\n👑 You now have *NutriBot Premium*.\nEnjoy unlimited food analyses!`,
  upgrade_invoice_title: `NutriBot Premium`,
  upgrade_invoice_description: `Unlimited food photo analyses. No daily limits.`,
};

module.exports = t;
