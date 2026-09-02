import type { RiskLevel } from '../types/dashboard';

export function getRiskColor(level: RiskLevel): {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  fillColor: string;
  strokeColor: string;
  accentColor: string;
  label: string;
} {
  switch (level) {
    case 'SAFE':
      return {
        badgeBg: 'bg-[#DCFCE7]',
        badgeText: 'text-[#166534]',
        badgeBorder: 'border-[#86EFAC]',
        fillColor: '#22C55E',
        strokeColor: '#16A34A',
        accentColor: '#166534',
        label: 'SAFE',
      };
    case 'WATCH':
      return {
        badgeBg: 'bg-[#FEF3C7]',
        badgeText: 'text-[#B45309]',
        badgeBorder: 'border-[#FDE68A]',
        fillColor: '#F59E0B',
        strokeColor: '#D97706',
        accentColor: '#B45309',
        label: 'WATCH',
      };
    case 'HIGH':
      return {
        badgeBg: 'bg-[#FFEDD5]',
        badgeText: 'text-[#C2410C]',
        badgeBorder: 'border-[#FDBA74]',
        fillColor: '#F97316',
        strokeColor: '#EA580C',
        accentColor: '#C2410C',
        label: 'HIGH',
      };
    case 'CRITICAL':
      return {
        badgeBg: 'bg-[#FEE2E2]',
        badgeText: 'text-[#B91C1C]',
        badgeBorder: 'border-[#FCA5A5]',
        fillColor: '#EF4444',
        strokeColor: '#DC2626',
        accentColor: '#B91C1C',
        label: 'CRITICAL',
      };
  }
}

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return 'CRITICAL';
  if (score >= 70) return 'HIGH';
  if (score >= 50) return 'WATCH';
  return 'SAFE';
}
