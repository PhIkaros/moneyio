// src/hooks/useBudgetAlerts.js
import { useMemo } from 'react';

// Thresholds removed as we show all budgets

export const useBudgetAlerts = (budgets = [], outcomes = []) => {
    const alerts = useMemo(() => {
        if (!budgets.length) return [];

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        // Find the latest global budget
        const globalBudgets = budgets.filter(b => b.categorie_id === null || b.categorie_id === undefined);
        globalBudgets.sort((a, b) => {
            if (Number(b.year) !== Number(a.year)) return Number(b.year) - Number(a.year);
            return Number(b.month) - Number(a.month);
        });
        
        const latestGlobalBudget = globalBudgets.length > 0 ? globalBudgets[0] : null;
        const activeBudgets = latestGlobalBudget ? [latestGlobalBudget] : [];

        // group outcomes spending by category_id for this month
        const spendingByCategory = {};
        let totalSpending = 0;

        outcomes.forEach(o => {
            if (!o.date) return;
            const d = new Date(o.date);
            if (d.getMonth() + 1 !== currentMonth || d.getFullYear() !== currentYear) return;

            const amount = parseFloat(o.amount || 0);
            totalSpending += amount;

            // Try to get category ID from nested relationship or direct field
            const catId = o.sous_categ?.categorie_id
                || o.sous_categ?.category_id
                || o.sous_categ?.category?.id;

            if (catId) {
                spendingByCategory[catId] = (spendingByCategory[catId] || 0) + amount;
            }
        });

        return activeBudgets
            .map(b => {
                let spent;

                if (b.categorie_id === null || b.categorie_id === undefined) {
                    // global — compare against ALL outcomes this month
                    spent = totalSpending;
                } else {
                    spent = spendingByCategory[b.categorie_id] || 0;
                }

                const budgetAmount = parseFloat(b.amount);
                if (budgetAmount <= 0) return null;

                const ratio = spent / budgetAmount;
                const remaining = budgetAmount - spent;

                return {
                    id: b.id,
                    categoryName: (b.categorie_id === null || b.categorie_id === undefined)
                        ? 'Monthly Budget'
                        : (b.category?.name || 'Unknown'),
                    budgetAmount,
                    spent,
                    remaining,
                    ratio,
                    status: ratio > 0.9 ? 'danger' : ratio >= 0.7 ? 'warning' : 'good',
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.ratio - a.ratio);
    }, [budgets, outcomes]);

    return alerts;
};