import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

interface FinancialProjectionsProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ appState, styles, isDark }) => {
  const { setShowSidebar, financialProjections, fetchProjectionsData } = appState;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchProjectionsData();
    setLoading(false);
  };

  const data = financialProjections || { totalProjectedRevenue: 0, totalProjectedCommission: 0, chitForecasts: [] };

  const cardBg = isDark ? '#141D2B' : '#FFFFFF';
  const cardBorder = isDark ? '#1E293B' : '#E2E8F0';
  const textPrimary = isDark ? '#FFF' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const textMuted = isDark ? '#475569' : '#94A3B8';

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#F0F4F8' }}>
      {/* Header */}
      <View style={{
        backgroundColor: isDark ? '#0F172A' : '#1E1B4B',
        paddingTop: 8, paddingBottom: 20,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
        shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
        elevation: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12 }}>
          <TouchableOpacity
            style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, marginRight: 14 }}
            onPress={() => setShowSidebar(true)}
          >
            <Text style={{ fontSize: 22, color: '#FFF', fontWeight: 'bold' }}>☰</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>
              💹 Financial Projections
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Revenue forecasts & expected commission earnings
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 13 }}>Calculating projections...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          {/* Summary Row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <View style={{
              flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: cardBorder,
            }}>
              <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                Total Portfolio Revenue
              </Text>
              <Text style={{ color: '#6366F1', fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {formatCurrency(data.totalProjectedRevenue || 0)}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 9, marginTop: 2 }}>Combined chit pool value</Text>
            </View>

            <View style={{
              flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 16,
              borderWidth: 1, borderColor: cardBorder,
            }}>
              <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>
                Forecast Commission
              </Text>
              <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {formatCurrency(data.totalProjectedCommission || 0)}
              </Text>
              <Text style={{ color: textSecondary, fontSize: 9, marginTop: 2 }}>Expected owner profit</Text>
            </View>
          </View>

          {/* Group-by-Group Forecast */}
          <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 10 }}>
            📊 Group Forecast Breakdown
          </Text>

          {(data.chitForecasts || []).length === 0 ? (
            <View style={{ backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: cardBorder }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>💹</Text>
              <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>No active groups to forecast</Text>
            </View>
          ) : (
            data.chitForecasts.map((f: any, idx: number) => (
              <View
                key={`${f.id}-${idx}`}
                style={{
                  backgroundColor: cardBg, borderRadius: 16, marginBottom: 10, padding: 16,
                  borderWidth: 1, borderColor: cardBorder,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800' }}>{f.name}</Text>
                  <Text style={{ color: '#10B981', fontSize: 14, fontWeight: '800' }}>
                    +{formatCurrency(f.totalCommission)}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                  <Text style={{ color: textSecondary, fontSize: 11 }}>
                    Chit Value: {formatCurrency(f.chitValue)} • {f.duration} Months
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 10 }}>
                    Monthly Share: {formatCurrency(f.monthlySubscription)}
                  </Text>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
};
