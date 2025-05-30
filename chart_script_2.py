import plotly.graph_objects as go
import numpy as np

# Data from the provided JSON
semanas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
pontos = [50, 120, 200, 310, 420, 560, 680, 820, 980, 1150, 1300, 1450]
cor_linha = "#2E86AB"

# Create the figure
fig = go.Figure()

# Add the main line with markers
fig.add_trace(go.Scatter(
    x=semanas,
    y=pontos,
    mode='lines+markers',
    line=dict(color=cor_linha, width=3),
    marker=dict(size=8, color=cor_linha),
    name='Pontos',
    hovertemplate='Semana %{x}<br>Pontos: %{y}<extra></extra>',
    cliponaxis=False
))

# Calculate and add trend line
z = np.polyfit(semanas, pontos, 1)
p = np.poly1d(z)
trend_y = p(semanas)

fig.add_trace(go.Scatter(
    x=semanas,
    y=trend_y,
    mode='lines',
    line=dict(color='gray', width=2, dash='dash'),
    name='Tendência',
    hovertemplate='Tendência<br>Semana %{x}<br>%{y}<extra></extra>',
    cliponaxis=False
))

# Update layout
fig.update_layout(
    title='Progressão de Pontos do Aluno',
    xaxis_title='Semana',
    yaxis_title='Pontos',
    showlegend=True,
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Update axes with grids and formatting
fig.update_xaxes(
    showgrid=True,
    gridwidth=1,
    gridcolor='lightgray',
    tickvals=semanas,
    range=[0.5, 12.5]
)

fig.update_yaxes(
    showgrid=True,
    gridwidth=1,
    gridcolor='lightgray',
    tickformat='.0f'
)

# Save the chart
fig.write_image('student_points_progression.png')
print("Chart saved as student_points_progression.png")