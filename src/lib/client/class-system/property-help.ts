/**
 * Help text and tooltips for class system properties
 * Provides inline documentation for designers
 */

export interface PropertyHelp {
  label: string;
  description: string;
  tooltip?: string;
  inheritanceNote?: string;
}

export const PROPERTY_HELP: Record<string, PropertyHelp> = {
  // ============================================================================
  // Flex Layout Properties
  // ============================================================================
  flexDirection: {
    label: "Direction",
    description: "Sets the direction of flex items",
    tooltip: "Controls whether items flow horizontally (row) or vertically (column)",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  justifyContent: {
    label: "Justify Content",
    description: "Aligns items along the main axis",
    tooltip: "Controls spacing and alignment of items in the primary direction",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  alignItems: {
    label: "Align Items",
    description: "Aligns items along the cross axis",
    tooltip: "Controls alignment perpendicular to the main direction",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  flexWrap: {
    label: "Wrap",
    description: "Controls whether items wrap to new lines",
    tooltip: "When enabled, items will wrap to multiple lines if needed",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  gap: {
    label: "Gap",
    description: "Space between flex items",
    tooltip: "Sets equal spacing between all items (both row and column)",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  rowGap: {
    label: "Row Gap",
    description: "Space between rows",
    tooltip: "Sets spacing between rows when items wrap",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  columnGap: {
    label: "Column Gap",
    description: "Space between columns",
    tooltip: "Sets spacing between columns",
    inheritanceNote: "Inherited from previous classes in the stack",
  },

  // ============================================================================
  // Grid Layout Properties
  // ============================================================================
  gridTemplateColumns: {
    label: "Columns",
    description: "Defines the column structure",
    tooltip: "Use values like 'repeat(3, 1fr)' for equal columns or '200px 1fr' for mixed",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  gridTemplateRows: {
    label: "Rows",
    description: "Defines the row structure",
    tooltip: "Use values like 'auto' for content-based or '100px' for fixed heights",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  gridGap: {
    label: "Gap",
    description: "Space between grid items",
    tooltip: "Sets equal spacing between all grid cells",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  gridRowGap: {
    label: "Row Gap",
    description: "Space between grid rows",
    tooltip: "Sets spacing between rows in the grid",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  gridColumnGap: {
    label: "Column Gap",
    description: "Space between grid columns",
    tooltip: "Sets spacing between columns in the grid",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  justifyItems: {
    label: "Justify Items",
    description: "Aligns items horizontally within cells",
    tooltip: "Controls horizontal alignment of items inside grid cells",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  alignContent: {
    label: "Align Content",
    description: "Aligns the grid within the container",
    tooltip: "Controls how the entire grid is positioned when there's extra space",
    inheritanceNote: "Inherited from previous classes in the stack",
  },

  // ============================================================================
  // Common Properties
  // ============================================================================
  width: {
    label: "Width",
    description: "Sets the width of the container",
    tooltip: "Use values like '100%', '500px', or 'auto'",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  minWidth: {
    label: "Min Width",
    description: "Sets the minimum width",
    tooltip: "Container won't shrink below this width",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  maxWidth: {
    label: "Max Width",
    description: "Sets the maximum width",
    tooltip: "Container won't grow beyond this width",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  height: {
    label: "Height",
    description: "Sets the height of the container",
    tooltip: "Use values like '100%', '500px', or 'auto'",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  minHeight: {
    label: "Min Height",
    description: "Sets the minimum height",
    tooltip: "Container won't shrink below this height",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  maxHeight: {
    label: "Max Height",
    description: "Sets the maximum height",
    tooltip: "Container won't grow beyond this height",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  margin: {
    label: "Margin",
    description: "Space outside the container",
    tooltip: "Creates space between this container and surrounding elements",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  padding: {
    label: "Padding",
    description: "Space inside the container",
    tooltip: "Creates space between the container edge and its content",
    inheritanceNote: "Inherited from previous classes in the stack",
  },

  // ============================================================================
  // Background and Border Properties
  // ============================================================================
  backgroundColor: {
    label: "Background Color",
    description: "Sets the background color",
    tooltip: "Use hex colors (#ffffff), rgb(255,255,255), or color names",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  borderRadius: {
    label: "Border Radius",
    description: "Rounds the corners",
    tooltip: "Use values like '8px' for rounded corners or '50%' for circles",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  borderWidth: {
    label: "Border Width",
    description: "Sets the border thickness",
    tooltip: "Use values like '1px', '2px', etc.",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
  borderColor: {
    label: "Border Color",
    description: "Sets the border color",
    tooltip: "Use hex colors (#000000), rgb values, or color names",
    inheritanceNote: "Inherited from previous classes in the stack",
  },
};

/**
 * Get help text for a property
 */
export function getPropertyHelp(property: string): PropertyHelp | undefined {
  return PROPERTY_HELP[property];
}

/**
 * General help text for class system concepts
 */
export const GENERAL_HELP = {
  classStack: {
    title: "Class Stack",
    description:
      "Classes are applied from left to right. Later classes override properties from earlier classes.",
    tooltip:
      "Drag and drop to reorder classes. The rightmost class has the highest priority.",
  },
  inheritance: {
    title: "Property Inheritance",
    description:
      "When editing a class, you see inherited values from previous classes in the stack.",
    tooltip:
      "Inherited values are shown in gray. Set a value to override it, or click reset to use the inherited value.",
  },
  variables: {
    title: "Variables",
    description:
      "Variables are reusable design tokens that update globally when changed.",
    tooltip:
      "Click the variable icon to use a variable instead of a custom value. Variables support light and dark themes.",
  },
  layoutClass: {
    title: "Layout Class",
    description:
      "Choose between Flex (flexible box) or Grid (two-dimensional) layout modes.",
    tooltip:
      "Only one layout class can be active at a time. Switching layout classes changes the available properties.",
  },
  responsive: {
    title: "Responsive Design",
    description:
      "Set different values for desktop, laptop, tablet, and mobile breakpoints.",
    tooltip:
      "Values cascade down: if mobile isn't set, it uses tablet, then laptop, then desktop.",
  },
};
