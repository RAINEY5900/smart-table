import { rules, createComparison } from "../lib/compare.js";

export function initSearching(searchField) {
    // настроить компаратор
    const defRules = ["skipEmptyTargetValues"];
    const cusRules = [
        rules.searchMultipleFields(
            searchField,
            ["date", "customer", "seller"],
            false,
        ),
    ];

    const compare = createComparison(defRules, cusRules);

    return (data, state, action) => {
        //  применить компаратор
        return data.filter((row) => compare(row, state));
    };
}
