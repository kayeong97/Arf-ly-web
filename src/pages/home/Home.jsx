import { useState } from "react";
import "./Home.css";

import HOMELOGO from "../../assets/home/home_logo.png";
import HOMEBELL from "../../assets/home/home_bell.png";
import HOMEMALE from "../../assets/home/home_male.png";
import HOMEFEMALE from "../../assets/home/home_female.png";
import HOMEPAW from "../../assets/home/home_paw.png";
import HOMEWALKEDBUTTON from "../../assets/home/home_walked_button.png";
import HOMEBROWNPAW from "../../assets/home/home_brown_paw.png";
import HOMEPINKARROW from "../../assets/home/home_pink_arrow.png";
import HOMESTAR from "../../assets/home/home_star.png";
import HOMEDOWNARROW from "../../assets/home/home_down_arrow.png";
import HOMEPREVIOUS200 from "../../assets/home/home_previous_200.png";
import HOMEPREVIOUS500 from "../../assets/home/home_previous_500.png";
import HOMENEXT200 from "../../assets/home/home_next_200.png";
import HOMENEXT500 from "../../assets/home/home_next_500.png";
import HOMENEXTBROWN from "../../assets/home/home_next_brown.png";

// 임시 사진
import HOMEDOG from "../../assets/home/home_dog.png";
import HOMECAT from "../../assets/home/home_cat.png";
import TEMPDISEASE from "../../assets/home/home_temp_disease.png";

// 서버로부터 받아와야할 정보
let petList = [
  {
    img: HOMEDOG,
    sex: 'male',
    neuter: true,
    name: '누룽지',
    breed: '시고르자브종',
    age: 5,
    weight: 5.6,
    todayWalked: 34356,
    weekWalked: [30000, 20000, 10000, 40000, 50000, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [
      {
        month: 4,
        day: 15,
        disease: "강아지 피부병1 (Dog Skin Disease1)",
        petAge: 5,
      },
      {
        month: 4,
        day: 15,
        disease: "강아지 피부병2 (Dog Skin Disease2)",
      },
    ]
  },
  {
    img: HOMEDOG,
    sex: 'male',
    neuter: true,
    name: '누룽지2',
    breed: '시고르자브종',
    age: 3,
    weight: 3.6,
    todayWalked: 14356,
    weekWalked: [10000, 40000, 10000, 30000, 50000, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [
      {
        month: 4,
        day: 15,
        disease: "강아지 피부병1 (Dog Skin Disease1)",
        petAge: 5,
      },
      {
        month: 4,
        day: 15,
        disease: "강아지 피부병2 (Dog Skin Disease2)",
      },
    ]
  },
  {
    img: HOMECAT,
    sex: 'female',
    neuter: false,
    name: '야옹이',
    breed: '고양이',
    age: 4,
    weight: 3.6,
    todayWalked: 24356,
    weekWalked: [10000, 50000, 10000, 40000, 50000, 0, 0],
    recentDistance: 11.4,
    recentWalked: 20346,
    checkRecord: [

    ]
  },
]

const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];

export default function Home() {
  const [isPetSelectOpen, setIsPetSelectOpen] = useState(false);
  const [currentPetIndex, setCurrentPetIndex] = useState(0);
  const currentPet = petList[currentPetIndex];
  const [selectedRecordPetIndex, setSelectedRecordPetIndex] = useState(null);
  const TEMP_DISEASE_IMAGE = undefined;
  const selectedRecordPetName =
    selectedRecordPetIndex === null ? "전체" : petList[selectedRecordPetIndex].name;
  const visibleCheckRecords =
    selectedRecordPetIndex === null
      ? petList.flatMap((pet) =>
        pet.checkRecord.map((record) => ({
          ...record,
          petName: pet.name,
          petBreed: pet.breed,
          petAge: pet.age,
          diseaseImg: TEMP_DISEASE_IMAGE,
        }))
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
                onClick={() => {
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
                onClick={() => {
                  if (!isLastPet) {
                    setCurrentPetIndex(currentPetIndex + 1);
                  }
                }}
              >
                <img
                  src={isLastPet ? HOMENEXT200 : HOMENEXT500}
                  alt="다음"
                />
              </button>
            </>
            {/* 임시 애완동물 사진
              <img src={petImg} /> */}
            <img className="home-pet-image" src={currentPet.img} />
            <div className="home-pet-profile-detail">
              <div className="home-pet-detail-top">
                <img src={currentPet.sex === 'male' ? HOMEMALE : HOMEFEMALE} />
                <span>{currentPet.neuter ? "중성화 완료" : "중성화 미완료"}</span>
              </div>
              <div className="home-pet-detail-middle">
                <span className="home-pet-name">{currentPet.name}</span>
              </div>
              <div className="home-pet-detail-bottom">
                <span className="home-pet-breed">{currentPet.breed}</span>
                <span>{currentPet.age}살 | {currentPet.weight}kg</span>
              </div>
            </div>
          </div>
          <div className="home-pet-profile-bottom">
            <div className="home-walk">
              <p className="home-today-walked">
                오늘 총{" "}
                <strong>{Number(currentPet.todayWalked).toLocaleString()}</strong>젤리 걸었어요!
              </p>
              <img src={HOMEPAW} />
            </div>
            <div className="home-pet-profile-chart">
              <div className="home-chart-bars">
                {currentPet.weekWalked.map((walked, index) => {
                  const barHeight = `${Math.max((walked / maxWeekWalked) * 100, 8)}%`;

                  return (
                    <div className="home-chart-bar-wrap" key={`bar-${index}`}>
                      <div className="home-chart-bar" style={{ height: barHeight }} />
                    </div>
                  );
                })}
              </div>

              <div className="home-chart-label-row">
                {weekLabels.map((label, index) => (
                  <span
                    className={`home-chart-label ${index === 5 ? "today" : index === 6 ? "sunday" : ""
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
              <button type="button">
                <img src={HOMEWALKEDBUTTON}/>
              </button>
            </div>
            <span className="home-pet-distance">{currentPet.recentDistance}</span>
            <span className="home-pet-distance-unit">km</span>
            <div className="home-pet-recent-walk">
              <img src={HOMEBROWNPAW} />
              <span>{Number(currentPet.todayWalked).toLocaleString()}젤리</span>
            </div>
          </div>
          <div className="home-pet-disease-check">
            <p>피부 질환 체크하기</p>
            <span className="home-pet-disease-check-span">{"사진 한장으로 빠르게\nAI가 피부 질환을 진단해요!"}</span>
            <div className="home-pet-go-check">
              <span>진단하기</span>
              <img src={HOMEPINKARROW} />
            </div>
          </div>
        </div>
        <div className="home-iot">
          <p className="home-iot-first-p">{"반려동물을 등록하고\n활동량 측정기를 받아보세요!"}</p>
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
            <div className="home-pet-select" onClick={() => setIsPetSelectOpen(true)}>
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
                <img src={HOMENEXTBROWN} alt="진단 시작" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div >
  );
}

