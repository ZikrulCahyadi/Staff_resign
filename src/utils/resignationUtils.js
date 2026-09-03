export const normalizeJenisResign = (jenis) => {
  if (!jenis) return 'UNKNOWN';
  const val = String(jenis).trim().toUpperCase();
  if (val === 'VT' || val === 'VOLUNTARY') return 'VOLUNTARY';
  if (val === 'IT' || val === 'INVOLUNTARY') return 'INVOLUNTARY';
  return val;
};

export const normalizeAlumni = (alumni) => {
  if (alumni === null || alumni === undefined || String(alumni).trim() === '') {
    return 'Unknown';
  }
  const clean = String(alumni).trim();
  if (clean.toLowerCase() === 'non alumni') {
    return 'Non Alumni';
  }
  return 'Alumni FRLC';
};

export const normalizeCluster = (cluster) => {
  if (!cluster || String(cluster).trim() === '') return 'Tidak Dikategorikan';
  const c = String(cluster).trim().toLowerCase();
  
  if (c.includes('pindah')) return 'Pindah perusahaan';
  if (c.includes('working')) return 'Working Condition';
  if (c.includes('under perform')) return 'Under perform';
  if (c.includes('keluarga')) return 'Keluarga';
  if (c.includes('efisiensi')) return 'Efisiensi';
  if (c.includes('kasus')) return 'Kasus';
  if (c.includes('tanpa keterangan')) return 'Pergi tanpa Keterangan';
  if (c.includes('kontrak')) return 'Hbs Kontrak';
  if (c.includes('indisipliner')) return 'Indisipliner';
  
  // Title case fallback
  const fallback = String(cluster).trim();
  return fallback.charAt(0).toUpperCase() + fallback.slice(1).toLowerCase();
};

export const normalizeJabatan = (jabatan) => {
  if (!jabatan || String(jabatan).trim() === '') return 'Tidak Diketahui';
  return String(jabatan).trim();
};

export const normalizeKebun = (kebun) => {
  if (!kebun || String(kebun).trim() === '') return 'Tidak Diketahui';
  return String(kebun).trim();
};

export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  return Number(((part / total) * 100).toFixed(1));
};

export const getYearData = (data, year) => {
  return data.filter(item => {
    if (!item.resign_date) return false;
    const date = new Date(item.resign_date);
    const itemYear = date.getFullYear();
    
    return itemYear === year;
  });
};

export const getResignationSummary = (data, year) => {
  const yearData = getYearData(data, year);
  return {
    total: yearData.length,
    percentage: 100
  };
};

export const getVoluntarySummary = (data, year) => {
  const yearData = getYearData(data, year);
  const total = yearData.length;
  const vtData = yearData.filter(item => normalizeJenisResign(item.jenis_resign) === 'VOLUNTARY');
  
  return {
    count: vtData.length,
    percentage: calculatePercentage(vtData.length, total)
  };
};

export const getInvoluntarySummary = (data, year) => {
  const yearData = getYearData(data, year);
  const total = yearData.length;
  const itData = yearData.filter(item => normalizeJenisResign(item.jenis_resign) === 'INVOLUNTARY');
  
  return {
    count: itData.length,
    percentage: calculatePercentage(itData.length, total)
  };
};

export const getAlumniSummary = (data, year) => {
  const yearData = getYearData(data, year);
  const total = yearData.length;
  const alumniData = yearData.filter(item => normalizeAlumni(item.alumni) === 'Alumni FRLC');
  
  return {
    count: alumniData.length,
    percentage: calculatePercentage(alumniData.length, total)
  };
};

export const getNonAlumniSummary = (data, year) => {
  const yearData = getYearData(data, year);
  const total = yearData.length;
  const nonAlumniData = yearData.filter(item => normalizeAlumni(item.alumni) === 'Non Alumni');
  
  return {
    count: nonAlumniData.length,
    percentage: calculatePercentage(nonAlumniData.length, total)
  };
};

const CLUSTER_DESCRIPTIONS = {
  'Pindah perusahaan': 'Mendapat Job baru (Gaji/ Jabatan Naik, Dekat Keluarga)',
  'Working Condition': 'Resign karena beban kerja, jam kerja panjang, kelelahan bekerja, tekanan/ konflik dgn atasan, kunjungan manajemen tinggi',
  'Under perform': 'PHK/ Evaluasi Kinerja, Tidak Mampu mengikuti Ritme & target Kebun',
  'Efisiensi': 'Efisiensi/ PHK',
  'Keluarga': 'Mengurus keluarga sakit, dekat dengan keluarga',
  'Pergi tanpa Keterangan': 'Keluar kebun tanpa konfirmasi/ indikasi manipulasi',
  'Hbs Kontrak': 'Habis kontrak',
  'Kasus': 'Kriminal/ Integritas/ Fraud/ Temuan Audit & tidak sesuai budaya perusahaan',
  'Indisipliner': 'Mangkir,tidak ada motivasi kerja'
};

export const getClusterAnalysis = (data, selectedYears) => {
  const clusterMap = new Map();
  
  // Calculate total per year for percentages
  const totalsByYear = {};
  selectedYears.forEach(y => {
    totalsByYear[y] = data.filter(item => item.resign_date && new Date(item.resign_date).getFullYear() === y).length;
  });

  data.forEach(item => {
    if (!item.resign_date) return;
    const date = new Date(item.resign_date);
    const year = date.getFullYear();
    
    if (!selectedYears.includes(year)) return;

    const cluster = normalizeCluster(item.cluster_resign);
    if (!clusterMap.has(cluster)) {
      const initialCounts = {};
      selectedYears.forEach(y => initialCounts[`count${y}`] = 0);
      clusterMap.set(cluster, {
        cluster,
        ...initialCounts,
        totalCount: 0
      });
    }
    
    const entry = clusterMap.get(cluster);
    entry[`count${year}`]++;
    entry.totalCount++;
  });

  return Array.from(clusterMap.values()).map(entry => {
    selectedYears.forEach(y => {
      entry[`perc${y}`] = calculatePercentage(entry[`count${y}`], totalsByYear[y]);
    });
    // Use standard descriptions, fallback to empty string
    entry.desc = CLUSTER_DESCRIPTIONS[entry.cluster] || '';
    return entry;
  });
};

export const getPositionAnalysis = (data, selectedYears) => {
  const posMap = new Map();
  
  const totalsByYear = {};
  selectedYears.forEach(y => {
    totalsByYear[y] = data.filter(item => item.resign_date && new Date(item.resign_date).getFullYear() === y).length;
  });

  data.forEach(item => {
    if (!item.resign_date) return;
    const year = new Date(item.resign_date).getFullYear();
    
    if (!selectedYears.includes(year)) return;

    const jabatan = normalizeJabatan(item.jabatan);
    if (!posMap.has(jabatan)) {
      const initialCounts = {};
      selectedYears.forEach(y => initialCounts[`count${y}`] = 0);
      posMap.set(jabatan, {
        jabatan,
        ...initialCounts,
        totalCount: 0
      });
    }
    
    const entry = posMap.get(jabatan);
    entry[`count${year}`]++;
    entry.totalCount++;
  });

  return Array.from(posMap.values()).map(entry => {
    selectedYears.forEach(y => {
      entry[`perc${y}`] = calculatePercentage(entry[`count${y}`], totalsByYear[y]);
    });
    return entry;
  }).sort((a, b) => b.totalCount - a.totalCount).slice(0, 20);
};

export const getTopEstates = (data, year) => {
  const yearData = getYearData(data, year);
  const totalResign = yearData.length;
  const estateMap = new Map();

  yearData.forEach(item => {
    const kebun = normalizeKebun(item.kebun);
    const jenis = normalizeJenisResign(item.jenis_resign);
    
    if (!estateMap.has(kebun)) {
      estateMap.set(kebun, {
        kebun,
        it: 0,
        vt: 0,
        total: 0,
        perc: 0
      });
    }
    
    const entry = estateMap.get(kebun);
    if (jenis === 'INVOLUNTARY') {
      entry.it++;
    } else if (jenis === 'VOLUNTARY') {
      entry.vt++;
    }
    entry.total++;
  });

  return Array.from(estateMap.values()).map(entry => {
    entry.perc = calculatePercentage(entry.total, totalResign);
    return entry;
  }).sort((a, b) => b.total - a.total).slice(0, 10);
};

const getMonthsLabels = (selectedYears) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const labels = [];
  
  // Create monthly labels for each selected year
  [...selectedYears].sort().forEach(year => {
    for (let i = 0; i < 12; i++) {
      labels.push({ label: `${months[i]} ${year}`, year, monthIndex: i });
    }
  });
  
  return labels;
};

export const getMonthlyTrend = (data, selectedYears) => {
  const labels = getMonthsLabels(selectedYears);
  
  // Initialize counts
  const trendData = labels.map((l, index) => ({
    name: l.label,
    index, // for regression
    it: 0,
    vt: 0,
    total: 0
  }));
  
  data.forEach(item => {
    if (!item.resign_date) return;
    const date = new Date(item.resign_date);
    const year = date.getFullYear();
    if (!selectedYears.includes(year)) return;
    
    const monthIndex = date.getMonth();
    
    const targetLabel = labels.find(l => l.year === year && l.monthIndex === monthIndex);
    if (targetLabel) {
      const dataPoint = trendData.find(d => d.name === targetLabel.label);
      const jenis = normalizeJenisResign(item.jenis_resign);
      if (jenis === 'INVOLUNTARY') {
        dataPoint.it++;
      } else if (jenis === 'VOLUNTARY') {
        dataPoint.vt++;
      }
      dataPoint.total++;
    }
  });
  
  // Remove trailing months with 0 total (future months with no data)
  let lastDataIndex = trendData.length - 1;
  while (lastDataIndex >= 0 && trendData[lastDataIndex].total === 0) {
    lastDataIndex--;
  }
  
  if (lastDataIndex >= 0) {
    return trendData.slice(0, lastDataIndex + 1);
  }
  
  return trendData;
};

export const calculateLinearRegression = (trendData, dataKey) => {
  const n = trendData.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  trendData.forEach(d => {
    const x = d.index;
    const y = d[dataKey] || 0;
    
    sumX += x;
    sumY += y;
    sumXY += (x * y);
    sumXX += (x * x);
  });
  
  const denominator = (n * sumXX - sumX * sumX);
  if (denominator === 0) return { slope: 0, intercept: 0 };
  
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};
