import api from '../api/axios';

export const getBudgets = (month, year) => {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    return api.get('/budgets', { params: { month: m, year: y } }).then(r => r.data);
};

export const createBudget = (data) =>
    api.post('/budgets', data).then(r => r.data);

export const updateBudget = (id, data) =>
    api.put(`/budgets/${id}`, data).then(r => r.data);

export const deleteBudget = (id) =>
    api.delete(`/budgets/${id}`);