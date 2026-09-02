import { supabase } from '../lib/supabase';

export const getEmployeesData = async () => {
  try {
    if (!supabase) {
      throw new Error("Kredensial Supabase belum dikonfigurasi di file .env");
    }
    
    const { data, error } = await supabase
      .from('Staff_resign')
      .select('employee_id, nama, join_date, resign_date, jabatan, kebun, deskripsi_resign, jenis_resign, cluster_resign, alumni, keterangan, region');

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Supabase connection error:', err);
    throw err;
  }
};

export const createEmployee = async (employeeData) => {
  try {
    const { data, error } = await supabase
      .from('Staff_resign')
      .insert([employeeData])
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error creating employee:', err);
    throw err;
  }
};

export const updateEmployee = async (employeeId, employeeData) => {
  try {
    const { data, error } = await supabase
      .from('Staff_resign')
      .update(employeeData)
      .eq('employee_id', employeeId)
      .select();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error updating employee:', err);
    throw err;
  }
};

export const deleteEmployee = async (employeeId) => {
  try {
    const { data, error } = await supabase
      .from('Staff_resign')
      .delete()
      .eq('employee_id', employeeId);

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error deleting employee:', err);
    throw err;
  }
};
