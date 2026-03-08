// ContratosExpress.pro — Main Application Logic
// by MolvicStudios
// Vanilla ES Modules, no dependencies

import { translations } from './translations.js';
import { buildContract, applyVariant, buildSystemPrompt } from './templates.js';

// ─── STATE ──────────────────────────────────────────────────────────────────
const state = {
  lang: localStorage.getItem('ce_lang') || 'es',
  mode: 'offline',        // 'online' | 'offline'
  contractType: null,
  currentStep: 1,
  totalSteps: 4,
  formData: {},
  generatedContract: null,
  isFavorite: false,
  isGenerating: false,
  logoDataUrl: null,      // base64 image for logo
  logoFileName: '',
};

// ─── KEYS ───────────────────────────────────────────────────────────────────
const LS_HISTORY   = 'ce_history';
const LS_FAVORITES = 'ce_favorites';
const LS_DRAFT     = 'ce_draft';
const LS_COOKIES   = 'cookies_accepted';
const SS_API_KEY   = 'ce_apikey';

// ─── HELPERS ────────────────────────────────────────────────────────────────
const t = (path) => {
  const parts = path.split('.');
  let obj = translations[state.lang];
  for (const p of parts) {
    if (obj == null) return path;
    obj = obj[p];
  }
  return obj ?? path;
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function showToast(msg, type = 'error') {
  const toast = $('#error-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `error-toast visible`;
  toast.style.borderColor = type === 'success' ? 'var(--green)' : 'var(--red)';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('visible'), 4000);
}

function formatDateShort(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString(state.lang === 'en' ? 'en-US' : 'es-ES', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return isoStr;
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── TRANSLATIONS / LANG ────────────────────────────────────────────────────
function applyTranslations() {
  $$('[data-t]').forEach(el => {
    const key = el.dataset.t;
    const val = t(key);
    if (val && typeof val === 'string') el.textContent = val;
  });
  $$('[data-t-placeholder]').forEach(el => {
    const key = el.dataset.tPlaceholder;
    const val = t(key);
    if (val) el.placeholder = val;
  });
  $$('[data-t-title]').forEach(el => {
    const key = el.dataset.tTitle;
    const val = t(key);
    if (val) el.title = val;
  });

  // update lang toggle
  const btnLang = $('#btn-lang');
  if (btnLang) btnLang.textContent = t('nav.langToggle');

  // update select options for payment type
  const ptSelect = $('#field-payment-type');
  if (ptSelect) {
    $$('option', ptSelect).forEach(opt => {
      const key = opt.dataset.tOpt;
      if (key) opt.textContent = t(key);
    });
  }

  // HTML lang attr
  document.documentElement.lang = state.lang;
}

function toggleLang() {
  state.lang = state.lang === 'es' ? 'en' : 'es';
  localStorage.setItem('ce_lang', state.lang);
  applyTranslations();
  // re-render contract type cards
  renderContractTypeCards();
  // update live preview
  debouncedPreviewUpdate();
}

// ─── CONTRACT TYPE ───────────────────────────────────────────────────────────
const CONTRACT_TYPES = [
  { key: 'services',    icon: '📋' },
  { key: 'nda',         icon: '🔒' },
  { key: 'freelance',   icon: '💼' },
  { key: 'rental',      icon: '🏠' },
  { key: 'employment',  icon: '🤝' },
  { key: 'partnership', icon: '📊' },
  { key: 'sales',       icon: '🛒' },
  { key: 'custom',      icon: '✏️' },
];

function renderContractTypeCards() {
  const grid = $('#contract-grid');
  if (!grid) return;
  grid.innerHTML = '';
  CONTRACT_TYPES.forEach(({ key, icon }) => {
    const card = document.createElement('div');
    card.className = `contract-card${state.contractType === key ? ' selected' : ''}`;
    card.dataset.type = key;
    const labelKey = `contractTypes.${key}.label`;
    const descKey  = `contractTypes.${key}.desc`;
    card.innerHTML = `
      <div class="contract-card-icon">${icon}</div>
      <div class="contract-card-label">${t(labelKey)}</div>
      <div class="contract-card-desc">${t(descKey)}</div>
    `;
    card.addEventListener('click', () => selectContractType(key));
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectContractType(key); }
    });
    grid.appendChild(card);
  });
}

function selectContractType(key) {
  state.contractType = key;
  renderContractTypeCards();
  // scroll to mode section
  $('#mode-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── MODE SELECTOR ──────────────────────────────────────────────────────────
function initModeSelector() {
  const modeOnline  = $('#mode-online');
  const modeOffline = $('#mode-offline');
  const apiPanel    = $('#api-key-panel');

  function selectMode(mode) {
    state.mode = mode;
    modeOnline.classList.toggle('selected',  mode === 'online');
    modeOffline.classList.toggle('selected', mode === 'offline');
    modeOnline?.setAttribute('aria-checked',  mode === 'online'  ? 'true' : 'false');
    modeOffline?.setAttribute('aria-checked', mode === 'offline' ? 'true' : 'false');
    apiPanel?.classList.toggle('hidden-panel', mode !== 'online');
  }

  modeOnline?.addEventListener('click',  () => selectMode('online'));
  modeOffline?.addEventListener('click', () => selectMode('offline'));

  // Keyboard navigation for mode cards
  modeOnline?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMode('online'); }
  });
  modeOffline?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectMode('offline'); }
  });

  // Añadir role="radiogroup" al contenedor de modo
  modeOnline?.parentElement?.setAttribute('role', 'radiogroup');
  modeOnline?.setAttribute('aria-checked', 'false');
  modeOffline?.setAttribute('aria-checked', 'true');

  // default
  selectMode('offline');

  // API Key visibility toggle
  const apiKeyInput = $('#api-key-input');
  const btnShowKey  = $('#btn-show-key');
  if (btnShowKey && apiKeyInput) {
    const saved = sessionStorage.getItem(SS_API_KEY) || '';
    if (saved) apiKeyInput.value = saved;

    apiKeyInput.addEventListener('input', () => {
      sessionStorage.setItem(SS_API_KEY, apiKeyInput.value.trim());
    });
    btnShowKey.addEventListener('click', () => {
      apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
      btnShowKey.textContent = apiKeyInput.type === 'password' ? '👁' : '🙈';
    });
  }

  // Continue button
  $('#btn-continue-mode')?.addEventListener('click', () => {
    if (!state.contractType) {
      showToast(t('errors.contractTypeRequired'));
      return;
    }
    $('#wizard-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

// ─── WIZARD ─────────────────────────────────────────────────────────────────
function initWizard() {
  updateProgressBar();
  showStep(1);
  loadDraft();

  // Nav buttons
  $('#btn-next-1')?.addEventListener('click',  () => goToStep(2));
  $('#btn-next-2')?.addEventListener('click',  () => goToStep(3));
  $('#btn-next-3')?.addEventListener('click',  () => goToStep(4));
  $('#btn-back-2')?.addEventListener('click',  () => goToStep(1));
  $('#btn-back-3')?.addEventListener('click',  () => goToStep(2));
  $('#btn-back-4')?.addEventListener('click',  () => goToStep(3));
  $('#btn-generate')?.addEventListener('click', handleGenerate);

  // Type toggles (Persona/Empresa)
  initTypeToggle('party1');
  initTypeToggle('party2');

  // Tone toggle
  initToneToggle();

  // Optional clauses
  initClauseToggles();

  // Char counter
  initCharCounter('#field-desc', 600);

  // Penalty checkbox
  $('#check-late-penalty')?.addEventListener('change', e => {
    const wrap = $('#late-penalty-input-wrap');
    if (wrap) wrap.style.display = e.target.checked ? 'block' : 'none';
  });

  // Autosave on any input change
  const autoSave = debounce(() => {
    collectFormData();
    saveDraft();
    showAutosaveIndicator();
  }, 1000);

  $('#wizard-section')?.addEventListener('input',  autoSave);
  $('#wizard-section')?.addEventListener('change', autoSave);
}

function showStep(n) {
  state.currentStep = n;
  $$('.wizard-step').forEach(el => el.classList.remove('active'));
  $(`#step-${n}`)?.classList.add('active');
  updateProgressBar();
  window.scrollTo({ top: $('#wizard-section')?.offsetTop - 80 || 0, behavior: 'smooth' });
}

function updateProgressBar() {
  const pct = (state.currentStep / state.totalSteps) * 100;
  const fill = $('#progress-bar-fill');
  if (fill) fill.style.width = `${pct}%`;

  $$('.progress-step').forEach((el, i) => {
    const stepNum = i + 1;
    el.classList.remove('active', 'done');
    if (stepNum === state.currentStep) {
      el.classList.add('active');
      el.removeAttribute('tabindex');
      el.style.cursor = 'default';
    } else if (stepNum < state.currentStep) {
      el.classList.add('done');
      el.tabIndex = 0;
      el.style.cursor = 'pointer';
      // Asignar listener solo una vez
      if (!el._navBound) {
        el._navBound = true;
        const sn = stepNum;
        el.addEventListener('click', () => goToStep(sn));
        el.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goToStep(sn); }
        });
      }
    }
  });

  const label = $('#progress-label');
  if (label) {
    label.textContent = t('wizard.progressLabel')
      .replace('{current}', state.currentStep)
      .replace('{total}', state.totalSteps);
  }
}

function goToStep(n) {
  if (n > state.currentStep) {
    if (!validateStep(state.currentStep)) return;
  }
  collectFormData();
  showStep(n);
  debouncedPreviewUpdate();
}

function validateStep(step) {
  let valid = true;
  clearErrors();

  if (step === 1) {
    const p1 = $('#field-party1-name')?.value.trim();
    const p2 = $('#field-party2-name')?.value.trim();
    if (!p1 || !p2) {
      showToast(t('errors.nameRequired'));
      if (!p1) markFieldError('#field-party1-name');
      if (!p2) markFieldError('#field-party2-name');
      valid = false;
    }
  }
  if (step === 2) {
    const desc = $('#field-desc')?.value.trim();
    if (!desc) {
      showToast(t('errors.descRequired'));
      markFieldError('#field-desc');
      valid = false;
    } else if (desc.length > 600) {
      showToast(t('errors.descTooLong'));
      markFieldError('#field-desc');
      valid = false;
    }
  }
  if (step === 3) {
    const price = $('#field-price')?.value.trim();
    if (!price) {
      showToast(t('errors.priceRequired'));
      markFieldError('#field-price');
      valid = false;
    }
  }
  return valid;
}

function markFieldError(sel) {
  const el = $(sel);
  if (el) el.classList.add('error');
}

function clearErrors() {
  $$('.field-input.error, .field-textarea.error').forEach(el => el.classList.remove('error'));
}

// ─── TYPE TOGGLE ─────────────────────────────────────────────────────────────
function initTypeToggle(party) {
  const wrap  = $(`#type-toggle-${party}`);
  const btnP  = $(`#btn-${party}-person`);
  const btnC  = $(`#btn-${party}-company`);
  const input = $(`#field-${party}-type`);
  if (!btnP || !btnC) return;

  function setType(type) {
    if (input) input.value = type;
    btnP.classList.toggle('active', type === 'person');
    btnC.classList.toggle('active', type === 'company');
  }

  btnP.addEventListener('click', () => setType('person'));
  btnC.addEventListener('click', () => setType('company'));
  setType('person');
}

// ─── TONE TOGGLE ─────────────────────────────────────────────────────────────
function initToneToggle() {
  const toneInput = $('#field-tone');
  $$('.tone-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tone-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (toneInput) toneInput.value = btn.dataset.tone;
    });
  });
  // default: standard
  $('[data-tone="standard"]')?.classList.add('active');
  if (toneInput) toneInput.value = 'standard';
}

// ─── CLAUSE TOGGLES ──────────────────────────────────────────────────────────
function initClauseToggles() {
  // Non-compete period
  $('#check-non-compete')?.addEventListener('change', e => {
    const extra = $('#non-compete-extra');
    if (extra) extra.classList.toggle('visible', e.target.checked);
  });
  // Early termination notice
  $('#check-early-termination')?.addEventListener('change', e => {
    const extra = $('#early-termination-extra');
    if (extra) extra.classList.toggle('visible', e.target.checked);
  });
}

// ─── CHAR COUNTER ─────────────────────────────────────────────────────────────
function initCharCounter(sel, max) {
  const field   = $(sel);
  const counter = $(`${sel}-counter`);
  if (!field || !counter) return;

  function update() {
    const left = max - field.value.length;
    counter.textContent = `${left} ${t('step2.charsLeft')}`;
    counter.classList.toggle('warn', left < 50);
  }
  field.addEventListener('input', update);
  update();
}

// ─── COLLECT FORM DATA ────────────────────────────────────────────────────────
function collectFormData() {
  const get = (sel) => $(sel)?.value?.trim() || '';
  const checked = (sel) => $(sel)?.checked || false;

  state.formData = {
    contractType: state.contractType,
    // Step 1
    party1Name:    get('#field-party1-name'),
    party1Type:    get('#field-party1-type') || 'person',
    party1TaxId:   get('#field-party1-taxid'),
    party1Address: get('#field-party1-address'),
    party1Email:   get('#field-party1-email'),
    party2Name:    get('#field-party2-name'),
    party2Type:    get('#field-party2-type') || 'person',
    party2TaxId:   get('#field-party2-taxid'),
    party2Address: get('#field-party2-address'),
    party2Email:   get('#field-party2-email'),
    // Step 2
    description:  get('#field-desc'),
    deliverables: get('#field-deliverables'),
    exclusions:   get('#field-exclusions'),
    startDate:    get('#field-start-date'),
    duration:     get('#field-duration'),
    // Step 3
    price:         get('#field-price'),
    currency:      get('#field-currency'),
    paymentType:   get('#field-payment-type'),
    paymentMethod: get('#field-payment-method'),
    latePenalty:   checked('#check-late-penalty') ? get('#field-late-penalty') : '',
    breachPenalty: get('#field-breach-penalty'),
    // Step 4
    jurisdiction:            get('#field-jurisdiction'),
    clauseConfidentiality:   checked('#check-confidentiality'),
    clauseNonCompete:        checked('#check-non-compete'),
    nonCompetePeriod:        get('#field-non-compete-period'),
    clauseIPRights:          checked('#check-ip-rights'),
    clauseDisputeResolution: checked('#check-dispute-resolution'),
    clauseEarlyTermination:  checked('#check-early-termination'),
    earlyTerminationNotice:  get('#field-early-termination-notice'),
    clauseForceMajeure:      checked('#check-force-majeure'),
    clauseDataProtection:    checked('#check-data-protection'),
    tone:                    get('#field-tone') || 'standard',
    notes:                   get('#field-notes'),
  };
}

// ─── AUTOSAVE ─────────────────────────────────────────────────────────────────
function saveDraft() {
  const draft = {
    contractType: state.contractType,
    mode: state.mode,
    formData: state.formData,
    step: state.currentStep,
  };
  try { localStorage.setItem(LS_DRAFT, JSON.stringify(draft)); } catch {}
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(LS_DRAFT);
    if (!raw) return;
    const draft = JSON.parse(raw);
    if (!draft) return;

    if (draft.contractType) {
      state.contractType = draft.contractType;
      renderContractTypeCards();
    }

    if (draft.formData) {
      const fd = draft.formData;
      const set = (sel, val) => { const el = $(sel); if (el && val) el.value = val; };
      const setChecked = (sel, val) => { const el = $(sel); if (el) el.checked = !!val; };

      set('#field-party1-name',   fd.party1Name);
      set('#field-party1-taxid',  fd.party1TaxId);
      set('#field-party1-address', fd.party1Address);
      set('#field-party1-email',  fd.party1Email);
      set('#field-party2-name',   fd.party2Name);
      set('#field-party2-taxid',  fd.party2TaxId);
      set('#field-party2-address', fd.party2Address);
      set('#field-party2-email',  fd.party2Email);

      set('#field-desc',         fd.description);
      set('#field-deliverables', fd.deliverables);
      set('#field-exclusions',   fd.exclusions);
      set('#field-start-date',   fd.startDate);
      set('#field-duration',     fd.duration);

      set('#field-price',          fd.price);
      set('#field-currency',       fd.currency);
      set('#field-payment-type',   fd.paymentType);
      set('#field-payment-method', fd.paymentMethod);
      set('#field-late-penalty',   fd.latePenalty);
      set('#field-breach-penalty', fd.breachPenalty);
      setChecked('#check-late-penalty', fd.latePenalty);

      set('#field-jurisdiction', fd.jurisdiction);
      setChecked('#check-confidentiality',    fd.clauseConfidentiality);
      setChecked('#check-non-compete',         fd.clauseNonCompete);
      set('#field-non-compete-period',         fd.nonCompetePeriod);
      setChecked('#check-ip-rights',           fd.clauseIPRights);
      setChecked('#check-dispute-resolution',  fd.clauseDisputeResolution);
      setChecked('#check-early-termination',   fd.clauseEarlyTermination);
      set('#field-early-termination-notice',   fd.earlyTerminationNotice);
      setChecked('#check-force-majeure',       fd.clauseForceMajeure);
      setChecked('#check-data-protection',     fd.clauseDataProtection);
      set('#field-notes',  fd.notes);

      // trigger clause visibility
      if (fd.clauseNonCompete) $('#non-compete-extra')?.classList.add('visible');
      if (fd.clauseEarlyTermination) $('#early-termination-extra')?.classList.add('visible');
      if (fd.latePenalty) {
        const w = $('#late-penalty-input-wrap');
        if (w) w.style.display = 'block';
      }

      if (fd.tone) {
        $$('.tone-btn').forEach(b => b.classList.remove('active'));
        $(`[data-tone="${fd.tone}"]`)?.classList.add('active');
        const toneInput = $('#field-tone');
        if (toneInput) toneInput.value = fd.tone;
      }
    }
    state.formData = draft.formData || {};
  } catch {}
}

function showAutosaveIndicator() {
  const ind = $('#autosave-indicator');
  if (!ind) return;
  ind.classList.add('visible');
  clearTimeout(ind._timer);
  ind._timer = setTimeout(() => ind.classList.remove('visible'), 2500);
}

// ─── LOGO UPLOAD ──────────────────────────────────────────────────────────────
function initLogoUpload() {
  const dropzone    = $('#logo-dropzone');
  const fileInput   = $('#logo-file-input');
  const previewWrap = $('#logo-preview-wrap');
  const previewImg  = $('#logo-preview-img');
  const previewName = $('#logo-preview-name');
  const btnRemove   = $('#btn-logo-remove');
  const noLogoBtn   = $('#logo-no-logo');
  const errorEl     = $('#logo-error');

  if (!dropzone) return;

  function setNoLogo() {
    state.logoDataUrl = null;
    state.logoFileName = '';
    previewWrap.classList.remove('visible');
    dropzone.style.display = '';
    noLogoBtn.classList.add('selected');
    errorEl.classList.remove('visible');
    updateLogoInUI();
  }

  function handleFile(file) {
    if (!file) return;
    // Validate type
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowed.includes(file.type)) {
      errorEl.textContent = t('step4.logoTypeError');
      errorEl.classList.add('visible');
      return;
    }
    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      errorEl.textContent = t('step4.logoSizeError');
      errorEl.classList.add('visible');
      return;
    }
    errorEl.classList.remove('visible');

    const reader = new FileReader();
    reader.onload = (e) => {
      state.logoDataUrl  = e.target.result;
      state.logoFileName = file.name;
      previewImg.src    = state.logoDataUrl;
      previewName.textContent = file.name;
      previewWrap.classList.add('visible');
      dropzone.style.display = 'none';
      noLogoBtn.classList.remove('selected');
      updateLogoInUI();
    };
    reader.readAsDataURL(file);
  }

  // Click to open file dialog (handled by input)
  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.[0]) handleFile(fileInput.files[0]);
  });

  // Drag and drop
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  });

  // Remove logo
  btnRemove?.addEventListener('click', () => {
    previewWrap.classList.remove('visible');
    dropzone.style.display = '';
    state.logoDataUrl = null;
    state.logoFileName = '';
    if (fileInput) fileInput.value = '';
    noLogoBtn.classList.add('selected');
    updateLogoInUI();
  });

  // No logo option
  noLogoBtn?.addEventListener('click', setNoLogo);

  // Init: no logo selected
  setNoLogo();
}

function updateLogoInUI() {
  // Live preview logo
  const previewLogoHeader = $('#preview-logo-header');
  const previewLogoImg    = $('#preview-logo-img');
  if (previewLogoHeader && previewLogoImg) {
    if (state.logoDataUrl) {
      previewLogoImg.src = state.logoDataUrl;
      previewLogoHeader.classList.add('visible');
    } else {
      previewLogoHeader.classList.remove('visible');
    }
  }
  // Result logo
  const resultDocLogo    = $('#result-doc-logo');
  const resultDocLogoImg = $('#result-doc-logo-img');
  if (resultDocLogo && resultDocLogoImg) {
    if (state.logoDataUrl) {
      resultDocLogoImg.src = state.logoDataUrl;
      resultDocLogo.classList.add('visible');
    } else {
      resultDocLogo.classList.remove('visible');
    }
  }
}

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────
function updateLivePreview() {
  const previewEl = $('#preview-pre');
  const placeholder = $('#preview-placeholder');
  if (!previewEl) return;

  collectFormData();
  const fd = state.formData;

  if (!fd.party1Name || !fd.party2Name || !fd.description || !state.contractType) {
    previewEl.textContent = '';
    placeholder?.style && (placeholder.style.display = 'block');
    previewEl.style.display = 'none';
    return;
  }

  placeholder && (placeholder.style.display = 'none');
  previewEl.style.display = '';

  try {
    const contract = buildContract(fd, state.lang);
    previewEl.textContent = contract.substring(0, 1200) + (contract.length > 1200 ? '\n\n[...]' : '');
  } catch (e) {
    previewEl.textContent = '';
  }

  updateLogoInUI();
}

const debouncedPreviewUpdate = debounce(updateLivePreview, 200);

// ─── GENERATE CONTRACT ────────────────────────────────────────────────────────
async function handleGenerate() {
  if (!validateStep(4)) return;
  if (!state.contractType) { showToast(t('errors.contractTypeRequired')); return; }
  collectFormData();

  if (state.mode === 'online') {
    const key = sessionStorage.getItem(SS_API_KEY)?.trim();
    if (!key) { showToast(t('errors.apiKeyMissing')); return; }
    if (!key.startsWith('gsk_')) { showToast(t('errors.apiKeyInvalid')); return; }
    await generateWithGroq(key);
  } else {
    generateOffline();
  }
}

function generateOffline() {
  showResult(buildContract(state.formData, state.lang), false);
}

async function generateWithGroq(apiKey) {
  state.isGenerating = true;
  showSkeleton(true);

  const systemPrompt = buildSystemPrompt(state.contractType, state.lang);
  const userMessage  = buildUserMessage(state.formData, state.lang);

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 3000,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('Groq error:', res.status, errBody);
      throw new Error(res.status === 401 ? t('errors.apiKeyInvalid') : t('errors.groqError'));
    }

    const data = await res.json();
    const contract = data.choices?.[0]?.message?.content;
    if (!contract) throw new Error(t('errors.groqError'));

    showResult(contract, true);
  } catch (err) {
    showSkeleton(false);
    state.isGenerating = false;
    if (err.name === 'TypeError') {
      showToast(t('errors.networkError'));
    } else {
      showToast(err.message || t('errors.groqError'));
    }
  }
}

function buildUserMessage(fd, lang) {
  const isEs = lang !== 'en';
  const toneMap = {
    es: { formal: 'formal y jurídicamente riguroso', standard: 'estándar y profesional', simple: 'simplificado y claro' },
    en: { formal: 'formal and legally rigorous', standard: 'standard and professional', simple: 'simplified and clear' },
  };
  const toneLabel = (toneMap[isEs ? 'es' : 'en'][fd.tone]) || (isEs ? 'estándar' : 'standard');

  if (isEs) {
    return `Por favor, genera un contrato con los siguientes datos:

TIPO DE CONTRATO: ${fd.contractType}
TONO: ${toneLabel}

PRIMERA PARTE (Contratante/Cliente):
- Nombre: ${fd.party1Name}
- Tipo: ${fd.party1Type === 'company' ? 'Persona jurídica' : 'Persona física'}
${fd.party1TaxId  ? `- Identificación fiscal: ${fd.party1TaxId}` : ''}
${fd.party1Address ? `- Dirección: ${fd.party1Address}` : ''}
${fd.party1Email   ? `- Email: ${fd.party1Email}` : ''}

SEGUNDA PARTE (Prestador/Contratista):
- Nombre: ${fd.party2Name}
- Tipo: ${fd.party2Type === 'company' ? 'Persona jurídica' : 'Persona física'}
${fd.party2TaxId  ? `- Identificación fiscal: ${fd.party2TaxId}` : ''}
${fd.party2Address ? `- Dirección: ${fd.party2Address}` : ''}
${fd.party2Email   ? `- Email: ${fd.party2Email}` : ''}

OBJETO DEL CONTRATO:
${fd.description}
${fd.deliverables ? `Entregables: ${fd.deliverables}` : ''}
${fd.exclusions   ? `Exclusiones: ${fd.exclusions}` : ''}
${fd.startDate    ? `Fecha de inicio: ${fd.startDate}` : ''}
${fd.duration     ? `Duración: ${fd.duration}` : ''}

CONDICIONES ECONÓMICAS:
- Precio: ${fd.price} ${fd.currency || ''}
- Forma de pago: ${fd.paymentType || ''}
${fd.paymentMethod ? `- Método de pago: ${fd.paymentMethod}` : ''}
${fd.latePenalty  ? `- Penalización por retraso: ${fd.latePenalty}` : ''}
${fd.breachPenalty ? `- Penalización por incumplimiento: ${fd.breachPenalty}` : ''}

CLÁUSULAS ADICIONALES REQUERIDAS:
${fd.clauseConfidentiality   ? '- Incluir cláusula de confidencialidad (NDA)' : ''}
${fd.clauseNonCompete        ? `- Incluir cláusula de no competencia (duración: ${fd.nonCompetePeriod || 'a determinar'})` : ''}
${fd.clauseIPRights          ? '- Incluir cláusula de propiedad intelectual' : ''}
${fd.clauseDisputeResolution ? '- Incluir cláusula de resolución de disputas (mediación → arbitraje → judicial)' : ''}
${fd.clauseEarlyTermination  ? `- Incluir cláusula de terminación anticipada (preaviso: ${fd.earlyTerminationNotice || 'razonable'})` : ''}
${fd.clauseForceMajeure      ? '- Incluir cláusula de fuerza mayor' : ''}
${fd.clauseDataProtection    ? '- Incluir cláusula de protección de datos personales' : ''}

JURISDICCIÓN: ${fd.jurisdiction || 'España'}
${fd.notes ? `NOTAS ADICIONALES: ${fd.notes}` : ''}`;
  } else {
    return `Please generate a contract with the following details:

CONTRACT TYPE: ${fd.contractType}
TONE: ${toneLabel}

FIRST PARTY (Client/Principal):
- Name: ${fd.party1Name}
- Type: ${fd.party1Type === 'company' ? 'Legal entity' : 'Individual'}
${fd.party1TaxId  ? `- Tax ID: ${fd.party1TaxId}` : ''}
${fd.party1Address ? `- Address: ${fd.party1Address}` : ''}
${fd.party1Email   ? `- Email: ${fd.party1Email}` : ''}

SECOND PARTY (Provider/Contractor):
- Name: ${fd.party2Name}
- Type: ${fd.party2Type === 'company' ? 'Legal entity' : 'Individual'}
${fd.party2TaxId  ? `- Tax ID: ${fd.party2TaxId}` : ''}
${fd.party2Address ? `- Address: ${fd.party2Address}` : ''}
${fd.party2Email   ? `- Email: ${fd.party2Email}` : ''}

CONTRACT SUBJECT:
${fd.description}
${fd.deliverables ? `Deliverables: ${fd.deliverables}` : ''}
${fd.exclusions   ? `Exclusions: ${fd.exclusions}` : ''}
${fd.startDate    ? `Start date: ${fd.startDate}` : ''}
${fd.duration     ? `Duration: ${fd.duration}` : ''}

ECONOMIC CONDITIONS:
- Price: ${fd.price} ${fd.currency || ''}
- Payment schedule: ${fd.paymentType || ''}
${fd.paymentMethod ? `- Payment method: ${fd.paymentMethod}` : ''}
${fd.latePenalty  ? `- Late payment penalty: ${fd.latePenalty}` : ''}
${fd.breachPenalty ? `- Breach penalty: ${fd.breachPenalty}` : ''}

REQUIRED ADDITIONAL CLAUSES:
${fd.clauseConfidentiality   ? '- Include confidentiality clause (NDA)' : ''}
${fd.clauseNonCompete        ? `- Include non-compete clause (duration: ${fd.nonCompetePeriod || 'to be determined'})` : ''}
${fd.clauseIPRights          ? '- Include intellectual property clause' : ''}
${fd.clauseDisputeResolution ? '- Include dispute resolution clause (mediation → arbitration → judicial)' : ''}
${fd.clauseEarlyTermination  ? `- Include early termination clause (notice: ${fd.earlyTerminationNotice || 'reasonable'})` : ''}
${fd.clauseForceMajeure      ? '- Include force majeure clause' : ''}
${fd.clauseDataProtection    ? '- Include personal data protection clause' : ''}

JURISDICTION: ${fd.jurisdiction || 'United States'}
${fd.notes ? `ADDITIONAL NOTES: ${fd.notes}` : ''}`;
  }
}

// ─── RESULT ───────────────────────────────────────────────────────────────────
function showSkeleton(show) {
  const skeleton = $('#skeleton-loader');
  const result   = $('#result-content');
  if (skeleton) skeleton.style.display = show ? 'block' : 'none';
  if (result)   result.style.display   = show ? 'none'  : 'block';

  const section = $('#result-section');
  if (show && section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showResult(contract, isAI) {
  state.generatedContract = contract;
  state.isGenerating = false;
  state.isFavorite   = false;

  showSkeleton(false);

  const section = $('#result-section');
  if (section) {
    section.style.display = 'block';
    setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  // Badge
  const badge = $('#result-badge');
  if (badge) {
    badge.textContent = isAI ? t('result.badgeAI') : t('result.badgeOffline');
    badge.className = `result-badge${isAI ? '' : ' offline'}`;
  }

  // Content
  const pre = $('#result-pre');
  if (pre) pre.textContent = contract;

  // Logo
  updateLogoInUI();

  // Disclaimer
  const disc = $('#result-disclaimer-text');
  if (disc) disc.textContent = t('result.disclaimer');

  // Favorite btn
  updateFavoriteBtn();

  // Save to history
  addToHistory(contract, isAI);

  // Mostrar ad post-resultado y sticky footer ad
  const adPostResult = $('#ad-slot-postresult');
  if (adPostResult) adPostResult.style.display = 'block';
  if (window._adsenseLoaded && adPostResult) {
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  }
}

function updateFavoriteBtn() {
  const btn = $('#btn-favorite');
  if (!btn) return;
  btn.textContent = state.isFavorite ? t('result.favoriteRemove') : t('result.favoriteAdd');
}

// ─── RESULT ACTION BUTTONS ───────────────────────────────────────────────────
function initResultActions() {
  // ── Download dropdown toggle
  const dlToggle = $('#btn-download-toggle');
  const dlDropdown = $('#download-dropdown');
  if (dlToggle && dlDropdown) {
    dlToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = dlDropdown.classList.toggle('open');
      dlToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Cerrar al clicar fuera
    document.addEventListener('click', () => {
      dlDropdown.classList.remove('open');
      dlToggle.setAttribute('aria-expanded', 'false');
    });
    // Cerrar con ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dlDropdown.classList.remove('open');
        dlToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  $('#btn-copy')?.addEventListener('click', () => {
    if (!state.generatedContract) return;
    navigator.clipboard.writeText(state.generatedContract).then(() => {
      const btn = $('#btn-copy');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = t('result.copied');
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    }).catch(() => {
      // Fallback for browsers without clipboard API
      const ta = document.createElement('textarea');
      ta.value = state.generatedContract;
      ta.style.cssText = 'position:absolute;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      const btn = $('#btn-copy');
      if (btn) {
        const orig = btn.textContent;
        btn.textContent = t('result.copied');
        setTimeout(() => { btn.textContent = orig; }, 2000);
      }
    });
  });

  $('#btn-download')?.addEventListener('click', () => {
    if (!state.generatedContract) return;
    const blob = new Blob([state.generatedContract], { type: 'text/plain;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const typeName = state.contractType || 'contrato';
    const party1   = state.formData.party1Name?.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || '';
    a.download = `ContratosExpress_${typeName}_${party1}_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  $('#btn-download-docx')?.addEventListener('click', () => {
    downloadDocx();
  });

  $('#btn-download-pdf')?.addEventListener('click', () => {
    downloadPdf();
  });

  $('#btn-regenerate')?.addEventListener('click', () => {
    handleGenerate();
  });

  $('#btn-new-contract')?.addEventListener('click', () => {
    if (!confirm(state.lang === 'es'
      ? '¿Seguro que quieres empezar un contrato nuevo? Se perderán los datos actuales.'
      : 'Are you sure you want to start a new contract? Current data will be lost.')) return;
    resetAll();
  });

  $('#btn-favorite')?.addEventListener('click', () => {
    if (!state.generatedContract) return;
    toggleFavorite();
  });

  // Variants
  $$('.variant-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!state.generatedContract) return;
      const variant  = chip.dataset.variant;
      const modified = applyVariant(state.generatedContract, variant, state.lang);
      state.generatedContract = modified;
      const pre = $('#result-pre');
      if (pre) pre.textContent = modified;
    });
  });
}

// ─── EXPORT: DOCX ───────────────────────────────────────────────────────────
async function downloadDocx() {
  if (!state.generatedContract) return;

  const btn = $('#btn-download-docx');
  const origText = btn?.textContent;
  if (btn) btn.textContent = t('result.exportingDocx');

  try {
    // Lazy-load docx library from CDN
    if (!window.docx) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/docx@8/build/index.min.js';
        script.onload = resolve;
        script.onerror = () => reject(new Error('docx lib failed to load'));
        document.head.appendChild(script);
      });
    }

    const { Document, Packer, Paragraph, TextRun, HeadingLevel,
            ImageRun, AlignmentType, BorderStyle, ShadingType } = window.docx;

    const children = [];

    // Logo
    if (state.logoDataUrl && !state.logoDataUrl.includes('svg')) {
      try {
        const base64 = state.logoDataUrl.split(',')[1];
        const imgType = state.logoDataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        children.push(new Paragraph({
          children: [new ImageRun({
            data: bytes.buffer,
            transformation: { width: 160, height: 60 },
            type: imgType,
          })],
          alignment: AlignmentType.LEFT,
          spacing: { after: 200 },
        }));
      } catch (_) { /* skip logo if error */ }
    }

    // Contract lines
    const lines = state.generatedContract.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      const isAllCaps = trimmed.length > 3 && trimmed.length < 80
        && trimmed === trimmed.toUpperCase() && /[A-ZÁÉÍÓÚÑ]/.test(trimmed);
      const isSeparator = /^[─═=\-]{3,}$/.test(trimmed);

      if (isSeparator) {
        children.push(new Paragraph({ text: '', spacing: { after: 80 } }));
      } else if (isAllCaps && trimmed.length > 0) {
        children.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 24 })],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 80 },
        }));
      } else {
        children.push(new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 60 },
        }));
      }
    }

    // Footer
    children.push(new Paragraph({ text: '', spacing: { before: 400 } }));
    children.push(new Paragraph({
      children: [new TextRun({
        text: 'Generado con ContratosExpress.pro · by MolvicStudios · https://contratosexpress.pro/',
        color: '888888',
        italics: true,
        size: 16,
      })],
    }));

    const doc = new Document({
      creator: 'ContratosExpress.pro by MolvicStudios',
      title: `ContratosExpress — ${state.contractType || 'contrato'}`,
      sections: [{
        properties: {},
        children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    const typeName = state.contractType || 'contrato';
    const party1   = state.formData.party1Name?.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || '';
    a.download = `ContratosExpress_${typeName}_${party1}_${Date.now()}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('DOCX export error:', err);
    showToast(state.lang === 'es'
      ? 'Error al generar el .docx. Inténtalo de nuevo.'
      : 'Error generating .docx. Please try again.');
  } finally {
    if (btn && origText) btn.textContent = origText;
  }
}

// ─── EXPORT: PDF ─────────────────────────────────────────────────────────────
function downloadPdf() {
  if (!state.generatedContract) return;

  const btn = $('#btn-download-pdf');
  const origText = btn?.textContent;
  if (btn) btn.textContent = t('result.exportingPdf');

  const typeName = (state.contractType || 'contrato').toUpperCase();
  const logoHtml = (state.logoDataUrl && !state.logoDataUrl.includes('svg+xml;base64,'))
    ? `<div class="logo-wrap"><img src="${state.logoDataUrl}" alt="Logo"></div>`
    : '';

  const contractHtml = escapeHtml(state.generatedContract)
    .replace(/─{3,}|={3,}/g, '<hr>')
    .replace(/\n/g, '<br>');

  const htmlContent = `<!DOCTYPE html>
<html lang="${state.lang}">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(typeName)} — ContratosExpress.pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', 'Times New Roman', Times, serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #111;
      background: #fff;
      padding: 40px 56px;
      max-width: 860px;
      margin: 0 auto;
    }
    .logo-wrap {
      margin-bottom: 24px;
    }
    .logo-wrap img {
      max-height: 80px;
      max-width: 220px;
      object-fit: contain;
      display: block;
    }
    .contract-body {
      white-space: pre-wrap;
      word-break: break-word;
      font-size: 11pt;
    }
    hr {
      border: none;
      border-top: 1px solid #ccc;
      margin: 16px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #ddd;
      font-size: 8pt;
      color: #888;
      text-align: center;
      font-family: Arial, sans-serif;
    }
    @media print {
      body { padding: 0; font-size: 10.5pt; }
      @page { margin: 22mm 18mm; }
      .footer { position: fixed; bottom: 0; width: 100%; }
    }
  </style>
</head>
<body>
  ${logoHtml}
  <div class="contract-body">${contractHtml}</div>
  <div class="footer">ContratosExpress.pro &middot; by MolvicStudios &middot; Documento de orientaci&oacute;n, no constituye asesoramiento legal</div>
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 300);
    });
  <\/script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');

  if (!win) {
    // Popup blocked — download as HTML fallback
    const a = document.createElement('a');
    a.href = url;
    const party1 = state.formData.party1Name?.replace(/[^a-z0-9]/gi, '_').substring(0, 20) || '';
    a.download = `ContratosExpress_${state.contractType || 'contrato'}_${party1}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(state.lang === 'es'
      ? 'Popups bloqueados. Descargando como HTML — ábrelo con Chrome y usa Ctrl+P para imprimir como PDF.'
      : 'Popups blocked. Downloading as HTML — open it in Chrome and use Ctrl+P to print as PDF.');
  }

  setTimeout(() => URL.revokeObjectURL(url), 30000);
  if (btn && origText) setTimeout(() => { btn.textContent = origText; }, 1000);
}

function resetAll() {
  state.contractType = null;
  state.currentStep  = 1;
  state.formData     = {};
  state.generatedContract = null;
  state.isFavorite   = false;
  state.logoDataUrl  = null;
  state.logoFileName = '';

  // Reset form fields
  $$('input:not([type=hidden]), textarea, select').forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });

  // Reset type toggles
  initTypeToggle('party1');
  initTypeToggle('party2');
  initToneToggle();

  // Clause extras
  $('#non-compete-extra')?.classList.remove('visible');
  $('#early-termination-extra')?.classList.remove('visible');
  const lpWrap = $('#late-penalty-input-wrap');
  if (lpWrap) lpWrap.style.display = 'none';

  // Logo reset
  const noLogoBtn   = $('#logo-no-logo');
  const previewWrap = $('#logo-preview-wrap');
  const dropzone    = $('#logo-dropzone');
  noLogoBtn?.classList.add('selected');
  previewWrap?.classList.remove('visible');
  if (dropzone) dropzone.style.display = '';

  // Hide result
  const resultSection = $('#result-section');
  if (resultSection) resultSection.style.display = 'none';

  localStorage.removeItem(LS_DRAFT);
  renderContractTypeCards();
  showStep(1);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─── HISTORY ──────────────────────────────────────────────────────────────────
function getHistory() {
  try { return JSON.parse(localStorage.getItem(LS_HISTORY) || '[]'); } catch { return []; }
}
function saveHistory(arr) {
  try { localStorage.setItem(LS_HISTORY, JSON.stringify(arr.slice(0, 50))); } catch {}
}

function addToHistory(contract, isAI) {
  const history = getHistory();
  const entry = {
    id:           Date.now(),
    date:         new Date().toISOString(),
    contractType: state.contractType,
    party1Name:   state.formData.party1Name || '',
    party2Name:   state.formData.party2Name || '',
    isAI,
    contract,
    lang:         state.lang,
  };
  history.unshift(entry);
  saveHistory(history);
}

function toggleFavorite() {
  const favorites = getFavorites();
  const existing  = favorites.findIndex(f => f.contract === state.generatedContract);
  if (existing >= 0) {
    favorites.splice(existing, 1);
    state.isFavorite = false;
  } else {
    favorites.unshift({
      id:           Date.now(),
      date:         new Date().toISOString(),
      contractType: state.contractType,
      party1Name:   state.formData.party1Name || '',
      party2Name:   state.formData.party2Name || '',
      contract:     state.generatedContract,
      lang:         state.lang,
    });
    state.isFavorite = true;
  }
  try { localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites)); } catch {}
  updateFavoriteBtn();
}

function getFavorites() {
  try { return JSON.parse(localStorage.getItem(LS_FAVORITES) || '[]'); } catch { return []; }
}

// ─── PANELS (History & Favorites) ────────────────────────────────────────────
function initPanels() {
  // History
  $('#btn-history')?.addEventListener('click', () => openPanel('history'));
  $('#btn-close-history')?.addEventListener('click', () => closePanel('history'));
  $('#overlay-history')?.addEventListener('click', (e) => {
    if (e.target.id === 'overlay-history') closePanel('history');
  });
  $('#btn-clear-history')?.addEventListener('click', () => {
    if (confirm(t('history.confirmClear'))) {
      localStorage.removeItem(LS_HISTORY);
      renderHistoryList();
    }
  });

  // Favorites
  $('#btn-favorites')?.addEventListener('click', () => openPanel('favorites'));
  $('#btn-close-favorites')?.addEventListener('click', () => closePanel('favorites'));
  $('#overlay-favorites')?.addEventListener('click', (e) => {
    if (e.target.id === 'overlay-favorites') closePanel('favorites');
  });
  $('#btn-clear-favorites')?.addEventListener('click', () => {
    if (confirm(t('favorites.confirmClear'))) {
      localStorage.removeItem(LS_FAVORITES);
      renderFavoritesList();
    }
  });

  // ESC key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePanel('history');
      closePanel('favorites');
    }
  });
}

function openPanel(type) {
  const overlay = $(`#overlay-${type}`);
  if (overlay) overlay.classList.add('open');
  if (type === 'history')   renderHistoryList();
  if (type === 'favorites') renderFavoritesList();
}
function closePanel(type) {
  $(`#overlay-${type}`)?.classList.remove('open');
}

function makePanelItem(entry, type) {
  const item = document.createElement('div');
  item.className = 'history-item';

  const info = document.createElement('div');
  info.className = 'history-item-info';

  const typeEl = document.createElement('div');
  typeEl.className = 'history-item-type';
  typeEl.textContent = entry.contractType?.toUpperCase() || '—';

  const title = document.createElement('div');
  title.className = 'history-item-title';
  title.textContent = `${entry.party1Name} ↔ ${entry.party2Name}`;

  const date = document.createElement('div');
  date.className = 'history-item-date';
  date.textContent = formatDateShort(entry.date);

  info.appendChild(typeEl);
  info.appendChild(title);
  info.appendChild(date);

  const actions = document.createElement('div');
  actions.className = 'history-item-actions';

  const loadBtn = document.createElement('button');
  loadBtn.className = 'btn btn-sm btn-secondary';
  loadBtn.textContent = type === 'history' ? t('history.loadBtn') : t('favorites.loadBtn');
  loadBtn.addEventListener('click', () => {
    state.generatedContract = entry.contract;
    state.lang = entry.lang || state.lang;
    showResult(entry.contract, entry.isAI);
    closePanel(type);
  });

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-sm btn-ghost';
  delBtn.textContent = type === 'history' ? t('history.deleteBtn') : t('favorites.removeBtn');
  delBtn.addEventListener('click', () => {
    if (type === 'history') {
      const arr = getHistory().filter(h => h.id !== entry.id);
      saveHistory(arr);
      renderHistoryList();
    } else {
      const arr = getFavorites().filter(f => f.id !== entry.id);
      try { localStorage.setItem(LS_FAVORITES, JSON.stringify(arr)); } catch {}
      renderFavoritesList();
    }
  });

  actions.appendChild(loadBtn);
  actions.appendChild(delBtn);
  item.appendChild(info);
  item.appendChild(actions);
  return item;
}

function renderHistoryList() {
  const list = $('#history-list');
  if (!list) return;
  const history = getHistory();
  list.innerHTML = '';
  if (history.length === 0) {
    list.innerHTML = `<div class="panel-empty">${t('history.empty')}</div>`;
    return;
  }
  history.forEach(entry => list.appendChild(makePanelItem(entry, 'history')));
}

function renderFavoritesList() {
  const list = $('#favorites-list');
  if (!list) return;
  const favs = getFavorites();
  list.innerHTML = '';
  if (favs.length === 0) {
    list.innerHTML = `<div class="panel-empty">${t('favorites.empty')}</div>`;
    return;
  }
  favs.forEach(entry => list.appendChild(makePanelItem(entry, 'favorites')));
}

// ─── COOKIE BANNER ────────────────────────────────────────────────────────────
function initCookieBanner() {
  const banner = $('#cookie-banner');
  if (!banner) return;
  if (!localStorage.getItem(LS_COOKIES)) {
    banner.classList.add('visible');
  } else {
    // Ya aceptadas: cargar AdSense ahora
    loadAdSense();
  }
  $('#btn-cookie-accept')?.addEventListener('click', () => {
    localStorage.setItem(LS_COOKIES, 'true');
    banner.classList.remove('visible');
    loadAdSense();
  });
}

// ─── CARGA CONDICIONAL DE ADSENSE (solo tras consentimiento) ──────────────────
function loadAdSense() {
  if (window._adsenseLoaded) return;
  window._adsenseLoaded = true;

  const placeholder = document.getElementById('adsense-script');
  if (!placeholder) return;

  const src = placeholder.dataset.src;
  if (!src) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);

  script.onload = () => {
    // Inicializar todos los ins.adsbygoogle presentes
    try {
      document.querySelectorAll('ins.adsbygoogle').forEach(() => {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      });
    } catch (e) { /* ignorar errores de AdSense */ }

    // Mostrar sticky footer ad en móvil
    const stickyAd = document.getElementById('ad-sticky-footer');
    if (stickyAd && window.innerWidth <= 768) {
      stickyAd.style.display = 'flex';
    }
  };
}

// ─── EVENT DELEGATION FOR WIZARD INPUTS → LIVE PREVIEW ───────────────────────
function initLivePreviewListeners() {
  const fields = [
    '#field-party1-name', '#field-party2-name', '#field-desc',
    '#field-deliverables', '#field-exclusions',
    '#field-price', '#field-currency', '#field-jurisdiction',
  ];
  fields.forEach(sel => {
    $(sel)?.addEventListener('input', debouncedPreviewUpdate);
  });
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
function init() {
  // Apply initial translations
  applyTranslations();

  // Lang toggle
  $('#btn-lang')?.addEventListener('click', toggleLang);

  // Render contract type cards
  renderContractTypeCards();

  // Mode selector
  initModeSelector();

  // Wizard
  initWizard();

  // Logo upload
  initLogoUpload();

  // Live preview
  initLivePreviewListeners();
  const previewSection = $('#preview-section');
  if (previewSection) {
    document.addEventListener('input', debouncedPreviewUpdate);
    document.addEventListener('change', debouncedPreviewUpdate);
  }

  // Result section: hide initially
  const resultSection = $('#result-section');
  if (resultSection) resultSection.style.display = 'none';

  // Result actions
  initResultActions();

  // Panels
  initPanels();

  // Cookie banner
  initCookieBanner();

  // Hero CTA → scroll to contract types
  $('#btn-hero-cta')?.addEventListener('click', () => {
    $('#contract-types-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Deep-link: ?type=services|freelance|nda|rental|employment
  const urlType = new URLSearchParams(window.location.search).get('type');
  if (urlType) {
    const validTypes = ['services', 'freelance', 'nda', 'rental', 'employment',
                        'sales', 'partnership', 'custom'];
    if (validTypes.includes(urlType)) {
      selectContractType(urlType);
      setTimeout(() => {
        $('#contract-types-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  console.log('ContratosExpress.pro initialized. by MolvicStudios');
}

// Boot
document.addEventListener('DOMContentLoaded', init);
