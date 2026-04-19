export function ProfileSelectionPage(state) {
    const employees = (state.db?.employees || []).filter(e => !e.is_tech);

    const cards = employees.map(e => {
        const roleLabel = e.is_admin ? "Admin" : "Staff";
        const roleBadgeClass = e.is_admin ? "profile-card__badge--admin" : "profile-card__badge--staff";

        return `
      <button class="profile-card" data-profile="${e.id}">
        <div class="profile-card__avatar">${e.name.charAt(0)}</div>
        <div class="profile-card__name">${e.name}</div>
        <span class="profile-card__badge ${roleBadgeClass}">${roleLabel}</span>
      </button>
    `;
    }).join("");

    return `
    <section class="profile-selection">
      <h1>Select Your Profile</h1>
      <p>Choose a staff profile to use while browsing the Slate portal designs. This simulates how the portal appears for that user.</p>

      <div class="profile-selection__cards">
        ${cards}
      </div>

      <div class="profile-selection__back">
        <button class="back-button" data-nav="gateway">Back to gateway</button>
      </div>
    </section>
  `;
}
