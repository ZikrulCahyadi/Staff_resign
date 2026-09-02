import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { getEmployeesData, createEmployee, updateEmployee, deleteEmployee } from '../services/resignationService';

export default function DataManagement() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
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

  const filteredData = data.filter(item => 
    item.nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Manajemen Data Karyawan</h1>
          <p className="text-sm text-slate-500">Kelola data resign karyawan (Staff_resign)</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari NIK, Nama, Jabatan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Data</span>
          </button>
        </div>
      </div>

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
                    <td className="px-4 py-3 text-slate-600">{employee.nama}</td>
                    <td className="px-4 py-3 text-slate-600">{employee.jabatan}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{employee.kebun}</div>
                      <div className="text-[10px] text-slate-400">{employee.region}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        employee.jenis_resign === 'VT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {employee.jenis_resign}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs truncate max-w-[150px]" title={employee.cluster_resign}>
                      {employee.cluster_resign}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
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
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">Tidak ada data ditemukan</td>
                </tr>
              )}
            </tbody>
          </table>
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
