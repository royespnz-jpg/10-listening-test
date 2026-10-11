# Listening Exam — 10th Grade

Colegio Nocturno de Cariari · Second Semester 2026 · Teacher: Saiden Ortiz Gómez · 12 points (10%) · One lesson

Same design and behaviour as the 11th grade exam: each audio can be played **up to 3 times**, the exam is
graded automatically, and every result goes to a Google Sheet.

| Part | Audio | What students do | Points |
| --- | --- | --- | --- |
| Multiple Choice I | `audio1.mp3` | 3 questions, options A–C | 3 |
| Matching | `audio2.mp3` | For India, Japan and Australia, choose the picture (1, 2, 3) that shows the consequence of pollution | 3 |
| Identification | `audio3.mp3` | On the picture, choose the problem each action reduces: Pollution, Air pollution or Climate change | 3 |
| Multiple Choice II | `audio4.mp3` | 3 questions about the environmental influencer, options A–C | 3 |

In Matching and Identification each number or problem can be used only once, as on the printed exam.

## The answer key is not here

The repository is public, so the answers are **only in the teacher's Google Apps Script**. The page sends the
student's answers; the script grades them and writes one row per student:

`Fecha y hora · Nombre del estudiante · Grupo · Puntaje · Porcentaje · Nota (10%) · Multiple Choice I · Matching ·
Identification · Multiple Choice II · Correctas · Incorrectas · Detalle por pregunta · ID`

## Setup

1. **Google Sheet**: create a new sheet → `Extensions ▸ Apps Script` → paste the script → run `configurar` once →
   `Deploy ▸ New deployment ▸ Web app` (*Execute as: Me*, *Who has access: Anyone*) → copy the `/exec` URL.
2. **The page**: put that URL in `script.js`:

   ```js
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/..../exec";
   ```

3. **GitHub Pages**: `Settings ▸ Pages ▸ Deploy from a branch ▸ main ▸ /(root)`. The exam is then at
   <https://royespnz-jpg.github.io/10-listening-test/>.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The exam page |
| `script.js` | Questions, audio control (3 plays), drop-downs, sending to the sheet |
| `style.css` | "Night School Aurora" theme (same as 11th grade) |
| `audio1.mp3 … audio4.mp3` | The four audios |
| `img/` | The Matching pictures and the Identification picture |
