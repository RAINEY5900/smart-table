import {sortMap} from "../lib/sort.js";

/**
 * Инициализация сортировки
 * @param {HTMLElement[]} columns - Кнопки сортировки колонок
 * @returns {Function}
 */
export function initSorting(columns) {
    /**
     * Формирует параметр сортировки и добавляет его к объекту запроса
     * @param {Object} query - Текущий объект параметров запроса
     * @param {Object} state - Состояние таблицы
     * @param {HTMLButtonElement?} action - Нажатая кнопка действия
     * @returns {Object}
     */
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            action.dataset.value = sortMap[action.dataset.value];
            field = action.dataset.field;
            order = action.dataset.value;

            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            columns.forEach(column => {
                if (column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        const sort = (field && order !== 'none') ? `${field}:${order}` : null;
        return sort ? Object.assign({}, query, { sort }) : query;
    };
}
