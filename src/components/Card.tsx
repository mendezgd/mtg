
import React from 'react';

interface CardProps {
  card: string;
  style: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ card, style }) => {
  return (
    <div style={style}>
      {card}
    </div>
  );
};
