import React, { useState, useEffect } from 'react';
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
    bols: ['धा', 'धिन्', 'धिन्', 'धा', 'धा', 'धिन्', 'धिन्', 'धा', 'धा', 'तिन्', 'तिन्', 'ता', 'ता', 'धिन्', 'धिन्', 'धा'],
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
    bols: ['धिं', 'धिं', 'धा', 'गे', 'ति' , 'रक' , 'टूं' , 'ना' , 'क' , 'ता' , 'धा' , 'गे'],
    markers: ['x', '', '0', '', '2', '', '0', '', '3', '', '4', '']
  }
};

const App: React.FC = () => {
  const [title, setTitle] = useState('Classical Composition');
  const [selectedTaal, setSelectedTaal] = useState<string>('teental');
  const [rows, setRows] = useState<NotationRow[]>([
    { id: '1', type: 'header', content: 'Sthai' },
    { id: '2', type: 'notation', cells: Array(TAALS['teental'].beats).fill('') }
  ]);
  const [activeCell, setActiveCell] = useState<{ rowId: string, cellIndex: number } | null>(null);

  const taal = TAALS[selectedTaal];

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
        // Put focus back and restore cursor position
        setTimeout(() => {
          inputElement.focus();
          const newPos = start + char.length;
          inputElement.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
  };

  const handleKeyClick = (e: React.MouseEvent, char: string) => {
    e.preventDefault(); // Prevent focus loss from input
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
        // Optionally select text or place cursor at appropriate end
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

  const exportData = async (format: 'txt' | 'docx' | 'pdf') => {
    try {
      const response = await axios.post(`http://localhost:5000/api/export/${format}`, {
        title,
        rows,
        taal_config: taal
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
        <div className="header-top">
          <h1><span>𝄞</span> Marathi Notation Tool</h1>
          <div className="taal-selector">
            <label>Select Rhythm (Taal)</label>
            <select value={selectedTaal} onChange={(e) => setSelectedTaal(e.target.value)}>
              {Object.entries(TAALS).map(([key, config]) => (
                <option key={key} value={key}>{config.name} — {config.beats} Beats</option>
              ))}
            </select>
          </div>
        </div>
        <div className="header-bottom">
          <input className="title-input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Untitled Composition" />
          <div className="export-buttons">
            <button className="btn-export" onClick={() => exportData('pdf')}>Export PDF</button>
            <button className="btn-export" onClick={() => exportData('docx')}>Word Doc</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="notation-container">
          <div className="taal-header-pinned" style={{ gridTemplateColumns: `repeat(${taal.beats}, 1fr)` }}>
            {taal.bols.map((bol, i) => (
              <div key={i} className="taal-header-cell">
                <div className="beat-num">{i + 1}</div>
                <div className="beat-bol">{bol}</div>
                <div className="beat-marker">{taal.markers[i]}</div>
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
                    placeholder="Section Header (e.g. Sthai, Antara)"
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
             {others.map(o => (
               <button key={o} className="key-chip other" onMouseDown={(e) => handleKeyClick(e, o)}>
                 {o === ' ' ? 'Space' : o}
               </button>
             ))}
             <button className="key-chip clear" onMouseDown={(e) => { e.preventDefault(); if (activeCell) updateCell(activeCell.rowId, activeCell.cellIndex, ''); }}>
               Clear Cell
             </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
