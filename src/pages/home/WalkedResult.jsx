import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./WalkedResult.css";

import WALKEDBACK from "../../assets/home/weeklyActive/weeklyActive_back.svg";
import WALKEDPAW from "../../assets/home/home_paw.svg";
import WALKBROWNPAW from "../../assets/home/home_brown_paw.svg";
import WALKEDDOWN from "../../assets/home/walkedResult/walkedResult_down_arrow.svg";
import WALKEDCHECK from "../../assets/home/walkedResult/walkedResult_check.svg";
import ARFLYCAT from "../../assets/home/walkedResult/walkedResult_arfly_cat.svg";
import WALKEDDOG from "../../assets/home/walkedResult/walkedResult_dog.svg";
import ARFLYCAT2 from "../../assets/home/walkedResult/walkedResult_arfly_cat2.svg";
import HOMEDOG from "../../assets/home/home_dog.svg";
import HOMECAT from "../../assets/home/home_cat.svg";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;
const PET_MODAL_STEP = 136;

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

const sendApiData = async (path, body, method = "POST") => {
  const response = await fetch(createApiUrl(path), {
    method,
    headers: {
      ...getAuthHeaders(),
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${path}`);
  }
};

const getDefaultPetImage = ({ species, breed }) => {
  const petTypeText = `${species || ""} ${breed || ""}`.toUpperCase();

  if (petTypeText.includes("CAT")) {
    return HOMECAT;
  }

  return HOMEDOG;
};

const normalizePet = (summary, detail = {}) => {
  const species = detail.species || summary.species;
  const breed = detail.breed || summary.breed;

  return {
    id: summary.petId ?? summary.id,
    name: detail.name || summary.name,
    img:
      summary.profileImageUrl ||
      summary.profileImage ||
      summary.img ||
      detail.profileImageUrl ||
      getDefaultPetImage({ species, breed }),
    species,
    breed,
  };
};

const fetchPetsFallback = async () => {
  const petsData = await fetchApiData("/api/pets");
  const petSummaries = Array.isArray(petsData?.pets) ? petsData.pets : [];

  return Promise.all(
    petSummaries.map(async (summary) => {
      try {
        const petId = summary.petId ?? summary.id;
        const detailData = await fetchApiData(`/api/pets/${petId}`);
        const detail = detailData?.pet || detailData;

        return normalizePet(summary, detail);
      } catch {
        return normalizePet(summary);
      }
    }),
  );
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
    petImg: pet.profileImage || pet.img || WALKEDDOG,
  };
};

export default function WalkedResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [pets, setPets] = useState(
    Array.isArray(state?.pets) ? state.pets : [],
  );
  const [allAssignedWalks, setAllAssignedWalks] = useState([]);
  const [walksByPetId, setWalksByPetId] = useState({});
  const [unassignedWalks, setUnassignedWalks] = useState([]);
  const [unassignedTotalCount, setUnassignedTotalCount] = useState(0);
  const [selectedWalkedPetId, setSelectedWalkedPetId] = useState("all");
  const [isPetSelectModalOpen, setIsPetSelectModalOpen] = useState(false);
  const [petSelectModalType, setPetSelectModalType] = useState(null);
  const [selectedWalkId, setSelectedWalkId] = useState(null);
  const [selectedModalPetId, setSelectedModalPetId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigningWalk, setIsAssigningWalk] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const padTwo = (value) => String(value).padStart(2, "0");
  const formatCount = (value) => Number(value).toLocaleString();
  const getDayLabel = (year, month, date) => {
    const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
    const dayIndex = new Date(year, month - 1, date).getDay();
    return dayLabels[dayIndex];
  };

  useEffect(() => {
    let isActive = true;

    const loadWalkedResult = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const nextPets =
          Array.isArray(state?.pets) && state.pets.length > 0
            ? state.pets
            : await fetchPetsFallback();

        if (!isActive) return;

        setPets(nextPets);
        setSelectedModalPetId((prev) => prev ?? nextPets[0]?.id ?? null);

        const [assignedData, unassignedData, petWalkEntries] =
          await Promise.all([
            fetchApiData("/api/walks"),
            fetchApiData("/api/walks/unassigned"),
            Promise.all(
              nextPets.map(async (pet) => {
                const walkData = await fetchApiData("/api/walks", {
                  petId: pet.id,
                });

                return [
                  pet.id,
                  (walkData?.walks || []).map((walk) =>
                    normalizeWalk(walk, pet),
                  ),
                ];
              }),
            ),
          ]);

        if (!isActive) return;

        setAllAssignedWalks(
          (assignedData?.walks || []).map((walk) => normalizeWalk(walk)),
        );
        setUnassignedWalks(
          (unassignedData?.walks || []).map((walk) => normalizeWalk(walk)),
        );
        setUnassignedTotalCount(
          Number(
            unassignedData?.totalCount ?? unassignedData?.walks?.length ?? 0,
          ),
        );
        setWalksByPetId(Object.fromEntries(petWalkEntries));
      } catch (error) {
        setErrorMessage("산책 기록을 불러오지 못했습니다.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadWalkedResult();

    return () => {
      isActive = false;
    };
  }, [reloadKey, state?.pets]);

  const unDefinedWalkedLength = unassignedTotalCount;
  const totalWalkedLength = allAssignedWalks.length;
  const visibleDefinedWalkedCards =
    selectedWalkedPetId === "all"
      ? allAssignedWalks
      : walksByPetId[selectedWalkedPetId] || [];
  const petSelectModalMessage =
    petSelectModalType === "undefined"
      ? "함께 산책을 다녀온 친구를 \n선택해주세요!"
      : "함께 산책을 다녀온 친구를 \n변경하실건가요?";
  const selectedModalPetIndex = Math.max(
    pets.findIndex((pet) => pet.id === selectedModalPetId),
    0,
  );
  const handleConfirmPetSelection = async () => {
    if (!selectedWalkId || !selectedModalPetId || isAssigningWalk) return;

    const endpoint =
      petSelectModalType === "undefined"
        ? `/api/walks/${selectedWalkId}/assign`
        : `/api/walks/${selectedWalkId}/pet`;
    const method = petSelectModalType === "undefined" ? "POST" : "PATCH";

    try {
      setIsAssigningWalk(true);
      await sendApiData(endpoint, { petId: selectedModalPetId }, method);
      setIsPetSelectModalOpen(false);
      setSelectedWalkId(null);
      setReloadKey((prev) => prev + 1);
    } catch (error) {
      alert("산책 기록의 반려동물 배정에 실패했습니다.");
    } finally {
      setIsAssigningWalk(false);
    }
  };

  if (isLoading) {
    return (
      <div className="walkedResult-wrapper">
        <div className="walkedResult-top">
          <button
            className="walkedResult-back-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            <img src={WALKEDBACK} alt="뒤로가기" />
          </button>
          <span>산책 결과 조회</span>
        </div>
        <div className="walkedResult-state">산책 기록을 불러오는 중입니다.</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="walkedResult-wrapper">
        <div className="walkedResult-top">
          <button
            className="walkedResult-back-button"
            type="button"
            onClick={() => navigate(-1)}
          >
            <img src={WALKEDBACK} alt="뒤로가기" />
          </button>
          <span>산책 결과 조회</span>
        </div>
        <div className="walkedResult-state">{errorMessage}</div>
      </div>
    );
  }

  return (
    <div className="walkedResult-wrapper">
      <div className="walkedResult-top">
        <button
          className="walkedResult-back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          <img src={WALKEDBACK} alt="뒤로가기" />
        </button>
        <span>산책 결과 조회</span>
      </div>
      <div className="walkedResult-undefined">
        <div className="walkedResult-undefined-top">
          <img src={WALKEDPAW} alt="" />
          <span> 새로운 산책 기록이 {unDefinedWalkedLength}건 있어요!</span>
        </div>
        {unDefinedWalkedLength === 0 ? (
          <div className="walkedResult-undefined-empty">
            <img src={ARFLYCAT} alt="" />
            <div className="walkedResult-undefined-empty-text">
              <strong>기록이 없어요!</strong>
              <span>기기를 사용해서 반려동물의 운동량을 체크해봐요!</span>
            </div>
          </div>
        ) : (
          <div className="walkedResult-undefined-list">
            {unassignedWalks.map((walked, index) => (
              <div
                className="walkedResult-undefined-elements"
                key={
                  walked.id ||
                  `${walked.year}-${walked.month}-${walked.date}-${index}`
                }
              >
                <span className="walkedResult-undefined-elements-day">
                  {walked.year}년 {padTwo(walked.month)}월 {padTwo(walked.date)}
                  일 ({getDayLabel(walked.year, walked.month, walked.date)})
                </span>
                <span className="walkedResult-undefined-elements-time">
                  {padTwo(walked.hour)}시간 {padTwo(walked.minute)}분
                </span>
                <div className="walkedResult-undefined-elements-distance">
                  <span>{walked.distance}</span>
                  <span className="walkedResult-distance-em">km</span>
                </div>
                <div className="walkedResult-undefined-elements-count">
                  <img src={WALKBROWNPAW} alt="" />
                  <span>{formatCount(walked.count)} 젤리</span>
                </div>
                <button
                  className="walkedResult-undefined-elements-selection"
                  type="button"
                  onClick={() => {
                    setPetSelectModalType("undefined");
                    setSelectedWalkId(walked.id);
                    setSelectedModalPetId(pets[0]?.id ?? null);
                    setIsPetSelectModalOpen(true);
                  }}
                >
                  <span>함께한 동물 선택하기</span>
                  <img src={WALKEDDOWN} alt="" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="walkedResult-defined">
        <div className="walkedResult-defined-top">
          <img src={WALKEDCHECK} alt="" />
          <span>다녀온 산책이 {totalWalkedLength}건 있어요!</span>
        </div>
        <div className="walkedResult-defined-filter">
          <button
            type="button"
            className={selectedWalkedPetId === "all" ? "active" : ""}
            onClick={() => setSelectedWalkedPetId("all")}
          >
            전체
          </button>
          {pets.map((pet) => (
            <button
              type="button"
              className={selectedWalkedPetId === pet.id ? "active" : ""}
              key={pet.id}
              onClick={() => setSelectedWalkedPetId(pet.id)}
            >
              {pet.name}
            </button>
          ))}
        </div>
        {visibleDefinedWalkedCards.length === 0 ? (
          <div className="walkedResult-defined-empty">
            <div className="walkedResult-defined-empty-text">
              <strong>아직 기록이 없어요!</strong>
              <span>
                기기를 사용한 산책을 통해
                <br />
                반려동물의 운동량을 체크해보세요!
              </span>
            </div>
            <img src={ARFLYCAT2} alt="" />
          </div>
        ) : (
          <div className="walkedResult-defined-list">
            {visibleDefinedWalkedCards.map((walked, index) => (
              <div
                className="walkedResult-defined-card"
                key={
                  walked.id ||
                  `${walked.petId}-${walked.year}-${walked.month}-${walked.date}-${index}`
                }
              >
                <div className="walkedResult-defined-card-content">
                  <span className="walkedResult-defined-card-day">
                    {walked.year}년 {padTwo(walked.month)}월{" "}
                    {padTwo(walked.date)}일 (
                    {getDayLabel(walked.year, walked.month, walked.date)})
                  </span>
                  <span className="walkedResult-defined-card-time">
                    {padTwo(walked.hour)}시간 {padTwo(walked.minute)}분
                  </span>
                  <div className="walkedResult-defined-card-distance">
                    <span>{walked.distance}</span>
                    <span>km</span>
                  </div>
                  <div className="walkedResult-defined-card-count">
                    <img src={WALKBROWNPAW} alt="" />
                    <span>{formatCount(walked.count)} 젤리</span>
                  </div>
                </div>
                <button
                  className="walkedResult-defined-card-pet"
                  type="button"
                  onClick={() => {
                    setPetSelectModalType("defined");
                    setSelectedWalkId(walked.id);
                    setSelectedModalPetId(walked.petId ?? pets[0]?.id ?? null);
                    setIsPetSelectModalOpen(true);
                  }}
                >
                  <img src={walked.petImg || WALKEDDOG} alt="" />
                  <span>{walked.petName}</span>
                  <img src={WALKEDDOWN} alt="" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {isPetSelectModalOpen && (
        <div
          className="walkedResult-pet-modal-overlay"
          onClick={() => setIsPetSelectModalOpen(false)}
        >
          <div
            className="walkedResult-pet-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <p>{petSelectModalMessage}</p>
            <div className="walkedResult-pet-modal-list">
              <div
                className="walkedResult-pet-modal-track"
                style={{
                  transform: `translateX(calc(-${selectedModalPetIndex * PET_MODAL_STEP}px - var(--pet-modal-card-half)))`,
                }}
              >
                {pets.map((pet) => {
                  const isSelected = selectedModalPetId === pet.id;
                  return (
                    <button
                      className={`walkedResult-pet-modal-item ${isSelected ? "selected" : ""}`}
                      type="button"
                      key={pet.id}
                      onClick={() => setSelectedModalPetId(pet.id)}
                    >
                      <div className="walkedResult-pet-modal-image-wrap">
                        <img src={pet.img} alt="" />
                      </div>
                      <span>{pet.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              className="walkedResult-pet-modal-confirm"
              type="button"
              disabled={isAssigningWalk || !selectedModalPetId}
              onClick={handleConfirmPetSelection}
            >
              {isAssigningWalk ? "처리 중" : "완료"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
