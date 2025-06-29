import React from 'react';

interface LegendProps {
  categories: string[];
  colorScale: (category: string) => string;
}

const Legend: React.FC<LegendProps> = ({ categories, colorScale }) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, }}>
      {categories.map((cat) => (
        <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            background: colorScale(cat),
            borderRadius: 3,
            marginRight: 6,
            border: '1px solid #ccc'
          }} />
          <span style={{ fontSize: 13 }}>{cat}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
