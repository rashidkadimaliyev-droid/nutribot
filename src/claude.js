const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SYSTEM_PROMPT = `Ты — профессиональный нутрициолог-аналитик. Твоя задача — анализировать фото еды и определять:
1. Название блюда/продукта
2. Примерный вес порции в граммах
3. Калорийность (ккал)
4. Белки (г)
5. Жиры (г)
6. Углеводы (г)

ПРАВИЛА:
- Отвечай ТОЛЬКО в формате JSON, без markdown, без backticks
- Если на фото несколько блюд — разбей на отдельные позиции
- Если не можешь точно определить — дай лучшую оценку
- Вес оценивай по визуальному размеру порции относительно тарелки
- Используй стандартные данные КБЖУ для определённых продуктов
- Отвечай на русском языке

ФОРМАТ ОТВЕТА (строго JSON):
{
  "items": [
    {
      "name": "Название блюда",
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
  "comment": "Краткий комментарий о блюде (1-2 предложения)"
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
