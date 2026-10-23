import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { DEFAULT_SAMPLE_DATA, REQUIRED_COLUMNS } from '../data/defaultSampleData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Raw transactions data
  const [data, setData] = useState(DEFAULT_SAMPLE_DATA);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' | 'uploaded' | 'backend'
  const [datasetMeta, setDatasetMeta] = useState({
    fileName: 'sample_dataset_embedded.js',
    rowCount: DEFAULT_SAMPLE_DATA.length,
    loadedAt: new Date().toLocaleTimeString(),
    isValid: true
  });

  // Backend link state
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [balanceFilter, setBalanceFilter] = useState('ALL'); // 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'

  // Selected ATM for Slide-over Details Drawer
  const [selectedAtmId, setSelectedAtmId] = useState(null);

  // College Demo Guided Tour Active Step (null if closed)
  const [demoGuideOpen, setDemoGuideOpen] = useState(false);
  const [demoCurrentStep, setDemoCurrentStep] = useState(1);

  // Check backend connectivity on mount
  useEffect(() => {
    let isMounted = true;
    async function checkBackend() {
      try {
        const response = await fetch(`${backendUrl}/api/health`, { method: 'GET' });
        if (response.ok && isMounted) {
          const json = await response.json();
          setBackendStatus(json.status === 'ok' ? 'connected' : 'disconnected');
        } else if (isMounted) {
          setBackendStatus('disconnected');
        }
      } catch (err) {
        if (isMounted) {
          setBackendStatus('disconnected');
        }
      }
    }
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [backendUrl]);

  // List of unique cities and weekdays in the current dataset
  const availableCities = useMemo(() => {
    const set = new Set();
    data.forEach(item => {
      if (item.atmCity) set.add(item.atmCity.trim());
    });
    return Array.from(set).sort();
  }, [data]);

  const availableDays = useMemo(() => {
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const set = new Set();
    data.forEach(item => {
      if (item.day) set.add(item.day.trim());
    });
    return daysOrder.filter(d => set.has(d));
  }, [data]);

  // Filtered dataset according to user criteria
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter (by ATM ID or ATM Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = item.atmId?.toLowerCase().includes(q);
        const nameMatch = item.atmName?.toLowerCase().includes(q);
        const addrMatch = item.atmAddress?.toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !addrMatch) return false;
      }

      // City filter
      if (selectedCity !== 'ALL' && item.atmCity !== selectedCity) {
        return false;
      }

      // Day filter
      if (selectedDay !== 'ALL' && item.day !== selectedDay) {
        return false;
      }

      // Balance tier filter
      if (balanceFilter === 'LOW' && item.totalBalance >= 50000) return false;
      if (balanceFilter === 'MEDIUM' && (item.totalBalance < 50000 || item.totalBalance > 120000)) return false;
      if (balanceFilter === 'HIGH' && item.totalBalance <= 120000) return false;

      return true;
    });
  }, [data, searchQuery, selectedCity, selectedDay, balanceFilter]);

  // Core Aggregations & Metrics Calculation based on user specifications:
  // - Total income = sum of totalIncome
  // - Total outcome = sum of totalOutcome
  // - Total transactions = sum of totalNumberTransaction
  // - ATM count = count of unique atmId
  // - Total balance = sum of latest reported balance per ATM to avoid double-counting
  const analyticsSummary = useMemo(() => {
    let totalIncome = 0;
    let totalOutcome = 0;
    let totalTransactions = 0;
    let rawBalanceSum = 0;
    let totalIncomeTxCount = 0;
    let totalOutcomeTxCount = 0;

    const uniqueAtmMap = new Map();
    const cityMap = new Map();
    const dayMap = {
      Monday: { day: 'Mon', income: 0, outcome: 0, transactions: 0 },
      Tuesday: { day: 'Tue', income: 0, outcome: 0, transactions: 0 },
      Wednesday: { day: 'Wed', income: 0, outcome: 0, transactions: 0 },
      Thursday: { day: 'Thu', income: 0, outcome: 0, transactions: 0 },
      Friday: { day: 'Fri', income: 0, outcome: 0, transactions: 0 },
      Saturday: { day: 'Sat', income: 0, outcome: 0, transactions: 0 },
      Sunday: { day: 'Sun', income: 0, outcome: 0, transactions: 0 }
    };

    const timeBuckets = {
      'Night (00:00 - 06:00)': 0,
      'Morning (06:00 - 12:00)': 0,
      'Afternoon (12:00 - 18:00)': 0,
      'Evening (18:00 - 24:00)': 0
    };

    filteredData.forEach(row => {
      const inc = Number(row.totalIncome) || 0;
      const out = Number(row.totalOutcome) || 0;
      const tx = Number(row.totalNumberTransaction) || 0;
      const incTx = Number(row.numberIncomeTransaction) || 0;
      const outTx = Number(row.numberOutcomeTransaction) || 0;
      const bal = Number(row.totalBalance) || 0;

      totalIncome += inc;
      totalOutcome += out;
      totalTransactions += tx;
      totalIncomeTxCount += incTx;
      totalOutcomeTxCount += outTx;
      rawBalanceSum += bal;

      // Unique ATM Aggregation
      if (!uniqueAtmMap.has(row.atmId)) {
        uniqueAtmMap.set(row.atmId, {
          atmId: row.atmId,
          atmName: row.atmName,
          atmCity: row.atmCity,
          atmAddress: row.atmAddress,
          latestBalance: bal,
          totalIncome: 0,
          totalOutcome: 0,
          totalTransactions: 0,
          incomeTxCount: 0,
          outcomeTxCount: 0,
          recordCount: 0,
          records: []
        });
      }

      const atmEntry = uniqueAtmMap.get(row.atmId);
      atmEntry.totalIncome += inc;
      atmEntry.totalOutcome += out;
      atmEntry.totalTransactions += tx;
      atmEntry.incomeTxCount += incTx;
      atmEntry.outcomeTxCount += outTx;
      atmEntry.recordCount += 1;
      atmEntry.records.push(row);
      // Keep reported balance
      atmEntry.latestBalance = bal;

      // City Aggregation
      const cityName = row.atmCity || 'Unknown';
      if (!cityMap.has(cityName)) {
        cityMap.set(cityName, {
          city: cityName,
          totalIncome: 0,
          totalOutcome: 0,
          totalTransactions: 0,
          atmIds: new Set(),
          recordCount: 0
        });
      }
      const cityEntry = cityMap.get(cityName);
      cityEntry.totalIncome += inc;
      cityEntry.totalOutcome += out;
      cityEntry.totalTransactions += tx;
      cityEntry.atmIds.add(row.atmId);
      cityEntry.recordCount += 1;

      // Day Aggregation
      if (row.day && dayMap[row.day]) {
        dayMap[row.day].income += inc;
        dayMap[row.day].outcome += out;
        dayMap[row.day].transactions += tx;
      }

      // Time Bucket Aggregation
      if (row.transactionTime) {
        const hour = parseInt(row.transactionTime.split(':')[0], 10);
        if (!isNaN(hour)) {
          if (hour >= 0 && hour < 6) timeBuckets['Night (00:00 - 06:00)'] += tx;
          else if (hour >= 6 && hour < 12) timeBuckets['Morning (06:00 - 12:00)'] += tx;
          else if (hour >= 12 && hour < 18) timeBuckets['Afternoon (12:00 - 18:00)'] += tx;
          else timeBuckets['Evening (18:00 - 24:00)'] += tx;
        }
      }
    });

    // Compute unique ATM balance total (avoids repeating balance for multiple summary rows)
    let uniqueAtmReportedBalance = 0;
    uniqueAtmMap.forEach(atm => {
      uniqueAtmReportedBalance += atm.latestBalance;
    });

    const uniqueAtmsList = Array.from(uniqueAtmMap.values());
    const top10ByIncome = [...uniqueAtmsList]
      .sort((a, b) => b.totalIncome - a.totalIncome)
      .slice(0, 10);

    const top10ByTransactions = [...uniqueAtmsList]
      .sort((a, b) => b.totalTransactions - a.totalTransactions)
      .slice(0, 10);

    const citySummaryList = Array.from(cityMap.values()).map(c => ({
      city: c.city,
      atmCount: c.atmIds.size,
      totalIncome: Math.round(c.totalIncome),
      totalOutcome: Math.round(c.totalOutcome),
      totalTransactions: c.totalTransactions,
      recordCount: c.recordCount
    })).sort((a, b) => b.totalIncome - a.totalIncome);

    const dayDistributionList = Object.keys(dayMap).map(dayName => ({
      dayFullName: dayName,
      ...dayMap[dayName]
    }));

    const timeDistributionList = Object.keys(timeBuckets).map(bucket => ({
      period: bucket,
      transactions: timeBuckets[bucket]
    }));

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalOutcome: Math.round(totalOutcome * 100) / 100,
      netCashFlow: Math.round((totalIncome - totalOutcome) * 100) / 100,
      totalTransactions,
      totalIncomeTxCount,
      totalOutcomeTxCount,
      uniqueAtmReportedBalance: Math.round(uniqueAtmReportedBalance * 100) / 100,
      rawBalanceSum: Math.round(rawBalanceSum * 100) / 100,
      atmCount: uniqueAtmMap.size,
      recordCount: filteredData.length,
      cityCount: cityMap.size,
      uniqueAtmsList,
      top10ByIncome,
      top10ByTransactions,
      citySummaryList,
      dayDistributionList,
      timeDistributionList
    };
  }, [filteredData]);

  // CSV Upload & Validation Handler
  const handleCsvUpload = (file, onSuccess, onError) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          if (onError) onError("The uploaded CSV file is empty.");
          return;
        }

        const uploadedColumns = Object.keys(results.data[0]);
        const missingColumns = REQUIRED_COLUMNS.filter(col => !uploadedColumns.includes(col));

        if (missingColumns.length > 0) {
          const errorMsg = `CSV schema validation failed! Missing required columns: ${missingColumns.join(', ')}. Please verify the dataset structure.`;
          if (onError) onError(errorMsg);
          return;
        }

        // Clean and ensure numeric formats
        const cleanedData = results.data.map(row => ({
          atmId: String(row.atmId || '').trim(),
          atmName: String(row.atmName || 'Unnamed ATM').trim(),
          atmCity: String(row.atmCity || 'Unknown City').trim(),
          atmAddress: String(row.atmAddress || 'Address unavailable').trim(),
          totalBalance: Number(row.totalBalance) || 0,
          numberIncomeTransaction: parseInt(row.numberIncomeTransaction, 10) || 0,
          numberOutcomeTransaction: parseInt(row.numberOutcomeTransaction, 10) || 0,
          totalIncome: Number(row.totalIncome) || 0,
          totalOutcome: Number(row.totalOutcome) || 0,
          totalNumberTransaction: parseInt(row.totalNumberTransaction, 10) || 0,
          day: String(row.day || '').trim(),
          transactionTime: String(row.transactionTime || '00:00:00').trim()
        }));

        setData(cleanedData);
        setDataSource('uploaded');
        setDatasetMeta({
          fileName: file.name,
          rowCount: cleanedData.length,
          loadedAt: new Date().toLocaleTimeString(),
          isValid: true
        });

        // Reset filters to show full imported dataset
        setSearchQuery('');
        setSelectedCity('ALL');
        setSelectedDay('ALL');
        setBalanceFilter('ALL');

        if (onSuccess) onSuccess(cleanedData.length);
      },
      error: (err) => {
        if (onError) onError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  // Reset to default sample dataset
  const resetToSampleData = () => {
    setData(DEFAULT_SAMPLE_DATA);
    setDataSource('sample');
    setDatasetMeta({
      fileName: 'atm_transactions_sample.csv (Embedded)',
      rowCount: DEFAULT_SAMPLE_DATA.length,
      loadedAt: new Date().toLocaleTimeString(),
      isValid: true
    });
    setSearchQuery('');
    setSelectedCity('ALL');
    setSelectedDay('ALL');
    setBalanceFilter('ALL');
  };

  // Export filtered data as CSV download
  const exportFilteredDataToCSV = (filename = 'atm_filtered_analytics.csv') => {
    const csvContent = Papa.unparse(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('ALL');
    setSelectedDay('ALL');
    setBalanceFilter('ALL');
  };

  return (
    <DataContext.Provider
      value={{
        data,
        filteredData,
        dataSource,
        datasetMeta,
        backendStatus,
        backendUrl,
        availableCities,
        availableDays,
        searchQuery,
        setSearchQuery,
        selectedCity,
        setSelectedCity,
        selectedDay,
        setSelectedDay,
        balanceFilter,
        setBalanceFilter,
        selectedAtmId,
        setSelectedAtmId,
        analyticsSummary,
        handleCsvUpload,
        resetToSampleData,
        exportFilteredDataToCSV,
        resetFilters,
        demoGuideOpen,
        setDemoGuideOpen,
        demoCurrentStep,
        setDemoCurrentStep
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
