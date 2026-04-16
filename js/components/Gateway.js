export function Gateway() {
    return `
    <section class="gateway">
      <h1>Design Playground</h1>
      <p>Select an area to preview design ideas.</p>

      <div class="gateway__cards">
        <button class="gateway__card" data-nav="slate">
          <h2>Slate Portal Designs</h2>
          <p>Prototype portal layouts, navigation, forms, and interaction patterns.</p>
        </button>

        <button class="gateway__card gateway__card--disabled" disabled>
          <h2>Website Designs</h2>
          <p>Prototype ideas for the main institutional website.</p>
          <span class="gateway__badge">Coming Soon</span>
        </button>
      </div>
    </section>
  `;
}