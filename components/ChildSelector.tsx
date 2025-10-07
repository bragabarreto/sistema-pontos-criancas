'use client';

interface ChildSelectorProps {
  childrenList: any[];
  currentChild: number | null;
  onSelectChild: (childId: number) => void;
}

export function ChildSelector({ childrenList, currentChild, onSelectChild }: ChildSelectorProps) {
  // Ensure childrenList is an array to prevent .map errors
  const childrenArray = Array.isArray(childrenList) ? childrenList : [];
  
  return (
    <div className="flex gap-4 mb-6">
      {childrenArray.map((child) => {
        const isActive = currentChild === child.id;
        const isLuiza = child.name === 'Luiza';
        
        // Active button: pink for Luiza, blue for Miguel
        // Inactive button: gray
        const buttonClass = isActive
          ? isLuiza
            ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg scale-105'
            : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg scale-105'
          : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:opacity-80';
        
        return (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${buttonClass}`}
          >
            {child.name === 'Luiza' ? '👧' : '👦'} {child.name}
          </button>
        );
      })}
    </div>
  );
}
