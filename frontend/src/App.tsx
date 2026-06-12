import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

interface NotationRow {
  id: string;
  type: 'header' | 'notation';
  content?: string;
  cells?: string[];
}

interface TaalConfig {
  name: string;
  beats: number;
  bols: string[];
  markers: string[];
}

const TAALS: Record<string, TaalConfig> = {
  teental: {
    name: 'Teental',
    beats: 16,
    bols: ['धा', 'धिन', 'धिन', 'धा', 'धा', 'धिन', 'धिन', 'धा', 'धा', 'तिन', 'तिन', 'ता', 'ता', 'धिन', 'धिन', 'धा'],
    markers: ['x', '', '', '', '2', '', '', '', '0', '', '', '', '3', '', '', '']
  },
  dadra: {
    name: 'Dadra',
    beats: 6,
    bols: ['धा', 'धी', 'ना', 'धा', 'ती', 'ना'],
    markers: ['x', '', '', '0', '', '']
  },
  keherwa: {
    name: 'Keherwa',
    beats: 8,
    bols: ['धा', 'गे', 'ना', 'तिं', 'ना', 'क', 'धिं', 'ना'],
    markers: ['x', '', '', '', '0', '', '', '']
  },
  jhaptaal: {
    name: 'Jhaptaal',
    beats: 10,
    bols: ['धी', 'ना', 'धी', 'धी', 'ना', 'ती', 'ना', 'धी', 'धी', 'ना'],
    markers: ['x', '', '2', '', '', '0', '', '3', '', '']
  },
  ektaal: {
    name: 'Ektaal',
    beats: 12,
    bols: ['धिं', 'धिं', 'धा', 'गे', 'ति', 'रक', 'टूं', 'ना', 'क', 'ता', 'धा', 'गे'],
    markers: ['x', '', '0', '', '2', '', '0', '', '3', '', '4', '']
  },
  rupak: {
    name: 'Rupak',
    beats: 7,
    bols: ['ती', 'ती', 'ना', 'धी', 'ना', 'धी', 'ना'],
    markers: ['0', '', '', '2', '', '3', ''] // Rupak uniquely begins on a Khali/0
  },
  chautaal: {
    name: 'Chautaal',
    beats: 12,
    bols: ['धा', 'धा', 'दिन', 'ता', 'किट', 'धा', 'दिन', 'ता', 'तिट', 'कत', 'गदि', 'गन'],
    markers: ['x', '', '0', '', '2', '', '0', '', '3', '', '4', '']
  },
  dhamar: {
    name: 'Dhamar',
    beats: 14,
    bols: ['क', 'धि', 'ट', 'धि', 'ट', 'धा', 'आ', 'ग', 'ति', 'ट', 'ति', 'ट', 'ता', 'आ'],
    markers: ['x', '', '', '', '2', '', '', '0', '', '', '', '3', '', '']
  },
  deepchandi: {
    name: 'Deepchandi',
    beats: 14,
    bols: ['धा', 'धिन', 'धा', 'धा', 'धिन', 'ता', 'तिन', 'धा', 'धा', 'धिन'], 
    markers: ['x', '', '', '2', '', '', '0', '', '', '3', '', '', '', ''] // Often played with spaces/rests
  },
  tilwada: {
    name: 'Tilwada',
    beats: 16,
    bols: ['धा', 'तिरकिट', 'धिन', 'धिन', 'धा', 'धा', 'तिन', 'तिन', 'ता', 'तिरकिट', 'धिन', 'धिन', 'धा', 'धा', 'धिन', 'धिन'],
    markers: ['x', '', '', '', '2', '', '', '', '0', '', '', '', '3', '', '', '']
  },
  sultaal: {
    name: 'Sultaal',
    beats: 10,
    bols: ['धा', 'धा', 'दिन', 'ता', 'किट', 'धा', 'तिट', 'कत', 'गदि', 'गन'],
    markers: ['x', '', '0', '', '2', '', '3', '', '0', '']
  },
  roopakVariatkhamsa: { // Often referred to as Pancham Sawari
    name: 'Pancham Sawari',
    beats: 15,
    bols: ['धी', 'ना', 'धी', 'धी', 'ना', 'धी', 'धी', 'ना', 'धी', 'धी', 'ना', 'ता', 'ता', 'धी', 'ना'],
    markers: ['x', '', '', '2', '', '', '', '3', '', '', '', '0', '', '4', '']
  },
  adaChautaal: {
    name: 'Ada Chautaal',
    beats: 14,
    bols: ['धिन', 'धिं', 'धा', 'गे', 'ति', 'रक', 'किट', 'तक', 'ता', 'तिं', 'ता', 'के', 'ति', 'रक'],
    markers: ['x', '', '2', '', '0', '', '3', '', '0', '', '4', '', '5', '']
  },
  mattataal: {
    name: 'Matta Taal',
    beats: 9,
    bols: ['धा', 'धिं', 'न', 'ता', 'तिं', 'न', 'धिन', 'धिन', 'धा'],
    markers: ['x', '', '2', '', '0', '', '3', '', '']
  },
  gajajhampa: {
    name: 'Gajajhampa',
    beats: 15,
    bols: ['धा', 'धिं', 'न', 'ता', 'किट', 'तक', 'गा', 'दि', 'ग', 'न', 'धा', 'तिं', 'न', 'ता', 'ता'],
    markers: ['x', '', '', '2', '', '', '3', '', '', '0', '', '', '4', '', '']
  },
  shikhar: {
    name: 'Shikhar Taal',
    beats: 17,
    bols: ['धा', 'दिं', 'ता', 'किट', 'धा', 'तिट', 'कत', 'गदि', 'गन', 'धा', 'धा', 'दिं', 'ता', 'किट', 'तक', 'ता', 'थुं'],
    markers: ['x', '', '', '2', '', '', '3', '', '', '0', '', '', '', '4', '', '', '']
  },
  brahmTaal: {
    name: 'Brahm Taal',
    beats: 28,
    bols: ['धा', 'धिन', 'ता', 'तिट', 'धा', 'गे', 'ना', 'तिं', 'ता', 'क', 'त्ता', 'धा', 'गे', 'तिं', 'ना', 'क', 'त्ता', 'थिं', 'ता', 'किट', 'तक', 'गदि', 'गन', 'धा', 'ता', 'क', 'त्ता', 'धा'],
    markers: ['x', '', '2', '', '3', '', '4', '', '5', '', '0', '', '6', '', '7', '', '8', '', '0', '', '9', '', '10', '', '0', '', '11', '']
  },
  pashto: { // Often played in Ghazals and semi-classical music
    name: 'Pashto',
    beats: 7,
    bols: ['तिं', 'तिं', 'ना', 'धिं', 'धा', 'गे', 'ना'],
    markers: ['x', '', '', '2', '', '0', '']
  },
  khemta: { // Fast 6-beat cyclic rhythm popular in folk and semi-classical
    name: 'Khemta',
    beats: 6,
    bols: ['धा', 'धिं', 'ना', 'ता', 'तिं', 'ना'],
    markers: ['x', '', '', '0', '', '']
  },
  jhumra: { // Elegant, slow 14-beat cycle mostly used in Vilambit Khayal
    name: 'Jhumra',
    beats: 14,
    bols: ['धिं', 'धा', 'तिरकिट', 'धिं', 'धिं', 'धा', 'गे', 'तिं', 'ता', 'तिरकिट', 'धिं', 'धिं', 'धा', 'गे'],
    markers: ['x', '', '', '2', '', '', '', '0', '', '', '3', '', '', '']
  },
  panchamSawari: { 
    name: 'Yat Taal', // Also known as Ektali variant in some regions
    beats: 8,
    bols: ['धा', 'धिन', 'ता', 'तित', 'ता', 'धिन', 'धा', 'धा'],
    markers: ['x', '', '', '', '0', '', '', '']
  }
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const App: React.FC = () => {
  const [title, setTitle] = useState('Classical Composition');
  const [selectedTaal, setSelectedTaal] = useState<string>('teental');
  const [fontSize, setFontSize] = useState<number>(12);
  const [rows, setRows] = useState<NotationRow[]>([
    { id: '1', type: 'header', content: '' },
    { id: '2', type: 'notation', cells: Array(TAALS['teental'].beats).fill('') }
  ]);
  const [activeCell, setActiveCell] = useState<{ rowId: string, cellIndex: number } | null>(null);
  const [currentNotationId, setCurrentNotationId] = useState<string | null>(null);
  const [view, setView] = useState<'editor' | 'library'>('editor');

  // Auth State
  const [user, setUser] = useState<string | null>(localStorage.getItem('username'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);
  const [isRecoverView, setIsRecoverView] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [secretQuestionInput, setSecretQuestionInput] = useState('');
  const [secretAnswerInput, setSecretAnswerInput] = useState('');
  const [savedNotations, setSavedNotations] = useState<any[]>([]);

  const taal = TAALS[selectedTaal];

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUser(null);
    setSavedNotations([]);
    setView('editor');
  }, []);

  const fetchSavedNotations = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/api/notations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSavedNotations(response.data);
    } catch (error) {
      console.error('Failed to fetch notations:', error);
    }
  }, [token]);

  const saveNotation = useCallback(async (silent = false) => {
    if (!token) {
      if (!silent) setShowAuthModal(true);
      return;
    }
    try {
      const payload: any = {
        title: title || 'Untitled Composition',
        rows,
        taal_key: selectedTaal
      };
      
      if (currentNotationId && currentNotationId !== 'null') {
        payload.id = parseInt(currentNotationId);
      }

      const response = await axios.post(`${API_URL}/api/notations`, payload, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.id) {
        setCurrentNotationId(response.data.id.toString());
      }
      
      if (!silent) alert('Notation saved successfully!');
      fetchSavedNotations();
    } catch (error: any) {
      console.error('Save failed details:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please login again to save your work.');
        handleLogout();
        setShowAuthModal(true);
      } else {
        if (!silent) alert(`Failed to save notation: ${error.response?.data?.msg || 'Check console for details'}`);
      }
    }
  }, [token, title, rows, selectedTaal, currentNotationId, fetchSavedNotations, handleLogout]);

  // Auto-save logic
  useEffect(() => {
    if (token && currentNotationId && view === 'editor') {
      const timer = setTimeout(() => {
        saveNotation(true); // silent save
      }, 3000); // 3 seconds debounce
      return () => clearTimeout(timer);
    }
  }, [rows, title, selectedTaal, token, currentNotationId, view, saveNotation]);

  useEffect(() => {
    if (token) {
      fetchSavedNotations();
    }
  }, [token, fetchSavedNotations]);

  useEffect(() => {
    setRows(prevRows => prevRows.map(row => {
      if (row.type === 'notation') {
        const newCells = [...(row.cells || [])];
        if (newCells.length < taal.beats) {
          return { ...row, cells: [...newCells, ...Array(taal.beats - newCells.length).fill('')] };
        } else if (newCells.length > taal.beats) {
          return { ...row, cells: newCells.slice(0, taal.beats) };
        }
      }
      return row;
    }));
  }, [selectedTaal, taal.beats]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRecoverView) {
        await axios.post(`${API_URL}/api/recover-password`, {
          username: usernameInput,
          secret_answer: secretAnswerInput,
          new_password: passwordInput
        });
        alert('Password reset successful! Please login.');
        setIsRecoverView(false);
        setIsLoginView(true);
        return;
      }

      const endpoint = isLoginView ? 'login' : 'signup';
      const payload: any = {
        username: usernameInput,
        password: passwordInput
      };
      if (!isLoginView) {
        payload.secret_question = secretQuestionInput;
        payload.secret_answer = secretAnswerInput;
      }

      const response = await axios.post(`${API_URL}/api/${endpoint}`, payload);

      if (isLoginView) {
        const { access_token, username } = response.data;
        localStorage.setItem('token', access_token);
        localStorage.setItem('username', username);
        setToken(access_token);
        setUser(username);
        setShowAuthModal(false);
        resetAuthForm();
      } else {
        alert('Signup successful! Please login.');
        setIsLoginView(true);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const msg = error.response?.data?.msg || error.message || 'Authentication failed';
      alert(msg);
    }
  };

  const resetAuthForm = () => {
    setUsernameInput('');
    setPasswordInput('');
    setSecretQuestionInput('');
    setSecretAnswerInput('');
  };

  const handleRecoverClick = async () => {
    if (!usernameInput) {
      alert('Please enter your username first');
      return;
    }
    try {
      const response = await axios.get(`${API_URL}/api/get-question/${usernameInput}`);
      setSecretQuestionInput(response.data.question);
      setIsRecoverView(true);
      setIsLoginView(false);
    } catch (error: any) {
      alert(error.response?.data?.msg || 'User not found');
    }
  };

  const loadNotation = (n: any) => {
    setCurrentNotationId(n.id.toString());
    setTitle(n.title);
    setSelectedTaal(n.taal_key);
    setRows(n.rows);
    setView('editor');
  };

  const renameNotation = async (id: number, newTitle: string) => {
    try {
      const notation = savedNotations.find(n => n.id === id);
      if (!notation) return;
      
      await axios.post(`${API_URL}/api/notations`, {
        id: id,
        title: newTitle,
        rows: notation.rows,
        taal_key: notation.taal_key
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSavedNotations();
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const deleteNotation = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this notation?')) return;
    try {
      await axios.delete(`${API_URL}/api/notations/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSavedNotations();
      if (currentNotationId === id.toString()) {
        setCurrentNotationId(null);
      }
    } catch (error) {
      alert('Failed to delete notation');
    }
  };

  const createNew = () => {
    setCurrentNotationId(null);
    setTitle('Classical Composition');
    setRows([
      { id: '1', type: 'header', content: 'Sthai' },
      { id: '2', type: 'notation', cells: Array(taal.beats).fill('') }
    ]);
    setView('editor');
  };

  const saptaks = {
    mandra: { label: 'Mandra (Lower)', notes: ['सा़', 'रे़', 'ग़', 'म़', 'प़', 'ध़', 'नि़'], komal: ['रे़॒', 'ग़॒', 'म़॑', 'ध़॒', 'नि़॒'] },
    madhya: { label: 'Madhya (Middle)', notes: ['सा', 'रे', 'ग', 'म', 'प', 'ध', 'नि'], komal: ['रे॒', 'ग॒', 'म॑', 'ध॒', 'नि॒'] },
    taar: { label: 'Taar (Higher)', notes: ['सां', 'रें', 'गं', 'मं', 'पं', 'धं', 'निं'], komal: ['रे॒ं', 'ग॒ं', 'म॑ं', 'ध॒ं', 'नि॒ं'] }
  };
  const others = ['-', '.', ' '];
  const keywords = ['Gat', 'Tana', 'Sthai', 'Antara', 'Tihaai', 'Mukhda', 'Bandish', 'Laya'];

  const addRow = (type: 'header' | 'notation', initialContent?: string) => {
    const newRow: NotationRow = {
      id: Date.now().toString(),
      type,
      content: initialContent || (type === 'header' ? '' : ''),
      cells: type === 'notation' ? Array(taal.beats).fill('') : undefined
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (id: string) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const updateHeader = (id: string, content: string) => {
    setRows(rows.map(row => row.id === id ? { ...row, content } : row));
  };

  const updateCell = (id: string, index: number, value: string) => {
    if (value.length > 10) return; 
    setRows(rows.map(row => {
      if (row.id === id && row.cells) {
        const newCells = [...row.cells];
        newCells[index] = value;
        return { ...row, cells: newCells };
      }
      return row;
    }));
  };

  const appendToActiveCell = (char: string) => {
    if (!activeCell) return;
    const inputId = `cell-${activeCell.rowId}-${activeCell.cellIndex}`;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    
    if (inputElement) {
      const start = inputElement.selectionStart || 0;
      const end = inputElement.selectionEnd || 0;
      const val = inputElement.value;
      const newVal = val.substring(0, start) + char + val.substring(end);
      
      if (newVal.length <= 10) {
        updateCell(activeCell.rowId, activeCell.cellIndex, newVal);
        setTimeout(() => {
          inputElement.focus();
          const newPos = start + char.length;
          inputElement.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  };

  const handleKeyClick = (e: React.MouseEvent, char: string) => {
    e.preventDefault();
    appendToActiveCell(char);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowId: string, cellIndex: number) => {
    const { selectionStart, selectionEnd, value } = e.currentTarget;
    const isAtStart = selectionStart === 0 && selectionEnd === 0;
    const isAtEnd = selectionStart === value.length && selectionEnd === value.length;

    const notationRows = rows.filter(r => r.type === 'notation');
    const currentRowIdx = notationRows.findIndex(r => r.id === rowId);

    let nextRowId = rowId;
    let nextCellIdx = cellIndex;
    let shouldPreventDefault = false;

    if (e.key === 'ArrowRight') {
      if (isAtEnd || value === '') {
        shouldPreventDefault = true;
        if (cellIndex < taal.beats - 1) {
          nextCellIdx = cellIndex + 1;
        } else if (currentRowIdx < notationRows.length - 1) {
          nextRowId = notationRows[currentRowIdx + 1].id;
          nextCellIdx = 0;
        }
      }
    } else if (e.key === 'ArrowLeft') {
      if (isAtStart || value === '') {
        shouldPreventDefault = true;
        if (cellIndex > 0) {
          nextCellIdx = cellIndex - 1;
        } else if (currentRowIdx > 0) {
          nextRowId = notationRows[currentRowIdx - 1].id;
          nextCellIdx = taal.beats - 1;
        }
      }
    } else if (e.key === 'ArrowDown') {
      shouldPreventDefault = true;
      if (currentRowIdx < notationRows.length - 1) {
        nextRowId = notationRows[currentRowIdx + 1].id;
      }
    } else if (e.key === 'ArrowUp') {
      shouldPreventDefault = true;
      if (currentRowIdx > 0) {
        nextRowId = notationRows[currentRowIdx - 1].id;
      }
    }

    if (shouldPreventDefault) {
      e.preventDefault();
      const nextElement = document.getElementById(`cell-${nextRowId}-${nextCellIdx}`);
      if (nextElement) {
        (nextElement as HTMLInputElement).focus();
        if (e.key === 'ArrowLeft') {
          setTimeout(() => {
            const el = nextElement as HTMLInputElement;
            el.setSelectionRange(el.value.length, el.value.length);
          }, 0);
        } else if (e.key === 'ArrowRight') {
          setTimeout(() => {
            const el = nextElement as HTMLInputElement;
            el.setSelectionRange(0, 0);
          }, 0);
        }
      }
    }
  };

  const exportData = async (format: 'txt' | 'docx' | 'pdf' | 'xlsx') => {
    try {
      const response = await axios.post(`${API_URL}/api/export/${format}`, {
        title,
        rows,
        taal_config: taal,
        font_size: fontSize
      }, { responseType: 'blob' });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title || 'notation'}.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Make sure the backend is running.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="top-bar">
          <div className="user-auth-section">
            {user ? (
              <div className="user-info">
                <span>Logged in as <strong>{user}</strong></span>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <button className="btn-login-main" onClick={() => setShowAuthModal(true)}>Login / Signup</button>
            )}
          </div>
        </div>
        <div className="header-top">
          <h1><span>𝄞</span> Marathi Notation Tool</h1>
          <div className="nav-buttons">
            <button className={`nav-btn ${view === 'editor' ? 'active' : ''}`} onClick={() => setView('editor')}>Editor</button>
            <button className={`nav-btn ${view === 'library' ? 'active' : ''}`} onClick={() => setView('library')}>Saved Work</button>
          </div>
          <div className="controls-group">
            <div className="taal-selector">
              <label>Select Rhythm (Taal)</label>
              <select value={selectedTaal} onChange={(e) => setSelectedTaal(e.target.value)}>
                {Object.entries(TAALS).map(([key, config]) => (
                  <option key={key} value={key}>{config.name} — {config.beats} Beats</option>
                ))}
              </select>
            </div>
            <div className="font-size-selector">
              <label>Export Font Size</label>
              <input 
                type="number" 
                value={fontSize} 
                onChange={(e) => setFontSize(parseInt(e.target.value) || 12)}
                min="8" max="24"
              />
            </div>
          </div>
        </div>
        {view === 'editor' && (
          <div className="header-bottom">
            <input className="title-input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Composition" />
            <div className="export-buttons">
              <button className="btn-save" onClick={() => saveNotation()}>Save Work</button>
              <button className="btn-export" onClick={() => exportData('pdf')}>Export PDF</button>
              <button className="btn-export" onClick={() => exportData('docx')}>Word Doc</button>
              <button className="btn-export" onClick={() => exportData('xlsx')}>Export Excel</button>
            </div>
          </div>
        )}
      </header>

      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAuthModal(false)}>×</button>
            <h2>{isRecoverView ? 'Recover Password' : (isLoginView ? 'Login' : 'Sign Up')}</h2>
            <form onSubmit={handleAuth}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={usernameInput} 
                  onChange={(e) => setUsernameInput(e.target.value)} 
                  required 
                  placeholder="Enter username"
                />
              </div>

              {!isRecoverView && (
                <div className="form-group">
                  <label>{isLoginView ? 'Password' : 'Create Password'}</label>
                  <input 
                    type="password" 
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)} 
                    required 
                    placeholder="Enter password"
                  />
                </div>
              )}

              {!isLoginView && !isRecoverView && (
                <>
                  <div className="form-group">
                    <label>Security Question (for recovery)</label>
                    <input 
                      type="text" 
                      value={secretQuestionInput} 
                      onChange={(e) => setSecretQuestionInput(e.target.value)} 
                      required 
                      placeholder="e.g. Your first school name?"
                    />
                  </div>
                  <div className="form-group">
                    <label>Security Answer</label>
                    <input 
                      type="text" 
                      value={secretAnswerInput} 
                      onChange={(e) => setSecretAnswerInput(e.target.value)} 
                      required 
                      placeholder="Enter answer"
                    />
                  </div>
                </>
              )}

              {isRecoverView && (
                <>
                  <div className="form-group recovery-question">
                    <label>Question: {secretQuestionInput}</label>
                  </div>
                  <div className="form-group">
                    <label>Security Answer</label>
                    <input 
                      type="text" 
                      value={secretAnswerInput} 
                      onChange={(e) => setSecretAnswerInput(e.target.value)} 
                      required 
                      placeholder="Enter answer"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)} 
                      required 
                      placeholder="Enter new password"
                    />
                  </div>
                </>
              )}

              <button type="submit" className="btn-submit">
                {isRecoverView ? 'Reset Password' : (isLoginView ? 'Login' : 'Create Account')}
              </button>
            </form>
            <div className="modal-footer-links">
              {isLoginView && (
                <>
                  <p className="modal-switch">Don't have an account? <span onClick={() => setIsLoginView(false)}>Sign Up</span></p>
                  <p className="modal-switch"><span onClick={handleRecoverClick}>Forgot Password?</span></p>
                </>
              )}
              {!isLoginView && !isRecoverView && (
                <p className="modal-switch">Already have an account? <span onClick={() => setIsLoginView(true)}>Login</span></p>
              )}
              {isRecoverView && (
                <p className="modal-switch">Back to <span onClick={() => { setIsRecoverView(false); setIsLoginView(true); }}>Login</span></p>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        {view === 'library' ? (
          <div className="library-view">
            <div className="library-header">
              <h2>My Saved Work Library</h2>
              <button className="btn-add-new" onClick={createNew}>+ Create New Notation</button>
            </div>
            <div className="table-container">
              <table className="saved-work-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Rhythm (Taal)</th>
                    <th>Created On</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedNotations.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign:'center', padding:'2rem'}}>No saved notations found. Start creating!</td></tr>
                  ) : (
                    savedNotations.map(n => (
                      <tr key={n.id} className="library-row">
                        <td className="title-cell">
                          <input 
                            className="table-title-input"
                            defaultValue={n.title}
                            onBlur={(e) => renameNotation(n.id, e.target.value)}
                            onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          />
                        </td>
                        <td>{TAALS[n.taal_key].name}</td>
                        <td>{n.created_at}</td>
                        <td>{n.updated_at}</td>
                        <td className="action-cell">
                          <button className="btn-load-table" onClick={() => loadNotation(n)}>Open</button>
                          <button className="btn-delete-table" onClick={() => deleteNotation(n.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <>
            <div className="notation-container">
              <div className="taal-header-pinned" style={{ gridTemplateColumns: `repeat(${taal.beats}, 1fr)` }}>
                {taal.bols.map((bol, i) => (
                  <div key={i} className="taal-header-cell">
                    <div className="beat-num">{i + 1}</div>
                    <div className="beat-bol lobster-regular">{bol}</div>
                    <div className="beat-marker lobster-regular">{taal.markers[i]}</div>
                  </div>
                ))}
              </div>

              <div className="rows-list">
                {rows.map((row) => (
                  <div key={row.id} className={`row-wrapper ${row.type}`}>
                    <button className="delete-row-btn" onClick={() => deleteRow(row.id)}>×</button>
                    {row.type === 'header' ? (
                      <input 
                        className="header-text-input" 
                        value={row.content} 
                        onChange={(e) => updateHeader(row.id, e.target.value)}
                        placeholder="Section Header (e.g. Gat ,Sthai, Antara)"
                      />
                    ) : (
                      <div className="notation-row-grid" style={{ gridTemplateColumns: `repeat(${taal.beats}, 1fr)` }}>
                        {row.cells?.map((cell, idx) => (
                          <input
                            key={idx}
                            id={`cell-${row.id}-${idx}`}
                            className="notation-cell-input"
                            value={cell}
                            onFocus={() => setActiveCell({ rowId: row.id, cellIndex: idx })}
                            onChange={(e) => updateCell(row.id, idx, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, row.id, idx)}
                            placeholder="-"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="toolbar">
              <div className="action-buttons">
                <button className="btn-add" onClick={() => addRow('header')}>+ Add Header</button>
                <button className="btn-add" onClick={() => addRow('notation')}>+ Add Notation Line</button>
              </div>
              <div className="keyword-bank">
                {keywords.map(k => (
                  <button key={k} className="keyword-btn" onClick={() => addRow('header', k)}>{k}</button>
                ))}
              </div>
            </div>

            <div className="virtual-keyboard">
              <div className="keyboard-header">
                <h3>Musical Notation Input</h3>
              </div>
              <div className="saptak-groups">
                {Object.entries(saptaks).map(([key, group]) => (
                  <div key={key} className="saptak-column">
                    <h4>{group.label}</h4>
                    <div className="chip-grid">
                      {group.notes.map(n => (
                        <button key={n} className="key-chip" onMouseDown={(e) => handleKeyClick(e, n)}>{n}</button>
                      ))}
                      {group.komal.map(n => (
                        <button key={n} className="key-chip komal" onMouseDown={(e) => handleKeyClick(e, n)}>{n}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="keyboard-footer">
                 <button className="key-chip other" onMouseDown={(e) => handleKeyClick(e, 'S')}>S</button>
                 {others.map(o => (
                   <button key={o} className="key-chip other" onMouseDown={(e) => handleKeyClick(e, o)}>
                     {o === ' ' ? 'Space' : o}
                   </button>
                 ))}
                 <button className="key-chip clear" onMouseDown={(e) => { e.preventDefault(); if (activeCell) updateCell(activeCell.rowId, activeCell.cellIndex, ''); }}>
                   Clear
                 </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
