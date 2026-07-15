import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';

interface ReportsAnalyticsProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ appState, styles, isDark }) => {
  const {
    setShowSidebar, currentUser, reportsOverview, chitGroupStats, defaulters,
    fetchReportsData
  } = appState;

  const [loading, setLoading] = useState(true);
  const [selectedChitId, setSelectedChitId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'chits' | 'defaulters'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchReportsData();
    setLoading(false);
  };

  const overview = reportsOverview || {};

  // Colors
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
              📊 Reports & Analytics
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Business intelligence & financial insights
            </Text>
          </View>
          <TouchableOpacity
            style={{ padding: 8, backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: 10 }}
            onPress={loadData}
          >
            <Text style={{ color: '#A5B4FC', fontSize: 14 }}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Section Tabs */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 18, marginTop: 10, gap: 8 }}>
          {([
            { key: 'overview', label: '📈 Overview', icon: '' },
            { key: 'chits', label: '🏦 Chit Groups', icon: '' },
            { key: 'defaulters', label: '⚠️ Defaulters', icon: '' },
          ] as const).map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                backgroundColor: activeSection === tab.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: activeSection === tab.key ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)',
              }}
              onPress={() => setActiveSection(tab.key)}
            >
              <Text style={{
                color: activeSection === tab.key ? '#A5B4FC' : 'rgba(255,255,255,0.5)',
                fontSize: 11, fontWeight: '700',
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={{ color: textSecondary, marginTop: 12, fontSize: 13 }}>Loading analytics...</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>

          {/* ═══════════ OVERVIEW SECTION ═══════════ */}
          {activeSection === 'overview' && (
            <View>
              {/* Top Metric Cards Row */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {/* Total Collected */}
                <View style={{
                  flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 14, overflow: 'hidden',
                  borderWidth: 1, borderColor: cardBorder,
                }}>
                  <View style={{ height: 3, backgroundColor: '#10B981', position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 16 }}>✅</Text>
                  </View>
                  <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Total Collected
                  </Text>
                  <Text style={{ color: '#10B981', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                    {formatCurrency(overview.totalCollected || 0)}
                  </Text>
                </View>

                {/* Total Pending */}
                <View style={{
                  flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 14, overflow: 'hidden',
                  borderWidth: 1, borderColor: cardBorder,
                }}>
                  <View style={{ height: 3, backgroundColor: '#F59E0B', position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 16 }}>⏳</Text>
                  </View>
                  <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Pending Verify
                  </Text>
                  <Text style={{ color: '#F59E0B', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                    {formatCurrency(overview.totalPending || 0)}
                  </Text>
                  <Text style={{ color: textMuted, fontSize: 9, marginTop: 2 }}>
                    {overview.pendingPaymentsCount || 0} receipts
                  </Text>
                </View>
              </View>

              {/* Commission + Portfolio Row */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <View style={{
                  flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 14, overflow: 'hidden',
                  borderWidth: 1, borderColor: cardBorder,
                }}>
                  <View style={{ height: 3, backgroundColor: '#8B5CF6', position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(139,92,246,0.12)' : '#F5F3FF',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 16 }}>💰</Text>
                  </View>
                  <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Commission Earned
                  </Text>
                  <Text style={{ color: '#8B5CF6', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                    {formatCurrency(overview.totalCommission || 0)}
                  </Text>
                </View>

                <View style={{
                  flex: 1, backgroundColor: cardBg, borderRadius: 16, padding: 14, overflow: 'hidden',
                  borderWidth: 1, borderColor: cardBorder,
                }}>
                  <View style={{ height: 3, backgroundColor: '#6366F1', position: 'absolute', top: 0, left: 0, right: 0 }} />
                  <View style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF',
                    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
                  }}>
                    <Text style={{ fontSize: 16 }}>🏦</Text>
                  </View>
                  <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Portfolio Value
                  </Text>
                  <Text style={{ color: '#6366F1', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                    {formatCurrency(overview.totalPortfolio || 0)}
                  </Text>
                </View>
              </View>

              {/* Operational Stats */}
              <View style={{
                backgroundColor: cardBg, borderRadius: 18, padding: 18,
                borderWidth: 1, borderColor: cardBorder, marginBottom: 12,
              }}>
                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 14 }}>
                  📊 Operational Summary
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {[
                    { label: 'Total Chit Groups', value: overview.totalChits || 0, icon: '📋', color: '#6366F1' },
                    { label: 'Active Groups', value: overview.activeChits || 0, icon: '🟢', color: '#10B981' },
                    { label: 'Recruiting', value: overview.recruitingChits || 0, icon: '📢', color: '#F59E0B' },
                    { label: 'Completed', value: overview.completedChits || 0, icon: '✅', color: '#64748B' },
                    { label: 'Total Members', value: overview.totalMembers || 0, icon: '👥', color: '#8B5CF6' },
                    { label: 'Auctions Done', value: overview.completedAuctions || 0, icon: '🔨', color: '#EC4899' },
                    { label: 'Upcoming Auctions', value: overview.upcomingAuctions || 0, icon: '📅', color: '#0EA5E9' },
                    { label: 'Defaulters', value: (defaulters || []).length, icon: '⚠️', color: '#EF4444' },
                  ].map((stat, i) => (
                    <View key={i} style={{
                      width: '47%', flexDirection: 'row', alignItems: 'center', gap: 10,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC',
                      padding: 10, borderRadius: 10,
                    }}>
                      <Text style={{ fontSize: 18 }}>{stat.icon}</Text>
                      <View>
                        <Text style={{ color: stat.color, fontSize: 16, fontWeight: '800' }}>{stat.value}</Text>
                        <Text style={{ color: textMuted, fontSize: 8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {stat.label}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Collection Bar Chart */}
              <View style={{
                backgroundColor: cardBg, borderRadius: 18, padding: 18,
                borderWidth: 1, borderColor: cardBorder, marginBottom: 12,
              }}>
                <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '800', marginBottom: 4 }}>
                  📊 Collection vs Pending
                </Text>
                <Text style={{ color: textMuted, fontSize: 10, marginBottom: 16 }}>
                  Across all managed chit groups
                </Text>

                {/* Visual Bar */}
                {(() => {
                  const collected = overview.totalCollected || 0;
                  const pending = overview.totalPending || 0;
                  const total = collected + pending;
                  const collectedPct = total > 0 ? (collected / total) * 100 : 0;
                  const pendingPct = total > 0 ? (pending / total) * 100 : 0;

                  return (
                    <View>
                      <View style={{ height: 28, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }}>
                        {collectedPct > 0 && (
                          <View style={{ width: `${collectedPct}%`, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>{collectedPct.toFixed(0)}%</Text>
                          </View>
                        )}
                        {pendingPct > 0 && (
                          <View style={{ width: `${pendingPct}%`, backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>{pendingPct.toFixed(0)}%</Text>
                          </View>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#10B981' }} />
                          <Text style={{ color: textSecondary, fontSize: 10 }}>Collected: {formatCurrency(collected)}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: '#F59E0B' }} />
                          <Text style={{ color: textSecondary, fontSize: 10 }}>Pending: {formatCurrency(pending)}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })()}
              </View>
            </View>
          )}

          {/* ═══════════ CHIT GROUP STATS SECTION ═══════════ */}
          {activeSection === 'chits' && (
            <View>
              {(chitGroupStats || []).length === 0 ? (
                <View style={{ backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: cardBorder }}>
                  <Text style={{ fontSize: 40, marginBottom: 10 }}>📋</Text>
                  <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>No chit group data available</Text>
                </View>
              ) : (
                (chitGroupStats || []).map((chit: any, idx: number) => {
                  const collectionRate = chit.total_collected > 0 && chit.chit_value > 0
                    ? Math.round((parseFloat(chit.total_collected) / (parseFloat(chit.chit_value) * (parseInt(chit.completed_months) || 1))) * 100)
                    : 0;
                  const isExpanded = selectedChitId === chit.id;

                  return (
                    <TouchableOpacity
                      key={chit.id}
                      style={{
                        backgroundColor: cardBg, borderRadius: 16, marginBottom: 10, overflow: 'hidden',
                        borderWidth: 1, borderColor: isExpanded ? '#6366F1' : cardBorder,
                      }}
                      onPress={() => setSelectedChitId(isExpanded ? null : chit.id)}
                      activeOpacity={0.8}
                    >
                      <View style={{ padding: 14 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800' }}>{chit.name}</Text>
                            <Text style={{ color: textMuted, fontSize: 10, marginTop: 2 }}>
                              {chit.enrolled_members}/{chit.members_count} members • {chit.completed_months} months done
                            </Text>
                          </View>
                          <View style={{
                            backgroundColor: chit.status === 'active' ? (isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5') : (isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF'),
                            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                          }}>
                            <Text style={{
                              color: chit.status === 'active' ? '#10B981' : '#6366F1',
                              fontSize: 9, fontWeight: '800', textTransform: 'uppercase',
                            }}>
                              {chit.status}
                            </Text>
                          </View>
                        </View>

                        {/* Mini stats row */}
                        <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                          <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : '#F0FDF4', padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: textMuted, fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>Collected</Text>
                            <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '800', marginTop: 2 }}>
                              {formatCurrency(parseFloat(chit.total_collected || 0))}
                            </Text>
                          </View>
                          <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(245,158,11,0.06)' : '#FFFBEB', padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: textMuted, fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>Pending</Text>
                            <Text style={{ color: '#F59E0B', fontSize: 13, fontWeight: '800', marginTop: 2 }}>
                              {formatCurrency(parseFloat(chit.pending_amount || 0))}
                            </Text>
                          </View>
                          <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(139,92,246,0.06)' : '#F5F3FF', padding: 8, borderRadius: 8 }}>
                            <Text style={{ color: textMuted, fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>Commission</Text>
                            <Text style={{ color: '#8B5CF6', fontSize: 13, fontWeight: '800', marginTop: 2 }}>
                              {formatCurrency(parseFloat(chit.commission_earned || 0))}
                            </Text>
                          </View>
                        </View>

                        {/* Expanded details */}
                        {isExpanded && (
                          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: cardBorder }}>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                              {[
                                { label: 'Chit Value', value: formatCurrency(parseFloat(chit.chit_value || 0)) },
                                { label: 'Monthly Due', value: formatCurrency(parseFloat(chit.monthly_subscription || 0)) },
                                { label: 'Commission %', value: `${chit.foreman_commission_pct}%` },
                                { label: 'Start Date', value: chit.start_date ? new Date(chit.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A' },
                              ].map((item, i) => (
                                <View key={i} style={{ width: '47%', padding: 8, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 8 }}>
                                  <Text style={{ color: textMuted, fontSize: 8, fontWeight: '700', textTransform: 'uppercase' }}>{item.label}</Text>
                                  <Text style={{ color: textPrimary, fontSize: 12, fontWeight: '700', marginTop: 2 }}>{item.value}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}

                        {/* Expand indicator */}
                        <View style={{ alignItems: 'center', marginTop: 8 }}>
                          <Text style={{ color: textMuted, fontSize: 10 }}>{isExpanded ? '▲ Collapse' : '▼ Tap to expand'}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ DEFAULTERS SECTION ═══════════ */}
          {activeSection === 'defaulters' && (
            <View>
              {(defaulters || []).length === 0 ? (
                <View style={{
                  backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center',
                  borderWidth: 1, borderColor: cardBorder,
                }}>
                  <Text style={{ fontSize: 48, marginBottom: 10 }}>🎉</Text>
                  <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '800' }}>No Defaulters!</Text>
                  <Text style={{ color: textSecondary, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    All members are up-to-date with their payments.
                  </Text>
                </View>
              ) : (
                <View>
                  {/* Alert Banner */}
                  <View style={{
                    backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2',
                    borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.2)' : '#FECACA',
                    borderRadius: 14, padding: 14, marginBottom: 14,
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                  }}>
                    <Text style={{ fontSize: 24 }}>⚠️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '800' }}>
                        {defaulters.length} Unpaid Installment{defaulters.length > 1 ? 's' : ''} Found
                      </Text>
                      <Text style={{ color: isDark ? '#FCA5A5' : '#DC2626', fontSize: 10, marginTop: 2 }}>
                        Members below have missed payments for completed auction months
                      </Text>
                    </View>
                  </View>

                  {/* Defaulter Cards */}
                  {defaulters.map((d: any, idx: number) => (
                    <View
                      key={`${d.user_id}-${d.chit_id}-${d.month_number}-${idx}`}
                      style={{
                        backgroundColor: cardBg, borderRadius: 14, marginBottom: 8, overflow: 'hidden',
                        borderWidth: 1, borderColor: cardBorder,
                      }}
                    >
                      <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#EF4444' }} />
                      <View style={{ padding: 14, paddingLeft: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '800' }}>{d.name}</Text>
                            <Text style={{ color: textMuted, fontSize: 10, marginTop: 2 }}>📞 {d.phone}</Text>
                          </View>
                          <View style={{
                            backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
                            paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                          }}>
                            <Text style={{ color: '#EF4444', fontSize: 9, fontWeight: '800' }}>
                              MONTH-{d.month_number}
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginTop: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                          <View>
                            <Text style={{ color: textSecondary, fontSize: 10 }}>
                              🏦 {d.chit_name}
                            </Text>
                            <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: '800', marginTop: 2 }}>
                              Due: {formatCurrency(parseFloat(d.net_subscription_due || 0))}
                            </Text>
                          </View>
                          
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#25D366',
                              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                              flexDirection: 'row', alignItems: 'center', gap: 4
                            }}
                            onPress={() => {
                              const cleanPhone = d.phone.replace(/[^0-9]/g, '');
                              const msg = encodeURIComponent(`Hi ${d.name}, gentle reminder for your monthly installment payment of ₹${parseFloat(d.net_subscription_due || 0).toLocaleString('en-IN')} for Month-${d.month_number} in group "${d.chit_name}". Please pay at your earliest convenience!`);
                              Linking.openURL(`https://api.whatsapp.com/send?phone=91${cleanPhone}&text=${msg}`);
                            }}
                          >
                            <Text style={{ color: '#FFF', fontSize: 10, fontWeight: '800' }}>💬 Send Reminder</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
};
