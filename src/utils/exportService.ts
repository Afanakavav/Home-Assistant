import type { Expense } from '../types';
import { format } from 'date-fns';

export const exportExpensesToCSV = (expenses: Expense[]): void => {
  if (expenses.length === 0) {
    alert('Nessuna spesa da esportare');
    return;
  }

  // CSV Header
  const headers = ['Data', 'Descrizione', 'Categoria', 'Importo', 'Pagato da', 'Diviso tra'];
  const rows = expenses.map((expense) => {
    const date = format(new Date(expense.date), 'dd/MM/yyyy');
    const description = `"${expense.description.replace(/"/g, '""')}"`;
    const category = expense.category;
    const amount = expense.amount.toFixed(2);
    const paidBy = expense.paidBy;
    const splitBetween = Object.keys(expense.splitBetween).join('; ');

    return [date, description, category, amount, paidBy, splitBetween].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `spese_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportExpensesToPDF = async (expenses: Expense[]): Promise<void> => {
  if (expenses.length === 0) {
    alert('Nessuna spesa da esportare');
    return;
  }

  // Simple PDF generation using browser print
  // For a more advanced solution, you could use jsPDF or pdfkit
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Impossibile aprire la finestra di stampa. Verifica i popup bloccati.');
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Spese - ${format(new Date(), 'dd/MM/yyyy')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            color: #FFB86C;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #FFB86C;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .total {
            font-weight: bold;
            margin-top: 20px;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>Riepilogo Spese</h1>
        <p>Data esportazione: ${format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrizione</th>
              <th>Categoria</th>
              <th>Importo</th>
              <th>Pagato da</th>
            </tr>
          </thead>
          <tbody>
            ${expenses
              .map(
                (exp) => `
              <tr>
                <td>${format(new Date(exp.date), 'dd/MM/yyyy')}</td>
                <td>${exp.description}</td>
                <td>${exp.category}</td>
                <td>€${exp.amount.toFixed(2)}</td>
                <td>${exp.paidBy}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <div class="total">
          <p>Totale: €${expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.print();
};

