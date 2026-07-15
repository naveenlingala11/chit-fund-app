import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';

const formatDate = (dateStr: string | Date | undefined) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: '🌅' };
  if (h < 17) return { text: 'Good Afternoon', icon: '☀️' };
  if (h < 21) return { text: 'Good Evening', icon: '🌆' };
  return { text: 'Good Night', icon: '🌙' };
};

interface DashboardProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ appState, styles, isDark }) => {
  const {
    currentUser,
    setCurrentUser,
    setViewState,
    setLoginStep,
    chits,
    dashboardMetrics,
    setShowCreateChit,
    viewChitDetails,
    loading,
    setShowSidebar,
    notificationCount,
    fetchNotificationsData
  } = appState;

  if (!currentUser) return null;

  const greeting = getGreeting();
  const activeChits = chits.filter((c: any) => c.status === 'active');
  const otherChits = chits.filter((c: any) => c.status !== 'active');
  const totalChitValue = chits.reduce((sum: number, c: any) => sum + parseFloat(c.chit_value || 0), 0);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0B1120' : '#F0F4F8' }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* HERO HEADER SECTION - Premium Gradient Hero                    */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={{
          backgroundColor: isDark ? '#0F172A' : '#1E1B4B',
          paddingTop: 8,
          paddingBottom: 28,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 20,
          elevation: 12,
        }}>
          {/* Top Bar: Hamburger + Logout */}
          <View style={{
            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
            paddingHorizontal: 18, paddingVertical: 10,
          }}>
            <TouchableOpacity
              style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10 }}
              onPress={() => setShowSidebar(true)}
            >
              <Text style={{ fontSize: 22, color: '#FFF', fontWeight: 'bold' }}>☰</Text>
            </TouchableOpacity>

            {/* Notification Bell */}
            <TouchableOpacity
              style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, marginRight: 8, position: 'relative' }}
              onPress={() => {
                fetchNotificationsData();
                setViewState('notifications');
              }}
            >
              <Text style={{ fontSize: 18, color: '#FFF' }}>🔔</Text>
              {(notificationCount || 0) > 0 && (
                <View style={{
                  position: 'absolute', top: -2, right: -2,
                  backgroundColor: '#EF4444', minWidth: 16, height: 16, borderRadius: 8,
                  alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
                  borderWidth: 2, borderColor: isDark ? '#0F172A' : '#1E1B4B',
                }}>
                  <Text style={{ color: '#FFF', fontSize: 8, fontWeight: '800' }}>{notificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
                paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
              }}
              onPress={() => {
                setCurrentUser(null);
                setViewState('login');
                setLoginStep('role_selection');
              }}
            >
              <Text style={{ color: '#FCA5A5', fontSize: 11, fontWeight: '700' }}>Logout</Text>
              <Text style={{ color: '#FCA5A5', fontSize: 13 }}>⏻</Text>
            </TouchableOpacity>
          </View>

          {/* User Profile Hero */}
          <View style={{ paddingHorizontal: 22, marginTop: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* Large Avatar with ring */}
              <View style={{
                width: 60, height: 60, borderRadius: 20,
                backgroundColor: '#6366F1',
                justifyContent: 'center', alignItems: 'center',
                marginRight: 16,
                borderWidth: 2, borderColor: 'rgba(165,180,252,0.4)',
                shadowColor: '#6366F1', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
              }}>
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: 'bold' }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '500' }}>
                    {greeting.icon} {greeting.text}
                  </Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 }}>
                  {currentUser.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 }}>
                  <View style={{
                    backgroundColor: currentUser.role === 'foreman' ? 'rgba(251,191,36,0.15)' : 'rgba(56,189,248,0.15)',
                    borderWidth: 1,
                    borderColor: currentUser.role === 'foreman' ? 'rgba(251,191,36,0.3)' : 'rgba(56,189,248,0.3)',
                    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6,
                  }}>
                    <Text style={{
                      color: currentUser.role === 'foreman' ? '#FCD34D' : '#7DD3FC',
                      fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                      {currentUser.role === 'foreman' ? '👑 FOREMAN' : '👤 MEMBER'}
                    </Text>
                  </View>
                  <View style={{
                    backgroundColor: 'rgba(16,185,129,0.15)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
                    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                  }}>
                    <Text style={{ color: '#6EE7B7', fontSize: 9, fontWeight: '700' }}>● ONLINE</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Stats Row inside hero */}
            <View style={{
              flexDirection: 'row', marginTop: 20,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 14, padding: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {currentUser.role === 'foreman' ? 'Managing' : 'Enrolled In'}
                </Text>
                <Text style={{ color: '#FFF', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{chits.length}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 1 }}>
                  Chit Groups
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Active
                </Text>
                <Text style={{ color: '#34D399', fontSize: 22, fontWeight: '800', marginTop: 2 }}>{activeChits.length}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 1 }}>
                  Running Now
                </Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 4 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Portfolio
                </Text>
                <Text style={{ color: '#A78BFA', fontSize: 16, fontWeight: '800', marginTop: 2 }}>
                  ₹{(totalChitValue / 100000).toFixed(1)}L
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 1 }}>
                  Total Value
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* FINANCIAL METRICS - Premium Cards                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 16, marginTop: -14 }}>
          {/* Collectable + Profit - Side by side */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Collectable Card */}
            <View style={{
              flex: 1, borderRadius: 18, overflow: 'hidden',
              backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
              borderWidth: 1, borderColor: isDark ? 'rgba(245,158,11,0.15)' : '#FEF3C7',
              shadowColor: '#F59E0B', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16,
              elevation: 6,
            }}>
              {/* Gradient top bar */}
              <View style={{ height: 3, flexDirection: 'row' }}>
                <View style={{ flex: 1, backgroundColor: '#F59E0B' }} />
                <View style={{ flex: 1, backgroundColor: '#FB923C' }} />
                <View style={{ flex: 1, backgroundColor: '#FBBF24' }} />
              </View>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 18 }}>{currentUser.role === 'foreman' ? '🏦' : '💸'}</Text>
                  </View>
                  <View style={{
                    backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FEF3C7',
                    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5,
                  }}>
                    <Text style={{ color: '#D97706', fontSize: 8, fontWeight: '800' }}>
                      {currentUser.role === 'foreman' ? '📋 PENDING' : '⏳ DUE'}
                    </Text>
                  </View>
                </View>
                <Text style={{
                  color: isDark ? '#94A3B8' : '#78716C', fontSize: 9, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 1, marginTop: 14,
                }}>
                  {currentUser.role === 'foreman' ? 'Collectable' : 'Dues Pending'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '800' }}>₹</Text>
                  <Text style={{ color: isDark ? '#FDE68A' : '#B45309', fontSize: 22, fontWeight: '800', marginLeft: 2 }}>
                    {parseFloat(dashboardMetrics.duesOrCollectable.toString()).toLocaleString('en-IN')}
                  </Text>
                </View>
                {/* Mini decorative bar */}
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 10 }}>
                  {[0.3, 0.5, 0.7, 0.9, 1, 0.8, 0.6].map((o, i) => (
                    <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: '#F59E0B', opacity: o }} />
                  ))}
                </View>
              </View>
            </View>

            {/* Profit / Earnings Card */}
            <View style={{
              flex: 1, borderRadius: 18, overflow: 'hidden',
              backgroundColor: isDark ? '#1A2332' : '#FFFFFF',
              borderWidth: 1, borderColor: isDark ? 'rgba(16,185,129,0.15)' : '#D1FAE5',
              shadowColor: '#10B981', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16,
              elevation: 6,
            }}>
              <View style={{ height: 3, flexDirection: 'row' }}>
                <View style={{ flex: 1, backgroundColor: '#10B981' }} />
                <View style={{ flex: 1, backgroundColor: '#34D399' }} />
                <View style={{ flex: 1, backgroundColor: '#6EE7B7' }} />
              </View>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontSize: 18 }}>💰</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>▲</Text>
                    <Text style={{ color: '#10B981', fontSize: 9, fontWeight: '700' }}>PROFIT</Text>
                  </View>
                </View>
                <Text style={{
                  color: isDark ? '#94A3B8' : '#78716C', fontSize: 9, fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: 1, marginTop: 14,
                }}>
                  {currentUser.role === 'foreman' ? 'Commission' : 'Prize Yield'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                  <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>₹</Text>
                  <Text style={{ color: isDark ? '#6EE7B7' : '#065F46', fontSize: 22, fontWeight: '800', marginLeft: 2 }}>
                    {parseFloat(dashboardMetrics.profit.toString()).toLocaleString('en-IN')}
                  </Text>
                </View>
                {/* Mini sparkline bars */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginTop: 8 }}>
                  {[8, 14, 10, 18, 16, 22, 20, 26, 24, 30].map((h, i) => (
                    <View key={i} style={{
                      flex: 1, height: h, borderRadius: 2,
                      backgroundColor: '#10B981', opacity: 0.15 + (i * 0.085),
                    }} />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* QUICK ACTIONS BAR                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 16, marginTop: 18 }}>
          <View style={{
            flexDirection: 'row', gap: 8,
            backgroundColor: isDark ? '#141D2B' : '#FFFFFF',
            borderRadius: 16, padding: 12,
            borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0',
            shadowColor: '#000', shadowOpacity: 0.04, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8,
            elevation: 2,
          }}>
            {(currentUser.role === 'foreman' ? [
              { icon: '📊', label: 'Reports', action: () => setViewState('reports') },
              { icon: '🧮', label: 'Calculator', action: () => setViewState('chit_calculator') },
              { icon: '👤', label: 'Profile', action: () => setViewState('my_profile') },
              { icon: '🔔', label: 'Alerts', action: () => { fetchNotificationsData(); setViewState('notifications'); } },
              { icon: '🆘', label: 'Help', action: () => setViewState('help_support') },
            ] : [
              { icon: '📖', label: 'Passbook', action: () => setViewState('passbook') },
              { icon: '📅', label: 'Calendar', action: () => setViewState('auction_calendar') },
              { icon: '🧮', label: 'Calculator', action: () => setViewState('chit_calculator') },
              { icon: '👤', label: 'Profile', action: () => setViewState('my_profile') },
              { icon: '🔔', label: 'Alerts', action: () => { fetchNotificationsData(); setViewState('notifications'); } },
              { icon: '🆘', label: 'Help', action: () => setViewState('help_support') },
            ]).map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={{
                  flex: 1, alignItems: 'center', paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
                }}
                onPress={item.action}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</Text>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* CHIT GROUPS SECTION                                            */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 16, marginTop: 22 }}>
          {/* Section Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{
                width: 4, height: 22, borderRadius: 2,
                backgroundColor: '#6366F1',
              }} />
              <View>
                <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>
                  Chit Groups
                </Text>
                <Text style={{ color: isDark ? '#475569' : '#94A3B8', fontSize: 10, fontWeight: '600', marginTop: 1 }}>
                  {chits.length} groups • {activeChits.length} active
                </Text>
              </View>
            </View>
            {currentUser.role === 'foreman' && (
              <TouchableOpacity
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: '#6366F1',
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                  shadowColor: '#6366F1', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 3 }, shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={() => setShowCreateChit(true)}
              >
                <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '700' }}>+</Text>
                <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '700' }}>New Chit</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Loading State */}
          {loading ? (
            <View style={{
              backgroundColor: isDark ? '#141D2B' : '#FFFFFF', borderRadius: 20, padding: 40,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0',
            }}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 12, marginTop: 12, fontWeight: '600' }}>
                Loading your chit groups...
              </Text>
            </View>
          ) : chits.length === 0 ? (
            /* Empty State */
            <View style={{
              backgroundColor: isDark ? '#141D2B' : '#FFFFFF', borderRadius: 20, padding: 40,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0',
            }}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 15, fontWeight: '700' }}>
                No Chit Groups Yet
              </Text>
              <Text style={{ color: isDark ? '#475569' : '#94A3B8', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                {currentUser.role === 'foreman'
                  ? 'Create your first chit group to get started!'
                  : 'You haven\'t been enrolled in any chit groups yet.'}
              </Text>
            </View>
          ) : (
            /* Chit Cards List */
            <View>
              {chits.map((chit: any, index: number) => {
                const completedMonths = chit.completed_auctions || 0;
                const totalMonths = chit.duration_months || chit.members_count || 20;
                const progressPercent = totalMonths > 0 ? Math.round((completedMonths / totalMonths) * 100) : 0;
                const statusColor = chit.status === 'active' ? '#10B981'
                  : chit.status === 'recruiting' ? '#6366F1'
                    : chit.status === 'completed' ? '#64748B'
                      : '#F59E0B';
                const statusBg = chit.status === 'active' ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5')
                  : chit.status === 'recruiting' ? (isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF')
                    : chit.status === 'completed' ? (isDark ? 'rgba(100,116,139,0.12)' : '#F8FAFC')
                      : (isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB');

                return (
                  <TouchableOpacity
                    key={chit.id}
                    style={{
                      backgroundColor: isDark ? '#141D2B' : '#FFFFFF',
                      borderRadius: 18, marginBottom: 12, overflow: 'hidden',
                      borderWidth: 1, borderColor: isDark ? '#1E293B' : '#E2E8F0',
                      shadowColor: '#000', shadowOpacity: isDark ? 0.15 : 0.06,
                      shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
                      elevation: 4,
                    }}
                    onPress={() => viewChitDetails(chit)}
                    activeOpacity={0.7}
                  >
                    {/* Card left accent strip */}
                    <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: statusColor }} />

                    <View style={{ padding: 16, paddingLeft: 18 }}>
                      {/* Card Header: Name + Status */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 }}>
                            {chit.name}
                          </Text>
                          <Text style={{ color: isDark ? '#475569' : '#94A3B8', fontSize: 10, fontWeight: '500', marginTop: 2 }}>
                            ID: #{chit.id} • Since {formatDate(chit.start_date)}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: statusBg,
                          borderWidth: 1, borderColor: statusColor + '30',
                          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
                        }}>
                          <Text style={{ color: statusColor, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {chit.status === 'active' ? '● ACTIVE' : chit.status === 'recruiting' ? '◎ RECRUITING' : chit.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {/* Divider */}
                      <View style={{ height: 1, backgroundColor: isDark ? '#1E293B' : '#F1F5F9', marginVertical: 12 }} />

                      {/* Stats Grid - 3 columns */}
                      <View style={{ flexDirection: 'row' }}>
                        {/* Chit Value */}
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Chit Value
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                            <Text style={{ color: isDark ? '#818CF8' : '#6366F1', fontSize: 10, fontWeight: '700' }}>₹</Text>
                            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: '800', marginLeft: 1 }}>
                              {parseFloat(chit.chit_value.toString()).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>
                        {/* Members */}
                        <View style={{ flex: 0.6, alignItems: 'center' }}>
                          <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Members
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                            <Text style={{ fontSize: 13 }}>👥</Text>
                            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: '800' }}>
                              {chit.members_count}
                            </Text>
                          </View>
                        </View>
                        {/* Monthly Share */}
                        <View style={{ flex: 1, alignItems: 'flex-end' }}>
                          <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>
                            Monthly Share
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
                            <Text style={{ color: isDark ? '#34D399' : '#059669', fontSize: 10, fontWeight: '700' }}>₹</Text>
                            <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 16, fontWeight: '800', marginLeft: 1 }}>
                              {parseFloat(chit.monthly_subscription.toString()).toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Progress Bar + Footer */}
                      <View style={{ marginTop: 14 }}>
                        {/* Progress background */}
                        <View style={{
                          height: 5, borderRadius: 3,
                          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                          overflow: 'hidden',
                        }}>
                          <View style={{
                            height: '100%', borderRadius: 3,
                            backgroundColor: statusColor,
                            width: `${Math.min(progressPercent, 100)}%`,
                          }} />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: '600' }}>
                              📅 {formatDate(chit.start_date)}
                            </Text>
                            <Text style={{ color: isDark ? '#334155' : '#E2E8F0' }}>|</Text>
                            <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 10, fontWeight: '600' }}>
                              🔄 {chit.auction_day_of_month}th monthly
                            </Text>
                          </View>
                          <View style={{
                            flexDirection: 'row', alignItems: 'center', gap: 4,
                            backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : '#EEF2FF',
                            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8,
                          }}>
                            <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: '800' }}>View</Text>
                            <Text style={{ color: '#818CF8', fontSize: 11 }}>→</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};
