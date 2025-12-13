// 세션 기반 Checkout - 로그인 사용자 정보를 자동으로 Polar에 전달
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 세션 확인
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // 사용자 정보 가져오기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true },
    });
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // 쿼리 파라미터에서 products 가져오기
    const products = req.nextUrl.searchParams.get('products');
    
    if (!products) {
      return NextResponse.json({ error: 'Missing products parameter' }, { status: 400 });
    }
    
    // Polar Checkout URL 구성
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    const successUrl = process.env.POLAR_SUCCESS_URL;
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Polar access token not configured' }, { status: 500 });
    }
    
    // Polar API로 Checkout 세션 생성
    const checkoutResponse = await fetch('https://api.polar.sh/v1/checkouts/custom/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: products,
        success_url: successUrl,
        customer_email: user.email, // 서비스 로그인 이메일 자동 설정
        customer_name: user.name || undefined,
        customer_external_id: user.id, // 사용자 DB ID 전달 (webhook에서 매칭용)
        metadata: {
          user_id: user.id,
          user_email: user.email,
        },
      }),
    });
    
    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('Polar checkout error:', errorData);
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
    
    const checkoutData = await checkoutResponse.json();
    
    // Polar Checkout 페이지로 리다이렉트
    if (checkoutData.url) {
      return NextResponse.redirect(checkoutData.url);
    }
    
    return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}




