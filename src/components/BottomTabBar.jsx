import { useNavigate, useLocation } from "react-router-dom";
import "./BottomTabBar.css";

import homeIcon from "../assets/tab_bar_icon/home.svg";
import homeActiveIcon from "../assets/tab_bar_icon/home_active.svg";
import communityIcon from "../assets/tab_bar_icon/community.svg";
import communityActiveIcon from "../assets/tab_bar_icon/community_active.svg";
import mapIcon from "../assets/tab_bar_icon/map.svg";
import mapActiveIcon from "../assets/tab_bar_icon/map_active.svg";
import myIcon from "../assets/tab_bar_icon/my.svg";
import myActiveIcon from "../assets/tab_bar_icon/my_active.svg";

const TABS = [
	{
		id: "home",
		label: "홈",
		path: "/home",
		icon: homeIcon,
		activeIcon: homeActiveIcon,
	},
	{
		id: "community",
		label: "커뮤니티",
		path: "/community",
		icon: communityIcon,
		activeIcon: communityActiveIcon,
	},
	{
		id: "map",
		label: "지도",
		path: "/map",
		icon: mapIcon,
		activeIcon: mapActiveIcon,
	},
	{
		id: "my",
		label: "마이페이지",
		path: "/mypage",
		icon: myIcon,
		activeIcon: myActiveIcon,
	},
];

function BottomTabBar() {
	const navigate = useNavigate();
	const location = useLocation();

	const handleTabClick = (tab) => {
		navigate(tab.path);
	};

	return (
		<nav className="bottom_tab_bar">
			{TABS.map((tab) => {
				const isActive = location.pathname === tab.path;

				let buttonClass = "bottom_tab_item";
				if (isActive) {
					buttonClass = "bottom_tab_item active";
				}

				let displayIcon = tab.icon;
				if (isActive) {
					displayIcon = tab.activeIcon;
				}

				return (
					<button
						key={tab.id}
						className={buttonClass}
						onClick={() => handleTabClick(tab)}
					>
						<img
							src={displayIcon}
							alt={tab.label}
							className="tab_icon"
						/>
						<span className="tab_label">{tab.label}</span>
					</button>
				);
			})}
		</nav>
	);
}

export default BottomTabBar;