const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

/**
 * Инициализация API для работы с данными на сервере
 * @returns {{ getIndexes: Function, getRecords: Function }}
 */
export function initData() {
    /** @type {Object} Кешированные данные о продавцах */
    let sellers;
    /** @type {Object} Кешированные данные о покупателях */
    let customers;
    /** @type {Object} Результат последнего запроса */
    let lastResult;
    /** @type {string} Строка параметров последнего запроса */
    let lastQuery;

    /**
     * Преобразует записи с сервера в формат таблицы
     * @param {Array} data - Массив записей с сервера
     * @returns {Array}
     */
    const mapRecords = (data) => data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));

    /**
     * Получает индексы продавцов и покупателей с сервера (с кешированием)
     * @returns {Promise<{ sellers: Object, customers: Object }>}
     */
    const getIndexes = async () => {
        if (!sellers || !customers) {
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
        }

        return { sellers, customers };
    };

    /**
     * Получает записи о продажах с сервера по заданным параметрам
     * @param {Object} query - Параметры запроса (фильтрация, сортировка, пагинация)
     * @param {boolean} [isUpdated=false] - Принудительный запрос без кеша
     * @returns {Promise<{ total: number, items: Array }>}
     */
    const getRecords = async (query, isUpdated = false) => {
        const qs = new URLSearchParams(query);
        const nextQuery = qs.toString();

        if (lastQuery === nextQuery && !isUpdated) {
            return lastResult;
        }

        const response = await fetch(`${BASE_URL}/records?${nextQuery}`);
        const records = await response.json();

        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };

        return lastResult;
    };

    return {
        getIndexes,
        getRecords
    };
}
