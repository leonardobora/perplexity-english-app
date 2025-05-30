import plotly.express as px
import plotly.graph_objects as go

# Data with appropriate vibrant colors matching the instructions
funcionalidades = [
    "Sistema CRUD",    # 13 chars - azul (blue)
    "Gamificação",     # 12 chars - verde (green)
    "Assistente IA",   # 13 chars - roxo (purple)
    "Relatórios",      # 11 chars - laranja (orange)
    "Interface UI",    # 12 chars - rosa (pink)
    "Banco Dados",     # 11 chars - amarelo (yellow)
    "Autenticação"     # 13 chars - vermelho (red)
]

porcentagens = [25, 20, 15, 15, 10, 10, 5]

# Vibrant colors matching the requested color families
cores_vibrantes = [
    "#1FB8CD",  # Vibrant blue for Sistema CRUD
    "#00CC66",  # Vibrant green for Gamificação
    "#8E44AD",  # Vibrant purple for Assistente IA
    "#FFC185",  # Vibrant orange for Relatórios
    "#FF69B4",  # Vibrant pink for Interface UI
    "#FFD700",  # Vibrant yellow for Banco de Dados
    "#DB4545"   # Vibrant red for Autenticação
]

# Create pie chart
fig = go.Figure(data=[go.Pie(
    labels=funcionalidades,
    values=porcentagens,
    marker_colors=cores_vibrantes,
    textinfo='label+percent',
    textposition='inside'
)])

# Update layout following the instructions
fig.update_layout(
    title="Funcionalidades - Dashboard Educacional",
    uniformtext_minsize=14, 
    uniformtext_mode='hide'
)

# Save the chart
fig.write_image("dashboard_funcionalidades.png")