import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

interface RulesGuidesProps {
  appState: any;
  styles: any;
  isDark: boolean;
}

export const RulesGuides: React.FC<RulesGuidesProps> = ({ appState, styles, isDark }) => {
  const { setViewState, setShowSidebar } = appState;
  const [lang, setLang] = useState<'EN' | 'TE'>('TE'); // default Telugu as requested

  // Collapsible accordion states
  const [openSection, setOpenSection] = useState<number | null>(0);

  const toggleSection = (idx: number) => {
    setOpenSection(openSection === idx ? null : idx);
  };

  const sectionsEN = [
    {
      title: "1. What is a Chit Fund?",
      content: "A Chit Fund is a unique financial instrument blending savings and borrowing. A group of people (e.g. 20 members) contribute a fixed monthly subscription (e.g. ₹50,000) for a specified duration (e.g. 20 months). Every month, the accumulated monthly pot (₹10 Lakhs) is auctioned among members."
    },
    {
      title: "2. How Bidding & Discounts Work",
      content: "Members who need funds bid during the monthly live auction room by offering a discount (e.g. ₹2 Lakhs). The member offering the highest discount wins the auction and receives the prize money (₹10 Lakhs - ₹2 Lakhs discount = ₹8 Lakhs). The bidding discount is capped by the max discount rule (typically 30%-40%)."
    },
    {
      title: "3. Dividend Distribution",
      content: "The winning discount is not kept by the owner. Instead, after deducting the Owner's Foreman Commission (fixed 5% of Chit value), the remaining discount pool (Dividend Pool) is distributed equally among all members as a monthly dividend (discount saving). This dividend reduces next month's subscription payment!"
    },
    {
      title: "4. Foreman (Owner) Commissions & Duties",
      content: "The Foreman organizes the group, manages enrollments, monitors monthly payment collections, conducts auctions, and secures guarantor collateral agreements. In return, the Foreman is legally allowed a fixed commission of 5% of the total chit value, which is released during the first month or deducted from monthly winning bids."
    },
    {
      title: "5. Security & Guarantor Requirements",
      content: "Before the foreman disburses the prize money to the auction winner, the winner must submit security collateral (guarantor details, salary slips, property docs, or promissory notes) to guarantee they will continue paying monthly installments for the remaining months. This protects the other members from defaults."
    }
  ];

  const sectionsTE = [
    {
      title: "1. చిట్ ఫండ్ అంటే ఏమిటి? (What is a Chit?)",
      content: "చిట్ ఫండ్ అనేది పొదుపు మరియు అప్పులను కలిపి అందించే ఒక అద్భుతమైన ఆర్థిక సాధనం. కొంతమంది సభ్యులు (ఉదాహరణకు 20 మంది) ఒక నిర్దిష్ట కాల వ్యవధికి (20 నెలలు) ప్రతి నెలా కొంత మొత్తాన్ని (₹50,000) చందాగా జమ చేస్తారు. ప్రతి నెలా సేకరించిన ఈ మొత్తం నిధిని (₹10 లక్షలు) సభ్యుల మధ్య వేలం వేయడం జరుగుతుంది."
    },
    {
      title: "2. వేలం పాట మరియు డిస్కౌంట్ నియమాలు (Bidding Rules)",
      content: "డబ్బు అవసరమైన సభ్యులు లైవ్ బిడ్డింగ్ రూమ్‌లో పాల్గొని డిస్కౌంట్ మొత్తాన్ని (ఉదాహరణకు ₹2 లక్షలు) పాడుకుంటారు. అందరికంటే ఎక్కువ డిస్కౌంట్ పాడిన సభ్యుడు వేలంలో విజేతగా నిలిచి, ప్రైజ్ మనీని (₹10 లక్షలు - ₹2 లక్షలు డిస్కనెట్ = ₹8 లక్షలు) పొందుతారు. గరిష్ట బిడ్ డిస్కౌంట్ పరిమితి సాధారణంగా 30%-40% వరకు ఉంటుంది."
    },
    {
      title: "3. లాభాల పంపిణీ - డివిడెండ్ (Dividend Split)",
      content: "వేలంలో వచ్చిన డిస్కౌంట్ మొత్తాన్ని యజమాని ఉంచుకోరు. యజమానికి చెల్లించాల్సిన 5% ఫోర్‌మన్ కమిషన్ మినహాయించిన తర్వాత, మిగిలిన డిస్కౌంట్ మొత్తాన్ని సభ్యులందరికీ సమానంగా పంచుతారు. దీనినే 'డివిడెండ్' అంటారు. ఈ డివిడెండ్ తదుపరి నెల చందా మొత్తాన్ని తగ్గిస్తుంది!"
    },
    {
      title: "4. గ్రూప్ యజమాని (Foreman) బాధ్యతలు",
      content: "ఫోర్‌మన్ గ్రూపును నిర్వహిస్తారు, సభ్యులను చేర్చుకుంటారు, ప్రతి నెలా చందాల వసూళ్లను పర్యవేక్షిస్తారు మరియు లైవ్ వేలం నిర్వహిస్తారు. ఈ సేవలకు గాను ఫోర్‌మన్‌కు మొత్తం చిట్టీ విలువలో 5% కమిషన్ పొందే చట్టపరమైన హక్కు ఉంటుంది."
    },
    {
      title: "5. భద్రతా పత్రాలు & షూరిటీ నియమాలు (Security Collateral)",
      content: "వేలంలో గెలిచిన సభ్యునికి డబ్బు అందజేసే ముందు, మిగిలిన నెలలకు చందాలు సక్రమంగా చెల్లిస్తారని గ్యారెంటీగా షూరిటీ పత్రాలు (ప్రభుత్వ ఉద్యోగుల జీతం స్లిప్పులు, ఆస్తి పత్రాలు లేదా హామీ పత్రాలు) సమర్పించాల్సి ఉంటుంది. ఇది ఇతర సభ్యుల డబ్బుకు రక్షణ కల్పిస్తుంది."
    }
  ];

  const currentSections = lang === 'TE' ? sectionsTE : sectionsEN;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={{ marginRight: 15, padding: 4 }}
            onPress={() => setShowSidebar(true)}
          >
            <Text style={{ fontSize: 24, color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold' }}>☰</Text>
          </TouchableOpacity>
          <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontSize: 18, fontWeight: 'bold' }}>
            Rules & Telugu Guides
          </Text>
        </View>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {/* Language selector toggle */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 }}>
          <TouchableOpacity 
            style={[{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 }, lang === 'TE' ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { backgroundColor: 'transparent', borderColor: '#475569' }]}
            onPress={() => setLang('TE')}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>తెలుగు (Telugu)</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[{ paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1 }, lang === 'EN' ? { backgroundColor: '#6366F1', borderColor: '#6366F1' } : { backgroundColor: 'transparent', borderColor: '#475569' }]}
            onPress={() => setLang('EN')}
          >
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>English</Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Expandable Accordion */}
        {currentSections.map((sec, idx) => {
          const isOpen = openSection === idx;
          return (
            <View 
              key={idx} 
              style={{ 
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
                borderRadius: 10, 
                borderWidth: 1, 
                borderColor: isDark ? '#334155' : '#E2E8F0', 
                marginBottom: 10, 
                overflow: 'hidden' 
              }}
            >
              <TouchableOpacity 
                style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: isOpen ? (isDark ? '#2E3B4E' : '#EEF2F6') : 'transparent' }}
                onPress={() => toggleSection(idx)}
              >
                <Text style={{ color: isDark ? '#FFF' : '#0F172A', fontWeight: 'bold', fontSize: 13, flex: 1, marginRight: 10 }}>{sec.title}</Text>
                <Text style={{ color: '#6366F1', fontSize: 14, fontWeight: 'bold' }}>{isOpen ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isOpen && (
                <View style={{ padding: 16, borderTopWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }}>
                  <Text style={{ color: isDark ? '#E2E8F0' : '#475569', fontSize: 12, lineHeight: 18 }}>{sec.content}</Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};
