'use client';

interface ChildSelectorProps {
  children: any[];
  currentChild: number | null;
  onSelectChild: (childId: number) => void;
}

export function ChildSelector({ children, currentChild, onSelectChild }: ChildSelectorProps) {
  // Ensure children is an array to prevent .map errors
  const childrenArray = Array.isArray(children) ? children : [];
  
  return (
    <div className="flex gap-4 mb-6">
      {childrenArray.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelectChild(child.id)}
          className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
            currentChild === child.id
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg scale-105'
              : child.name === 'Luiza'
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:scale-105'
              : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:scale-105'
          }`}
        >
          {child.name === 'Luiza' ? '👧' : '👦'} {child.name}
        </button>
      ))}
    </div>
  );
}
