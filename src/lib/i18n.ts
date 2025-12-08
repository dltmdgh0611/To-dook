// 다국어 번역 파일

export type Language = 'ko' | 'en';

export const translations = {
  ko: {
    // 공통
    loading: '로딩 중...',
    save: '저장',
    cancel: '취소',
    delete: '삭제',
    edit: '편집',
    close: '닫기',
    confirm: '확인',
    skip: '건너뛰기',
    continue: '계속하기',
    user: '사용자',
    
    // 메인 레이아웃
    greeting: '안녕하세요, {name}님',
    greetingSubtitle: '오늘도 좋은 하루 되세요!',
    welcome: '환영합니다!',
    welcomeMessage: '이름을 알려주시면 더 개인화된 경험을 제공해드릴게요.',
    step1of3: 'Step 1 of 3',
    step2of3: 'Step 2 of 3',
    step3of3: 'Step 3 of 3',
    enterName: '이름을 입력해주세요',
    newTodo: '새 할 일 추가',
    generateWithAI: 'AI로 할 일 생성',
    generateWithAITitle: 'AI로 할 일 생성하기',
    generateWithAIDesc: '이 버튼을 클릭하면 연동된 Gmail, Slack, Notion에서 AI가 할 일을 자동으로 추출해요.',
    accountLinkTitle: '설정에서 계정 연동하기',
    accountLinkDesc: '프로필을 클릭한 후 "설정"에서 Gmail, Slack, Notion을 연동하세요. 연동하면 AI가 자동으로 할 일을 생성해드립니다.',
    accountLinkNote: '계정을 먼저 연동해야 사용할 수 있어요!',
    upgradePlan: '업그레이드 플랜',
    settings: '설정',
    logout: '로그아웃',
    freeTrial: '7일 무료체험 중',
    daysRemaining: '남은 기간: {days}일',
    
    // 채팅 패널
    chatTitle: 'To-dook chating',
    chatGreeting: '안녕하세요!',
    chatSubtitle: '다음 작업을 알려주시면 제가 처리해드릴게요.',
    chatExample: 'example',
    chatPlaceholder: 'AI Chat은 아직 오픈 준비 중입니다',
    chatComingSoon: '채팅 기능은 곧 오픈될 예정입니다',
    
    // 설정 모달
    connections: '연결 정보',
    connectionsDesc: '외부 서비스와 연결하여 더 많은 기능을 사용하세요.',
    permissions: '권한 설정',
    permissionsDesc: 'AI가 데이터를 가져올 채널과 페이지를 선택하세요. 선택하지 않으면 모든 데이터를 가져옵니다.',
    account: '계정',
    accountDesc: '계정 설정을 관리합니다.',
    general: '일반',
    generalDesc: '언어 및 기본 설정을 관리합니다.',
    language: '언어',
    languageDesc: '표시 언어를 선택하세요.',
    korean: '한국어',
    english: 'English',
    
    // Gmail
    gmail: 'Gmail',
    gmailDesc: '이메일을 연동하여 일정 관리하기',
    gmailConnected: '연결됨',
    connect: '연결하기',
    disconnect: '연결 해제',
    
    // Slack
    slack: 'Slack',
    slackDesc: 'Slack과 연동하여 알림 받기',
    slackChannels: 'Slack 채널',
    selectedChannels: '선택된 채널: {count}',
    selectedChannelsAll: '선택된 채널: 전체',
    allChannels: '전체',
    
    // Notion
    notion: 'Notion',
    notionOAuth: 'Notion (OAuth)',
    notionDesc: 'Notion과 연동하여 데이터 동기화',
    notionApiKey: 'Notion API 키 (직접 입력)',
    notionApiKeyDesc: 'Internal Integration의 API 키를 직접 입력할 수 있습니다.',
    createIntegration: 'Integration 만들기 →',
    apiKeyPlaceholder: 'secret_xxxxxxxxxxxxx',
    saving: '저장 중...',
    apiKeySaved: '✓ API 키가 설정되어 있습니다.',
    notionPages: 'Notion 페이지/데이터베이스',
    selectedPages: '선택된 페이지: {count}',
    selectedPagesAll: '선택된 페이지: 전체',
    allPages: '전체',
    cannotLoadPages: '페이지 목록을 불러올 수 없습니다. Integration에 페이지를 공유했는지 확인하세요.',
    
    // 권한 설정
    savePermissions: '권한 설정 저장',
    permissionsSaved: '권한 설정이 저장되었습니다.',
    permissionsSaveFailed: '권한 설정 저장에 실패했습니다.',
    
    // 구독
    subscriptionCancelled: '구독이 취소되었습니다. 현재 결제 기간이 끝날 때까지 서비스를 이용할 수 있습니다.',
    subscriptionCancelFailed: '구독 취소에 실패했습니다.',
    
    // 계정 설정
    accountInfo: '계정 정보',
    name: '이름',
    email: '이메일',
    dangerZone: '위험 구역',
    deleteAccountDesc: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
    deleteAccount: '계정 삭제',
    deleteConfirm: '정말 삭제하시겠습니까?',
    
    // 할 일
    todo: 'To-do',
    card: 'Card',
    cardViewComingSoon: 'Card View (Coming Soon)',
    dragToReorder: '드래그하여 순서 변경',
    noTodos: '할 일이 없습니다',
    addTodo: '할 일 추가',
    todoTitle: '할 일 제목',
    dueDate: '마감일',
    saveTodo: '저장',
    deleteTodo: '삭제',
    today: '오늘',
    tomorrow: '내일',
    thisWeek: '이번 주',
    nextWeek: '다음 주',
    selectDate: '날짜 선택',
    
    // 날짜 포맷
    todayDate: '오늘',
    tomorrowDate: '내일',
    
    // 모바일 경고
    mobileWarningTitle: '데스크탑 사용을 권장합니다',
    mobileWarningMessage: '더 나은 경험을 위해 데스크탑 접속을 권장드립니다. 모바일에서는 일부 기능이 제한될 수 있습니다.',
    mobileWarningContinue: '계속하기',
  },
  en: {
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    skip: 'Skip',
    continue: 'Continue',
    user: 'User',
    
    // Main Layout
    greeting: 'Hello, {name}',
    greetingSubtitle: 'Have a great day!',
    welcome: 'Welcome!',
    welcomeMessage: 'Please let us know your name so we can provide you with a more personalized experience.',
    step1of3: 'Step 1 of 3',
    step2of3: 'Step 2 of 3',
    step3of3: 'Step 3 of 3',
    enterName: 'Please enter your name',
    newTodo: 'Add new todo',
    generateWithAI: 'Generate todos with AI',
    generateWithAITitle: 'Generate todos with AI',
    generateWithAIDesc: 'Click this button to automatically extract todos from connected Gmail, Slack, and Notion using AI.',
    accountLinkTitle: 'Link accounts in settings',
    accountLinkDesc: 'Click your profile and then link Gmail, Slack, and Notion in "Settings". Once linked, AI will automatically generate todos for you.',
    accountLinkNote: 'You must link accounts first to use this feature!',
    upgradePlan: 'Upgrade Plan',
    settings: 'Settings',
    logout: 'Logout',
    freeTrial: '7-day free trial',
    daysRemaining: 'Days remaining: {days}',
    
    // Chat Panel
    chatTitle: 'To-dook chating',
    chatGreeting: 'Hello!',
    chatSubtitle: 'Let me know what you need help with, and I\'ll take care of it.',
    chatExample: 'example',
    chatPlaceholder: 'AI Chat is still being prepared',
    chatComingSoon: 'Chat feature will be available soon',
    
    // Settings Modal
    connections: 'Connections',
    connectionsDesc: 'Connect external services to use more features.',
    permissions: 'Permissions',
    permissionsDesc: 'Select channels and pages for AI to fetch data from. If none are selected, all data will be fetched.',
    account: 'Account',
    accountDesc: 'Manage account settings.',
    general: 'General',
    generalDesc: 'Manage language and basic settings.',
    language: 'Language',
    languageDesc: 'Select display language.',
    korean: '한국어',
    english: 'English',
    
    // Gmail
    gmail: 'Gmail',
    gmailDesc: 'Link email to manage schedules',
    gmailConnected: 'Connected',
    connect: 'Connect',
    disconnect: 'Disconnect',
    
    // Slack
    slack: 'Slack',
    slackDesc: 'Link Slack to receive notifications',
    slackChannels: 'Slack Channels',
    selectedChannels: 'Selected channels: {count}',
    selectedChannelsAll: 'Selected channels: All',
    allChannels: 'All',
    
    // Notion
    notion: 'Notion',
    notionOAuth: 'Notion (OAuth)',
    notionDesc: 'Link Notion to sync data',
    notionApiKey: 'Notion API Key (Manual Entry)',
    notionApiKeyDesc: 'You can directly enter the API key of your Internal Integration.',
    createIntegration: 'Create Integration →',
    apiKeyPlaceholder: 'secret_xxxxxxxxxxxxx',
    saving: 'Saving...',
    apiKeySaved: '✓ API key has been set.',
    notionPages: 'Notion Pages/Databases',
    selectedPages: 'Selected pages: {count}',
    selectedPagesAll: 'Selected pages: All',
    allPages: 'All',
    cannotLoadPages: 'Unable to load page list. Please check if pages are shared with the Integration.',
    
    // Permissions
    savePermissions: 'Save Permissions',
    permissionsSaved: 'Permissions have been saved.',
    permissionsSaveFailed: 'Failed to save permissions.',
    
    // Subscription
    subscriptionCancelled: 'Subscription cancelled. You can continue using the service until the end of your current billing period.',
    subscriptionCancelFailed: 'Failed to cancel subscription.',
    
    // Account Settings
    accountInfo: 'Account Information',
    name: 'Name',
    email: 'Email',
    dangerZone: 'Danger Zone',
    deleteAccountDesc: 'Deleting your account will permanently delete all data. This action cannot be undone.',
    deleteAccount: 'Delete Account',
    deleteConfirm: 'Are you sure you want to delete?',
    
    // Todos
    todo: 'To-do',
    card: 'Card',
    cardViewComingSoon: 'Card View (Coming Soon)',
    dragToReorder: 'Drag to reorder',
    noTodos: 'No todos',
    addTodo: 'Add Todo',
    todoTitle: 'Todo Title',
    dueDate: 'Due Date',
    saveTodo: 'Save',
    deleteTodo: 'Delete',
    today: 'Today',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    nextWeek: 'Next Week',
    selectDate: 'Select Date',
    
    // Date Format
    todayDate: 'Today',
    tomorrowDate: 'Tomorrow',
    
    // Mobile Warning
    mobileWarningTitle: 'Desktop Recommended',
    mobileWarningMessage: 'For a better experience, please access from a desktop. Some features may be limited on mobile.',
    mobileWarningContinue: 'Continue',
  }
};

export function getTranslation(lang: Language, key: keyof typeof translations.ko, params?: Record<string, string | number>): string {
  const translation = translations[lang][key] || translations.ko[key] || key;
  
  if (params) {
    return translation.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }
  
  return translation;
}

