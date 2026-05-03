import React, { useState } from 'react';
import { Calculator, Lightbulb } from 'lucide-react';
import PriceEstimatorForm from '../components/features/PriceEstimatorForm';
import PriceResult from '../components/features/PriceResult';

const Estimator = () => {
  const [result, setResult] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Calculator size={22} className="text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Estimasi Harga Jasa</h1>
        </div>
        <p className="text-gray-500 mt-1 ml-7">Isi detail proyek untuk mendapatkan rekomendasi harga yang adil.</p>
      </div>

      {/* Tips */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6 text-sm text-blue-700">
        <Lightbulb size={16} className="mt-0.5 shrink-0" />
        <span>Semakin lengkap skill yang kamu isi, semakin akurat estimasi harganya.</span>
      </div>

      <PriceEstimatorForm onResult={setResult} />
      {result && <div className="mt-8"><PriceResult result={result} /></div>}
    </div>
  );
};

export default Estimator;
