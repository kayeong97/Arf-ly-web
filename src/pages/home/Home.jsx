import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import Terms from "../auth/Signup/Terms";

const API_BASE_URL = import.meta.env.VITE_SERVER_API_BASE_URL;

import HOMELOGO from "../../assets/home/home_logo.svg";
import HOMEBELL from "../../assets/home/home_bell.svg";
import HOMEMALE from "../../assets/home/home_male.svg";
import HOMEFEMALE from "../../assets/home/home_female.svg";
import HOMEPAW from "../../assets/home/home_paw.svg";
import HOMEWALKEDBUTTON from "../../assets/home/home_walked_button.svg";
import HOMEBROWNPAW from "../../assets/home/home_brown_paw.svg";
import HOMEPINKARROW from "../../assets/home/home_pink_arrow.svg";
import HOMESTAR from "../../assets/home/home_star.svg";
import HOMEDOWNARROW from "../../assets/home/home_down_arrow.svg";
import HOMEPREVIOUS200 from "../../assets/home/home_previous_200.svg";
import HOMEPREVIOUS500 from "../../assets/home/home_previous_500.svg";
import HOMENEXT200 from "../../assets/home/home_next_200.svg";
import HOMENEXT500 from "../../assets/home/home_next_500.svg";
import HOMENEXTBROWN from "../../assets/home/home_next_brown.svg";
import HOMECAMERA from "../../assets/home/home_camera.svg";
import HOMEGET from "../../assets/home/home_get.svg";

// 임시 사진
import TEMPDISEASE from "../../assets/home/home_temp_disease.svg";

// 임시 변수 불러오기
import { petList } from "./data/petList";

const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

export default function Home() {
  const navigate = useNavigate();
  const [isPetSelectOpen, setIsPetSelectOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const currentPet = petList[currentPetIndex];
  const [selectedRecordPetIndex, setSelectedRecordPetIndex] = useState(null);
  const TEMP_DISEASE_IMAGE = undefined;
  const selectedRecordPetName =
    selectedRecordPetIndex === null
      ? "전체"
      : petList[selectedRecordPetIndex].name;
  const visibleCheckRecords =
    selectedRecordPetIndex === null
      ? petList.flatMap((pet) =>
          pet.checkRecord.map((record) => ({
            ...record,
            petName: pet.name,
            petBreed: pet.breed,
            petAge: pet.age,
            diseaseImg: TEMP_DISEASE_IMAGE,
          })),
        )
      : petList[selectedRecordPetIndex].checkRecord.map((record) => ({
          ...record,
          petName: petList[selectedRecordPetIndex].name,
          petBreed: petList[selectedRecordPetIndex].breed,
          petAge: petList[selectedRecordPetIndex].age,
          diseaseImg: TEMP_DISEASE_IMAGE,
        }));
  const maxWeekWalked = Math.max(...currentPet.weekWalked, 1);
  const isFirstPet = currentPetIndex === 0;
  const isLastPet = currentPetIndex === petList.length - 1;
  const [isDiagnosisPetSheetOpen, setIsDiagnosisPetSheetOpen] = useState(false);
  const [selectedDiagnosisPet, setSelectedDiagnosisPet] = useState(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const { state } = useLocation();
  const selectedPet = state?.pet;
  const fileInputRef = useRef(null);
  const isMobileDevice = () => {
    return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  };
  const isMobile = isMobileDevice();
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleImportChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedImageTypes = ["image/png", "image/jpeg"];
    if (!allowedImageTypes.includes(file.type)) {
      alert("PNG 또는 JPEG 형식의 사진만 가져올 수 있습니다.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      navigate("/diseasecheck", {
        state: {
          pet: selectedDiagnosisPet,
          image: reader.result,
        },
      });
    };

    reader.readAsDataURL(file);
  };

  // 이용약관 동의 여부 확인 후 약관 동의
  useEffect(() => {
    const fetchTermsAgreement = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) return;

      try {
        const response = await fetch(
          `${API_BASE_URL}/terms/latest/agreement-status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const isAgreed = await response.json();
          if (isAgreed === false) {
            setShowTerms(true);
          }
        }
      } catch (error) {
        console.error("Failed to check terms agreement status", error);
      }
    };

    fetchTermsAgreement();
  }, []);

  const handleTermsComplete = async (agreements) => {
    const termsMapping = {
      service: 1,
      privacy: 2,
      ai_ref: 3,
      location: 4,
      ai_collect: 5,
      push: 6,
      night: 7,
    };

    const userAgreements = Object.keys(agreements).map((key) => ({
      termId: termsMapping[key],
      termsOfServiceAgreed: agreements[key],
    }));

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE_URL}/terms/oauth/agree`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userAgreements),
      });

      if (response.ok) {
        setShowTerms(false);
        navigate("/pet/register", {
          replace: true,
          state: { entry: "home" },
        });
      } else {
        alert("약관 동의 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("약관 동의 오류", error);
      alert("약관 동의 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-top">
        <img src={HOMELOGO} />
        <img src={HOMEBELL} />
      </div>
      <div className="home-middle">
        <div className="home-pet-profile">
          <div className="home-pet-profile-top">
            <>
              <button
                className="home-pet-profile-arrow left"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  if (!isFirstPet) {
                    setCurrentPetIndex(currentPetIndex - 1);
                  }
                }}
              >
                <img
                  src={isFirstPet ? HOMEPREVIOUS200 : HOMEPREVIOUS500}
                  alt="이전"
                />
              </button>

              <button
                className="home-pet-profile-arrow right"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLastPet) {
                    setCurrentPetIndex(currentPetIndex + 1);
                  }
                }}
              >
                <img src={isLastPet ? HOMENEXT200 : HOMENEXT500} alt="다음" />
              </button>
            </>
            {/* 임시 애완동물 사진 */}
            <img className="home-pet-image" src={currentPet.img} />
            <div className="home-pet-profile-detail">
              <div className="home-pet-detail-top">
                <img src={currentPet.sex === "male" ? HOMEMALE : HOMEFEMALE} />
                <span>
                  {currentPet.neuter ? "중성화 완료" : "중성화 미완료"}
                </span>
              </div>
              <div className="home-pet-detail-middle">
                <span className="home-pet-name">{currentPet.name}</span>
              </div>
              <div className="home-pet-detail-bottom">
                <span className="home-pet-breed">{currentPet.breed}</span>
                <span>
                  {currentPet.age}살 | {currentPet.weight}kg
                </span>
              </div>
            </div>
          </div>
          <div className="home-pet-profile-bottom">
            <div className="home-walk">
              <p className="home-today-walked">
                오늘 총{" "}
                <strong>
                  {Number(currentPet.todayWalked).toLocaleString()}
                </strong>
                젤리 걸었어요!
              </p>
              <img src={HOMEPAW} />
            </div>
            <div
              className="home-pet-profile-chart"
              onClick={() => navigate(`/weeklyactive/${currentPet.id}`)}
            >
              <div className="home-chart-bars">
                {currentPet.weekWalked.map((walked, index) => {
                  const barHeight = `${Math.max((walked / maxWeekWalked) * 100, 8)}%`;
                  return (
                    <div className="home-chart-bar-wrap" key={`bar-${index}`}>
                      <div
                        className="home-chart-bar"
                        style={{ height: barHeight }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="home-chart-label-row">
                {weekLabels.map((label, index) => (
                  <span
                    className={`home-chart-label ${
                      index === 5 ? "today" : index === 6 ? "sunday" : ""
                    }`}
                    key={`${label}-${index}`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="home-walked-and-disease">
          <div className="home-pet-walked">
            <div className="home-pet-walked-top">
              <span>최근 산책 기록</span>
              <button type="button" onClick={() => navigate("/walkedresult")}>
                <img src={HOMEWALKEDBUTTON} />
              </button>
            </div>
            <span className="home-pet-distance">
              {currentPet.recentDistance}
            </span>
            <span className="home-pet-distance-unit">km</span>
            <div className="home-pet-recent-walk">
              <img src={HOMEBROWNPAW} />
              <span>{Number(currentPet.todayWalked).toLocaleString()}젤리</span>
            </div>
          </div>
          <div className="home-pet-disease-check">
            <p>피부 질환 체크하기</p>
            <span className="home-pet-disease-check-span">
              {"사진 한장으로 빠르게\nAI가 피부 질환을 진단해요!"}
            </span>
            <div
              className="home-pet-go-check"
              onClick={() => setIsDiagnosisPetSheetOpen(true)}
            >
              <span>진단하기</span>
              <img src={HOMEPINKARROW} />
            </div>
          </div>
        </div>
        <div className="home-iot">
          <p className="home-iot-first-p">
            {"반려동물을 등록하고\n활동량 측정기를 받아보세요!"}
          </p>
          <p className="home-iot-second-p">활동량 측정기 더 알아보기 →</p>
        </div>
      </div>
      <div className="home-middle-line"></div>
      <div className="home-middle">
        <div className="home-ai-record">
          <div className="home-ai-record-tab">
            <div className="home-ai-record-tab-text">
              <img src={HOMESTAR} />
              <span>AI 스마트 진단 리스트</span>
            </div>
            <div
              className="home-pet-select"
              onClick={() => setIsPetSelectOpen(true)}
            >
              <span>{selectedRecordPetName}</span>
              <img src={HOMEDOWNARROW} />
            </div>
            {isPetSelectOpen && (
              <div
                className="home-pet-select-overlay"
                onClick={() => setIsPetSelectOpen(false)}
              >
                <div
                  className="home-pet-select-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="home-pet-select-modal-item"
                    type="button"
                    onClick={() => {
                      setSelectedRecordPetIndex(null);
                      setIsPetSelectOpen(false);
                    }}
                  >
                    <span className="home-pet-select-modal-all">전체</span>
                    {selectedRecordPetIndex === null && (
                      <span className="home-pet-select-modal-check">✓</span>
                    )}
                  </button>
                  {petList.map((pet, index) => {
                    const isSelected = selectedRecordPetIndex === index;
                    return (
                      <button
                        className="home-pet-select-modal-item"
                        type="button"
                        key={`${pet.name}-${index}`}
                        onClick={() => {
                          setSelectedRecordPetIndex(index);
                          setIsPetSelectOpen(false);
                        }}
                      >
                        <div className="home-pet-select-modal-pet">
                          <img src={pet.img} alt={pet.name} />
                          <span>{pet.name}</span>
                        </div>

                        {isSelected && (
                          <span className="home-pet-select-modal-check">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {visibleCheckRecords.length > 0 ? (
            <div className="home-ai-record-list">
              {visibleCheckRecords.map((record, index) => (
                <div
                  className="home-ai-record-item"
                  key={`${record.petName}-${record.month}-${record.day}-${index}`}
                >
                  <div className="home-ai-record-image">
                    {record.diseaseImg && (
                      <img src={record.diseaseImg} alt={record.disease} />
                    )}
                  </div>
                  <div className="home-ai-record-content">
                    <span className="home-ai-record-date">
                      {record.month}.{record.day}
                    </span>
                    <span className="home-ai-record-disease">
                      {record.disease}
                    </span>
                    <span className="home-ai-record-pet-info">
                      {record.petName} | {record.petBreed} | {record.petAge}살
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="home-without-record-list">
              <div className="home-without-record-text">
                <strong>첫 진단을 시작해보세요!</strong>
                <span>사진 한 장으로 피부질환을 알려드릴게요</span>
              </div>
              <button className="home-without-record-button" type="button">
                <img
                  src={HOMENEXTBROWN}
                  alt="진단 시작"
                  onClick={() => setIsDiagnosisPetSheetOpen(true)}
                />
              </button>
            </div>
          )}
        </div>
      </div>
      {isDiagnosisPetSheetOpen && (
        <div
          className="home-diagnosis-overlay"
          onClick={() => setIsDiagnosisPetSheetOpen(false)}
        >
          <div
            className="home-diagnosis-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="home-diagnosis-title">어떤 친구를 진단할까요?</p>

            <div className="home-diagnosis-pet-list">
              {petList.map((pet) => {
                const isSelected = selectedDiagnosisPet?.id === pet.id;

                return (
                  <button
                    type="button"
                    key={pet.id}
                    className={`home-diagnosis-pet-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedDiagnosisPet(pet)}
                  >
                    <div className="home-diagnosis-card-top">
                      <img
                        className="home-diagnosis-sex"
                        src={pet.sex === "male" ? HOMEMALE : HOMEFEMALE}
                        alt={pet.sex}
                      />
                      <span className="home-diagnosis-is-neuter">
                        {pet.neuter ? "중성화 완료" : "중성화 미완료"}
                      </span>
                    </div>

                    <div className="home-diagnosis-card-main">
                      <img
                        className="home-diagnosis-pet-img"
                        src={pet.img}
                        alt={pet.name}
                      />
                      <div>
                        <strong>{pet.name}</strong>
                        <span className="home-diagnosis-breed">
                          {pet.breed}
                        </span>
                        <span className="home-diagnosis-age-weight">
                          {pet.age}세 | {pet.weight}kg
                        </span>
                      </div>
                    </div>

                    <div className="home-diagnosis-allergy-list">
                      {pet.allergic?.slice(0, 3).map((item) => (
                        <span key={item}>{item}</span>
                      ))}

                      {pet.allergic?.length > 3 && <span>...</span>}
                    </div>
                    <span className="home-diagnosis-more-info">
                      자세히 보기 &gt;{" "}
                    </span>
                  </button>
                );
              })}

              <button
                type="button"
                className="home-diagnosis-add-card"
                onClick={() => {
                  setSelectedDiagnosisPet(null);
                  setIsDiagnosisPetSheetOpen(false);
                  // 반려동물 등록 페이지로 이동
                  // navigate("mypage");
                }}
              >
                <span>+</span>
                <p>
                  다른 친구를
                  <br />
                  진단하고 싶어요!
                </p>
              </button>
            </div>

            <button
              type="button"
              className="home-diagnosis-complete"
              disabled={!selectedDiagnosisPet}
              onClick={() => {
                if (!selectedDiagnosisPet) return;
                setIsDiagnosisPetSheetOpen(false);
                setIsPhotoModalOpen(true);
              }}
            >
              완료
            </button>
          </div>
        </div>
      )}
      {isPhotoModalOpen && (
        <div
          className="home-photo-overlay"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="home-photo-modal"
            onClick={(e) => e.stopPropagation()}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => {
                  navigate("/camera", {
                    state: {
                      pet: selectedDiagnosisPet,
                    },
                  });
                }}
              >
                <img src={HOMECAMERA} />
                사진 찍기
              </button>
            )}

            <button type="button" onClick={handleImportClick}>
              <img src={HOMEGET} />
              가져오기
            </button>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg"
        style={{ display: "none" }}
        onChange={handleImportChange}
      />
      {showTerms && (
        <div className="home-terms-overlay">
          <div className="home-terms-content">
            <Terms
              onComplete={handleTermsComplete}
              onClose={() => setShowTerms(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
