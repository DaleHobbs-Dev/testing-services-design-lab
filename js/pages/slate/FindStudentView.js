export function FindStudentView() {
    return `
    <section class="content-panel">
      <h2>Search for a student</h2>
      <p>
        Search for the student below by name and you can choose optional filters
        to narrow down the selection.
      </p>

      <form class="student-form">
        <div class="form-row">
          <label for="firstName">First Name:</label>
          <input id="firstName" type="text" />
        </div>

        <div class="form-row">
          <label for="lastName">Last Name:</label>
          <input id="lastName" type="text" />
        </div>

        <div class="form-row">
          <label for="studentId">Student ID:</label>
          <input id="studentId" type="text" />
        </div>

        <div class="form-actions">
          <button type="button" class="portal-button" disabled>
            Search
          </button>
        </div>

        <p class="demo-note">
          Demo only — this static prototype does not submit or fetch live student data.
        </p>
      </form>
    </section>
  `;
}