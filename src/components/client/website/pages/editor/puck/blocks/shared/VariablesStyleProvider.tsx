import React from 'react';
import { useVariablesStore } from '@/stores/useVariablesStore';
import { generateVariablesCSS } from '../../../core/css-engine';

export const VariablesStyleProvider: React.FC = () => {
  const { variables } = useVariablesStore();
  
  const css = generateVariablesCSS(variables);

  return (
    <style dangerouslySetInnerHTML={{ __html: css }} />
  );
};
