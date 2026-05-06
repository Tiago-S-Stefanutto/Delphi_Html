/**
 * Main Module - Inicializações gerais da aplicação
 */

/**
 * Inicializar aplicação
 */
function initApp() {
  console.log('Aplicação de Química iniciada');
  
  // Verificar se a API está acessível
  checkAPIHealth();
  
  // Inicializar listeners globais
  initGlobalListeners();
}

/**
 * Verificar saúde da API
 */
async function checkAPIHealth() {
  try {
    const response = await fetch('http://localhost:9000/elementos', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      console.log('✓ API está acessível');
    } else {
      console.warn('⚠ API retornou status:', response.status);
    }
  } catch (error) {
    console.error('✗ API não está acessível:', error);
    showAPIErrorNotification();
  }
}

/**
 * Mostrar notificação de erro da API
 */
function showAPIErrorNotification() {
  const notification = document.createElement('div');
  notification.id = 'api-error-notification';
  notification.className = 'api-error-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span>⚠ Aviso: A API não está acessível no momento.</span>
      <button onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover notificação após 5 segundos
  setTimeout(() => {
    const notif = document.getElementById('api-error-notification');
    if (notif) {
      notif.remove();
    }
  }, 5000);
}

/**
 * Inicializar listeners globais
 */
function initGlobalListeners() {
  // Adicionar listeners globais conforme necessário
  document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
  });
}

/**
 * Formatar número com separador de milhares
 * @param {number} num - Número a formatar
 * @returns {string} - Número formatado
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Converter string para número
 * @param {string} str - String a converter
 * @returns {number} - Número convertido
 */
function toNumber(str) {
  return parseFloat(str.replace(',', '.'));
}

/**
 * Validar se campo está vazio
 * @param {string} value - Valor a validar
 * @returns {boolean} - true se vazio, false caso contrário
 */
function isEmpty(value) {
  return !value || value.trim() === '';
}

/**
 * Adicionar classe a elemento
 * @param {string} elementId - ID do elemento
 * @param {string} className - Nome da classe
 */
function addClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remover classe de elemento
 * @param {string} elementId - ID do elemento
 * @param {string} className - Nome da classe
 */
function removeClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Alternar classe de elemento
 * @param {string} elementId - ID do elemento
 * @param {string} className - Nome da classe
 */
function toggleClass(elementId, className) {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Obter elemento por ID
 * @param {string} elementId - ID do elemento
 * @returns {HTMLElement} - Elemento encontrado ou null
 */
function getElement(elementId) {
  return document.getElementById(elementId);
}

/**
 * Definir conteúdo de elemento
 * @param {string} elementId - ID do elemento
 * @param {string} content - Conteúdo a definir
 */
function setContent(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = content;
  }
}

/**
 * Obter conteúdo de elemento
 * @param {string} elementId - ID do elemento
 * @returns {string} - Conteúdo do elemento
 */
function getContent(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.innerHTML : '';
}

/**
 * Obter valor de input
 * @param {string} inputId - ID do input
 * @returns {string} - Valor do input
 */
function getInputValue(inputId) {
  const input = document.getElementById(inputId);
  return input ? input.value : '';
}

/**
 * Definir valor de input
 * @param {string} inputId - ID do input
 * @param {string} value - Valor a definir
 */
function setInputValue(inputId, value) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = value;
  }
}

// Exportar funções para uso global
window.App = {
  initApp,
  checkAPIHealth,
  formatNumber,
  toNumber,
  isEmpty,
  addClass,
  removeClass,
  toggleClass,
  getElement,
  setContent,
  getContent,
  getInputValue,
  setInputValue,
};

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', initApp);
