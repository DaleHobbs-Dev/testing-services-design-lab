export function Navbar({ activePage = '' }) {
    const el = document.createElement('nav');
    el.className = 'navbar';
    el.innerHTML = `
    <div class="navbar-brand">Slate Playground</div>
    <ul class="navbar-links">
      <li><a href="/index.html" class="${activePage === 'home' ? 'active' : ''}">Home</a></li>
      <li><a href="/pages/dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
    </ul>
  `;
    return el;
}