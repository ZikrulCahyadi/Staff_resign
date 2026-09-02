import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, Filter, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { getEmployeesData, createEmployee, updateEmployee, deleteEmployee } from '../services/resignationService';

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Extract unique regions for filter dropdown
  const regionOptions = useMemo(() => {
    const regions = [...new Set(data.map(item => item.region).filter(Boolean))].sort();
    return regions;
  }, [data]);

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  
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
        alert("Data berhasil diperbarui!");
      } else {
        await createEmployee(formData);
        alert("Data berhasil ditambahkan!");
      }
      handleCloseModal();
      fetchData();
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Gagal menyimpan data: " + (err.message || "Kesalahan pada server"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data karyawan ${nama} (${id})?`)) {
      try {
        await deleteEmployee(id);
        alert("Data berhasil dihapus!");
        fetchData();
      } catch (err) {
        console.error("Error deleting:", err);
        alert("Gagal menghapus data.");
      }
    }
  };

  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kebun?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !regionFilter || item.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to page 1 when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, regionFilter]);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Manajemen Data Karyawan</h1>
            <p className="text-sm text-slate-500">Kelola data resign karyawan (Staff_resign) — <span className="font-medium text-emerald-600">{filteredData.length}</span> data ditampilkan</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0">
            <div className="relative w-full sm:w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div className="relative w-full sm:w-40">
              <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white appearance-none cursor-pointer"
              >
                <option value="">Semua Region</option>
                {regionOptions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 w-full sm:w-auto"
            >
              <Plus size={16} />
              <span>Tambah Data</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">NIK</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Nama</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Jabatan</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Kebun</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Region</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Tgl Bergabung</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Tgl Resign</th>
                <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Jenis</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Cluster</th>
                <th className="px-3 py-3 font-semibold text-center whitespace-nowrap">Alumni</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Deskripsi</th>
                <th className="px-3 py-3 font-semibold whitespace-nowrap">Keterangan</th>
                <th className="px-3 py-3 font-semibold text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-slate-500">Memuat data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="13" className="px-4 py-8 text-center text-rose-500">{error}</td>
                </tr>
              ) : filteredData.length > 0 ? (
                paginatedData.map((employee, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-700 whitespace-nowrap">{employee.employee_id}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{employee.nama}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{employee.jabatan || '-'}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{employee.kebun || '-'}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap">{employee.region || '-'}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap text-xs">{formatDate(employee.join_date)}</td>
                    <td className="px-3 py-3 text-slate-600 whitespace-nowrap text-xs">{formatDate(employee.resign_date)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                        employee.jenis_resign === 'VT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {employee.jenis_resign === 'VT' ? 'VOLUNTARY' : employee.jenis_resign === 'IT' ? 'INVOLUNTARY' : employee.jenis_resign}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600 text-xs max-w-[180px] truncate" title={employee.cluster_resign}>
                      {employee.cluster_resign || '-'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold whitespace-nowrap ${
                        employee.alumni === 'ALUMNI' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {employee.alumni || '-'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs max-w-[200px] truncate" title={employee.deskripsi_resign}>
                      {employee.deskripsi_resign || '-'}
                    </td>
                    <td className="px-3 py-3 text-slate-500 text-xs max-w-[150px] truncate" title={employee.keterangan}>
                      {employee.keterangan || '-'}
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => setViewingEmployee(employee)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Lihat Detail"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(employee)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(employee.employee_id, employee.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
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
                  <td colSpan="13" className="px-4 py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-slate-200 gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>Tampilkan</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-slate-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>data per halaman</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>
              Menampilkan {filteredData.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 font-medium text-slate-700">{currentPage} / {totalPages || 1}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Form */}
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
                  <select name="region" value={formData.region} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm">
                    <option value="">Pilih Region...</option>
                    {regionOptions.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
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
                  <input type="date" name="join_date" value={formData.join_date} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Tanggal Resign</label>
                  <input type="date" name="resign_date" value={formData.resign_date} onChange={handleInputChange} onClick={(e) => e.target.showPicker && e.target.showPicker()} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm cursor-pointer" />
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

      {/* Detail View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4" onClick={() => setViewingEmployee(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-600 to-teal-600">
              <div>
                <h2 className="text-lg font-bold text-white">Detail Karyawan</h2>
                <p className="text-emerald-100 text-sm">{viewingEmployee.employee_id}</p>
              </div>
              <button onClick={() => setViewingEmployee(null)} className="text-white/70 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="text-center pb-4 border-b border-slate-100">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-emerald-700">{viewingEmployee.nama?.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{viewingEmployee.nama}</h3>
                <p className="text-sm text-slate-500">{viewingEmployee.jabatan || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'NIK', value: viewingEmployee.employee_id },
                  { label: 'Nama', value: viewingEmployee.nama },
                  { label: 'Jabatan', value: viewingEmployee.jabatan },
                  { label: 'Kebun', value: viewingEmployee.kebun },
                  { label: 'Region', value: viewingEmployee.region },
                  { label: 'Tanggal Bergabung', value: formatDate(viewingEmployee.join_date) },
                  { label: 'Tanggal Resign', value: formatDate(viewingEmployee.resign_date) },
                  { label: 'Jenis Resign', value: viewingEmployee.jenis_resign === 'VT' ? 'Voluntary (VT)' : viewingEmployee.jenis_resign === 'IT' ? 'Involuntary (IT)' : viewingEmployee.jenis_resign },
                  { label: 'Cluster Resign', value: viewingEmployee.cluster_resign },
                  { label: 'Status Alumni', value: viewingEmployee.alumni },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-slate-700 mt-0.5">{item.value || '-'}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Deskripsi Resign</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{viewingEmployee.deskripsi_resign || '-'}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Keterangan Tambahan</p>
                <p className="text-sm text-slate-700 mt-1 leading-relaxed">{viewingEmployee.keterangan || '-'}</p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button 
                onClick={() => setViewingEmployee(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
