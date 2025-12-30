/**
 * @author 김대광 <daekwang1026@gmail.com>
 * @since 2025.12.25
 * @version 1.0
 * @description 매개변수 3개부터는 RORO 패턴 적용
 */

import { isMobile } from "./mobile.js";

/**
 * @link https://developers.kakao.com/docs/latest/ko/kakaologin/js
 */
export const KakaoAuth = {
    /**
     * 카카오 로그인
     * 
     * @param {Function} loginFailCallBack
     */
    loginWithKakao: async (loginFailCallBack) => {
        if ( typeof loginFailCallBack !== 'function' ) {
            console.error("loginFailCallBack is not function");
            return;
        }

        return new Promise((resolve, reject) => {
            window.Kakao.Auth.login({
                success: function (response) {
                    const accessToken = response.access_token;
                    resolve(accessToken);
                },
                fail: function (error) {
                    loginFailCallBack(error);
                    reject(error);
                }
            });
        });
    },
    /**
     * 카카오 사용자 정보 가져오기
     * * @param {object} options
     * @param {string} options.accessToken 
     * @param {Function} options.userMeSucCallBack 
     * @param {Function} options.userMeFailCallBak 
     */
    getUserInfoWithKakao: ({accessToken, userMeSucCallBack, userMeFailCallBak} = {}) => {
        if ( typeof accessToken !== 'string' || !accessToken?.trim() ) {
            console.error('accessToken is empty or null.');
            return false;
        }

        if ( typeof userMeSucCallBack !== 'function' ) {
            console.error("userMeSucCallBack is not function");
            return;
        }

        if ( typeof userMeFailCallBak !== 'function' ) {
            console.error("userMeFailCallBak is not function");
            return;
        }

        // 토큰 할당
        window.Kakao.Auth.setAccessToken(accessToken);

        // 사용자 정보 가져오기
        window.Kakao.API.request({
            url: '/v2/user/me',
            success: function (response) {
                userMeSucCallBack(response);
            },
            fail: function (error) {
                userMeFailCallBak(error);
            }
        });
    },
    /**
     * 카카오 로그아웃
     * @param {Function} logoutCallBack 
     * @returns 
     */
    logoutWithKakao: (logoutCallBack) => {
        if ( typeof logoutCallBack !== 'function' ) {
            console.error("logoutCallBack is not function");
            return;
        }

        if ( !window.Kakao.Auth.getAccessToken() ) {
            console.log('Not logged in.');
            return;
        }

        // 접근 토큰 무효화
        window.Kakao.Auth.logout(function() {
            logoutCallBack( window.Kakao.Auth.getAccessToken() );
        });
    }
};

/**
 * @link https://developers.naver.com/docs/login/web/web.md
 * @description SDK 버전 1
 * 
 * @link https://developers.naver.com/docs/login/sdks/sdks.md
 * @description SDK 버전 2 (권장)
 */
export const NaverAuth = {
    /**
     * 네이버 로그인
     * @param {string} clientId 
     * @param {string} callbackUrl 
     */
    loginWithNaver: (clientId, callbackUrl) => {
        if ( typeof clientId !== 'string' || !clientId?.trim() ) {
            console.error('clientId is empty or null.');
            return false;
        }

        if ( typeof callbackUrl !== 'string' || !callbackUrl?.trim() ) {
            console.error('callbackUrl is empty or null.');
            return false;
        }

        const naverLogin = new window.naver.LoginWithNaverId(
            {
                clientId: clientId,
                callbackUrl: callbackUrl,
                isPopup: !isMobile(), /* 팝업을 통한 연동처리 여부 */
                loginButton: {color: "green", type: 3, height: 60} /* 로그인 버튼의 타입을 지정 */
            }
        );

        /* 설정정보를 초기화하고 연동을 준비 */
        naverLogin.init();
    },
    /**
     * 네이버 로그인 콜백
     * @param {string} clientId 
     * @param {string} callbackUrl 
     * @returns
     * 
     * @example
     * const naverLogin = Naver.loginWithNaverCallBack(clientId, callbackUrl); 
     * 
     * naverLogin.getLoginStatus(function (status) {
     *  if (status) {
     *      const accessToken = naverLogin.accessToken.accessToken;
     *      
     *      const email = naverLogin.user.getEmail();
     *      const name = naverLogin.user.getName();
     *      const mobile = naverLogin.user.getMobile();
     * 
     *      const userObj = {};
     *      userObj.accessToken = accessToken;
     *      userObj.email = email;
     *      userObj.name = name;
     *      userObj.mobile = mobile;
     * 
     *      window.opener.getProfileSucCallBack(profileObj);
     *      window.close();
     *  } else {
     *      console.error("AccessToken을 불러오지 못했습니다. 로그인 상태를 확인하세요.");
     *  }
     * });
     */
    loginWithNaverCallBack: (clientId, callbackUrl) => {
        if ( typeof clientId !== 'string' || !clientId?.trim() ) {
            console.error('clientId is empty or null.');
            return false;
        }

        if ( typeof callbackUrl !== 'string' || !callbackUrl?.trim() ) {
            console.error('callbackUrl is empty or null.');
            return false;
        }

        const naverLogin = new window.naver.LoginWithNaverId(
            {
                clientId: clientId,
                callbackUrl: callbackUrl,
                isPopup: true,
                callbackHandle: true
                /* callback 페이지가 분리되었을 경우에 callback 페이지에서는 callback처리를 해줄수 있도록 설정합니다. */
            }
        );

        /* 네아로 로그인 정보를 초기화하기 위하여 init을 호출 */
        naverLogin.init();

        return naverLogin;
    }
};

/*
    구글 로그인

    https://developers.google.com/identity/sign-in/web/sign-in#before_you_begin
    https://developers.google.com/identity/sign-in/web/reference#gapiauth2initparams

    구현 이전에 설정부터 복잡
    설정 시, URI 입력하는 부분이 있는데 IP로 입력하면 구글 로그인이 안된다.
    예) http://127.0.0.1:5500 (X), http://localhost:5500 (O)

    https://tyrannocoding.tistory.com/51

        <head>
            ...
            <meta name ="google-signin-client_id" content="OAuth2.0 클라이언트ID">

            ...
            <script src="https://apis.google.com/js/platform.js?onload=googleAuthInit" async defer></script>
        </head>
        <body>
            <div class="g-signin2" id="GgCustomLogin"></div>
            <a href="#" onclick="googleSignOut();">Sign out</a>

            <script>
                function googleAuthInit() {
                    gapi.load('auth2', function() {
                        gapi.auth2.init();

                        options = new gapi.auth2.SigninOptionsBuilder();
                        options.setPrompt('select_account');
                        options.setScope('profile').setScope('email');

                        gapi.auth2.getAuthInstance().attachClickHandler('GgCustomLogin', options, googleSignIn, googleSignFailure);
                    });
                }

                function googleSignIn(googleUser) {
                    const access_token = googleUser.getAuthResponse().access_token;

                    const method = 'get';

                    const param = {};
                    param.personFields = 'birthdays';
                    param.key = 'API 키';
                    param.access_token = access_token;

                    const queryString = new URLSearchParams(param).toString();

                    const url = `https://people.googleapis.com/v1/people/me?${queryString}`;

                    fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                        }
                    })
                    .then((response) =>
                        response.json()
                    )
                    .then((data) =>
                        googleSignInCallBack(data)
                    )
                    .catch((error) =>
                        console.error('Error: ', error);
                    )
                }

                // 프로필을 가져온다
                function googleSignInCallBack(data) {
                    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
                    const profile = googleUser.getBasicProfile();

                    console.log(profile);
                }

                function googleSignFailure(t) {
                    console.log(t);
                }

                // 로그아웃
                function googleSignOut() {
                    const auth2 = gapi.auth2.getAuthInstance();
                    auth2.signOut().then(function () {
                        console.log('User signed out.');
                    });
                    auth2.disconnect();
                }
            </script>
        </body>
*/

/*
    페이스북 로그인

    https://developers.facebook.com/docs/facebook-login/web?locale=ko_KR

    버전에 따라 구현 방식이 조금씩 달라지는듯 한데, 공식 레퍼런스 참고하면 된다.

    https://tyrannocoding.tistory.com/50

    1. SDK 임포트 URL > 코드 받기
        나머지 내용 참조하고, 전체 코드 예시 참고

        https://developers.facebook.com/docs/facebook-login/web#loginbutton

    2. Language는 URL 참고 후, Locales URL 참고
        https://developers.facebook.com/docs/javascript/advanced-setup
        http://fbdevwiki.com/wiki/Locales

    3. 콘솔 오류에 따라 https 적용
        sdk.js?hash=8fdbc8422dc2ce03b58408150cdadd42:49 The Login Button plugin no longer works on http pages. Please update your site to use https for Facebook Login

        VS코드 Live Server에 https 적용
        https://uiyoji-journal.tistory.com/89

    4. VS코드 진행 순서
        1) 기본설정: 기본 설정 열기(JSON)
        2) liveServer.settings.https 검색 복사
        3) 기본설정: 설정 열기(JSON)
        4) 최하단에 추가
        5) 설정 이후, Liver Server 다시 시작, 안전하지 않음 클릭

            <head>
                ...
                <script async defer crossorigin="anonymous" src="https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v11.0&appId=앱ID&autoLogAppEvents=1" nonce="rRcgKpNh"></script>
            </head>
            <body>
                <div id="fb-root"></div>
                <div class="fb-login-button" data-width="" data-size="large" data-button-type="continue_with" data-layout="default" data-auto-logout-link="false" data-use-continue-as="false"
                    scope="public_profile,email" onlogin="checkLoginState();"></div>

                <a href="#" onclick="facebookSignOut();">Sign out</a>

                <script>
                    window.fbAsyncInit = function() {
                        FB.init({
                            appId            : '앱ID',
                            autoLogAppEvents : true,
                            xfbml            : true,
                            version          : 'v11.0'
                        });

                        FB.getLoginStatus(function(response) {
                            statusChangeCallback(response);
                        });
                    });

                    function checkLoginState() {
                        FB.getLoginStatus(function(response) {
                            // console.log( response );
                            statusChangeCallback(response);
                        });
                    }

                    function statusChangeCallback(response) {
                        if (response.status === 'connected') {
                            callgetProfileAPI();
                        } else if (response.status === 'not_authorized') {
                            // 사람은 Facebook에 로그인했지만 앱에는 로그인하지 않았습니다.
                            alert('앱에 로그인해야 이용가능한 기능입니다.');
                        } else {
                            // 그 사람은 Facebook에 로그인하지 않았으므로이 앱에 로그인했는지 여부는 확실하지 않습니다.
                            alert('페이스북에 로그인해야 이용가능한 기능입니다.');
                        }
                    }

                    function callgetProfileAPI() {
                        FB.api('/me', function(response) {
                            console.log(response);
                        });
                    }

                    function facebookSignOut() {
                        FB.logout(function(response) {
                            console.log(response);
                        });
                    }
                </script>
            </body>
*/