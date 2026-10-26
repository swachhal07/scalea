/**
 * Scalea careers form → Google Drive + Google Sheet.
 *
 * Setup (once):
 *  1. Create a Google Sheet. Extensions → Apps Script, paste this file, save.
 *  2. Deploy → New deployment → Web app. Execute as: Me. Who has access: Anyone.
 *     (Approve the Drive, Sheets and Gmail permissions it asks for.)
 *  3. Copy the web app URL into `careersEndpoint` in src/site.jsx.
 * Each CV is saved to the Drive folder FOLDER, its details become a row in the
 * sheet with a link to the file, and NOTIFY gets an email about it.
 */

const NOTIFY = 'hello@scalea.com';
const FOLDER = 'Scalea CVs';
const FIELDS = ['submittedAt', 'name', 'email', 'phone', 'role', 'link', 'note', 'cv'];

function cvFolder() {
  const found = DriveApp.getFoldersByName(FOLDER);
  return found.hasNext() ? found.next() : DriveApp.createFolder(FOLDER);
}

function doPost(e) {
  const p = e.parameter;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  if (sheet.getLastRow() === 0) sheet.appendRow(FIELDS);

  let cvUrl = '';
  if (p.cvData) {
    const name = `${p.name || 'Applicant'} — ${p.cvName || 'CV'}`;
    const blob = Utilities.newBlob(Utilities.base64Decode(p.cvData), p.cvType || 'application/octet-stream', name);
    cvUrl = cvFolder().createFile(blob).getUrl();
  }

  sheet.appendRow(FIELDS.map((f) => (f === 'cv' ? cvUrl : p[f] || '')));

  if (NOTIFY) {
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: p.email,
      subject: `New CV: ${p.role} — ${p.name}`,
      body: FIELDS.map((f) => `${f}: ${f === 'cv' ? cvUrl : p[f] || ''}`).join('\n'),
    });
  }
  return ContentService.createTextOutput('ok');
}
