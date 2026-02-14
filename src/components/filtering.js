import { createComparison, defaultRules } from "../lib/compare.js";

//  — настроить компаратор
const compare = createComparison(defaultRules);

export function initFiltering(elements, indexes) {
    // заполнить выпадающие списки опциями
    // Получаем ключи из объекта
    Object.keys(indexes).forEach((elementName) => {
        // Перебираем по именам
        elements[elementName].append(
            // в каждый элемент добавляем опции
            ...Object.values(indexes[elementName]) // формируем массив имён, значений опций
                .map((name) => {
                    // используйте name как значение и текстовое содержимое
                    const opt = document.createElement("option");
                    opt.value = name;
                    opt.textContent = name;
                    return opt;
                }),
        );
    });

    return (data, state, action) => {
        // — обработать очистку поля
        if (action && action.name === "clear") {
            console.log("action" + action.name);
            const fieldName = action.dataset.field;
            const parent = action.parentElement;
            parent.querySelector(`input[name = ${fieldName}]`).value = "";
            state[fieldName] = "";
        }

        //  отфильтровать данные используя компаратор
        return data.filter((row) => compare(row, state));
    };
}
