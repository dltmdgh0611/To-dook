// Polar 웹훅 처리 - 결제/구독 이벤트 수신
import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  
  onPayload: async (payload) => {
    console.log('Polar webhook received:', payload.type);
  },
  
  // 체크아웃 완료 시 (첫 결제)
  onCheckoutUpdated: async (payload) => {
    console.log('Checkout updated:', payload.data);
    
    if (payload.data.status === 'succeeded') {
      const customerEmail = payload.data.customerEmail;
      const customerId = payload.data.customerId;
      
      if (customerEmail) {
        // 7일 후 만료일 계산
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 월간 구독
        
        await prisma.user.updateMany({
          where: { email: customerEmail },
          data: {
            subscriptionStatus: 'active',
            subscriptionStartedAt: new Date(),
            subscriptionExpiresAt: expiresAt,
            polarCustomerId: customerId || undefined,
          },
        });
        
        console.log(`User ${customerEmail} subscription activated`);
      }
    }
  },
  
  // 구독 생성 시
  onSubscriptionCreated: async (payload) => {
    console.log('Subscription created:', payload.data);
    
    const customerId = payload.data.customerId;
    const subscriptionId = payload.data.id;
    
    if (customerId) {
      // Polar 고객 ID로 사용자 찾기
      const user = await prisma.user.findFirst({
        where: { polarCustomerId: customerId },
      });
      
      if (user) {
        const expiresAt = payload.data.currentPeriodEnd 
          ? new Date(payload.data.currentPeriodEnd)
          : null;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'active',
            subscriptionExpiresAt: expiresAt,
            polarSubscriptionId: subscriptionId,
          },
        });
        
        console.log(`User ${user.email} subscription created`);
      }
    }
  },
  
  // 구독 활성화 시
  onSubscriptionActive: async (payload) => {
    console.log('Subscription active:', payload.data);
    
    const subscriptionId = payload.data.id;
    
    const user = await prisma.user.findFirst({
      where: { polarSubscriptionId: subscriptionId },
    });
    
    if (user) {
      const expiresAt = payload.data.currentPeriodEnd 
        ? new Date(payload.data.currentPeriodEnd)
        : null;
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'active',
          subscriptionExpiresAt: expiresAt,
        },
      });
      
      console.log(`User ${user.email} subscription activated`);
    }
  },
  
  // 구독 취소 시
  onSubscriptionCanceled: async (payload) => {
    console.log('Subscription canceled:', payload.data);
    
    const subscriptionId = payload.data.id;
    
    const user = await prisma.user.findFirst({
      where: { polarSubscriptionId: subscriptionId },
    });
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'cancelled',
        },
      });
      
      console.log(`User ${user.email} subscription cancelled`);
    }
  },
  
  // 구독 취소됨 (만료)
  onSubscriptionRevoked: async (payload) => {
    console.log('Subscription revoked:', payload.data);
    
    const subscriptionId = payload.data.id;
    
    const user = await prisma.user.findFirst({
      where: { polarSubscriptionId: subscriptionId },
    });
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'expired',
        },
      });
      
      console.log(`User ${user.email} subscription expired`);
    }
  },
});

