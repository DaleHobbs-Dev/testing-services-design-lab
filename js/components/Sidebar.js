import { slateMenu } from "../data/menuData.js";

export function Sidebar(state) {
    const menuHtml = slateMenu.map(item => {
        if (item.type === "single") {
            const activeClass = state.currentSlateView === item.view ? "is-active" : "";

            return `
        <button class="sidebar__link ${activeClass}" data-view="${item.view}">
          ${item.label}
        </button>
      `;
        }

        const isOpen = state.openAccordion === item.id;
        const openClass = isOpen ? "is-open" : "";

        const childrenHtml = item.children.map(child => {
            const activeClass = state.currentSlateView === child.view ? "is-active" : "";

            return `
        <button class="sidebar__sublink ${activeClass}" data-view="${child.view}">
          ${child.label}
        </button>
      `;
        }).join("");

        return `
      <div class="sidebar__group ${openClass}">
        <button class="sidebar__accordion" data-accordion="${item.id}">
          ${item.label}
          <span class="sidebar__caret">${isOpen ? "−" : "+"}</span>
        </button>
        <div class="sidebar__submenu">
          ${childrenHtml}
        </div>
      </div>
    `;
    }).join("");

    return `
    <aside class="sidebar">
      ${menuHtml}
    </aside>
  `;
}