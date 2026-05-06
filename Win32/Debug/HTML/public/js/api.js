/**
 * API Module - Funções genéricas para comunicação com backend Delphi
 * Base URL: http://localhost:9000/
 */

const API_BASE_URL = 'http://localhost:9000';

/**
 * Função genérica GET
 * @param {string} endpoint - Endpoint da API (ex: /elementos)
 * @returns {Promise} - Resposta da API
 */
async function apiGet(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição GET:', error);
    throw error;
  }
}

/**
 * Função genérica POST
 * @param {string} endpoint - Endpoint da API (ex: /elementos)
 * @param {object} data - Dados a serem enviados
 * @returns {Promise} - Resposta da API
 */
async function apiPost(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição POST:', error);
    throw error;
  }
}

/**
 * Função genérica PUT
 * @param {string} endpoint - Endpoint da API (ex: /elementos/1)
 * @param {object} data - Dados a serem atualizados
 * @returns {Promise} - Resposta da API
 */
async function apiPut(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição PUT:', error);
    throw error;
  }
}

/**
 * Função genérica DELETE
 * @param {string} endpoint - Endpoint da API (ex: /elementos/1)
 * @returns {Promise} - Resposta da API
 */
async function apiDelete(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na requisição DELETE:', error);
    throw error;
  }
}

// Exportar funções para uso global
window.API = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
