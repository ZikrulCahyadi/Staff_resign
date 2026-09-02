export const normalizeJenisResign = (jenis) => {
  if (!jenis) return 'UNKNOWN';
  return String(jenis).trim().toUpperCase();
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
  return String(cluster).trim();
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
    
    if (itemYear !== year) return false;
    
    // For 2026, only include up to July (month 0-6 in Date object)
    if (year === 2026) {
      return date.getMonth() <= 6; 
    }
    return true;
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

export const getClusterAnalysis = (data2025, data2026) => {
  const clusterMap = new Map();
  
  const processData = (data, year) => {
    const total = data.length;
    data.forEach(item => {
      const cluster = normalizeCluster(item.cluster_resign);
      if (!clusterMap.has(cluster)) {
        clusterMap.set(cluster, {
          cluster,
          count2025: 0,
          perc2025: 0,
          count2026: 0,
          perc2026: 0,
          descriptions: new Set()
        });
      }
      const entry = clusterMap.get(cluster);
      if (year === 2025) {
        entry.count2025++;
      } else {
        entry.count2026++;
      }
      
      if (item.deskripsi_resign && String(item.deskripsi_resign).trim() !== '') {
        entry.descriptions.add(String(item.deskripsi_resign).trim());
      }
    });
  };

  processData(data2025, 2025);
  processData(data2026, 2026);
  
  const total2025 = data2025.length;
  const total2026 = data2026.length;

  return Array.from(clusterMap.values()).map(entry => {
    entry.perc2025 = calculatePercentage(entry.count2025, total2025);
    entry.perc2026 = calculatePercentage(entry.count2026, total2026);
    entry.desc = Array.from(entry.descriptions).slice(0, 3).join(', ') + (entry.descriptions.size > 3 ? '...' : '');
    return entry;
  }).sort((a, b) => (b.count2025 + b.count2026) - (a.count2025 + a.count2026));
};

export const getPositionAnalysis = (data2025, data2026) => {
  const posMap = new Map();
  
  const processData = (data, year) => {
    const total = data.length;
    data.forEach(item => {
      const jabatan = normalizeJabatan(item.jabatan);
      if (!posMap.has(jabatan)) {
        posMap.set(jabatan, {
          jabatan,
          count2025: 0,
          perc2025: 0,
          count2026: 0,
          perc2026: 0
        });
      }
      const entry = posMap.get(jabatan);
      if (year === 2025) {
        entry.count2025++;
      } else {
        entry.count2026++;
      }
    });
  };

  processData(data2025, 2025);
  processData(data2026, 2026);
  
  const total2025 = data2025.length;
  const total2026 = data2026.length;

  return Array.from(posMap.values()).map(entry => {
    entry.perc2025 = calculatePercentage(entry.count2025, total2025);
    entry.perc2026 = calculatePercentage(entry.count2026, total2026);
    return entry;
  }).sort((a, b) => (b.count2025 + b.count2026) - (a.count2025 + a.count2026)).slice(0, 20); // Limit to top 20 for chart readability
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

const getMonthsLabels = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const labels = [];
  
  // 2025 Jan-Des
  for (let i = 0; i < 12; i++) {
    labels.push({ label: `${months[i]} 2025`, year: 2025, monthIndex: i });
  }
  
  // 2026 Jan-Jul
  for (let i = 0; i < 7; i++) {
    labels.push({ label: `${months[i]} 2026`, year: 2026, monthIndex: i });
  }
  
  return labels;
};

export const getMonthlyTrend = (data) => {
  const labels = getMonthsLabels();
  
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
