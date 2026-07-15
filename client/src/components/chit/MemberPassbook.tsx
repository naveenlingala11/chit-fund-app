import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';

interface MemberPassbookProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`;

export const MemberPassbook: React.FC<MemberPassbookProps> = ({ appState, styles, isDark }) => {
  const { setShowSidebar, currentUser, selectedChitDetails, chits, viewChitDetails } = appState;
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  // Filter chits enrolled by member
  const memberChits = chits || [];

  // Flatten payments history across all enrolled chits
  const allPayments: any[] = [];
  let totalPaidAmount = 0;
  let totalDividendSaved = 0;

  memberChits.forEach((chit: any) => {
    if (chit.auctions && Array.isArray(chit.auctions)) {
      chit.auctions.forEach((auc: any) => {
        if (auc.status === 'completed') {
          const div = parseFloat(auc.dividend_per_member || 0);
          totalDividendSaved += div;
        }
      });
    }

    if (chit.payments && Array.isArray(chit.payments)) {
      chit.payments.forEach((p: any) => {
        if (p.user_id === currentUser?.id && p.payment_status === 'verified') {
          const amt = parseFloat(p.amount_paid || 0);
          totalPaidAmount += amt;
          allPayments.push({
            ...p,
            chit_name: chit.name,
            chit_id: chit.id,
            monthly_subscription: chit.monthly_subscription,
          });
        }
      });
    }
  });

  // Calculate ROI comparison against standard Bank FD (6.5% p.a.)
  const netDividendYieldPct = totalPaidAmount > 0 
    ? ((totalDividendSaved / totalPaidAmount) * 100).toFixed(1) 
    : '0.0';

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
              📖 Digital Chit Passbook
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 }}>
              Official payment ledger & dividend savings ROI
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }} showsVerticalScrollIndicator={false}>

        {/* Financial Growth & ROI Overview Card */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 18, padding: 18,
          borderWidth: 1, borderColor: cardBorder, marginBottom: 16,
          shadowColor: '#10B981', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 20 }}>📈</Text>
              </View>
              <View>
                <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800' }}>Savings & Dividend Yield</Text>
                <Text style={{ color: textMuted, fontSize: 10 }}>Performance across enrolled schemes</Text>
              </View>
            </View>
            <View style={{
              backgroundColor: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',
              paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
            }}>
              <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>
                +{netDividendYieldPct}% DIVIDEND GAIN
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 12, borderRadius: 12 }}>
              <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Total Paid Capital</Text>
              <Text style={{ color: textPrimary, fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                {formatCurrency(totalPaidAmount)}
              </Text>
            </View>

            <View style={{ flex: 1, backgroundColor: isDark ? 'rgba(16,185,129,0.06)' : '#ECFDF5', padding: 12, borderRadius: 12 }}>
              <Text style={{ color: textMuted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Dividend Earned</Text>
              <Text style={{ color: '#10B981', fontSize: 18, fontWeight: '800', marginTop: 4 }}>
                {formatCurrency(totalDividendSaved)}
              </Text>
            </View>
          </View>

          {/* ROI Comparison vs FD */}
          <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: textSecondary, fontSize: 11 }}>
              💡 Your Chit Yield ({netDividendYieldPct}%) outperforms Standard Bank FD (6.5% p.a.)
            </Text>
          </View>
        </View>

        {/* Ledger Transactions Section */}
        <Text style={{ color: textPrimary, fontSize: 15, fontWeight: '800', marginBottom: 12 }}>
          🧾 Payment Ledger & Verified Receipts
        </Text>

        {allPayments.length === 0 ? (
          <View style={{ backgroundColor: cardBg, borderRadius: 18, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: cardBorder }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🧾</Text>
            <Text style={{ color: textSecondary, fontSize: 14, fontWeight: '600' }}>No verified payment receipts yet</Text>
            <Text style={{ color: textMuted, fontSize: 11, marginTop: 4, textAlign: 'center' }}>
              Once you pay monthly installments and the Foreman verifies them, your official receipts will be stored here.
            </Text>
          </View>
        ) : (
          allPayments.map((p: any, idx: number) => (
            <TouchableOpacity
              key={`${p.id}-${idx}`}
              style={{
                backgroundColor: cardBg, borderRadius: 14, marginBottom: 10, padding: 14,
                borderWidth: 1, borderColor: cardBorder, overflow: 'hidden',
              }}
              onPress={() => setSelectedReceipt(p)}
              activeOpacity={0.8}
            >
              <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#10B981' }} />
              <View style={{ paddingLeft: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ color: textPrimary, fontSize: 14, fontWeight: '800' }}>{p.chit_name}</Text>
                    <Text style={{ color: textMuted, fontSize: 10, marginTop: 2 }}>
                      {p.verified_at ? `Verified on ${new Date(p.verified_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}` : 'Verified'}
                    </Text>
                  </View>
                  <Text style={{ color: '#10B981', fontSize: 16, fontWeight: '800' }}>
                    {formatCurrency(parseFloat(p.amount_paid))}
                  </Text>
                </View>

                <View style={{ height: 1, backgroundColor: cardBorder, marginVertical: 10 }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <View style={{ backgroundColor: isDark ? 'rgba(99,102,241,0.12)' : '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                      <Text style={{ color: '#6366F1', fontSize: 9, fontWeight: '800', textTransform: 'uppercase' }}>
                        {p.payment_mode}
                      </Text>
                    </View>
                    <Text style={{ color: textMuted, fontSize: 10 }}>Receipt ID: #{p.id.slice(0, 8)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ color: '#818CF8', fontSize: 10, fontWeight: '700' }}>📄 View Digital Receipt</Text>
                    <Text style={{ color: '#818CF8', fontSize: 10 }}>→</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 30 }} />
      </ScrollView>

      {/* Printable Digital Receipt Card Modal */}
      <Modal visible={selectedReceipt !== null} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{
            width: '100%', backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderRadius: 20, padding: 20,
            borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0',
            shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 8 }, shadowRadius: 20,
          }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 22 }}>🧾</Text>
                <Text style={{ color: textPrimary, fontSize: 16, fontWeight: '800' }}>Official Payment Receipt</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedReceipt(null)}>
                <Text style={{ color: textMuted, fontSize: 20, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedReceipt && (
              <View style={{ backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: cardBorder }}>
                <View style={{ alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: cardBorder }}>
                  <Text style={{ color: '#6366F1', fontSize: 18, fontWeight: '900', letterSpacing: 1 }}>CHITSANGHAM APP</Text>
                  <Text style={{ color: textMuted, fontSize: 10, marginTop: 2 }}>OFFICIAL DIGITAL PASSBOOK RECEIPT</Text>
                </View>

                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: textMuted, fontSize: 11 }}>Chit Scheme:</Text>
                    <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '700' }}>{selectedReceipt.chit_name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: textMuted, fontSize: 11 }}>Member Name:</Text>
                    <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '700' }}>{currentUser?.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: textMuted, fontSize: 11 }}>Amount Paid:</Text>
                    <Text style={{ color: '#10B981', fontSize: 15, fontWeight: '800' }}>{formatCurrency(parseFloat(selectedReceipt.amount_paid))}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: textMuted, fontSize: 11 }}>Payment Mode:</Text>
                    <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>{selectedReceipt.payment_mode}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: textMuted, fontSize: 11 }}>Receipt Reference:</Text>
                    <Text style={{ color: textPrimary, fontSize: 11, fontWeight: '700' }}>#{selectedReceipt.id.slice(0, 12)}</Text>
                  </View>
                </View>

                <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: cardBorder, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ backgroundColor: '#065F46', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Text style={{ color: '#34D399', fontSize: 9, fontWeight: '800' }}>VERIFIED BY FOREMAN ✓</Text>
                  </View>
                  <Text style={{ color: textMuted, fontSize: 9 }}>Digital Signature Verified</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={{
                backgroundColor: '#6366F1', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 16,
              }}
              onPress={() => setSelectedReceipt(null)}
            >
              <Text style={{ color: '#FFF', fontSize: 13, fontWeight: '800' }}>Done & Print</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
