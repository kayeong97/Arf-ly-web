import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

import BottomTabBar from "../../components/BottomTabBar";
import { getMapDetail, getMapList, getMapPhotoBlob } from "./MapApi.js";

import "./MapPage.css";

import phoneIcon from "../../assets/map/phone.svg";
import pinPinkIcon from "../../assets/map/pin_pink.svg";
import pinIcon from "../../assets/map/pin.svg";
import returnIcon from "../../assets/map/return.svg";
import timeIcon from "../../assets/map/time.svg";

/* 더미 데이터 (백엔드 개발 후, 추후 api 반영 예정) */
const DEFAULT_LOCATION = {
	address: "경상북도 경산시 대학로 280 (대동)",
	lat: 35.8327,
	lng: 128.7574,
};

const getFirstPhotoName = (imageUrl) => {
	if (Array.isArray(imageUrl)) {
		return imageUrl[0] || "";
	}

	return imageUrl || "";
};

function MapPage() {
	const [hospitals, setHospitals] = useState([]);
	const [selectedHospital, setSelectedHospital] = useState(null);

	const [baseAddress, setBaseAddress] = useState(DEFAULT_LOCATION.address);
	const [baseCenter, setBaseCenter] = useState({
		lat: DEFAULT_LOCATION.lat,
		lng: DEFAULT_LOCATION.lng,
	});
	const [center, setCenter] = useState({
		lat: DEFAULT_LOCATION.lat,
		lng: DEFAULT_LOCATION.lng,
	});

	const [isDetailMode, setIsDetailMode] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { isLoaded, loadError } = useLoadScript({
		googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
	});

	useEffect(() => {
		fetchBaseLocation();
		fetchHospitals();
	}, []);

	const fetchBaseLocation = async () => {
		/* 더미 데이터 (백엔드 개발 후, 추후 api 반영 예정) */
		setBaseAddress(DEFAULT_LOCATION.address);
		setBaseCenter({
			lat: DEFAULT_LOCATION.lat,
			lng: DEFAULT_LOCATION.lng,
		});
		setCenter({
			lat: DEFAULT_LOCATION.lat,
			lng: DEFAULT_LOCATION.lng,
		});
	};

	const fetchHospitals = async () => {
		try {
			setIsLoading(true);

			const data = await getMapList();

			if (!Array.isArray(data)) {
				console.error("병원 목록 형식 오류", data);
				setHospitals([]);
				return;
			}

			setHospitals(data);

			if (data.length > 0) {
				setCenter({
					lat: Number(data[0].latitude),
					lng: Number(data[0].longitude),
				});
			}
		} catch (error) {
			console.error("병원 목록 조회 실패", error);
			setHospitals([]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleHospitalClick = async (hospital) => {
		try {
			setCenter({
				lat: Number(hospital.latitude),
				lng: Number(hospital.longitude),
			});

			setIsDetailMode(true);
			setSelectedHospital(hospital);

			const detailData = await getMapDetail(hospital.id);

			setSelectedHospital({
				...hospital,
				...detailData,
			});
		} catch (error) {
			console.error("병원 상세 조회 실패", error);

			setSelectedHospital(hospital);
			setIsDetailMode(true);
		}
	};

	const handleReturnClick = () => {
		setSelectedHospital(null);
		setIsDetailMode(false);
		setCenter(baseCenter);
	};

	const getCurrentAddress = () => {
		if (selectedHospital?.roadAddress) {
			return selectedHospital.roadAddress;
		}

		return baseAddress;
	};

	if (loadError) {
		return (
			<div className="map_state_page">
				구글 지도를 불러오지 못했습니다.
			</div>
		);
	}

	if (!isLoaded) {
		return (
			<div className="map_state_page">
				지도를 불러오는 중...
			</div>
		);
	}

	return (
		<div className="map_page">
			<GoogleMap
				mapContainerClassName="google_map"
				center={center}
				zoom={15}
				options={{
					disableDefaultUI: true,
					zoomControl: false,
					streetViewControl: false,
					mapTypeControl: false,
					fullscreenControl: false,
					clickableIcons: false,
					gestureHandling: "greedy",
				}}
			>
				{hospitals.map((hospital) => (
					<Marker
						key={hospital.id}
						position={{
							lat: Number(hospital.latitude),
							lng: Number(hospital.longitude),
						}}
						icon={{
							url: pinPinkIcon,
							scaledSize: new window.google.maps.Size(42, 42),
							anchor: new window.google.maps.Point(21, 42),
						}}
						onClick={() => handleHospitalClick(hospital)}
					/>
				))}
			</GoogleMap>

			<div className="map_top_area">
				<div className="map_address_box">
					<img
						src={pinPinkIcon}
						alt=""
						className="map_pin_pink_icon"
					/>
					<span>{getCurrentAddress()}</span>
				</div>

				<button
					type="button"
					className="map_return_button"
					onClick={handleReturnClick}
					aria-label="기준 위치로 돌아가기"
				>
					<img
						src={returnIcon}
						alt=""
						className="map_return_icon"
					/>
				</button>
			</div>

			<section
				className={
					isDetailMode
						? "map_bottom_sheet detail"
						: "map_bottom_sheet list"
				}
			>
				<div className="bottom_sheet_handle" />

				{isDetailMode && selectedHospital ? (
					<HospitalDetail hospital={selectedHospital} />
				) : (
					<HospitalList
						hospitals={hospitals}
						isLoading={isLoading}
						onHospitalClick={handleHospitalClick}
					/>
				)}
			</section>

			<BottomTabBar />
		</div>
	);
}

function HospitalList({ hospitals, isLoading, onHospitalClick }) {
	if (isLoading) {
		return (
			<div className="hospital_empty_text">
				병원 정보를 불러오는 중...
			</div>
		);
	}

	if (hospitals.length === 0) {
		return (
			<div className="hospital_empty_text">
				주변 병원 정보를 불러오지 못했습니다.
			</div>
		);
	}

	return (
		<div className="hospital_list_area">
			<p className="hospital_count_text">
				근처에 동물병원이{" "}
				<strong>{hospitals.length}</strong>개 있어요!
			</p>

			<div className="hospital_card_list">
				{hospitals.map((hospital) => (
					<button
						key={hospital.id}
						type="button"
						className="hospital_card"
						onClick={() => onHospitalClick(hospital)}
					>
						<HospitalImage
							photoName={getFirstPhotoName(hospital.imageUrl)}
							alt={hospital.hospitalName}
							className="hospital_card_image"
						/>

						<div className="hospital_card_info">
							<span className="open_badge">
								{hospital.opened ? "영업 중" : "영업 종료"}
							</span>

							<h2>{hospital.hospitalName}</h2>

							<div className="hospital_address_row">
								<img
									src={pinIcon}
									alt=""
									className="map_pin_icon"
								/>
								<p>{hospital.roadAddress}</p>
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}

function HospitalDetail({ hospital }) {
	return (
		<div className="hospital_detail_area">
			<div className="hospital_detail_title_row">
				<h1>{hospital.hospitalName}</h1>

				<span className="open_badge">
					{hospital.opened ? "영업 중" : "영업 종료"}
				</span>
			</div>

			<HospitalImage
				photoName={getFirstPhotoName(hospital.imageUrl)}
				alt={hospital.hospitalName}
				className="hospital_detail_image"
			/>

			<div className="hospital_detail_info">
				<div className="hospital_detail_row">
					<img
						src={pinIcon}
						alt=""
						className="map_pin_icon"
					/>
					<p>{hospital.roadAddress}</p>
				</div>

				<div className="hospital_detail_row">
					<img
						src={timeIcon}
						alt=""
						className="map_time_icon"
					/>
					<p>
						{hospital.opened ? "진료 중" : "진료 종료"} |{" "}
						{hospital.operationTime || "운영시간 정보 없음"}
					</p>
				</div>

				<div className="hospital_detail_row">
					<img
						src={phoneIcon}
						alt=""
						className="map_phone_icon"
					/>
					<p>{hospital.phoneNumber || "전화번호 정보 없음"}</p>
				</div>
			</div>
		</div>
	);
}

function HospitalImage({ photoName, alt, className }) {
	const [imageSrc, setImageSrc] = useState("");

	useEffect(() => {
		let isActive = true;

		const fetchImage = async () => {
			try {
				setImageSrc("");

				if (!photoName || typeof photoName !== "string") {
					return;
				}

				const blob = await getMapPhotoBlob(photoName, 400);

				if (!isActive || !blob) {
					return;
				}

				const imageUrl = URL.createObjectURL(blob);
				setImageSrc(imageUrl);
			} catch (error) {
				console.error("병원 사진 조회 실패", error);

				if (isActive) {
					setImageSrc("");
				}
			}
		};

		fetchImage();

		return () => {
			isActive = false;
		};
	}, [photoName]);

	if (!imageSrc) {
		return (
			<div
				className={`${className} hospital_image_empty`}
				aria-label="병원 이미지 없음"
			/>
		);
	}

	return (
		<img
			src={imageSrc}
			alt={alt}
			className={className}
		/>
	);
}

export default MapPage;