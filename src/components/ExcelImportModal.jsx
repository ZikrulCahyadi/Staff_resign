import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Check, FileSpreadsheet, ChevronRight, AlertCircle, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createEmployeesBatch } from '../services/resignationService';

const DB_COLUMNS = [
  { key: 'employee_id', label: 'NIK (Employee ID)', required: true },
  { key: 'nama', label: 'Nama', required: true },
  { key: 'join_date', label: 'Tanggal Bergabung', required: false, type: 'date' },
  { key: 'resign_date', label: 'Tanggal Resign', required: false, type: 'date' },
  { key: 'jabatan', label: 'Jabatan', required: false },
  { key: 'kebun', label: 'Kebun', required: false },
  { key: 'deskripsi_resign', label: 'Deskripsi Resign', required: false },
  { key: 'jenis_resign', label: 'Jenis Resign', required: false },
  { key: 'cluster_resign', label: 'Cluster Resign', required: false },
  { key: 'alumni', label: 'Status Alumni', required: false },
  { key: 'keterangan', label: 'Keterangan', required: false },
  { key: 'region', label: 'Region', required: false },
];

export default function ExcelImportModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFile(null);
      setExcelHeaders([]);
      setPreviewData([]);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (file) => {
    setError('');
    setFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to array of arrays
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        if (rows.length < 2) {
          throw new Error('File Excel kosong atau tidak memiliki data.');
        }

        // Remove header row
        const dataRows = rows.slice(1);
        
        // Map data directly by column index
        const mappedData = dataRows.map(row => {
          const newRow = {};
          DB_COLUMNS.forEach((col, index) => {
            let val = row[index];
            
            // Ensure values are strings for string fields, except for dates
            if (col.type === 'date') {
              val = parseExcelDate(val);
            } else if (val !== null && val !== undefined) {
              val = val.toString().trim();
            } else {
              val = '';
            }
            
            // Handle specific standard formats
            if (col.key === 'jenis_resign' && val) {
              if (val.toLowerCase().includes('vol') || val === 'VT') val = 'VT';
              else if (val.toLowerCase().includes('invol') || val === 'IT') val = 'IT';
            }
            
            if (col.key === 'alumni' && val) {
               if (val.toUpperCase() === 'ALUMNI') val = 'ALUMNI';
               else if (val.toUpperCase().includes('non')) val = 'NON ALUMNI';
            }

            newRow[col.key] = val;
          });
          return newRow;
        });

        // Filter out rows where employee_id is not a number (e.g., headers or invalid data)
        const validMappedData = mappedData.filter(row => {
          if (!row.employee_id) return false;
          // Check if it's a number (allowing digits only)
          return /^\d+$/.test(row.employee_id.toString().trim());
        });

        if (validMappedData.length === 0) {
          setError('Tidak ada data valid yang ditemukan (NIK harus berupa angka).');
          setFile(null);
          return;
        }

        setPreviewData(validMappedData);
        setStep(2);
      } catch (err) {
        console.error(err);
        setError('Gagal membaca file Excel. Pastikan format file benar (.xlsx, .xls).');
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper to parse dates from Excel
  const parseExcelDate = (excelDate) => {
    if (!excelDate) return null;
    
    // If it's a number (Excel serial date)
    if (typeof excelDate === 'number') {
      const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
      return date.toISOString().split('T')[0];
    }
    
    // If it's a string date, try to parse it
    try {
      const date = new Date(excelDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch (e) {
      // Ignored
    }
    return excelDate.toString(); // Fallback
  };

  const handleImport = async () => {
    setIsImporting(true);
    setError('');
    
    try {
      await createEmployeesBatch(previewData);
      onSuccess(previewData.length);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Gagal mengimport data: ' + (err.message || 'Terjadi kesalahan pada server.'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Import Data Excel</h2>
            <p className="text-xs text-slate-500 mt-1">
              Langkah {step} dari 2: {step === 1 ? 'Pilih File' : 'Preview & Validasi'}
            </p>
          </div>
          <button onClick={onClose} disabled={isImporting} className="text-slate-400 hover:text-slate-600 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <FileSpreadsheet size={32} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Klik atau Drag file Excel ke sini</h3>
              <p className="text-sm text-slate-500 mb-6 text-center max-w-sm">
                Format yang didukung: .xlsx, .xls, .csv<br/>
                Pastikan baris pertama adalah header/nama kolom.
              </p>
              <button className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2">
                <Upload size={18} />
                Pilih File Excel
              </button>
            </div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 2 && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Preview Data ({previewData.length} baris)</h3>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Siap di-import</span>
              </div>
              <div className="overflow-auto max-h-[50vh]">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-100 sticky top-0 shadow-sm z-10">
                    <tr>
                      <th className="px-4 py-3">No</th>
                      {DB_COLUMNS.map(col => (
                        <th key={col.key} className="px-4 py-3 whitespace-nowrap">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {previewData.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-400">{i + 1}</td>
                        {DB_COLUMNS.map(col => (
                          <td key={col.key} className="px-4 py-2 text-slate-600 truncate max-w-[200px]">
                            {row[col.key] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {previewData.length > 50 && (
                <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-100">
                  Menampilkan 50 baris pertama dari {previewData.length} baris data.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-white">
          <div>
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)}
                disabled={isImporting}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors text-sm"
              >
                Kembali
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-300 font-medium hover:bg-slate-50 rounded-lg transition-colors text-sm"
            >
              Batal
            </button>
            
            {step === 2 && (
              <button 
                onClick={handleImport}
                disabled={isImporting}
                className="px-5 py-2 bg-emerald-600 text-white font-medium hover:bg-emerald-700 rounded-lg transition-colors text-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Mengimport...
                  </>
                ) : (
                  <>
                    <Upload size={16} /> Import {previewData.length} Data
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
