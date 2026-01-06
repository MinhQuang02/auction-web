import express from 'express';
import prisma from '../lib/prisma.js';
import requireRole from '../middlewares/requireRole.js';

const router = express.Router();

// GET /api/messages?transactionId=...
// Or get messages between me and seller for a product
// The requirement says: "fetch conversation history between current winner and seller for this specific product".
// Best way: find Transaction ID (if exists) or Product ID.
// But database schema `Chat_Message` is linked to `Transaction`.
// If transaction doesn't exist yet (Unpaid), we might not have a `transaction_id`.
// CHECK SCHEMA: `Chat_Message` has `transaction_id` foreign key.
// This means messages ONLY exist if a transaction exists?
// Requirement 2: "Contact Seller... for 'Unpaid' items".
// If 'Unpaid', transaction might NOT exist yet (if strict 'pending_payment' creates it).
// productService `createTransaction` implies paying creates it (status 'pending_shipping').
// If Unpaid items don't have a transaction record, we CANNOT use `Chat_Message` table as defined.
// WORKAROUND: Create a 'pending_payment' transaction immediately when auction ends?
// OR: Allow messages without transaction? No, schema is strict.
// SOLUTION:
// When fetching messages for Unpaid item, check if Transaction exists.
// If NOT, we must CREATE a `pending_payment` transaction placeholder to attach messages to.
// OR: The user implies "Contact Seller" acts as a pre-payment chat.
// I will implement `getProductMessages` controller.
// It will find or create a transaction for (product_id, buyer_id, seller_id).

// GET /conversations - List all active conversations (Transactions with messages)
router.get('/conversations', requireRole('seller', 'bidder'), async (req, res) => {
    try {
        const userId = req.auth.userId;

        // Find transactions where I am buyer or seller AND matches logic
        // We want ones with messages ideally, OR just all active "deal" contexts.
        // User request: "hien thi ra nhung nguoi ma seller nay co nhan tin" -> interactions.

        const transactions = await prisma.transaction.findMany({
            where: {
                OR: [
                    { seller_id: userId },
                    { buyer_id: userId }
                ]
            },
            include: {
                product: { select: { product_id: true, name: true, main_image_url: true } },
                buyer: { select: { user_id: true, full_name: true } },
                seller: { select: { user_id: true, full_name: true } },
                messages: {
                    orderBy: { sent_at: 'desc' },
                    take: 1
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Map to conversation format
        const conversations = transactions
            .filter(t => t.messages.length > 0) // Only showing threads with actual history? Or all? User said "hien thi nhung nguoi ... co nhan tin". Let's show existing chats.
            .map(t => {
                const isSeller = t.seller_id === userId;
                const otherUser = isSeller ? t.buyer : t.seller;
                return {
                    transactionId: t.transaction_id,
                    productId: t.product.product_id,
                    productName: t.product.name,
                    productImage: t.product.main_image_url,
                    otherUser: otherUser,
                    lastMessage: t.messages[0]
                };
            });

        res.json(conversations);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

router.get('/:productId', requireRole('bidder', 'seller'), async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.auth.userId;

        // 1. Find Product
        const product = await prisma.product.findUnique({
            where: { product_id: parseInt(productId) },
            include: { transaction: true }
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Verify Involvement
        if (product.winner_id !== userId && product.seller_id !== userId) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        let transactionId = product.transaction?.transaction_id;

        // If no transaction yet, and user is winner, we might need to create one OR return empty?
        // But we can't save message without transaction_id.
        // We will return empty list if no transaction.
        // The POST route will handle creation.

        if (!transactionId) return res.json([]);

        const messages = await prisma.chat_Message.findMany({
            where: { transaction_id: transactionId },
            orderBy: { sent_at: 'asc' },
            include: {
                sender: { select: { full_name: true } }
            }
        });

        res.json(messages);
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

router.post('/:productId', requireRole('bidder', 'seller'), async (req, res) => {
    try {
        const { productId } = req.params;
        const { messageText } = req.body;
        const userId = req.auth.userId;

        const product = await prisma.product.findUnique({
            where: { product_id: parseInt(productId) },
            include: { transaction: true }
        });

        if (!product) return res.status(404).json({ message: "Product not found" });

        // Identify Sender/Receiver
        let senderId = userId;
        let receiverId = (userId === product.seller_id) ? product.winner_id : product.seller_id;

        if (!receiverId) return res.status(400).json({ message: "No recipient found (No winner yet?)" });

        // Get/Create Transaction
        let transaction = product.transaction;
        if (!transaction) {
            // Create "pending_payment" transaction to house messages
            transaction = await prisma.transaction.create({
                data: {
                    product_id: parseInt(productId),
                    buyer_id: product.winner_id,
                    seller_id: product.seller_id,
                    status: 'pending_payment',
                    payment_proof: '',
                    shipping_address: '',
                }
            });
        }

        const newMessage = await prisma.chat_Message.create({
            data: {
                transaction_id: transaction.transaction_id,
                sender_id: senderId,
                receiver_id: receiverId,
                message_text: messageText
            }
        });

        res.json(newMessage);

    } catch (e) {
        console.error(e);
        res.status(500).json({ message: e.message });
    }
});

export default router;
