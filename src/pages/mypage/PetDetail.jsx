import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./PetDetail.css";

import PETDETAILBACK from "../../assets/login/system/backbtn.svg";
import PETDETAILECT from "../../assets/mypage/PetDetail/PetDetail_ect.svg";
import PETDETAILMALE from "../../assets/mypage/PetDetail/PetDetail_male.svg";
import PETDETAILFEMALE from "../../assets/mypage/PetDetail/PetDetail_female.svg";
import HOMEDOG from "../../assets/home/home_dog.svg";
import HOMECAT from "../../assets/home/home_cat.svg";
import HOMEPAW from "../../assets/home/home_paw.svg";
import WALKBROWNPAW from "../../assets/home/home_brown_paw.svg";
import PETDETAILEDIT from "../../assets/mypage/PetDetail/PetDetail_edit.svg";
import PETDETAILTRASH from "../../assets/mypage/PetDetail/PetDetail_trash.svg";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

const getAuthHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

const createApiUrl = (path, query = {}) => {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return `${API_BASE_URL}${path}${queryString ? `?${queryString}` : ""}`;
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseMultipartFormData = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const boundary =
    contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[1] ||
    contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/)?.[2];
  const text = await response.text();

  if (!boundary) {
    return parseMaybeJson(text);
  }

  const parsedParts = {};

  text.split(`--${boundary}`).forEach((rawPart) => {
    const part = rawPart.trim();
    if (!part || part === "--") return;

    const [rawHeaders, ...bodyParts] = part.split(/\r?\n\r?\n/);
    const body = bodyParts
      .join("\n\n")
      .replace(/\r?\n--$/, "")
      .trim();
    const name = rawHeaders.match(/name="([^"]+)"/)?.[1];
    const value = parseMaybeJson(body);

    if (name) {
      parsedParts[name] = value;
      return;
    }

    if (value && typeof value === "object") {
      Object.assign(parsedParts, value);
    }
  });

  return parsedParts;
};

const readApiResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    return parseMultipartFormData(response);
  }

  return response.json();
};

const fetchApiData = async (path, query) => {
  const response = await fetch(createApiUrl(path, query), {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json, multipart/form-data",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }

  return readApiResponse(response);
};

const deleteApiData = async (path) => {
  const response = await fetch(createApiUrl(path), {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }
};

const normalizeWalk = (walk, fallbackPet) => {
  const durationMinutes = Number(walk.durationMinutes ?? 0);
  const pet = walk.pet || fallbackPet || {};

  return {
    id: walk.id,
    year: walk.date?.year,
    month: walk.date?.month,
    date: walk.date?.day,
    dayOfWeek: walk.date?.dayOfWeek,
    startTime: walk.startTime,
    endTime: walk.endTime,
    hour: Math.floor(durationMinutes / 60),
    minute: durationMinutes % 60,
    distance: Number(walk.distanceKm ?? 0),
    count: Number(walk.score ?? 0),
    petId: pet.id,
    petName: pet.name,
    petImg: pet.profileImage || pet.img || HOMEDOG,
  };
};

export default function PetDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pet = location.state?.pet;
  const petProfileImg =
    pet?.img ||
    pet?.profileImageUrl ||
    pet?.profileImage ||
    (pet?.species === "CAT" ? HOMECAT : HOMEDOG);
  const [walkRecords, setWalkRecords] = useState([]);
  const [isWalkRecordsLoading, setIsWalkRecordsLoading] = useState(false);
  const [walkRecordsErrorMessage, setWalkRecordsErrorMessage] = useState("");
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isDeletingPet, setIsDeletingPet] = useState(false);
  const shouldShowWalkRecords =
    isWalkRecordsLoading || walkRecordsErrorMessage || walkRecords.length > 0;

  const padTwo = (value) => String(value).padStart(2, "0");
  const formatCount = (value) => Number(value).toLocaleString();
  const getDayLabel = (year, month, date) => {
    const dayLabels = ["월", "화", "수", "목", "금", "토", "일"];
    const dayIndex = new Date(year, month - 1, date).getDay();
    return dayLabels[dayIndex];
  };

  const handleDeletePet = async () => {
    if (!pet?.id || isDeletingPet) return;

    const shouldDelete = window.confirm("반려동물 정보를 삭제하시겠습니까?");
    if (!shouldDelete) return;

    try {
      setIsDeletingPet(true);
      await deleteApiData(`/api/pets/${pet.id}`);
      navigate("/mypage", { replace: true });
    } catch (error) {
      alert("반려동물 정보를 삭제하지 못했습니다.");
    } finally {
      setIsDeletingPet(false);
    }
  };

  useEffect(() => {
    if (!pet?.id) return;

    let isActive = true;

    const loadWalkRecords = async () => {
      try {
        setIsWalkRecordsLoading(true);
        setWalkRecordsErrorMessage("");

        const walkData = await fetchApiData("/api/walks", { petId: pet.id });

        if (!isActive) return;

        setWalkRecords(
          (walkData?.walks || []).map((walk) => normalizeWalk(walk, pet)),
        );
      } catch (error) {
        if (isActive) {
          setWalkRecordsErrorMessage("산책 정보를 불러올 수 없습니다.");
        }
      } finally {
        if (isActive) {
          setIsWalkRecordsLoading(false);
        }
      }
    };

    loadWalkRecords();

    return () => {
      isActive = false;
    };
  }, [pet]);

  return (
    <div className="petDetail-wrapper">
      <div className="petDetail-top">
        <button
          className="petDetail-back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          <img src={PETDETAILBACK} />
        </button>
        <span>반려동물 프로필</span>
        <button
          className="petDetail-ect-button"
          type="button"
          onClick={() => setIsActionModalOpen((prev) => !prev)}
        >
          <img className="petDetail-ect" src={PETDETAILECT} />
        </button>

        {isActionModalOpen && (
          <div className="petDetail-action-modal">
            <button
              className="petDetail-action-item"
              type="button"
              onClick={() =>
                navigate("/pet/register", { state: { entry: "edit", pet } })
              }
            >
              <span>수정</span>
              <img src={PETDETAILEDIT} />
            </button>
            <button
              className="petDetail-action-item"
              type="button"
              onClick={handleDeletePet}
              disabled={isDeletingPet}
            >
              <span>{isDeletingPet ? "삭제 중" : "삭제"}</span>
              <img src={PETDETAILTRASH} />
            </button>
          </div>
        )}
      </div>

      {pet && (
        <>
          <div className="petDetail-profile">
            <div className="petDetail-profile-top">
              <img
                className="petDetail-sex"
                src={pet.sex === "male" ? PETDETAILMALE : PETDETAILFEMALE}
                alt={pet.sex}
              />
              <span>{pet.neuter ? "중성화 완료" : "중성화 미완료"}</span>
            </div>

            <div className="petDetail-profile-middle">
              <img
                className="petDetail-pet-img"
                src={petProfileImg}
                alt={pet.name}
              />
              <strong>
                {pet.name} ({pet.age}
                살)
              </strong>
              <span>{pet.breed}</span>
              <span className="petDetail-profile-middle-weight">
                {pet.weight}kg
              </span>
            </div>

            <div className="petDetail-profile-bottom">
              <span className="petDetail-section-title">알러지 정보</span>
              <div className="petDetail-profile-bottom-allergic">
                {pet.allergic?.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>

              <span className="petDetail-section-title">특이사항</span>
              <span className="petDetail-note">{pet.note}</span>
            </div>
          </div>

          {shouldShowWalkRecords && (
          <div className="petDetail-records">
            <div className="petDetail-records-section">
              <span>{pet.name}의 활동기록이에요!</span>
              <img src={HOMEPAW} />
            </div>

            {isWalkRecordsLoading ? (
              <div className="petDetail-records-state">산책 정보를 불러오는 중입니다.</div>
            ) : walkRecordsErrorMessage ? (
              <div className="petDetail-records-state">
                산책 정보를 불러올 수 없습니다.
              </div>
            ) : (
              <div className="petDetail-records-list">
                {walkRecords.map((walked, index) => (
                  <div
                    className="petDetail-records-item"
                    key={
                      walked.id ||
                      `${walked.petId}-${walked.year}-${walked.month}-${walked.date}-${index}`
                    }
                  >
                    <div className="petDetail-records-item-content">
                      <span className="petDetail-records-item-day">
                        {walked.year}년 {padTwo(walked.month)}월{" "}
                        {padTwo(walked.date)}일(
                        {getDayLabel(walked.year, walked.month, walked.date)})
                      </span>
                      <span className="petDetail-records-item-time">
                        {padTwo(walked.hour)}시간 {padTwo(walked.minute)}분
                      </span>
                      <div className="petDetail-records-item-distance">
                        <span>{walked.distance}</span>
                        <span>km</span>
                      </div>
                      <div className="petDetail-records-item-count">
                        <img src={WALKBROWNPAW} />
                        <span>{formatCount(walked.count)}젤리</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </>
      )}
    </div>
  );
}
