import { useNavigate } from "react-router-dom";
import "./AlarmNotification.css";

import ALARMNOTIFICATIONBACK from "../../assets/login/system/backbtn.svg";

export default function AlarmNotification() {
  const navigate = useNavigate();

  return (
    <div className="alarmNotification-wrapper">
      <div className="alarmNotification-top">
        <button
          className="alarmNotification-back-button"
          type="button"
          onClick={() => navigate(-1)}
        >
          <img src={ALARMNOTIFICATIONBACK} alt="뒤로가기" />
        </button>
        <span>알림</span>
      </div>
      <span className="alarmNotification-empty">
        새로운 알림이 없습니다!
      </span>
    </div>
  );
}
