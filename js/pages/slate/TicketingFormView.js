export function TicketingFormView(state) {
    const db = state.db || {};

    return `
    <section class="content-panel">
      <h2>New Ticket</h2>
      <p>Complete the fields below to open a new ticket.</p>

      <form class="ticket-form" id="ticketingForm">
        ${renderTicketBasics(db)}
        ${renderPeopleInvolved()}
        ${renderExamDetails(db)}
        ${renderLinkedIrregularity(db)}
        ${renderInitialCommunication(db)}
        ${renderEmailWorkflow()}
        ${renderRunningLog()}
        ${renderInternalAnalytics()}

        <div class="form-actions">
          <button type="button" class="portal-button" disabled>
            Submit Ticket
          </button>
        </div>

        <p class="demo-note">Demo only — this static prototype does not submit data.</p>
      </form>
    </section>
  `;
}

function renderTicketBasics(db) {
    const employeeOptions = (db.employees || [])
        .map(e => `<option value="${e.id}">${e.name}</option>`)
        .join("");

    const ticketTypeOptions = (db.ticket_types || [])
        .map(t => `<option value="${t.id}">${t.label}</option>`)
        .join("");

    const statusOptions = (db.statuses || [])
        .map(s => `<option value="${s.id}" ${s.label === "Open" ? "selected" : ""}>${s.label}</option>`)
        .join("");

    const priorityOptions = (db.priorities || [])
        .map(p => `<option value="${p.id}" ${p.label === "Normal" ? "selected" : ""}>${p.label}</option>`)
        .join("");

    const originOptions = (db.origin_sources || [])
        .map(o => `<option value="${o.id}">${o.label}</option>`)
        .join("");

    const locationOptions = (db.locations || [])
        .map(l => `<option value="${l.id}">${l.name}</option>`)
        .join("");

    return `
    <div class="form-section">
      <h3 class="form-section__title">Ticket Basics</h3>

      <div class="form-row">
        <label for="openedBy">Opened By</label>
        <select id="openedBy">
          <option value="">-- Select staff member --</option>
          ${employeeOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="ticketType">Ticket Type</label>
        <div class="field-wrap">
          <select id="ticketType">
            <option value="">-- Select type --</option>
            ${ticketTypeOptions}
          </select>
          <span class="field-alert" style="display: none;">Additional information needed below ↓</span>
        </div>
      </div>

      <div class="form-row ticket-type-other-row" style="display: none;">
        <label for="ticketTypeOther">Please describe</label>
        <input id="ticketTypeOther" type="text" placeholder="Describe the ticket type..." />
      </div>

      <div class="form-row">
        <label for="ticketStatus">Status</label>
        <div class="field-wrap">
          <select id="ticketStatus">
            ${statusOptions}
          </select>
          <span class="field-alert" style="display: none;">Additional information needed below ↓</span>
        </div>
      </div>

      <div class="form-row reason-delay-row" style="display: none;">
        <label for="reasonDelay">Reason for Delay</label>
        <input id="reasonDelay" type="text" placeholder="Explain why this ticket is on hold..." />
      </div>

      <div class="form-row">
        <label for="ticketPriority">Priority</label>
        <select id="ticketPriority">
          ${priorityOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="originSource">Origin Source</label>
        <div class="field-wrap">
          <select id="originSource">
            <option value="">-- Select origin --</option>
            ${originOptions}
          </select>
          <span class="field-alert" style="display: none;">Additional information needed below ↓</span>
        </div>
      </div>

      <div class="form-row">
        <label for="locationInvolved">Location Involved</label>
        <select id="locationInvolved">
          <option value="">-- Select location --</option>
          ${locationOptions}
        </select>
      </div>
    </div>
  `;
}

function renderPeopleInvolved() {
    return `
    <div class="form-section">
      <h3 class="form-section__title">People Involved</h3>

      <div class="form-row">
        <label for="examineeId">Student / Examinee ID</label>
        <input id="examineeId" type="text" placeholder="e.g. 1234567" />
      </div>

      <div class="form-row">
        <label for="facultyName">Faculty Name</label>
        <input id="facultyName" type="text" placeholder="First Last" />
      </div>

      <div class="form-row">
        <label for="facultyEmail">Faculty Email</label>
        <input id="facultyEmail" type="email" placeholder="faculty@columbiastate.edu" />
      </div>

      <div class="form-row">
        <label></label>
        <button type="button" class="form-toggle-btn" data-action="add-external-contact">
          + Add external contact
        </button>
      </div>

      <div class="external-contact-fields" style="display: none;">
        <div class="form-row">
          <label for="externalContactName">External Contact Name</label>
          <input id="externalContactName" type="text" placeholder="First Last" />
        </div>

        <div class="form-row">
          <label for="externalContactEmail">External Contact Email</label>
          <input id="externalContactEmail" type="email" placeholder="contact@example.com" />
        </div>
      </div>
    </div>
  `;
}

function renderExamDetails(db) {
    const testTypeOptions = (db.test_types || [])
        .map(t => `<option value="${t.id}">${t.label}</option>`)
        .join("");

    const testMediumOptions = (db.test_mediums || [])
        .map(m => `<option value="${m.id}">${m.label}</option>`)
        .join("");

    return `
    <div class="form-section">
      <h3 class="form-section__title">Exam Details</h3>

      <div class="form-row">
        <label for="testType">Test Type</label>
        <select id="testType">
          <option value="">-- Select test type --</option>
          ${testTypeOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="testMedium">Test Medium</label>
        <select id="testMedium">
          <option value="">-- Select medium --</option>
          ${testMediumOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="accommodatedExam">Accommodated Exam</label>
        <select id="accommodatedExam">
          <option value="">-- Select --</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <div class="form-row">
        <label for="examDueDate">Exam Due Date</label>
        <input id="examDueDate" type="date" />
      </div>

      <div class="form-row">
        <label for="examReturned">Exam Returned to Faculty</label>
        <div class="field-wrap">
          <select id="examReturned">
            <option value="">-- Select --</option>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
          <span class="field-alert" style="display: none;">Additional information needed below ↓</span>
        </div>
      </div>

      <div class="form-row exam-returned-date-row" style="display: none;">
        <label for="examReturnedDate">Date Returned</label>
        <input id="examReturnedDate" type="date" />
      </div>
    </div>
  `;
}

function renderLinkedIrregularity(db) {
    const irregularityOptions = (db.irregularities || [])
        .map(i => `<option value="${i.id}">${i.label}</option>`)
        .join("");

    return `
    <div class="form-section irregularity-section" style="display: none;">
      <h3 class="form-section__title">Linked Irregularity</h3>

      <div class="form-row">
        <label for="linkedIrregularity">Irregularity</label>
        <select id="linkedIrregularity">
          <option value="">-- Select irregularity (optional) --</option>
          ${irregularityOptions}
        </select>
      </div>

      <p class="form-hint">Only link an irregularity if this ticket originated from or directly relates to a reported irregularity.</p>
    </div>
  `;
}

function renderInitialCommunication(db) {
    const commTypeOptions = (db.initial_comm_types || [])
        .map(c => `<option value="${c.id}">${c.label}</option>`)
        .join("");

    return `
    <div class="form-section">
      <h3 class="form-section__title">Initial Communication</h3>

      <div class="form-row">
        <label for="initialCommType">How did this come in?</label>
        <select id="initialCommType">
          <option value="">-- Select type --</option>
          ${commTypeOptions}
        </select>
      </div>

      <div class="form-row form-row--stacked">
        <label for="originalMessage">Original Message / Intake Notes</label>
        <textarea id="originalMessage" rows="5" placeholder="Paste the original email, summarize the phone call, etc."></textarea>
      </div>
    </div>
  `;
}

function renderEmailWorkflow() {
    return `
    <div class="form-section">
      <h3 class="form-section__title">Email Workflow</h3>

      <div class="form-row">
        <label for="requiresEmail">Does this ticket require an email?</label>
        <div class="field-wrap">
          <select id="requiresEmail">
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
          <span class="field-alert" style="display: none;">Additional information needed below ↓</span>
        </div>
      </div>

      <div class="email-workflow-section" style="display: none;">
        <div class="form-row">
          <label for="emailTemplate">Email Template</label>
          <select id="emailTemplate" disabled>
            <option value="">-- Templates coming soon --</option>
          </select>
        </div>

        <div class="form-row">
          <label for="emailRecipient">Primary Recipient</label>
          <input id="emailRecipient" type="email" placeholder="recipient@example.com" />
        </div>

        <div class="form-row">
          <label for="emailCc">CC</label>
          <input id="emailCc" type="text" placeholder="Separate multiple addresses with commas" />
        </div>

        <div class="form-row">
          <label for="emailSubject">Subject</label>
          <input id="emailSubject" type="text" placeholder="Email subject line..." />
        </div>

        <div class="form-row form-row--stacked">
          <label for="emailBody">Body</label>
          <textarea id="emailBody" rows="6" placeholder="Compose email or paste auto-filled content..."></textarea>
        </div>

        <div class="form-row">
          <label>Email Sent</label>
          <label class="checkbox-label">
            <input type="checkbox" id="emailSent" disabled />
            <span>Sent (auto-recorded when dispatched)</span>
          </label>
        </div>
      </div>
    </div>
  `;
}

function renderRunningLog() {
    return `
    <div class="form-section">
      <h3 class="form-section__title">Running Log</h3>
      <p class="form-hint">Click "Add entry" to stamp today's date and start a new line. This log is append-only.</p>

      <div class="form-row form-row--stacked">
        <div class="log-header">
          <label for="logNotes">Log</label>
          <button type="button" class="form-toggle-btn" data-action="add-log-entry">+ Add entry</button>
        </div>
        <textarea id="logNotes" rows="7" placeholder="Log entries will appear here..."></textarea>
      </div>
    </div>
  `;
}

function renderInternalAnalytics() {
    return `
    <div class="form-section">
      <h3 class="form-section__title">Internal / Analytics</h3>

      <div class="form-row form-row--stacked">
        <label for="resolutionSummary">Resolution Summary</label>
        <textarea id="resolutionSummary" rows="4" placeholder="Summarize how the ticket was resolved..."></textarea>
      </div>

      <div class="form-row">
        <label for="categoryTags">Category Tags</label>
        <input id="categoryTags" type="text" placeholder="e.g. accommodations, faculty, pearson" />
      </div>

      <div class="form-row">
        <label for="hoursSpent">Hours Spent</label>
        <input id="hoursSpent" type="number" min="0" step="0.5" placeholder="0.0" style="max-width: 120px;" />
      </div>
    </div>
  `;
}
