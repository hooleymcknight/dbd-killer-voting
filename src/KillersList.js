import './display.css';
import data from './bot/tools/voting/killers.json'
import { useState, useEffect } from 'react';

export default function KillersList() {
  const [list, setList] = useState(data)

  useEffect(() => {
    if (list !== data) {
      setList(data)
    }
  }, [list])

  return (
    <div className="killers-list">
      {Object.keys(data).map(killer => 
        <p id={killer}>{killer} - <span class="voter">{data[killer]}</span></p>
      )}
    </div>
  )
}
