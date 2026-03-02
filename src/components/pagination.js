import {getPages} from "../lib/utils.js";

/**
 * Инициализация пагинации
 * @param {{ pages: HTMLElement, fromRow: HTMLElement, toRow: HTMLElement, totalRows: HTMLElement }} elements
 * @param {Function} createPage - Функция создания кнопки страницы
 * @returns {{ applyPagination: Function, updatePagination: Function }}
 */
export const initPagination = ({pages, fromRow, toRow, totalRows}, createPage) => {
    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();

    /** @type {number} Количество страниц при последней отрисовке */
    let pageCount;

    /**
     * Формирует параметры пагинации и добавляет их к объекту запроса
     * @param {Object} query - Текущий объект параметров запроса
     * @param {Object} state - Состояние таблицы
     * @param {HTMLButtonElement?} action - Нажатая кнопка действия
     * @returns {Object}
     */
    const applyPagination = (query, state, action) => {
        const limit = state.rowsPerPage;
        let page = state.page;

        if (action)
            switch(action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount ?? 1, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount ?? 1;
                    break;
            }

        return Object.assign({}, query, { limit, page });
    };

    /**
     * Перерисовывает пагинатор после получения данных с сервера
     * @param {number} total - Общее количество записей
     * @param {{ page: number, limit: number }} params - Параметры текущего запроса
     */
    const updatePagination = (total, { page, limit }) => {
        pageCount = Math.ceil(total / limit);

        const visiblePages = getPages(page, pageCount, 5);
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === page);
        }));

        fromRow.textContent = (page - 1) * limit + 1;
        toRow.textContent = Math.min(page * limit, total);
        totalRows.textContent = total;
    };

    return {
        updatePagination,
        applyPagination
    };
};
