import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./WeeklyActive.css";

import WEEKLYBACK from "../../assets/home/weeklyActive/weeklyActive_back.svg";
import { petList } from "./data/petList";

const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];
const koreanDayLabels = ["월", "화", "수", "목", "금", "토", "일"];

const CHART_HEIGHT = 500;
const TOOLTIP_TOP = -96;
const TOOLTIP_HEIGHT = 54;

function getMonday(date) {
    const copiedDate = new Date(date);
    const day = copiedDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    copiedDate.setDate(copiedDate.getDate() + diff);
    copiedDate.setHours(0, 0, 0, 0);

    return copiedDate;
}

function addDays(date, days) {
    const copiedDate = new Date(date);
    copiedDate.setDate(copiedDate.getDate() + days);
    return copiedDate;
}

function addWeeks(date, weeks) {
    return addDays(date, weeks * 7);
}

function formatKoreanDate(date) {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatWeekRange(mondayDate) {
    const sundayDate = addDays(mondayDate, 6);
    return `${formatKoreanDate(mondayDate)} ~ ${formatKoreanDate(sundayDate)}`;
}

export default function WeeklyActive() {
    const navigate = useNavigate();
    const { petId } = useParams();
    const [isWalkedOpen, setIsWalkedOpen] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);
    const [selectedDayIndex, setSelectedDayIndex] = useState(null);
    const currentPet = petList.find((pet) => String(pet.id) === petId);
    if (!currentPet) {
        return <div className="weeklyActive-wrapper">펫 정보를 찾을 수 없습니다.</div>;
    }
    const currentWeekMonday = getMonday(new Date());
    const visibleWeekMonday = addWeeks(currentWeekMonday, weekOffset);
    const weekRangeText = formatWeekRange(visibleWeekMonday);
    const isLatestWeek = weekOffset === 0;
    const activeValues = isWalkedOpen ? currentPet.weekWalked : currentPet.weekDistance;
    const activeUnit = isWalkedOpen ? "젤리" : "km";
    const maxValue = Math.max(...activeValues, 1);
    const middleValue = maxValue / 2;
    const activeAverage = isWalkedOpen
        ? Math.round(activeValues.reduce((sum, value) => sum + value, 0) / activeValues.length)
        : (
            activeValues.reduce((sum, value) => sum + value, 0) / activeValues.length
        ).toFixed(1);
    const selectedValue =
        selectedDayIndex === null ? null : activeValues[selectedDayIndex];
    const selectedBarPercent =
        selectedValue === null ? 0 : Math.max((selectedValue / maxValue) * 100, 8);
    const selectedBarTop = CHART_HEIGHT * (1 - selectedBarPercent / 100);
    const tooltipLineHeight = selectedBarTop - TOOLTIP_TOP - TOOLTIP_HEIGHT;
    const selectedTooltipLeft =
        selectedDayIndex === null
            ? "0px"
            : `calc(44px + ((100% - 44px) / 7) * ${selectedDayIndex} + ((100% - 44px) / 14))`;
    const selectedDate =
        selectedDayIndex === null ? null : addDays(visibleWeekMonday, selectedDayIndex);
    const formatValue = (value) => {
        if (isWalkedOpen) {
            return Math.round(value).toLocaleString();
        }
        return Number(value.toFixed(1)).toString();
    };
    const handleSelectTab = (nextIsWalkedOpen) => {
        setIsWalkedOpen(nextIsWalkedOpen);
        setSelectedDayIndex(null);
    };
    const handleSelectDay = (index) => {
        setSelectedDayIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <div className="weeklyActive-wrapper">
            <div className="weeklyActive-top">
                <button
                    className="weeklyActive-back-button"
                    type="button"
                    onClick={() => navigate(-1)}
                >
                    <img src={WEEKLYBACK} alt="뒤로가기" />
                </button>
                <span>주간 활동 리포트</span>
            </div>

            <div className="weeklyActive-middle">
                <div className="weeklyActive-pet-selection">
                    <img
                        className="weeklyActive-pet-image"
                        src={currentPet.img}
                        alt={currentPet.name}
                    />
                    <div className="weeklyActive-pet-profile">
                        <span className="weeklyActive-pet-name">{currentPet.name}</span>
                        <span className="weeklyActive-pet-breed">{currentPet.breed}</span>
                        <span className="weeklyActive-pet-age">{currentPet.age}살</span>
                    </div>
                </div>
                <div className="weeklyActive-active-tabs">
                    <button
                        type="button"
                        className={isWalkedOpen ? "active" : ""}
                        onClick={() => handleSelectTab(true)}
                    >
                        걸음 수
                    </button>
                    <button
                        type="button"
                        className={!isWalkedOpen ? "active" : ""}
                        onClick={() => handleSelectTab(false)}
                    >
                        산책 거리
                    </button>
                </div>
                <div className="weeklyActive-report">
                    <div className="weeklyActive-week-header">
                        <button
                            type="button"
                            className="weeklyActive-week-arrow"
                            onClick={() => {
                                setWeekOffset(weekOffset - 1);
                                setSelectedDayIndex(null);
                            }}
                        >
                            ‹
                        </button>
                        <span>{weekRangeText}</span>
                        <button
                            type="button"
                            className={`weeklyActive-week-arrow ${isLatestWeek ? "disabled" : ""}`}
                            onClick={() => {
                                if (!isLatestWeek) {
                                    setWeekOffset(weekOffset + 1);
                                    setSelectedDayIndex(null);
                                }
                            }}
                        >
                            ›
                        </button>
                    </div>
                    <div className="weeklyActive-average">
                        <span>평균</span>
                        <strong>{formatValue(Number(activeAverage))}</strong>
                        <em>{activeUnit}</em>
                    </div>
                    <div className="weeklyActive-chart">
                        {selectedDayIndex !== null && (
                            <div
                                className="weeklyActive-bar-tooltip"
                                style={{
                                    left: selectedTooltipLeft,
                                    "--line-height": `${Math.max(tooltipLineHeight, 12)}px`,
                                }}
                            >
                                <span className="weeklyActive-bar-tooltip-date">
                                    {formatKoreanDate(selectedDate)} {koreanDayLabels[selectedDayIndex]}요일
                                </span>
                                <span className="weeklyActive-bar-tooltip-value">
                                    {formatValue(selectedValue)}
                                    <em>{activeUnit}</em>
                                </span>
                            </div>
                        )}
                        <div className="weeklyActive-chart-grid">
                            <span>{formatValue(maxValue)}</span>
                            <span>{formatValue(middleValue)}</span>
                            <span>0</span>
                        </div>
                        <div className="weeklyActive-chart-bars">
                            {activeValues.map((value, index) => {
                                const barHeight = `${Math.max((value / maxValue) * 100, 8)}%`;
                                const isSelected = selectedDayIndex === index;
                                const isDimmed = selectedDayIndex !== null && !isSelected;

                                return (
                                    <button
                                        type="button"
                                        className={`weeklyActive-chart-bar ${isSelected ? "selected" : ""} ${isDimmed ? "dimmed" : ""
                                            }`}
                                        style={{ height: barHeight }}
                                        key={`${weekLabels[index]}-${index}`}
                                        onClick={() => handleSelectDay(index)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="weeklyActive-chart-labels">
                        {weekLabels.map((label, index) => (
                            <button
                                type="button"
                                className={`${selectedDayIndex === index ? "selected" : ""} ${index === 5 ? "saturday" : index === 6 ? "sunday" : ""
                                    }`}
                                key={`${label}-${index}`}
                                onClick={() => handleSelectDay(index)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
