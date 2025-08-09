// Utility to clear all debug localStorage data
export function clearAllDebugData() {
  const keysToRemove = [
    'currentTreat',
    'treatData', 
    'editData',
    'previewData'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🧹 Cleared localStorage key: ${key}`);
  });
  
  console.log('🧹 All debug localStorage data cleared');
}

// Call this function to clear everything
if (typeof window !== 'undefined') {
  // Add to window object for easy console access
  (window as any).clearDebugData = clearAllDebugData;
}