import React, { useState, useEffect } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import "./Login.css";

import Logo from "../../../assets/logo.svg";
import LoginIllust from "../../../assets/login/illust.svg";
import GoogleLogin from "../../../assets/login/google.svg";
import KakaoLogin from "../../../assets/login/kakao.svg";
import NaverLogin from "../../../assets/login/naver.svg";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  useEffect(() => {
    const searchParams = new URL(window.location.href).searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const provider = localStorage.getItem("oauth_provider");

    if (code && provider) {
      handleOAuthCallback(provider, code, state);
    }
  }, []);

  // 소셜 로그인 처리 함수
  const handleOAuthCallback = async (provider, authCode, state) => {
    try {
      let endpoint = "";
      let bodyData = {};

      if (provider === "kakao") {
        endpoint = "/auth/kakao/doLogin";
        bodyData = {
          authCode: authCode,
          redirectUrl: import.meta.env.VITE_KAKAO_AUTH_REDIRECT_URL,
        };
      } else if (provider === "google") {
        endpoint = "/auth/google/doLogin";
        bodyData = {
          authCode: authCode,
          redirectUrl: import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URL,
        };
      } else if (provider === "naver") {
        endpoint = "/auth/naver/doLogin";
        bodyData = {
          authCode: authCode,
          state: state || localStorage.getItem("naver_oauth_state"),
        };
      }

      // 백엔드 호출 소셜 로그인 처리 호출
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (response.ok) {
        const data = await response.json();
        const token = data.accessToken || data.accessToken;

        if (token) {
          localStorage.setItem("token", token);
        }

        localStorage.removeItem("oauth_provider");
        localStorage.removeItem("naver_oauth_state");

        navigate("/home");
      } else {
        const errorData = await response.json();
        console.error("Login failed", errorData);
        alert("로그인 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("OAuth API Error:", error);
      alert("로그인 처리 중 에러가 발생했습니다.");
    }
  };

  // 구글 로그인 처리 함수
  const handleGoogleLogin = async (e) => {
    e.preventDefault();

    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
    const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_AUTH_REDIRECT_URL;

    const url =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}`;

    localStorage.setItem("oauth_provider", "google");
    window.location.href = url;
  };

  // 카카오 로그인 처리 함수
  const handleKakaoLogin = async (e) => {
    e.preventDefault();

    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_AUTH_CLIENT_ID;
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_AUTH_REDIRECT_URL;

    const url =
      `https://kauth.kakao.com/oauth/authorize` +
      `?client_id=${encodeURIComponent(KAKAO_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}` +
      `&response_type=code`;

    localStorage.setItem("oauth_provider", "kakao");
    window.location.href = url;
  };

  // 네이버 로그인 처리 함수
  const handleNaverLogin = async (e) => {
    e.preventDefault();

    const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_AUTH_CLIENT_ID;
    const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_AUTH_REDIRECT_URL;
    const NAVER_STATE = crypto.randomUUID();
    localStorage.setItem("naver_oauth_state", NAVER_STATE);

    const url =
      `https://nid.naver.com/oauth2.0/authorize` +
      `?client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${NAVER_REDIRECT_URI}` +
      `&response_type=code` +
      `&state=${NAVER_STATE}`;

    localStorage.setItem("oauth_provider", "naver");
    window.location.href = url;
  };

  return (
    <div className="login-wrapper">
      {/* 로그인 일러스트*/}
      <div className="login-illust">
        <img src={LoginIllust} alt="LOGIN" />
      </div>
      {/* 로그인 로고 */}
      <div className="login-logo">
        <img src={Logo} alt="LOGO" />
        <span>"찍고, 알고, 케어하다."</span>
      </div>
      {/* 소셜 로그인 */}
      <div className="oauth-login">
        <button type="button" onClick={handleKakaoLogin}>
          <img src={KakaoLogin} alt="KAKAO" />
        </button>
        <button type="button" onClick={handleGoogleLogin}>
          <img src={GoogleLogin} alt="GOOGLE" />
        </button>
        <button type="button" onClick={handleNaverLogin}>
          <img src={NaverLogin} alt="NAVER" />
        </button>
      </div>
      {/* 회원가입 또는 로그인 */}
      <div className="auth-links">
        <span onClick={() => navigate("/signup")}>회원가입</span>
        <span className="divider">|</span>
        <span onClick={() => navigate("/login")}>로그인</span>
      </div>
    </div>
  );
};

export default Login;
