import React from 'react';
import { useVariablesStore } from '@/stores/useVariablesStore';
import { generateVariablesCSS } from '../../../core/css-engine';

export const VariablesStyleProvider: React.FC = () => {
  const { draftVariables } = useVariablesStore();
  
  const css = generateVariablesCSS(draftVariables || []);

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
};
