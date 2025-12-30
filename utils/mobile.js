/**
 * @author 김대광 <daekwang1026@gmail.com>
 * @since 2025.02.28
 * @version 1.1
 * @description 매개변수 3개부터는 RORO 패턴 적용
 */

/**
 * 모바일 브라우저 여부 체크
 * @returns 
 */
export const isMobile = () => {
    if (navigator.userAgentData) {
        return navigator.userAgentData.mobile;
    }

    // userAgentData를 사용할 수 없는 경우 user agent 문자열을 분석합니다.
    const userAgent = navigator.userAgent;

    // 복잡도를 줄인 정규식 (정확도 저하 가능성 있음)
    return /(mobile|android|iphone|ipod|ipad|windows phone)/i.test(userAgent);
};

/**
 * 모바일 브라우저 여부 체크 (브라우저 모바일 모드도 모바일로 인식)
 * @returns 
 */
export const isUserAgentMobile = () => {
    const userAgent = navigator.userAgent || window.opera;
    
    return (
        /android/i.test(userAgent) ||
        /iPad|iPhone|iPod/.test(userAgent) ||
        /blackberry|bb10|playbook/i.test(userAgent) ||
        /windows phone/i.test(userAgent) ||
        /webos|touchpad|hpwos/i.test(userAgent)
    );
};

/**
 * Android, iOS 여부 체크
 * @returns 
 */
export const isMobileOs = () => {
    const userAgent = navigator.userAgent;

    const androidRegex = /Android/i;
    const androidMatch = androidRegex.exec(userAgent);

    const iOSRegex = /iPhone|iPad|iPod/i;
    const iOSMatch = iOSRegex.exec(userAgent);

    return {
        Android: !!androidMatch,
        iOS: !!iOSMatch
    };
};

/**
 * UserAgent 에서 특정 문자열 유무 체크
 * @param {string} checkString 
 * @returns 
 * 
 * @example
 * 주로 모바일 협업 시, 애플리케이션 접속 판별로 사용
 * - 커스터마이징 하지 않는 이상 모바일 웹, WebView 의 UserAgent는 동일
 */
export const isCheckUserAgent = (checkString) => {
    if ( typeof checkString !== 'string' || !checkString?.trim() ) {
        console.error('checkString must be a non-empty string.');
        return false;
    }

    const agent = navigator.userAgent;
    return agent.includes(checkString);
};

/**
 * INTENT 방식 (Intent URI)
 * 
 * 이 링크가 작동하려면 다음 설정이 필수입니다.
 * AndroidManifest.xml
 *  <intent-filter>
 *      <action android:name="android.intent.action.VIEW" />
 *      <category android:name="android.intent.category.DEFAULT" />
 *      <category android:name="android.intent.category.BROWSABLE" />
 *      <data android:host="호스트" android:scheme="스키마" />
 *  </intent-filter>
 * * @param {object} options
 * @param {string} options.host 
 * @param {string} options.scheme 
 * @param {string} options.packageName 
 * @param {undefined|string} options.screen
 * @returns 
 */
export const makeAndroidAppLinkUrl = ({host, scheme, packageName, screen = ''} = {}) => {
    if ( !host || !scheme || !packageName ) {
        console.error('host, scheme, packageName are required.');
        return '';
    }

    if ( screen  ) {
        return 'intent://' + host + '/#Intent;package=' + packageName + ';scheme=' + scheme + ';S.screen=' + screen + ';end';
    } else {
        return 'intent://' + host + '/#Intent;package=' + packageName + ';scheme=' + scheme + ';end';
    }
};

/**
 * URL 스킴 방식
 * 
 * 이 링크가 작동하려면 다음 설정이 필수입니다.
 * 1. Xcode 프로젝트에서 'Info' 탭을 엽니다.
 * 2. 'URL Types' 섹션으로 스크롤하여 새 항목을 추가합니다 ( '+' 버튼 클릭).
 * 3. 'Identifier' 필드에 고유한 식별자를 입력합니다 (예: 'com.yourcompany.yourapp').
 * 4. 'URL Schemes' 필드에 사용할 스키마를 입력합니다 (예: 'your-app-scheme').
 * 여기에 입력된 스키마가 makeURLSchemeIOSAppLinkUrl 함수의 'scheme' 매개변수와 일치해야 합니다.
 * * @param {object} options
 * @param {string} options.host 
 * @param {string} options.scheme 
 * @param {undefined|string} options.screen
 * @returns 
 */
export const makeURLSchemeIOSAppLinkUrl = ({host, scheme, screen = ''} = {}) => {
    if ( !host || !scheme ) {
        console.error('host, scheme are required.');
        return '';
    }

    if ( screen ) {
        return scheme + '://' + host + '?screen=' + screen;
    } else {
        return scheme + '://' + host;
    }
};

/**
 * 앱링크 or 딥링크 실행
 * * @param {object} options
 * @param {string} options.androidUrl 
 * @param {string} options.iosUrl 
 * @param {string} options.iosAppStoreUrl 
 * 
 * @link https://gomest.tistory.com/7
 */
export const runAppLinkUrl = ({androidUrl, iosUrl, iosAppStoreUrl} = {}) => {
    if ( !androidUrl || !iosUrl || !iosAppStoreUrl ) {
        console.error('androidUrl, iosUrl, iosAppStoreUrl are required.');
        return;
    }

    if ( isMobile() ) {
        const mobileOs = isMobileOs();

        if ( mobileOs.Android ) {
            // 안드로이드는 설치되어 있지 않으면 자동으로 마켓으로 이동
            location.href = androidUrl;
        }

        if ( mobileOs.iOS ) {
            // 1초 이후 반응이 없으면 앱스토어로 이동
            setTimeout(function () {
                window.open(iosAppStoreUrl);
            }, 1000);

            location.href = iosUrl;
        }
    } else {
        console.log('모바일 플랫폼에서만 사용 가능합니다.');
    }
};
