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
        
        // Define colors based on child and active state
        let colorClasses = '';
        if (isActive) {
          // Active button colors: pink for Luiza, blue for Miguel
          colorClasses = isLuiza
            ? 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-lg scale-105'
            : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg scale-105';
        } else {
          // Inactive button colors: gray for both
          colorClasses = 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:scale-105';
        }
        
        return (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition-all ${colorClasses}`}
          >
            {isLuiza ? '👧' : '👦'} {child.name}
          </button>
        );
      })}
    </div>
  );
}
