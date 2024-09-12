import { domQuery, domQueryAll } from "../../dom/query.js";
import { work } from "../../dom/worker.js";

let drawerIsShowing = false, drawerToggleElements, drawer;

work(Main)

function Main() {
    drawerToggleElements = domQueryAll('.drawer-toggle');

    if (drawerToggleElements && drawerToggleElements.length > 0) {
        drawerToggleElements.forEach(function (el) {
            el.onclick = toggleDrawer;
        })
    }

}

const bgColor = 'gainsboro';
// function setUpDrawerAnchor(anchor) {
//     drawer = domQuery('.drawer');
//     if (!drawer) {
//         return
//     }

//     var allDrawerAnchors = drawer.querySelectorAll('a');
//     anchor.onclick = function (ev) {
//         ev.preventDefault();
//         allDrawerAnchors.forEach(function (targetAnchor) {
//             if (targetAnchor !== ev.target) {
//                 targetAnchor.style.backgroundColor = 'white';
//             } else {
//                 targetAnchor.style.backgroundColor = bgColor;
//             }
//         });
//     }
// }

function toggleDrawer(ev) {
    drawer = domQuery('.drawer');

    if (!drawer) {
        return
    }

    if (drawerIsShowing) {
        drawer.style.height = '0px';
        drawer.style.opacity = '0';
        drawer.style.zIndex = '1';

        setTimeout(() => {
            drawer.style.padding = '0px';
        }, 800);

        drawerIsShowing = false;
    } else {
        drawer.style.display = 'grid';
        drawer.style.opacity = '1';
        drawer.style.height = '100%';
        drawer.style.zIndex = '5';

        drawerIsShowing = true;
    }
}