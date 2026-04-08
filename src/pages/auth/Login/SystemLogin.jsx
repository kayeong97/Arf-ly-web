import React, { useState, useEffect } from "react";
import { useNavigate, useRevalidator } from "react-router-dom";
import "./SystemLogin.css";

import BackBtn from "../../../assets/login/system/backbtn.svg";
import UserIcon from "../../../assets/login/system/user.svg";
import PasswordIcon from "../../../assets/login/system/password.svg";
import OpenPassword from "../../../assets/login/system/open_password.svg";
import ClosePassword from "../../../assets/login/system/close_password.svg";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

const SystemLogin = () => {
  const navigate = useNavigate();

  const handleGoBack = (e) => {
    navigate(-1);
  };

  const handleLogin = async (e) => {
    const response = await fetch(`${API_BASE_URL}/auth/doLogin`);
    // TODO: 로그인 응답 처리
  };

  return (
    <div className="SystemLoginWrapper">
      {/* 뒤로가기 */}
      <div className="BackBtn">
        <button type="button" onClick={handleGoBack}>
          <img src={BackBtn} alt="뒤로가기" />
        </button>
      </div>
      {/* 로그인 글 */}
      <div>
        <span>ARFLY와 다시 한번</span>
        <br />
        <span>건강한 반려인 라이프를 즐겨요!</span>
      </div>
      {/* 입력 폼 */}
      <div className="LoginInputForm">
        {/* 아이디 입력 칸 */}
        <div className="IdInput">
          <img src={UserIcon} alt="아이디" />
          <input id="id" type="text" placeholder="ID" />
        </div>
        {/* 비밀번호 입력 칸 */}
        <div className="PwInput">
          <img src={PasswordIcon} alt="비밀번호" />
          <input id="password" type="password" placeholder="PW" />
          <button type="button" id="toggle">
            <img src={ClosePassword} alt="비밀번호 숨기기" />
          </button>
        </div>
      </div>
      {/* 아이디 비밀번호 찾기 */}
      <div className="findIdPw">
        <span>문제가 생겼나요?</span>
        <a href="#none">아이디 비밀번호 찾기</a>
      </div>
      {/* 로그인 버튼 */}
      <div className="summitLogin">
        <button type="button" onClick={handleLogin}>
          로그인하기
        </button>
      </div>
    </div>
  );
};

export default SystemLogin;
