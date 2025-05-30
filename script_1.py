# Criando estrutura básica do banco de dados para o dashboard educacional
import json

# Estrutura simplificada do banco de dados
database_schema = {
    "users": [
        "id INTEGER PRIMARY KEY",
        "nome TEXT NOT NULL",
        "email TEXT UNIQUE NOT NULL", 
        "tipo_usuario TEXT NOT NULL", # professor ou aluno
        "nivel_atual INTEGER DEFAULT 1",
        "pontos_totais INTEGER DEFAULT 0",
        "streak_dias INTEGER DEFAULT 0"
    ],
    "turmas": [
        "id INTEGER PRIMARY KEY",
        "nome TEXT NOT NULL",
        "professor_id INTEGER",
        "ano_letivo INTEGER"
    ],
    "materias": [
        "id INTEGER PRIMARY KEY",
        "nome TEXT NOT NULL",
        "categoria TEXT", # Grammar, Vocabulary, Reading, Writing
        "nivel_dificuldade INTEGER",
        "relevancia_vestibular TEXT" # ENEM, UFPR, Ambos
    ],
    "licoes": [
        "id INTEGER PRIMARY KEY",
        "materia_id INTEGER",
        "titulo TEXT NOT NULL",
        "conteudo TEXT",
        "pontos_recompensa INTEGER DEFAULT 10"
    ],
    "progresso_alunos": [
        "id INTEGER PRIMARY KEY",
        "aluno_id INTEGER",
        "licao_id INTEGER",
        "status TEXT", # nao_iniciado, em_progresso, concluido
        "pontuacao REAL DEFAULT 0",
        "data_conclusao DATETIME"
    ],
    "notas_ai": [
        "id INTEGER PRIMARY KEY",
        "usuario_id INTEGER",
        "titulo TEXT NOT NULL",
        "conteudo TEXT NOT NULL",
        "tags TEXT", # JSON
        "data_criacao DATETIME"
    ]
}

print("🗄️ ESTRUTURA DO BANCO DE DADOS - DASHBOARD EDUCACIONAL")
print("=" * 60)

for table_name, columns in database_schema.items():
    print(f"\n📋 TABELA: {table_name.upper()}")
    print("-" * 30)
    for column in columns:
        print(f"  • {column}")

# Criando dados de exemplo
sample_data = {
    "materias_exemplo": [
        {"nome": "Present Perfect", "categoria": "Grammar", "nivel": 3, "vestibular": "ENEM"},
        {"nome": "Vocabulary - Environment", "categoria": "Vocabulary", "nivel": 2, "vestibular": "Ambos"},
        {"nome": "Reading Comprehension", "categoria": "Reading", "nivel": 4, "vestibular": "UFPR"},
        {"nome": "Essay Writing", "categoria": "Writing", "nivel": 5, "vestibular": "Ambos"}
    ],
    "badges_exemplo": [
        {"nome": "First Step", "descricao": "Complete sua primeira lição", "pontos": 10},
        {"nome": "Grammar Master", "descricao": "Complete 10 lições de gramática", "pontos": 50},
        {"nome": "Streak Champion", "descricao": "Mantenha 7 dias consecutivos", "pontos": 100},
        {"nome": "ENEM Ready", "descricao": "Complete todas as lições do ENEM", "pontos": 200}
    ]
}

print(f"\n\n🎯 DADOS DE EXEMPLO:")
print("=" * 40)
print("\n📚 Matérias de Inglês para Vestibular:")
for materia in sample_data["materias_exemplo"]:
    print(f"  • {materia['nome']} ({materia['categoria']}) - Nível {materia['nivel']} - {materia['vestibular']}")

print("\n🏆 Sistema de Badges Gamificado:")
for badge in sample_data["badges_exemplo"]:
    print(f"  • {badge['nome']}: {badge['descricao']} (+{badge['pontos']} pts)")

print(f"\n✅ Schema do banco criado com {len(database_schema)} tabelas")
print("🚀 Pronto para implementação com SQLite/PostgreSQL")