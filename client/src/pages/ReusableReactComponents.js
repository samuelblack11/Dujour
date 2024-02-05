// ReusableReactComponents.js
import React from 'react';

export const GenericTable = ({ data, columns, handleEditClick, deleteCargo }) => {
  console.log("Data in GenericTable:", data);
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.accessor}>{column.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((column) => (
              <td key={`${rowIndex}-${column.accessor}`}>
                {column.Cell 
                  ? column.Cell({ row, handleEditClick, deleteCargo }) 
                  : row[column.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const GenericPopup = ({ show, children, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="popup">
      <div className="popup-inner">
        {children}
        <button className="delete-btn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};
