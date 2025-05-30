# Vou criar um exemplo de estrutura de banco de dados para o dashboard educacional
import sqlite3
import pandas as pd
import json
from datetime import datetime, timedelta
import random

# Criando estrutura do banco de dados para o dashboard educacional
database_structure = {
    "users": {
        "description": "Tabela principal de usuários (professores e alunos)",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "nome": "TEXT NOT NULL",
            "email": "TEXT UNIQUE NOT NULL", 
            "senha_hash": "TEXT NOT NULL",
            "tipo_usuario": "TEXT CHECK(tipo_usuario IN ('professor', 'aluno')) NOT NULL",
            "data_criacao": "DATETIME DEFAULT CURRENT_TIMESTAMP",
            "nivel_atual": "INTEGER DEFAULT 1",
            "pontos_totais": "INTEGER DEFAULT 0",
            "streak_dias": "INTEGER DEFAULT 0",
            "ultima_atividade": "DATETIME"
        }
    },
    "turmas": {
        "description": "Turmas de inglês organizadas pelo professor",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "nome": "TEXT NOT NULL",
            "professor_id": "INTEGER REFERENCES users(id)",
            "descricao": "TEXT",
            "ano_letivo": "INTEGER",
            "data_criacao": "DATETIME DEFAULT CURRENT_TIMESTAMP"
        }
    },
    "alunos_turmas": {
        "description": "Relacionamento entre alunos e turmas",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "aluno_id": "INTEGER REFERENCES users(id)",
            "turma_id": "INTEGER REFERENCES turmas(id)",
            "data_ingresso": "DATETIME DEFAULT CURRENT_TIMESTAMP"
        }
    },
    "materias": {
        "description": "Tópicos de inglês baseados no vestibular (ENEM, UFPR)",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "nome": "TEXT NOT NULL",
            "categoria": "TEXT",  # Grammar, Vocabulary, Reading, Writing, Listening
            "nivel_dificuldade": "INTEGER CHECK(nivel_dificuldade BETWEEN 1 AND 10)",
            "relevancia_vestibular": "TEXT",  # ENEM, UFPR, Ambos
            "descricao": "TEXT"
        }
    },
    "licoes": {
        "description": "Lições específicas dentro de cada matéria",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "materia_id": "INTEGER REFERENCES materias(id)",
            "titulo": "TEXT NOT NULL",
            "conteudo": "TEXT",
            "nivel": "INTEGER CHECK(nivel BETWEEN 1 AND 10)",
            "pontos_recompensa": "INTEGER DEFAULT 10",
            "tempo_estimado": "INTEGER", # em minutos
            "pre_requisitos": "TEXT"  # JSON com IDs de lições prerequisitos
        }
    },
    "exercicios": {
        "description": "Exercícios gamificados para cada lição",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "licao_id": "INTEGER REFERENCES licoes(id)",
            "tipo": "TEXT CHECK(tipo IN ('multipla_escolha', 'traducao', 'audio', 'escrita'))",
            "pergunta": "TEXT NOT NULL",
            "opcoes": "TEXT",  # JSON para múltipla escolha
            "resposta_correta": "TEXT NOT NULL",
            "explicacao": "TEXT",
            "pontos": "INTEGER DEFAULT 5"
        }
    },
    "progresso_alunos": {
        "description": "Progresso detalhado de cada aluno por lição",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "aluno_id": "INTEGER REFERENCES users(id)",
            "licao_id": "INTEGER REFERENCES licoes(id)",
            "status": "TEXT CHECK(status IN ('nao_iniciado', 'em_progresso', 'concluido', 'revisao'))",
            "pontuacao": "REAL DEFAULT 0",
            "tentativas": "INTEGER DEFAULT 0",
            "tempo_gasto": "INTEGER DEFAULT 0", # em segundos
            "data_inicio": "DATETIME",
            "data_conclusao": "DATETIME",
            "proxima_revisao": "DATETIME"  # Para spaced repetition
        }
    },
    "notas_ai": {
        "description": "Notas personalizadas criadas pelo assistente IA",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "usuario_id": "INTEGER REFERENCES users(id)",
            "titulo": "TEXT NOT NULL",
            "conteudo": "TEXT NOT NULL",
            "tags": "TEXT",  # JSON com tags
            "tipo": "TEXT CHECK(tipo IN ('resumo', 'dica', 'exercicio_personalizado', 'lembrete'))",
            "data_criacao": "DATETIME DEFAULT CURRENT_TIMESTAMP",
            "favorito": "BOOLEAN DEFAULT FALSE"
        }
    },
    "badges": {
        "description": "Sistema de conquistas/badges gamificado",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "nome": "TEXT NOT NULL",
            "descricao": "TEXT",
            "icone": "TEXT",
            "criterio": "TEXT",  # JSON com critérios para obter a badge
            "pontos_bonus": "INTEGER DEFAULT 0"
        }
    },
    "usuario_badges": {
        "description": "Badges conquistadas pelos usuários",
        "columns": {
            "id": "INTEGER PRIMARY KEY AUTOINCREMENT",
            "usuario_id": "INTEGER REFERENCES users(id)",
            "badge_id": "INTEGER REFERENCES badges(id)",
            "data_conquista": "DATETIME DEFAULT CURRENT_TIMESTAMP"
        }
    }
}

# Convertendo para um formato mais legível
db_design = []
for table_name, table_info in database_structure.items():
    columns_formatted = []
    for col_name, col_type in table_info["columns"].items():
        columns_formatted.append(f"  {col_name}: {col_type}")
    
    table_design = f"""
TABLE: {table_name}
DESCRIPTION: {table_info['description']}
COLUMNS:
{chr(10).join(columns_formatted)}
"""
    db_design.append(table_design)

# Salvando o design do banco de dados
with open("database_design.md", "w", encoding="utf-8") as f:
    f.write("# Design do Banco de Dados - Dashboard Educacional de Inglês\n\n")
    f.write("Este é o schema completo do banco de dados para o sistema de dashboard educacional.\n\n")
    f.write("## Tabelas do Sistema:\n")
    for design in db_design:
        f.write(design)
        f.write("\n" + "="*60 + "\n")

print("✅ Design do banco de dados criado e salvo em 'database_design.md'")
print(f"📊 Total de tabelas: {len(database_structure)}")
print("📋 Principais funcionalidades cobertas:")
print("- Gestão de usuários (professores e alunos)")
print("- Sistema de turmas")
print("- Conteúdo educacional estruturado por vestibular")
print("- Progresso gamificado com pontos e níveis")
print("- Sistema de badges/conquistas")
print("- Notas inteligentes com IA")
print("- Spaced repetition para revisão otimizada")