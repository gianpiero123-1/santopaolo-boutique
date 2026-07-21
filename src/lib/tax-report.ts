// Generazione del file xlsx e della caption Telegram per il report tassa di
// soggiorno. Separato da tax.ts perché exceljs è pesante e serve solo
// all'endpoint /api/tax/report (la pagina /admin/tax non deve caricarlo).

import ExcelJS from 'exceljs';
import { dateOnly, formatDayMonth } from './dates';
import { TAX_PER_NIGHT, type TaxReport } from './tax';

/** Foglio Excel: una riga per prenotazione + riga totale in fondo. */
export async function buildTaxWorkbook(report: TaxReport): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Santopaolo Cockpit';
  const ws = wb.addWorksheet(report.month_label);

  ws.columns = [
    { header: 'Ospite', key: 'guest', width: 30 },
    { header: 'Appartamento', key: 'apartment', width: 18 },
    { header: 'Check-in', key: 'checkin', width: 14 },
    { header: 'Paganti', key: 'paying', width: 14 },
    { header: 'Notti', key: 'nights', width: 10 },
    { header: `Tassa (${TAX_PER_NIGHT}€ x paganti x notte)`, key: 'tax', width: 30 },
  ];

  const header = ws.getRow(1);
  header.font = { bold: true };

  for (const r of report.rows) {
    ws.addRow({
      guest: r.guest_name,
      apartment: r.apartment_label,
      checkin: formatDayMonth(dateOnly(r.checkin_date)),
      paying: r.registered ? r.paying : 'non registrati',
      nights: r.nights_in_month,
      tax: r.tax === null ? '' : r.tax,
    });
  }

  const totalRow = ws.addRow({
    guest: `Totale ${report.month_label}`,
    apartment: '',
    checkin: '',
    paying: report.total_paying_nights,
    nights: '',
    tax: report.total_tax,
  });
  totalRow.font = { bold: true };

  ws.getColumn('tax').numFmt = '#,##0.00 "€"';

  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

/** tassa_soggiorno_YYYY_MM.xlsx */
export function taxFilename(month: string): string {
  return `tassa_soggiorno_${month.replace('-', '_')}.xlsx`;
}

/**
 * Caption Telegram. Le prenotazioni senza ospiti registrati sono elencate
 * per nome così si vede subito cosa manca.
 */
export function buildTaxCaption(report: TaxReport): string {
  const total = Math.round(report.total_tax).toLocaleString('it-IT');
  let caption =
    `Tassa di soggiorno ${report.month_label}: ${total}€, ` +
    `${report.total_paying_nights} paganti`;

  if (report.unregistered.length > 0) {
    const names = report.unregistered.map((r) => r.guest_name).join(', ');
    caption += `\nda registrare: ${names}`;
  }
  return caption;
}
