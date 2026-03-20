// Configuration de l'API
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Helper pour gérer les réponses
async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Une erreur est survenue" }));
    throw new Error(
      error.message || `Erreur ${response.status}`,
    );
  }
  return response.json();
}

// Helper pour les requêtes
async function request(
  endpoint: string,
  options: RequestInit = {},
) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  return handleResponse(response);
}

// API Books
export const booksAPI = {
  getAll: () => request("/books"),
  getById: (id: string) => request(`/books/${id}`),
  create: (data: any) =>
    request("/books", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request(`/books/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request(`/books/${id}`, {
      method: "DELETE",
    }),
};

// API Members
export const membersAPI = {
  getAll: () => request("/members"),
  getById: (id: string) => request(`/members/${id}`),
  create: (data: any) =>
    request("/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    request(`/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request(`/members/${id}`, {
      method: "DELETE",
    }),
};

// API Loans
export const loansAPI = {
  getAll: () => request("/loans"),
  getById: (id: string) => request(`/loans/${id}`),
  create: (data: any) =>
    request("/loans", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  returnLoan: (id: string) =>
    request(`/loans/${id}/return`, {
      method: "POST",
    }),
  delete: (id: string) =>
    request(`/loans/${id}`, {
      method: "DELETE",
    }),
};

// API Dashboard/Stats
export const statsAPI = {
  get: () => request("/stats"),
};