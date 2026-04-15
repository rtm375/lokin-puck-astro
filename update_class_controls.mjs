import fs from 'fs';

const filePath = 'src/components/client/website/pages/editor/puck/blocks/shared/ClassControls.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newEdgeInput = `const EdgeInput = ({ edge, icon, type, values, disabled, locked, onChange, parseValueUnit }: any) => {
  const propName = \`\${type}\${edge.charAt(0).toUpperCase() + edge.slice(1)}\`;
  const val = values?.[propName] || "";
  const { value: num, unit } = parseValueUnit(val, "px");
  const isBound = isVariableRef(String(val));

  const handleEdgeChange = (newVal: string) => {
    if (disabled || isBound) return;
    if (locked) {
      onChange({
        [\`\${type}Top\`]: newVal,
        [\`\${type}Right\`]: newVal,
        [\`\${type}Bottom\`]: newVal,
        [\`\${type}Left\`]: newVal,
      });
    } else {
      onChange({ ...values, [propName]: newVal });
    }
  };

  return (
    <div className={\`flex items-center bg-white border \${isBound ? 'border-primary/30 bg-primary/5' : 'border-neutral-200 focus-within:border-neutral-400'} rounded overflow-hidden group transition-colors\`}>
      <div className={\`w-6 h-7 flex items-center justify-center border-r \${isBound ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-400 group-hover:text-primary'} transition-colors relative\`}>
        <Icon icon={icon} width={12} className={isBound ? "opacity-50" : ""} />
      </div>
      {isBound ? (
        <div className="w-full h-7 text-xs px-1.5 flex items-center text-primary font-medium truncate" title={String(val)}>
          var
        </div>
      ) : (
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleEdgeChange(e.target.value === "" ? "" : \`\${e.target.value}\${unit || 'px'}\`)}
          className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
          placeholder="0"
        />
      )}
    </div>
  );
};`;

const newClassSpacingControl = `export const ClassSpacingControl = ({ label, type, values, onChange, disabled, cssProperties }: { label: React.ReactNode, type: 'margin' | 'padding', values: any, onChange: (v: any) => void, disabled?: boolean, cssProperties?: any }) => {
  const [locked, setLocked] = useState(true);

  const propTop = \`\${type}Top\`;
  const valTop = values?.[propTop];

  const handleBindingChange = (newVal: string) => {
    if (locked) {
      onChange({
        [\`\${type}Top\`]: newVal,
        [\`\${type}Right\`]: newVal,
        [\`\${type}Bottom\`]: newVal,
        [\`\${type}Left\`]: newVal,
      });
    } else {
      onChange({
        ...values,
        [\`\${type}Top\`]: newVal,
        [\`\${type}Right\`]: newVal,
        [\`\${type}Bottom\`]: newVal,
        [\`\${type}Left\`]: newVal,
      });
    }
  };

  return (
    <div className={\`flex flex-col gap-1 w-full mt-1 \${disabled ? 'opacity-60 pointer-events-none' : ''}\`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <div className="flex items-center gap-1">
          <VariableBindingButton cssProperty={cssProperties?.top} value={valTop} onChange={handleBindingChange} disabled={disabled} />
          <button
            onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
            disabled={disabled}
            className={\`p-1 rounded transition-all \${locked ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-neutral-100'}\`}
          >
            <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={12} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <EdgeInput edge="top" icon="lucide:arrow-up-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="right" icon="lucide:arrow-right-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="bottom" icon="lucide:arrow-down-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        <EdgeInput edge="left" icon="lucide:arrow-left-to-line" type={type} values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
      </div>
    </div>
  );
};`;

const newGapInput = `const GapInput = ({ prop, icon, title, values, disabled, locked, onChange, parseValueUnit }: any) => {
  const val = values?.[prop] || "";
  const { value: num, unit } = parseValueUnit(val, "px");
  const isBound = isVariableRef(String(val));

  const handleGapChange = (newVal: string) => {
    if (disabled || isBound) return;
    if (locked) {
      onChange({ rowGap: newVal, columnGap: newVal });
    } else {
      onChange({ ...values, [prop]: newVal });
    }
  };

  return (
    <div className={\`flex items-center bg-white border \${isBound ? 'border-primary/30 bg-primary/5' : 'border-neutral-200 focus-within:border-neutral-400'} rounded overflow-hidden group transition-colors\`}>
      <div className={\`w-6 h-7 flex items-center justify-center border-r \${isBound ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-neutral-50 border-neutral-200 text-neutral-400 group-hover:text-primary'} transition-colors relative\`} title={title}>
        <Icon icon={icon} width={12} className={isBound ? "opacity-50" : ""} />
      </div>
      {isBound ? (
        <div className="w-full h-7 text-xs px-1.5 flex items-center text-primary font-medium truncate" title={String(val)}>
          var
        </div>
      ) : (
        <input
          type="number"
          value={num}
          disabled={disabled}
          onChange={(e) => handleGapChange(e.target.value === "" ? "" : \`\${e.target.value}\${unit || 'px'}\`)}
          className="w-full min-w-0 h-7 text-xs px-1.5 outline-none bg-transparent"
          placeholder="0"
        />
      )}
    </div>
  );
};`;

const newClassGapControl = `export const ClassGapControl = ({ label, values, onChange, disabled, cssProperties }: any) => {
  const [locked, setLocked] = useState(true);

  const valRow = values?.rowGap;

  const handleBindingChange = (newVal: string) => {
    if (locked) {
      onChange({
        rowGap: newVal,
        columnGap: newVal,
      });
    } else {
      onChange({
        ...values,
        rowGap: newVal,
        columnGap: newVal,
      });
    }
  };

  return (
    <div className={\`flex flex-col gap-1 w-full mt-1 \${disabled ? 'opacity-60 pointer-events-none' : ''}\`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-neutral-700">{label}</span>
        <div className="flex items-center gap-1">
          <VariableBindingButton cssProperty={cssProperties?.rowGap} value={valRow} onChange={handleBindingChange} disabled={disabled} />
          <button
            onClick={(e) => { e.preventDefault(); if (!disabled) setLocked(!locked); }}
            disabled={disabled}
            className={\`p-1 rounded transition-all \${locked ? 'bg-primary/10 text-primary' : 'text-neutral-400 hover:bg-neutral-100'}\`}
          >
            <Icon icon={locked ? "lucide:link" : "lucide:unlink"} width={12} />
          </button>
        </div>
      </div>
      <div className="flex gap-1.5">
        <div className="flex-1">
          <GapInput prop="rowGap" icon="lucide:rows" title="Row Gap" values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        </div>
        <div className="flex-1">
          <GapInput prop="columnGap" icon="lucide:columns" title="Column Gap" values={values} disabled={disabled} locked={locked} onChange={onChange} parseValueUnit={parseValueUnit} />
        </div>
      </div>
    </div>
  );
};`;

content = content.replace(/const EdgeInput = \(\{ edge, icon, type, values, disabled, locked, onChange, parseValueUnit, cssProperty \}: any\) => \{[\s\S]*?<\/[div]*>\s*?\);\n\};/, newEdgeInput);

content = content.replace(/export const ClassSpacingControl = \(\{ label, type, values, onChange, disabled, cssProperties \}: \{ label: React.ReactNode, type: 'margin' \| 'padding', values: any, onChange: \(v: any\) => void, disabled\?: boolean, cssProperties\?: any \}\) => \{[\s\S]*?<\/[div]*>\s*?\);\n\};/, newClassSpacingControl);

content = content.replace(/const GapInput = \(\{ prop, icon, title, values, disabled, locked, onChange, parseValueUnit, cssProperty \}: any\) => \{[\s\S]*?<\/[div]*>\s*?\);\n\};/, newGapInput);

content = content.replace(/export const ClassGapControl = \(\{ label, values, onChange, disabled, cssProperties \}: any\) => \{[\s\S]*?<\/[div]*>\s*?\);\n\};/, newClassGapControl);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Modified ClassControls.tsx successfully');
