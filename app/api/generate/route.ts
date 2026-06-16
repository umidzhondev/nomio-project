import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { prompt, type } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'API key is missing in .env' }, { status: 500 });
        }
        // Tizimli ko'rsatmalarni shu ko'rinishda yangilang:
        // Tizimli ko'rsatmalarni shu ko'rinishda yangilang:

        let systemInstruction = "Вы — профессиональный редактор. Напишите ОДНО короткое, лаконичное и привлекательное предложение-описание (subtitle) для статьи, основываясь на заголовке. Описание должно быть не длиннее 10-15 слов. КРИТИЧЕСКИ ВАЖНО: пишите ответ СТРОГО на том языке, на котором написан сам заголовок (если заголовок на узбекском — пишите на узбекском, если на русском — на русском). Возвращайте только сам текст описания, БЕЗ кавычек, БЕЗ звезд (*), БЕЗ форматирования markdown и БЕЗ вводных слов.";

        if (type === 'text') {
            systemInstruction = "Вы — эксперт по написанию статей. Напишите подробную, качественную и интересную статью с красивой структурой и абзацами на основе предоставленной темы. КРИТИЧЕСКИ ВАЖНО: пишите текст СТРОГО на том языке, на котором написана тема/заголовок (если тема на узбекском — пишите на узбекском, если на русском — на русском). Пишите чистый текст: НЕ используйте markdown разметку, НЕ используйте жирный текст со звездами (**текст**), НЕ используйте списки со звездами. Только чистые абзацы текста.";
        }
        // 2026-yil standarti: v1 versiyasi va gemini-2.5-flash modeli ulandi
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `${systemInstruction}\n\nТема/Заголовок: ${prompt}` }]
                    }]
                })
            }
        );

        const data = await response.json();

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            console.error("Gemini API Error Response:", data);
            return NextResponse.json({ error: 'AI generation failed', details: data }, { status: 500 });
        }

        return NextResponse.json({ text: generatedText.trim() });
    } catch (error: any) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}