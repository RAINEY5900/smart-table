import './fonts/ys-display/fonts.css'
import './style.css'

import {initData} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";


const api = initData();

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const { rowsPerPage, page, totalFrom, totalTo, ...state } = processFormData(new FormData(sampleTable.container));
    const rowsPerPageInt = parseInt(rowsPerPage);
    const pageInt = parseInt(page ?? 1);
    const total = [null,  null];
    const totalFromNum = Number(totalFrom);
    if (totalFrom !== '' && !isNaN(totalFromNum))
        total[0] = totalFromNum;
    const totalToNum = Number(totalTo);
    if (totalTo !== '' && !isNaN(totalTo))
        total[1] = totalToNum;

    return {
        ...state,
        rowsPerPage: rowsPerPageInt,
        page: pageInt,
        total,
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState();
    let query = {};

    query = applySearching(query, state, action);
    query = applyFiltering(query, state, action);
    query = applySorting(query, state, action);
    query = applyPagination(query, state, action);

    const { total, items } = await api.getRecords(query);

    updatePagination(total, query);
    sampleTable.render(items);
}

const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page,
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

const applySearching = initSearching('search');


const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

/**
 * Инициализация приложения: получение индексов и первый рендер
 */
async function init() {
    const indexes = await api.getIndexes();

    updateIndexes(sampleTable.filter.elements, {
        searchBySeller: indexes.sellers
    });
}

init().then(render);
