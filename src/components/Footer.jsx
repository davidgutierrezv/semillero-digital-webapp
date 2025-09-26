import { BRANDING } from '../constants/branding';
import SemilleroLogo from './SemilleroLogo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Organization Info */}
          <div className="flex items-center space-x-4">
            <SemilleroLogo size="sm" showText={true} />
          </div>

          {/* Links and Info */}
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-600">
            <a 
              href={BRANDING.WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors duration-200"
            >
              Sitio Web Oficial
            </a>
            <span className="hidden md:inline">•</span>
            <span>© {currentYear} {BRANDING.ORGANIZATION_NAME}</span>
            <span className="hidden md:inline">•</span>
            <span>Dashboard de Gestión Académica</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Desarrollado para mejorar la gestión educativa y el seguimiento del progreso estudiantil
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
