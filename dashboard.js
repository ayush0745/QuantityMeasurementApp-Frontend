const API_BASE = 'https://quantitymeasurementapp-production.up.railway.app';

const token = localStorage.getItem('token');
if (!token) {
  window.location.href = 'login.html';
}

const unitMaps = {
  length:      { type: 'LengthUnit',      units: ['FEET', 'INCHES', 'YARDS', 'CENTIMETERS'] },
  temperature: { type: 'TemperatureUnit', units: ['CELSIUS', 'FAHRENHEIT'] },
  volume:      { type: 'VolumeUnit',      units: ['LITRE', 'MILLILITRE', 'GALLON'] },
  weight:      { type: 'WeightUnit',      units: ['MILLIGRAM', 'GRAM', 'KILOGRAM', 'POUND', 'TONNE'] }
};

let currentType = 'length';

async function apiFetch(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
    throw new Error('Unauthorized');
  }
  return res;
}

async function getErrorMessage(res) {
  try {
    const data = await res.json();
    return data.message || 'Something went wrong';
  } catch {
    return `Error ${res.status}`;
  }
}

function showResult(text, isError = false) {
  const el = document.getElementById('result');
  el.textContent = text;
  el.className = 'qm-result' + (isError ? ' error' : '');
}

function getQuantity(valueId, unitId) {
  return {
    value: parseFloat(document.getElementById(valueId).value),
    unit: document.getElementById(unitId).value,
    measurementType: unitMaps[currentType].type
  };
}

function updateUnits(type) {
  currentType = type;
  const { units } = unitMaps[type];
  const currentSpans = [
    'convertFromCurrent', 'convertToCurrent',
    'compareQ1Current', 'compareQ2Current',
    'addQ1Current', 'addQ2Current',
    'subtractQ1Current', 'subtractQ2Current',
    'divideQ1Current', 'divideQ2Current'
  ];
  const unitSelects = [
    'convertFromUnit', 'convertToUnit',
    'q1Unit', 'q2Unit',
    'addQ1Unit', 'addQ2Unit',
    'subtractQ1Unit', 'subtractQ2Unit',
    'divideQ1Unit', 'divideQ2Unit'
  ];
  document.querySelectorAll('.qm-select').forEach(sel => {
    sel.innerHTML = units.map(u => `<option>${u}</option>`).join('');
  });
  const firstUnit = units[0];
  currentSpans.forEach(spanId => updateCurrentUnit(spanId, firstUnit));
  unitSelects.forEach((selectId, index) => {
    const sel = document.getElementById(selectId);
    if (sel) sel.value = firstUnit;
    sel?.addEventListener('change', () => updateCurrentUnit(currentSpans[index], sel.value));
  });
}

function updateCurrentUnit(spanId, unit) {
  const span = document.getElementById(spanId);
  if (span) span.textContent = unit;
}

// Type cards
document.querySelectorAll('.qm-type-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.qm-type-card').forEach(c => c.classList.remove('is-active'));
    card.classList.add('is-active');
    updateUnits(card.dataset.type);
  });
});

// Op tabs
document.querySelectorAll('.qm-op-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.qm-op-tab').forEach(t => t.classList.remove('is-active'));
    tab.classList.add('is-active');
    document.querySelectorAll('.op-section').forEach(s => s.classList.remove('is-active'));
    document.getElementById(tab.dataset.op + '-section').classList.add('is-active');
  });
});

// Convert
document.getElementById('convertBtn').addEventListener('click', async () => {
  const value      = parseFloat(document.getElementById('convertFromValue').value);
  const unit       = document.getElementById('convertFromUnit').value;
  const targetUnit = document.getElementById('convertToUnit').value;
  if (isNaN(value)) return showResult('Enter a valid number', true);
  showResult('Loading...');
  try {
    const res = await apiFetch('POST', `/api/quantity/convert?targetUnit=${targetUnit}`, {
      value, unit, measurementType: unitMaps[currentType].type
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById('convertToValue').value = data.value;
      showResult(`${data.value} ${data.unit}`);
    } else {
      showResult(await getErrorMessage(res), true);
    }
  } catch (e) {
    if (e.message !== 'Unauthorized') showResult('Error: ' + e.message, true);
  }
});

// Compare
document.getElementById('compareBtn').addEventListener('click', async () => {
  const q1 = getQuantity('q1Value', 'q1Unit');
  const q2 = getQuantity('q2Value', 'q2Unit');
  if (isNaN(q1.value) || isNaN(q2.value)) return showResult('Enter valid numbers', true);
  showResult('Loading...');
  try {
    const res = await apiFetch('POST', '/api/quantity/compare', { thisQuantity: q1, thatQuantity: q2 });
    if (res.ok) {
      showResult((await res.json()) ? 'Equal ✓' : 'Not Equal ✗');
    } else {
      showResult(await getErrorMessage(res), true);
    }
  } catch (e) {
    if (e.message !== 'Unauthorized') showResult('Error: ' + e.message, true);
  }
});

// Add
document.getElementById('addBtn').addEventListener('click', async () => {
  const q1 = getQuantity('addQ1Value', 'addQ1Unit');
  const q2 = getQuantity('addQ2Value', 'addQ2Unit');
  if (isNaN(q1.value) || isNaN(q2.value)) return showResult('Enter valid numbers', true);
  showResult('Loading...');
  try {
    const res = await apiFetch('POST', '/api/quantity/add', { thisQuantity: q1, thatQuantity: q2 });
    if (res.ok) {
      const data = await res.json();
      showResult(`${data.value} ${data.unit}`);
    } else {
      showResult(await getErrorMessage(res), true);
    }
  } catch (e) {
    if (e.message !== 'Unauthorized') showResult('Error: ' + e.message, true);
  }
});

// Subtract
document.getElementById('subtractBtn').addEventListener('click', async () => {
  const q1 = getQuantity('subtractQ1Value', 'subtractQ1Unit');
  const q2 = getQuantity('subtractQ2Value', 'subtractQ2Unit');
  if (isNaN(q1.value) || isNaN(q2.value)) return showResult('Enter valid numbers', true);
  showResult('Loading...');
  try {
    const res = await apiFetch('POST', '/api/quantity/subtract', { thisQuantity: q1, thatQuantity: q2 });
    if (res.ok) {
      const data = await res.json();
      showResult(`${data.value} ${data.unit}`);
    } else {
      showResult(await getErrorMessage(res), true);
    }
  } catch (e) {
    if (e.message !== 'Unauthorized') showResult('Error: ' + e.message, true);
  }
});

// Divide
document.getElementById('divideBtn').addEventListener('click', async () => {
  const q1 = getQuantity('divideQ1Value', 'divideQ1Unit');
  const q2 = getQuantity('divideQ2Value', 'divideQ2Unit');
  if (isNaN(q1.value) || isNaN(q2.value)) return showResult('Enter valid numbers', true);
  showResult('Loading...');
  try {
    const res = await apiFetch('POST', '/api/quantity/divide', { thisQuantity: q1, thatQuantity: q2 });
    if (res.ok) {
      showResult(`Result: ${await res.json()}`);
    } else {
      showResult(await getErrorMessage(res), true);
    }
  } catch (e) {
    if (e.message !== 'Unauthorized') showResult('Error: ' + e.message, true);
  }
});

// History
const historyPanel = document.getElementById('historyPanel');
const historyList  = document.getElementById('historyList');

document.getElementById('historyBtn').addEventListener('click', async () => {
  const open = historyPanel.classList.toggle('is-open');
  if (!open) return;
  historyList.innerHTML = '<li class="hist-loading">Loading...</li>';
  try {
    const res = await apiFetch('GET', '/api/quantity/history');
    if (!res.ok) { historyList.innerHTML = '<li class="hist-empty">Failed to load history.</li>'; return; }
    const data = await res.json();
    if (!data.length) { historyList.innerHTML = '<li class="hist-empty">No history yet.</li>'; return; }
    historyList.innerHTML = data.map(item => {
      const q1   = `${item.thisValue} ${item.thisUnit}`;
      const q2   = item.thatUnit ? ` &amp; ${item.thatValue} ${item.thatUnit}` : '';
      const time = new Date(item.createdAt).toLocaleString();
      return `<li class="hist-item">
        <span class="hist-op">${item.operation}</span>
        <span class="hist-detail">${q1}${q2} → <strong>${item.resultString}</strong></span>
        <span class="hist-time">${time}</span>
      </li>`;
    }).join('');
  } catch (e) {
    if (e.message !== 'Unauthorized') historyList.innerHTML = '<li class="hist-empty">Error loading history.</li>';
  }
});

document.getElementById('closeHistoryBtn').addEventListener('click', () => {
  historyPanel.classList.remove('is-open');
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

updateUnits('length');
