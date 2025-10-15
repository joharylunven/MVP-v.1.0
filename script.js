const data = JSON.parse(document.getElementById('brandData').textContent);

// --- Utilities ---
const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
const stateKey = 'p1_brand_review_state_v4_story';
let reviewState = JSON.parse(localStorage.getItem(stateKey) || '{}');

let toastTimeout;
function showToast() {
  const toast = $('#saveToast');
  if (!toast) return;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1500);
}

function saveState(){
  localStorage.setItem(stateKey, JSON.stringify(reviewState));
  recalcProgress();
  showToast();
}

function progressInfo(){
  const entries = Object.entries(reviewState.sections || {});
  const total = sections.length || 1;
  const approved = entries.filter(([,v]) => v.status === 'approved').length;
  return { total, approved, pct: Math.round(approved/total*100) };
}

function recalcProgress(){
  const {pct, approved, total} = progressInfo();
  $('#progressBar').style.width = pct + '%';
  $('#progressText').textContent = approved + '/' + total + ' approved (' + pct + '%)';

  sections.forEach(({id, title}) => {
    const link = $(`a[data-nav-id="${id}"]`);
    if (!link) return;
    const status = (reviewState.sections && reviewState.sections[id]?.status) || 'pending';
    let icon = '•';
    let iconClass = '';
    if (status === 'approved') {
      icon = '✓';
      iconClass = 'approved';
    } else if (status === 'changes') {
      icon = '✍️';
      iconClass = 'changes';
    }
    link.innerHTML = `<span class="status-icon ${iconClass}">${icon}</span> ${title}`;
  });
}

function dl(filename, text){
  const blob = new Blob([text], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}

function toSlug(str){ return String(str).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

function setTheme(mode){ document.documentElement.setAttribute('data-theme', mode); localStorage.setItem('p1_theme', mode); }

// --- Renderers ---
const content = $('#content');
const sidenav = $('#sidenav');
const sections = [];

function buildContent(contentData) {
  const fragment = document.createDocumentFragment();
  const stack = document.createElement('div');
  stack.className = 'stack';
  contentData.forEach(item => {
    if (item.type === 'paragraph') {
      const p = document.createElement('p'); p.innerHTML = item.text; stack.appendChild(p);
    } else if (item.type === 'blockquote') {
      const bq = document.createElement('blockquote'); bq.innerHTML = item.text; stack.appendChild(bq);
    } else if (item.type === 'list') {
      const ul = document.createElement('ul'); ul.className = 'clean';
      item.items.forEach(liText => { const li = document.createElement('li'); li.innerHTML = liText; ul.appendChild(li); });
      stack.appendChild(ul);
    } else if (item.type === 'key_points') {
      const kvs = document.createElement('div'); kvs.className = 'kvs';
      item.points.forEach(point => { const kv = document.createElement('div'); kv.className = 'kv'; kv.innerHTML = `<small>${point.label}</small><strong>${point.value}</strong>`; kvs.appendChild(kv); });
      stack.appendChild(kvs);
    } else if (item.type === 'checklist') {
      const ul = document.createElement('ul'); ul.className = 'clean'; ul.style.listStyle = 'none';
      item.items.forEach((txt, i) => { const id = 'vc-' + i; const li = document.createElement('li'); li.innerHTML = `<label class="pill"><input type="checkbox" id="${id}"> ${txt}</label>`; ul.appendChild(li); });
      stack.appendChild(ul);
    }
  });
  fragment.appendChild(stack);
  return fragment;
}

function addSection(id, title, bodyEl, isLast = false) {
  const sec = document.createElement('section'); sec.className = 'card'; sec.id = id;
  const header = document.createElement('header'); const h2 = document.createElement('h2'); h2.textContent = title; header.appendChild(h2); sec.appendChild(header); sec.appendChild(bodyEl);
  
  if (!isLast) {
    const controlsWrap = document.createElement('div'); controlsWrap.className = 'approvebox';
    const controls = document.createElement('div'); controls.className = 'controls';
    controls.innerHTML = `<label class="radio"><input type="radio" name="${id}-status" value="approved"> ✅ Approve</label> <label class="radio"><input type="radio" name="${id}-status" value="changes"> ✍️ Needs changes</label>`;
    const note = document.createElement('textarea'); note.className = 'note'; note.placeholder = 'Optional note for this section...';
    controlsWrap.appendChild(note); controlsWrap.appendChild(controls); sec.appendChild(controlsWrap);
    
    reviewState.sections = reviewState.sections || {};
    reviewState.sections[id] = reviewState.sections[id] || { status: '', note: '' };
    const current = reviewState.sections[id];
    if (current.status) { $$(`input[name="${id}-status"]`, controls).find(r => r.value === current.status)?.setAttribute('checked', 'checked'); }
    note.value = current.note || '';
    const updateState = () => {
      reviewState.sections[id].status = $('input[name="' + id + '-status"]:checked', controls)?.value || '';
      reviewState.sections[id].note = note.value;
      saveState();
    };
    controls.addEventListener('change', updateState);
    note.addEventListener('input', updateState);
  } else {
      const form = document.createElement('div'); form.className = 'grid'; form.style.gridTemplateColumns = '1fr 1fr 1fr'; form.style.gap = '12px'; form.style.marginTop = '20px';
      function input(label, key, placeholder = '', id) {
          const d = document.createElement('div');
          const l = document.createElement('div'); l.className = 'muted'; l.textContent = label; d.appendChild(l);
          const i = document.createElement('input'); i.type = 'text'; i.placeholder = placeholder; i.id = id;
          i.style.cssText = 'width: 100%; padding: 10px; border-radius: 10px; border: 1px solid var(--border); background: rgba(255,255,255,.02); color: var(--text);';
          i.value = (reviewState.approvals || {})[key] || '';
          i.addEventListener('input', () => { reviewState.approvals = reviewState.approvals || {}; reviewState.approvals[key] = i.value; saveState(); });
          d.appendChild(i); return d;
      }
      form.appendChild(input('Reviewer name', 'name', 'Full name', 'reviewerNameInput'));
      form.appendChild(input('Title/role', 'title', 'e.g., CMO', 'reviewerTitleInput'));
      form.appendChild(input('Approval date (UTC)', 'date', new Date().toISOString().slice(0, 10), 'reviewerDateInput'));

      const buttonCell = document.createElement('div');
      buttonCell.style.cssText = 'grid-column: 1 / -1; text-align: right; margin-top: 16px;';
      const finalExportButton = document.createElement('button');
      finalExportButton.className = 'btn btn-primary'; finalExportButton.id = 'finalExportBtn';
      finalExportButton.style.display = 'none';
      finalExportButton.innerHTML = '✅ Complete &amp; Export Feedback';
      finalExportButton.addEventListener('click', () => {
          // New: Set the final section to 'approved'
          reviewState.sections['validation'].status = 'approved';
          saveState(); // This saves the state and updates the UI (menu checkmark)
          
          // Original: Trigger the download
          $('#exportFeedback').click();
      });
      buttonCell.appendChild(finalExportButton);
      form.appendChild(buttonCell);

      sec.appendChild(form);
  }

  content.appendChild(sec);
  const a = document.createElement('a'); a.href = '#' + id; a.dataset.navId = id; sidenav.appendChild(a); sections.push({ id, title });
}

// --- Render all sections from data ---
data.story.forEach((sectionData, index) => {
  const body = buildContent(sectionData.content);
  const isLastSection = index === data.story.length - 1;
  addSection(sectionData.id, sectionData.title, body, isLastSection);

  if (sectionData.id === 'validation') {
      const checkBoxes = $$('input[type="checkbox"]', body);
      const nameInput = $('#reviewerNameInput');
      const titleInput = $('#reviewerTitleInput');
      const dateInput = $('#reviewerDateInput');
      const finalExportBtn = $('#finalExportBtn');
      const inputs = [nameInput, titleInput, dateInput, ...checkBoxes];

      reviewState.validation = reviewState.validation || {};
      reviewState.sections['validation'] = reviewState.sections['validation'] || {status: '', note: ''};
      
      const checkFinalCompletion = () => {
          const allBoxesChecked = checkBoxes.every(cb => cb.checked);
          const allFieldsFilled = nameInput.value.trim() !== '' && titleInput.value.trim() !== '' && dateInput.value.trim() !== '';
          
          if (allBoxesChecked && allFieldsFilled) {
              finalExportBtn.style.display = 'inline-flex';
          } else {
              finalExportBtn.style.display = 'none';
          }
      };

      checkBoxes.forEach(cb => {
          cb.checked = !!reviewState.validation[cb.id];
          cb.addEventListener('change', () => {
              reviewState.validation[cb.id] = cb.checked;
              checkFinalCompletion();
          });
      });
      
      [nameInput, titleInput, dateInput].forEach(input => {
          input.addEventListener('input', checkFinalCompletion);
      });
      
      checkFinalCompletion(); // Initial check on load
  }
});

// --- Theme & Button Wiring ---
(function(){ try { document.documentElement.style.setProperty('--accent', '#186B68'); } catch(e){} })();
setTheme(localStorage.getItem('p1_theme')||'dark');
$('#toggleTheme').addEventListener('click', ()=>{ const current = document.documentElement.getAttribute('data-theme')||'dark'; setTheme(current==='dark'?'light':'dark'); });
$('#exportFeedback').addEventListener('click', ()=>{ const payload = { meta: { exported_at: new Date().toISOString(), source: 'Project One review site v4' }, client: data.client, review: reviewState }; dl(`${toSlug(data.client.name)}_brand_story_feedback.json`, JSON.stringify(payload, null, 2)); });
$('#copySummary').addEventListener('click', ()=>{ const {approved, total, pct} = progressInfo(); const lines = [`Brand: ${data.client.name}`, `Approved: ${approved}/${total} (${pct}%)`, '—']; Object.entries(reviewState.sections||{}).forEach(([id, v])=>{ if (!v.status) return; const title = sections.find(s=>s.id===id)?.title || id; lines.push(`${v.status==='approved'?'✅':'✍️'} ${title}`); if (v.note) lines.push(`  Note: ${v.note}`); }); navigator.clipboard.writeText(lines.join('\n')).then(()=>{ alert('Summary copied to clipboard.'); }); });
$('#printPdf').addEventListener('click', ()=> window.print());
(function(){ const banner = $('#welcomeBanner'); const dismissBtn = $('#dismissBanner'); if (!banner || !dismissBtn) return; if (localStorage.getItem('p1_banner_dismissed_v4')) { banner.style.display = 'none'; } dismissBtn.addEventListener('click', () => { banner.style.display = 'none'; localStorage.setItem('p1_banner_dismissed_v4', 'true'); }); })();

recalcProgress(); // Initial calc to set correct progress on load