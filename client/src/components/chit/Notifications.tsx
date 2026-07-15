import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

interface NotificationsProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

const getTimeGroup = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffDay === 0) return 'Today';
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return 'This Week';
  if (diffDay < 30) return 'This Month';
  return 'Older';
};

export const Notifications: React.FC<NotificationsProps> = ({ appState, styles, isDark }) => {
  const {
    setShowSidebar, notifications, notificationCount, fetchNotificationsData,
    currentUser, viewChitDetails
  } = appState;

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'payment' | 'auction' | 'surety' | 'member_join'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchNotificationsData();
    setLoading(false);
  };

  // Colors
  const cardBg = isDark ? '#141D2B' : '#FFFFFF';
  const cardBorder = isDark ? '#1E293B' : '#E2E8F0';
  const textPrimary = isDark ? '#FFF' : '#0F172A';
  const textSecondary = isDark ? '#94A3B8' : '#64748B';
  const textMuted = isDark ? '#475569' : '#94A3B8';

  // Filter notifications
  const filtered = activeFilter === 'all'
    ? (notifications || [])
    : (notifications || []).filter((n: any) => n.type === activeFilter);

  // Group by time
  const groups: { [key: string]: any[] } = {};
  filtered.forEach((n: any) => {
    const group = getTimeGroup(n.timestamp);
    if (!groups[group]) groups[group] = [];
    groups[group].push(n);
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return '#F59E0B';
      case 'auction': return '#6366F1';
      case 'surety': return '#8B5CF6';
      case 'member_join': return '#10B981';
      default: return '#64748B';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': case 'pending': return '#F59E0B';
      case 'verified': case 'approved': case 'completed': case 'joined': return '#10B981';
      case 'rejected': return '#EF4444';
      default: return '#64748B';
    }
  };

  const filterTabs = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'payment', label: 'Payments', icon: '💳' },
    { key: 'auction', label: 'Auctions', icon: '🔨' },
    { key: 'surety', label: 'Sureties', icon: '📋' },
    { key: 'member_join', label: 'Members', icon: '👤' },
  ] as const;

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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: '#FFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>
                🔔 Notifications
              </Text>
              {notificationCount > 0 && (
                <View style={{
                  backgroundColor: '#EF4444', minWidth: 20, height: 20, borderRadius: 10,
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
                }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>{notificationCount}</Text>
                </View>
              )}
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Activity feed & pending actions
            </Text>
          </View>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 10 }}
            onPress={loadData}
          >
            <Text style={{ color: '#A5B4FC', fontSize: 14 }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 14, marginTop: 10 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {filterTabs.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
                  backgroundColor: activeFilter === tab.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                  borderWidth: 1,
                  borderColor: activeFilter === tab.key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                }}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text style={{ fontSize: 12 }}>{tab.icon}</Text>
                <Text style={{
                  color: activeFilter === tab.key ? '#A5B4FC' : 'rgba(255,255,255,0.5)',
                  fontSize: 11, fontWeight: '700',
                }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 13 }}>Loading activity feed...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔕</Text>
          <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '800' }}>No Activity Yet</Text>
          <Text style={{ color: textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
            {activeFilter === 'all'
              ? 'Your activity feed will appear here as members submit payments, auctions complete, etc.'
              : `No ${activeFilter.replace('_', ' ')} notifications found.`}
          </Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>
          {Object.entries(groups).map(([groupName, items]) => (
            <View key={groupName} style={{ marginBottom: 16 }}>
              {/* Group Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                <View style={{ width: 4, height: 16, borderRadius: 2, backgroundColor: '#6366F1' }} />
                <Text style={{ color: textSecondary, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {groupName}
                </Text>
                <View style={{
                  backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF',
                  paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                }}>
                  <Text style={{ color: '#818CF8', fontSize: 9, fontWeight: '700' }}>{items.length}</Text>
                </View>
              </View>

              {/* Notification Cards */}
              {items.map((notif: any, idx: number) => {
                const typeColor = getTypeColor(notif.type);
                const statusColor = getStatusColor(notif.status);

                return (
                  <View
                    key={`${notif.id}-${idx}`}
                    style={{
                      backgroundColor: cardBg, borderRadius: 14, marginBottom: 8, overflow: 'hidden',
                      borderWidth: 1,
                      borderColor: notif.actionable ? (isDark ? 'rgba(245,158,11,0.3)' : '#FDE68A') : cardBorder,
                    }}
                  >
                    {/* Left accent strip */}
                    <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: typeColor }} />

                    <View style={{ padding: 14, paddingLeft: 16 }}>
                      {/* Top row: Title + Time */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Text style={{ color: textPrimary, fontSize: 13, fontWeight: '700', flex: 1, marginRight: 8 }}>
                          {notif.title}
                        </Text>
                        <Text style={{ color: textMuted, fontSize: 9, fontWeight: '600' }}>
                          {formatTimeAgo(notif.timestamp)}
                        </Text>
                      </View>

                      {/* Description */}
                      <Text style={{ color: textSecondary, fontSize: 11, marginTop: 4, lineHeight: 16 }}>
                        {notif.description}
                      </Text>

                      {/* Bottom row: Subtitle + Status + Action */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={{ color: textMuted, fontSize: 9 }}>🏦 {notif.subtitle}</Text>
                          <View style={{
                            backgroundColor: statusColor + '20',
                            paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
                          }}>
                            <Text style={{ color: statusColor, fontSize: 8, fontWeight: '800', textTransform: 'uppercase' }}>
                              {(notif.status || '').replace('_', ' ')}
                            </Text>
                          </View>
                        </View>

                        {notif.actionable && (
                          <View style={{
                            backgroundColor: '#F59E0B',
                            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
                          }}>
                            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>
                              ⚡ ACTION NEEDED
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
};
