import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { ApiClient, User, Chit, Payment, Surety, Member, Auction } from '../api/apiClient';
import { API_CONFIG } from '@/constants/config';

export const useChitApp = () => {
  const [serverUrl, setServerUrl] = useState(API_CONFIG.getInitialServerUrl());
  const api = new ApiClient(serverUrl);

  // Authentication & Users
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<'foreman' | 'member' | null>(null);
  const [loginStep, setLoginStep] = useState<'role_selection' | 'credentials' | 'register'>('role_selection');
  const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
  const [mobileNumber, setMobileNumber] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Registration
  const [registerName, setRegisterName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');

  // Application Data States
  const [chits, setChits] = useState<Chit[]>([]);
  const [selectedChitDetails, setSelectedChitDetails] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sureties, setSureties] = useState<Surety[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({ duesOrCollectable: 0, profit: 0 });

  // Navigation & Tabs
  const [viewState, setViewState] = useState<
    'login' | 'dashboard' | 'chit_detail' | 'my_profile' | 'chit_calculator' | 
    'rules_guides' | 'help_support' | 'reports' | 'notifications' | 
    'auction_calendar' | 'financial_projections' | 'audit_trail' | 'passbook'
  >('login');

  // Theme Mode (User Selectable Toggle)
  const [userThemeOverride, setUserThemeOverride] = useState<'dark' | 'light' | null>(null);

  // Reports & Notifications Data
  const [reportsOverview, setReportsOverview] = useState<any>(null);
  const [chitGroupStats, setChitGroupStats] = useState<any[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [financialProjections, setFinancialProjections] = useState<any>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  // Modals & Forms State for Edit Chit
  const [showEditChitModal, setShowEditChitModal] = useState(false);
  const [editChitForm, setEditChitForm] = useState({
    id: '',
    name: '',
    foremanCommissionPct: '5',
    maxBidDiscountPct: '30',
    auctionDayOfMonth: '10',
    auctionTime: '18:00',
    status: 'recruiting'
  });

  const [activeTab, setActiveTab] = useState<'info' | 'members' | 'history' | 'payments' | 'sureties'>('info');
  const [loading, setLoading] = useState(false);

  // Modals Visibility
  const [showCreateChit, setShowCreateChit] = useState(false);
  const [showPaymentUpload, setShowPaymentUpload] = useState(false);
  const [showSuretyUpload, setShowSuretyUpload] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [showAuctionRoom, setShowAuctionRoom] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Selected entities for modals
  const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<any>(null);
  const [selectedMemberForEdit, setSelectedMemberForEdit] = useState<any>(null);
  const [memberDetailData, setMemberDetailData] = useState<any>(null);

  // Form inputs
  const [newChitMembers, setNewChitMembers] = useState<{ name: string; phone: string }[]>([]);
  const [addMemberName, setAddMemberName] = useState('');
  const [addMemberPhone, setAddMemberPhone] = useState('');
  
  const [newChitForm, setNewChitForm] = useState({
    name: '',
    chitValue: '1000000',
    membersCount: '20',
    durationMonths: '20',
    foremanCommissionPct: '5',
    maxBidDiscountPct: '30',
    firstMonthRule: 'foreman_takes',
    auctionDayOfMonth: '5',
    auctionTime: '18:00',
    startDate: new Date().toISOString().split('T')[0]
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    mode: 'upi' as 'upi' | 'cash',
    receiptUrl: 'https://example.com/receipt.jpg',
    selectedAuctionId: ''
  });

  const [suretyForm, setSuretyForm] = useState({
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelation: '',
    documentType: 'government_id',
    documentUrl: 'https://example.com/docs.jpg',
    selectedAuctionId: ''
  });

  const [addMemberForm, setAddMemberForm] = useState({ name: '', phone: '', memberNumber: '' });
  const [editMemberForm, setEditMemberForm] = useState({ name: '', phone: '', memberNumber: '' });

  // 1. Initialize Users on App Load
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.fetchUsers();
        if (data && data.length > 0) {
          setAvailableUsers(data);
          return;
        }
      } catch (e) {
        console.log('Error fetching users from backend, using offline personas:', e);
      }
      
      const mockUsers: User[] = [
        { id: 'venkata-rao-owner', name: 'Venkata Rao (Owner)', phone: '9876543210', role: 'foreman' },
        { id: 'ramesh-kumar-me', name: 'Ramesh Kumar (Member #1)', phone: '9000000001', role: 'member' },
        { id: 'member-name-2', name: 'Srinivas Rao (Member #2)', phone: '9000000002', role: 'member' },
        { id: 'member-name-5', name: 'Lakshmi Prasanna (Member #5)', phone: '9000000005', role: 'member' }
      ];
      setAvailableUsers(mockUsers);
    };

    fetchUsers();
  }, [serverUrl]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: any;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const fetchChits = async (user: User) => {
    setLoading(true);
    try {
      const [chitsData, metricsData] = await Promise.all([
        api.fetchChits(user.id, user.role),
        api.fetchUserMetrics(user.id, user.role)
      ]);
      setChits(chitsData);
      setDashboardMetrics(metricsData);
    } catch (e) {
      console.log('Fetch error, simulating offline', e);
      simulateOfflineChits(user);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (registerPhone.length !== 10) {
      Alert.alert('Error', 'Please enter a 10-digit mobile number');
      return;
    }
    
    setLoading(true);
    try {
      await api.registerUser(registerName.trim(), registerPhone.trim(), selectedRole || 'member');
      
      try {
        const usersList = await api.fetchUsers();
        setAvailableUsers(usersList);
      } catch (err) {
        console.error(err);
      }
      
      Alert.alert('Success', 'Registration completed! You can now log in.');
      setMobileNumber(registerPhone);
      setLoginStep('credentials');
      setRegisterName('');
      setRegisterPhone('');
    } catch (e: any) {
      Alert.alert('Offline Mode', 'Registration simulated. Try logging in.');
      const mockNewUser: User = {
        id: 'mock-reg-' + Date.now(),
        name: registerName.trim(),
        phone: registerPhone.trim(),
        role: selectedRole || 'member'
      };
      setAvailableUsers(prev => [...prev, mockNewUser]);
      setMobileNumber(registerPhone);
      setLoginStep('credentials');
      setRegisterName('');
      setRegisterPhone('');
    } finally {
      setLoading(false);
    }
  };

  const simulateOfflineChits = (user: User) => {
    const demoChits: Chit[] = [
      {
        id: 'vijayawada-chit-a',
        foreman_id: 'venkata-rao-owner',
        name: 'Vijayawada Gold Chit-A',
        chit_value: '1000000',
        members_count: 20,
        duration_months: 20,
        monthly_subscription: '50000',
        foreman_commission_pct: '5',
        max_bid_discount_pct: '30',
        first_month_rule: 'foreman_takes',
        auction_day_of_month: 5,
        auction_time: '18:00',
        status: 'active',
        start_date: '2026-04-05'
      },
      {
        id: 'vizag-chit-b',
        foreman_id: 'venkata-rao-owner',
        name: 'Vizag Lakhs Chit-B',
        chit_value: '500000',
        members_count: 10,
        duration_months: 10,
        monthly_subscription: '50000',
        foreman_commission_pct: '5',
        max_bid_discount_pct: '30',
        first_month_rule: 'normal_auction',
        auction_day_of_month: 10,
        auction_time: '20:00',
        status: 'recruiting',
        start_date: '2026-08-10'
      }
    ];
    
    if (user.role === 'foreman') {
      setChits(demoChits);
    } else {
      setChits([demoChits[0]]);
    }

    setDashboardMetrics({
      duesOrCollectable: user.role === 'foreman' ? 90000 : 42000,
      profit: user.role === 'foreman' ? 28000 : 18000
    });
  };

  const viewChitDetails = async (chit: Chit) => {
    setLoading(true);
    setActiveTab('info');
    try {
      const data = await api.fetchChitById(chit.id);
      setSelectedChitDetails(data);
      
      try {
        const [paymentsData, suretiesData] = await Promise.all([
          api.fetchPayments(chit.id),
          api.fetchSuretiesForChit(chit.id)
        ]);
        setPayments(paymentsData);
        setSureties(suretiesData);
      } catch (err) {
        console.error('Failed to fetch payments/sureties:', err);
      }
      setViewState('chit_detail');
    } catch (e) {
      simulateOfflineChitDetails(chit);
    } finally {
      setLoading(false);
    }
  };

  const simulateOfflineChitDetails = (chit: Chit) => {
    const mockMembers: Member[] = [
      { user_id: 'ramesh-kumar-me', name: 'Ramesh Kumar (Me)', phone: '9000000001', member_number: 1 },
      { user_id: 'member-name-2', name: 'Srinivas Rao (Member #2)', phone: '9000000002', member_number: 2 },
      { user_id: 'member-name-3', name: 'K. Mohan Reddi (Member #3)', phone: '9000000003', member_number: 3 },
      { user_id: 'member-name-4', name: 'S. Nooka Raju (Member #4)', phone: '9000000004', member_number: 4 },
      { user_id: 'member-name-5', name: 'Lakshmi Prasanna (Member #5)', phone: '9000000005', member_number: 5 }
    ];

    const mockAuctions: Auction[] = [
      {
        id: 'auc-m1',
        chit_id: chit.id,
        month_number: 1,
        auction_date: '2026-04-05',
        winning_member_id: 'venkata-rao-owner',
        winner_name: 'Venkata Rao (Owner)',
        winning_bid_discount: 50000,
        foreman_commission: 50000,
        dividend_pool: 0,
        dividend_per_member: 0,
        net_subscription_due: 50000,
        surety_status: 'not_required',
        prize_disbursed: true,
        status: 'completed'
      },
      {
        id: 'auc-m2',
        chit_id: chit.id,
        month_number: 2,
        auction_date: '2026-05-05',
        winning_member_id: 'ramesh-kumar-me',
        winner_name: 'Ramesh Kumar (Me)',
        winning_bid_discount: 250000,
        foreman_commission: 50000,
        dividend_pool: 200000,
        dividend_per_member: 10000,
        net_subscription_due: 40000,
        surety_status: 'approved',
        prize_disbursed: true,
        status: 'completed'
      }
    ];

    const mockPayments: Payment[] = [
      { id: 'p1', chit_id: chit.id, auction_id: 'auc-m2', user_id: 'ramesh-kumar-me', amount_paid: 40000, penalty_amount: 0, payment_mode: 'upi', payment_status: 'verified', member_number: 1, name: 'Ramesh Kumar (Me)' }
    ];

    const mockSureties: Surety[] = [
      { id: 's1', auction_id: 'auc-m2', guarantor_name: 'Chandra Shekar', guarantor_phone: '9222333444', guarantor_relation: 'Uncle/Govt Employee', document_type: 'government_id', document_url: 'https://example.com/id.jpg', status: 'pending' }
    ];

    setSelectedChitDetails({
      ...chit,
      members: mockMembers,
      auctions: mockAuctions
    });
    setPayments(mockPayments);
    setSureties(mockSureties);
    setViewState('chit_detail');
  };

  const refreshChitDetails = async () => {
    if (selectedChitDetails) {
      const updatedChit = chits.find(c => c.id === selectedChitDetails.id) || selectedChitDetails;
      await viewChitDetails(updatedChit);
    }
  };

  const handleCreateChit = async () => {
    if (!newChitForm.name) {
      Alert.alert('Validation Error', 'Please enter a Chit Name');
      return;
    }
    
    setLoading(true);
    try {
      await api.createChit(currentUser!.id, newChitForm, newChitMembers);
      Alert.alert('Success', 'Chit group created successfully!');
      setShowCreateChit(false);
      setNewChitMembers([]);
      if (currentUser) fetchChits(currentUser);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create chit group');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentForm.amount) {
      Alert.alert('Validation Error', 'Please enter the amount paid');
      return;
    }

    setLoading(true);
    try {
      await api.submitPaymentReceipt({
        chitId: selectedChitDetails.id,
        auctionId: paymentForm.selectedAuctionId,
        userId: currentUser!.id,
        amountPaid: parseFloat(paymentForm.amount),
        paymentMode: paymentForm.mode,
        receiptImageUrl: paymentForm.receiptUrl
      });
      Alert.alert('Success', 'Payment receipt uploaded. Awaiting owner verification.');
      setShowPaymentUpload(false);
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    setLoading(true);
    try {
      await api.verifyPayment(paymentId, status);
      Alert.alert('Success', `Payment marked as ${status}`);
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Verification action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSurety = async () => {
    if (!suretyForm.guarantorName || !suretyForm.guarantorPhone) {
      Alert.alert('Validation Error', 'Please enter Guarantor Name and Phone');
      return;
    }

    setLoading(true);
    try {
      await api.submitSureties(suretyForm.selectedAuctionId, [{
        guarantorName: suretyForm.guarantorName,
        guarantorPhone: suretyForm.guarantorPhone,
        guarantorRelation: suretyForm.guarantorRelation,
        documentType: suretyForm.documentType,
        documentUrl: suretyForm.documentUrl
      }]);
      Alert.alert('Success', 'Sureties submitted successfully.');
      setShowSuretyUpload(false);
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Surety upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySurety = async (suretyId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await api.verifySurety(suretyId, status);
      Alert.alert('Success', `Guarantor status updated to: ${status}`);
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Verify request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisburseMoney = async (auctionId: string) => {
    setLoading(true);
    try {
      await api.disbursePrizeMoney(auctionId);
      Alert.alert('Disbursed!', 'Winner payout marked as disbursed.');
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Unable to disburse prize money. Verify sureties are approved.');
    } finally {
      setLoading(false);
    }
  };

  const openMemberDetail = async (userId: string) => {
    setLoading(true);
    try {
      const data = await api.fetchUserDetails(userId);
      setMemberDetailData(data);
      setShowMemberDetailModal(true);
    } catch (err) {
      console.error(err);
      const matched = selectedChitDetails.members.find((m: any) => m.user_id === userId);
      if (matched) {
        setMemberDetailData({
          profile: { id: userId, name: matched.name, phone: matched.phone, role: 'member' },
          chits: [
            { id: selectedChitDetails.id, name: selectedChitDetails.name, status: selectedChitDetails.status, member_number: matched.member_number, role_in_chit: 'member' }
          ],
          payments: payments.filter(p => p.user_id === userId),
          sureties: sureties.filter(s => selectedChitDetails.auctions.find(a => a.id === s.auction_id && a.winning_member_id === userId))
        });
        setShowMemberDetailModal(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!addMemberForm.name || !addMemberForm.phone) {
      Alert.alert('Validation Error', 'Please enter Name and Phone');
      return;
    }
    
    setLoading(true);
    try {
      await api.addChitMember(selectedChitDetails.id, addMemberForm.name, addMemberForm.phone, addMemberForm.memberNumber);
      Alert.alert('Success', 'Member added successfully!');
      setShowAddMemberModal(false);
      setAddMemberForm({ name: '', phone: '', memberNumber: '' });
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const openEditMember = (member: any) => {
    setSelectedMemberForEdit(member);
    setEditMemberForm({
      name: member.name,
      phone: member.phone,
      memberNumber: member.member_number.toString()
    });
    setShowEditMemberModal(true);
  };

  const handleEditMember = async () => {
    if (!selectedMemberForEdit) return;
    
    setLoading(true);
    try {
      await api.editChitMember(
        selectedChitDetails.id,
        selectedMemberForEdit.user_id,
        editMemberForm.name,
        editMemberForm.phone,
        parseInt(editMemberForm.memberNumber)
      );
      Alert.alert('Success', 'Member updated successfully!');
      setShowEditMemberModal(false);
      refreshChitDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to edit member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = (memberUserId: string) => {
    Alert.alert(
      'Remove Member',
      'Are you sure you want to remove this member from the chit group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.removeChitMember(selectedChitDetails.id, memberUserId);
              Alert.alert('Success', 'Member removed successfully.');
              refreshChitDetails();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to remove member');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // ─── Reports & Analytics Fetch ───────────────────────────────────
  const fetchReportsData = async () => {
    if (!currentUser) return;
    try {
      const [overview, stats, defs] = await Promise.all([
        api.fetchReportsOverview(currentUser.id),
        api.fetchChitGroupStats(currentUser.id),
        api.fetchDefaulters(currentUser.id),
      ]);
      setReportsOverview(overview);
      setChitGroupStats(stats);
      setDefaulters(defs);
    } catch (e: any) {
      console.error('Error fetching reports:', e);
    }
  };

  // ─── Notifications Fetch ─────────────────────────────────────────
  const fetchNotificationsData = async () => {
    if (!currentUser) return;
    try {
      const data = await api.fetchNotifications(currentUser.id, currentUser.role);
      setNotifications(data.notifications || []);
      setNotificationCount(data.actionableCount || 0);
    } catch (e: any) {
      console.error('Error fetching notifications:', e);
    }
  };

  // ─── Edit / Delete / Duplicate Chit Handlers ───────────────────────
  const openEditChitModal = (chit: any) => {
    setEditChitForm({
      id: chit.id,
      name: chit.name,
      foremanCommissionPct: String(chit.foreman_commission_pct || 5),
      maxBidDiscountPct: String(chit.max_bid_discount_pct || 30),
      auctionDayOfMonth: String(chit.auction_day_of_month || 10),
      auctionTime: chit.auction_time || '18:00',
      status: chit.status || 'recruiting'
    });
    setShowEditChitModal(true);
  };

  const handleUpdateChit = async () => {
    setLoading(true);
    try {
      await api.updateChit(editChitForm.id, {
        name: editChitForm.name,
        foreman_commission_pct: parseFloat(editChitForm.foremanCommissionPct),
        max_bid_discount_pct: parseFloat(editChitForm.maxBidDiscountPct),
        auction_day_of_month: parseInt(editChitForm.auctionDayOfMonth),
        auction_time: editChitForm.auctionTime,
        status: editChitForm.status
      });
      Alert.alert('Success', 'Chit group updated successfully');
      setShowEditChitModal(false);
      if (currentUser) fetchChits(currentUser);
      if (selectedChitDetails && selectedChitDetails.id === editChitForm.id) {
        refreshChitDetails();
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update chit group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChit = (chitId: string, chitName: string) => {
    Alert.alert(
      'Delete Chit Group',
      `Are you sure you want to delete "${chitName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.deleteChit(chitId);
              Alert.alert('Deleted', 'Chit group deleted successfully');
              setViewState('dashboard');
              if (currentUser) fetchChits(currentUser);
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete chit group');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleDuplicateChit = async (chitId: string, name?: string) => {
    setLoading(true);
    try {
      const newChit = await api.duplicateChit(chitId, name);
      Alert.alert('Duplicated! 📋', `Created new group "${newChit.name}"`);
      if (currentUser) fetchChits(currentUser);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to duplicate chit group');
    } finally {
      setLoading(false);
    }
  };

  // ─── Projections & Audit Trail Fetch ────────────────────────────
  const fetchProjectionsData = async () => {
    if (!currentUser) return;
    try {
      const data = await api.fetchFinancialProjections(currentUser.id);
      setFinancialProjections(data);
    } catch (e: any) {
      console.error('Error fetching projections:', e);
    }
  };

  const fetchAuditTrailData = async () => {
    if (!currentUser) return;
    try {
      const trail = await api.fetchAuditTrail(currentUser.id);
      setAuditTrail(trail);
    } catch (e: any) {
      console.error('Error fetching audit trail:', e);
    }
  };

  return {
    serverUrl,
    setServerUrl,
    currentUser,
    setCurrentUser,
    availableUsers,
    setAvailableUsers,
    selectedRole,
    setSelectedRole,
    loginStep,
    setLoginStep,
    loginMode,
    setLoginMode,
    mobileNumber,
    setMobileNumber,
    passwordInput,
    setPasswordInput,
    otpCode,
    setOtpCode,
    otpSent,
    setOtpSent,
    otpTimer,
    setOtpTimer,
    registerName,
    setRegisterName,
    registerPhone,
    setRegisterPhone,
    chits,
    selectedChitDetails,
    setSelectedChitDetails,
    payments,
    setPayments,
    sureties,
    setSureties,
    dashboardMetrics,
    viewState,
    setViewState,
    activeTab,
    setActiveTab,
    loading,
    setLoading,
    showCreateChit,
    setShowCreateChit,
    showPaymentUpload,
    setShowPaymentUpload,
    showSuretyUpload,
    setShowSuretyUpload,
    showServerSettings,
    setShowServerSettings,
    showAddMemberModal,
    setShowAddMemberModal,
    showEditMemberModal,
    setShowEditMemberModal,
    showMemberDetailModal,
    setShowMemberDetailModal,
    showAuctionRoom,
    setShowAuctionRoom,
    newChitMembers,
    setNewChitMembers,
    addMemberName,
    setAddMemberName,
    addMemberPhone,
    setAddMemberPhone,
    newChitForm,
    setNewChitForm,
    paymentForm,
    setPaymentForm,
    suretyForm,
    setSuretyForm,
    addMemberForm,
    setAddMemberForm,
    editMemberForm,
    setEditMemberForm,
    selectedMemberForDetail,
    setSelectedMemberForDetail,
    selectedMemberForEdit,
    setSelectedMemberForEdit,
    memberDetailData,
    setMemberDetailData,
    fetchChits,
    viewChitDetails,
    refreshChitDetails,
    handleCreateChit,
    handleSubmitPayment,
    handleVerifyPayment,
    handleSubmitSurety,
    handleVerifySurety,
    handleDisburseMoney,
    openMemberDetail,
    handleAddMember,
    openEditMember,
    handleEditMember,
    handleRemoveMember,
    handleRegister,
    showSidebar,
    setShowSidebar,
    reportsOverview,
    setReportsOverview,
    chitGroupStats,
    setChitGroupStats,
    defaulters,
    setDefaulters,
    notifications,
    setNotifications,
    notificationCount,
    setNotificationCount,
    fetchReportsData,
    fetchNotificationsData,
    userThemeOverride,
    setUserThemeOverride,
    showEditChitModal,
    setShowEditChitModal,
    editChitForm,
    setEditChitForm,
    openEditChitModal,
    handleUpdateChit,
    handleDeleteChit,
    handleDuplicateChit,
    financialProjections,
    setFinancialProjections,
    auditTrail,
    setAuditTrail,
    fetchProjectionsData,
    fetchAuditTrailData
  };
};
