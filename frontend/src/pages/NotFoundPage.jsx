import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Home, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useTranslation } from '../i18n';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <Card className="p-8 sm:p-12 text-center space-y-6 max-w-md w-full border-slate-800 bg-slate-900/90 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-xl">
          <Package className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="text-5xl font-extrabold font-display text-white">404</div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">{t('common.page_not_found')}</h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            {t('common.page_not_found_desc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link to="/" className="w-full sm:w-auto">
            <Button size="md" icon={Home} fullWidth className="sm:w-auto">
              {t('common.return_home')}
            </Button>
          </Link>
          <Link to="/recommend" className="w-full sm:w-auto">
            <Button size="md" variant="secondary" icon={Sparkles} fullWidth className="sm:w-auto">
              {t('nav.recommend')}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
