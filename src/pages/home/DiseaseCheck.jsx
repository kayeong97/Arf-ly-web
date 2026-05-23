import { useLocation, useNavigate } from "react-router-dom";
import "./DiseaseCheck.css";

import DISEASECHECKBACK from "../../assets/home/diseaseCheck/diseaseCheck_back.svg";
import DISEASECHECKSTAR from "../../assets/home/diseaseCheck/diseaseCheck_star.svg";
import DISEASECHECKBOX from "../../assets/home/diseaseCheck/diseaseCheck_checkbox.svg";
import DISEASECHECKPERSON from "../../assets/home/diseaseCheck/diseaseCheck_person.svg";
import DISEASECHECKMARK from "../../assets/home/diseaseCheck/diseaseCheck_mark.svg";
import DISEASECHECKMALE from "../../assets/home/diseaseCheck/diseaseCheck_male.svg";
import DISEASECHECKFEMALE from "../../assets/home/diseaseCheck/diseaseCheck_female.svg";
import DISEASECHECKMAP from "../../assets/home/diseaseCheck/diseaseCheck_map.svg";

// 임시 파일
import { checkResult } from "./data/checkResult.jsx";

export default function DiseaseCheck() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const pet = state?.pet;
    const image = state?.image;
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const weekLabels = ["일", "월", "화", "수", "목", "금", "토"];
    const weekday = weekLabels[today.getDay()];

    const formattedDate = `${year}년 ${month}월 ${day}일 (${weekday})`;

    return (
        <div className="diseaseCheck-wrapper">
            <div className="diseaseCheck-top">
                <button
                    className="diseaseCheck-back-button"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    <img src={DISEASECHECKBACK} alt="뒤로가기" />
                </button>
                <span>AI 스마트 진단 리포트</span>
            </div>
            <div className="diseaseCheck-content">
                <div className="diseaseCheck-alert">
                    <img src={DISEASECHECKMARK} alt="" />
                    <p>
                        발병 가능성이 아닌, 증상과 유사한 질병입니다. 반드시<br />
                        동물병원에 방문하여 진료를 받으시기 바랍니다.
                    </p>
                </div>

                <span className="diseaseCheck-date">{formattedDate}</span>

                <img
                    className="diseaseCheck-image"
                    src={image}
                    alt="진단 이미지"
                />

                <section>
                    <div className="diseaseCheck-section-title">
                        <img src={DISEASECHECKSTAR} alt="" />
                        <span>의심 질병</span>
                    </div>

                    <div className="diseaseCheck-disease-card">
                        <div className="diseaseCheck-percent-circle">
                            <svg viewBox="0 0 104 104">
                                <circle
                                    className="diseaseCheck-percent-bg"
                                    cx="52"
                                    cy="52"
                                    r="43"
                                />

                                <circle
                                    className="diseaseCheck-percent-progress"
                                    cx="52"
                                    cy="52"
                                    r="43"
                                    style={{
                                        strokeDasharray: 2 * Math.PI * 43,
                                        strokeDashoffset:
                                            2 * Math.PI * 43 * (1 - checkResult.diseasePercent / 100),
                                    }}
                                />
                            </svg>

                            <span>{checkResult.diseasePercent}%</span>
                        </div>

                        <strong>
                            {checkResult.diseaseName}<br />
                            {checkResult.diseaseNameEng}
                        </strong>
                    </div>
                </section>

                <section>
                    <div className="diseaseCheck-section-title">
                        <img src={DISEASECHECKBOX} alt="" />
                        <span>관리방법</span>
                    </div>

                    {checkResult.controlAct.map((item, index) => (
                        <div className="diseaseCheck-control-card" key={`${item.big}-${index}`}>
                            <strong>{item.big}</strong>
                            <p>{item.small}</p>
                        </div>
                    ))}
                </section>

                <img className="diseaseCheck-map"
                    // onClick={() => navigate("/map")}
                    src={DISEASECHECKMAP} />

                <section>
                    <div className="diseaseCheck-section-title">
                        <img src={DISEASECHECKPERSON} alt="" />
                        <span>반려동물 프로필</span>
                    </div>

                    {pet && (
                        <div className="diseaseCheck-pet-card">
                            <div className="diseaseCheck-pet-tags">
                                <img
                                    className="diseaseCheck-pet-sex"
                                    src={pet.sex === "male" ? DISEASECHECKMALE : DISEASECHECKFEMALE}
                                    alt={pet.sex}
                                />

                                <span className="diseaseCheck-pet-neuter">
                                    {pet.neuter ? "중성화 완료" : "중성화 미완료"}
                                </span>
                            </div>

                            <div className="diseaseCheck-pet-main">
                                <img src={pet.img} alt={pet.name} />

                                <div className="diseaseCheck-pet-info">
                                    <strong>{pet.name}</strong>
                                    <span>{pet.breed}</span>
                                    <span>{pet.age}살 | {pet.weight}kg</span>
                                </div>
                            </div>

                            <div className="diseaseCheck-pet-allergy-list">
                                {pet.allergic?.map((item) => (
                                    <span key={item}>{item}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};