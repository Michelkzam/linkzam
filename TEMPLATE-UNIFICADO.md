# 📋 TEMPLATE UNIFICADO - LINKZAM

## 🎯 Objetivo
Padronizar todas as páginas do projeto com uma estrutura consistente de CSS, HTML e JavaScript, facilitando manutenção e reutilização de código.

---

## 📁 Estrutura Base

### HTML Necessário

```html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TÍTULO DA PÁGINA]</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Estilos específicos da página (opcional) */
    </style>
</head>
<body>
    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar">
        <!-- Código completo em template-sidebar.html -->
    </aside>

    <!-- CONTEÚDO PRINCIPAL -->
    <div class="main-container">
        <header id="main-header">
            <div class="breadcrumb">Linkzam > [Seção] > [Página]</div>
            <div id="date-display"></div>
            <div>Operador: <strong>Admin</strong></div>
        </header>

        <main class="content-view">
            <!-- CUSTOMIZE AQUI PARA CADA PÁGINA -->
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="scripts.js"></script>
</body>
</html>
```

---

## 🎨 CSS GLOBAL (styles.css)

### Variáveis de Cores
```css
:root {
    --sidebar-width: 225px;
    --header-height: 60px;
    --primary-color: #2c3e50;
    --secondary-color: #34495e;
    --accent-color: #3498db;
    --text-color: #ecf0f1;
    --bg-body: #f4f7f6;
    --success: #27ae60;
    --warning: #f39c12;
    --danger: #e74c3c;
}
```

### Componentes Reutilizáveis

#### 1️⃣ Cards de Estatísticas
```html
<div class="stats-grid">
    <div class="stat-card border-tickets">
        <div class="stat-info">
            <h3>Título</h3>
            <p>123</p>
        </div>
        <i class="fa-solid fa-icon"></i>
    </div>
</div>
```

#### 2️⃣ Tabelas Profissionais
```html
<table class="table-custom">
    <thead>
        <tr>
            <th>Coluna 1</th>
            <th>Coluna 2</th>
            <th>Ações</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Dado 1</td>
            <td>Dado 2</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action btn-view"><i class="fa-solid fa-eye"></i></button>
                    <button class="btn-action btn-edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-action btn-finish"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>
    </tbody>
</table>
```

#### 3️⃣ Cards Informativos
```html
<div class="card">
    <div class="card-header">
        <h2>Título do Card</h2>
        <a href="#" style="font-size: 0.8rem; color: var(--accent-color);">Ver mais</a>
    </div>
    <!-- Conteúdo aqui -->
</div>
```

#### 4️⃣ Badges de Status
```html
<span class="badge bg-high">Alta Prioridade</span>
<span class="badge bg-process">Em Processamento</span>
```

#### 5️⃣ Barra de Filtros
```html
<div class="filter-bar">
    <div class="search-wrapper">
        <input type="text" placeholder="Buscar...">
        <i class="fa-solid fa-magnifying-glass"></i>
    </div>
    <select class="filter-select"><option>Filtro 1</option></select>
    <button class="btn-new-ticket">+ Novo Item</button>
</div>
```

---

## 📊 Layouts Pré-formatados

### Layout Dashboard (2 Colunas)
```html
<div class="dashboard-row">
    <div class="card">
        <!-- Coluna 1 (2/3) -->
    </div>
    <div class="card">
        <!-- Coluna 2 (1/3) -->
    </div>
</div>
```

### Layout Lista/Tabela
```html
<div class="filter-bar">
    <!-- Filtros -->
</div>
<div class="card-table">
    <table class="table-custom">
        <!-- Dados -->
    </table>
</div>
```

### Layout Kanban
```html
<section class="card">
    <h3>Quadro Kanban</h3>
    <div class="kanban-board" id="kanban">
        <!-- Colunas e cards gerados dinamicamente -->
    </div>
</section>
```

---

## 🔧 JavaScript - Funções Comuns

### Atualizar Data
```javascript
function atualizarData() {
    const op = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('date-display').innerText = 
        new Date().toLocaleDateString('pt-BR', op);
}
```

### Manipular Sidebar
```javascript
// Toggle Collapse
document.getElementById('toggle-menu-btn').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('collapsed');
    handleSidebarState();
});

// Handle state changes
function handleSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    // Atualizar logo, títulos, etc.
}
```

### Abrir/Fechar Submenus
```javascript
function toggleSubmenu(id, elemento) {
    const sub = document.getElementById(id);
    const isOpened = sub.classList.contains('open');
    document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
    
    if(!isOpened) {
        sub.classList.add('open');
        pintarHeader(elemento);
    }
}
```

### Pintar Header (dinâmico)
```javascript
function pintarHeader(elemento) {
    const icon = elemento.querySelector('.category-icon');
    if(icon) {
        const cor = window.getComputedStyle(icon).color;
        document.getElementById('main-header').style.borderColor = cor;
    }
}
```

---

## 🎨 Classes de Cores por Seção

```css
.clr-principal    { color: #1abc9c; }   /* Principal */
.clr-helpdesk     { color: #3498db; }   /* Help Desk */
.clr-rmm          { color: #e67e22; }   /* RMM */
.clr-cadastros    { color: #9b59b6; }   /* Cadastros */
.clr-sincronizar  { color: #f1c40f; }   /* Sincronizar */
.clr-config       { color: #95a5a6; }   /* Configurações */
.clr-perfil       { color: #e74c3c; }   /* Perfil */
```

---

## 📱 Responsividade

O template inclui media queries para:
- **Desktop**: Layout completo com sidebar
- **Tablet** (< 1200px): Grid reduzido
- **Mobile** (< 768px): Sidebar retrátil com toggle

```css
@media (max-width: 768px) {
    .sidebar { position: absolute; left: -225px; }
    .sidebar.open { left: 0; }
}
```

---

## ✅ Checklist de Implementação

Para implementar o template em uma nova página:

- [ ] Copiar estrutura HTML base
- [ ] Atualizar `<title>` da página
- [ ] Atualizar breadcrumb no header
- [ ] Vincular arquivo CSS correto (`styles.css`)
- [ ] Customizar conteúdo em `<main class="content-view">`
- [ ] Incluir scripts necessários
- [ ] Atualizar menu ativo no sidebar
- [ ] Testar responsividade

---

## 📚 Componentes Disponíveis

| Componente | Classe CSS | Descrição |
|-----------|-----------|-----------|
| Card | `.card` | Container básico branco com sombra |
| Stat Card | `.stat-card` | Card de estatística com ícone |
| Tabela | `.table-custom` | Tabela profissional formatada |
| Badge | `.badge` | Label pequeno colorido |
| Botão | `.btn-action` | Botão pequeno para ações |
| Filtro | `.filter-bar` | Barra com busca e filtros |
| Grid | `.stats-grid` | Grid responsivo de cards |
| Modal | `.modal-overlay` | Modal com overlay |

---

## 🚀 Como Usar

1. **Crie uma cópia** deste template para sua nova página
2. **Customize** apenas o conteúdo em `<main class="content-view">`
3. **Mantenha** toda a estrutura de sidebar e header igual
4. **Teste** em desktop, tablet e mobile
5. **Commit** para o repositório

---

## 📞 Suporte

Dúvidas sobre o template? Consulte:
- `index.html` - Exemplo completo
- `tickets.html` - Exemplo com tabela e modal
- `dispositivos.html` - Exemplo com formulário

**Template criado em: 2025-05-19**
