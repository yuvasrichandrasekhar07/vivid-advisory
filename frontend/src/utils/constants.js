export const KARNATAKA_DISTRICTS = [
  'Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar',
  'Chamarajanagar','Chikkaballapura','Chikkamagaluru','Chitradurga','Dakshina Kannada',
  'Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar',
  'Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru',
  'Udupi','Uttara Kannada','Vijayapura','Yadgir'
];

export const LAND_USE_TYPES = [
  { value: 'industrial', label: 'Industrial' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'mixed', label: 'Mixed Use' },
];

export const ROLES = {
  aggregator: { label: 'Aggregator', color: '#1d4ed8', bg: '#dbeafe', icon: '🌾' },
  investor: { label: 'Investor', color: '#15803d', bg: '#dcfce7', icon: '💰' },
  developer: { label: 'Developer', color: '#7c3aed', bg: '#ede9fe', icon: '🏗️' },
  buyer: { label: 'Buyer / Tenant', color: '#be185d', bg: '#fce7f3', icon: '🏭' },
  consultant: { label: 'IPC Consultant', color: '#b45309', bg: '#fef3c7', icon: '🤝' },
};

export const formatCrore = (amount) => {
  if (!amount) return 'Price on Request';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const formatAcres = (acres) => {
  if (!acres) return '—';
  return `${parseFloat(acres).toFixed(2)} Acres`;
};

export const cdpStatusColor = (zone) => {
  if (!zone) return 'badge-info';
  const z = zone.toLowerCase();
  if (z.includes('green') || z.includes('residential')) return 'badge-success';
  if (z.includes('industrial') || z.includes('commercial')) return 'badge-navy';
  if (z.includes('orange')) return 'badge-warning';
  if (z.includes('red')) return 'badge-danger';
  return 'badge-info';
};
