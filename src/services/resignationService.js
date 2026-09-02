import { supabase } from '../lib/supabase';

export const getEmployeesData = async () => {
  try {
    if (!supabase) {
      throw new Error("Kredensial Supabase belum dikonfigurasi di file .env");
    }
    
    // Fetch all rows by paginating through Supabase's 1000-row default limit
    const PAGE_SIZE = 1000;
    let allData = [];
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('Staff_resign')
        .select('*')
        .order('resign_date', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        from += PAGE_SIZE;
        // If we got fewer rows than PAGE_SIZE, we've reached the end
        hasMore = data.length === PAGE_SIZE;
      } else {
        hasMore = false;
      }
    }

    return allData;
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
