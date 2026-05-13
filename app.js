// ── USERS ──────────────────────────────────────────────
const USERS = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'staff', password: 'staff123', role: 'staff' }
];

let currentUser = null;
let editingCustId = null;
let editingTxnId = null;

// ── SAMPLE DATA ────────────────────────────────────────
let customers = [
  { id: 1, name: 'Maria Santos',    email: 'maria@email.com',  phone: '09171234567', region: 'North', joined: '2024-01-10' },
  { id: 2, name: 'Juan dela Cruz',  email: 'juan@email.com',   phone: '09182345678', region: 'South', joined: '2024-02-15' },
  { id: 3, name: 'Ana Reyes',       email: 'ana@email.com',    phone: '09193456789', region: 'East',  joined: '2024-03-20' },
  { id: 4, name: 'Carlos Bautista', email: 'carlos@email.com', phone: '09204567890', region: 'West',  joined: '2024-04-05' },
  { id: 5, name: 'Liza Gonzales',   email: 'liza@email.com',   phone: '09215678901', region: 'North', joined: '2024-05-12' },
  { id: 6, name: 'Pedro Ramos',     email: 'pedro@email.com',  phone: '09226789012', region: 'South', joined: '2024-06-01' },
];

let transactions = [
  { id: 1,  customerId: 1, amount: 1500, category: 'Purchase',     status: 'Completed', date: '2025-01-05', note: 'Grocery items'  },
  { id: 2,  customerId: 2, amount: 3200, category: 'Subscription', status: 'Completed', date: '2025-01-10', note: 'Annual plan'     },
  { id: 3,  customerId: 1, amount: 850,  category: 'Service',      status: 'Pending',   date: '2025-01-15', note: 'Repair service'  },
  { id: 4,  customerId: 3, amount: 4700, category: 'Purchase',     status: 'Completed', date: '2025-02-01', note: 'Electronics'     },
  { id: 5,  customerId: 4, amount: 2100, category: 'Purchase',     status: 'Failed',    date: '2025-02-08', note: 'Card declined'   },
  { id: 6,  customerId: 2, amount: 750,  category: 'Refund',       status: 'Completed', date: '2025-02-14', note: 'Return item'     },
  { id: 7,  customerId: 5, amount: 6300, category: 'Purchase',     status: 'Completed', date: '2025-03-03', note: 'Bulk order'      },
  { id: 8,  customerId: 3, amount: 1200, category: 'Subscription', status: 'Completed', date: '2025-03-10', note: 'Monthly plan'    },
  { id: 9,  customerId: 6, amount: 980,  category: 'Service',      status: 'Pending',   date: '2025-03-18', note: 'Consultation'    },
  { id: 10, customerId: 1, amount: 3400, category: 'Purchase',     status: 'Completed', date: '2025-04-02', note: 'Clothing'        },
  { id: 11, customerId: 5, amount: 1100, category: 'Subscription', status: 'Completed', date: '2025-04-15', note: 'Monthly'         },
  { id: 12, customerId: 4, amount: 5500, category: 'Purchase',     status: 'Completed', date: '2025-05-01', note: 'Furniture'       },
];

let custNextId = 7;
let txnNextId  = 13;

// ── HELPERS ────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

function money(n) {
  return 'P' + Number(n).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function custName(id) {
  const c = customers.find(function(x) { return x.id === id; });
  return c ? c.name : 'Unknown';
}

function statusBadge(s) {
  const map = { Completed: 'badge-success', Pending: 'badge-warning', Failed: 'badge-danger' };
  return '<span class="badge ' + (map[s] || 'badge-info') + '">' + s + '</span>';
}

function closeModal(id) {
  el(id).classList.add('hidden');
}

// ── AUTH ───────────────────────────────────────────────
function doLogin() {
  const u = el('login-user').value.trim();
  const p = el('login-pass').value.trim();
  const found = USERS.find(function(x) { return x.username === u && x.password === p; });

  if (!found) {
    el('login-err').textContent = 'Wrong username or password!';
    el('login-err').classList.remove('hidden');
    return;
  }

  currentUser = found;
  el('login-page').classList.add('hidden');
  el('main-app').classList.remove('hidden');
  el('nav-username').textContent = found.username + ' (' + found.role + ')';
  goPage('dashboard');
}

el('login-pass').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') doLogin();
});

function doLogout() {
  currentUser = null;
  el('main-app').classList.add('hidden');
  el('login-page').classList.remove('hidden');
  el('login-user').value = '';
  el('login-pass').value = '';
  el('login-err').classList.add('hidden');
}

// ── NAVIGATION ─────────────────────────────────────────
function goPage(page) {
  ['dashboard', 'customers', 'transactions', 'reports'].forEach(function(p) {
    el('page-' + p).classList.add('hidden');
  });
  document.querySelectorAll('.nav-link').forEach(function(l) {
    l.classList.remove('active');
  });

  el('page-' + page).classList.remove('hidden');

  const names = ['dashboard', 'customers', 'transactions', 'reports'];
  const btns  = document.querySelectorAll('.nav-link');
  const idx   = names.indexOf(page);
  if (idx >= 0) btns[idx].classList.add('active');

  if (page === 'dashboard')    renderDashboard();
  if (page === 'customers')    renderCustomers();
  if (page === 'transactions') renderTxns();
  if (page === 'reports')      renderReports();
}

// ── DASHBOARD ──────────────────────────────────────────
function renderDashboard() {
  const completedTxns = transactions.filter(function(t) { return t.status === 'Completed'; });
  const totalRev = completedTxns.reduce(function(s, t) { return s + t.amount; }, 0);
  const avgTxn   = completedTxns.length ? totalRev / completedTxns.length : 0;
  const maxTxn   = transactions.length  ? Math.max.apply(null, transactions.map(function(t) { return t.amount; })) : 0;
  const minTxn   = transactions.length  ? Math.min.apply(null, transactions.map(function(t) { return t.amount; })) : 0;

  el('dash-stats').innerHTML =
    '<div class="stat-card"><div class="stat-label">Total Customers</div><div class="stat-val">' + customers.length + '</div><div class="stat-sub">COUNT(customers)</div></div>' +
    '<div class="stat-card"><div class="stat-label">Total Revenue</div><div class="stat-val" style="font-size:18px">' + money(totalRev) + '</div><div class="stat-sub">SUM(completed)</div></div>' +
    '<div class="stat-card"><div class="stat-label">Avg Transaction</div><div class="stat-val" style="font-size:18px">' + money(avgTxn) + '</div><div class="stat-sub">AVG(txn amount)</div></div>' +
    '<div class="stat-card"><div class="stat-label">Highest Txn</div><div class="stat-val" style="font-size:18px">' + money(maxTxn) + '</div><div class="stat-sub">MAX(amount)</div></div>' +
    '<div class="stat-card"><div class="stat-label">Lowest Txn</div><div class="stat-val" style="font-size:18px">' + money(minTxn) + '</div><div class="stat-sub">MIN(amount)</div></div>' +
    '<div class="stat-card"><div class="stat-label">Total Transactions</div><div class="stat-val">' + transactions.length + '</div><div class="stat-sub">COUNT(transactions)</div></div>';

  const recent = transactions.slice().sort(function(a, b) {
    return b.date.localeCompare(a.date);
  }).slice(0, 6);

  el('dash-recent').innerHTML = recent.map(function(t) {
    return '<tr><td>' + t.date + '</td><td>' + custName(t.customerId) + '</td><td>' + t.category + '</td><td>' + money(t.amount) + '</td><td>' + statusBadge(t.status) + '</td></tr>';
  }).join('');

  const custSpend = customers.map(function(c) {
    const ctxns = transactions.filter(function(t) { return t.customerId === c.id && t.status === 'Completed'; });
    const total  = ctxns.reduce(function(s, t) { return s + t.amount; }, 0);
    const cnt    = ctxns.length;
    return { name: c.name, total: total, cnt: cnt, avg: cnt ? total / cnt : 0 };
  }).sort(function(a, b) { return b.total - a.total; }).slice(0, 5);

  el('dash-top-customers').innerHTML = custSpend.map(function(c) {
    return '<tr><td>' + c.name + '</td><td>' + money(c.total) + '</td><td>' + c.cnt + '</td><td>' + money(c.avg) + '</td></tr>';
  }).join('');
}

// ── CUSTOMERS ──────────────────────────────────────────
function renderCustomers() {
  const q   = (el('cust-search').value || '').toLowerCase();
  const reg = el('cust-filter-region').value;

  const list = customers.filter(function(c) {
    const matchQ = !q   || c.name.toLowerCase().indexOf(q) >= 0 || c.email.toLowerCase().indexOf(q) >= 0;
    const matchR = !reg || c.region === reg;
    return matchQ && matchR;
  });

  if (!list.length) {
    el('cust-tbody').innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;color:#aaa">No customers found</td></tr>';
    return;
  }

  el('cust-tbody').innerHTML = list.map(function(c) {
    return '<tr>' +
      '<td>' + c.name + '</td>' +
      '<td>' + c.email + '</td>' +
      '<td>' + c.phone + '</td>' +
      '<td>' + c.region + '</td>' +
      '<td>' + c.joined + '</td>' +
      '<td>' +
        '<button class="btn btn-sm" onclick="openEditCustomer(' + c.id + ')">Edit</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteCustomer(' + c.id + ')">Del</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function openAddCustomer() {
  editingCustId = null;
  el('modal-cust-title').textContent = 'Add Customer';
  el('cust-name').value  = '';
  el('cust-email').value = '';
  el('cust-phone').value = '';
  el('cust-region').value = 'North';
  el('cust-err').classList.add('hidden');
  el('modal-cust').classList.remove('hidden');
}

function openEditCustomer(id) {
  editingCustId = id;
  const c = customers.find(function(x) { return x.id === id; });
  el('modal-cust-title').textContent = 'Edit Customer';
  el('cust-name').value   = c.name;
  el('cust-email').value  = c.email;
  el('cust-phone').value  = c.phone;
  el('cust-region').value = c.region;
  el('cust-err').classList.add('hidden');
  el('modal-cust').classList.remove('hidden');
}

function saveCustomer() {
  const name   = el('cust-name').value.trim();
  const email  = el('cust-email').value.trim();
  const phone  = el('cust-phone').value.trim();
  const region = el('cust-region').value;

  if (!name || !email) {
    el('cust-err').textContent = 'Name and email are required!';
    el('cust-err').classList.remove('hidden');
    return;
  }

  if (editingCustId) {
    const c = customers.find(function(x) { return x.id === editingCustId; });
    c.name = name; c.email = email; c.phone = phone; c.region = region;
  } else {
    customers.push({
      id: custNextId++,
      name: name,
      email: email,
      phone: phone,
      region: region,
      joined: new Date().toISOString().slice(0, 10)
    });
  }

  closeModal('modal-cust');
  renderCustomers();
}

function deleteCustomer(id) {
  if (!confirm('Delete this customer? Their transactions will stay.')) return;
  customers = customers.filter(function(x) { return x.id !== id; });
  renderCustomers();
}

// ── TRANSACTIONS ───────────────────────────────────────
function renderTxns() {
  const q      = (el('txn-search').value || '').toLowerCase();
  const status = el('txn-filter-status').value;
  const cat    = el('txn-filter-cat').value;

  const list = transactions.filter(function(t) {
    const cn     = custName(t.customerId).toLowerCase();
    const matchQ = !q      || cn.indexOf(q) >= 0 || (t.note || '').toLowerCase().indexOf(q) >= 0;
    const matchS = !status || t.status === status;
    const matchC = !cat    || t.category === cat;
    return matchQ && matchS && matchC;
  }).sort(function(a, b) { return b.date.localeCompare(a.date); });

  if (!list.length) {
    el('txn-tbody').innerHTML = '<tr><td colspan="7" style="text-align:center;padding:20px;color:#aaa">No transactions found</td></tr>';
    return;
  }

  el('txn-tbody').innerHTML = list.map(function(t) {
    return '<tr>' +
      '<td>' + t.date + '</td>' +
      '<td>' + custName(t.customerId) + '</td>' +
      '<td>' + t.category + '</td>' +
      '<td>' + money(t.amount) + '</td>' +
      '<td>' + statusBadge(t.status) + '</td>' +
      '<td>' + (t.note || '—') + '</td>' +
      '<td>' +
        '<button class="btn btn-sm" onclick="openEditTxn(' + t.id + ')">Edit</button> ' +
        '<button class="btn btn-danger btn-sm" onclick="deleteTxn(' + t.id + ')">Del</button>' +
      '</td>' +
    '</tr>';
  }).join('');
}

function populateCustSelect(selectedId) {
  el('txn-customer-id').innerHTML = customers.map(function(c) {
    return '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + c.name + '</option>';
  }).join('');
}

function openAddTxn() {
  editingTxnId = null;
  el('modal-txn-title').textContent = 'Add Transaction';
  populateCustSelect(null);
  el('txn-amount').value   = '';
  el('txn-category').value = 'Purchase';
  el('txn-status').value   = 'Completed';
  el('txn-date').value     = new Date().toISOString().slice(0, 10);
  el('txn-note').value     = '';
  el('txn-err').classList.add('hidden');
  el('modal-txn').classList.remove('hidden');
}

function openEditTxn(id) {
  editingTxnId = id;
  const t = transactions.find(function(x) { return x.id === id; });
  el('modal-txn-title').textContent = 'Edit Transaction';
  populateCustSelect(t.customerId);
  el('txn-amount').value   = t.amount;
  el('txn-category').value = t.category;
  el('txn-status').value   = t.status;
  el('txn-date').value     = t.date;
  el('txn-note').value     = t.note || '';
  el('txn-err').classList.add('hidden');
  el('modal-txn').classList.remove('hidden');
}

function saveTxn() {
  const custId   = parseInt(el('txn-customer-id').value);
  const amount   = parseFloat(el('txn-amount').value);
  const category = el('txn-category').value;
  const status   = el('txn-status').value;
  const date     = el('txn-date').value;
  const note     = el('txn-note').value.trim();

  if (!amount || amount <= 0 || !date) {
    el('txn-err').textContent = 'Amount and date are required! Amount must be > 0.';
    el('txn-err').classList.remove('hidden');
    return;
  }

  if (editingTxnId) {
    const t = transactions.find(function(x) { return x.id === editingTxnId; });
    t.customerId = custId;
    t.amount     = amount;
    t.category   = category;
    t.status     = status;
    t.date       = date;
    t.note       = note;
  } else {
    transactions.push({
      id: txnNextId++,
      customerId: custId,
      amount:     amount,
      category:   category,
      status:     status,
      date:       date,
      note:       note
    });
  }

  closeModal('modal-txn');
  renderTxns();
}

function deleteTxn(id) {
  if (!confirm('Delete this transaction?')) return;
  transactions = transactions.filter(function(x) { return x.id !== id; });
  renderTxns();
}

// ── REPORTS ────────────────────────────────────────────
function renderReports() {
  var categories = ['Purchase', 'Refund', 'Subscription', 'Service'];
  var statuses   = ['Completed', 'Pending', 'Failed'];
  var regions    = ['North', 'South', 'East', 'West'];

  // AGGREGATIONS by Category (COUNT, SUM, AVG, MAX, MIN)
  el('agg-by-cat').innerHTML = categories.map(function(cat) {
    var txns = transactions.filter(function(t) { return t.category === cat; });
    var sum  = txns.reduce(function(s, t) { return s + t.amount; }, 0);
    var cnt  = txns.length;
    var avg  = cnt ? sum / cnt : 0;
    var max  = cnt ? Math.max.apply(null, txns.map(function(t) { return t.amount; })) : 0;
    var min  = cnt ? Math.min.apply(null, txns.map(function(t) { return t.amount; })) : 0;
    return '<div style="margin-bottom:8px">' +
      '<div style="font-weight:700;font-size:11px;margin-bottom:4px">' + cat + '</div>' +
      '<div class="agg-row"><span class="agg-key">COUNT</span><span class="agg-val">' + cnt + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">SUM</span><span class="agg-val">' + money(sum) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">AVG</span><span class="agg-val">' + money(avg) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">MAX</span><span class="agg-val">' + money(max) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">MIN</span><span class="agg-val">' + money(min) + '</span></div>' +
    '</div>';
  }).join('');

  // AGGREGATIONS by Status (COUNT, SUM, AVG)
  el('agg-by-status').innerHTML = statuses.map(function(s) {
    var txns = transactions.filter(function(t) { return t.status === s; });
    var sum  = txns.reduce(function(a, t) { return a + t.amount; }, 0);
    var cnt  = txns.length;
    var avg  = cnt ? sum / cnt : 0;
    return '<div style="margin-bottom:8px">' +
      '<div style="font-weight:700;font-size:11px;margin-bottom:4px">' + s + '</div>' +
      '<div class="agg-row"><span class="agg-key">COUNT</span><span class="agg-val">' + cnt + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">SUM</span><span class="agg-val">' + money(sum) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">AVG</span><span class="agg-val">' + money(avg) + '</span></div>' +
    '</div>';
  }).join('');

  // AGGREGATIONS by Region (COUNT, SUM, AVG, MAX)
  el('agg-by-region').innerHTML = regions.map(function(r) {
    var custIds = customers.filter(function(c) { return c.region === r; }).map(function(c) { return c.id; });
    var txns    = transactions.filter(function(t) { return custIds.indexOf(t.customerId) >= 0 && t.status === 'Completed'; });
    var sum     = txns.reduce(function(a, t) { return a + t.amount; }, 0);
    var cnt     = txns.length;
    var avg     = cnt ? sum / cnt : 0;
    var max     = cnt ? Math.max.apply(null, txns.map(function(t) { return t.amount; })) : 0;
    return '<div style="margin-bottom:8px">' +
      '<div style="font-weight:700;font-size:11px;margin-bottom:4px">' + r + ' Region</div>' +
      '<div class="agg-row"><span class="agg-key">COUNT</span><span class="agg-val">' + cnt + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">SUM</span><span class="agg-val">' + money(sum) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">AVG</span><span class="agg-val">' + money(avg) + '</span></div>' +
      '<div class="agg-row"><span class="agg-key">MAX</span><span class="agg-val">' + money(max) + '</span></div>' +
    '</div>';
  }).join('');

  // OVERALL AGGREGATIONS
  var allSum = transactions.reduce(function(s, t) { return s + t.amount; }, 0);
  var allCnt = transactions.length;
  var allAvg = allCnt ? allSum / allCnt : 0;
  var allMax = allCnt ? Math.max.apply(null, transactions.map(function(t) { return t.amount; })) : 0;
  var allMin = allCnt ? Math.min.apply(null, transactions.map(function(t) { return t.amount; })) : 0;

  el('agg-overall').innerHTML =
    '<div class="agg-row"><span class="agg-key">COUNT (all txns)</span><span class="agg-val">' + allCnt + '</span></div>' +
    '<div class="agg-row"><span class="agg-key">COUNT (customers)</span><span class="agg-val">' + customers.length + '</span></div>' +
    '<div class="agg-row"><span class="agg-key">SUM (all amounts)</span><span class="agg-val">' + money(allSum) + '</span></div>' +
    '<div class="agg-row"><span class="agg-key">AVG (per txn)</span><span class="agg-val">' + money(allAvg) + '</span></div>' +
    '<div class="agg-row"><span class="agg-key">MAX (single txn)</span><span class="agg-val">' + money(allMax) + '</span></div>' +
    '<div class="agg-row"><span class="agg-key">MIN (single txn)</span><span class="agg-val">' + money(allMin) + '</span></div>';

  // JOIN REPORT — 3 tables: customers + transactions + category descriptions
  var categoryDescs = {
    Purchase:     'Direct product purchase',
    Refund:       'Money returned to customer',
    Subscription: 'Recurring plan payment',
    Service:      'Service fee'
  };

  var joinRows = transactions.slice()
    .sort(function(a, b) { return b.date.localeCompare(a.date); })
    .slice(0, 10)
    .map(function(t) {
      var c       = customers.find(function(x) { return x.id === t.customerId; });
      var catDesc = categoryDescs[t.category] || t.category;
      return '<tr>' +
        '<td>' + (c ? c.name : 'N/A') + '</td>' +
        '<td>' + (c ? c.region : 'N/A') + '</td>' +
        '<td title="' + catDesc + '">' + t.category + '</td>' +
        '<td>' + money(t.amount) + '</td>' +
        '<td>' + statusBadge(t.status) + '</td>' +
        '<td>' + t.date + '</td>' +
      '</tr>';
    }).join('');
  el('join-report-body').innerHTML = joinRows;

  // SUBQUERY REPORT
  // Subquery 1: compute total spend per customer
  var custTotals = customers.map(function(c) {
    var ctxns = transactions.filter(function(t) { return t.customerId === c.id && t.status === 'Completed'; });
    var total  = ctxns.reduce(function(s, t) { return s + t.amount; }, 0);
    return { id: c.id, name: c.name, region: c.region, total: total, cnt: ctxns.length, txns: ctxns };
  });

  // Subquery 2: compute average spend across all customers
  var avgCustSpend = custTotals.reduce(function(s, c) { return s + c.total; }, 0) / custTotals.length;

  // Subquery 3: filter customers above average and get their top category
  var aboveAvg = custTotals.filter(function(c) { return c.total > avgCustSpend; }).map(function(c) {
    var catAmounts = {};
    c.txns.forEach(function(t) {
      catAmounts[t.category] = (catAmounts[t.category] || 0) + t.amount;
    });
    var topCat = Object.keys(catAmounts).sort(function(a, b) { return catAmounts[b] - catAmounts[a]; })[0] || 'N/A';
    return { name: c.name, region: c.region, total: c.total, cnt: c.cnt, topCat: topCat };
  }).sort(function(a, b) { return b.total - a.total; });

  el('subquery-report-body').innerHTML = aboveAvg.length
    ? aboveAvg.map(function(c) {
        return '<tr>' +
          '<td>' + c.name + '</td>' +
          '<td>' + c.region + '</td>' +
          '<td>' + money(c.total) + '</td>' +
          '<td>' + c.cnt + '</td>' +
          '<td>' + c.topCat + '</td>' +
        '</tr>';
      }).join('')
    : '<tr><td colspan="5" style="text-align:center;padding:16px;color:#aaa">No data</td></tr>';

  // CTE REPORT — monthly summary with running total
  var monthMap = {};
  transactions.filter(function(t) { return t.status === 'Completed'; }).forEach(function(t) {
    var month = t.date.slice(0, 7);
    if (!monthMap[month]) monthMap[month] = { total: 0, cnt: 0 };
    monthMap[month].total += t.amount;
    monthMap[month].cnt++;
  });

  var months  = Object.keys(monthMap).sort();
  var running = 0;

  el('cte-report-body').innerHTML = months.map(function(m) {
    var d     = monthMap[m];
    running  += d.total;
    var avg   = d.cnt ? d.total / d.cnt : 0;
    var label = new Date(m + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' });
    return '<tr>' +
      '<td>' + label + '</td>' +
      '<td>' + money(d.total) + '</td>' +
      '<td>' + d.cnt + '</td>' +
      '<td>' + money(avg) + '</td>' +
      '<td>' + money(running) + '</td>' +
    '</tr>';
  }).join('');
}
