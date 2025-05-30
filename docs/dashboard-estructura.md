# Dashboard Educacional de Inglês - Estrutura Completa

## 🎯 Visão Geral do Projeto

Este é um dashboard personalizado para acompanhamento do progresso de aprendizado de inglês, focado em alunos do 3º ano do ensino médio preparando-se para vestibulares como ENEM e UFPR. O sistema combina elementos de gamificação (similar ao Duolingo) com funcionalidades de notekeeper assistido por IA.

## 🗄️ Estrutura do Banco de Dados

### Tabela: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    tipo_usuario TEXT CHECK(tipo_usuario IN ('professor', 'aluno')) NOT NULL,
    nivel_atual INTEGER DEFAULT 1,
    pontos_totais INTEGER DEFAULT 0,
    streak_dias INTEGER DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: turmas
```sql
CREATE TABLE turmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    professor_id INTEGER REFERENCES users(id),
    descricao TEXT,
    ano_letivo INTEGER,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: materias
```sql
CREATE TABLE materias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    categoria TEXT, -- Grammar, Vocabulary, Reading, Writing, Listening
    nivel_dificuldade INTEGER CHECK(nivel_dificuldade BETWEEN 1 AND 10),
    relevancia_vestibular TEXT, -- ENEM, UFPR, Ambos
    descricao TEXT
);
```

### Tabela: licoes
```sql
CREATE TABLE licoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    materia_id INTEGER REFERENCES materias(id),
    titulo TEXT NOT NULL,
    conteudo TEXT,
    nivel INTEGER CHECK(nivel BETWEEN 1 AND 10),
    pontos_recompensa INTEGER DEFAULT 10,
    tempo_estimado INTEGER -- em minutos
);
```

### Tabela: exercicios
```sql
CREATE TABLE exercicios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    licao_id INTEGER REFERENCES licoes(id),
    tipo TEXT CHECK(tipo IN ('multipla_escolha', 'traducao', 'audio', 'escrita')),
    pergunta TEXT NOT NULL,
    opcoes TEXT, -- JSON para múltipla escolha
    resposta_correta TEXT NOT NULL,
    explicacao TEXT,
    pontos INTEGER DEFAULT 5
);
```

### Tabela: progresso_alunos
```sql
CREATE TABLE progresso_alunos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aluno_id INTEGER REFERENCES users(id),
    licao_id INTEGER REFERENCES licoes(id),
    status TEXT CHECK(status IN ('nao_iniciado', 'em_progresso', 'concluido', 'revisao')),
    pontuacao REAL DEFAULT 0,
    tentativas INTEGER DEFAULT 0,
    tempo_gasto INTEGER DEFAULT 0, -- em segundos
    data_conclusao DATETIME,
    proxima_revisao DATETIME -- Para spaced repetition
);
```

### Tabela: notas_ai
```sql
CREATE TABLE notas_ai (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER REFERENCES users(id),
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tags TEXT, -- JSON com tags
    tipo TEXT CHECK(tipo IN ('resumo', 'dica', 'exercicio_personalizado', 'lembrete')),
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    favorito BOOLEAN DEFAULT FALSE
);
```

### Tabela: badges
```sql
CREATE TABLE badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    icone TEXT,
    criterio TEXT, -- JSON com critérios
    pontos_bonus INTEGER DEFAULT 0
);
```

## 🎮 Sistema de Gamificação

### Elementos de Jogo
1. **Pontos**: Ganhos ao completar lições e exercícios
2. **Níveis**: Progressão baseada em pontos acumulados  
3. **Streaks**: Dias consecutivos de atividade
4. **Badges**: Conquistas por marcos específicos
5. **Leaderboard**: Ranking entre alunos da turma
6. **Progresso Visual**: Barras de progresso e estatísticas

### Badges Exemplos
- 🥇 **First Step**: Complete sua primeira lição (+10 pts)
- 📚 **Grammar Master**: Complete 10 lições de gramática (+50 pts)
- 🔥 **Streak Champion**: 7 dias consecutivos (+100 pts)
- 🎓 **ENEM Ready**: Complete módulo ENEM (+200 pts)

## 🤖 Funcionalidades de IA

### Assistente Inteligente
- **Criação automática de resumos** personalizados
- **Geração de exercícios** baseados nas dificuldades do aluno
- **Dicas contextuais** durante os estudos
- **Análise de performance** e sugestões de melhoria

### Integração OpenAI
```python
# Exemplo de integração
import openai

def gerar_resumo_personalizado(topico, nivel_aluno):
    prompt = f"""
    Crie um resumo didático sobre {topico} para um aluno 
    de nível {nivel_aluno} preparando-se para o ENEM.
    Foque nos pontos mais importantes e inclua exemplos.
    """
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}]
    )
    return response.choices[0].message.content
```

## 🏗️ Arquitetura Técnica

### Stack Tecnológico
- **Backend**: Python com Flask/FastAPI
- **Frontend**: Streamlit ou React
- **Banco de Dados**: SQLite (desenvolvimento) / PostgreSQL (produção)
- **IA**: OpenAI API
- **Deploy**: PyInstaller ou auto-py-to-exe

### Estrutura de Pastas
```
dashboard_educacional/
├── app/
│   ├── models/          # Modelos do banco de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   └── utils/           # Utilitários
├── frontend/
│   ├── components/      # Componentes reutilizáveis
│   ├── pages/           # Páginas do dashboard
│   └── static/          # CSS, JS, imagens
├── data/
│   ├── database.db      # Banco SQLite
│   └── backup/          # Backups automáticos
├── requirements.txt
└── main.py             # Ponto de entrada
```

## 📊 Funcionalidades CRUD

### Para Professores
- ✅ Criar e gerenciar turmas
- ✅ Adicionar/editar matérias e lições
- ✅ Acompanhar progresso dos alunos
- ✅ Gerar relatórios de performance
- ✅ Criar exercícios personalizados

### Para Alunos  
- ✅ Visualizar progresso pessoal
- ✅ Acessar lições e exercícios
- ✅ Criar notas com assistente IA
- ✅ Acompanhar ranking e badges
- ✅ Revisar conteúdo com spaced repetition

## 🚀 Como Exportar e Distribuir

### Usando PyInstaller
```bash
pip install pyinstaller
pyinstaller --onefile --windowed main.py
```

### Usando auto-py-to-exe (GUI)
```bash
pip install auto-py-to-exe
auto-py-to-exe
```

### Preparação para Deploy
1. **Ambiente Virtual**: Isolar dependências
2. **Banco Portátil**: SQLite para fácil distribuição
3. **Configurações**: Arquivo .env para personalização
4. **Documentação**: Manual de uso incluído

## 🎯 Foco Educacional

### Conteúdo ENEM
- Reading comprehension
- Grammar essentials
- Essay writing
- Vocabulary contextual

### Conteúdo UFPR
- Advanced grammar
- Literature basics
- Formal writing
- Academic vocabulary

### Metodologia
- **Microlearning**: Lições de 5-10 minutos
- **Spaced Repetition**: Revisão otimizada
- **Gamificação**: Motivação através de jogos
- **Personalização**: IA adapta ao ritmo do aluno