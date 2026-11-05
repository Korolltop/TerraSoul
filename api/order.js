// api/order.js
export default async function handler(req, res) {
    // Разрешаем GitHub Pages обращаться к нашему серверу (CORS)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    try {
        const orderData = req.body;

        // Адрес вашей 1С:УНФ (публичный URL или линк от 1С:Фреш / линк из публикации)
        // Пример для опубликованной базы: 'https://имя_сервера/имя_базы/hs/site_api/v1/order'
        const url1C = 'https://ВАШ_АДРЕС_1С/hs/site_api/v1/order'; 

        // Авторизация в 1С (Логин:Пароль пользователя 1С в формате Base64)
        // Замените "Пользователь:Пароль" на ваши данные
        const authHeader = 'Basic ' + Buffer.from('Логин1С:Пароль1С').toString('base64');

        // Перенаправляем заказ в 1С
        const response1C = await fetch(url1C, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (!response1C.ok) {
            throw new Error(`1С ответила ошибкой: ${response1C.status}`);
        }

        return res.status(200).json({ success: true, message: 'Заказ успешно передан в 1С!' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
