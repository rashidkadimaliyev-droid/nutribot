const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const MODEL_VISION = 'claude-sonnet-4-20250514';
const MODEL_CHAT = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `Ты — профессиональный нутрициолог-аналитик со специализацией на русской, среднеазиатской, грузинской, турецкой, азербайджанской и кавказской кухне. Твоя задача — анализировать фото еды и определять:
1. Название блюда/продукта
2. Примерный вес порции в граммах
3. Калорийность (ккал)
4. Белки (г)
5. Жиры (г)
6. Углеводы (г)

ЭКСПЕРТИЗА ПО КУХНЯМ:

Русская кухня:
- Супы: борщ (~60 ккал/100г, со сметаной +20 ккал), щи (~40 ккал/100г), солянка мясная (~80 ккал/100г), рассольник (~45 ккал/100г), уха (~35 ккал/100г)
- Мясные блюда: пельмени (~220 ккал/100г варёные), голубцы (~130 ккал/100г), котлеты (~220 ккал/100г), бефстроганов (~175 ккал/100г), холодец (~80 ккал/100г)
- Салаты: оливье (~190 ккал/100г), шуба (~120 ккал/100г), винегрет (~80 ккал/100г)
- Выпечка и гарниры: блины (~200 ккал/100г, со сметаной +50 ккал), драники (~200 ккал/100г), сырники (~210 ккал/100г), пироги (~280 ккал/100г)
- Молочное: сметана 20% (~200 ккал/100г), творог 5% (~121 ккал/100г), кефир (~51 ккал/100мл)

Среднеазиатская кухня (узбекская, казахская, киргизская, таджикская):
- Плов (~280-320 ккал/100г): узбекский (рис, баранина/говядина, морковь, лук, зира) — отличай от азербайджанского по виду: рис жёлтый от зирвака, морковь крупной соломкой
- Лагман (~180 ккал/100г): тянутая лапша с мясом (баранина/говядина), болгарским перцем, томатами, морковью, зеленью; подаётся с бульоном или без
- Манты (~180 ккал/100г): крупные изделия из пресного теста на пару, начинка — мясо с луком или тыква; отличай от хинкали — нет хвостика, форма приплюснутая
- Самса (~280 ккал/шт): треугольные или круглые пирожки из слоёного или пресного теста, запечённые в тандыре или духовке, начинка — мясо с луком или тыква
- Шурпа (~70 ккал/100г): наваристый суп с крупными кусками баранины и овощами (картофель, морковь, лук, перец)
- Бешбармак (~220 ккал/100г): широкая варёная лапша с бараниной/конининой и луком в бульоне, казахское блюдо
- Чучвара (~190 ккал/100г): мелкие пельмени в бульоне, узбекский аналог пельменей; меньше манты, подаётся в супе
- Ханум (~200 ккал/100г): рулет из теста на пару с начинкой из мяса или тыквы с луком; внешне — как большой рулет
- Самса (~280 ккал/шт): запечённые треугольные пирожки; горячие, с хрустящей корочкой
- Нон/лепёшка (~250 ккал/100г): круглая с узором в центре, из тандыра

Грузинская кухня:
- Хачапури по-аджарски (~480 ккал/шт): лодочка из теста с сыром и яйцом сверху; самый калорийный вид
- Хачапури по-имеретински (~320 ккал/шт): круглый, закрытый, сыр внутри
- Хачапури по-мегрельски (~380 ккал/шт): как имеретинский, но сыр и сверху
- Хинкали (~75-85 ккал/шт): мешочек из теста с мясным фаршем и бульоном внутри, хвостик не едят; крупнее пельменей, с рифлёным хвостиком
- Шкмерули (~320 ккал/100г): курица в сливочно-чесночном соусе, подаётся в кеци (глиняная сковорода)
- Оджахури (~280 ккал/100г): жареное мясо с картофелем и овощами на сковороде
- Лобио (~120 ккал/100г): тушёная фасоль с грецкими орехами, луком, специями и зеленью; подаётся в глиняном горшочке
- Чахохбили (~180 ккал/100г): тушёная курица в томатном соусе с луком и специями
- Сациви (~220 ккал/100г): курица или индейка в соусе из грецких орехов
- Харчо (~140 ккал/100г): острый суп из говядины с рисом и ткемали

Турецкая кухня:
- Кебабы: адана (жирный, ~280 ккал/100г), урфа, шиш (нежирный, ~180 ккал/100г), донер (220-280 ккал/100г), кофте (200-250 ккал/100г)
- Супы: чорба (мерджимек ~90 ккал/порция 300г), ишкембе, эзогелин, тархана
- Мезе: хумус (~160 ккал/100г), хайдари, джаджик, патлыджан салатası (~80 ккал/100г)
- Выпечка: симит (~280 ккал/шт), бёрек со шпинатом (~220 ккал/100г), бёрек с мясом (~260 ккал/100г), гёзлеме (~230 ккал/100г), пиде (~250 ккал/100г)
- Десерты: пахлава (~450 ккал/100г), кюнефе (~380 ккал/100г), рисовый пудинг сютлач (~120 ккал/100г), локма (~350 ккал/100г)
- Напитки: айран (~45 ккал/200мл), чай (0 ккал), турецкий кофе (~5 ккал)
- Прочее: лахмаджун (~220 ккал/шт), манты (~250 ккал/100г), ашуре (~180 ккал/100г)

Азербайджанская кухня:
- Пловы: шах-плов (с каурмой, ~320 ккал/порция), парча-доша (с бараниной, ~300 ккал/порция), сябзи-плов (с зеленью, ~280 ккал/порция), тас-кебаб плов
- Мясные блюда: люля-кебаб (~250 ккал/100г), тика-кебаб (шашлык ~200 ккал/100г), джыз-быз (потроха ~220 ккал/100г), долма виноградная (~180 ккал/100г), долма капустная (~160 ккал/100г)
- Супы: пити (в горшочке с бараниной, ~350 ккал/порция), довга (с мацони и зеленью, ~120 ккал/порция), хаш (~180 ккал/порция), бозбаш (~280 ккал/порция), кюфта-бозбаш (~320 ккал/порция)
- Выпечка: кутабы с мясом (~180 ккал/шт), кутабы с зеленью (~140 ккал/шт), кутабы с тыквой (~130 ккал/шт), тандырный хлеб (~230 ккал/100г)
- Десерты: шекербура (~120 ккал/шт), пахлава (~80 ккал/шт), гогал (~100 ккал/шт), шор-гогал
- Закуски: кюкю (зелёный омлет, ~160 ккал/100г), овдух, суджух (~420 ккал/100г)

Кавказская кухня (грузинская, армянская, дагестанская):
- Грузинские блюда: хачапури по-аджарски (~480 ккал/шт), хачапури по-имеретински (~320 ккал/шт), хинкали (~80 ккал/шт), сациви (~220 ккал/100г), чахохбили (~180 ккал/100г), харчо (~140 ккал/100г), лобиани (~280 ккал/100г), мцвади (шашлык ~200 ккал/100г)
- Армянские блюда: хаш (~150 ккал/порция), кюфта по-армянски (~230 ккал/100г), долма (~170 ккал/100г), бастурма (~240 ккал/100г), суджух (~400 ккал/100г), гата (~380 ккал/100г)
- Дагестанские блюда: хинкал аварский (~280 ккал/порция), чуду (~220 ккал/100г), курзе (~200 ккал/100г), урбеч (~550 ккал/100г)
- Общекавказское: шашлык из баранины (~220 ккал/100г), шашлык из свинины (~260 ккал/100г), ткемали (соус, ~50 ккал/100г)

ПРАВИЛА РАСПОЗНАВАНИЯ:
- Манты = крупные изделия из пресного теста с мясом, приготовленные на пару; форма приплюснутая, без хвостика
- Хинкали = мешочек с рифлёным хвостиком, тесто с бульоном внутри; крупнее пельменей
- Пельмени = маленькие, варёные в воде, форма полукруглая или "ушко"; мельче манты и хинкали
- Чучвара = очень мелкие пельмени, подаются в бульоне
- Плов = рис, обжаренный в зирваке (масло, лук, морковь, мясо), жёлтого или золотистого цвета; морковь видна
- Лагман = тянутая длинная лапша с густым мясо-овощным соусом (болгарский перец, томат, морковь)
- Самса = треугольные (реже круглые) запечённые пирожки с хрустящей корочкой
- Ханум = рулет из теста на пару, крупный, режется на куски
- Бешбармак = широкие квадратные куски лапши с мясом, подаётся на большом блюде
- Шурпа = прозрачный наваристый бульон с крупными кусками мяса и овощей
- Борщ — красный/бордовый цвет от свёклы; щи — без свёклы, светлее; солянка — тёмная, кисло-солёная, с оливками и лимоном
- Голубцы — капустные листья с фаршем; долма в листьях — меньше, виноградный лист
- Сырники — небольшие круглые оладьи из творога; блины — тонкие, большие, круглые; драники — из тёртого картофеля
- При виде плова в казане или на большой тарелке — определи тип по цвету, гарниру и мясу
- Кутабы отличай от блинов: тонкие, хрустящие, полукруглые
- Бёрек — слоёное тесто; гёзлеме — тонкое тесто на сковороде
- Белые куски рядом с овощами = скорее всего курица (грудка ~110 ккал/100г) или рыба (треска ~70 ккал/100г, лосось ~200 ккал/100г) — не игнорируй
- Миска или тарелка с белой/кремовой массой = рис варёный (~130 ккал/100г) или творог (~100-180 ккал/100г) — определи по текстуре (рис зернистый, творог однородный)
- Сканируй весь кадр: проверяй углы и края фото, все ёмкости на столе — ни одна тарелка не должна быть пропущена
- Если видишь несколько блюд — разбей каждое на отдельную позицию в items
- Если пользователь написал подпись к фото (например "300г, куриная грудка с рисом") — используй её как приоритетную информацию о блюде и весе
- При неясном блюде — укажи наиболее вероятное название с пометкой (предположительно)

КОНФИДЕНЦИАЛЬНОСТЬ:
- Никогда не упоминай Claude, Anthropic, GPT или любую AI-компанию — ты NutriBot
- Если пользователь спрашивает кто ты или какая модель — отвечай что ты NutriBot, умный помощник по питанию

ОБЩИЕ ПРАВИЛА:
- Отвечай ТОЛЬКО в формате JSON, без markdown, без backticks
- Если на фото несколько блюд — разбей на отдельные позиции
- Вес оценивай по визуальному размеру порции относительно тарелки/посуды
- Для хлеба, лепёшек, штучных изделий — считай типичную порцию
- Отвечай на русском языке, названия блюд давай на русском с оригинальным названием в скобках

ФОРМАТ ОТВЕТА (строго JSON):
{
  "items": [
    {
      "name": "Название блюда (оригинал)",
      "weight_g": 250,
      "calories": 380,
      "protein": 25,
      "fat": 15,
      "carbs": 35
    }
  ],
  "total": {
    "calories": 380,
    "protein": 25,
    "fat": 15,
    "carbs": 35
  },
  "comment": "Краткий комментарий о блюде, его особенностях и составе (1-2 предложения)"
}`;

async function analyzeFood(imageBase64, mediaType = 'image/jpeg', caption = null) {
  const userText = caption
    ? `Внимательно рассмотри ВСЁ фото целиком. Проверь КАЖДУЮ тарелку, миску, контейнер — даже на краях кадра. Ищи мясо, курицу, рыбу, рис, хлеб. НЕ ПРОПУСКАЙ белковые продукты.\n\nПользователь добавил подпись: "${caption}" — используй это как приоритетную информацию о блюде и весе.`
    : 'Внимательно рассмотри ВСЁ фото целиком. Проверь КАЖДУЮ тарелку, миску, контейнер — даже на краях кадра. Ищи мясо, курицу, рыбу, рис, хлеб. НЕ ПРОПУСКАЙ белковые продукты.';

  try {
    const response = await client.messages.create({
      model: MODEL_VISION,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: userText
            }
          ]
        }
      ]
    });

    const text = response.content[0].text;

    // Clean up response — remove markdown backticks if any
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const result = JSON.parse(cleaned);
    return { success: true, data: result };
  } catch (error) {
    console.error('Claude API error:', error.message);
    return { success: false, error: error.message };
  }
}

function calculateNorms(gender, age, weight, height, goal, activity = 'moderate') {
  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light:     1.375,
    moderate:  1.55,
    active:    1.725
  };
  const tdee = bmr * (activityMultipliers[activity] || 1.55);

  let calories, protein, fat, carbs;

  switch (goal) {
    case 'lose':
      calories = tdee - 400;
      protein = weight * 2;
      fat = weight * 0.8;
      carbs = (calories - protein * 4 - fat * 9) / 4;
      break;
    case 'gain':
      calories = tdee + 300;
      protein = weight * 2;
      fat = weight * 1;
      carbs = (calories - protein * 4 - fat * 9) / 4;
      break;
    case 'recomp':
      calories = tdee; // maintenance calories
      protein = weight * 2.2; // high protein for recomp
      fat = weight * 0.9;
      carbs = (calories - protein * 4 - fat * 9) / 4;
      break;
    default: // maintain
      calories = tdee;
      protein = weight * 1.6;
      fat = weight * 0.9;
      carbs = (calories - protein * 4 - fat * 9) / 4;
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(Math.max(carbs, 50))
  };
}

async function getDietRecommendation(userProfile, todayTotals, norms) {
  const remaining = {
    calories: norms.calories - todayTotals.total_calories,
    protein: norms.protein - todayTotals.total_protein,
    fat: norms.fat - todayTotals.total_fat,
    carbs: norms.carbs - todayTotals.total_carbs
  };

  try {
    const response = await client.messages.create({
      model: MODEL_CHAT,
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `You are a nutritionist in NutriBot app. Never mention Claude or Anthropic.
User: ${userProfile.gender === 'male' ? 'male' : 'female'}, ${userProfile.weight}kg, goal: ${userProfile.goal}, activity: ${userProfile.activity || 'moderate'}.
Eaten today: ${Math.round(todayTotals.total_calories)} kcal (P:${Math.round(todayTotals.total_protein)}g F:${Math.round(todayTotals.total_fat)}g C:${Math.round(todayTotals.total_carbs)}g)
Daily target: ${norms.calories} kcal (P:${norms.protein}g F:${norms.fat}g C:${norms.carbs}g)
Remaining: ${Math.round(remaining.calories)} kcal (P:${Math.round(remaining.protein)}g F:${Math.round(remaining.fat)}g C:${Math.round(remaining.carbs)}g)
${userProfile.activity === 'active' || userProfile.activity === 'moderate' ? 'User is physically active — prioritise protein for recovery.' : 'User is sedentary — focus on portion control and fibre.'}
Give a short recommendation (2-3 sentences): what to eat next, considering the balance. Be friendly. Reply in English.`
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Recommendation error:', error.message);
    return null;
  }
}

async function generateMealPlan(userProfile) {
  const goalMap = { lose: 'weight loss', gain: 'muscle gain', maintain: 'weight maintenance' };
  const prompt = `You are a professional nutritionist. Create a 7-day meal plan for a ${userProfile.gender === 'male' ? 'man' : 'woman'}, ${userProfile.age} years old, ${userProfile.weight}kg, ${userProfile.height}cm, goal: ${goalMap[userProfile.goal] || 'maintenance'}.
Daily targets: ${userProfile.calorie_norm} kcal, Protein: ${userProfile.protein_norm}g, Fat: ${userProfile.fat_norm}g, Carbs: ${userProfile.carb_norm}g.
Format: for each day list Breakfast, Lunch, Dinner, Snack with approximate calories. Keep it concise. Reply in English.`;

  try {
    const response = await client.messages.create({
      model: MODEL_VISION,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Meal plan error:', error.message);
    return null;
  }
}

async function generateShoppingList(userProfile) {
  const goalMap = { lose: 'weight loss', gain: 'muscle gain', maintain: 'weight maintenance' };
  const prompt = `You are a professional nutritionist. Generate a weekly grocery shopping list for a ${userProfile.gender === 'male' ? 'man' : 'woman'}, goal: ${goalMap[userProfile.goal] || 'maintenance'}, ${userProfile.calorie_norm} kcal/day.
Group items by category: Proteins, Vegetables & Fruits, Grains & Carbs, Dairy, Fats & Oils, Other.
Include approximate quantities for one person for 7 days. Reply in English.`;

  try {
    const response = await client.messages.create({
      model: MODEL_VISION,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Shopping list error:', error.message);
    return null;
  }
}

async function generateRecipe(recipeName, userProfile) {
  const prompt = `You are a professional nutritionist and chef. Provide a detailed recipe for "${recipeName}".
Include: ingredients with exact amounts (for 1 serving), step-by-step instructions, and full nutrition info per serving (calories, protein, fat, carbs).
${userProfile ? `The user's daily target is ${userProfile.calorie_norm} kcal — comment if this dish fits their goal (${userProfile.goal}).` : ''}
Reply in English.`;

  try {
    const response = await client.messages.create({
      model: MODEL_VISION,
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Recipe error:', error.message);
    return null;
  }
}

async function chatWithUser(userText, userProfile, todayTotals, isPro = false) {
  const goalMap = { lose: 'похудение', gain: 'набор массы', maintain: 'поддержание веса' };
  const genderMap = { male: 'мужчина', female: 'женщина' };

  const activityLabels = { sedentary: 'sedentary', light: 'lightly active', moderate: 'moderately active', active: 'very active' };

  let context = '';
  if (userProfile && userProfile.calorie_norm) {
    context = `User profile: ${genderMap[userProfile.gender] || 'unknown'}, ${userProfile.age || '?'} yo, ${userProfile.weight || '?'} kg, ${userProfile.height || '?'} cm, goal: ${goalMap[userProfile.goal] || 'unknown'}, activity: ${activityLabels[userProfile.activity] || 'moderate'}.
Daily target: ${userProfile.calorie_norm} kcal (P:${userProfile.protein_norm}g F:${userProfile.fat_norm}g C:${userProfile.carb_norm}g).`;
    if (todayTotals && todayTotals.meals > 0) {
      context += `\nEaten today: ${Math.round(todayTotals.total_calories)} kcal (P:${Math.round(todayTotals.total_protein)}g F:${Math.round(todayTotals.total_fat)}g C:${Math.round(todayTotals.total_carbs)}g).`;
    } else {
      context += '\nNothing eaten today yet.';
    }
  }

  try {
    const response = await client.messages.create({
      model: isPro ? MODEL_VISION : MODEL_CHAT,
      max_tokens: isPro ? 1000 : 600,
      system: `You are a friendly nutritionist assistant in the NutriBot app. Never mention Claude, Anthropic, GPT or any AI company — you are NutriBot. If asked what AI you are, say you're NutriBot's smart nutrition engine. Answer concisely (2-4 sentences), in English, without markdown headers. Use the user's profile context when available. If the question is off-topic, gently steer back to food and health.`,
      messages: [
        {
          role: 'user',
          content: context ? `${context}\n\nUser's question: ${userText}` : userText
        }
      ]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Chat error:', error.message);
    return null;
  }
}

async function generateWeeklyReport(user, thisWeek, lastWeek) {
  const avg = (rows, field) => rows.length ? rows.reduce((s, r) => s + r[field], 0) / rows.length : 0;

  const thisCalAvg = avg(thisWeek, 'total_calories');
  const lastCalAvg = avg(lastWeek, 'total_calories');
  const thisPAvg   = avg(thisWeek, 'total_protein');
  const lastPAvg   = avg(lastWeek, 'total_protein');

  const goalMap = { lose: 'weight loss', gain: 'muscle gain', maintain: 'maintenance', recomp: 'body recomposition' };
  const activityLabels = { sedentary: 'sedentary', light: 'lightly active', moderate: 'moderately active', active: 'very active' };

  const prompt = `You are a nutritionist in NutriBot. Never mention Claude or Anthropic.
Generate a weekly nutrition report comparing this week vs last week. Be encouraging and specific.

User: ${user.gender === 'male' ? 'male' : 'female'}, ${user.weight}kg, goal: ${goalMap[user.goal] || user.goal}, activity: ${activityLabels[user.activity] || 'moderate'}.
Daily targets: ${user.calorie_norm} kcal, Protein: ${user.protein_norm}g.

This week (${thisWeek.length} days logged):
- Avg calories/day: ${Math.round(thisCalAvg)} kcal (target: ${user.calorie_norm})
- Avg protein/day: ${Math.round(thisPAvg)}g (target: ${user.protein_norm}g)

Last week (${lastWeek.length} days logged):
- Avg calories/day: ${Math.round(lastCalAvg)} kcal
- Avg protein/day: ${Math.round(lastPAvg)}g

Write a 3-4 sentence report with: trend assessment (better/worse/same), what's going well, one specific improvement tip tailored to their goal and activity level. Reply in English.`;

  try {
    const response = await client.messages.create({
      model: MODEL_CHAT,
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }]
    });
    return response.content[0].text;
  } catch (error) {
    console.error('Weekly report error:', error.message);
    return null;
  }
}

module.exports = { analyzeFood, calculateNorms, getDietRecommendation, chatWithUser, generateMealPlan, generateShoppingList, generateRecipe, generateWeeklyReport };
