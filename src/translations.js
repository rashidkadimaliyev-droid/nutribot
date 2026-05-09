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
    `👨‍🍳 /recipe [dish] — full recipe with macros\n` +
    `💬 AI chat powered by Claude Sonnet\n\n` +
    `❓ /help — this help message`,

  // onboarding buttons
  btn_male: `👨 Male`,
  btn_female: `👩 Female`,
  btn_goal_lose: `🔥 Lose weight`,
  btn_goal_gain: `💪 Gain muscle`,
  btn_goal_recomp: `🔄 Recomposition`,
  btn_goal_maintain: `⚖️ Maintain weight`,

  ask_activity: `🏃 What's your activity level?`,
  btn_activity_sedentary: `🪑 Sedentary (desk job)`,
  btn_activity_light: `🚶 Lightly active (1-3x/week)`,
  btn_activity_moderate: `🏋️ Moderately active (3-5x/week)`,
  btn_activity_active: `⚡ Very active (6-7x/week)`,

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

  weekly_report_header: `📊 *Your Weekly Report*\n\n`,
  weekly_report_error: null,

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

  chat_limit_reached:
    `💬 You've used all 3 free chat messages for today.\n\n` +
    `⭐ Upgrade to Premium for unlimited AI nutrition chat!`,

  tip_premium_only:
    `💡 *Nutrition tips are a Premium feature.*\n\n` +
    `🆓 Free plan includes 3 photo analyses/day.\n` +
    `👑 Premium unlocks unlimited analyses + tips + AI chat.\n\n` +
    `Upgrade for 100 ⭐ Stars/month:`,

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
  shoplist_pro_only: `🛒 *Shopping lists are a Pro feature.*\n\nUpgrade to Pro for shopping lists, advanced recipes, and Claude Sonnet chat:`,
  shoplist_error: `❌ Couldn't generate a shopping list. Please try again.`,

  recipe_usage: `👨‍🍳 Usage: /recipe <dish name>\nExample: /recipe chicken stir-fry`,
  recipe_generating: (name) => `👨‍🍳 Finding recipe for *${name}*...`,
  recipe_header: (name) => `👨‍🍳 *Recipe: ${name}*\n\n`,
  recipe_pro_only: `👨‍🍳 *Recipes are a Pro feature.*\n\nUpgrade to Pro for full recipes with macros and Claude Sonnet chat:`,
  recipe_error: `❌ Couldn't generate the recipe. Please try again.`,

  upgrade_already_premium: `👑 You already have Premium! Enjoy unlimited analyses.`,
  upgrade_success: `🎉 *Payment successful!*\n\n👑 You now have *NutriBot Premium*.\nEnjoy unlimited food analyses!`,
  upgrade_invoice_title: `NutriBot Premium`,
  upgrade_invoice_description: `Unlimited food photo analyses. No daily limits.`,
};

module.exports = t;
