window.atualizarData = function() {
    const op = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElem = document.getElementById('date-display');
    if (dateElem) dateElem.innerText = new Date().toLocaleDateString('pt-BR', op);
};

window.pintarHeader = function(elemento) {
    if (!elemento) return;
    const icon = elemento.querySelector('.category-icon');
    if (icon) {
        const cor = window.getComputedStyle(icon).color;
        const header = document.getElementById('main-header');
        if (header) header.style.borderColor = cor;
    }
};

window.toggleSubmenu = function(id, elemento) {
    const sub = document.getElementById(id);
    if (!sub) return;
    const isOpened = sub.classList.contains('open');
    document.querySelectorAll('.submenu').forEach(s => s.classList.remove('open'));
    if (!isOpened) {
        sub.classList.add('open');
        pintarHeader(elemento);
    }
};

window.toggleSidebar = function() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('collapsed');
    window.updateSidebarVisuals();
};

window.updateSidebarVisuals = function() {
    const sidebar = document.getElementById('sidebar');
    const logo = document.getElementById('logo-sidebar');
    if (!sidebar) return;
    const isCollapsed = sidebar.classList.contains('collapsed');
    if (logo) {
        logo.style.maxWidth = isCollapsed ? '45px' : '140%';
        logo.style.maxHeight = isCollapsed ? '45px' : '140px';
    }
    document.querySelectorAll('.menu-category').forEach(cat => {
        const txt = cat.querySelector('.menu-category-text span')?.innerText || '';
        cat.setAttribute('title', isCollapsed ? txt : '');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        const txt = item.querySelector('span')?.innerText.trim() || '';
        item.setAttribute('title', isCollapsed ? txt : '');
    });
};

window.activateMenu = function() {
    const current = window.location.pathname.split('/').pop().toLowerCase();
    let matched = false;
    document.querySelectorAll('.menu-item').forEach(item => {
        const href = item.getAttribute('href')?.split('/').pop()?.toLowerCase();
        if (!href) return;
        if (href === current || (current === '' && href === 'index.html')) {
            item.classList.add('active');
            const submenu = item.closest('.submenu');
            if (submenu) {
                submenu.classList.add('open');
                const category = submenu.previousElementSibling;
                if (category) pintarHeader(category);
            }
            matched = true;
        } else {
            item.classList.remove('active');
        }
    });
    if (!matched && current === '') {
        const item = document.querySelector('.menu-item[href="index.html"]');
        if (item) item.classList.add('active');
    }
};

window.initializeLayout = function() {
    window.atualizarData();
    window.updateSidebarVisuals();
    window.activateMenu();
};
