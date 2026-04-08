export function TicketingFormView() {
    return `
    <section class="content-panel">
      <h2>Ticketing Form</h2>
      <p>Use this area to prototype future ticket submission forms.</p>

      <form class="ticket-form">
        <div class="form-row">
          <label for="ticketSubject">Subject:</label>
          <input id="ticketSubject" type="text" />
        </div>

        <div class="form-row">
          <label for="ticketCategory">Category:</label>
          <select id="ticketCategory">
            <option>General Support</option>
            <option>Testing Services</option>
            <option>Portal Access</option>
          </select>
        </div>

        <div class="form-row form-row--stacked">
          <label for="ticketDescription">Description:</label>
          <textarea id="ticketDescription" rows="6"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="portal-button" disabled>
            Submit Ticket
          </button>
        </div>

        <p class="demo-note">
          Demo only — this static prototype does not submit data.
        </p>
      </form>
    </section>
  `;
}