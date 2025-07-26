import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import './LoadingScreen.css';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="loading-screen">
      <div className="loading-screen__content">
        <Loader2 className="loading-screen__icon loading-screen__icon--lg" />
        <p className="loading-screen__text">Loading...</p>
      </div>
    </div>
  );
};

