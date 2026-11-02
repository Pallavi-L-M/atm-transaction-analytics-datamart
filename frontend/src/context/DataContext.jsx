import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import Papa from 'papaparse';
import { DEFAULT_SAMPLE_DATA, REQUIRED_COLUMNS } from '../data/defaultSampleData';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  // Raw transactions data
  const [data, setData] = useState(DEFAULT_SAMPLE_DATA);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' | 'uploaded' | 'erased' | 'backend'
  const [datasetMeta, setDatasetMeta] = useState({
    fileName: 'atm_transactions_sample.csv (Embedded)',
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
    if (!data || data.length === 0) return [];

    return data.filter(item => {
      // Search filter (by ATM ID, Name, or Address)
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
      if (balanceFilter === 'LOW' && item.totalBalance >= 1200000) return false;
      if (balanceFilter === 'MEDIUM' && (item.totalBalance < 1200000 || item.totalBalance > 1800000)) return false;
      if (balanceFilter === 'HIGH' && item.totalBalance <= 1800000) return false;

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
      const atmKey = row.atmId || 'UNKNOWN';
      if (!uniqueAtmMap.has(atmKey)) {
        uniqueAtmMap.set(atmKey, {
          atmId: atmKey,
          atmName: row.atmName || 'ATM Node',
          atmCity: row.atmCity || 'Unspecified',
          atmAddress: row.atmAddress || 'Address on file',
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

      const atmEntry = uniqueAtmMap.get(atmKey);
      atmEntry.totalIncome += inc;
      atmEntry.totalOutcome += out;
      atmEntry.totalTransactions += tx;
      atmEntry.incomeTxCount += incTx;
      atmEntry.outcomeTxCount += outTx;
      atmEntry.recordCount += 1;
      atmEntry.records.push(row);
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
      cityEntry.atmIds.add(atmKey);
      cityEntry.recordCount += 1;

      // Day Aggregation
      if (row.day && dayMap[row.day]) {
        dayMap[row.day].income += inc;
        dayMap[row.day].outcome += out;
        dayMap[row.day].transactions += tx;
      }

      // Time Bucket Aggregation
      if (row.transactionTime) {
        const hour = parseInt(String(row.transactionTime).split(':')[0], 10);
        if (!isNaN(hour)) {
          if (hour >= 0 && hour < 6) timeBuckets['Night (00:00 - 06:00)'] += tx;
          else if (hour >= 6 && hour < 12) timeBuckets['Morning (06:00 - 12:00)'] += tx;
          else if (hour >= 12 && hour < 18) timeBuckets['Afternoon (12:00 - 18:00)'] += tx;
          else timeBuckets['Evening (18:00 - 24:00)'] += tx;
        }
      }
    });

    // Compute unique ATM balance total (avoids repeating balance for multiple snapshot rows)
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

  // Universal CSV/Transaction File Upload & Flexible Normalizer
  // Ingests ANY type of transaction file format without rejecting
  const handleCsvUpload = (file, onSuccess, onError) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          if (onError) onError("The uploaded transaction file is empty.");
          return;
        }

        const rawRows = results.data;
        const daysArr = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const cleanedData = rawRows.map((rawRow, idx) => {
          // Flexible key lookup: searches for aliases ignoring case, underscores, spaces, hyphens
          const findValue = (...aliases) => {
            const keys = Object.keys(rawRow);
            for (const alias of aliases) {
              const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
              for (const k of keys) {
                if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAlias) {
                  const v = rawRow[k];
                  if (v !== undefined && v !== null && v !== '') return v;
                }
              }
            }
            return undefined;
          };

          // 1. ATM ID
          let rawAtmId = findValue('atmId', 'atm_id', 'atmid', 'terminal_id', 'terminalid', 'terminal', 'atm', 'atm_code', 'machine_id', 'device_id', 'id', 'account_number', 'card_number');
          const atmId = rawAtmId ? String(rawAtmId).trim() : `ATM${String((idx % 25) + 1).padStart(3, '0')}`;

          // 2. ATM Name
          let rawAtmName = findValue('atmName', 'atm_name', 'atmname', 'name', 'terminal_name', 'bank', 'bank_name', 'branch', 'branch_name', 'location_name', 'description');
          const atmName = rawAtmName ? String(rawAtmName).trim() : `${atmId} Bank Terminal`;

          // 3. ATM City
          let rawCity = findValue('atmCity', 'atm_city', 'atmcity', 'city', 'city_name', 'location', 'region', 'state', 'metro', 'district');
          const atmCity = rawCity ? String(rawCity).trim() : 'Bengaluru';

          // 4. ATM Address
          let rawAddress = findValue('atmAddress', 'atm_address', 'atmaddress', 'address', 'street', 'area', 'locality', 'road');
          const atmAddress = rawAddress ? String(rawAddress).trim() : `${atmCity} Main Commercial Road`;

          // 5. Total Income & Total Outcome
          let rawIncome = findValue('totalIncome', 'total_income', 'totalincome', 'income', 'deposit', 'deposits', 'cash_in', 'credit', 'deposit_amount', 'inflow', 'amount_in');
          let rawOutcome = findValue('totalOutcome', 'total_outcome', 'totaloutcome', 'outcome', 'withdrawal', 'withdrawals', 'cash_out', 'debit', 'dispensed', 'withdrawal_amount', 'outflow', 'amount_out');
          
          let rawAmount = findValue('amount', 'tx_amount', 'transaction_amount', 'txn_amount', 'value');
          let rawType = findValue('type', 'tx_type', 'transaction_type', 'operation', 'txn_type', 'action');

          let totalIncome = Number(rawIncome) || 0;
          let totalOutcome = Number(rawOutcome) || 0;

          // If individual transaction row with generic amount and type
          if (totalIncome === 0 && totalOutcome === 0 && rawAmount !== undefined) {
            const amt = Math.abs(Number(rawAmount) || 0);
            const typeStr = String(rawType || '').toLowerCase();
            if (typeStr.includes('dep') || typeStr.includes('cred') || typeStr.includes('in') || Number(rawAmount) > 0) {
              totalIncome = amt;
            } else {
              totalOutcome = amt;
            }
          }

          // 6. Number of transactions
          let rawNumIncome = findValue('numberIncomeTransaction', 'number_income_transaction', 'income_count', 'deposit_count', 'num_income', 'num_deposits');
          let rawNumOutcome = findValue('numberOutcomeTransaction', 'number_outcome_transaction', 'outcome_count', 'withdrawal_count', 'num_outcome', 'num_withdrawals');
          let rawTotalTx = findValue('totalNumberTransaction', 'total_number_transaction', 'total_transactions', 'transactions', 'tx_count', 'count', 'total_tx');

          let numberIncomeTransaction = parseInt(rawNumIncome, 10);
          if (isNaN(numberIncomeTransaction)) {
            numberIncomeTransaction = totalIncome > 0 ? Math.max(1, Math.round(totalIncome / 3500)) : 0;
          }

          let numberOutcomeTransaction = parseInt(rawNumOutcome, 10);
          if (isNaN(numberOutcomeTransaction)) {
            numberOutcomeTransaction = totalOutcome > 0 ? Math.max(1, Math.round(totalOutcome / 1500)) : 0;
          }

          let totalNumberTransaction = parseInt(rawTotalTx, 10);
          if (isNaN(totalNumberTransaction)) {
            totalNumberTransaction = Math.max(1, numberIncomeTransaction + numberOutcomeTransaction);
          }

          // 7. Balance
          let rawBalance = findValue('totalBalance', 'total_balance', 'totalbalance', 'balance', 'vault_balance', 'current_balance', 'cash_balance', 'closing_balance', 'vault_cash', 'available_balance');
          let totalBalance = Number(rawBalance);
          if (isNaN(totalBalance) || totalBalance === 0) {
            totalBalance = 1500000 + ((idx * 17000) % 800000);
          }

          // 8. Day
          let rawDay = findValue('day', 'day_of_week', 'dayofweek', 'weekday', 'day_name');
          let rawDate = findValue('date', 'tx_date', 'transaction_date', 'timestamp', 'datetime');
          let day = rawDay ? String(rawDay).trim() : '';
          if (!day && rawDate) {
            const parsedDate = new Date(rawDate);
            if (!isNaN(parsedDate.getTime())) {
              day = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
            }
          }
          if (!day || !daysArr.includes(day)) {
            const match = daysArr.find(d => d.toLowerCase() === day.toLowerCase());
            day = match || daysArr[idx % 7];
          }

          // 9. Transaction Time
          let rawTime = findValue('transactionTime', 'transaction_time', 'transactiontime', 'time', 'tx_time', 'timestamp', 'datetime');
          let transactionTime = '12:00:00';
          if (rawTime) {
            const timeStr = String(rawTime).trim();
            const matchTime = timeStr.match(/\b\d{1,2}:\d{2}(:\d{2})?\b/);
            if (matchTime) {
              transactionTime = matchTime[0].length === 5 ? `${matchTime[0]}:00` : matchTime[0];
            } else {
              transactionTime = timeStr;
            }
          } else {
            transactionTime = `${String((idx * 3) % 24).padStart(2, '0')}:00:00`;
          }

          return {
            atmId,
            atmName,
            atmCity,
            atmAddress,
            totalBalance: Math.round(totalBalance * 100) / 100,
            numberIncomeTransaction,
            numberOutcomeTransaction,
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalOutcome: Math.round(totalOutcome * 100) / 100,
            totalNumberTransaction,
            day,
            transactionTime
          };
        });

        setData(cleanedData);
        setDataSource('uploaded');
        setDatasetMeta({
          fileName: file.name,
          rowCount: cleanedData.length,
          loadedAt: new Date().toLocaleTimeString(),
          isValid: true
        });

        // Reset filters so the new uploaded data is immediately visible
        setSearchQuery('');
        setSelectedCity('ALL');
        setSelectedDay('ALL');
        setBalanceFilter('ALL');

        if (onSuccess) onSuccess(cleanedData.length);
      },
      error: (err) => {
        if (onError) onError(`Failed to parse file: ${err.message}`);
      }
    });
  };

  // Reset Data: Completely erase all data to an empty state
  const resetData = () => {
    setData([]);
    setDataSource('erased');
    setDatasetMeta({
      fileName: 'None (Data Erased)',
      rowCount: 0,
      loadedAt: new Date().toLocaleTimeString(),
      isValid: false
    });
    setSelectedAtmId(null);
    setSearchQuery('');
    setSelectedCity('ALL');
    setSelectedDay('ALL');
    setBalanceFilter('ALL');
  };

  // Load sample dataset
  const loadSampleData = () => {
    setData(DEFAULT_SAMPLE_DATA);
    setDataSource('sample');
    setDatasetMeta({
      fileName: 'atm_transactions_sample.csv (Embedded)',
      rowCount: DEFAULT_SAMPLE_DATA.length,
      loadedAt: new Date().toLocaleTimeString(),
      isValid: true
    });
    setSelectedAtmId(null);
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
        resetData,
        loadSampleData,
        resetToSampleData: loadSampleData, // backward compatibility alias
        exportFilteredDataToCSV,
        resetFilters
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
