const { parentPort, isMainThread } = require('worker_threads');
const axios = require('axios');

if (!isMainThread) {
    const fetchItems = async () => {
        try {
            const [responseNonTradable, responseTradable] = await Promise.all([
                axios.get('https://api.skinport.com/v1/items', {
                    params: { app_id: 730, currency: 'EUR', tradable: 0 },
                    headers: { 'Accept-Encoding': 'gzip' }
                }),
                axios.get('https://api.skinport.com/v1/items', {
                    params: { app_id: 730, currency: 'EUR', tradable: 1 },
                    headers: { 'Accept-Encoding': 'gzip' }
                })
            ]);

            const nonTradableItems = responseNonTradable.data;
            const tradableItems = responseTradable.data;

            // Создание массива объектов с нужными данными
            const items = nonTradableItems.map((item, index) => ({
                name: item.market_hash_name,
                min_price_non_tradable: item.min_price,
                min_price_tradable: tradableItems[index]?.min_price || null
            }));

            // Отправляем собранные данные в родительский поток
            parentPort.postMessage(JSON.stringify(items)); // Отправляем как JSON-строку
            parentPort.postMessage(null); // Сообщаем о завершении
        } catch (error) {
            parentPort.postMessage(JSON.stringify({ error: 'Failed to fetch items', details: error.message }));
        }
    };

    fetchItems();
}