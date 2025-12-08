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

// 사용자 찾기 헬퍼 함수 - 여러 방법으로 사용자 매칭 시도
async function findUserByMultipleMethods(data: {
  customerExternalId?: string;
  metadata?: { user_id?: string; user_email?: string };
  customerEmail?: string;
  customerId?: string;
  subscriptionId?: string;
}) {
  const { customerExternalId, metadata, customerEmail, customerId, subscriptionId } = data;
  
  // 1순위: customer_external_id (우리 DB의 user.id)
  if (customerExternalId) {
    const user = await prisma.user.findUnique({
      where: { id: customerExternalId },
    });
    if (user) {
      console.log(`Found user by external_id: ${user.email}`);
      return user;
    }
  }
  
  // 2순위: metadata에서 user_id
  if (metadata?.user_id) {
    const user = await prisma.user.findUnique({
      where: { id: metadata.user_id },
    });
    if (user) {
      console.log(`Found user by metadata.user_id: ${user.email}`);
      return user;
    }
  }
  
  // 3순위: metadata에서 user_email
  if (metadata?.user_email) {
    const user = await prisma.user.findUnique({
      where: { email: metadata.user_email },
    });
    if (user) {
      console.log(`Found user by metadata.user_email: ${user.email}`);
      return user;
    }
  }
  
  // 4순위: Polar customer ID
  if (customerId) {
    const user = await prisma.user.findFirst({
      where: { polarCustomerId: customerId },
    });
    if (user) {
      console.log(`Found user by polarCustomerId: ${user.email}`);
      return user;
    }
  }
  
  // 5순위: Polar subscription ID
  if (subscriptionId) {
    const user = await prisma.user.findFirst({
      where: { polarSubscriptionId: subscriptionId },
    });
    if (user) {
      console.log(`Found user by polarSubscriptionId: ${user.email}`);
      return user;
    }
  }
  
  // 6순위: 이메일 (마지막 수단)
  if (customerEmail) {
    const user = await prisma.user.findUnique({
      where: { email: customerEmail },
    });
    if (user) {
      console.log(`Found user by email: ${user.email}`);
      return user;
    }
  }
  
  return null;
}

// 웹훅 시크릿 없이 직접 처리하는 핸들러
async function handleWebhookDirectly(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log('Polar webhook received (direct):', payload.type, JSON.stringify(payload.data, null, 2));
    
    // checkout.updated 이벤트 처리
    if (payload.type === 'checkout.updated' && payload.data?.status === 'succeeded') {
      const customerEmail = payload.data.customer_email || payload.data.customerEmail;
      const customerId = payload.data.customer_id || payload.data.customerId;
      const customerExternalId = payload.data.customer_external_id || payload.data.customerExternalId;
      const metadata = payload.data.metadata;
      
      // 여러 방법으로 사용자 찾기
      const user = await findUserByMultipleMethods({
        customerExternalId,
        metadata,
        customerEmail,
        customerId,
      });
      
      if (user) {
        // 7일 후 만료일 계산 (트라이얼)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7일 트라이얼
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'trial', // 첫 결제는 트라이얼로 시작
            subscriptionStartedAt: new Date(),
            subscriptionExpiresAt: expiresAt,
            polarCustomerId: customerId || undefined,
          },
        });
        
        console.log(`User ${user.email} trial activated (7 days)`);
      } else {
        console.error('Could not find user for checkout:', { customerEmail, customerId, customerExternalId, metadata });
      }
    }
    
    // subscription 이벤트 처리
    if (payload.type?.startsWith('subscription.')) {
      const customerId = payload.data?.customer_id || payload.data?.customerId;
      const customerExternalId = payload.data?.customer_external_id || payload.data?.customerExternalId;
      const subscriptionId = payload.data?.id;
      const metadata = payload.data?.metadata;
      
      const user = await findUserByMultipleMethods({
        customerExternalId,
        metadata,
        customerId,
        subscriptionId,
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
            polarCustomerId: customerId || undefined,
          },
        });
        
        console.log(`User ${user.email} subscription updated to ${status}`);
      } else {
        console.error('Could not find user for subscription event:', { customerId, customerExternalId, subscriptionId });
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

