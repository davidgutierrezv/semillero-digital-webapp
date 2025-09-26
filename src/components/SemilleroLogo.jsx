import { BRANDING } from '../constants/branding';

const SemilleroLogo = ({ 
  size = 'md', 
  showText = true, 
  className = '',
  textClassName = '' 
}) => {
  const getSizeClasses = (size) => {
    const sizes = {
      'sm': 'h-6',
      'md': 'h-10',
      'lg': 'h-16',
      'xl': 'h-20'
    };
    return sizes[size] || sizes.md;
  };

  const getTextSizeClasses = (size) => {
    const sizes = {
      'sm': 'text-sm',
      'md': 'text-xl',
      'lg': 'text-2xl',
      'xl': 'text-3xl'
    };
    return sizes[size] || sizes.md;
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={BRANDING.LOGO_URL}
        alt={`${BRANDING.ORGANIZATION_NAME} Logo`}
        className={`w-auto object-contain ${getSizeClasses(size)}`}
        onError={(e) => {
          // Fallback to icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      {/* Fallback icon */}
      <div className={`bg-primary-600 rounded-lg items-center justify-center hidden ${getSizeClasses(size)} aspect-square`}>
        <svg className="h-1/2 w-1/2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      
      {showText && (
        <div className={textClassName}>
          <h1 className={`font-semibold text-gray-900 ${getTextSizeClasses(size)}`}>
            {BRANDING.ORGANIZATION_NAME}
          </h1>
          {size !== 'sm' && (
            <p className="text-xs text-gray-500">{BRANDING.TAGLINE}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SemilleroLogo;
