!pip install kaleido

import plotly.graph_objects as go
import json

# Data from the provided JSON
data = {
  "frameworks": ["Streamlit", "Dash", "Flask"],
  "categorias": ["Facilidade de Aprendizado", "Velocidade de Desenvolvimento", "Customização Visual", "Recursos Interativos", "Deploy e Distribuição", "Adequação para CRUD"],
  "pontuacoes": {
    "Streamlit": [9, 9, 5, 7, 8, 6],
    "Dash": [6, 7, 8, 9, 6, 7],
    "Flask": [4, 5, 10, 6, 9, 10]
  }
}

# Abbreviate category names to 15 characters
categorias_abrev = ["Facilidade", "Velocidade", "Customização", "Recursos Inter.", "Deploy/Distr.", "CRUD"]

# Colors for each framework
colors = ['#1FB8CD', '#FFC185', '#B4413C']

# Create horizontal bar chart
fig = go.Figure()

# Add bars for each framework
for i, framework in enumerate(data["frameworks"]):
    fig.add_trace(go.Bar(
        name=framework,
        y=categorias_abrev,
        x=data["pontuacoes"][framework],
        orientation='h',
        marker_color=colors[i],
        cliponaxis=False
    ))

# Update layout
fig.update_layout(
    title="Frameworks Python - Dashboard Educacional",
    xaxis_title="Pontuação",
    yaxis_title="Categorias",
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Update axes
fig.update_xaxes(range=[0, 10])
fig.update_yaxes()

# Save the chart
fig.write_image("frameworks_comparison.png")
print("Chart saved successfully!")