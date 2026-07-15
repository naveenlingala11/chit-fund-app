import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

interface AuditTrailProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ appState, styles, isDark }) => {
  const { setShowSidebar, auditTrail, fetchAuditTrailData } = appState;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchAuditTrailData();
    setLoading(false);
  };

  const list = auditTrail || [];

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
              🔒 Audit Trail & History
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Immutable record of system activity and approvals
            </Text>
          </View>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 10 }}
            onPress={loadData}
          >
            <Text style={{ color: '#A5B4FC', fontSize: 14 }}>🔄</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 13 }}>Loading audit logs...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          {list.length === 0 ? (
            <View style={{ backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: cardBorder }}>
              <Text style={{ fontSize: 40, marginBottom: 10 }}>📜</Text>
              <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>No audit records recorded yet</Text>
            </View>
          ) : (
            list.map((item: any, idx: number) => (
              <View
                key={`${item.id}-${idx}`}
                style={{
                  backgroundColor: cardBg, borderRadius: 14, marginBottom: 8, padding: 14,
                  borderWidth: 1, borderColor: cardBorder,
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                }}
              >
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 18 }}>
                    {item.action_type === 'payment_verified' ? '💳' : item.action_type === 'auction_completed' ? '🔨' : '📋'}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '700' }}>{item.description}</Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                    <Text style={{ color: textMuted, fontSize: 9 }}>Group: {item.chit_name}</Text>
                    <Text style={{ color: textMuted, fontSize: 9 }}>
                      {item.timestamp ? new Date(item.timestamp).toLocaleString('en-IN') : 'N/A'}
                    </Text>
                  </View>
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
