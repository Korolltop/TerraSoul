import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Метод не поддерживается' });

    try {
        const orderData = req.body;
        
        // Генерируем уникальный ID для заказа и добавляем дату
        orderData.id = 'ord_' + Math.random().toString(36).substr(2, 9);
        orderData.createdAt = new Date().toISOString();

        // Добавляем заказ в список с именем "terrasoul_orders" в базе данных
        await kv.rpush('terrasoul_orders', JSON.stringify(orderData));

        return res.status(200).json({ success: true, message: 'Заказ принят на сервере!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
