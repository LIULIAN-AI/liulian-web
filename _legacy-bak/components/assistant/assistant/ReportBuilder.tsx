'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { X, FileText, Download, GripVertical, Check, Eye, Edit3, ChevronDown } from 'lucide-react';
import { useCanvasContext } from './hooks/useCanvasContext';
import { getMockBank, getAllMockBanks, type MockBankData } from './data/mockBanks';
import { getSelectedBankSortId } from './data/assistantDataService';
import styles from './assistant.module.css';

interface ReportBuilderProps {
  open: boolean;
  onClose: () => void;
  aiTitle?: string;
  aiAutoSelect?: boolean;
}

interface ReportSection {
  id: string;
  type: 'cover' | 'summary' | 'overview' | 'financials' | 'products' | 'comparison' | 'leadership' | 'ownership';
  title: string;
  enabled: boolean;
  notes: string;
}

const DEFAULT_SECTIONS: ReportSection[] = [
  { id: 'cover', type: 'cover', title: 'Cover Page', enabled: true, notes: '' },
  { id: 'summary', type: 'summary', title: 'Executive Summary', enabled: true, notes: '' },
  { id: 'overview', type: 'overview', title: 'Bank Overview', enabled: true, notes: '' },
  { id: 'financials', type: 'financials', title: 'Financial Analysis', enabled: true, notes: '' },
  { id: 'products', type: 'products', title: 'Product Portfolio', enabled: true, notes: '' },
  { id: 'comparison', type: 'comparison', title: 'Peer Comparison', enabled: true, notes: '' },
  { id: 'leadership', type: 'leadership', title: 'Leadership Team', enabled: true, notes: '' },
  { id: 'ownership', type: 'ownership', title: 'Ownership Structure', enabled: true, notes: '' },
];

function mapWidgetTypesToSections(widgetTypes: string[]): Set<string> {
  const mapped = new Set<string>(['cover', 'summary']);
  for (const wt of widgetTypes) {
    if (wt === 'bank-snapshot' || wt === 'fluent-about') mapped.add('overview');
    if (wt === 'bi-chart') mapped.add('financials');
    if (wt === 'product-list') mapped.add('products');
    if (wt === 'comparison-table') mapped.add('comparison');
    if (wt === 'leadership' || wt === 'management-list') mapped.add('leadership');
  }
  return mapped;
}

function generateSVGBarChart(data: { label: string; value: number }[], color: string, width: number, height: number): string {
  if (data.length === 0) return '';
  const maxVal = Math.max(...data.map(d => d.value));
  const barWidth = Math.floor((width - 60) / data.length) - 8;
  const chartH = height - 40;

  let bars = '';
  data.forEach((d, i) => {
    const barH = maxVal > 0 ? (d.value / maxVal) * (chartH - 20) : 0;
    const x = 50 + i * (barWidth + 8);
    const y = chartH - barH;
    bars += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barH}" fill="${color}" rx="3" opacity="0.85"/>`;
    bars += `<text x="${x + barWidth / 2}" y="${y - 5}" text-anchor="middle" font-size="10" fill="#475569">${d.value.toFixed(1)}M</text>`;
    bars += `<text x="${x + barWidth / 2}" y="${chartH + 14}" text-anchor="middle" font-size="9" fill="#94a3b8">${d.label}</text>`;
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <line x1="48" y1="0" x2="48" y2="${chartH}" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="48" y1="${chartH}" x2="${width}" y2="${chartH}" stroke="#e2e8f0" stroke-width="1"/>
    ${bars}
  </svg>`;
}

function generateSVGLineChart(data: { label: string; value: number }[], color: string, width: number, height: number): string {
  if (data.length < 2) return '';
  const maxVal = Math.max(...data.map(d => d.value));
  const minVal = Math.min(...data.map(d => d.value));
  const range = maxVal - minVal || 1;
  const chartH = height - 40;
  const chartW = width - 60;

  const points = data.map((d, i) => {
    const x = 50 + (i / (data.length - 1)) * chartW;
    const y = chartH - ((d.value - minVal) / range) * (chartH - 20);
    return { x, y, label: d.label, value: d.value };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  let labels = '';
  points.forEach(p => {
    labels += `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${color}"/>`;
    labels += `<text x="${p.x}" y="${p.y - 10}" text-anchor="middle" font-size="10" fill="#475569">${p.value.toFixed(1)}%</text>`;
  });
  let xLabels = '';
  points.forEach(p => {
    xLabels += `<text x="${p.x}" y="${chartH + 14}" text-anchor="middle" font-size="9" fill="#94a3b8">${p.label}</text>`;
  });

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <line x1="48" y1="0" x2="48" y2="${chartH}" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="48" y1="${chartH}" x2="${width}" y2="${chartH}" stroke="#e2e8f0" stroke-width="1"/>
    <path d="${pathD}" fill="none" stroke="${color}" stroke-width="2"/>
    ${labels}
    ${xLabels}
  </svg>`;
}

function parseNumeric(str: string): number {
  const cleaned = str.replace(/[^0-9.\-]/g, '');
  return parseFloat(cleaned) || 0;
}

function generateReportHTML(
  reportTitle: string,
  sections: ReportSection[],
  bank: MockBankData,
  allBanks: MockBankData[],
): string {
  const enabled = sections.filter(s => s.enabled);
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const revenueData = bank.quarterlyResults.map(q => ({
    label: q.period.replace('20', "'"),
    value: parseNumeric(q.revenue),
  }));

  const roeData = bank.quarterlyResults.map(q => ({
    label: q.period.replace('20', "'"),
    value: parseNumeric(q.roe),
  }));

  const revenueChart = generateSVGBarChart(revenueData, '#3b82f6', 460, 180);
  const roeChart = generateSVGLineChart(roeData, '#10b981', 460, 160);

  const sectionHTML: Record<string, string> = {};

  sectionHTML['cover'] = `
    <div class="cover-page">
      <div class="cover-banner">
        <div class="cover-logo">NB</div>
        <div class="cover-title">${reportTitle}</div>
        <div class="cover-subtitle">${bank.header.companyName}</div>
      </div>
      <div class="cover-meta">
        <div class="cover-meta-row"><span class="cover-meta-label">Prepared by</span><span>LIULIAN Analytics Platform</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Date</span><span>${date}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Region</span><span>${bank.about.location}</span></div>
        <div class="cover-meta-row"><span class="cover-meta-label">Classification</span><span>Confidential — Internal Use Only</span></div>
      </div>
      <div class="cover-toc">
        <div class="toc-title">Table of Contents</div>
        ${enabled.filter(s => s.type !== 'cover').map((s, i) => `<div class="toc-item"><span class="toc-num">${i + 1}.</span> ${s.title}</div>`).join('')}
      </div>
    </div>`;

  const summaryNotes = enabled.find(s => s.type === 'summary')?.notes || '';
  sectionHTML['summary'] = `
    <div class="report-section">
      <h2>§N§. Executive Summary</h2>
      <p>${bank.header.companyName} is a ${bank.header.tag?.join(', ') || 'digital'} institution headquartered in ${bank.about.location}, established in ${bank.about.establishedTime}. Under the leadership of CEO ${bank.about.ceo}, the bank has grown to serve ${bank.about.numberOfUser} users with a workforce of ${bank.about.companySize} employees.</p>
      <p>For the fiscal year 2025, ${bank.header.companyName} reported total revenue of ${bank.about.revenue}, with total assets reaching ${bank.financials.assets}. The bank's Return on Equity (ROE) stands at ${bank.financials.roe}, with a cost-to-income ratio of ${bank.financials.costToIncome}. The non-performing loan (NPL) ratio is ${bank.financials.nplRatio}, ${parseNumeric(bank.financials.nplRatio) <= 1.0 ? 'indicating strong asset quality management' : parseNumeric(bank.financials.nplRatio) <= 2.0 ? 'which is within acceptable industry ranges' : 'which warrants closer monitoring against industry benchmarks'}.</p>
      <div class="highlight-box">
        <div class="highlight-title">Key Highlights</div>
        <ul>
          <li>Revenue of ${bank.about.revenue} with ${bank.quarterlyResults.length > 1 ? 'quarterly growth trend' : 'stable performance'}</li>
          <li>Asset base of ${bank.financials.assets} with deposit-to-loan ratio of ${(parseNumeric(bank.financials.deposits) / parseNumeric(bank.financials.loans) * 100).toFixed(0)}%</li>
          <li>${bank.products.length} active products across ${new Set(bank.products.map(p => p.customerSegment)).size} customer segments</li>
          <li>Management team of ${bank.management.length} C-suite executives</li>
        </ul>
      </div>
      ${summaryNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${summaryNotes}</p></div>` : ''}
    </div>`;

  const overviewNotes = enabled.find(s => s.type === 'overview')?.notes || '';
  sectionHTML['overview'] = `
    <div class="report-section">
      <h2>§N§. Bank Overview</h2>
      <table class="data-table">
        <thead><tr><th>Attribute</th><th>Detail</th></tr></thead>
        <tbody>
          <tr><td>Company Name</td><td><strong>${bank.header.companyName}</strong></td></tr>
          <tr><td>Status</td><td><span class="status-badge status-${bank.header.status?.toLowerCase()}">${bank.header.status}</span></td></tr>
          <tr><td>Location</td><td>${bank.about.location}</td></tr>
          <tr><td>Founded</td><td>${bank.about.establishedTime}</td></tr>
          <tr><td>CEO</td><td>${bank.about.ceo}</td></tr>
          <tr><td>Founder</td><td>${bank.about.founder}</td></tr>
          <tr><td>Employees</td><td>${bank.about.companySize}</td></tr>
          <tr><td>Users</td><td>${bank.about.numberOfUser}</td></tr>
          <tr><td>SWIFT Code</td><td><code>${bank.about.bankSwift}</code></td></tr>
          <tr><td>Bank Code</td><td>${bank.about.bankCode}</td></tr>
          <tr><td>Website</td><td>${bank.header.website || 'N/A'}</td></tr>
          <tr><td>Tags</td><td>${(bank.header.tag || []).map(t => `<span class="tag">${t}</span>`).join(' ')}</td></tr>
        </tbody>
      </table>
      ${overviewNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${overviewNotes}</p></div>` : ''}
    </div>`;

  const financialsNotes = enabled.find(s => s.type === 'financials')?.notes || '';
  sectionHTML['financials'] = `
    <div class="report-section">
      <h2>§N§. Financial Analysis</h2>
      <h3>§N§.1 Key Metrics</h3>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Assets</div>
          <div class="metric-value">${bank.financials.assets}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Deposits</div>
          <div class="metric-value">${bank.financials.deposits}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Loans</div>
          <div class="metric-value">${bank.financials.loans}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Leverage</div>
          <div class="metric-value">${bank.financials.leverage}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Net Interest Spread</div>
          <div class="metric-value">${bank.financials.netInterestSpread}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">ROE</div>
          <div class="metric-value accent">${bank.financials.roe}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Cost-to-Income</div>
          <div class="metric-value">${bank.financials.costToIncome}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">NPL Ratio</div>
          <div class="metric-value ${parseNumeric(bank.financials.nplRatio) > 2 ? 'warn' : ''}">${bank.financials.nplRatio}</div>
        </div>
      </div>

      <h3>§N§.2 Quarterly Revenue</h3>
      <div class="chart-container">
        ${revenueChart}
        <div class="chart-caption">Quarterly Revenue (HKD/SGD Millions) — FY2025</div>
      </div>

      <h3>§N§.3 ROE Trend</h3>
      <div class="chart-container">
        ${roeChart}
        <div class="chart-caption">Return on Equity (%) — FY2025</div>
      </div>

      <h3>§N§.4 Quarterly Results Detail</h3>
      <table class="data-table">
        <thead>
          <tr><th>Period</th><th>Revenue</th><th>OpEx</th><th>Net Income</th><th>ROE</th></tr>
        </thead>
        <tbody>
          ${bank.quarterlyResults.map(q => `
            <tr>
              <td>${q.period}</td>
              <td>${q.revenue}</td>
              <td>${q.opex}</td>
              <td>${q.netIncome}</td>
              <td>${q.roe}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      ${financialsNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${financialsNotes}</p></div>` : ''}
    </div>`;

  const productsNotes = enabled.find(s => s.type === 'products')?.notes || '';
  const retailProducts = bank.products.filter(p => p.customerSegment === 'retail');
  const corpProducts = bank.products.filter(p => p.customerSegment === 'corporate');
  sectionHTML['products'] = `
    <div class="report-section">
      <h2>§N§. Product Portfolio</h2>
      <p>${bank.header.companyName} offers ${bank.products.length} products across ${retailProducts.length > 0 && corpProducts.length > 0 ? 'both retail and corporate' : retailProducts.length > 0 ? 'retail' : 'corporate'} segments.</p>

      ${retailProducts.length > 0 ? `
      <h3>§N§.1 Retail Products (${retailProducts.length})</h3>
      <table class="data-table">
        <thead><tr><th>Product</th><th>Type</th><th>Description</th><th>Tag</th></tr></thead>
        <tbody>
          ${retailProducts.map(p => `<tr><td><strong>${p.productName}</strong></td><td><span class="tag">${p.productType}</span></td><td>${p.productDescription}</td><td>${p.clientTag}</td></tr>`).join('')}
        </tbody>
      </table>` : ''}

      ${corpProducts.length > 0 ? `
      <h3>§N§.${retailProducts.length > 0 ? '2' : '1'} Corporate Products (${corpProducts.length})</h3>
      <table class="data-table">
        <thead><tr><th>Product</th><th>Type</th><th>Description</th><th>Tag</th></tr></thead>
        <tbody>
          ${corpProducts.map(p => `<tr><td><strong>${p.productName}</strong></td><td><span class="tag">${p.productType}</span></td><td>${p.productDescription}</td><td>${p.clientTag}</td></tr>`).join('')}
        </tbody>
      </table>` : ''}
      ${productsNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${productsNotes}</p></div>` : ''}
    </div>`;

  const comparisonNotes = enabled.find(s => s.type === 'comparison')?.notes || '';
  sectionHTML['comparison'] = `
    <div class="report-section">
      <h2>§N§. Peer Comparison</h2>
      <p>Comparative analysis across ${allBanks.length} peer digital banks in the region.</p>
      <table class="data-table comparison-table">
        <thead>
          <tr>
            <th>Metric</th>
            ${allBanks.map(b => `<th>${b.header.companyName.split(' ').slice(0, 2).join(' ')}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr><td>Location</td>${allBanks.map(b => `<td>${b.about.location}</td>`).join('')}</tr>
          <tr><td>Status</td>${allBanks.map(b => `<td><span class="status-badge status-${b.header.status?.toLowerCase()}">${b.header.status}</span></td>`).join('')}</tr>
          <tr><td>Founded</td>${allBanks.map(b => `<td>${b.about.establishedTime}</td>`).join('')}</tr>
          <tr><td>Revenue</td>${allBanks.map(b => `<td>${b.about.revenue}</td>`).join('')}</tr>
          <tr><td>Total Assets</td>${allBanks.map(b => `<td>${b.financials.assets}</td>`).join('')}</tr>
          <tr><td>Deposits</td>${allBanks.map(b => `<td>${b.financials.deposits}</td>`).join('')}</tr>
          <tr><td>Loans</td>${allBanks.map(b => `<td>${b.financials.loans}</td>`).join('')}</tr>
          <tr><td>Users</td>${allBanks.map(b => `<td>${b.about.numberOfUser}</td>`).join('')}</tr>
          <tr><td>Employees</td>${allBanks.map(b => `<td>${b.about.companySize}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>ROE</td>${allBanks.map(b => `<td class="${b.sortId === bank.sortId ? 'highlight-cell' : ''}">${b.financials.roe}</td>`).join('')}</tr>
          <tr><td>Cost/Income</td>${allBanks.map(b => `<td>${b.financials.costToIncome}</td>`).join('')}</tr>
          <tr class="highlight-row"><td>NPL Ratio</td>${allBanks.map(b => `<td class="${parseNumeric(b.financials.nplRatio) > 2 ? 'warn-cell' : ''}">${b.financials.nplRatio}</td>`).join('')}</tr>
          <tr><td>Leverage</td>${allBanks.map(b => `<td>${b.financials.leverage}</td>`).join('')}</tr>
          <tr><td>NIS</td>${allBanks.map(b => `<td>${b.financials.netInterestSpread}</td>`).join('')}</tr>
          <tr><td>Products</td>${allBanks.map(b => `<td>${b.products.length}</td>`).join('')}</tr>
        </tbody>
      </table>
      ${comparisonNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${comparisonNotes}</p></div>` : ''}
    </div>`;

  const leadershipNotes = enabled.find(s => s.type === 'leadership')?.notes || '';
  sectionHTML['leadership'] = `
    <div class="report-section">
      <h2>§N§. Leadership Team</h2>
      <div class="leader-grid">
        ${bank.management.map(m => `
          <div class="leader-card">
            <div class="leader-avatar">${m.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="leader-info">
              <div class="leader-name">${m.name}</div>
              <div class="leader-title">${m.title}</div>
              <div class="leader-bg">${m.background}</div>
              <div class="leader-tenure">Joined: ${m.joinedAt}</div>
            </div>
          </div>`).join('')}
      </div>
      ${leadershipNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${leadershipNotes}</p></div>` : ''}
    </div>`;

  const ownershipNotes = enabled.find(s => s.type === 'ownership')?.notes || '';
  const totalOwnership = bank.owners.reduce((sum, o) => sum + o.percent, 0);
  sectionHTML['ownership'] = `
    <div class="report-section">
      <h2>§N§. Ownership Structure</h2>
      <table class="data-table">
        <thead><tr><th>Shareholder</th><th>Ownership %</th><th>Visualization</th></tr></thead>
        <tbody>
          ${bank.owners.map(o => `
            <tr>
              <td><strong>${o.name}</strong></td>
              <td>${o.percent.toFixed(1)}%</td>
              <td><div class="bar-cell"><div class="bar-fill" style="width:${o.percent}%"></div></div></td>
            </tr>`).join('')}
          ${totalOwnership < 100 ? `
            <tr>
              <td>Other / Public</td>
              <td>${(100 - totalOwnership).toFixed(1)}%</td>
              <td><div class="bar-cell"><div class="bar-fill other" style="width:${100 - totalOwnership}%"></div></div></td>
            </tr>` : ''}
        </tbody>
      </table>

      ${bank.campaigns.length > 0 ? `
      <h3>§N§.1 Recent Campaigns</h3>
      <table class="data-table">
        <thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Reach</th></tr></thead>
        <tbody>
          ${bank.campaigns.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.channel}</td>
              <td><span class="status-badge status-${c.status.toLowerCase()}">${c.status}</span></td>
              <td>${c.reach}</td>
            </tr>`).join('')}
        </tbody>
      </table>` : ''}
      ${ownershipNotes ? `<div class="analyst-note"><div class="analyst-note-label">Analyst Note</div><p>${ownershipNotes}</p></div>` : ''}
    </div>`;

  let sNum = 0;
  const body = enabled.map(s => {
    const html = sectionHTML[s.type] || '';
    if (s.type === 'cover') return html;
    sNum++;
    return html.replace(/§N§/g, String(sNum));
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${reportTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; background: #fff; line-height: 1.6; }

  .cover-page { padding: 60px 48px; page-break-after: always; }
  .cover-banner { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; padding: 48px; border-radius: 12px; margin-bottom: 40px; }
  .cover-logo { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: #f87171; margin-bottom: 24px; }
  .cover-title { font-size: 32px; font-weight: 700; margin-bottom: 8px; }
  .cover-subtitle { font-size: 18px; color: #94a3b8; }
  .cover-meta { margin-bottom: 40px; }
  .cover-meta-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
  .cover-meta-label { width: 160px; color: #64748b; font-weight: 500; }
  .cover-toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; }
  .toc-title { font-size: 16px; font-weight: 600; margin-bottom: 12px; color: #1e293b; }
  .toc-item { padding: 4px 0; font-size: 14px; color: #475569; }
  .toc-num { color: #3b82f6; font-weight: 600; margin-right: 8px; }

  .report-section { padding: 32px 48px; page-break-inside: avoid; }
  .report-section h2 { font-size: 22px; font-weight: 700; color: #1e293b; padding-bottom: 10px; border-bottom: 2px solid #dc2626; margin-bottom: 20px; }
  .report-section h3 { font-size: 16px; font-weight: 600; color: #334155; margin: 24px 0 12px; }
  .report-section p { font-size: 14px; color: #475569; margin-bottom: 16px; }

  .data-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px; }
  .data-table th { background: #f1f5f9; color: #334155; font-weight: 600; text-align: left; padding: 10px 12px; border: 1px solid #e2e8f0; }
  .data-table td { padding: 8px 12px; border: 1px solid #e2e8f0; vertical-align: top; }
  .data-table tbody tr:hover { background: #f8fafc; }
  .comparison-table th { font-size: 11px; text-align: center; }
  .comparison-table td { text-align: center; font-size: 12px; }
  .comparison-table td:first-child { text-align: left; font-weight: 500; }
  .highlight-row { background: #fffbeb; }
  .highlight-cell { background: #dbeafe; font-weight: 600; }
  .warn-cell { color: #dc2626; font-weight: 600; }

  .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
  .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .metric-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .metric-value { font-size: 20px; font-weight: 700; color: #1e293b; }
  .metric-value.accent { color: #059669; }
  .metric-value.warn { color: #dc2626; }

  .chart-container { background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center; }
  .chart-caption { font-size: 11px; color: #94a3b8; margin-top: 8px; }

  .tag { display: inline-block; background: #eff6ff; color: #3b82f6; font-size: 11px; padding: 2px 8px; border-radius: 4px; margin: 0 2px; }
  .status-badge { display: inline-block; font-size: 11px; padding: 2px 10px; border-radius: 10px; font-weight: 500; }
  .status-live { background: #dcfce7; color: #16a34a; }
  .status-active { background: #dbeafe; color: #2563eb; }
  .status-completed { background: #f1f5f9; color: #64748b; }
  code { background: #f1f5f9; padding: 1px 6px; border-radius: 3px; font-size: 12px; }

  .leader-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
  .leader-card { display: flex; gap: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
  .leader-avatar { width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .leader-info { flex: 1; }
  .leader-name { font-size: 14px; font-weight: 600; color: #1e293b; }
  .leader-title { font-size: 12px; color: #3b82f6; margin-bottom: 6px; }
  .leader-bg { font-size: 12px; color: #64748b; line-height: 1.5; }
  .leader-tenure { font-size: 11px; color: #94a3b8; margin-top: 4px; }

  .bar-cell { width: 100%; height: 18px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #6366f1); border-radius: 4px; }
  .bar-fill.other { background: #cbd5e1; }

  .highlight-box { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 20px; }
  .highlight-title { font-size: 13px; font-weight: 600; color: #1e40af; margin-bottom: 8px; }
  .highlight-box ul { padding-left: 18px; }
  .highlight-box li { font-size: 13px; color: #334155; margin-bottom: 4px; }

  .analyst-note { background: #fefce8; border-left: 3px solid #eab308; padding: 12px 16px; border-radius: 0 6px 6px 0; margin-top: 16px; }
  .analyst-note-label { font-size: 11px; font-weight: 600; color: #a16207; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .analyst-note p { font-size: 13px; color: #78350f; margin: 0; }

  .report-footer { text-align: center; padding: 32px 48px; color: #94a3b8; font-size: 11px; border-top: 1px solid #e2e8f0; margin-top: 40px; }

  @media print {
    body { font-size: 12px; }
    .cover-page { page-break-after: always; }
    .report-section { page-break-inside: avoid; }
    .data-table { page-break-inside: auto; }
    .data-table tr { page-break-inside: avoid; }
    .metrics-grid { grid-template-columns: repeat(4, 1fr); }
    .leader-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
</head>
<body>
${body}
<div class="report-footer">
  Generated by LIULIAN Analytics Platform &mdash; ${date}<br/>
  This report is for internal use only. Data sourced from regulatory filings and bank disclosures.
</div>
</body>
</html>`;
}

export default function ReportBuilder({ open, onClose, aiTitle, aiAutoSelect }: ReportBuilderProps) {
  const { state, showToast } = useCanvasContext();
  const [sections, setSections] = useState<ReportSection[]>(() => [...DEFAULT_SECTIONS]);
  const [reportTitle, setReportTitle] = useState('Bank Analysis Report');
  const [exportFormat, setExportFormat] = useState<'html' | 'pdf'>('html');
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  const bankSortId = useMemo(() => {
    const widgetBankId = state.activeWidgets.find(w => w.props?.bankSortId)?.props?.bankSortId;
    return widgetBankId || getSelectedBankSortId();
  }, [state.activeWidgets]);

  const bankData = useMemo(() => getMockBank(bankSortId), [bankSortId]);
  const allBanks = useMemo(() => getAllMockBanks(), []);

  useEffect(() => {
    if (open && aiTitle) {
      setReportTitle(aiTitle);
    }
  }, [open, aiTitle]);

  useEffect(() => {
    if (open && aiAutoSelect) {
      const widgetTypes = state.activeWidgets.map(w => w.type);
      const mapped = mapWidgetTypesToSections(widgetTypes);
      setSections(prev => prev.map(s => ({ ...s, enabled: mapped.has(s.type) || s.type === 'cover' || s.type === 'summary' })));
    }
  }, [open, aiAutoSelect, state.activeWidgets]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.title) setReportTitle(detail.title);
      if (detail?.format) setExportFormat(detail.format);
      if (detail?.exportNow) handleExport();
    };
    window.addEventListener('reportBuilderCommand', handler);
    return () => window.removeEventListener('reportBuilderCommand', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const reportHTML = useMemo(() => {
    if (!bankData) return '';
    return generateReportHTML(reportTitle, sections, bankData, allBanks);
  }, [reportTitle, sections, bankData, allBanks]);

  useEffect(() => {
    if (!previewRef.current || !open || !showPreview) return;
    const doc = previewRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(reportHTML);
      doc.close();
    }
  }, [reportHTML, open, showPreview]);

  const toggleSection = useCallback((id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  }, []);

  const updateSectionTitle = useCallback((id: string, title: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, title } : s));
  }, []);

  const updateSectionNotes = useCallback((id: string, notes: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, notes } : s));
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(index);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
  }, []);

  const handleExport = useCallback(() => {
    if (!bankData) return;
    const enabledCount = sections.filter(s => s.enabled).length;
    if (enabledCount === 0) return;

    const html = reportHTML;
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${reportTitle.replace(/\s+/g, '-').toLowerCase()}-${timestamp}`;

    if (exportFormat === 'pdf') {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        setTimeout(() => win.print(), 500);
      }
    } else {
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast(`Report exported as ${exportFormat.toUpperCase()}`);
    onClose();
  }, [bankData, sections, reportHTML, reportTitle, exportFormat, showToast, onClose]);

  if (!open) return null;

  const enabledCount = sections.filter(s => s.enabled).length;
  const allSelected = enabledCount === sections.length;

  return (
    <div className={styles.reportBuilderOverlay} onClick={onClose}>
      <div className={`${styles.reportBuilderPanel} ${showPreview ? styles.reportBuilderPanelWide : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.reportBuilderHeader}>
          <FileText size={16} />
          <span className={styles.reportBuilderTitle}>Report Builder</span>
          <span className={styles.reportBankLabel}>{bankData?.header.companyName || 'No bank selected'}</span>
          <button
            className={`${styles.reportPreviewToggle} ${showPreview ? styles.reportPreviewToggleActive : ''}`}
            onClick={() => setShowPreview(!showPreview)}
            title="Toggle preview"
          >
            <Eye size={14} />
          </button>
          <button className={styles.reportBuilderClose} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className={styles.reportBuilderSplit}>
          <div className={styles.reportBuilderBody}>
            <div className={styles.configSection}>
              <div className={styles.configSectionTitle}>Report Title</div>
              <input
                className={styles.configInput}
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title..."
              />
            </div>

            <div className={styles.configSection}>
              <div className={styles.configSectionTitle}>
                Sections
                <button className={styles.reportSelectAll} onClick={() => {
                  setSections(prev => prev.map(s => ({ ...s, enabled: !allSelected })));
                }}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className={styles.reportWidgetList}>
                {sections.map((s, i) => (
                  <div
                    key={s.id}
                    draggable
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    className={`${styles.reportSectionItem} ${s.enabled ? styles.reportSectionItemSelected : ''} ${dragIndex === i ? styles.reportSectionItemDragging : ''}`}
                  >
                    <div className={styles.reportSectionRow}>
                      <GripVertical size={12} className={styles.reportDragHandle} />
                      <button
                        className={styles.reportSectionCheck}
                        onClick={() => toggleSection(s.id)}
                      >
                        {s.enabled && <Check size={12} />}
                      </button>
                      <input
                        className={styles.reportSectionTitleInput}
                        value={s.title}
                        onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                      />
                      <button
                        className={`${styles.reportNoteBtn} ${s.notes ? styles.reportNoteBtnHasNote : ''}`}
                        onClick={() => setEditingNotes(editingNotes === s.id ? null : s.id)}
                        title="Add analyst note"
                      >
                        <Edit3 size={11} />
                      </button>
                    </div>
                    {editingNotes === s.id && (
                      <textarea
                        className={styles.reportNoteInput}
                        placeholder="Add analyst note for this section..."
                        value={s.notes}
                        onChange={(e) => updateSectionNotes(s.id, e.target.value)}
                        rows={3}
                        autoFocus
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.configSection}>
              <div className={styles.configSectionTitle}>Export Format</div>
              <div className={styles.configChipGroup}>
                <button
                  className={`${styles.configChip} ${exportFormat === 'html' ? styles.configChipActive : ''}`}
                  onClick={() => setExportFormat('html')}
                >
                  HTML
                </button>
                <button
                  className={`${styles.configChip} ${exportFormat === 'pdf' ? styles.configChipActive : ''}`}
                  onClick={() => setExportFormat('pdf')}
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {showPreview && (
            <div className={styles.reportPreviewPanel}>
              <div className={styles.reportPreviewHeader}>
                <Eye size={12} />
                <span>Live Preview</span>
              </div>
              <iframe
                ref={previewRef}
                className={styles.reportPreviewFrame}
                title="Report Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>

        <div className={styles.reportBuilderFooter}>
          <span className={styles.reportFooterInfo}>
            {enabledCount} of {sections.length} sections
          </span>
          <button className={styles.reportCancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.reportExportBtn}
            onClick={handleExport}
            disabled={enabledCount === 0 || !bankData}
          >
            <Download size={14} />
            Export {exportFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}
