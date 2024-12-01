import React from 'react';
import Select from 'react-select';

const DataOrderFilter = ({ options, onChange, transform}) => {

    const formatOptionLabel = ({ value, label, color }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              backgroundColor: color,
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              marginRight: '8px',
            }}
          />
          <div>{label}</div>
        </div>
      );

    return (
        <foreignObject transform={transform} width="250" height="250">
            <Select
                options={options}
                isMulti={false}
                isClearable={true}
                onChange={onChange}
                // menuIsOpen={true}
                formatOptionLabel={formatOptionLabel}
            />
        </foreignObject>
    );
};

export default DataOrderFilter;