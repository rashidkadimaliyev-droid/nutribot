const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SYSTEM_PROMPT = `Ты — профессиональный нутрициолог-аналитик со специализацией на турецкой, азербайджанской и кавказской кухне. Твоя задача — анализировать фото еды и определять:
1. Название блюда/продукта
2. Примерный вес порции в граммах
3. Калорийность (ккал)
4. Белки (г)
5. Жиры (г)
6. Углеводы (г)

ЭКСПЕРТИЗА ПО КУХНЯМ:

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
- При виде плова в казане или на большой тарелке — определи тип по гарниру и мясу
- Кутабы отличай от блинов: тонкие, хрустящие, полукруглые
- Долму в виноградных листьях отличай от голубцов: меньше размером, кислее
- Хинкали — крупные, с хвостиком; манты — меньше, без хвостика
- Бёрек — слоёное тесто; гёзлеме — тонкое тесто на сковороде
- При неясном блюде — укажи наиболее вероятное название с пометкой (предположительно)

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

async function analyzeFood(imageBase64, mediaType = 'image/jpeg') {
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
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
              text: 'Проанализируй это блюдо. Определи КБЖУ.'
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

function calculateNorms(gender, age, weight, height, goal) {
  // Mifflin-St Jeor formula
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // Activity multiplier (moderate)
  let tdee = bmr * 1.4;

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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: `Ты нутрициолог. Пользователь (${userProfile.gender === 'male' ? 'мужчина' : 'женщина'}, ${userProfile.weight}кг, цель: ${userProfile.goal === 'lose' ? 'похудение' : userProfile.goal === 'gain' ? 'набор массы' : 'поддержание'}).

Сегодня съел: ${todayTotals.total_calories} ккал (Б:${todayTotals.total_protein}г Ж:${todayTotals.total_fat}г У:${todayTotals.total_carbs}г)
Норма на день: ${norms.calories} ккал (Б:${norms.protein}г Ж:${norms.fat}г У:${norms.carbs}г)
Осталось: ${remaining.calories} ккал (Б:${remaining.protein}г Ж:${remaining.fat}г У:${remaining.carbs}г)

Дай короткую рекомендацию (2-3 предложения): что лучше съесть на следующий приём пищи, учитывая баланс. Отвечай дружелюбно и по-русски.`
        }
      ]
    });

    return response.content[0].text;
  } catch (error) {
    console.error('Recommendation error:', error.message);
    return null;
  }
}

module.exports = { analyzeFood, calculateNorms, getDietRecommendation };
