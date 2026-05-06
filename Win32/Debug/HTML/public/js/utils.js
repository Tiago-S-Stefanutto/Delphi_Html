/**
 * Utils Module - Funções utilitárias gerais
 */

/**
 * Obter parâmetro da URL
 * @param {string} paramName - Nome do parâmetro
 * @returns {string|null} - Valor do parâmetro ou null
 */
function getUrlParameter(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

/**
 * Obter todos os parâmetros da URL
 * @returns {object} - Objeto com todos os parâmetros
 */
function getAllUrlParameters() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (let [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

/**
 * Redirecionar para uma página
 * @param {string} url - URL de destino
 */
function redirect(url) {
  window.location.href = url;
}

/**
 * Voltar para página anterior
 */
function goBack() {
  window.history.back();
}

/**
 * Mostrar alerta de sucesso
 * @param {string} message - Mensagem a exibir
 */
function showSuccess(message) {
  alert('✓ ' + message);
}

/**
 * Mostrar alerta de erro
 * @param {string} message - Mensagem a exibir
 */
function showError(message) {
  alert('✗ Erro: ' + message);
}

/**
 * Mostrar confirmação
 * @param {string} message - Mensagem a exibir
 * @returns {boolean} - true se confirmado, false caso contrário
 */
function showConfirm(message) {
  return confirm(message);
}

/**
 * Formatar data para formato brasileiro (DD/MM/YYYY)
 * @param {string|Date} date - Data a formatar
 * @returns {string} - Data formatada
 */
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean} - true se válido, false caso contrário
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Limpar formulário
 * @param {string} formId - ID do formulário
 */
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
  }
}

/**
 * Desabilitar botão
 * @param {string} buttonId - ID do botão
 */
function disableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.style.opacity = '0.5';
  }
}

/**
 * Habilitar botão
 * @param {string} buttonId - ID do botão
 */
function enableButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.style.opacity = '1';
  }
}

/**
 * Mostrar elemento
 * @param {string} elementId - ID do elemento
 */
function showElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'block';
  }
}

/**
 * Ocultar elemento
 * @param {string} elementId - ID do elemento
 */
function hideElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

/**
 * Limpar conteúdo de elemento
 * @param {string} elementId - ID do elemento
 */
function clearElement(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '';
  }
}

// Exportar funções para uso global
window.Utils = {
  getUrlParameter,
  getAllUrlParameters,
  redirect,
  goBack,
  showSuccess,
  showError,
  showConfirm,
  formatDate,
  isValidEmail,
  clearForm,
  disableButton,
  enableButton,
  showElement,
  hideElement,
  clearElement,
};
