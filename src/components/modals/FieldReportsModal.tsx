import React from 'react';
import {
  X,
  FileSpreadsheet,
  Clock,
  Camera,
  CheckCircle2,
  User,
} from 'lucide-react';
import type { FieldReport } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';

interface FieldReportsModalProps {
  reports: FieldReport[];
  isOpen: boolean;
  onClose: () => void;
}

export const FieldReportsModal: React.FC<FieldReportsModalProps> = ({
  reports,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-[#CBD5E1] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Ground Field Reports & Reconnaissance Logs
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Submitted by PWD, BRO, and SDRF field engineers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {reports.map((report) => {
            const riskInfo = getRiskColor(report.severity);

            return (
              <div
                key={report.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAFBFB] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                    >
                      {report.severity}
                    </span>
                    <h4 className="text-[13px] font-bold text-[#0F172A]">
                      {report.hazardType}
                    </h4>
                  </div>

                  <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.timeAgo}
                  </span>
                </div>

                <p className="text-[12px] text-[#334155] leading-relaxed bg-white p-3 rounded-lg border border-[#F1F5F9]">
                  "{report.notes}"
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 text-[#475569]">
                    <User className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>
                      <strong className="text-[#0F172A]">{report.observerName}</strong> ({report.designation})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {report.hasPhotos && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Camera className="w-3 h-3" />
                        {report.photoCount || 1} Geotagged Photos
                      </span>
                    )}
                    {report.verified && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1B4332] hover:bg-[#2D6A4F] text-white text-[12px] font-bold rounded-lg transition-colors"
          >
            Close Logs
          </button>
        </div>
      </div>
    </div>
  );
};
