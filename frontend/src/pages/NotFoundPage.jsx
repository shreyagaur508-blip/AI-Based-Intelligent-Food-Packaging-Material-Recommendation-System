import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto shadow-xl shadow-brand-500/10">
          <Package className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="text-6xl font-extrabold font-display text-white">404</div>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            The requested packaging resource or route does not exist.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Link to="/">
            <Button size="md" icon={Home}>
              Return to Home
            </Button>
          </Link>
          <Link to="/recommend">
            <Button size="md" variant="secondary" icon={ArrowLeft}>
              Get Recommendation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
