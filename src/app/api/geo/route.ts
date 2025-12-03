import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 클라이언트 IP 주소 가져오기
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
    
    // Vercel 환경에서는 x-vercel-ip 헤더 사용
    const vercelIp = request.headers.get('x-vercel-ip');
    const clientIp = vercelIp || ip;
    
    // IP가 localhost나 private IP인 경우 (개발 환경)
    if (clientIp === 'unknown' || clientIp === '127.0.0.1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.')) {
      // 개발 환경에서는 기본값으로 한국 반환 (또는 환경변수로 설정 가능)
      return NextResponse.json({ 
        country: 'KR',
        countryName: 'South Korea',
        isKorea: true 
      });
    }
    
    // IP 기반 국가 감지 (무료 API 사용)
    // ipapi.co 또는 ip-api.com 사용 가능
    const geoResponse = await fetch(`https://ipapi.co/${clientIp}/json/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (geoResponse.ok) {
      const geoData = await geoResponse.json();
      const countryCode = geoData.country_code || 'US';
      const countryName = geoData.country_name || 'Unknown';
      const isKorea = countryCode === 'KR';
      
      return NextResponse.json({
        country: countryCode,
        countryName: countryName,
        isKorea: isKorea,
        ip: clientIp
      });
    }
    
    // API 실패 시 기본값 (영어)
    return NextResponse.json({
      country: 'US',
      countryName: 'United States',
      isKorea: false,
      ip: clientIp
    });
  } catch (error) {
    console.error('Geo API error:', error);
    // 에러 발생 시 기본값 (영어)
    return NextResponse.json({
      country: 'US',
      countryName: 'United States',
      isKorea: false
    });
  }
}


