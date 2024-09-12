import { domCreate, domQueryById } from "../../dom/query.js";
import { Column } from "../UI/column.js";
import { MondoBigH3Text } from "../UI/mondo_text.js";
import { addClasslist } from "../utils/stylus.js";

const printTableStyle = '* { font-family: arial; padding: 5px; } table { border: 1px solid grey; width: 100%; text-align: start; border-collapse: collapse; } tr, td { border: 1px solid grey; } thead, tfoot { font-weight: 300; }';

/**
 * prints an HTML content using `printJS` api
 * 
 * @param {string} tableId 
 * @param {string} heading
 */
/**
 * prints an HTML content using `printJS` api
 *
 * @param {string} tableId
 * @param {string} heading
 */
export class PDFPrintButton {

    static printingHeading = '';

    constructor(tableId) {
        const printPdfButton = domCreate('i');
        printPdfButton.title = 'print';
        addClasslist(printPdfButton, ['bi', 'bi-printer']);

        printPdfButton.onclick = function (ev) {
            const table = domQueryById(tableId);
            if (!tableId || !table) {
                return;
            }

            const printElId = `print - ${tableId} `;
            const el = domQueryById(printElId);

            // remove any pre-existing print element
            if (el) { document.body.removeChild(el); }

            let headingEl = MondoBigH3Text({ 'text': PDFPrintButton.printingHeading ? `${PDFPrintButton.printingHeading} `.toUpperCase() : '' });
            const column = Column({ 'children': [headingEl, table.cloneNode(true)] });
            column.id = printElId;

            // hide the `print content` element
            column.style.zIndex = '-10';
            document.body.appendChild(column);

            printJS({ printable: column.innerHTML, type: 'raw-html', 'style': printTableStyle });
        };

        return printPdfButton;
    }
}


/**
 * exports a table or JSON data to a workbook
 * @param {string?} tableId id of the exportable table
 */
export function ExcelExportButton(tableId, json) {
    const iconButton = domCreate('i');
    addClasslist(iconButton, ['bi', 'bi-file-earmark-excel']);

    iconButton.onclick = function (ev) {
        if (!tableId && !json) {
            return;
        }
        const fileName = `${prompt('enter file name') || 'data'}.xlsx`;
        if (tableId) {
            const table = domQueryById(tableId);
            if (table) {
                const workbook = XLSX.utils.table_to_book(table, { 'sheet': 'sheet 1' });
                XLSX.writeFile(workbook, fileName);
            }
        }

        if (json && typeof json === 'object') {
            const worksheet = XLSX.utils.json_to_sheet(json);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

            XLSX.writeFile(workbook, fileName);
        }
    }

    return iconButton;
}