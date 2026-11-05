import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Метод должен быть строго GET
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    try {
        // Извлекаем абсолютно все элементы из списка "terrasoul_orders"
        const rawOrders = await kv.lrange('terrasoul_orders', 0, -1);

        // Переводим строки обратно в формат JSON объектов
        const orders = rawOrders.map(item => typeof item === 'string' ? JSON.parse(item) : item);

        // Очищаем список в базе данных, так как 1С их сейчас заберёт
        await kv.del('terrasoul_orders');

        // Отдаем массив заказов в 1С
        return res.status(200).json(orders);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
