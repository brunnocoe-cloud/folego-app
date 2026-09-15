const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function showToast(message) {
  let toast = qs('#toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(window.__folegoToast);
  window.__folegoToast = setTimeout(() => toast.classList.remove('show'), 2800);
}

function recordTransaction({ description, amount, kind }) {
  const cleanDescription = String(description || '').trim();
  const cleanKind = String(kind || '').trim();
  const numericAmount = Number(amount);
  if (!cleanDescription || !Number.isFinite(numericAmount) || numericAmount <= 0 || !['Despesa', 'Receita', 'Transferência'].includes(cleanKind)) {
    throw new Error('Informe descrição, valor positivo e um tipo válido.');
  }
  showToast(`${cleanKind} “${cleanDescription}” registrada com tranquilidade.`);
  return { status: 'registrada', description: cleanDescription, amount: numericAmount, kind: cleanKind };
}

function setupSidebar() {
  const menu = qs('[data-menu]');
  const sidebar = qs('.app-sidebar');
  if (!menu || !sidebar) return;
  menu.addEventListener('click', () => {
    const open = sidebar.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', event => {
    if (window.innerWidth > 820 || sidebar.contains(event.target) || menu.contains(event.target)) return;
    sidebar.classList.remove('open');
    menu.setAttribute('aria-expanded', 'false');
  });
}

function setupModal() {
  let modal = qs('#transaction-modal');
  if (!modal && qs('[data-open-transaction]')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="transaction-modal" class="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="transaction-title">
        <div class="modal-panel">
          <div class="flex items-center justify-between">
            <div><p class="eyebrow text-blue-600">Registro leve</p><h2 id="transaction-title" class="mt-1 text-2xl font-extrabold">Nova transação</h2></div>
            <button data-close-modal class="grid h-10 w-10 place-items-center rounded-full bg-slate-100" aria-label="Fechar">×</button>
          </div>
          <form class="mt-6 grid gap-4">
            <label class="text-sm font-bold">Descrição<input name="descricao" class="field mt-2" required placeholder="Ex.: Feira da semana"></label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="text-sm font-bold">Valor<input name="valor" class="field mt-2" required inputmode="decimal" placeholder="R$ 0,00"></label>
              <label class="text-sm font-bold">Tipo<select name="tipo" class="field mt-2"><option>Despesa</option><option>Receita</option><option>Transferência</option></select></label>
            </div>
            <div class="mt-2 flex justify-end gap-3"><button type="button" data-close-modal class="btn-secondary">Agora não</button><button class="btn-primary" type="submit">Registrar</button></div>
          </form>
        </div>
      </div>`);
    modal = qs('#transaction-modal');
  }
  if (!modal) return;
  qsa('[data-open-transaction]').forEach(button => button.addEventListener('click', () => {
    modal.classList.add('open');
    qs('input', modal)?.focus();
  }));
  qsa('[data-close-modal]', modal).forEach(button => button.addEventListener('click', () => modal.classList.remove('open')));
  modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
  qs('form', modal)?.addEventListener('submit', event => {
    event.preventDefault();
    const fields = event.currentTarget.elements;
    const rawAmount = String(fields.valor?.value || '').replace(/[^0-9,.-]/g, '').replace(',', '.');
    recordTransaction({ description: fields.descricao?.value, amount: Number(rawAmount), kind: fields.tipo?.value });
    modal.classList.remove('open');
    event.currentTarget.reset();
  });
}

function setupBreathCalculator() {
  const calculator = qs('[data-breath-calculator]');
  if (!calculator) return;
  const income = qs('#calc-income', calculator);
  const essentials = qs('#calc-essentials', calculator);
  const balance = qs('#calc-balance', calculator);
  const days = qs('#calc-days', calculator);
  const margin = qs('#calc-margin', calculator);
  const circle = qs('#calc-circle', calculator);
  const formatCurrency = value => value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
  });
  const update = () => {
    const incomeValue = Number(income.value);
    const essentialsValue = Math.max(1, Number(essentials.value));
    const balanceValue = Number(balance.value);
    const calculatedDays = Math.max(0, Math.floor(balanceValue / (essentialsValue / 30)));
    qs('[data-income-value]', calculator).textContent = formatCurrency(incomeValue);
    qs('[data-essentials-value]', calculator).textContent = formatCurrency(essentialsValue);
    qs('[data-balance-value]', calculator).textContent = formatCurrency(balanceValue);
    days.textContent = String(calculatedDays);
    margin.textContent = formatCurrency(Math.max(0, incomeValue - essentialsValue));
    const degrees = Math.min(360, calculatedDays / 180 * 360);
    circle.style.background = `conic-gradient(#2563eb ${degrees}deg, #e2e8f0 ${degrees}deg)`;
  };
  [income, essentials, balance].forEach(input => input.addEventListener('input', update));
  update();
}

function setupWebMCP() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  try {
    void Promise.resolve(context.registerTool({
      name: 'record_family_transaction',
      title: 'Registrar transação familiar',
      description: 'Registra uma despesa, receita ou transferência no protótipo Fôlego e confirma a ação na interface.',
      inputSchema: {
        type: 'object',
        properties: {
          description: { type: 'string', minLength: 1 },
          amount: { type: 'number', exclusiveMinimum: 0 },
          kind: { type: 'string', enum: ['Despesa', 'Receita', 'Transferência'] }
        },
        required: ['description', 'amount', 'kind'],
        additionalProperties: false
      },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { return recordTransaction(input); }
    }, { signal: lifecycle.signal })).catch(() => {});
  } catch {}
}

function setupTabs() {
  qsa('[data-tabs]').forEach(group => {
    qsa('[data-tab]', group).forEach(button => button.addEventListener('click', () => {
      qsa('[data-tab]', group).forEach(tab => tab.classList.remove('active'));
      button.classList.add('active');
      const owner = button.dataset.tab;
      qsa('[data-owner]').forEach(row => {
        row.hidden = owner !== 'Todos' && row.dataset.owner !== owner;
      });
    }));
  });
  const kind = qs('#kind-filter');
  kind?.addEventListener('change', () => {
    qsa('[data-kind]').forEach(row => {
      row.hidden = kind.value !== 'Todos' && row.dataset.kind !== kind.value;
    });
  });
}

function setupChoices() {
  qsa('[data-choice]').forEach(choice => choice.addEventListener('click', () => {
    qsa('[data-choice]').forEach(item => {
      item.classList.remove('border-blue-500', 'ring-4', 'ring-blue-100');
      item.setAttribute('aria-pressed', 'false');
      qs('[data-check]', item)?.classList.add('hidden');
    });
    choice.classList.add('border-blue-500', 'ring-4', 'ring-blue-100');
    choice.setAttribute('aria-pressed', 'true');
    qs('[data-check]', choice)?.classList.remove('hidden');
    const label = choice.dataset.choice;
    const cta = qs('#onboarding-cta');
    if (cta) cta.href = label === 'open-finance' ? 'contas.html' : 'index.html';
  }));
}

function setupBudget() {
  qs('[data-adjust]')?.addEventListener('click', event => {
    event.currentTarget.textContent = 'Ajuste aplicado ✓';
    event.currentTarget.disabled = true;
    showToast('R$ 250 realocados sem alterar o orçamento total.');
  });
  qs('[data-align]')?.addEventListener('click', () => showToast('Convite para a conversa de domingo preparado.'));
}

function setupAccelerator() {
  const range = qs('#accelerator');
  if (!range) return;
  const amount = qs('#accelerator-value');
  const months = qs('#accelerator-months');
  const date = qs('#accelerator-date');
  const update = () => {
    const value = Number(range.value);
    const advance = Math.max(1, Math.round(value / 175));
    amount.textContent = value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    months.textContent = `${advance} ${advance === 1 ? 'mês' : 'meses'}`;
    const targetMonth = 12 - advance;
    date.textContent = targetMonth <= 0 ? 'Dezembro de 2025' : new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(new Date(2026, targetMonth - 1, 1));
  };
  range.addEventListener('input', update);
  update();
}

function setupLogin() {
  qs('[data-login-form]')?.addEventListener('submit', event => {
    event.preventDefault();
    window.location.href = 'index.html';
  });
  qs('[data-toggle-password]')?.addEventListener('click', event => {
    const input = qs('#password');
    input.type = input.type === 'password' ? 'text' : 'password';
    event.currentTarget.textContent = input.type === 'password' ? 'Mostrar' : 'Ocultar';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSidebar();
  setupModal();
  setupTabs();
  setupChoices();
  setupBudget();
  setupAccelerator();
  setupLogin();
  setupBreathCalculator();
  setupWebMCP();
});
