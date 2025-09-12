import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, ArrowDownLeft, Filter } from 'lucide-react';
import { Layout } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { useWallet } from '../contexts/WalletContext';

export const History: React.FC = () => {
  const { t } = useTranslation();
  const { transactions } = useWallet();

  const [filter, setFilter] = useState<{
    type: 'all' | 'send' | 'receive';
    status: 'all' | 'pending' | 'confirmed' | 'used'| 'rejected';
  }>({
    type: 'all',
    status: 'all'
  });

  const filteredTransactions = transactions.filter(tx => {
    if (filter.type !== 'all' && tx.type !== filter.type) return false;
    if (filter.status !== 'all' && tx.status !== filter.status) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'used': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title={t('history')} showBack>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Filters
            </h3>
            <Filter size={20} className="text-gray-400" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByType')}
              </label>
              <div className="flex space-x-2">
                {['all', 'send', 'receive'].map(type => (
                  <Button
                    key={type}
                    variant={filter.type === type ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(prev => ({ ...prev, type: type as any }))}
                  >
                    {type === 'all' ? 'All' : type === 'send' ? 'Sent' : 'Received'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterByStatus')}
              </label>
              <div className="flex space-x-2">
                {['all', 'pending', 'confirmed', 'used'].map(status => (
                  <Button
                    key={status}
                    variant={filter.status === status ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter(prev => ({ ...prev, status: status as any }))}
                  >
                    {status === 'all' ? 'All' : t(status)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('allTransactions')} ({filteredTransactions.length})
          </h3>

          {filteredTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions found
            </p>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.reverse().map((tx) => (

                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                >               

                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                        {tx.type === 'send' ? (
                          <ArrowUpRight size={16} className="text-red-600" />
                        ) : (
                          <ArrowDownLeft size={16} className="text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {tx.type === 'send' ? 'Sent' : 'Received'} {tx.origin}
                          {tx.recipient && ` to ${tx.recipient}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tx.timestamp.toLocaleString()}
                        </p>
                        {tx.memo && (
                          <p className="text-xs text-gray-400 mt-1">
                            {tx.memo}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {tx.type === 'send' ? '-' : '+'}
                        {(tx.amount * 1.e-3).toFixed(3)} HBD
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {t(tx.status)}
                      </span>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};