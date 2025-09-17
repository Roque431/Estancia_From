import React from 'react';
import Icon from '../atoms/Icon';

const Table = ({ 
  columns, 
  data, 
  className = '',
  emptyMessage = 'No hay datos disponibles'
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className="px-4 py-6 text-left font-bold text-sm uppercase tracking-wide"
                >
                  <div className="flex items-center gap-2">
                    {column.icon && <Icon name={column.icon} size={16} />}
                    {column.label}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length} 
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-4">
                    <Icon name="FileX" size={48} className="opacity-50" />
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  className="border-b border-gray-200 hover:bg-blue-50 transition-all duration-300 hover:scale-[1.002]"
                >
                  {columns.map((column, colIndex) => (
                    <td 
                      key={colIndex}
                      className="px-4 py-5 text-gray-900 align-middle"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;

