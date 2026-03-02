/**
 * Инициализация поиска
 * @param {string} searchField - Имя поля поиска в state
 * @returns {Function}
 */
export function initSearching(searchField) {
    /**
     * Добавляет параметр поиска к объекту запроса, если поле не пустое
     * @param {Object} query - Текущий объект параметров запроса
     * @param {Object} state - Состояние таблицы
     * @param {HTMLButtonElement?} action - Нажатая кнопка действия
     * @returns {Object}
     */
    return (query, state, action) => {
        return state[searchField] ? Object.assign({}, query, {
            search: state[searchField]
        }) : query;
    };
}
