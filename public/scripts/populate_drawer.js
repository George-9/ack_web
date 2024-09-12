import { Column } from "./components/UI/column.js";
import { MondoBigH3Text, MondoText } from "./components/UI/mondo_text.js";
import { Row } from "./components/UI/row.js";
import { VerticalScrollView } from "./components/UI/vertical_scrollview.js";
import { addClasslist, StyleView } from "./components/utils/stylus.js";
import { domCreate, domQueryAll } from "./dom/query.js";

export class DrawerMenu {
    heading = '';
    subMenus = [];
    groupClass = '';
    isShowingMenus = false;

    /**
     * A group of menus with related actions
     * 
     * @param {string} heading the heading of this menu category
     * @param {Menu []} subMenus a list of submenus in this group
     */
    constructor(heading = '', groupClass, subMenus, isShowingMenus) {
        this.heading = heading;
        this.groupClass = groupClass;
        this.subMenus = subMenus;
        this.isShowingMenus = isShowingMenus;
    }
}

export class Menu {
    text;
    icon;
    /**
     * callback for when this menu is clicked
     */
    action;
    groupClass;

    subMenus;
    /**
     * 
     * @param {string} text title of this main menu
     * @param {string} icon bootstrap class of this menu's icon
     * @param {string} groupClass class that helps collapse it's by the parent
     * @param {Function} action the onclick property assgnable action 
     * @param {SubMenu[]} subMenus a list of submenus that can appear beneath it
     */
    constructor(text, icon, groupClass, action, subMenus) {
        this.text = text;
        this.icon = icon;
        this.action = action;
        this.groupClass = groupClass;
        this.subMenus = subMenus || []
    }

    get view() {
        const anchor = domCreate('a');
        addClasslist(anchor, ['cursor-pointer']);

        const text = MondoText({ 'styles': [{ 'font-size': '16px' }], 'text': this.text.toLowerCase() });
        const icon = domCreate('i');
        addClasslist(icon, ['bi', this.icon]);

        const row = Row({ 'children': [icon, text], classlist: ['a-c', 'just-start', 'm-margin-top'] });
        row.style.width = '80%'
        anchor.appendChild(row);
        anchor.onclick = this.action;

        addClasslist(anchor, [this.groupClass, 'disp-none']);

        const ref = this;
        const column = Column({ 'children': [] });
        for (let i = 0; i < ref.subMenus.length; i++) {
            column.appendChild(ref.subMenus[i].view);
        }

        return { anchor: anchor, 'sub_menus': ref.subMenus };
    }
}

export class SubMenu {
    title;
    viewClass;
    callback;
    constructor(title, viewClass, callback) {
        this.title = title || new Function();
        this.viewClass = viewClass;
        this.callback = callback || new Function();
    }

    get view() {
        const anchor = domCreate('a');
        anchor.innerText = this.title.toLowerCase();
        anchor.onclick = this.callback;
        StyleView(anchor, [{ 'fonst-size': '12px' }, { 'font-weight': 'bold' }, { 'color': 'white' }]);
        addClasslist(anchor, [this.viewClass, 'c-p', 'disp-none']);

        const row = Row({
            'classlist': ['f-w', 'just-end'],
            'styles': [{ 'width': 'max-content' }, { 'min-width': '200px' }],
            'children': [anchor]
        })

        return row;
    }
}

/**
 * populates the drawer with views
 * 
 * @param {HTMLElement | Node} drawer the drawer to populate
 * @param {DrawerMenu[]} drawerMenus array to populate the drawer
 */
export function populateDrawer(drawer, drawerMenus) {

    for (let i = 0; i < drawerMenus.length; i++) {
        const drawerMainMenu = drawerMenus[i];
        const indicatorIcon = domCreate('i');
        let closedClass = 'bi-caret-down', openClassClass = 'bi-caret-up';
        addClasslist(indicatorIcon, ['bi', closedClass]);
        const menusCategoryTitle = Row({
            'classlist': ['m-pad'],
            'children': [
                indicatorIcon,
                MondoBigH3Text({
                    'text': drawerMainMenu.heading.toLowerCase(),
                    'styles': [{ 'font-weight': 'bold' }, { 'color': 'white' }],
                })
            ],
        });

        addClasslist(menusCategoryTitle, ['c-p']);

        let column = Column({
            'classlist': ['f-w', 'fx-col'],
            'styles': [{ 'padding-top': '10px' }],
            'children': [menusCategoryTitle],
        });

        if ((i + 1) === drawerMenus.length) {
            // pad the last menu
            column.style.paddingBottom = '5vh';
        }

        menusCategoryTitle.onclick = function (ev) {
            ev.preventDefault();
            const mainSubMenus = domQueryAll(`.${drawerMainMenu.groupClass}`);

            if (drawerMainMenu.isShowingMenus) {
                mainSubMenus.forEach(function (m) { m.classList.add('disp-none'); });
                indicatorIcon.classList.remove(openClassClass);
                indicatorIcon.classList.add(closedClass);
                drawerMainMenu.isShowingMenus = false;
            } else {
                mainSubMenus.forEach(function (m) { m.classList.remove('disp-none'); });
                indicatorIcon.classList.remove(closedClass);
                indicatorIcon.classList.add(openClassClass);
                drawerMainMenu.isShowingMenus = true;
            }
        };


        for (let j = 0; j < drawerMainMenu.subMenus.length; j++) {
            const subMenu = drawerMainMenu.subMenus[j];
            column.appendChild(subMenu.view.anchor);

            // ADD SUBMENUS
            for (let i = 0; i < subMenu.view.sub_menus.length; i++) {
                const submenu = subMenu.view.sub_menus[i];
                column.appendChild(submenu.view)
            }
        }
        drawer.appendChild(column);
    }
}
