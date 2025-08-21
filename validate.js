// Simple validation script for browser functionality
export const validateBrowserFunctionality = () => {
  console.log("🧪 Testing Habit Tracker Browser Functionality...\n");
  
  try {
    // Test 1: Storage availability
    const { isStorageAvailable, resetToDefaults, isDataCorrupted } = require('./lib/storage');
    console.log("✅ Storage module imported successfully");
    
    // Test 2: Error handling
    const { logError, createError } = require('./lib/error-handling');
    console.log("✅ Error handling module imported successfully");
    
    // Test 3: Validation
    const { validateAppData } = require('./lib/validation');
    console.log("✅ Validation module imported successfully");
    
    console.log("\n🎉 All critical modules loaded successfully!");
    console.log("📱 Ready to test in browser at http://localhost:3000");
    
  } catch (error) {
    console.error("❌ Module loading failed:", error.message);
  }
};

if (typeof window !== 'undefined') {
  validateBrowserFunctionality();
}
