import React from 'react';
import { View, Text, Modal, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Animated, Linking } from 'react-native';

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

interface ChitModalsProps {
  appState: any;
  styles: any;
  isDark: boolean;
  auctionSocket: any;
}

export const ChitModals: React.FC<ChitModalsProps> = ({ appState, styles, isDark, auctionSocket }) => {
  const {
    serverUrl,
    setServerUrl,
    showServerSettings,
    setShowServerSettings,
    showCreateChit,
    setShowCreateChit,
    newChitForm,
    setNewChitForm,
    newChitMembers,
    setNewChitMembers,
    addMemberName,
    setAddMemberName,
    addMemberPhone,
    setAddMemberPhone,
    handleCreateChit,
    showPaymentUpload,
    setShowPaymentUpload,
    paymentForm,
    setPaymentForm,
    handleSubmitPayment,
    showSuretyUpload,
    setShowSuretyUpload,
    suretyForm,
    setSuretyForm,
    handleSubmitSurety,
    showAddMemberModal,
    setShowAddMemberModal,
    addMemberForm,
    setAddMemberForm,
    handleAddMember,
    showEditMemberModal,
    setShowEditMemberModal,
    editMemberForm,
    setEditMemberForm,
    handleEditMember,
    showMemberDetailModal,
    setShowMemberDetailModal,
    memberDetailData,
    setMemberDetailData,
    showAuctionRoom,
    setShowAuctionRoom,
    currentUser,
    selectedChitDetails
  } = appState;

  const {
    auctionRoomState,
    myBid,
    setMyBid,
    submitBid,
    forceEndAuction,
    conductLotteryDraw,
    spinValue
  } = auctionSocket;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <>
      {/* 1. Modal: Server Settings */}
      <Modal visible={showServerSettings} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Connection settings</Text>
              <TouchableOpacity onPress={() => setShowServerSettings(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ padding: 15 }}>
              <Text style={styles.inputLabel}>Backend Server URL</Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="e.g. http://localhost:3000"
              />
              <Text style={styles.settingsTip}>
                Specify your active node express socket.io server port connection string.
              </Text>
              <TouchableOpacity style={styles.submitBtn} onPress={() => setShowServerSettings(false)}>
                <Text style={styles.submitBtnText}>Apply Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. Modal: Create Chit Group */}
      <Modal visible={showCreateChit} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Chit Group</Text>
              <TouchableOpacity onPress={() => setShowCreateChit(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll}>
              {/* Quick Preset Templates */}
              <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 }}>
                ⚡ Quick Preset Templates
              </Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
                {[
                  { label: '₹1 Lakh (10M)', value: '100000', members: '10', commission: '5', day: '5' },
                  { label: '₹5 Lakh (20M)', value: '500000', members: '20', commission: '5', day: '10' },
                  { label: '₹10 Lakh (20M)', value: '1000000', members: '20', commission: '5', day: '15' },
                ].map((t, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flex: 1, backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF',
                      borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.3)' : '#C7D2FE',
                      paddingVertical: 6, borderRadius: 8, alignItems: 'center',
                    }}
                    onPress={() => {
                      setNewChitForm(prev => ({
                        ...prev,
                        chitValue: t.value,
                        membersCount: t.members,
                        durationMonths: t.members,
                        foremanCommissionPct: t.commission,
                        auctionDayOfMonth: t.day
                      }));
                    }}
                  >
                    <Text style={{ color: isDark ? '#A5B4FC' : '#4F46E5', fontSize: 10, fontWeight: '700' }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Chit Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vijayawada Gold Chit Group C"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={newChitForm.name}
                onChangeText={(text) => setNewChitForm(prev => ({ ...prev, name: text }))}
              />

              <Text style={styles.inputLabel}>Chit Value (₹)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={newChitForm.chitValue}
                onChangeText={(text) => setNewChitForm(prev => ({ ...prev, chitValue: text }))}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Members Limit</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newChitForm.membersCount}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, membersCount: text, durationMonths: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration (Months)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newChitForm.durationMonths}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, durationMonths: text }))}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Owner Comm %</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newChitForm.foremanCommissionPct}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, foremanCommissionPct: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Max Bid Discount %</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newChitForm.maxBidDiscountPct}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, maxBidDiscountPct: text }))}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>First Month Rule</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[styles.radioBtn, newChitForm.firstMonthRule === 'foreman_takes' && styles.radioBtnActive]}
                  onPress={() => setNewChitForm(prev => ({ ...prev, firstMonthRule: 'foreman_takes' }))}
                >
                  <Text style={[styles.radioText, newChitForm.firstMonthRule === 'foreman_takes' && styles.radioTextActive]}>
                    Owner takes Month 1
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioBtn, newChitForm.firstMonthRule === 'normal_auction' && styles.radioBtnActive]}
                  onPress={() => setNewChitForm(prev => ({ ...prev, firstMonthRule: 'normal_auction' }))}
                >
                  <Text style={[styles.radioText, newChitForm.firstMonthRule === 'normal_auction' && styles.radioTextActive]}>
                    Auction Month 1
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Auction Day of Month</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={newChitForm.auctionDayOfMonth}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, auctionDayOfMonth: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Auction Time</Text>
                  <TextInput
                    style={styles.input}
                    value={newChitForm.auctionTime}
                    onChangeText={(text) => setNewChitForm(prev => ({ ...prev, auctionTime: text }))}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { fontWeight: 'bold', marginTop: 15 }]}>Add Members List (మెంబర్ల నమోదు):</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
                <TextInput
                  style={[styles.input, { flex: 1.5 }]}
                  placeholder="Member Name"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={addMemberName}
                  onChangeText={setAddMemberName}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  maxLength={10}
                  keyboardType="phone-pad"
                  placeholder="Mobile Phone"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={addMemberPhone}
                  onChangeText={setAddMemberPhone}
                />
                <TouchableOpacity 
                  style={{ backgroundColor: '#10B981', paddingHorizontal: 12, justifyContent: 'center', borderRadius: 8, height: 48 }}
                  onPress={() => {
                    if (addMemberName && addMemberPhone) {
                      setNewChitMembers(prev => [...prev, { name: addMemberName, phone: addMemberPhone }]);
                      setAddMemberName('');
                      setAddMemberPhone('');
                    }
                  }}
                >
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>

              {newChitMembers.map((m, idx) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 8, backgroundColor: isDark ? '#334155' : '#F1F5F9', borderRadius: 6, marginBottom: 4 }}>
                  <Text style={{ color: isDark ? '#FFF' : '#0F172A' }}>#{idx+2} {m.name} ({m.phone})</Text>
                  <TouchableOpacity onPress={() => setNewChitMembers(prev => prev.filter((_, i) => i !== idx))}>
                    <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.submitBtn} onPress={handleCreateChit}>
                <Text style={styles.submitBtnText}>Submit & Launch Group</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. Modal: Upload Payment Receipt */}
      <Modal visible={showPaymentUpload} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Payment Receipt</Text>
              <TouchableOpacity onPress={() => setShowPaymentUpload(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Installment Amount</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={paymentForm.amount}
                onChangeText={(text) => setPaymentForm(prev => ({ ...prev, amount: text }))}
              />
              <Text style={styles.inputLabel}>Payment Mode</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[styles.radioBtn, paymentForm.mode === 'upi' && styles.radioBtnActive]}
                  onPress={() => setPaymentForm(prev => ({ ...prev, mode: 'upi' }))}
                >
                  <Text style={[styles.radioText, paymentForm.mode === 'upi' && styles.radioTextActive]}>UPI Mode</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioBtn, paymentForm.mode === 'cash' && styles.radioBtnActive]}
                  onPress={() => setPaymentForm(prev => ({ ...prev, mode: 'cash' }))}
                >
                  <Text style={[styles.radioText, paymentForm.mode === 'cash' && styles.radioTextActive]}>Cash Mode</Text>
                </TouchableOpacity>
              </View>

              {paymentForm.mode === 'upi' && (
                <View style={{
                  backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : '#EEF2FF',
                  padding: 14, borderRadius: 12, marginBottom: 15, alignItems: 'center',
                  borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.2)' : '#C7D2FE',
                }}>
                  <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
                    📲 Dynamic UPI Instant Pay (Scan or Tap)
                  </Text>
                  
                  {/* Visual QR Simulator */}
                  <View style={{
                    width: 120, height: 120, backgroundColor: '#FFF', borderRadius: 10,
                    alignItems: 'center', justifyContent: 'center', padding: 8, marginBottom: 10,
                    borderWidth: 1, borderColor: '#CBD5E1'
                  }}>
                    <Text style={{ fontSize: 40 }}>📱</Text>
                    <Text style={{ color: '#0F172A', fontSize: 9, fontWeight: 'bold', marginTop: 4 }}>
                      UPI ID: foreman@upi
                    </Text>
                    <Text style={{ color: '#10B981', fontSize: 9, fontWeight: 'bold' }}>
                      ₹{parseFloat(paymentForm.amount || 0).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* 1-Click Deep Links */}
                  <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 9, marginBottom: 6 }}>
                    Tap to open your installed payment app:
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: '#5F259F', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => Linking.openURL(`upi://pay?pa=foreman@upi&pn=ChitSangham&am=${paymentForm.amount || 0}`)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>PhonePe ➔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ backgroundColor: '#1A73E8', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => Linking.openURL(`upi://pay?pa=foreman@upi&pn=ChitSangham&am=${paymentForm.amount || 0}`)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>GPay ➔</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ backgroundColor: '#00B9F1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 }}
                      onPress={() => Linking.openURL(`upi://pay?pa=foreman@upi&pn=ChitSangham&am=${paymentForm.amount || 0}`)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 9, fontWeight: 'bold' }}>Paytm ➔</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <Text style={styles.inputLabel}>Receipt Reference / URL</Text>
              <TextInput
                style={styles.input}
                value={paymentForm.receiptUrl}
                onChangeText={(text) => setPaymentForm(prev => ({ ...prev, receiptUrl: text }))}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitPayment}>
                <Text style={styles.submitBtnText}>Submit Receipt</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. Modal: Upload Surety Guarantor Details */}
      <Modal visible={showSuretyUpload} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit Guarantor Details</Text>
              <TouchableOpacity onPress={() => setShowSuretyUpload(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Guarantor Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chandra Shekar"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={suretyForm.guarantorName}
                onChangeText={(text) => setSuretyForm(prev => ({ ...prev, guarantorName: text }))}
              />
              <Text style={styles.inputLabel}>Guarantor Phone Number</Text>
              <TextInput
                style={styles.input}
                maxLength={10}
                keyboardType="phone-pad"
                placeholder="e.g. 9111222333"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={suretyForm.guarantorPhone}
                onChangeText={(text) => setSuretyForm(prev => ({ ...prev, guarantorPhone: text }))}
              />
              <Text style={styles.inputLabel}>Relation to Member</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Uncle / Govt Employee"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={suretyForm.guarantorRelation}
                onChangeText={(text) => setSuretyForm(prev => ({ ...prev, guarantorRelation: text }))}
              />
              <Text style={styles.inputLabel}>Document Type</Text>
              <View style={styles.radioRow}>
                <TouchableOpacity
                  style={[styles.radioBtn, suretyForm.documentType === 'government_id' && styles.radioBtnActive]}
                  onPress={() => setSuretyForm(prev => ({ ...prev, documentType: 'government_id' }))}
                >
                  <Text style={[styles.radioText, suretyForm.documentType === 'government_id' && styles.radioTextActive]}>Govt ID</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.radioBtn, suretyForm.documentType === 'payslip' && styles.radioBtnActive]}
                  onPress={() => setSuretyForm(prev => ({ ...prev, documentType: 'payslip' }))}
                >
                  <Text style={[styles.radioText, suretyForm.documentType === 'payslip' && styles.radioTextActive]}>Payslip</Text>
                </TouchableOpacity>
              </View>

              <View style={{
                backgroundColor: isDark ? 'rgba(99,102,241,0.08)' : '#EEF2FF',
                padding: 12, borderRadius: 10, marginBottom: 14,
                borderWidth: 1, borderColor: isDark ? 'rgba(99,102,241,0.2)' : '#C7D2FE',
              }}>
                <Text style={{ color: isDark ? '#A5B4FC' : '#4F46E5', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 }}>
                  ⚡ Quick Attach from My Profile Vault
                </Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {[
                    { label: '🪪 Stored Aadhaar', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136', type: 'government_id' },
                    { label: '📄 Stored Payslip', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c', type: 'payslip' },
                  ].map((doc, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={{
                        flex: 1, backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderWidth: 1, borderColor: isDark ? '#334155' : '#CBD5E1',
                        paddingVertical: 6, borderRadius: 6, alignItems: 'center',
                      }}
                      onPress={() => {
                        setSuretyForm(prev => ({
                          ...prev,
                          documentUrl: doc.url,
                          documentType: doc.type
                        }));
                      }}
                    >
                      <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 10, fontWeight: '700' }}>
                        {doc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Text style={styles.inputLabel}>Document Upload Image URL</Text>
              <TextInput
                style={styles.input}
                value={suretyForm.documentUrl}
                onChangeText={(text) => setSuretyForm(prev => ({ ...prev, documentUrl: text }))}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitSurety}>
                <Text style={styles.submitBtnText}>Submit Surety Security</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. Modal: Add Member */}
      <Modal visible={showAddMemberModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Member (సభ్యుడిని చేర్చండి)</Text>
              <TouchableOpacity onPress={() => setShowAddMemberModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Full Name (పేరు)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Ramesh Kumar"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={addMemberForm.name}
                onChangeText={(text) => setAddMemberForm(prev => ({ ...prev, name: text }))}
              />
              <Text style={styles.inputLabel}>Mobile Number (మొబైల్ సంఖ్య)</Text>
              <TextInput
                style={styles.input}
                maxLength={10}
                keyboardType="phone-pad"
                placeholder="e.g. 9000000001"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={addMemberForm.phone}
                onChangeText={(text) => setAddMemberForm(prev => ({ ...prev, phone: text }))}
              />
              <Text style={styles.inputLabel}>Assign Member Number (సభ్యత్వ సంఖ్య)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g. 3"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={addMemberForm.memberNumber}
                onChangeText={(text) => setAddMemberForm(prev => ({ ...prev, memberNumber: text }))}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddMember}>
                <Text style={styles.submitBtnText}>Add Member to Chit</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. Modal: Edit Member */}
      <Modal visible={showEditMemberModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Member Details</Text>
              <TouchableOpacity onPress={() => setShowEditMemberModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editMemberForm.name}
                onChangeText={(text) => setEditMemberForm(prev => ({ ...prev, name: text }))}
              />
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                maxLength={10}
                keyboardType="phone-pad"
                value={editMemberForm.phone}
                onChangeText={(text) => setEditMemberForm(prev => ({ ...prev, phone: text }))}
              />
              <Text style={styles.inputLabel}>Member Number</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={editMemberForm.memberNumber}
                onChangeText={(text) => setEditMemberForm(prev => ({ ...prev, memberNumber: text }))}
              />
              <TouchableOpacity style={styles.submitBtn} onPress={handleEditMember}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. Modal: Member Profile Details */}
      <Modal visible={showMemberDetailModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Member Complete Profile</Text>
              <TouchableOpacity onPress={() => {
                setShowMemberDetailModal(false);
                setMemberDetailData(null);
              }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {memberDetailData ? (
              currentUser.role === 'foreman' ? (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                  <View style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', padding: 15, borderRadius: 10, marginBottom: 20 }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 18, fontWeight: 'bold' }}>👤 {memberDetailData.profile.name}</Text>
                    <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13, marginTop: 4 }}>Phone: {memberDetailData.profile.phone}</Text>
                    <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: 'bold', marginTop: 4, textTransform: 'uppercase' }}>Role: {memberDetailData.profile.role}</Text>
                  </View>

                  <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>📊 Enrolled Chit Groups ({memberDetailData.chits.length})</Text>
                  {memberDetailData.chits.length === 0 ? (
                    <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 15 }}>Not enrolled in any chit groups.</Text>
                  ) : (
                    memberDetailData.chits.map((c: any) => (
                      <View key={c.id} style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', padding: 10, borderRadius: 6, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1, marginRight: 10 }}>
                          <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 13, fontWeight: 'bold' }}>{c.name}</Text>
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>Member Number: #{c.member_number} ({c.role_in_chit === 'foreman' ? 'Owner' : 'Member'})</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: c.status === 'active' ? '#065F46' : '#92400E' }]}>
                          <Text style={styles.statusBadgeText}>{c.status.toUpperCase()}</Text>
                        </View>
                      </View>
                    ))
                  )}

                  <View style={{ height: 15 }} />

                  <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>💰 Submitted Payments Ledger ({memberDetailData.payments.length})</Text>
                  {memberDetailData.payments.length === 0 ? (
                    <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 15 }}>No payments submitted yet.</Text>
                  ) : (
                    memberDetailData.payments.map((p: any) => (
                      <View key={p.id} style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: isDark ? '#FFF' : '#000', fontWeight: 'bold', fontSize: 13 }}>₹{parseFloat(p.amount_paid).toLocaleString('en-IN')}</Text>
                          <View style={[styles.statusBadge, { backgroundColor: p.payment_status === 'verified' ? '#065F46' : p.payment_status === 'rejected' ? '#7F1D1D' : '#92400E' }]}>
                            <Text style={styles.statusBadgeText}>{p.payment_status.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4 }}>Group: {p.chit_name} (Month {p.month_number})</Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>Mode: {p.payment_mode.toUpperCase()}</Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>🕒 Paid on: {formatDateTime(p.created_at)}</Text>
                        {p.receipt_image_url && (
                          <TouchableOpacity style={{ marginTop: 6 }} onPress={() => Linking.openURL(p.receipt_image_url)}>
                            <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: 'bold', textDecorationLine: 'underline' }}>📂 View Payment Receipt</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}

                  <View style={{ height: 15 }} />

                  <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 8 }}>🛡️ Submitted Guarantor Securities ({memberDetailData.sureties.length})</Text>
                  {memberDetailData.sureties.length === 0 ? (
                    <Text style={{ color: '#64748B', fontSize: 12, marginBottom: 15 }}>No surety documents submitted.</Text>
                  ) : (
                    memberDetailData.sureties.map((s: any) => (
                      <View key={s.id} style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', padding: 10, borderRadius: 8, marginBottom: 8, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: isDark ? '#FFF' : '#000', fontWeight: 'bold', fontSize: 13 }}>{s.guarantor_name} ({s.guarantor_relation})</Text>
                          <View style={[styles.statusBadge, { backgroundColor: s.status === 'approved' ? '#065F46' : s.status === 'rejected' ? '#7F1D1D' : '#92400E' }]}>
                            <Text style={styles.statusBadgeText}>{s.status.toUpperCase()}</Text>
                          </View>
                        </View>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4 }}>Chit: {s.chit_name} (Month {s.month_number})</Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>Phone: {s.guarantor_phone}</Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>Doc Type: {s.document_type.replace('_', ' ').toUpperCase()}</Text>
                        <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}>🕒 Submitted on: {formatDateTime(s.created_at)}</Text>
                        {s.document_url && (
                          <TouchableOpacity style={{ marginTop: 6 }} onPress={() => Linking.openURL(s.document_url)}>
                            <Text style={{ color: '#818CF8', fontSize: 11, fontWeight: 'bold', textDecorationLine: 'underline' }}>📂 View Document</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ))
                  )}
                </ScrollView>
              ) : (
                <ScrollView contentContainerStyle={{ padding: 20 }}>
                  <View style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', padding: 15, borderRadius: 10, marginBottom: 20 }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 18, fontWeight: 'bold' }}>👤 {memberDetailData.profile.name}</Text>
                    {(() => {
                      const matchedMember = selectedChitDetails.members.find((m: any) => m.user_id === memberDetailData.profile.id);
                      return matchedMember ? (
                        <Text style={{ color: '#818CF8', fontSize: 13, fontWeight: 'bold', marginTop: 4 }}>Member Number: #{matchedMember.member_number}</Text>
                      ) : null;
                    })()}
                  </View>

                  <View style={{ backgroundColor: isDark ? '#1E293B' : '#F1F5F9', padding: 15, borderRadius: 10, gap: 12 }}>
                    <Text style={{ color: isDark ? '#FFF' : '#000', fontSize: 15, fontWeight: 'bold', marginBottom: 4 }}>Chit Group Status</Text>
                    
                    {/* 1. Prize money collected/lifted status */}
                    {(() => {
                      const wonAuction = selectedChitDetails.auctions.find((a: any) => a.winning_member_id === memberDetailData.profile.id && a.status === 'completed');
                      return (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13 }}>Prize Lifted / Collected:</Text>
                          <View style={[styles.statusBadge, { backgroundColor: wonAuction ? '#065F46' : '#475569' }]}>
                            <Text style={styles.statusBadgeText}>{wonAuction ? `YES (Month ${wonAuction.month_number})` : 'NO'}</Text>
                          </View>
                        </View>
                      );
                    })()}

                    {/* 2. Monthly installment payment status */}
                    {(() => {
                      const completedAuctions = selectedChitDetails.auctions.filter((a: any) => a.status === 'completed');
                      if (completedAuctions.length === 0) {
                        return <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>No auction conducted yet.</Text>;
                      }
                      const latestCompleted = completedAuctions[completedAuctions.length - 1];
                      // Find if this member has a verified payment logged for the latest completed month
                      const hasPaidCurrentMonth = memberDetailData.payments.some((p: any) => p.auction_id === latestCompleted.id && p.payment_status === 'verified');
                      
                      return (
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 13 }}>Month {latestCompleted.month_number} Installment Paid:</Text>
                          <View style={[styles.statusBadge, { backgroundColor: hasPaidCurrentMonth ? '#065F46' : '#7F1D1D' }]}>
                            <Text style={styles.statusBadgeText}>{hasPaidCurrentMonth ? 'PAID' : 'PENDING'}</Text>
                          </View>
                        </View>
                      );
                    })()}
                  </View>
                </ScrollView>
              )
            ) : (
              <ActivityIndicator size="large" color="#6366F1" style={{ marginVertical: 40 }} />
            )}
          </View>
        </View>
      </Modal>

      {/* 8. Modal: Live Auction Bidding Room */}
      <Modal visible={showAuctionRoom} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.auctionModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Live Auction Bidding Room</Text>
              <TouchableOpacity onPress={() => setShowAuctionRoom(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.auctionRoomScroll}>
              <View style={styles.timerContainer}>
                <Text style={styles.timeLeftLabel}>COUNTDOWN TIMER</Text>
                <Text style={[styles.timeLeftValue, { color: auctionRoomState.timeLeft < 15 ? '#EF4444' : '#10B981' }]}>
                  {auctionRoomState.timeLeft}s
                </Text>
              </View>

              {auctionRoomState.status === 'live' && (
                <View>
                  <View style={styles.bidBanner}>
                    <Text style={styles.bidBannerLabel}>CURRENT HIGHEST BID DISCOUNT (వేలం తగ్గింపు)</Text>
                    <Text style={styles.bidBannerValue}>₹{auctionRoomState.highestBidDiscount.toLocaleString('en-IN')}</Text>
                    <Text style={styles.bidBannerWinner}>
                      Leader: <Text style={{ fontWeight: 'bold' }}>{auctionRoomState.highestBidderName || 'No Bids Yet'}</Text>
                    </Text>
                  </View>

                  <View style={styles.calculationPreview}>
                    <Text style={styles.calcTitle}>DIVIDEND POOL (డివిడెండ్ పూల్)</Text>
                    <Text style={styles.calcValue}>
                      ₹{Math.max(0, auctionRoomState.highestBidDiscount - (parseFloat(selectedChitDetails.chit_value) * parseFloat(selectedChitDetails.foreman_commission_pct) / 100)).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.calcTitle, { marginTop: 6 }]}>ESTIMATED DIVIDEND PER MEMBER (సభ్యుని డివిడెండ్ షేర్)</Text>
                    <Text style={[styles.calcValue, { color: '#818CF8' }]}>
                      ₹{(Math.max(0, auctionRoomState.highestBidDiscount - (parseFloat(selectedChitDetails.chit_value) * parseFloat(selectedChitDetails.foreman_commission_pct) / 100)) / parseInt(selectedChitDetails.members_count)).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {currentUser.role === 'member' ? (
                    <View style={styles.biddingControl}>
                      <Text style={styles.bidInputLabel}>Submit Your Bid (వేలం విలువ నమోదు చేయండి)</Text>
                      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                        <TextInput
                          style={[styles.input, { flex: 1, marginBottom: 0 }]}
                          keyboardType="numeric"
                          placeholder={`Enter bid (> ₹${auctionRoomState.highestBidDiscount})`}
                          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                          onChangeText={(text) => setMyBid(parseInt(text) || 0)}
                        />
                        <TouchableOpacity style={styles.submitBidBtn} onPress={() => submitBid(myBid)}>
                          <Text style={styles.submitBidBtnText}>Bid</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 8 }}>
                        * Maximum discount cap is limited to ₹{auctionRoomState.maxBidDiscount.toLocaleString('en-IN')} (30%).
                      </Text>
                      
                      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {[5000, 10000, 25000, 50000].map((inc) => {
                          const quickBid = Math.min(auctionRoomState.maxBidDiscount, auctionRoomState.highestBidDiscount + inc);
                          return (
                            <TouchableOpacity
                              key={inc}
                              style={{ backgroundColor: isDark ? '#334155' : '#E2E8F0', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}
                              onPress={() => submitBid(quickBid)}
                            >
                              <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 11, fontWeight: 'bold' }}>+{inc / 1000}k</Text>
                            </TouchableOpacity>
                          );
                        })}
                        <TouchableOpacity
                          style={{ backgroundColor: '#4F46E5', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6 }}
                          onPress={() => submitBid(auctionRoomState.maxBidDiscount)}
                        >
                          <Text style={{ color: '#FFF', fontSize: 11, fontWeight: 'bold' }}>MAX CAP</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={{ gap: 10 }}>
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={forceEndAuction}>
                        <Text style={styles.actionBtnText}>Force End Bidding Room</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {auctionRoomState.tiedSubscribers.length > 0 && (
                    <View style={{ marginTop: 20, padding: 12, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B' }}>
                      <Text style={{ color: '#F59E0B', fontWeight: 'bold', fontSize: 13 }}>⚠️ Maximum Cap Tie Detected ({auctionRoomState.tiedSubscribers.length} Members)</Text>
                      <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 11, marginTop: 4 }}>
                        The following members hit the max cap discount:
                      </Text>
                      {auctionRoomState.tiedSubscribers.map((userId: string, idx: number) => {
                        const matched = selectedChitDetails.members.find((m: any) => m.user_id === userId);
                        return <Text key={userId} style={{ color: isDark ? '#FFF' : '#000', fontSize: 12, fontWeight: 'bold', marginTop: 2 }}>- #{matched?.member_number} {matched?.name}</Text>;
                      })}
                    </View>
                  )}
                </View>
              )}

              {auctionRoomState.status === 'lottery' && (
                <View style={styles.lotteryContainer}>
                  <Text style={styles.lotteryTitle}>🎲 Conduct Lottery Draw 🎲</Text>
                  <Text style={styles.lotterySub}>Multiple members hit the max cap. Release a random draw to decide the monthly prized winner.</Text>
                  
                  <Animated.View style={[styles.spinningWheel, { transform: [{ rotate: spin }] }]}>
                    <View style={styles.wheelSegment1} />
                    <View style={styles.wheelSegment2} />
                    <Text style={{ color: '#FFF', fontWeight: 'bold', zIndex: 10, fontSize: 16 }}>SPINNING</Text>
                  </Animated.View>

                  {currentUser.role === 'foreman' && (
                    <TouchableOpacity 
                      style={[styles.submitBtn, { width: '80%', backgroundColor: '#F59E0B', marginTop: 30 }]} 
                      onPress={() => {
                        const candidates = selectedChitDetails.members
                          .filter((m: any) => auctionRoomState.tiedSubscribers.includes(m.user_id))
                          .map((m: any) => ({ id: m.user_id, name: m.name }));
                        conductLotteryDraw(candidates);
                      }}
                    >
                      <Text style={[styles.submitBtnText, { color: '#000' }]}>Trigger Random Lottery Winner</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {auctionRoomState.status === 'completed' && (
                <View style={styles.lotteryContainer}>
                  <Text style={[styles.lotteryTitle, { color: '#10B981' }]}>✓ Auction Completed</Text>
                  <Text style={styles.winnerAnnounce}>Winner: {auctionRoomState.highestBidderName}</Text>
                  <Text style={styles.winnerBidText}>Winning Bid Discount: ₹{auctionRoomState.highestBidDiscount.toLocaleString('en-IN')}</Text>
                  <TouchableOpacity style={[styles.submitBtn, { width: '60%' }]} onPress={() => setShowAuctionRoom(false)}>
                    <Text style={styles.submitBtnText}>Close Room</Text>
                  </TouchableOpacity>
                </View>
              )}

              {auctionRoomState.status === 'upcoming' && (
                <View style={styles.lotteryContainer}>
                  <Text style={styles.lotteryTitle}>Auction Setting Up...</Text>
                  <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Edit Chit Group Modal */}
      <Modal visible={appState.showEditChitModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Edit Chit Group Settings</Text>
              <TouchableOpacity onPress={() => appState.setShowEditChitModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Chit Name</Text>
              <TextInput
                style={styles.input}
                value={appState.editChitForm.name}
                onChangeText={(text) => appState.setEditChitForm((prev: any) => ({ ...prev, name: text }))}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Foreman Commission (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={appState.editChitForm.foremanCommissionPct}
                    onChangeText={(text) => appState.setEditChitForm((prev: any) => ({ ...prev, foremanCommissionPct: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Max Bid Discount (%)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={appState.editChitForm.maxBidDiscountPct}
                    onChangeText={(text) => appState.setEditChitForm((prev: any) => ({ ...prev, maxBidDiscountPct: text }))}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Auction Day of Month (1-31)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={appState.editChitForm.auctionDayOfMonth}
                    onChangeText={(text) => appState.setEditChitForm((prev: any) => ({ ...prev, auctionDayOfMonth: text }))}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Auction Time (24h)</Text>
                  <TextInput
                    style={styles.input}
                    value={appState.editChitForm.auctionTime}
                    onChangeText={(text) => appState.setEditChitForm((prev: any) => ({ ...prev, auctionTime: text }))}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Group Status</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 15 }}>
                {['recruiting', 'active', 'completed'].map((st: string) => (
                  <TouchableOpacity
                    key={st}
                    style={{
                      flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
                      backgroundColor: appState.editChitForm.status === st ? '#6366F1' : (isDark ? '#1E293B' : '#F1F5F9'),
                    }}
                    onPress={() => appState.setEditChitForm((prev: any) => ({ ...prev, status: st }))}
                  >
                    <Text style={{
                      color: appState.editChitForm.status === st ? '#FFF' : (isDark ? '#94A3B8' : '#64748B'),
                      fontSize: 10, fontWeight: '700', textTransform: 'uppercase',
                    }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitBtn} onPress={appState.handleUpdateChit}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
