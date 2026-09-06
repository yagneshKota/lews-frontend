import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Clock,
  Camera,
  CheckCircle2,
  User,
  ExternalLink,
  MapPin,
  Maximize2,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import type { FieldReport } from '../../types/dashboard';
import { getRiskColor } from '../../utils/riskUtils';
import { apiService } from '../../services/api';

interface FieldReportsModalProps {
  reports: FieldReport[];
  isOpen: boolean;
  onClose: () => void;
  onReportDeleted?: () => void;
}

export const FieldReportsModal: React.FC<FieldReportsModalProps> = ({
  reports,
  isOpen,
  onClose,
  onReportDeleted,
}) => {
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);
  const [confirmDeleteReport, setConfirmDeleteReport] = useState<FieldReport | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localReports, setLocalReports] = useState<FieldReport[]>(reports);

  React.useEffect(() => {
    setLocalReports(reports);
  }, [reports]);

  if (!isOpen) return null;

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteReport) return;
    setIsDeleting(true);
    try {
      const success = await apiService.deleteReport(confirmDeleteReport.id);
      if (success) {
        setLocalReports((prev) => prev.filter((r) => r.id !== confirmDeleteReport.id));
        if (onReportDeleted) {
          onReportDeleted();
        }
      }
    } catch {
      // Handle error
    } finally {
      setIsDeleting(false);
      setConfirmDeleteReport(null);
    }
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#0b1f16] text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-emerald-800/60 shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-emerald-900/60 flex items-center justify-between bg-slate-50 dark:bg-[#071711]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ground Field Reports & Reconnaissance Logs
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Live reports submitted by citizens, community volunteers, PWD, and BRO engineers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-emerald-900/60 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Body */}
          <div className="p-6 overflow-y-auto space-y-4">
            {localReports.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                No ground field reports logged yet for this location.
              </div>
            ) : (
              localReports.map((report) => {
                const riskInfo = getRiskColor(report.severity);

                return (
                  <div
                    key={report.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/80 bg-slate-50/70 dark:bg-[#071711] space-y-3 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${riskInfo.badgeBg} ${riskInfo.badgeText} ${riskInfo.badgeBorder}`}
                        >
                          {report.severity}
                        </span>
                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-white">
                          {report.hazardType}
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {report.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          {report.timeAgo}
                        </span>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteReport(report)}
                          title="Delete Incident Report"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#0b2118] p-3 rounded-lg border border-slate-200/80 dark:border-emerald-900/50">
                      "{report.notes}"
                    </p>

                    {/* Photo Attachment Section */}
                    {report.imageUrl && (
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Geotagged Photo Evidence</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedImageModal(report.imageUrl!)}
                            className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Inspect Fullscreen</span>
                          </button>
                        </div>
                        <div
                          onClick={() => setSelectedImageModal(report.imageUrl!)}
                          className="relative group cursor-pointer w-full max-w-xs h-36 rounded-xl overflow-hidden border border-slate-300 dark:border-emerald-700 shadow-sm"
                        >
                          <img
                            src={report.imageUrl}
                            alt="Geotagged field hazard"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1.5">
                            <ExternalLink className="w-4 h-4" />
                            <span>Click to Zoom</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200 dark:border-emerald-900/40">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          <strong className="text-slate-900 dark:text-white">{report.observerName}</strong> ({report.designation})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {report.hasPhotos && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                            <Camera className="w-3 h-3" />
                            {report.photoCount || 1} Geotagged Photo
                          </span>
                        )}
                        {report.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Verified by ML
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-emerald-900/60 bg-slate-50 dark:bg-[#071711] flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-[12px] font-bold rounded-lg transition-colors shadow-xs"
            >
              Close Logs
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Safe Dialog */}
      {confirmDeleteReport && (
        <div
          onClick={() => setConfirmDeleteReport(null)}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-[#0c2219] text-slate-900 dark:text-white rounded-2xl border border-red-500/40 shadow-2xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Delete this incident report?</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This action will permanently delete report "{confirmDeleteReport.hazardType}" from the database.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteReport(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-emerald-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox photo modal */}
      {selectedImageModal && (
        <div
          onClick={() => setSelectedImageModal(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden border border-white/20 shadow-2xl flex flex-col items-center"
          >
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedImageModal}
              alt="Full inspection view"
              className="w-auto h-auto max-h-[85vh] max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
