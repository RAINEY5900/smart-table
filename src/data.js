import {makeIndex} from "./lib/utils.js";

const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

/**
 * Инициализирует данные из локального датасета (синхронная версия для первичного рендера)
 * @param {Object} sourceData - Исходный датасет
 * @returns {{ sellers: Object, customers: Object, data: Array }}
 */
export function initData(sourceData) {
    const sellers = makeIndex(sourceData.sellers, 'id', v => `${v.first_name} ${v.last_name}`);
    const customers = makeIndex(sourceData.customers, 'id', v => `${v.first_name} ${v.last_name}`);
    const data = sourceData.purchase_records.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id],
        customer: customers[item.customer_id],
        total: item.total_amount
    }));
    return {sellers, customers, data};
}

/**
 * Инициализация API для работы с данными на сервере
 * @returns {{ getIndexes: Function, getRecords: Function }}
 */
export function initServerApi() {
    /** @type {Object} Кешированные данные о продавцах (индекс id -> полное имя) */
    let sellers;
    /** @type {Object} Кешированные данные о покупателях (индекс id -> полное имя) */
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
            const [sellersRaw, customersRaw] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => res.json()),
                fetch(`${BASE_URL}/customers`).then(res => res.json()),
            ]);
            sellers = makeIndex(sellersRaw, 'id', v => `${v.first_name} ${v.last_name}`);
            customers = makeIndex(customersRaw, 'id', v => `${v.first_name} ${v.last_name}`);
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
