// Polar 웹훅 처리 - 결제/구독 이벤트 수신
import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// 웹훅 시크릿이 설정되어 있으면 Polar SDK 사용, 아니면 직접 처리
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

// Polar SDK를 사용한 웹훅 핸들러
const polarWebhookHandler = webhookSecret ? Webhooks({
  webhookSecret: webhookSecret,
  
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
}) : null;

// 웹훅 시크릿 없이 직접 처리하는 핸들러
async function handleWebhookDirectly(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Polar webhook received (direct):', payload.type, payload);
    
    // checkout.updated 이벤트 처리
    if (payload.type === 'checkout.updated' && payload.data?.status === 'succeeded') {
      const customerEmail = payload.data.customer_email || payload.data.customerEmail;
      const customerId = payload.data.customer_id || payload.data.customerId;
      
      if (customerEmail) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
        
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
    
    // subscription 이벤트 처리
    if (payload.type?.startsWith('subscription.')) {
      const customerId = payload.data?.customer_id || payload.data?.customerId;
      const subscriptionId = payload.data?.id;
      
      if (customerId || subscriptionId) {
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { polarCustomerId: customerId },
              { polarSubscriptionId: subscriptionId },
            ].filter(Boolean),
          },
        });
        
        if (user) {
          let status = user.subscriptionStatus;
          
          if (payload.type === 'subscription.created' || payload.type === 'subscription.active') {
            status = 'active';
          } else if (payload.type === 'subscription.canceled') {
            status = 'cancelled';
          } else if (payload.type === 'subscription.revoked') {
            status = 'expired';
          }
          
          const expiresAt = payload.data?.current_period_end || payload.data?.currentPeriodEnd;
          
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: status,
              subscriptionExpiresAt: expiresAt ? new Date(expiresAt) : undefined,
              polarSubscriptionId: subscriptionId || undefined,
            },
          });
          
          console.log(`User ${user.email} subscription updated to ${status}`);
        }
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// POST 핸들러 - 웹훅 시크릿 유무에 따라 분기
export async function POST(req: NextRequest) {
  if (polarWebhookHandler) {
    return polarWebhookHandler(req);
  }
  return handleWebhookDirectly(req);
}

