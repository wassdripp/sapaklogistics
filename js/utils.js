// Trackk — Utility Functions & Helpers

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let iconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D96B4E" stroke-width="2.5">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  `;

  if (type === 'error') {
    iconSvg = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    `;
  }

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 200ms ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      fallbackCopy(text, successMsg);
    });
  } else {
    fallbackCopy(text, successMsg);
  }
}

function fallbackCopy(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-9999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('Failed to copy', 'error');
  }
  document.body.removeChild(textArea);
}

function generateTrackingId() {
  const prefix = 'SPK';
  const randNum = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${randNum}`;
}

function renderStatusBadge(status, isLarge = false) {
  let badgeClass = 'status-transit';
  const s = (status || '').toLowerCase();
  
  if (s.includes('deliver')) {
    badgeClass = 'status-delivered';
  } else if (s.includes('out')) {
    badgeClass = 'status-out';
  } else if (s.includes('pend') || s.includes('label')) {
    badgeClass = 'status-pending';
  } else if (s.includes('delay') || s.includes('hold') || s.includes('except')) {
    badgeClass = 'status-delayed';
  }

  const lgClass = isLarge ? ' status-lg' : '';
  return `<span class="status-badge ${badgeClass}${lgClass}">${status}</span>`;
}

function exportShipmentsToCSV(shipments) {
  if (!shipments || !shipments.length) {
    showToast("No shipments to export", "error");
    return;
  }

  const headers = ["Tracking ID", "Recipient", "Origin", "Destination", "Carrier", "Status", "Progress", "Est Delivery", "Dispatch Date", "Weight"];
  const rows = shipments.map(s => [
    `"${s.id}"`,
    `"${s.recipient.replace(/"/g, '""')}"`,
    `"${s.origin.replace(/"/g, '""')}"`,
    `"${s.destination.replace(/"/g, '""')}"`,
    `"${s.carrier}"`,
    `"${s.status}"`,
    `"${s.progress}%"`,
    `"${s.estDelivery || ''}"`,
    `"${s.dispatchDate || ''}"`,
    `"${s.weight || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `SAPAK_Logistics_Shipments_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("CSV export initiated!");
}
