import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import * as Linking from 'expo-linking';

const formatDateTime = (dateStr: string | Date | undefined) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return String(dateStr);
  
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

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

interface ChitDetailProps {
  appState: any;
  styles: any;
  isDark: boolean;
  startLiveBiddingRoom: (monthNumber: number, maxDiscount: number, auctionId: string) => void;
  setShowAuctionRoom: (show: boolean) => void;
}

export const ChitDetail: React.FC<ChitDetailProps> = ({
  appState,
  styles,
  isDark,
  startLiveBiddingRoom,
  setShowAuctionRoom
}) => {
  const {
    currentUser,
    selectedChitDetails,
    setViewState,
    activeTab,
    setActiveTab,
    payments,
    sureties,
    setPaymentForm,
    setShowPaymentUpload,
    setSuretyForm,
    setShowSuretyUpload,
    setAddMemberForm,
    setShowAddMemberModal,
    openMemberDetail,
    openEditMember,
    handleRemoveMember,
    handleVerifyPayment,
    handleVerifySurety,
    handleDisburseMoney
  } = appState;

  if (!selectedChitDetails || !currentUser) return null;

  // Local filter states for Payments Tab
  const [paySearchQuery, setPaySearchQuery] = useState('');
  const [payFilterMonth, setPayFilterMonth] = useState<number | 'all'>('all');
  const [payFilterStatus, setPayFilterStatus] = useState<string>('all');
  const [payFilterMode, setPayFilterMode] = useState<string>('all');

  const payVerifiedSum = payments
    .filter((p: any) => p.payment_status === 'verified')
    .reduce((sum: number, p: any) => sum + parseFloat(p.amount_paid.toString()), 0);
  const payPendingCount = payments.filter((p: any) => p.payment_status === 'pending_approval').length;
  const payTotalCount = payments.length;

  const filteredPayments = payments.filter((p: any) => {
    const matchesSearch = !paySearchQuery || p.name?.toLowerCase().includes(paySearchQuery.toLowerCase()) || 
                          p.member_number?.toString().includes(paySearchQuery);
    const matchesMonth = payFilterMonth === 'all' || p.month_number === payFilterMonth;
    const matchesStatus = payFilterStatus === 'all' || p.payment_status === payFilterStatus;
    const matchesMode = payFilterMode === 'all' || p.payment_mode === payFilterMode;

    return matchesSearch && matchesMonth && matchesStatus && matchesMode;
  });

  const handleExportPayments = () => {
    let csvContent = 'Member No,Name,Amount Paid,Mode,Status,Month\n';
    filteredPayments.forEach((p: any) => {
      csvContent += `${p.member_number},"${p.name}",${p.amount_paid},${p.payment_mode},${p.payment_status},Month ${p.month_number || 1}\n`;
    });
    Alert.alert(
      'Export Success 🎉',
      `Payment Report generated for ${filteredPayments.length} entries. Share or copy data:\n\n${csvContent.substring(0, 300)}...`,
      [
        { text: 'Copy to Clipboard', onPress: () => {
          Alert.alert('Success', 'Report copied to clipboard! (Simulated)');
        }},
        { text: 'OK' }
      ]
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Detail Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => setViewState('dashboard')}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <Text style={styles.detailChitName} numberOfLines={1}>{selectedChitDetails.name}</Text>
        <View style={{ width: 45 }} />
      </View>

      {/* Sub Navigation Tabs */}
      <View style={styles.tabsRow}>
        {['info', 'members', 'history', 'payments', 'sureties'].map((tab) => {
          if (tab === 'sureties' && currentUser.role === 'member' && !selectedChitDetails.auctions.some((a: any) => a.winning_member_id === currentUser.id)) {
            return null;
          }
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text style={[styles.tabBtnText, activeTab === tab && styles.activeTabBtnText]}>
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={styles.scrollView}>
        {activeTab === 'info' && (
          <View style={styles.card}>
            {currentUser.role === 'foreman' && (
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: isDark ? 'rgba(99,102,241,0.15)' : '#EEF2FF',
                    borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE',
                    paddingVertical: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4,
                  }}
                  onPress={() => appState.openEditChitModal(selectedChitDetails)}
                >
                  <Text style={{ fontSize: 13 }}>✏️</Text>
                  <Text style={{ color: isDark ? '#A5B4FC' : '#4F46E5', fontSize: 11, fontWeight: '700' }}>Edit Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1, backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                    borderWidth: 1, borderColor: isDark ? 'rgba(16,185,129,0.3)' : '#A7F3D0',
                    paddingVertical: 8, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 4,
                  }}
                  onPress={() => appState.handleDuplicateChit(selectedChitDetails.id, `${selectedChitDetails.name} (Copy)`)}
                >
                  <Text style={{ fontSize: 13 }}>📋</Text>
                  <Text style={{ color: isDark ? '#6EE7B7' : '#059669', fontSize: 11, fontWeight: '700' }}>Duplicate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : '#FEF2F2',
                    borderWidth: 1, borderColor: isDark ? 'rgba(239,68,68,0.3)' : '#FECACA',
                    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                  }}
                  onPress={() => appState.handleDeleteChit(selectedChitDetails.id, selectedChitDetails.name)}
                >
                  <Text style={{ fontSize: 13 }}>🗑️</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.cardTitle}>Chit Capital Details</Text>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Chit Amount:</Text><Text style={styles.infoVal}>₹{parseFloat(selectedChitDetails.chit_value).toLocaleString('en-IN')}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Monthly Share:</Text><Text style={styles.infoVal}>₹{parseFloat(selectedChitDetails.monthly_subscription).toLocaleString('en-IN')}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Total Members/Months:</Text><Text style={styles.infoVal}>{selectedChitDetails.members_count} Members / {selectedChitDetails.duration_months} Months</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Max Bid Discount ({parseFloat(selectedChitDetails.max_bid_discount_pct)}%):</Text><Text style={styles.infoVal}>₹{(parseFloat(selectedChitDetails.chit_value) * parseFloat(selectedChitDetails.max_bid_discount_pct) / 100).toLocaleString('en-IN')}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>Owner Commission ({parseFloat(selectedChitDetails.foreman_commission_pct)}%):</Text><Text style={styles.infoVal}>₹{(parseFloat(selectedChitDetails.chit_value) * parseFloat(selectedChitDetails.foreman_commission_pct) / 100).toLocaleString('en-IN')}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>First Month Rule:</Text><Text style={styles.infoVal}>{selectedChitDetails.first_month_rule === 'foreman_takes' ? 'Month-1 goes to Owner (no bidding)' : 'Normal Auction'}</Text></View>
            <View style={styles.infoRow}><Text style={styles.infoLabel}>📅 Start Date:</Text><Text style={styles.infoVal}>{formatDate(selectedChitDetails.start_date)}</Text></View>

            {/* Next Live Auction Countdown Banner */}
            <View style={{
              backgroundColor: isDark ? 'rgba(99,102,241,0.1)' : '#EEF2FF',
              borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE',
              borderRadius: 12, padding: 14, marginVertical: 12,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>🔨</Text>
                  <View>
                    <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 13, fontWeight: '800' }}>
                      Next Live Bidding Session
                    </Text>
                    <Text style={{ color: isDark ? '#A5B4FC' : '#4F46E5', fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                      {selectedChitDetails.auction_day_of_month || 10}th of every month @ {selectedChitDetails.auction_time || '06:00 PM'}
                    </Text>
                  </View>
                </View>

                <View style={{ backgroundColor: '#6366F1', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ color: '#FFF', fontSize: 9, fontWeight: '800' }}>SCHEDULED ⏳</Text>
                </View>
              </View>
            </View>
            
            {/* Share Chit Invite */}
            <TouchableOpacity
              style={{ backgroundColor: '#25D366', padding: 12, borderRadius: 8, alignItems: 'center', marginVertical: 15, flexDirection: 'row', justifyContent: 'center' }}
              onPress={() => {
                const msg = `Join our Chit group *${selectedChitDetails.name}*!\nChit Amount: ₹${parseFloat(selectedChitDetails.chit_value).toLocaleString('en-IN')}\nDuration: ${selectedChitDetails.duration_months} Months\nMembers: ${selectedChitDetails.members_count}\nAuction Day: ${selectedChitDetails.auction_day_of_month}th of month\nTrack live on ChitSangham App!`;
                Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`);
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 13 }}>📢 Share Group Details via WhatsApp</Text>
            </TouchableOpacity>

            {/* Launch Auction / Countdown Card */}
            <View style={[styles.liveAuctionCard, { backgroundColor: '#1E2538' }]}>
              <Text style={styles.liveAuctionCardTitle}>Auction Status Room</Text>
              
              {(() => {
                const nextAuction = selectedChitDetails.auctions.find((a: any) => a.status === 'upcoming' || a.status === 'live');
                if (nextAuction) {
                  return (
                    <View>
                      <Text style={styles.liveAuctionCardSub}>
                        {nextAuction.status === 'live' 
                          ? '🔴 Bidding is currently live!' 
                          : `📅 Scheduled Auction: Month ${nextAuction.month_number} on ${formatDate(nextAuction.auction_date)} at ${selectedChitDetails.auction_time}`}
                      </Text>
                      {currentUser.role === 'foreman' ? (
                        <TouchableOpacity 
                          style={styles.actionBtn}
                          onPress={() => {
                            const maxDiscount = (parseFloat(selectedChitDetails.chit_value) * parseFloat(selectedChitDetails.max_bid_discount_pct)) / 100;
                            startLiveBiddingRoom(nextAuction.month_number, maxDiscount, nextAuction.id);
                            setShowAuctionRoom(true);
                          }}
                        >
                          <Text style={styles.actionBtnText}>
                            {nextAuction.status === 'live' ? 'Enter Bidding Room' : 'Start Live Bidding Room'}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={styles.actionBtn}
                          onPress={() => {
                            setShowAuctionRoom(true);
                          }}
                        >
                          <Text style={styles.actionBtnText}>Enter Bidding Room</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                } else {
                  return <Text style={styles.liveAuctionCardSub}>All auctions completed for this chit group.</Text>;
                }
              })()}
            </View>
          </View>
        )}

        {activeTab === 'members' && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={styles.cardTitle}>Enrolled Members List</Text>
              {currentUser.role === 'foreman' && selectedChitDetails.status === 'recruiting' && (
                <TouchableOpacity 
                  style={{ backgroundColor: '#6366F1', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 }}
                  onPress={() => {
                    setAddMemberForm({ name: '', phone: '', memberNumber: (selectedChitDetails.members.length + 1).toString() });
                    setShowAddMemberModal(true);
                  }}
                >
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>+ Add Member</Text>
                </TouchableOpacity>
              )}
            </View>

            {selectedChitDetails.members.length === 0 ? (
              <Text style={styles.emptyText}>No members enrolled yet.</Text>
            ) : (
              selectedChitDetails.members.map((member: any) => (
                <TouchableOpacity 
                  key={member.user_id} 
                  style={[styles.memberListItem, { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                  onPress={() => openMemberDetail(member.user_id)}
                >
                  <Text style={styles.memberNo}>#{member.member_number}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.memberName}>{member.name} {member.user_id === selectedChitDetails.foreman_id ? '(Foreman)' : ''}</Text>
                    {currentUser.role === 'foreman' && (
                      <Text style={styles.memberPhone}>{member.phone}</Text>
                    )}
                  </View>
                  
                  {selectedChitDetails.auctions.some((a: any) => a.winning_member_id === member.user_id) && (
                    <View style={[styles.statusBadge, { backgroundColor: '#1E3A8A', marginRight: 10 }]}>
                      <Text style={styles.statusBadgeText}>PRIZED</Text>
                    </View>
                  )}

                  {currentUser.role === 'foreman' && member.user_id !== selectedChitDetails.foreman_id && (
                    <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                      <TouchableOpacity 
                        style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          openEditMember(member);
                        }}
                      >
                        <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: 'bold' }}>Edit</Text>
                      </TouchableOpacity>
                      {selectedChitDetails.status === 'recruiting' && (
                        <TouchableOpacity 
                          style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4 }}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveMember(member.user_id);
                          }}
                        >
                          <Text style={{ color: '#EF4444', fontSize: 11, fontWeight: 'bold' }}>Remove</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Monthly Auction Details</Text>
            {selectedChitDetails.auctions.map((auc: any) => (
              <View key={auc.id} style={styles.historyCard}>
                <View style={styles.historyCardHeader}>
                  <Text style={styles.historyMonth}>Month {auc.month_number}</Text>
                  <Text style={[styles.historyStatus, { color: auc.status === 'completed' ? '#10B981' : '#F59E0B' }]}>
                    {auc.status.toUpperCase()}
                  </Text>
                </View>
                
                {auc.status === 'completed' ? (
                  <View>
                    <Text style={styles.historyDetail}>
                      Winner: <Text style={styles.bold}>{auc.winner_name || 'Owner (Commission Release)'}</Text>
                    </Text>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginBottom: 8 }}>
                      📅 Conducted: {formatDate(auc.auction_date)} at {selectedChitDetails.auction_time}
                    </Text>
                    <View style={styles.historyGrid}>
                      <View>
                        <Text style={styles.cardLabel}>WINNING DISCOUNT</Text>
                        <Text style={styles.historyVal}>₹{parseFloat(auc.winning_bid_discount).toLocaleString('en-IN')}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>DIVIDEND (SHARE)</Text>
                        <Text style={styles.historyVal}>₹{parseFloat(auc.dividend_per_member).toLocaleString('en-IN')}</Text>
                      </View>
                      <View>
                        <Text style={styles.cardLabel}>NET INST. PAID</Text>
                        <Text style={styles.historyVal}>₹{parseFloat(auc.net_subscription_due).toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.historyDetail}>
                    📅 Scheduled: {formatDate(auc.auction_date)} at {selectedChitDetails.auction_time}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {activeTab === 'payments' && (
          <View style={styles.card}>
            {(() => {
              const completedAuctions = selectedChitDetails.auctions.filter((a: any) => a.status === 'completed');
              if (completedAuctions.length > 0) {
                const latestCompleted = completedAuctions[completedAuctions.length - 1];
                const paidUserIds = payments.filter((p: any) => p.auction_id === latestCompleted.id && p.payment_status === 'verified').map((p: any) => p.user_id);
                const defaulters = selectedChitDetails.members.filter((m: any) => !paidUserIds.includes(m.user_id) && m.user_id !== selectedChitDetails.foreman_id);
                
                return (
                  <View>
                    {/* Member Pay Dues trigger */}
                    {currentUser.role === 'member' && !paidUserIds.includes(currentUser.id) && (
                      <TouchableOpacity 
                        style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 }}
                        onPress={() => {
                          setPaymentForm((prev: any) => ({ ...prev, selectedAuctionId: latestCompleted.id, amount: parseFloat(latestCompleted.net_subscription_due).toString() }));
                          setShowPaymentUpload(true);
                        }}
                      >
                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>💳 Pay Installment: ₹{parseFloat(latestCompleted.net_subscription_due).toLocaleString('en-IN')}</Text>
                      </TouchableOpacity>
                    )}

                    {currentUser.role === 'foreman' && (
                      <View style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', paddingBottom: 15 }}>
                        <Text style={[styles.cardTitle, { color: '#F59E0B', fontSize: 13, marginBottom: 8 }]}>⚠️ Outstanding Dues (Month {latestCompleted.month_number} Unpaid / బకాయిలు)</Text>
                        {defaulters.length === 0 ? (
                          <Text style={[styles.emptyText, { marginVertical: 4, color: '#10B981', textAlign: 'left' }]}>All members paid up for this month! 🎉</Text>
                        ) : (
                          defaulters.map((m: any) => (
                            <View key={m.user_id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 10, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#475569' }}>
                              <View style={{ flex: 1 }}>
                                <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 13 }}>#{m.member_number} - {m.name}</Text>
                                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>Phone: {m.phone}</Text>
                                <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 2, fontWeight: 'bold' }}>Pending: ₹{parseFloat(latestCompleted.net_subscription_due).toLocaleString('en-IN')}</Text>
                              </View>
                              <TouchableOpacity
                                style={{ backgroundColor: '#25D366', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => {
                                  const msg = `Hi ${m.name}, this is a friendly reminder for your monthly installment of ₹${parseFloat(latestCompleted.net_subscription_due).toLocaleString('en-IN')} for Chit: ${selectedChitDetails.name} (Month ${latestCompleted.month_number}). Please clear your dues as soon as possible. Thank you!`;
                                  Linking.openURL(`https://api.whatsapp.com/send?phone=91${m.phone}&text=${encodeURIComponent(msg)}`);
                                }}
                              >
                                <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>💬 Remind</Text>
                              </TouchableOpacity>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </View>
                );
              }
              return null;
            })()}

            {/* Quick Metrics Summary Header for Owner */}
            {currentUser.role === 'foreman' && (
              <View style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', padding: 15, borderRadius: 10, marginBottom: 20, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, fontWeight: 'bold', marginBottom: 8 }}>📊 LEDGER SUMMARY (యజమాని సారాంశం)</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}>Total Verified</Text>
                    <Text style={{ color: '#10B981', fontSize: 15, fontWeight: 'bold' }}>₹{payVerifiedSum.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={{ borderLeftWidth: 1, borderColor: '#475569', paddingLeft: 15 }}>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}>Pending Review</Text>
                    <Text style={{ color: '#F59E0B', fontSize: 15, fontWeight: 'bold' }}>{payPendingCount} Payments</Text>
                  </View>
                  <View style={{ borderLeftWidth: 1, borderColor: '#475569', paddingLeft: 15 }}>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10 }}>Total Logged</Text>
                    <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 15, fontWeight: 'bold' }}>{payTotalCount} Receipts</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={styles.cardTitle}>Payments Ledger</Text>
              {currentUser.role === 'foreman' && (
                <TouchableOpacity 
                  style={{ backgroundColor: '#4F46E5', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}
                  onPress={handleExportPayments}
                >
                  <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>📥 Export Report</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Panel for Owner */}
            {currentUser.role === 'foreman' && (
              <View style={{ backgroundColor: isDark ? '#1E293B' : '#FFFFFF', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', marginBottom: 20 }}>
                {/* Search Bar */}
                <TextInput
                  style={[styles.input, { marginBottom: 12 }]}
                  placeholder="🔍 Search Member Name or Number..."
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={paySearchQuery}
                  onChangeText={setPaySearchQuery}
                />

                {/* Month Filters */}
                <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 6 }}>Filter by Month:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <TouchableOpacity
                    style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, borderWidth: 1 }, payFilterMonth === 'all' ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                    onPress={() => setPayFilterMonth('all')}
                  >
                    <Text style={{ color: payFilterMonth === 'all' ? '#FFF' : (isDark ? '#94A3B8' : '#64748B'), fontSize: 10, fontWeight: 'bold' }}>All Months</Text>
                  </TouchableOpacity>
                  {selectedChitDetails.auctions.map((a: any) => (
                    <TouchableOpacity
                      key={a.id}
                      style={[{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginRight: 6, borderWidth: 1 }, payFilterMonth === a.month_number ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                      onPress={() => setPayFilterMonth(a.month_number)}
                    >
                      <Text style={{ color: payFilterMonth === a.month_number ? '#FFF' : (isDark ? '#94A3B8' : '#64748B'), fontSize: 10, fontWeight: 'bold' }}>Month {a.month_number}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Status and Mode Filters */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                      {['all', 'pending_approval', 'verified', 'rejected'].map((st) => (
                        <TouchableOpacity
                          key={st}
                          style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 4, borderWidth: 1 }, payFilterStatus === st ? { backgroundColor: '#10B981', borderColor: '#10B981' } : { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                          onPress={() => setPayFilterStatus(st)}
                        >
                          <Text style={{ color: payFilterStatus === st ? '#FFF' : (isDark ? '#94A3B8' : '#64748B'), fontSize: 9, fontWeight: 'bold' }}>
                            {st.replace('_', ' ').toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={{ flex: 0.8 }}>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>Mode:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                      {['all', 'upi', 'cash'].map((md) => (
                        <TouchableOpacity
                          key={md}
                          style={[{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginRight: 4, borderWidth: 1 }, payFilterMode === md ? { backgroundColor: '#F59E0B', borderColor: '#F59E0B' } : { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' }]}
                          onPress={() => setPayFilterMode(md)}
                        >
                          <Text style={{ color: payFilterMode === md ? '#FFF' : (isDark ? '#94A3B8' : '#64748B'), fontSize: 9, fontWeight: 'bold' }}>
                            {md.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            )}

            {filteredPayments.length === 0 ? (
              <Text style={styles.emptyText}>No matching payments found.</Text>
            ) : (
              filteredPayments.map((p: any) => (
                <View key={p.id} style={styles.paymentCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.paymentMember}>#{p.member_number} - {p.name}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: p.payment_status === 'verified' ? '#065F46' : p.payment_status === 'rejected' ? '#7F1D1D' : '#92400E'
                    }]}>
                      <Text style={styles.statusBadgeText}>{p.payment_status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.paymentBody}>
                    <Text style={styles.paymentInfo}>Amount: <Text style={styles.bold}>₹{parseFloat(p.amount_paid.toString()).toLocaleString('en-IN')}</Text></Text>
                    <Text style={styles.paymentInfo}>Mode: {p.payment_mode.toUpperCase()} (Month {p.month_number || 1})</Text>
                  </View>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4, paddingHorizontal: 12 }}>
                    🕒 Paid on: {formatDateTime(p.created_at)}
                  </Text>
                  {currentUser.role === 'foreman' && p.payment_status === 'pending_approval' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.actionBtnSec, { backgroundColor: '#10B981' }]} onPress={() => handleVerifyPayment(p.id, 'verified')}>
                        <Text style={styles.actionBtnSecText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtnSec, { backgroundColor: '#EF4444' }]} onPress={() => handleVerifyPayment(p.id, 'rejected')}>
                        <Text style={styles.actionBtnSecText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'sureties' && (
          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>Guarantors & Securities</Text>
              {currentUser.role === 'member' && (
                <TouchableOpacity style={styles.payBtn} onPress={() => {
                  const wonAuc = selectedChitDetails.auctions.find((a: any) => a.winning_member_id === currentUser.id && a.surety_status !== 'approved');
                  if (wonAuc) {
                    setSuretyForm((prev: any) => ({ ...prev, selectedAuctionId: wonAuc.id }));
                    setShowSuretyUpload(true);
                  } else {
                    Alert.alert('Info', 'Sureties are either approved, or you have not won any auction yet.');
                  }
                }}>
                  <Text style={styles.payBtnText}>Submit Guarantor Security</Text>
                </TouchableOpacity>
              )}
            </View>

            {sureties.length === 0 ? (
              <Text style={styles.emptyText}>No surety documents submitted.</Text>
            ) : (
              sureties.map((s: any) => (
                <View key={s.id} style={styles.paymentCard}>
                  <View style={styles.historyCardHeader}>
                    <Text style={styles.paymentMember}>{s.guarantor_name} ({s.guarantor_relation})</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: s.status === 'approved' ? '#065F46' : s.status === 'rejected' ? '#7F1D1D' : '#92400E'
                    }]}>
                      <Text style={styles.statusBadgeText}>{s.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <View style={styles.paymentBody}>
                    <Text style={styles.paymentInfo}>Phone: {s.guarantor_phone}</Text>
                    <Text style={styles.paymentInfo}>Doc Type: {s.document_type.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4, paddingHorizontal: 12 }}>
                    🕒 Submitted on: {formatDateTime(s.created_at)}
                  </Text>
                  {currentUser.role === 'foreman' && s.status === 'pending' && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity style={[styles.actionBtnSec, { backgroundColor: '#10B981' }]} onPress={() => handleVerifySurety(s.id, 'approved')}>
                        <Text style={styles.actionBtnSecText}>Approve</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionBtnSec, { backgroundColor: '#EF4444' }]} onPress={() => handleVerifySurety(s.id, 'rejected')}>
                        <Text style={styles.actionBtnSecText}>Reject</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}

            {/* Released bank payouts releases */}
            {currentUser.role === 'foreman' && selectedChitDetails.auctions.map((a: any) => {
              if (a.winning_member_id && a.winning_member_id !== currentUser.id && !a.prize_disbursed) {
                return (
                  <View key={a.id} style={[styles.disbursalCard, { marginTop: 20 }]}>
                    <Text style={styles.disbursalCardTitle}>Payout Transfer Release</Text>
                    <Text style={styles.disbursalCardText}>Winner: {a.winner_name}</Text>
                    <Text style={styles.disbursalCardText}>Payout: ₹{parseFloat((selectedChitDetails.chit_value - a.winning_bid_discount).toString()).toLocaleString('en-IN')}</Text>
                    <Text style={styles.disbursalCardText}>Security Status: {a.surety_status.toUpperCase()}</Text>
                    
                    <TouchableOpacity
                      disabled={a.surety_status !== 'approved'}
                      style={[styles.actionBtn, { backgroundColor: a.surety_status === 'approved' ? '#10B981' : '#475569', marginTop: 10 }]}
                      onPress={() => handleDisburseMoney(a.id)}
                    >
                      <Text style={styles.actionBtnText}>Confirm Bank Payout Transfer</Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return null;
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};
