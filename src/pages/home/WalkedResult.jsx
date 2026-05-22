import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WalkedResult.css";

import WALKEDBACK from "../../assets/home/weeklyActive/weeklyActive_back.svg";
import WALKEDPAW from "../../assets/home/home_paw.svg";
import WALKBROWNPAW from "../../assets/home/home_brown_paw.svg";
import WALKEDDOWN from "../../assets/home/walkedResult/walkedResult_down_arrow.svg";
import WALKEDCHECK from "../../assets/home/walkedResult/walkedResult_check.svg";
import ARFLYCAT from "../../assets/home/walkedResult/walkedResult_arfly_cat.svg";
import WALKEDDOG from "../../assets/home/walkedResult/walkedResult_dog.svg";
import ARFLYCAT2 from "../../assets/home/walkedResult/walkedResult_arfly_cat2.svg";

import { walkedList, unDefinedWalked } from "./data/walkedList";
import { petList } from "./data/petList.jsx";

// 반려동물을 사용자가 아무것도 등록하지 않았다면
// 동물 필터 부분에 반려동물을 등록하러가는 버튼 추가 필요

const PET_MODAL_STEP = 136;

export default function WalkedResult() {
    const navigate = useNavigate();
    const padTwo = (value) => String(value).padStart(2, "0");
    const formatCount = (value) => Number(value).toLocaleString();
    const getDayLabel = (year, month, date) => {
        const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];
        const dayIndex = new Date(year, month - 1, date).getDay();
        return dayLabels[dayIndex];
    };
    const unDefinedWalkedLength = unDefinedWalked.length;
    // const unDefinedWalkedLength = 0;
    const totalWalkedLength = walkedList.reduce((total, item) => {
        return total + item.walked.length;
    }, 0);
    const [selectedWalkedPetId, setSelectedWalkedPetId] = useState("all");
    const definedWalkedCards = walkedList.flatMap((pet) =>
        pet.walked.map((walked, walkedIndex) => ({
            ...walked,
            petId: pet.id,
            petName: pet.name,
            petImg: pet.img,
            walkedIndex,
        }))
    );
    const visibleDefinedWalkedCards =
        selectedWalkedPetId === "all"
            ? definedWalkedCards
            : definedWalkedCards.filter((walked) => walked.petId === selectedWalkedPetId);
    const [isPetSelectModalOpen, setIsPetSelectModalOpen] = useState(false);
    const [petSelectModalType, setPetSelectModalType] = useState(null);
    const petSelectModalMessage =
        petSelectModalType === "undefined"
            ? "함께 산책을 다녀온 친구를 \n선택해주세요!"
            : "함께 산책을 다녀온 친구를 \n변경하실건가요?";
    const [selectedModalPetId, setSelectedModalPetId] = useState(petList[0]?.id);
    const selectedModalPetIndex = Math.max(
        petList.findIndex((pet) => pet.id === selectedModalPetId),
        0
    );

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
                    <img src={WALKEDPAW} />
                    <span> 새로운 산책 기록이 {unDefinedWalked.length}건 있어요!</span>
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
                        {unDefinedWalked.map((walked, index) => (
                            <div
                                className="walkedResult-undefined-elements"
                                key={`${walked.year}-${walked.month}-${walked.date}-${index}`}
                            >
                                <span className="walkedResult-undefined-elements-day">
                                    {walked.year}년 {padTwo(walked.month)}월 {padTwo(walked.date)}일 ({getDayLabel(walked.year, walked.month, walked.date)})
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
                                        setSelectedModalPetId(petList[0]?.id);
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
                    <img src={WALKEDCHECK} />
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
                    {walkedList.map((pet) => (
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
                                기기를 사용한 산책을 통해<br />
                                반려동물의 운동량을 체크해보세요!
                            </span>
                        </div>
                        <img src={ARFLYCAT2} alt="" />
                    </div>
                ) : (
                    <div className="walkedResult-defined-list">
                        {visibleDefinedWalkedCards.map((walked) => (
                            <div
                                className="walkedResult-defined-card"
                                key={`${walked.petId}-${walked.year}-${walked.month}-${walked.date}-${walked.walkedIndex}`}
                            >
                                <div className="walkedResult-defined-card-content">
                                    <span className="walkedResult-defined-card-day">
                                        {walked.year}년 {padTwo(walked.month)}월 {padTwo(walked.date)}일 ({getDayLabel(walked.year, walked.month, walked.date)})
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
                                <button className="walkedResult-defined-card-pet"
                                    type="button"
                                    onClick={() => {
                                        setPetSelectModalType("defined");
                                        setSelectedModalPetId(petList[0]?.id);
                                        setIsPetSelectModalOpen(true);
                                    }}>
                                    <img src={WALKEDDOG} alt="" />
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
                                {petList.map((pet) => {
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
                            onClick={() => setIsPetSelectModalOpen(false)}
                        >
                            완료
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
