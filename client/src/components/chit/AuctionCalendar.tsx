import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface AuctionCalendarProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const AuctionCalendar: React.FC<AuctionCalendarProps> = ({ appState, styles, isDark }) => {
  const { setShowSidebar, chits, viewChitDetails } = appState;
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  // Collect all auctions from all chits
  const allAuctions: any[] = [];
  chits.forEach((chit: any) => {
    if (chit.auctions && Array.isArray(chit.auctions)) {
      chit.auctions.forEach((auc: any) => {
        allAuctions.push({
          ...auc,
          chit_name: chit.name,
          chit_id: chit.id,
          chit_value: chit.chit_value,
          auction_day: chit.auction_day_of_month,
          auction_time: chit.auction_time,
        });
      });
    } else {
      // Create mock preview for upcoming auction based on chit settings
      allAuctions.push({
        id: `preview-${chit.id}`,
        chit_id: chit.id,
        chit_name: chit.name,
        chit_value: chit.chit_value,
        month_number: 1,
        status: 'upcoming',
        auction_date: chit.start_date || new Date().toISOString(),
        auction_day: chit.auction_day_of_month,
        auction_time: chit.auction_time,
        winning_bid_discount: 0,
      });
    }
  });

  const filtered = filter === 'all'
    ? allAuctions
    : allAuctions.filter(a => a.status === filter);

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
              📅 Auction Calendar
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Schedule & bidding timeline across all groups
            </Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 18, marginTop: 10, gap: 8 }}>
          {[
            { key: 'all', label: 'All Auctions' },
            { key: 'upcoming', label: '⏳ Scheduled' },
            { key: 'completed', label: '✅ Completed' }
          ].map(t => (
            <TouchableOpacity
              key={t.key}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                backgroundColor: filter === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: filter === t.key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
              }}
              onPress={() => setFilter(t.key as any)}
            >
              <Text style={{
                color: filter === t.key ? '#A5B4FC' : 'rgba(255,255,255,0.5)',
                fontSize: 11, fontWeight: '700',
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={{ backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: cardBorder }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📅</Text>
            <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>No auctions found</Text>
          </View>
        ) : (
          filtered.map((item: any, idx: number) => (
            <View
              key={`${item.id}-${idx}`}
              style={{
                backgroundColor: cardBg, borderRadius: 16, marginBottom: 12, overflow: 'hidden',
                borderWidth: 1, borderColor: cardBorder, padding: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '800' }}>{item.chit_name}</Text>
                  <Text style={{ color: textSecondary, fontSize: 11, marginTop: 2 }}>
                    Month #{item.month_number} • Chit Value: ₹{parseFloat(item.chit_value || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={{
                  backgroundColor: item.status === 'completed' ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : (isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB'),
                  paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                }}>
                  <Text style={{
                    color: item.status === 'completed' ? '#10B981' : '#F59E0B',
                    fontSize: 9, fontWeight: '800', textTransform: 'uppercase',
                  }}>
                    {item.status === 'completed' ? '✅ DONE' : '⏳ UPCOMING'}
                  </Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: cardBorder, marginVertical: 12 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>📅</Text>
                  <Text style={{ color: textPrimary, fontSize: 12, fontWeight: '700' }}>
                    Every {item.auction_day || '10'}th of month @ {item.auction_time || '06:00 PM'}
                  </Text>
                </View>

                {item.winner_name && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: textMuted, fontSize: 10 }}>Winner:</Text>
                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>{item.winner_name}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};
