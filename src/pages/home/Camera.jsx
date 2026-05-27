import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Camera.css";

import CAMERAFLASH from "../../assets/home/Camera/camera_flash.svg";
import CAMERAROTATE from "../../assets/home/Camera/camera_rotate.svg";
import CAMERAPHOTOPLUS from "../../assets/home/Camera/camera_photo_plus.svg";
import CAMERABACK from "../../assets/home/Camera/camera_back.svg";

export default function Camera() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pet = state?.pet;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [isFlashOn, setIsFlashOn] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert(
            "현재 브라우저 또는 접속 환경에서는 카메라를 사용할 수 없습니다.",
          );
          return;
        }

        streamRef.current?.getTracks().forEach((track) => track.stop());

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {}
    }

    if (!capturedImage) {
      startCamera();
    }

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [capturedImage, facingMode]);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setCapturedImage(canvas.toDataURL("image/png"));
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    setCapturedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRotateCamera = () => {
    setCapturedImage(null);
    setFacingMode((current) =>
      current === "environment" ? "user" : "environment",
    );
  };

  const handleToggleFlash = async () => {
    const videoTrack = streamRef.current?.getVideoTracks?.()[0];

    if (!videoTrack) {
      alert("카메라가 아직 준비되지 않았습니다.");
      return;
    }

    const capabilities = videoTrack.getCapabilities?.();

    if (!capabilities?.torch) {
      alert("이 기기 또는 브라우저에서는 플래시를 지원하지 않습니다.");
      return;
    }

    try {
      const nextFlashState = !isFlashOn;

      await videoTrack.applyConstraints({
        advanced: [
          {
            torch: nextFlashState,
          },
        ],
      });

      setIsFlashOn(nextFlashState);
    } catch (error) {
      alert("플래시를 전환할 수 없습니다.");
    }
  };

  return (
    <div className="camera-wrapper">
      {capturedImage ? (
        <img className="camera-video" src={capturedImage} alt="captured" />
      ) : (
        <video
          ref={videoRef}
          className="camera-video"
          autoPlay
          playsInline
          muted
        />
      )}

      <div className="camera-top">
        <button
          className="camera-back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          <img src={CAMERABACK} />
        </button>

        {pet && (
          <button type="button" className="camera-pet-chip">
            <img src={pet.img} alt={pet.name} />
            <span>{pet.name}</span>
          </button>
        )}
      </div>

      <div className="camera-frame">
        <p>
          테두리 안에 이상 부위가
          <br />잘 보이도록 찍어주세요!
        </p>
      </div>

      <div className="camera-tool-toggle">
        <button
          type="button"
          onClick={handleToggleFlash}
          className={isFlashOn ? "active" : ""}
        >
          <img src={CAMERAFLASH} alt="" />
          <span>플래시</span>
        </button>

        <button type="button" onClick={handleRotateCamera}>
          <img src={CAMERAROTATE} alt="" />
          <span>전환</span>
        </button>
      </div>

      <div className="camera-bottom">
        <input
          ref={fileInputRef}
          className="camera-file-input"
          type="file"
          accept="image/*"
          onChange={handleGalleryChange}
        />

        <button
          className="camera-gallery-button"
          type="button"
          onClick={handleGalleryClick}
        >
          <img src={CAMERAPHOTOPLUS} alt="" />
          <span>가져오기</span>
        </button>

        <button
          type="button"
          className="camera-capture-button"
          onClick={handleCapture}
        />

        <button
          className="camera-retake-button"
          type="button"
          onClick={handleRetake}
        >
          다시 찍기
        </button>

        <button
          className="camera-start-button"
          type="button"
          disabled={!capturedImage}
          onClick={() => {
            navigate("/diseasecheck", {
              state: {
                pet,
                image: capturedImage,
              },
            });
          }}
        >
          스마트 검사 시작하기
        </button>
      </div>
    </div>
  );
}
