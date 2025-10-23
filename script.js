// Seleções
const form = document.getElementById('cadForm');
const nome = document.getElementById('nome');
const telefone = document.getElementById('telefone');
const rg = document.getElementById('rg');
const sexo = document.getElementById('sexo');
const resultado = document.getElementById('resultado');
const limparBtn = document.getElementById('limparBtn');
const mostrarBtn = document.getElementById('mostrarBtn');
const nomeHelp = document.getElementById('nomeHelp');
const listaCadastros = document.getElementById('listaCadastros');
const tabelaBody = document.querySelector('#tabelaCadastros tbody');

// ===== Formatação e validações =====
telefone.addEventListener('input', (e) => {
  const v = e.target.value.replace(/\D/g, '');
  let out = '';
  if (v.length <= 2) out = v;
  else if (v.length <= 6) out = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length <= 10) out = `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  else out = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7,11)}`;
  e.target.value = out;
});

nome.addEventListener('input', () => {
  const value = nome.value.trim();
  if (/\d/.test(value)) {
    nome.classList.add('error');
    nomeHelp.textContent = 'O nome não pode conter números.';
  } else if (value.length > 0 && value.length < 3) {
    nome.classList.add('error');
    nomeHelp.textContent = 'Use pelo menos 3 caracteres.';
  } else {
    nome.classList.remove('error');
    nomeHelp.textContent = '';
  }
});

// ===== Função: atualizar tabela =====
function atualizarTabela() {
  const registros = JSON.parse(localStorage.getItem('registrosCadastro') || '[]');
  tabelaBody.innerHTML = '';

  if (registros.length === 0) {
    listaCadastros.classList.remove('visivel');
    return;
  }

  registros.forEach((r, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.nome}</td>
      <td>${r.telefone}</td>
      <td>${r.rg}</td>
      <td>${r.sexo}</td>
      <td>${new Date(r.cadastradoEm).toLocaleString('pt-BR')}</td>
      <td><button class="btn-delete" data-index="${i}">Excluir</button></td>
    `;
    tabelaBody.appendChild(tr);
  });

  listaCadastros.classList.add('visivel');
}


// ===== Cadastro =====
form.addEventListener('submit', (ev) => {
  ev.preventDefault();
  [nome, telefone, rg, sexo].forEach(el => el.classList.remove('error'));
  resultado.hidden = true;

  if (!form.checkValidity()) {
    [nome, telefone, rg, sexo].forEach(el => { if (!el.checkValidity()) el.classList.add('error'); });
    resultado.hidden = false;
    resultado.textContent = 'Por favor corrija os campos em destaque.';
    return;
  }

  const rgRaw = rg.value.replace(/[^0-9]/g, '');
  if (rgRaw.length < 5) {
    rg.classList.add('error');
    resultado.hidden = false;
    resultado.textContent = 'RG inválido.';
    return;
  }

  const dados = {
    nome: nome.value.trim().toLowerCase(),
    telefone: telefone.value.trim(),
    rg: rg.value.trim(),
    sexo: sexo.value
  };

  const registros = JSON.parse(localStorage.getItem('registrosCadastro') || '[]');

  // Verificações de duplicidade
  const mesmoUsuario = registros.find(r =>
    r.nome === dados.nome &&
    r.telefone === dados.telefone &&
    r.rg === dados.rg
  );

  const rgExistente = registros.find(r => r.rg === dados.rg && r.nome !== dados.nome);
  const telefoneExistente = registros.find(r => r.telefone === dados.telefone && r.nome !== dados.nome);

  if (mesmoUsuario) {
    resultado.hidden = false;
    resultado.style.border = '1px solid #fca5a5';
    resultado.innerHTML = `<strong style="color:#b91c1c;">Usuário já cadastrado!</strong><br>
    Este nome, RG e telefone já estão registrados.`;
    return;
  }

  if (rgExistente || telefoneExistente) {
    resultado.hidden = false;
    resultado.style.border = '1px solid #f59e0b';
    let msg = '<strong style="color:#92400e;">Atenção:</strong><br>';
    if (rgExistente) msg += `O RG <b>${dados.rg}</b> já está cadastrado em outro nome.<br>`;
    if (telefoneExistente) msg += `O telefone <b>${dados.telefone}</b> já está cadastrado em outro nome.<br>`;
    msg += 'Verifique os dados antes de continuar.';
    resultado.innerHTML = msg;
    return;
  }

  // Salvar
  registros.push({ ...dados, cadastradoEm: new Date().toISOString() });
  localStorage.setItem('registrosCadastro', JSON.stringify(registros));

  resultado.hidden = false;
  resultado.style.border = '1px dashed #e6eefc';
  resultado.innerHTML = `<strong>Cadastro realizado com sucesso!</strong><br>
  <pre style="margin:8px 0;">${JSON.stringify(dados, null, 2)}</pre>
  <div class="small">Total de cadastros locais: ${registros.length}</div>`;

  form.reset();
  atualizarTabela();
});

// ===== Botões =====
limparBtn.addEventListener('click', () => {
  if (confirm('Deseja limpar o formulário e remover todos os registros locais?')) {
    form.reset();
    localStorage.removeItem('registrosCadastro');
    resultado.hidden = false;
    resultado.textContent = 'Registros locais removidos.';
    atualizarTabela();
  }
});

mostrarBtn.addEventListener('click', () => {
  listaCadastros.hidden = !listaCadastros.hidden;
  if (!listaCadastros.hidden) atualizarTabela();
});

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', () => {
  atualizarTabela();
  const registros = JSON.parse(localStorage.getItem('registrosCadastro') || '[]');
  if (registros.length) {
    resultado.hidden = false;
    resultado.innerHTML = `<strong>Registros armazenados localmente:</strong> ${registros.length}`;
    // Excluir registro individual
tabelaBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    const index = e.target.getAttribute('data-index');
    const registros = JSON.parse(localStorage.getItem('registrosCadastro') || '[]');
    if (confirm(`Deseja excluir o cadastro de ${registros[index].nome}?`)) {
      registros.splice(index, 1);
      localStorage.setItem('registrosCadastro', JSON.stringify(registros));
      atualizarTabela();
    }
  }
});

  }
});