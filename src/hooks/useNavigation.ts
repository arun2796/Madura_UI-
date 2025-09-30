import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for reliable navigation that works across different React Router versions
 */
export const useNavigation = () => {
  const navigate = useNavigate();

  const goBack = (fallbackPath?: string) => {
    console.log('goBack called with fallback:', fallbackPath);
    
    // Check if there's history to go back to
    if (window.history.length > 1) {
      try {
        // Try using browser's native back functionality
        console.log('Using window.history.back()');
        window.history.back();
        return true;
      } catch (error) {
        console.error('window.history.back() failed:', error);
      }
    }
    
    // Fallback to navigate if provided
    if (fallbackPath) {
      console.log('Using fallback navigation to:', fallbackPath);
      navigate(fallbackPath);
      return true;
    }
    
    console.warn('No fallback path provided and no history available');
    return false;
  };

  const navigateTo = (path: string, options?: { replace?: boolean }) => {
    console.log('navigateTo called with path:', path, 'options:', options);
    try {
      navigate(path, options);
      return true;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  };

  return {
    goBack,
    navigateTo,
    navigate // Original navigate function for advanced use cases
  };
};
