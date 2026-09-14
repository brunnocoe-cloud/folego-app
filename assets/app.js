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
  const modal = qs('#transaction-modal');
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
  setupWebMCP();
});
