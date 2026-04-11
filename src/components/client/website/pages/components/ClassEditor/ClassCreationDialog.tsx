import { useState } from "react";
import { useClassRegistryStore } from "@/stores/useClassRegistryStore";
import type { ClassProperties } from "@/stores/useClassRegistryStore";

interface ClassCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  websiteId: string;
  currentComputedValues?: ClassProperties;
  onClassCreated?: (classId: string) => void;
}

export function ClassCreationDialog({
  isOpen,
  onClose,
  websiteId,
  currentComputedValues,
  onClassCreated,
}: ClassCreationDialogProps) {
  const [className, setClassName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { createClass, validateClassName } = useClassRegistryStore();

  const handleCreate = async () => {
    setError(null);

    // Validate class name
    if (!className.trim()) {
      setError("Class name is required");
      return;
    }

    if (!validateClassName(className)) {
      setError(
        "Invalid class name. Must start with a letter or underscore, and contain only letters, numbers, hyphens, and underscores (max 50 characters)",
      );
      return;
    }

    setIsCreating(true);

    try {
      const newClass = await createClass(websiteId, {
        name: className,
        description: description.trim() || undefined,
        type: "custom",
        is_system: false,
        properties: currentComputedValues || {},
      });

      // Notify parent component
      if (onClassCreated) {
        onClassCreated(newClass.id);
      }

      // Reset form and close
      setClassName("");
      setDescription("");
      setError(null);
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create class";
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setClassName("");
    setDescription("");
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">Create New Class</h2>

        <div className="space-y-4">
          {/* Class Name Input */}
          <div>
            <label
              htmlFor="className"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Class Name <span className="text-red-500">*</span>
            </label>
            <input
              id="className"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g., centered-column"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
            <p className="text-xs text-gray-500 mt-1">
              Letters, numbers, hyphens, and underscores only
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this class is for..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isCreating}
            />
          </div>

          {/* Info about initialization */}
          {currentComputedValues && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                The new class will be initialized with the current computed
                values from your active class stack.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Class"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
