const OBJECTIVES_PER_TEST_TYPE = 4;

export function TrainingFormView(state) {
  const db = state.db || {};
  const currentUser = state.currentSlateUser;

  return `
    <section class="content-panel">
      <h2>Training Completion</h2>
      <p>Record the exam training an employee has completed. Select the employee and one or more exams, then mark each training objective as completed or not.</p>

      <form class="ticket-form" id="trainingForm">
        ${renderTrainingDetails(db, currentUser)}
        ${renderTrainingObjectives(db)}

        <div class="form-actions">
          <button type="button" class="portal-button" disabled>Submit Training Record</button>
        </div>

        <p class="demo-note">Demo only — this static prototype does not submit data.</p>
      </form>
    </section>
  `;
}

// ---------------------------------------------------------------------------
// Section: Training Details
// ---------------------------------------------------------------------------

function renderTrainingDetails(db, currentUser) {
  const employeeOptions = (db.employees || [])
    .map(e => `<option value="${e.id}" ${e.id === currentUser?.id ? "selected" : ""}>${e.name}</option>`)
    .join("");

  const testTypeChips = (db.test_types || [])
    .map(t => `
      <label class="training-exam-chip" style="--chip-color: ${t.color};">
        <input type="checkbox" class="training-exam-checkbox" value="${t.id}" />
        <span>${t.label}</span>
      </label>
    `)
    .join("");

  return `
    <div class="form-section">
      <h3 class="form-section__title">Training Details</h3>

      <div class="form-row">
        <label for="trainingEmployee">Employee</label>
        <select id="trainingEmployee">
          <option value="">-- Select employee --</option>
          ${employeeOptions}
        </select>
      </div>

      <div class="form-row form-row--top">
        <label>
          Exam(s) Trained For <em class="label-hint">(Select all that apply)</em>
        </label>
        <div class="training-exam-chips">
          ${testTypeChips}
        </div>
      </div>
    </div>
  `;
}

// ---------------------------------------------------------------------------
// Section: Training Objectives (one group per test type, revealed on select)
// ---------------------------------------------------------------------------

function renderTrainingObjectives(db) {
  const groups = (db.test_types || []).map(renderObjectiveGroup).join("");

  return `
    <div class="form-section">
      <h3 class="form-section__title">Training Objectives</h3>
      <p class="form-hint training-objectives-empty">Select an exam above to see its training objectives.</p>
      ${groups}
    </div>
  `;
}

function renderObjectiveGroup(testType) {
  const objectives = Array.from({ length: OBJECTIVES_PER_TEST_TYPE }, (_, i) => {
    const name = `objective-${testType.id}-${i + 1}`;
    return `
      <div class="training-objective">
        <span class="training-objective__label">Completed ${testType.label} Training Module ${i + 1}</span>
        <div class="training-objective__choices">
          <label class="training-choice">
            <input type="radio" name="${name}" value="yes" />
            <span>Yes</span>
          </label>
          <label class="training-choice">
            <input type="radio" name="${name}" value="no" />
            <span>No</span>
          </label>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="training-objective-group" data-training-test-type="${testType.id}" style="display: none; --chip-color: ${testType.color};">
      <h4 class="training-objective-group__title">${testType.label}</h4>
      ${objectives}
    </div>
  `;
}
