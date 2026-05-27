// 임시 파일
// 서버로부터 받아와야할 정보를 개발을 위해 임시로 사용
// 애완동물 기본 정보

// 펫 임시 사진
import HOMEDOG from "../../../assets/home/home_dog.svg";
import HOMECAT from "../../../assets/home/home_cat.svg";

export const petList = [
  {
    id: 1,
    img: HOMEDOG,
    sex: "male",
    neuter: true,
    name: "아르지",
    breed: "시고르자브종",
    age: 5,
    weight: 5.6,
    todayWalked: 34356,
    weekWalked: [30000, 20000, 10000, 40000, 50000, 0, 0],
    weekDistance: [11.2, 14.5, 18.1, 10.9, 16.2, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [{
      month: 4,
      day: 15,
      disease: "진균성 피부염 (Dermatophy)",
    }],
    allergic: ['호두', '땅콩버터', '해열제', '갑각류', '마라탕', '떡볶이', '파스타', '회']
  },
  {
    id: 2,
    img: HOMEDOG,
    sex: "male",
    neuter: true,
    name: "아르지2",
    breed: "시고르자브종",
    age: 3,
    weight: 3.6,
    todayWalked: 14356,
    weekWalked: [10000, 40000, 10000, 30000, 50000, 0, 0],
    weekDistance: [11.2, 14.5, 18.1, 10.9, 16.2, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [],
    allergic: ['호두', '땅콩버터', '해열제', '갑각류']
  },
  {
    id: 3,
    img: HOMECAT,
    sex: "female",
    neuter: false,
    name: "고양이",
    breed: "고양이",
    age: 4,
    weight: 3.6,
    todayWalked: 24356,
    weekWalked: [10000, 50000, 10000, 40000, 50000, 0, 0],
    weekDistance: [11.2, 14.5, 18.1, 10.9, 16.2, 0, 0],
    recentDistance: 11.4,
    recentWalked: 20346,
    checkRecord: [],
    allergic: ['호두', '땅콩버터', '해열제', '갑각류']
  },
  {
    id: 4,
    img: HOMEDOG,
    sex: "male",
    neuter: true,
    name: "아르지",
    breed: "시고르자브종",
    age: 5,
    weight: 5.6,
    todayWalked: 34356,
    weekWalked: [30000, 20000, 10000, 40000, 50000, 0, 0],
    weekDistance: [11.2, 14.5, 18.1, 10.9, 16.2, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [{
      month: 4,
      day: 15,
      disease: "진균성 피부염 (Dermatophy)",
    }],
    allergic: ['호두', '땅콩버터', '해열제', '갑각류', '마라탕', '떡볶이', '파스타', '회']
  },
  {
    id: 5,
    img: HOMEDOG,
    sex: "male",
    neuter: true,
    name: "아르지",
    breed: "시고르자브종",
    age: 5,
    weight: 5.6,
    todayWalked: 34356,
    weekWalked: [30000, 20000, 10000, 40000, 50000, 0, 0],
    weekDistance: [11.2, 14.5, 18.1, 10.9, 16.2, 0, 0],
    recentDistance: 12.4,
    recentWalked: 30346,
    checkRecord: [{
      month: 4,
      day: 15,
      disease: "진균성 피부염 (Dermatophy)",
    }],
    allergic: ['호두', '땅콩버터', '해열제', '갑각류', '마라탕', '떡볶이', '파스타', '회']
  },
];
