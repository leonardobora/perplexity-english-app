// Dados da aplicação (simulando base de dados)
const dadosApp = {
  professores: [
    {"id": 1, "nome": "Prof. Ana Silva", "email": "ana@escola.com", "turmas": 3}
  ],
  alunos: [
    {"id": 1, "nome": "João Santos", "nivel": 7, "pontos": 1240, "streak": 5, "badges": 8},
    {"id": 2, "nome": "Maria Oliveira", "nivel": 6, "pontos": 980, "streak": 3, "badges": 6},
    {"id": 3, "nome": "Pedro Costa", "nivel": 8, "pontos": 1450, "streak": 12, "badges": 10}
  ],
  turmas: [
    {"id": 1, "nome": "3A", "progresso": 85, "alunos": 15},
    {"id": 2, "nome": "3B", "progresso": 72, "alunos": 18},
    {"id": 3, "nome": "3C", "progresso": 64, "alunos": 16}
  ],
  materias: [
    {"id": 1, "nome": "Present Perfect", "categoria": "Grammar", "nivel": 7, "vestibular": "ENEM"},
    {"id": 2, "nome": "Environment Vocabulary", "categoria": "Vocabulary", "nivel": 5, "vestibular": "Ambos"},
    {"id": 3, "nome": "Reading Comprehension", "categoria": "Reading", "nivel": 6, "vestibular": "UFPR"},
    {"id": 4, "nome": "Essay Writing", "categoria": "Writing", "nivel": 8, "vestibular": "ENEM"}
  ],
  licoes: [
    {"id": 1, "titulo": "Present Perfect - Formation", "materia": "Grammar", "pontos": 15, "tempo": 20},
    {"id": 2, "titulo": "Environmental Issues", "materia": "Vocabulary", "pontos": 10, "tempo": 15},
    {"id": 3, "titulo": "Text Analysis Techniques", "materia": "Reading", "pontos": 20, "tempo": 25},
    {"id": 4, "titulo": "Argumentative Essays", "materia": "Writing", "pontos": 25, "tempo": 30}
  ],
  badges: [
    {"id": 1, "nome": "First Step", "descricao": "Complete sua primeira lição", "icone": "🥇", "conquistada": true},
    {"id": 2, "nome": "Grammar Master", "descricao": "Complete 10 lições de gramática", "icone": "📚", "conquistada": true},
    {"id": 3, "nome": "Streak Champion", "descricao": "7 dias consecutivos", "icone": "🔥", "conquistada": false},
    {"id": 4, "nome": "ENEM Ready", "descricao": "Complete módulo ENEM", "icone": "🎓", "conquistada": false}
  ],
  progresso_categorias: [
    {"categoria": "Grammar", "nivel": 8, "maximo": 10},
    {"categoria": "Vocabulary", "nivel": 6, "maximo": 10},
    {"categoria": "Reading", "nivel": 7, "maximo": 10},
    {"categoria": "Writing", "nivel": 5, "maximo": 10},
    {"categoria": "Listening", "nivel": 4, "maximo": 10}
  ]
};

// Estado da aplicação
let estadoApp = {
  usuarioAtual: null,
  tipoUsuario: null, // 'professor' ou 'aluno'
  secaoAtiva: null
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
  inicializarApp();
});

function inicializarApp() {
  // Event listeners para login
  const loginCards = document.querySelectorAll('.login-card');
  loginCards.forEach(card => {
    card.addEventListener('click', function() {
      const role = this.dataset.role;
      realizarLogin(role);
    });
  });

  // Event listeners para logout
  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('logout-btn-aluno')?.addEventListener('click', logout);

  // Event listeners para navegação
  inicializarNavegacao();

  // Event listeners para modais
  inicializarModais();

  // Event listeners para formulários
  inicializarFormularios();

  // Event listeners para botões interativos
  inicializarBotoesInterativos();
}

function realizarLogin(tipo) {
  estadoApp.tipoUsuario = tipo;
  
  if (tipo === 'professor') {
    estadoApp.usuarioAtual = dadosApp.professores[0];
    mostrarTela('professor-dashboard');
    navegarPara('overview');
  } else {
    estadoApp.usuarioAtual = dadosApp.alunos[0];
    mostrarTela('aluno-dashboard');
    navegarPara('dashboard-aluno');
  }

  mostrarToast(`Bem-vindo(a), ${estadoApp.usuarioAtual.nome}!`, 'success');
}

function logout() {
  estadoApp.usuarioAtual = null;
  estadoApp.tipoUsuario = null;
  estadoApp.secaoAtiva = null;
  mostrarTela('login-screen');
  mostrarToast('Logout realizado com sucesso!', 'info');
}

function mostrarTela(telaId) {
  // Esconder todas as telas
  const telas = document.querySelectorAll('.screen');
  telas.forEach(tela => tela.classList.remove('active'));

  // Mostrar tela específica
  const tela = document.getElementById(telaId);
  if (tela) {
    tela.classList.add('active');
  }
}

function inicializarNavegacao() {
  // Navegação Professor
  const menuProfessor = document.querySelectorAll('#professor-dashboard .sidebar-menu a');
  menuProfessor.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const secao = this.dataset.section;
      navegarPara(secao);
      atualizarMenuAtivo(this);
    });
  });

  // Navegação Aluno
  const menuAluno = document.querySelectorAll('#aluno-dashboard .sidebar-menu a');
  menuAluno.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const secao = this.dataset.section;
      navegarPara(secao);
      atualizarMenuAtivo(this);
    });
  });
}

function navegarPara(secao) {
  estadoApp.secaoAtiva = secao;

  // Esconder todas as seções
  const secoes = document.querySelectorAll('.content-section');
  secoes.forEach(s => s.classList.remove('active'));

  // Mostrar seção específica
  const secaoElement = document.getElementById(`${secao}-section`);
  if (secaoElement) {
    secaoElement.classList.add('active');
  }
}

function atualizarMenuAtivo(linkAtivo) {
  // Remover classe ativa de todos os links
  const todosLinks = linkAtivo.closest('.sidebar-menu').querySelectorAll('a');
  todosLinks.forEach(link => link.classList.remove('active'));

  // Adicionar classe ativa ao link clicado
  linkAtivo.classList.add('active');
}

function inicializarModais() {
  // Modal Nova Lição
  const btnNovaLicao = document.getElementById('nova-licao-btn');
  const modalNovaLicao = document.getElementById('modal-nova-licao');
  const btnFecharModal = document.querySelector('.modal-close');
  const btnCancelar = document.getElementById('cancelar-licao');

  if (btnNovaLicao) {
    btnNovaLicao.addEventListener('click', () => {
      modalNovaLicao.classList.add('active');
    });
  }

  if (btnFecharModal) {
    btnFecharModal.addEventListener('click', () => {
      modalNovaLicao.classList.remove('active');
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      modalNovaLicao.classList.remove('active');
    });
  }

  // Fechar modal clicando fora
  if (modalNovaLicao) {
    modalNovaLicao.addEventListener('click', (e) => {
      if (e.target === modalNovaLicao) {
        modalNovaLicao.classList.remove('active');
      }
    });
  }
}

function inicializarFormularios() {
  // Formulário Nova Lição
  const btnSalvarLicao = document.getElementById('salvar-licao');
  if (btnSalvarLicao) {
    btnSalvarLicao.addEventListener('click', salvarNovaLicao);
  }

  // Formulário de pergunta para assistente IA
  const btnsPerguntar = document.querySelectorAll('.btn:contains("Perguntar")');
  btnsPerguntar.forEach(btn => {
    if (btn.textContent.includes('Perguntar')) {
      btn.addEventListener('click', processarPerguntaIA);
    }
  });

  // Botão gerar resumo
  const btnsGerarResumo = document.querySelectorAll('.btn:contains("Gerar Resumo")');
  btnsGerarResumo.forEach(btn => {
    if (btn.textContent.includes('Gerar Resumo')) {
      btn.addEventListener('click', gerarResumo);
    }
  });
}

function salvarNovaLicao() {
  const form = document.getElementById('form-nova-licao');
  const formData = new FormData(form);
  
  // Validação básica
  const titulo = form.querySelector('input[type="text"]').value;
  const categoria = form.querySelector('select').value;
  
  if (!titulo || !categoria) {
    mostrarToast('Por favor, preencha todos os campos obrigatórios.', 'error');
    return;
  }

  // Simular salvamento
  const novaLicao = {
    id: dadosApp.licoes.length + 1,
    titulo: titulo,
    materia: categoria,
    pontos: parseInt(form.querySelector('input[type="number"]').value) || 10,
    tempo: parseInt(form.querySelectorAll('input[type="number"]')[1].value) || 15
  };

  dadosApp.licoes.push(novaLicao);
  
  // Fechar modal
  document.getElementById('modal-nova-licao').classList.remove('active');
  
  // Limpar formulário
  form.reset();
  
  // Mostrar sucesso
  mostrarToast('Lição criada com sucesso!', 'success');
  
  // Atualizar lista de lições (se estivermos na seção correta)
  if (estadoApp.secaoAtiva === 'licoes') {
    atualizarListaLicoes();
  }
}

function atualizarListaLicoes() {
  // Esta função atualizaria a lista de lições na interface
  // Por simplicidade, apenas mostramos uma mensagem
  mostrarToast('Lista de lições atualizada!', 'info');
}

function processarPerguntaIA() {
  const textarea = document.querySelector('#assistente-aluno-section textarea');
  if (!textarea || !textarea.value.trim()) {
    mostrarToast('Por favor, digite sua pergunta.', 'warning');
    return;
  }

  // Simular processamento
  mostrarCarregamento(true);
  
  setTimeout(() => {
    mostrarCarregamento(false);
    
    // Atualizar resposta (simulada)
    const respostaDiv = document.querySelector('.assistente-resposta');
    if (respostaDiv) {
      respostaDiv.innerHTML = `
        <p><strong>Sua pergunta:</strong> ${textarea.value}</p>
        <p><strong>Resposta do Assistente IA:</strong></p>
        <p>Baseado na sua pergunta, aqui está uma explicação detalhada com exemplos práticos e dicas para o vestibular.</p>
        <p><strong>Exemplo:</strong> Esta é uma resposta personalizada gerada pela IA.</p>
        <p><strong>Dica ENEM/UFPR:</strong> Preste atenção nos detalhes específicos para cada tipo de prova.</p>
      `;
    }
    
    textarea.value = '';
    mostrarToast('Resposta gerada com sucesso!', 'success');
  }, 2000);
}

function gerarResumo() {
  const topicoInput = document.querySelector('#assistente-section input[type="text"]');
  const nivelSelect = document.querySelector('#assistente-section select');
  
  if (!topicoInput || !topicoInput.value.trim()) {
    mostrarToast('Por favor, digite um tópico.', 'warning');
    return;
  }

  // Simular geração
  mostrarCarregamento(true);
  
  setTimeout(() => {
    mostrarCarregamento(false);
    
    const resumoDiv = document.querySelector('.resumo-content');
    if (resumoDiv) {
      resumoDiv.innerHTML = `
        <p><strong>${topicoInput.value} - Nível ${nivelSelect.value}</strong></p>
        <p>Este é um resumo personalizado sobre ${topicoInput.value}, adaptado para o nível ${nivelSelect.value.toLowerCase()}.</p>
        <p><strong>Pontos principais:</strong></p>
        <ul>
          <li>Conceito fundamental e aplicação</li>
          <li>Exemplos práticos relevantes</li>
          <li>Dicas específicas para vestibulares</li>
        </ul>
        <p><strong>Dica ENEM/UFPR:</strong> Atenção especial aos contextos de uso em provas.</p>
      `;
    }
    
    mostrarToast('Resumo gerado com sucesso!', 'success');
  }, 1500);
}

function inicializarBotoesInterativos() {
  // Botões de iniciar lição
  const btnsIniciar = document.querySelectorAll('.btn:contains("Iniciar")');
  btnsIniciar.forEach(btn => {
    if (btn.textContent.includes('Iniciar')) {
      btn.addEventListener('click', () => {
        mostrarToast('Lição iniciada! 🎓', 'success');
        simularProgressoLicao(btn);
      });
    }
  });

  // Botões de continuar lição
  const btnsContinuar = document.querySelectorAll('.btn:contains("Continuar")');
  btnsContinuar.forEach(btn => {
    if (btn.textContent.includes('Continuar')) {
      btn.addEventListener('click', () => {
        mostrarToast('Continuando lição... 📚', 'info');
        simularProgressoLicao(btn);
      });
    }
  });

  // Botões útil/não útil
  const btnsUtil = document.querySelectorAll('.btn:contains("Útil")');
  btnsUtil.forEach(btn => {
    btn.addEventListener('click', () => {
      mostrarToast('Obrigado pelo feedback! 👍', 'success');
      btn.style.background = 'var(--color-success)';
      btn.style.color = 'var(--color-btn-primary-text)';
    });
  });

  const btnsNaoUtil = document.querySelectorAll('.btn:contains("Não útil")');
  btnsNaoUtil.forEach(btn => {
    btn.addEventListener('click', () => {
      mostrarToast('Feedback registrado. Vamos melhorar! 📝', 'warning');
      btn.style.background = 'var(--color-warning)';
      btn.style.color = 'var(--color-btn-primary-text)';
    });
  });

  // Botões de copiar
  const btnsCopiar = document.querySelectorAll('.btn:contains("Copiar")');
  btnsCopiar.forEach(btn => {
    if (btn.textContent.includes('Copiar')) {
      btn.addEventListener('click', () => {
        // Simular cópia para clipboard
        mostrarToast('Conteúdo copiado! 📋', 'success');
      });
    }
  });

  // Botões de detalhes, editar, etc.
  const btnsDetalhes = document.querySelectorAll('.btn:contains("Detalhes")');
  btnsDetalhes.forEach(btn => {
    if (btn.textContent.includes('Detalhes')) {
      btn.addEventListener('click', () => {
        mostrarToast('Abrindo detalhes...', 'info');
      });
    }
  });

  const btnsEditar = document.querySelectorAll('.btn:contains("Editar")');
  btnsEditar.forEach(btn => {
    if (btn.textContent.includes('Editar')) {
      btn.addEventListener('click', () => {
        mostrarToast('Modo de edição ativado ✏️', 'info');
      });
    }
  });

  const btnsExcluir = document.querySelectorAll('.btn:contains("Excluir")');
  btnsExcluir.forEach(btn => {
    if (btn.textContent.includes('Excluir')) {
      btn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
          mostrarToast('Item excluído com sucesso! 🗑️', 'success');
        }
      });
    }
  });

  // Botões de progresso do aluno
  const btnsVerProgresso = document.querySelectorAll('.btn:contains("Ver Progresso")');
  btnsVerProgresso.forEach(btn => {
    if (btn.textContent.includes('Ver Progresso')) {
      btn.addEventListener('click', () => {
        mostrarToast('Carregando progresso detalhado... 📊', 'info');
      });
    }
  });
}

function simularProgressoLicao(btn) {
  // Simular progresso da lição
  btn.textContent = 'Carregando...';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = 'Em Progresso... 📚';
    btn.classList.remove('btn--primary');
    btn.classList.add('btn--warning');
    
    setTimeout(() => {
      btn.textContent = 'Concluída ✅';
      btn.classList.remove('btn--warning');
      btn.classList.add('btn--success');
      btn.disabled = false;
      
      // Simular ganho de pontos
      if (estadoApp.tipoUsuario === 'aluno') {
        const pontosGanhos = Math.floor(Math.random() * 20) + 10;
        mostrarToast(`Parabéns! Você ganhou ${pontosGanhos} pontos! 🏆`, 'success');
        
        // Atualizar pontos do usuário (simulação)
        estadoApp.usuarioAtual.pontos += pontosGanhos;
      }
    }, 3000);
  }, 2000);
}

function mostrarToast(mensagem, tipo = 'info') {
  // Remover toast existente
  const toastExistente = document.querySelector('.toast');
  if (toastExistente) {
    toastExistente.remove();
  }

  // Criar novo toast
  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = mensagem;
  
  document.body.appendChild(toast);
  
  // Mostrar toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  // Remover toast após 3 segundos
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 300);
  }, 3000);
}

function mostrarCarregamento(mostrar) {
  const elementos = document.querySelectorAll('.btn, .form-control');
  elementos.forEach(el => {
    if (mostrar) {
      el.classList.add('loading');
    } else {
      el.classList.remove('loading');
    }
  });
}

// Funções de utilidade
function formatarTempo(minutos) {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return `${horas}h ${minutosRestantes}min`;
}

function calcularPercentual(valor, total) {
  return Math.round((valor / total) * 100);
}

function obterCorCategoria(categoria) {
  const cores = {
    'Grammar': 'var(--color-info)',
    'Vocabulary': 'var(--color-warning)',
    'Reading': 'var(--color-success)',
    'Writing': 'var(--color-primary)',
    'Listening': 'var(--color-error)'
  };
  return cores[categoria] || 'var(--color-secondary)';
}

// Simulação de dados em tempo real
setInterval(() => {
  if (estadoApp.usuarioAtual && estadoApp.tipoUsuario === 'aluno') {
    // Simular pequenas atualizações nos dados
    const chance = Math.random();
    
    if (chance < 0.1) { // 10% de chance a cada 5 segundos
      // Simular ganho de pontos por atividade em background
      const pontosBonus = Math.floor(Math.random() * 5) + 1;
      estadoApp.usuarioAtual.pontos += pontosBonus;
      
      // Atualizar interface se estiver na tela principal
      if (estadoApp.secaoAtiva === 'dashboard-aluno') {
        const statPontos = document.querySelector('.stat-number');
        if (statPontos && statPontos.textContent.includes(estadoApp.usuarioAtual.pontos - pontosBonus)) {
          statPontos.textContent = estadoApp.usuarioAtual.pontos;
          mostrarToast(`+${pontosBonus} pontos por atividade! 🌟`, 'success');
        }
      }
    }
  }
}, 5000);

// Adicionar efeitos visuais extras
document.addEventListener('DOMContentLoaded', function() {
  // Adicionar efeito de hover nos cards
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px)';
      this.style.transition = 'transform 0.2s ease';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });

  // Adicionar efeito de pulso nos badges conquistadas
  const badgesConquistadas = document.querySelectorAll('.badge-card.conquistada');
  badgesConquistadas.forEach(badge => {
    setInterval(() => {
      badge.style.animation = 'pulse 2s infinite';
    }, 5000);
  });

  // Adicionar animação nas barras de progresso
  const progressBars = document.querySelectorAll('.progress-fill');
  progressBars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';
    bar.style.transition = 'width 1s ease-in-out';
    
    setTimeout(() => {
      bar.style.width = width;
    }, 500);
  });
});

// CSS adicional para animações (injetado via JavaScript)
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  .badge-card.conquistada {
    animation: pulse 2s infinite;
  }
  
  .ranking-item.atual {
    position: relative;
    overflow: hidden;
  }
  
  .ranking-item.atual::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shine 3s infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;
document.head.appendChild(style);

// Funções para demonstração das funcionalidades CRUD
function demonstrarCRUD() {
  // Esta função poderia ser chamada para demonstrar as operações CRUD
  console.log('Demonstração CRUD:');
  console.log('CREATE: Nova lição adicionada');
  console.log('READ: Listagem de lições carregada');
  console.log('UPDATE: Lição editada');
  console.log('DELETE: Lição removida');
}

// Log de inicialização
console.log('EduDash - Dashboard Educacional inicializado com sucesso!');
console.log('Funcionalidades disponíveis:');
console.log('- Login Professor/Aluno');
console.log('- Dashboards personalizados');
console.log('- Sistema de gamificação');
console.log('- CRUD de lições');
console.log('- Assistente IA');
console.log('- Acompanhamento de progresso');