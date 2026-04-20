export function TicketingFormView(state) {
  const db = state.db || {};
  const currentUser = state.currentSlateUser;

  return `
    <section class="content-panel">
      <h2>New Ticket</h2>
      <p>A <strong>ticket</strong> is a record of any communication or task that Testing Services needs to track, follow up on, or resolve. Fill in only what applies -- use the optional toggles below to add more detail as needed.</p>

      <div class="form-toast" style="display: none;">Additional information required below ↓</div>

      <form class="ticket-form" id="ticketingForm">
        ${renderCreateTicket(db, currentUser)}
        ${renderOptionalDetails(db)}
        ${renderEmailWorkflowSection()}
        ${renderInternalWorkflowNotes()}

        <div class="form-actions">
          <button type="button" class="portal-button" disabled>Submit Ticket</button>
        </div>

        <p class="demo-note">Demo only — this static prototype does not submit data.</p>
      </form>
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Section: Create Ticket
// ---------------------------------------------------------------------------

function renderCreateTicket(db, currentUser) {
  const employeeOptions = (db.employees || [])
    .map(e => `<option value="${e.id}" ${e.id === currentUser?.id ? "selected" : ""}>${e.name}</option>`)
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
    <div class="form-section" id="createTicketSection">
      <h3 class="form-section__title">Create Ticket</h3>

      <div class="form-row">
        <label for="ticketType">
          Ticket Type <em class="label-hint">(What is this about?)</em>
          <button type="button" class="tooltip-trigger" tabindex="-1" aria-label="Help with Ticket Type">
            <span class="tooltip-icon">ⓘ</span>
            <span class="tooltip-content">Select the category that best describes the purpose of this ticket. This helps organize work and ensures the ticket is routed and tracked appropriately. If you're unsure, choose the closest match.</span>
          </button>
        </label>
        <div class="field-wrap">
          <select id="ticketType">
            <option value="">-- Select type --</option>
            ${ticketTypeOptions}
          </select>
          <span class="field-alert" style="display: none;">Additional information available below ↓</span>
        </div>
      </div>

      ${renderTicketTypePrompts()}

      <div class="form-row ticket-type-other-row" style="display: none;">
        <label for="ticketTypeOther">Please describe</label>
        <input id="ticketTypeOther" type="text" placeholder="Describe the ticket type..." />
      </div>

      <div class="form-row">
        <label for="ticketStatus">Ticket Status</label>
        <select id="ticketStatus">
          ${statusOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="ticketPriority">Priority</label>
        <select id="ticketPriority">
          ${priorityOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="originSource">
          Origin Source <em class="label-hint">(How did this start?)</em>
          <button type="button" class="tooltip-trigger" tabindex="-1" aria-label="Help with Origin Source">
            <span class="tooltip-icon">ⓘ</span>
            <span class="tooltip-content">Indicate how this communication or task originated (e.g., email, phone call, walk-in, form submission). This helps track how requests are coming into Testing Services.</span>
          </button>
        </label>
        <select id="originSource">
          <option value="">-- Select origin --</option>
          ${originOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="openedBy">Opened By Staff</label>
        <select id="openedBy">
          <option value="">-- Select staff member --</option>
          ${employeeOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="locationInvolved">Location Involved</label>
        <select id="locationInvolved">
          <option value="">-- Select location --</option>
          ${locationOptions}
        </select>
      </div>

      <div class="form-row form-row--stacked">
        <label for="briefSummary">
          Brief Ticket Summary
          <button type="button" class="tooltip-trigger" tabindex="-1" aria-label="Help with Brief Ticket Summary">
            <span class="tooltip-icon">ⓘ</span>
            <span class="tooltip-content">Add key words and names in the summary to better search and filter tickets later.</span>
          </button>
        </label>
        <input id="briefSummary" type="text" class="input-full" placeholder="e.g. emailed Robyn about Accommodation request from student walk-in – Sarah Johnson" />
      </div>

      <div class="context-toggles">
        <p class="context-toggles__label">Add optional sections to this ticket:</p>
        ${renderContextToggles()}
      </div>
    </div>
  `;
}

function renderTicketTypePrompts() {
  const prompts = [
    {
      type: "Faculty Request",
      text: "Faculty requests typically involve faculty contact details.",
      btnText: "Add faculty details",
      section: "people"
    },
    {
      type: "Student Issue",
      text: "Student issues typically involve an examinee record.",
      btnText: "Add examinee details",
      section: "people"
    },
    {
      type: "Accessibility Coordination",
      text: "Accessibility tickets involve accommodation records and contact details.",
      btnText: "Add accessibility details",
      section: "accessibility"
    },
    {
      type: "Vendor Test Coordination",
      text: "Vendor tickets often require external contact information.",
      btnText: "Add vendor contact",
      section: "people"
    },
    {
      type: "Irregularity Generated",
      text: "This ticket was generated from a filed irregularity report.",
      btnText: "Link irregularity report",
      section: "irregularity"
    },
    {
      type: "Exam Intake",
      text: "Exam intake tickets may be linked to a specific testing event.",
      btnText: "Add testing event",
      section: "testing"
    },
    {
      type: "Exam Delivery / Return",
      text: "Exam delivery tickets may be linked to a specific testing event.",
      btnText: "Add testing event",
      section: "testing"
    },
    {
      type: "System Error / Incident",
      text: "System errors may relate to a specific testing event or session.",
      btnText: "Add testing event",
      section: "testing"
    }
  ];

  return prompts.map(p => `
    <div class="ticket-type-prompt" data-for-type="${p.type}" style="display: none;">
      <span class="ticket-type-prompt__text">${p.text}</span>
      <button type="button" class="contextual-prompt-btn" data-activate-section="${p.section}">
        + ${p.btnText}
      </button>
    </div>
  `).join("");
}

function renderContextToggles() {
  const toggles = [
    { section: "people", label: "Add people / contact information" },
    { section: "testing", label: "Add testing event information" },
    { section: "irregularity", label: "Add irregularity information" },
    { section: "comms", label: "Add detailed communication log" },
    { section: "email", label: "Generate an email from this ticket" },
    { section: "internal", label: "Add internal workflow notes" }
  ];

  return toggles.map(t => `
    <label class="context-toggle">
      <input type="checkbox" class="toggle-checkbox" data-section="${t.section}" />
      <span class="toggle-track"></span>
      <span class="toggle-label">${t.label}</span>
    </label>
  `).join("");
}

// ---------------------------------------------------------------------------
// Section: Optional Details
// ---------------------------------------------------------------------------

function renderOptionalDetails(db) {
  return `
    <div class="form-section" id="optionalDetails" style="display: none;">
      <h3 class="form-section__title">Optional Details</h3>

      ${renderPeopleSubsection()}
      ${renderAccessibilitySubsection()}
      ${renderTestingEventSubsection(db)}
      ${renderIrregularitySubsection(db)}
      ${renderCommunicationSubsection(db)}
    </div>
  `;
}

function renderPeopleSubsection() {
  return `
    <div data-optional-section="people" style="display: none;">
      <h4 class="optional-subsection__title">People / Contact</h4>

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
        <label for="externalContactName">External Contact Name</label>
        <input id="externalContactName" type="text" placeholder="First Last" />
      </div>

      <div class="form-row">
        <label for="externalContactEmail">External Contact Email</label>
        <input id="externalContactEmail" type="email" placeholder="contact@example.com" />
      </div>
    </div>
  `;
}

function renderAccessibilitySubsection() {
  return `
    <div data-optional-section="accessibility" style="display: none;">
      <h4 class="optional-subsection__title">Accessibility Coordination</h4>

      <div class="form-row">
        <label for="accessibilityStudentName">Student Involved</label>
        <input id="accessibilityStudentName" type="text" placeholder="Student name" />
      </div>

      <div class="form-row">
        <label for="accessibilityStudentEmail">Student Email</label>
        <input id="accessibilityStudentEmail" type="email" placeholder="student@student.columbiastate.edu" />
      </div>

      <div class="form-row">
        <label for="accessibilityEmployeeContact">Accessibility Employee Contacted</label>
        <input id="accessibilityEmployeeContact" type="text" placeholder="Employee name" />
      </div>

      <div class="form-row form-row--stacked">
        <label for="accessibilityDetails">Details of Accessibility Ticket</label>
        <textarea id="accessibilityDetails" rows="4" placeholder="Describe the accommodation details, exam setup requirements, or relevant notes..."></textarea>
      </div>
    </div>
  `;
}

function renderTestingEventSubsection(db) {
  const testingEventOptions = (db.testing_events || [])
    .map(e => `<option value="${e.id}">${e.label}</option>`)
    .join("");

  const examTypeOptions = (db.test_types || [])
    .map(t => `<option value="${t.id}">${t.label}</option>`)
    .join("");

  const testMediumOptions = (db.test_mediums || [])
    .map(m => `<option value="${m.id}">${m.label}</option>`)
    .join("");

  return `
    <div data-optional-section="testing" style="display: none;">
      <h4 class="optional-subsection__title">Testing Event</h4>

      <div class="form-row">
        <label for="testingEvent">Testing Event</label>
        <select id="testingEvent">
          <option value="">-- Select event (optional) --</option>
          ${testingEventOptions}
        </select>
      </div>

      <div class="form-row">
        <label for="examType">Exam Type</label>
        <select id="examType">
          <option value="">-- Select exam type --</option>
          ${examTypeOptions}
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

function renderIrregularitySubsection(db) {
  const irregularityOptions = (db.irregularities || [])
    .map(i => `<option value="${i.id}">${i.label}</option>`)
    .join("");

  return `
    <div data-optional-section="irregularity" style="display: none;">
      <h4 class="optional-subsection__title">Linked Irregularity</h4>

      <div class="form-row">
        <label for="linkedIrregularity">Irregularity Report</label>
        <select id="linkedIrregularity">
          <option value="">-- Select irregularity (optional) --</option>
          ${irregularityOptions}
        </select>
      </div>

      <p class="form-hint">Only link an irregularity if this ticket originated from or directly relates to a filed irregularity report.</p>
    </div>
  `;
}

function renderCommunicationSubsection(db) {
  const commTypeOptions = (db.initial_comm_types || [])
    .map(c => `<option value="${c.id}">${c.label}</option>`)
    .join("");

  return `
    <div data-optional-section="comms" style="display: none;">
      <h4 class="optional-subsection__title">Communication Log</h4>

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

// ---------------------------------------------------------------------------
// Section: Email Workflow
// ---------------------------------------------------------------------------

function renderEmailWorkflowSection() {
  return `
    <div class="form-section email-workflow-wrapper" style="display: none;">
      <h3 class="form-section__title">Email Workflow</h3>

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
  `;
}

// ---------------------------------------------------------------------------
// Section: Internal Workflow Notes
// ---------------------------------------------------------------------------

function renderInternalWorkflowNotes() {
  return `
    <div class="form-section internal-notes-wrapper" style="display: none;">
      <h3 class="form-section__title">Internal Workflow Notes</h3>

      <div class="form-row form-row--stacked">
        <div class="log-header">
          <label for="logNotes">Running Log</label>
          <button type="button" class="form-toggle-btn" data-action="add-log-entry">+ Add entry</button>
        </div>
        <p class="form-hint">Click "Add entry" to stamp today's date and start a new line. This log is append-only.</p>
        <textarea id="logNotes" rows="7" placeholder="Log entries will appear here..."></textarea>
      </div>

      <div class="form-row form-row--stacked">
        <label for="resolutionSummary">Resolution Summary</label>
        <textarea id="resolutionSummary" rows="4" placeholder="Summarize how the ticket was resolved..."></textarea>
      </div>

      <div class="form-row">
        <label for="categoryTags">Category Tags</label>
        <input id="categoryTags" type="text" placeholder="e.g. accommodations, faculty, pearson" />
      </div>
    </div>
  `;
}
