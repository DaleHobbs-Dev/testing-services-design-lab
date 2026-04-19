export function Header(state) {
    const user = state?.currentSlateUser;

    return `
    <header class="portal-header">
      <img
        src="./assets/logo-header-slate.svg"
        alt="Columbia State Community College"
        class="portal-header__logo"
      />
      ${user ? `
        <div class="portal-header__user">
          <span class="portal-header__username">${user.name}</span>
          <button class="portal-header__change-user" data-action="change-user">Change User</button>
        </div>
      ` : ""}
    </header>
  `;
}