import { Server, Socket } from 'socket.io';
import { AuctionModel } from '../db/models/auction';

interface AuctionRoom {
  chitId: string;
  monthNumber: number;
  auctionId: string;
  timeLeft: number; // in seconds
  highestBidderId: string | null;
  highestBidderName: string | null;
  highestBidDiscount: number;
  maxBidDiscount: number;
  tiedSubscribers: string[]; // User IDs of tied bidders who hit the max cap
  timerInterval?: NodeJS.Timeout;
}

const activeAuctions = new Map<string, AuctionRoom>();

export const initAuctionSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Join an auction room
    socket.on('join_auction', (data: { chitId: string; userId: string; name: string }) => {
      const { chitId, userId, name } = data;
      socket.join(chitId);
      console.log(`User ${name} (${userId}) joined auction room: ${chitId}`);

      const active = activeAuctions.get(chitId);
      if (active) {
        socket.emit('auction_state', {
          status: 'live',
          timeLeft: active.timeLeft,
          highestBidderId: active.highestBidderId,
          highestBidderName: active.highestBidderName,
          highestBidDiscount: active.highestBidDiscount,
          maxBidDiscount: active.maxBidDiscount,
          tiedSubscribers: active.tiedSubscribers,
        });
      } else {
        socket.emit('auction_state', { status: 'upcoming' });
      }
    });

    // Foreman starts the live auction
    socket.on('start_auction', (data: { chitId: string; monthNumber: number; auctionId: string; maxBidDiscount: number }) => {
      const { chitId, monthNumber, auctionId, maxBidDiscount } = data;
      
      if (activeAuctions.has(chitId)) {
        console.log(`Auction is already active for chit: ${chitId}`);
        return;
      }

      console.log(`Foreman started live auction for chit: ${chitId}, Month: ${monthNumber}`);

      const room: AuctionRoom = {
        chitId,
        monthNumber,
        auctionId,
        timeLeft: 120, // 2 minutes countdown
        highestBidderId: null,
        highestBidderName: null,
        highestBidDiscount: 0,
        maxBidDiscount,
        tiedSubscribers: [],
      };

      activeAuctions.set(chitId, room);

      io.to(chitId).emit('auction_started', {
        monthNumber,
        auctionId,
        timeLeft: room.timeLeft,
        maxBidDiscount,
      });

      room.timerInterval = setInterval(async () => {
        const active = activeAuctions.get(chitId);
        if (!active) return;

        active.timeLeft--;

        if (active.timeLeft <= 0) {
          clearInterval(active.timerInterval);
          await endAuction(chitId, io);
        } else {
          io.to(chitId).emit('timer_tick', { timeLeft: active.timeLeft });
        }
      }, 1000);
    });

    // Member submits a bid
    socket.on('submit_bid', (data: { chitId: string; userId: string; userName: string; discountAmount: number }) => {
      const { chitId, userId, userName, discountAmount } = data;
      const active = activeAuctions.get(chitId);

      if (!active) {
        socket.emit('bid_error', { message: 'No active auction found for this group' });
        return;
      }

      if (discountAmount <= active.highestBidDiscount) {
        socket.emit('bid_error', { message: 'Your bid must be higher than the current highest bid' });
        return;
      }

      if (discountAmount > active.maxBidDiscount) {
        socket.emit('bid_error', { message: `Bid cannot exceed maximum cap discount of ₹${active.maxBidDiscount}` });
        return;
      }

      console.log(`New bid from ${userName}: ₹${discountAmount}`);

      active.highestBidderId = userId;
      active.highestBidderName = userName;
      active.highestBidDiscount = discountAmount;

      if (discountAmount === active.maxBidDiscount) {
        if (!active.tiedSubscribers.includes(userId)) {
          active.tiedSubscribers.push(userId);
        }
        io.to(chitId).emit('tie_detected', {
          tiedSubscribers: active.tiedSubscribers,
          maxBidDiscount: active.maxBidDiscount,
        });
      }

      if (active.timeLeft < 30) {
        active.timeLeft = 45;
        io.to(chitId).emit('timer_tick', { timeLeft: active.timeLeft });
        console.log(`Auction timer extended to 45s for chit: ${chitId}`);
      }

      io.to(chitId).emit('bid_updated', {
        highestBidderId: active.highestBidderId,
        highestBidderName: active.highestBidderName,
        highestBidDiscount: active.highestBidDiscount,
        tiedSubscribers: active.tiedSubscribers,
      });
    });

    // Foreman forces the auction to end
    socket.on('force_end_auction', (data: { chitId: string }) => {
      const { chitId } = data;
      const active = activeAuctions.get(chitId);
      if (active) {
        if (active.timerInterval) clearInterval(active.timerInterval);
        endAuction(chitId, io);
      }
    });

    // Foreman triggers lottery draw for tied members
    socket.on('conduct_lottery_draw', async (data: { chitId: string; candidates: { id: string; name: string }[] }) => {
      const { chitId, candidates } = data;
      const active = activeAuctions.get(chitId);
      if (!active) return;

      console.log(`Conducting lottery draw for candidates:`, candidates);
      io.to(chitId).emit('lottery_started');

      setTimeout(async () => {
        const winnerIndex = Math.floor(Math.random() * candidates.length);
        const winner = candidates[winnerIndex];

        active.highestBidderId = winner.id;
        active.highestBidderName = winner.name;

        io.to(chitId).emit('lottery_winner_declared', {
          winnerId: winner.id,
          winnerName: winner.name,
        });

        if (active.timerInterval) clearInterval(active.timerInterval);
        
        try {
          const result = await AuctionModel.saveResult(active);
          io.to(chitId).emit('auction_ended', result);
        } catch (err) {
          console.error('Failed to save lottery auction result:', err);
        }
        
        activeAuctions.delete(chitId);
      }, 3000);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};

const endAuction = async (chitId: string, io: Server) => {
  const active = activeAuctions.get(chitId);
  if (!active) return;

  console.log(`Auction timed out/ended for chit: ${chitId}`);

  if (active.tiedSubscribers.length > 1 && !active.highestBidderId) {
    io.to(chitId).emit('requires_manual_lottery', {
      tiedSubscribers: active.tiedSubscribers,
    });
  } else {
    try {
      const result = await AuctionModel.saveResult(active);
      io.to(chitId).emit('auction_ended', result);
    } catch (err) {
      console.error('Failed to save timeout auction result:', err);
    }
    activeAuctions.delete(chitId);
  }
};
