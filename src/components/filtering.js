/**
 * Инициализация фильтрации
 * @param {Object} elements - DOM-элементы фильтра
 * @returns {{ applyFiltering: Function, updateIndexes: Function }}
 */
export function initFiltering(elements) {
    /**
     * Заполняет выпадающие списки значениями из индексов
     * @param {Object} elements - DOM-элементы фильтра
     * @param {Object} indexes - Объект с массивами значений для каждого select
     */
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            elements[elementName].append(...Object.values(indexes[elementName]).map(name => {
                const el = document.createElement('option');
                el.textContent = name;
                el.value = name;
                return el;
            }));
        });
    };

    /**
     * Формирует параметры фильтрации и добавляет их к объекту запроса
     * @param {Object} query - Текущий объект параметров запроса
     * @param {Object} state - Состояние таблицы
     * @param {HTMLButtonElement?} action - Нажатая кнопка действия
     * @returns {Object}
     */
    const applyFiltering = (query, state, action) => {
        if (action && action.name === 'clear') {
            const parent = action.parentElement;
            const input = parent.querySelector('input');
            input.value = '';
            state[action.dataset.field] = '';
        }

        const filter = {};
        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                if (['INPUT', 'SELECT'].includes(elements[key].tagName) && elements[key].value) {
                    filter[`filter[${elements[key].name}]`] = elements[key].value;
                }
            }
        });

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}
