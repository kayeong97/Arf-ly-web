import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserProfile.css";

import USERPROFILEBACK from "../../assets/login/system/backbtn.svg";
import USERPROFILEIMG from "../../assets/mypage/UserProfile/UserProfile_profileImg.svg";
import USERPROFILEPHOTO from "../../assets/mypage/UserProfile/UserProfile_photo.svg";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

export default function UserProfile() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const userInfo = state?.userInfo || {};
  const initialNickname = state?.nickname || userInfo.nickname || "";
  const initialAddress = state?.address || userInfo.roadAddress || "";
  const [nickname, setNickname] = useState(initialNickname);
  const [address, setAddress] = useState(initialAddress);
  const [isChanging, setIsChanging] = useState(false);
  const [isNicknameTouched, setIsNicknameTouched] = useState(false);
  const [nicknameCheckStatus, setNicknameCheckStatus] = useState("idle");
  const trimmedNickname = nickname.trim();
  const isUnchanged =
    nickname === initialNickname && address === initialAddress;
  const isNicknameEmpty = trimmedNickname.length === 0;
  const isNicknameInvalid =
    isNicknameEmpty ||
    nicknameCheckStatus === "duplicate" ||
    nicknameCheckStatus === "checking";
  const isChangeDisabled = isUnchanged || isChanging || isNicknameInvalid;
  const nicknameMessage = !isNicknameTouched
    ? ""
    : isNicknameEmpty
      ? "*닉네임은 필수 입력사항입니다."
      : nicknameCheckStatus === "duplicate"
        ? "*중복된 닉네임은 사용할 수 없습니다."
        : nicknameCheckStatus === "available"
          ? "*사용가능한 닉네임입니다."
          : "";

  useEffect(() => {
    if (!isNicknameTouched) {
      setNicknameCheckStatus("idle");
      return;
    }

    if (!trimmedNickname) {
      setNicknameCheckStatus("required");
      return;
    }

    const controller = new AbortController();

    const checkNickname = async () => {
      const accessToken = localStorage.getItem("accessToken");

      try {
        setNicknameCheckStatus("checking");

        const response = await fetch(`${API_BASE_URL}/member/check-username`, {
          method: "POST",
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nickname: trimmedNickname }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("nickname check failed");
        }

        const result = await response.json();
        const isAvailable =
          typeof result === "boolean" ? result : Boolean(result?.available);

        setNicknameCheckStatus(isAvailable ? "available" : "duplicate");
      } catch (error) {
        if (error.name !== "AbortError") {
          setNicknameCheckStatus("duplicate");
        }
      }
    };

    checkNickname();

    return () => {
      controller.abort();
    };
  }, [isNicknameTouched, trimmedNickname]);

  const handleChange = async () => {
    if (isChangeDisabled) return;

    const accessToken = localStorage.getItem("accessToken");

    try {
      setIsChanging(true);
      const formData = new FormData();
      const requestBody = {
        nickname: trimmedNickname,
        password: null,
        latitude: userInfo.latitude,
        longitude: userInfo.longitude,
        roadAddress: address,
        notificationEnabled: Boolean(userInfo.notificationEnabled),
      };

      formData.append("request", JSON.stringify(requestBody));

      const response = await fetch(`${API_BASE_URL}/member/me`, {
        method: "POST",
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("profile update failed");
      }

      navigate(-1);
    } catch (error) {
      alert("프로필 수정에 실패했습니다.");
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="userProfile-wrapper">
      <div className="userProfile-top">
        <button
          className="userProfile-back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          <img src={USERPROFILEBACK} alt="뒤로가기" />
        </button>
        <span>프로필 수정</span>
      </div>
      <div className="userProfile-profileImg">
        <img src={USERPROFILEIMG} alt="" />
        <img src={USERPROFILEPHOTO} alt="" />
      </div>
      <div className="userProfile-login-form">
        <span className="userProfile-login-form-text"> 닉네임 </span>
        <div className="userProfile-input-container">
          <input
            id="nickname"
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => {
              setIsNicknameTouched(true);
              setNickname(e.target.value);
            }}
          />
        </div>
        {nicknameMessage && (
          <span
            className={`userProfile-nickname-message ${nicknameCheckStatus}`}
          >
            {nicknameMessage}
          </span>
        )}
        <span className="userProfile-login-form-text"> 주소 </span>
        <div className="userProfile-input-container">
          <input
            id="address"
            type="text"
            placeholder="주소"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>
      <div className="userProfile-confirm">
        <button
          type="button"
          disabled={isChangeDisabled}
          onClick={handleChange}
        >
          변경하기
        </button>
      </div>
    </div>
  );
}
