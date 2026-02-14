import {cloneTemplate} from "../lib/utils.js";

/**
 * Инициализирует таблицу и вызывает коллбэк при любых изменениях и нажатиях на кнопки
 *
 * @param {Object} settings
 * @param {(action: HTMLButtonElement | undefined) => void} onAction
 * @returns {{container: Node, elements: *, render: render}}
 */
export function initTable(settings, onAction) {
    const {tableTemplate, rowTemplate, before, after} = settings;
    const root = cloneTemplate(tableTemplate);

    //вывести дополнительные шаблоны до и после таблицы
    before.reverse().forEach((el)=> {
        root[el] = cloneTemplate(el);
        root.container.prepend(root[el].container);
    })
    after.forEach((el) => {
        root[el] = cloneTemplate(el);
        root.container.append(root[el].container);
    })

    //обработать события и вызвать onAction()
    root.container.addEventListener('change', (e) =>{
        onAction()});

    root.container.addEventListener('reset', (e) => {
        setTimeout(onAction)}
    );


    root.container.addEventListener('submit', (e) => {
        e.preventDefault();
        onAction(e.submitter);
    });

    // преобразовать данные в строки таблицы по шаблону
    const render = (data) => {
        const nextRows = data.map(item => { 
            const row = cloneTemplate(rowTemplate);
            Object.keys(item).forEach(key => {
                if (Object.keys(row.elements).includes(key)) {
                   row.elements[key].textContent = item[key]
                } 
            })
            return row.container
        });
        root.elements.rows.replaceChildren(...nextRows);
    }

    return {...root, render};
}