import React from 'react';

type Region = 'africa' | 'asia' | 'europe' | 'north-america' | 'south-america' | 'oceania' | 'middle-east';

interface ExchangeRate {
  pair: string;
  rate: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  region: Region;
}

interface RateAlertsProps {
  exchangeRates: ExchangeRate[];
  onClose: () => void;
}

const RateAlerts: React.FC<RateAlertsProps> = ({ exchangeRates, onClose }) => {
  const topMovers = [...(exchangeRates ?? [])]
    .filter(Boolean)
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 10);

  return (
    <div className="max-w-3xl mx-auto bg-card border rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-lg font-semibold">Rate Alerts</h3>
        <button
          onClick={onClose}
          className="text-sm px-3 py-1 rounded-md border hover:bg-muted transition"
        >
          Close
        </button>
      </div>
      <div className="p-4">
        {topMovers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No rates available.</p>
        ) : (
          <ul className="divide-y">
            {topMovers.map((r) => (
              <li key={r.pair} className="py-2 flex items-center justify-between">
                <div className="font-mono">{r.pair}</div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{r.rate.toFixed(4)}</span>
                  <span
                    className={`text-sm ${r.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {r.changePercent >= 0 ? '+' : ''}
                    {r.changePercent.toFixed(2)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RateAlerts;