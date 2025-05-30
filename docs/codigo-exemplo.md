# Estrutura Técnica - Sistema de Dashboard CRUD Gamificado

## 1. Código de Exemplo - Modelo para Flask

```python
# app/models.py
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(200), nullable=False)
    tipo_usuario = db.Column(db.String(20), nullable=False)
    nivel_atual = db.Column(db.Integer, default=1)
    pontos_totais = db.Column(db.Integer, default=0)
    streak_dias = db.Column(db.Integer, default=0)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    turmas_professor = db.relationship('Turma', backref='professor', lazy=True)
    
    def __repr__(self):
        return f'<User {self.nome}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'tipo_usuario': self.tipo_usuario,
            'nivel_atual': self.nivel_atual,
            'pontos_totais': self.pontos_totais,
            'streak_dias': self.streak_dias
        }

class Turma(db.Model):
    __tablename__ = 'turmas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    professor_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    descricao = db.Column(db.Text)
    ano_letivo = db.Column(db.Integer)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Turma {self.nome}>'

class Materia(db.Model):
    __tablename__ = 'materias'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50))
    nivel_dificuldade = db.Column(db.Integer)
    relevancia_vestibular = db.Column(db.String(50))
    descricao = db.Column(db.Text)
    
    # Relacionamentos
    licoes = db.relationship('Licao', backref='materia', lazy=True)
    
    def __repr__(self):
        return f'<Materia {self.nome}>'

class Licao(db.Model):
    __tablename__ = 'licoes'
    
    id = db.Column(db.Integer, primary_key=True)
    materia_id = db.Column(db.Integer, db.ForeignKey('materias.id'))
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text)
    nivel = db.Column(db.Integer)
    pontos_recompensa = db.Column(db.Integer, default=10)
    tempo_estimado = db.Column(db.Integer)  # em minutos
    
    # Relacionamentos
    exercicios = db.relationship('Exercicio', backref='licao', lazy=True)
    
    def __repr__(self):
        return f'<Licao {self.titulo}>'

class Exercicio(db.Model):
    __tablename__ = 'exercicios'
    
    id = db.Column(db.Integer, primary_key=True)
    licao_id = db.Column(db.Integer, db.ForeignKey('licoes.id'))
    tipo = db.Column(db.String(50))
    pergunta = db.Column(db.Text, nullable=False)
    opcoes = db.Column(db.Text)  # JSON
    resposta_correta = db.Column(db.Text, nullable=False)
    explicacao = db.Column(db.Text)
    pontos = db.Column(db.Integer, default=5)
    
    def __repr__(self):
        return f'<Exercicio {self.id}>'
    
    def get_opcoes(self):
        if self.opcoes:
            return json.loads(self.opcoes)
        return []

class ProgressoAluno(db.Model):
    __tablename__ = 'progresso_alunos'
    
    id = db.Column(db.Integer, primary_key=True)
    aluno_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    licao_id = db.Column(db.Integer, db.ForeignKey('licoes.id'))
    status = db.Column(db.String(50))
    pontuacao = db.Column(db.Float, default=0)
    tentativas = db.Column(db.Integer, default=0)
    tempo_gasto = db.Column(db.Integer, default=0)  # em segundos
    data_conclusao = db.Column(db.DateTime)
    proxima_revisao = db.Column(db.DateTime)  # Para spaced repetition
    
    # Relacionamentos
    aluno = db.relationship('User', backref='progressos', lazy=True)
    licao = db.relationship('Licao', backref='progressos', lazy=True)
    
    def __repr__(self):
        return f'<Progresso {self.aluno_id}-{self.licao_id}>'

class NotaAI(db.Model):
    __tablename__ = 'notas_ai'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    titulo = db.Column(db.String(200), nullable=False)
    conteudo = db.Column(db.Text, nullable=False)
    tags = db.Column(db.Text)  # JSON
    tipo = db.Column(db.String(50))
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    favorito = db.Column(db.Boolean, default=False)
    
    # Relacionamentos
    usuario = db.relationship('User', backref='notas', lazy=True)
    
    def __repr__(self):
        return f'<Nota {self.titulo}>'
    
    def get_tags(self):
        if self.tags:
            return json.loads(self.tags)
        return []
```

## 2. Exemplo de Aplicação Flask com CRUD

```python
# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Turma, Materia, Licao, Exercicio, ProgressoAluno, NotaAI
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///dashboard.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

# Criar tabelas
with app.app_context():
    db.create_all()

# Rotas de API

# === Usuários === #
@app.route('/api/usuarios', methods=['GET'])
def get_usuarios():
    usuarios = User.query.all()
    return jsonify([usuario.to_dict() for usuario in usuarios])

@app.route('/api/usuarios', methods=['POST'])
def criar_usuario():
    data = request.json
    senha_hash = generate_password_hash(data['senha'])
    
    novo_usuario = User(
        nome=data['nome'],
        email=data['email'],
        senha_hash=senha_hash,
        tipo_usuario=data['tipo_usuario']
    )
    
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify(novo_usuario.to_dict()), 201

@app.route('/api/usuarios/<int:id>', methods=['GET'])
def get_usuario(id):
    usuario = User.query.get_or_404(id)
    return jsonify(usuario.to_dict())

@app.route('/api/usuarios/<int:id>', methods=['PUT'])
def atualizar_usuario(id):
    usuario = User.query.get_or_404(id)
    data = request.json
    
    usuario.nome = data.get('nome', usuario.nome)
    usuario.email = data.get('email', usuario.email)
    if 'senha' in data:
        usuario.senha_hash = generate_password_hash(data['senha'])
    
    db.session.commit()
    return jsonify(usuario.to_dict())

@app.route('/api/usuarios/<int:id>', methods=['DELETE'])
def deletar_usuario(id):
    usuario = User.query.get_or_404(id)
    db.session.delete(usuario)
    db.session.commit()
    return '', 204

# === Turmas === #
@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    turmas = Turma.query.all()
    return jsonify([{
        'id': t.id,
        'nome': t.nome,
        'professor_id': t.professor_id,
        'descricao': t.descricao,
        'ano_letivo': t.ano_letivo
    } for t in turmas])

@app.route('/api/turmas', methods=['POST'])
def criar_turma():
    data = request.json
    
    nova_turma = Turma(
        nome=data['nome'],
        professor_id=data['professor_id'],
        descricao=data.get('descricao'),
        ano_letivo=data.get('ano_letivo')
    )
    
    db.session.add(nova_turma)
    db.session.commit()
    
    return jsonify({
        'id': nova_turma.id,
        'nome': nova_turma.nome,
        'professor_id': nova_turma.professor_id,
        'descricao': nova_turma.descricao,
        'ano_letivo': nova_turma.ano_letivo
    }), 201

# === Integração com OpenAI para notas === #
@app.route('/api/notas/gerar', methods=['POST'])
def gerar_nota_ai():
    data = request.json
    import openai
    
    openai.api_key = os.environ.get('OPENAI_API_KEY')
    
    try:
        # Exemplo de integração com OpenAI
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Você é um assistente de estudos de inglês para vestibular."},
                {"role": "user", "content": data['prompt']}
            ]
        )
        
        conteudo_gerado = response.choices[0].message.content
        
        nova_nota = NotaAI(
            usuario_id=data['usuario_id'],
            titulo=data.get('titulo', 'Nota Gerada por IA'),
            conteudo=conteudo_gerado,
            tipo=data.get('tipo', 'resumo')
        )
        
        db.session.add(nova_nota)
        db.session.commit()
        
        return jsonify({
            'id': nova_nota.id,
            'titulo': nova_nota.titulo,
            'conteudo': nova_nota.conteudo
        })
    
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
```

## 3. Estrutura do Frontend Streamlit

```python
# frontend/app.py
import streamlit as st
import requests
import pandas as pd
import plotly.express as px
from datetime import datetime, timedelta
import json

# Configuração inicial
API_URL = "http://localhost:5000/api"

# Configuração da página
st.set_page_config(
    page_title="Dashboard Educacional de Inglês",
    page_icon="🎓",
    layout="wide"
)

# Autenticação simples
def login():
    st.sidebar.title("Login")
    email = st.sidebar.text_input("Email")
    senha = st.sidebar.text_input("Senha", type="password")
    
    if st.sidebar.button("Entrar"):
        # Simples para exemplo, em produção usar autenticação real
        response = requests.post(f"{API_URL}/login", json={
            "email": email,
            "senha": senha
        })
        
        if response.status_code == 200:
            user_data = response.json()
            st.session_state.user = user_data
            st.session_state.logged_in = True
            st.success("Login realizado com sucesso!")
        else:
            st.error("Email ou senha incorretos")

# Dashboard principal
def dashboard_professor():
    st.title("🎓 Dashboard do Professor")
    
    # Estatísticas
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Total de Alunos", "42")
    with col2:
        st.metric("Lições Criadas", "24")
    with col3:
        st.metric("Taxa de Conclusão", "78%", delta="12%")
    with col4:
        st.metric("Média de Pontos", "345", delta="42")
    
    # Gráficos
    st.subheader("Progresso das Turmas")
    
    # Dados de exemplo
    turmas = ["3A", "3B", "3C"]
    progresso = [85, 72, 64]
    df_turmas = pd.DataFrame({
        "Turma": turmas,
        "Progresso (%)": progresso
    })
    
    fig = px.bar(df_turmas, x="Turma", y="Progresso (%)", color="Progresso (%)")
    st.plotly_chart(fig, use_container_width=True)
    
    # CRUD de Lições
    st.subheader("Gerenciar Lições")
    
    tab1, tab2, tab3 = st.tabs(["Lições Existentes", "Criar Nova", "Editar/Remover"])
    
    with tab1:
        st.write("Lista de lições existentes")
        # Aqui iria uma tabela com as lições existentes (dados da API)
        
    with tab2:
        st.write("Criar nova lição")
        titulo = st.text_input("Título da Lição")
        materia = st.selectbox("Matéria", ["Grammar", "Vocabulary", "Reading", "Writing"])
        nivel = st.slider("Nível de Dificuldade", 1, 10, 5)
        conteudo = st.text_area("Conteúdo da Lição")
        
        if st.button("Salvar Lição"):
            # Aqui seria feita a chamada à API para salvar
            st.success("Lição criada com sucesso!")
            
    with tab3:
        st.write("Editar ou remover lições")
        # Interface para selecionar e editar lições

def dashboard_aluno():
    st.title("🎯 Dashboard do Aluno")
    
    # Estatísticas pessoais
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Seu Nível", "7")
    with col2:
        st.metric("Pontos", "1240", delta="120")
    with col3:
        st.metric("Streak", "5 dias", delta="2")
    with col4:
        st.metric("Badges", "8/20")
    
    # Progresso
    st.subheader("Seu Progresso")
    
    # Dados de exemplo para gráfico de progresso
    categorias = ["Grammar", "Vocabulary", "Reading", "Writing", "Listening"]
    nivel_atual = [8, 6, 7, 5, 4]
    maximo = [10, 10, 10, 10, 10]
    
    df_progresso = pd.DataFrame({
        "Categoria": categorias,
        "Nível Atual": nivel_atual,
        "Máximo": maximo
    })
    
    fig = px.line_polar(df_progresso, r="Nível Atual", theta="Categoria", line_close=True)
    st.plotly_chart(fig, use_container_width=True)
    
    # Próximas lições
    st.subheader("Próximas Lições")
    
    # Dados de exemplo
    proximas_licoes = [
        {"titulo": "Present Perfect", "materia": "Grammar", "nivel": 7},
        {"titulo": "Essay Writing", "materia": "Writing", "nivel": 6},
        {"titulo": "Environment Vocab", "materia": "Vocabulary", "nivel": 5}
    ]
    
    for licao in proximas_licoes:
        st.write(f"📚 **{licao['titulo']}** - {licao['materia']} (Nível {licao['nivel']})")
    
    # Assistente IA
    st.subheader("Assistente IA")
    
    with st.expander("Gerar resumo ou nota personalizada"):
        topico = st.text_input("Tópico ou pergunta")
        tipo = st.selectbox("Tipo de nota", ["Resumo", "Dica", "Exercício Personalizado"])
        
        if st.button("Gerar com IA"):
            # Simulação de chamada à API de IA
            st.info("Gerando nota com IA... (aqui seria feita a chamada à API)")
            
            # Exemplo de resposta
            st.write("""
            ### Present Perfect - Resumo
            
            O Present Perfect é um tempo verbal usado para conectar o passado ao presente.
            
            **Estrutura**: Subject + have/has + past participle
            
            **Exemplos**:
            - I have visited London twice.
            - She has studied for the test.
            
            **Usos principais**:
            1. Experiências passadas sem tempo específico
            2. Ações que começaram no passado e continuam no presente
            3. Ações recentes com relevância no presente
            
            **Palavras-chave**: already, yet, ever, never, just, recently, lately
            """)

# Fluxo principal
def main():
    # Autenticação
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    
    if not st.session_state.logged_in:
        login()
    else:
        # Barra lateral
        st.sidebar.title(f"Olá, {st.session_state.user['nome']}")
        
        # Menu
        menu = st.sidebar.radio("Menu", ["Dashboard", "Lições", "Exercícios", "Notas", "Configurações"])
        
        # Renderizar página com base no tipo de usuário
        if st.session_state.user['tipo_usuario'] == 'professor':
            dashboard_professor()
        else:
            dashboard_aluno()
        
        # Botão de logout
        if st.sidebar.button("Sair"):
            st.session_state.logged_in = False
            st.experimental_rerun()

if __name__ == "__main__":
    main()
```

## 4. Exportar a aplicação com PyInstaller

```bash
# Criar um arquivo spec customizado
pyi-makespec --onefile --windowed --add-data "static:static" frontend/app.py

# Editar o arquivo .spec conforme necessário para incluir recursos

# Criar o executável
pyinstaller app.spec

# Ou usar auto-py-to-exe (abordagem mais simples)
pip install auto-py-to-exe
auto-py-to-exe
```

## 5. Integração OpenAI para Assistente IA

```python
# ai_service.py
import openai
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

class AssistenteIA:
    def __init__(self):
        self.model = "gpt-3.5-turbo"
    
    def gerar_resumo(self, topico, nivel_aluno):
        """Gera um resumo personalizado sobre um tópico de inglês"""
        prompt = f"""
        Crie um resumo didático sobre {topico} para um aluno 
        de inglês de nível {nivel_aluno} preparando-se para o ENEM.
        Foque nos pontos mais importantes e inclua exemplos.
        """
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Você é um professor de inglês especializado em preparar alunos para o ENEM e UFPR."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content
    
    def criar_exercicio(self, topico, nivel_aluno):
        """Cria um exercício personalizado sobre um tópico"""
        prompt = f"""
        Crie um exercício de múltipla escolha sobre {topico} para um aluno 
        de nível {nivel_aluno}. Inclua 4 opções de resposta e indique a correta.
        Adicione uma explicação didática sobre a resposta correta.
        """
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Você é um professor de inglês especializado em criar exercícios didáticos."},
                {"role": "user", "content": prompt}
            ]
        )
        
        # Aqui poderia ter um parser para estruturar a resposta
        return response.choices[0].message.content
    
    def analisar_desempenho(self, dados_aluno):
        """Analisa o desempenho do aluno e dá recomendações"""
        # dados_aluno seria um JSON com informações sobre o progresso
        
        prompt = f"""
        Analise o desempenho deste aluno com base nos dados a seguir e forneça 
        3 recomendações específicas para melhorar seu aprendizado:
        
        {dados_aluno}
        """
        
        response = openai.ChatCompletion.create(
            model=self.model,
            messages=[
                {"role": "system", "content": "Você é um analista educacional especializado em ensino de inglês."},
                {"role": "user", "content": prompt}
            ]
        )
        
        return response.choices[0].message.content

# Exemplo de uso
if __name__ == "__main__":
    assistente = AssistenteIA()
    resumo = assistente.gerar_resumo("Present Perfect", 7)
    print(resumo)
```