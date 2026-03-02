import './fonts/ys-display/fonts.css'
import './style.css'

import {data as sourceData} from "./data/dataset_1.js";

import {initData, initServerApi} from "./data.js";
import {processFormData} from "./lib/utils.js";

import {initTable} from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";


// Локальные данные для первичного синхронного рендера
const {data, ...indexes} = initData(sourceData);

// Серверное API для всех последующих запросов
const api = initServerApi();

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
    if (totalTo !== '' && !isNaN(totalToNum))
        total[1] = totalToNum;

    return {
        ...state,
        rowsPerPage: rowsPerPageInt,
        page: pageInt,
        total,
    };
}

/**
 * Перерисовка состояния таблицы через серверный API
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

// инициализация компонентов
const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
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

// Первичный синхронный рендер из локального датасета
updateIndexes(sampleTable.filter.elements, {
    searchBySeller: indexes.sellers
});
updatePagination(data.length, { limit: 10, page: 1 });
sampleTable.render(data.slice(0, 10));


/**
 * Инициализация серверного API: загрузка индексов в кеш и первый серверный рендер
 */
async function init() {
    await api.getIndexes();
}

init().then(render);
