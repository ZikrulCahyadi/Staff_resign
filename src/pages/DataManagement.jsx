import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload, Download, Check, AlertCircle } from 'lucide-react';
import { getEmployeesData, createEmployee, updateEmployee, deleteEmployee, insertEmployeesBulk } from '../services/resignationService';

import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportLoading, setIsImportLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [importPreviewData, setImportPreviewData] = useState(null);
  const [importSuccessData, setImportSuccessData] = useState(null);
  
  const fileInputRef = useRef(null);

  // Form state
  const initialFormState = {
    employee_id: '',
    nama: '',
    jabatan: '',
    kebun: '',
    region: '',
    join_date: '',
    resign_date: '',
    jenis_resign: 'VT',
    cluster_resign: '',
    alumni: 'NON ALUMNI',
    deskripsi_resign: '',
    keterangan: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const employees = await getEmployeesData();
      setData(employees || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data karyawan.");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // --- CRUD Modal ---
  const handleOpenModal = (employee = null) => {
    if (employee) {
      setEditingId(employee.employee_id);
      setFormData({
        ...employee,
        join_date: employee.join_date ? employee.join_date.split('T')[0] : '',
        resign_date: employee.resign_date ? employee.resign_date.split('T')[0] : ''
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setEditingId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateEmployee(editingId, formData);
        showNotification("Data berhasil diperbarui!");
      } else {
        await createEmployee(formData);
        showNotification("Data berhasil ditambahkan!");
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("Error submitting form:", err);
      showNotification("Gagal menyimpan data: " + (err.message || "Kesalahan pada server"), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data karyawan ${nama} (${id})?`)) {
      try {
        await deleteEmployee(id);
        showNotification("Data berhasil dihapus!");
        fetchData();
      } catch (err) {
        console.error("Error deleting:", err);
        showNotification("Gagal menghapus data.", 'error');
      }
    }
  };

  // --- Import Modal (Excel) ---
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template Karyawan');

    const headers = [
      'employee_id', 'nama', 'jabatan', 'kebun', 'region', 
      'join_date', 'resign_date', 'jenis_resign', 'cluster_resign', 
      'alumni', 'deskripsi_resign', 'keterangan'
    ];
    
    // Add Headers
    worksheet.addRow(headers);
    
    // Style Headers to look good
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF008000' } // Warna hijau seperti di referensi
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' } // Warna putih
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, 
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Contoh data tunggal sesuai permintaan
    const sampleRow = worksheet.addRow([
      '123', 'Test Staff', 'Asisten', 'MRE', 'Kubar', 
      '2022-01-15', '2025-06-10', 'VT', 'Pindah Perusahaan', 
      'ALUMNI', 'Penjelasan singkat', 'Catatan opsional'
    ]);
    
    sampleRow.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, 
        bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Menyesuaikan lebar kolom agar lebih rapi
    worksheet.columns = [
      { width: 15 }, { width: 25 }, { width: 20 }, { width: 15 }, { width: 15 }, 
      { width: 15 }, { width: 15 }, { width: 15 }, { width: 25 }, 
      { width: 15 }, { width: 35 }, { width: 25 }
    ];

    // Download the Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "template_import_karyawan.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setIsImportLoading(true);
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const parsedData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        
        if (parsedData.length === 0) {
          showNotification("File kosong atau format tidak memiliki data.", 'error');
          return;
        }

        if (!parsedData[0].hasOwnProperty('employee_id') || !parsedData[0].hasOwnProperty('nama')) {
          showNotification("Format salah! Pastikan menggunakan template yang telah diunduh.", 'error');
          return;
        }

        const cleanData = parsedData.map(row => {
          const cleanedRow = { ...row };
          Object.keys(cleanedRow).forEach(key => {
            if (cleanedRow[key] === '') cleanedRow[key] = null;
          });
          return cleanedRow;
        });

        // Tampilkan preview, jangan langsung insert
        setImportPreviewData(cleanData);
      } catch (err) {
        console.error("Parse error:", err);
        showNotification("Gagal membaca file. Pastikan format tabel benar.", 'error');
      } finally {
        setIsImportLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const confirmImport = async () => {
    if (!importPreviewData) return;
    try {
      setIsImportLoading(true);
      await insertEmployeesBulk(importPreviewData);
      
      // Tampilkan popup sukses import, tutup popup import
      setImportSuccessData({ count: importPreviewData.length });
      setIsImportModalOpen(false);
      setImportPreviewData(null);
      
      fetchData();
    } catch (err) {
      console.error("Import error:", err);
      showNotification("Gagal mengimpor data. Pastikan format tabel benar dan NIK belum terdaftar.", 'error');
    } finally {
      setIsImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setIsImportModalOpen(false);
    setImportPreviewData(null);
  };

  const filteredData = data.filter(item => 
    item.nama?.toString().toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.employee_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jabatan?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4 relative">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border z-[60] flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 ${
          notification.type === 'success' 
            ? 'bg-white border-emerald-100' 
            : 'bg-white border-rose-100'
        }`}>
          {notification.type === 'success' ? (
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
              <Check size={20} className="text-emerald-500" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-rose-500" />
            </div>
          )}
          <div className="pr-6">
            <h4 className={`text-sm font-bold ${notification.type === 'success' ? 'text-emerald-800' : 'text-rose-800'}`}>
              {notification.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan'}
            </h4>
            <p className="text-xs font-medium text-slate-500">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="absolute top-4 right-4 text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Data Karyawan</h1>
          <p className="text-sm text-slate-500">Kelola data resign karyawan (Staff_resign)</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64 w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama, Jabatan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200"
            >
              <Upload size={16} />
              <span>Import Data</span>
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">NIK</th>
                <th className="px-4 py-3 font-semibold">Nama</th>
                <th className="px-4 py-3 font-semibold">Jabatan</th>
                <th className="px-4 py-3 font-semibold">Kebun/Region</th>
                <th className="px-4 py-3 font-semibold text-center">Jenis</th>
                <th className="px-4 py-3 font-semibold">Cluster</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-rose-500">{error}</td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((employee, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{employee.employee_id}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{employee.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{employee.jabatan || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{employee.kebun || '-'}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{employee.region}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        employee.jenis_resign === 'VT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {employee.jenis_resign}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[150px]" title={employee.cluster_resign}>
                      {employee.cluster_resign || '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleOpenModal(employee)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.employee_id, employee.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {importPreviewData ? 'Konfirmasi Data Import' : 'Import Data'}
              </h2>
              <button onClick={closeImportModal} className="text-slate-400 hover:text-slate-600" disabled={isImportLoading}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {!importPreviewData ? (
                <>
                  <p className="text-sm text-slate-600 mb-6">
                    Anda dapat menambahkan banyak data sekaligus dengan mengunggah file. Unduh template di bawah ini untuk melihat format kolom yang dibutuhkan.
                  </p>
                  
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleDownloadTemplate}
                      className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl text-sm font-semibold transition-colors border border-blue-200"
                    >
                      <Download size={18} />
                      Unduh Template
                    </button>

                    <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors">
                      <Upload size={32} className="text-slate-400 mb-3" />
                      <span className="text-sm font-medium text-slate-700 mb-1">
                        {isImportLoading ? 'Memproses File...' : 'Klik untuk Unggah File'}
                      </span>
                      <span className="text-xs text-slate-500">Mendukung format .xlsx, .xls, dan .csv</span>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={isImportLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                    <Check size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-blue-800">File berhasil dibaca!</h4>
                      <p className="text-xs text-blue-600 mt-1">Ditemukan <strong>{importPreviewData.length}</strong> baris data karyawan yang siap untuk ditambahkan ke sistem.</p>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                      <h4 className="text-xs font-semibold text-slate-600 uppercase">Preview 3 Data Pertama</h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {importPreviewData.slice(0, 3).map((item, i) => (
                        <div key={i} className="p-3 text-sm flex justify-between items-center hover:bg-slate-50">
                          <div>
                            <div className="font-semibold text-slate-700">{item.nama} <span className="text-slate-400 font-normal">({item.employee_id})</span></div>
                            <div className="text-xs text-slate-500">{item.jabatan} • {item.kebun}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                            item.jenis_resign === 'VT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.jenis_resign}
                          </span>
                        </div>
                      ))}
                      {importPreviewData.length > 3 && (
                        <div className="p-3 text-xs text-center text-slate-500 font-medium bg-slate-50">
                          + {importPreviewData.length - 3} data lainnya...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-2 flex gap-3">
                    <button 
                      onClick={() => setImportPreviewData(null)}
                      className="flex-1 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                      disabled={isImportLoading}
                    >
                      Batal
                    </button>
                    <button 
                      onClick={confirmImport}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-blue-200"
                      disabled={isImportLoading}
                    >
                      {isImportLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        `Simpan ${importPreviewData.length} Data`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Success Modal */}
      {importSuccessData && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 items-center text-center animate-fade-in-up">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Berhasil!</h2>
            <p className="text-slate-600 mb-8">
              Sebanyak <strong className="text-slate-800">{importSuccessData.count}</strong> data berhasil di import.
            </p>
            <button 
              onClick={() => setImportSuccessData(null)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
            >
              Oke, Selesai
            </button>
          </div>
        </div>
      )}

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingId ? 'Edit Data Karyawan' : 'Tambah Data Karyawan'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="employeeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">NIK (Employee ID) *</label>
                  <input required type="text" name="employee_id" value={formData.employee_id} onChange={handleInputChange} disabled={!!editingId} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm disabled:bg-slate-100" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Nama *</label>
                  <input required type="text" name="nama" value={formData.nama} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Jabatan</label>
                  <input type="text" name="jabatan" value={formData.jabatan} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Kebun</label>
                  <input type="text" name="kebun" value={formData.kebun} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Region</label>
                  <input type="text" name="region" value={formData.region} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Jenis Resign</label>
                  <select name="jenis_resign" value={formData.jenis_resign} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm">
                    <option value="VT">Voluntary (VT)</option>
                    <option value="IT">Involuntary (IT)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Cluster Resign</label>
                  <input type="text" name="cluster_resign" value={formData.cluster_resign} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Status Alumni FRLC</label>
                  <select name="alumni" value={formData.alumni} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm">
                    <option value="ALUMNI">Alumni</option>
                    <option value="NON ALUMNI">Non Alumni</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Tanggal Bergabung</label>
                  <input type="date" name="join_date" value={formData.join_date} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Tanggal Resign</label>
                  <input type="date" name="resign_date" value={formData.resign_date} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Deskripsi Resign</label>
                  <textarea name="deskripsi_resign" value={formData.deskripsi_resign} onChange={handleInputChange} rows="2" className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"></textarea>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-600">Keterangan Tambahan</label>
                  <input type="text" name="keterangan" value={formData.keterangan} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm" />
                </div>
              </form>
            </div>
            
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 bg-slate-50">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="employeeForm"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Menyimpan...
                  </>
                ) : 'Simpan Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
