import { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Alert, Animated, Easing } from 'react-native';

export interface AuctionRoomState {
  status: 'upcoming' | 'live' | 'completed' | 'lottery';
  timeLeft: number;
  highestBidderId: string | null;
  highestBidderName: string | null;
  highestBidDiscount: number;
  maxBidDiscount: number;
  tiedSubscribers: string[];
  candidates?: { id: string; name: string }[];
}

export const useAuctionSocket = (
  serverUrl: string,
  chitId: string | undefined,
  currentUser: any,
  onRefresh: () => void
) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [myBid, setMyBid] = useState(0);
  
  const [auctionRoomState, setAuctionRoomState] = useState<AuctionRoomState>({
    status: 'upcoming',
    timeLeft: 0,
    highestBidderId: null,
    highestBidderName: null,
    highestBidDiscount: 0,
    maxBidDiscount: 0,
    tiedSubscribers: [],
  });

  const spinValue = useRef(new Animated.Value(0)).current;

  const startSpinning = () => {
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (!chitId) return;

    setConnectionStatus('connecting');
    const newSocket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server via WebSocket');
      setConnectionStatus('connected');
      
      if (currentUser) {
        newSocket.emit('join_auction', {
          chitId,
          userId: currentUser.id,
          name: currentUser.name
        });
      }
    });

    newSocket.on('connect_error', () => {
      console.log('Connection failed, defaulting to offline simulation');
      setConnectionStatus('disconnected');
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    newSocket.on('auction_started', (data) => {
      setAuctionRoomState({
        status: 'live',
        timeLeft: data.timeLeft,
        highestBidderId: null,
        highestBidderName: null,
        highestBidDiscount: 0,
        maxBidDiscount: data.maxBidDiscount,
        tiedSubscribers: [],
      });
      setMyBid(0);
    });

    newSocket.on('timer_tick', (data) => {
      setAuctionRoomState(prev => ({ ...prev, timeLeft: data.timeLeft }));
    });

    newSocket.on('bid_updated', (data) => {
      setAuctionRoomState(prev => ({
        ...prev,
        highestBidderId: data.highestBidderId,
        highestBidderName: data.highestBidderName,
        highestBidDiscount: data.highestBidDiscount,
        tiedSubscribers: data.tiedSubscribers
      }));
    });

    newSocket.on('tie_detected', (data) => {
      setAuctionRoomState(prev => ({
        ...prev,
        tiedSubscribers: data.tiedSubscribers,
        maxBidDiscount: data.maxBidDiscount
      }));
    });

    newSocket.on('requires_manual_lottery', (data) => {
      // Handled if members details available
      newSocket.emit('get_members_for_lottery'); 
    });

    newSocket.on('lottery_started', () => {
      setAuctionRoomState(prev => ({ ...prev, status: 'lottery' }));
      startSpinning();
    });

    newSocket.on('lottery_winner_declared', (data) => {
      setAuctionRoomState(prev => ({
        ...prev,
        status: 'completed',
        highestBidderId: data.winnerId,
        highestBidderName: data.winnerName,
        timeLeft: 0
      }));
      Alert.alert('Lottery Draw Complete!', `Winner is ${data.winnerName}`);
      onRefresh();
    });

    newSocket.on('auction_ended', (data) => {
      setAuctionRoomState(prev => ({ ...prev, status: 'completed' }));
      Alert.alert(
        'Auction Finished!', 
        `Winner: ${data.winnerName}\nWinning Bid Discount: ₹${data.winningDiscount}\nDividend: ₹${data.dividendPerMember}`
      );
      onRefresh();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [serverUrl, chitId, currentUser?.id]);

  const submitBid = (discountAmount: number) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('submit_bid', {
        chitId,
        userId: currentUser.id,
        userName: currentUser.name,
        discountAmount
      });
    } else {
      // Simulated Bid update offline
      if (discountAmount <= auctionRoomState.highestBidDiscount) {
        Alert.alert('Error', 'Your bid must be higher than current highest');
        return;
      }
      setAuctionRoomState(prev => ({
        ...prev,
        highestBidderId: currentUser.id,
        highestBidderName: currentUser.name,
        highestBidDiscount: discountAmount
      }));
    }
  };

  const startLiveBiddingRoom = (monthNumber: number, maxDiscount: number, auctionId: string) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('start_auction', {
        chitId,
        monthNumber,
        auctionId,
        maxBidDiscount: maxDiscount
      });
    } else {
      setAuctionRoomState({
        status: 'live',
        timeLeft: 60,
        highestBidderId: null,
        highestBidderName: null,
        highestBidDiscount: 100000,
        maxBidDiscount: maxDiscount,
        tiedSubscribers: [],
      });
    }
  };

  const forceEndAuction = () => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('force_end_auction', { chitId });
    } else {
      setAuctionRoomState(prev => ({ ...prev, status: 'completed' }));
    }
  };

  const conductLotteryDraw = (candidates: { id: string; name: string }[]) => {
    if (socket && connectionStatus === 'connected') {
      socket.emit('conduct_lottery_draw', { chitId, candidates });
    } else {
      setAuctionRoomState(prev => ({ ...prev, status: 'lottery', candidates }));
      startSpinning();
      setTimeout(() => {
        const winner = candidates[Math.floor(Math.random() * candidates.length)];
        setAuctionRoomState(prev => ({
          ...prev,
          status: 'completed',
          highestBidderId: winner.id,
          highestBidderName: winner.name,
        }));
        Alert.alert('Offline Lottery Draw Complete!', `Winner is ${winner.name}`);
        onRefresh();
      }, 3000);
    }
  };

  return {
    socket,
    connectionStatus,
    auctionRoomState,
    setAuctionRoomState,
    myBid,
    setMyBid,
    submitBid,
    startLiveBiddingRoom,
    forceEndAuction,
    conductLotteryDraw,
    spinValue
  };
};
