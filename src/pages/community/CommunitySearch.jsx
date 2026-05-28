import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CommunitySearch.css";
import { deleteRecentSearch, searchPosts } from "./CommunityApi";

import BackIcon from "../../assets/community/back.svg";
import SearchIcon from "../../assets/community/search.svg";
import SortArrowIcon from "../../assets/community/sort_^.svg";
import RecentIcon from "../../assets/community/recent.svg";
import DeleteIcon from "../../assets/community/delete_recent.svg";
import NoSearchDogIcon from "../../assets/community/no_search_dog.svg";

const RECENT_SEARCH_KEY = "communityRecentSearches";

const format_created_at = (created_at) => {
	if (!created_at) {
		return "";
	}

	const created_date = new Date(created_at);

	if (Number.isNaN(created_date.getTime())) {
		return created_at;
	}

	const now = new Date();
	const diff_ms = now - created_date;
	const diff_minutes = Math.floor(diff_ms / 1000 / 60);
	const diff_hours = Math.floor(diff_minutes / 60);
	const diff_days = Math.floor(diff_hours / 24);

	if (diff_minutes < 1) {
		return "방금";
	}

	if (diff_minutes < 60) {
		return `${diff_minutes}분 전`;
	}

	if (diff_hours < 24) {
		return `${diff_hours}시간 전`;
	}

	if (diff_days < 7) {
		return `${diff_days}일 전`;
	}

	return created_at.slice(0, 10);
};

function CommunityThumbnailImage({ src, alt }) {
	const [image_src, set_image_src] = useState(null);

	useEffect(() => {
		if (!src) {
			set_image_src(null);
			return;
		}

		let is_mounted = true;
		const image = new Image();

		image.onload = () => {
			if (is_mounted) {
				set_image_src(src);
			}
		};

		image.onerror = () => {
			if (is_mounted) {
				set_image_src(null);
			}
		};

		image.src = src;

		return () => {
			is_mounted = false;
		};
	}, [src]);

	if (!image_src) {
		return null;
	}

	return <img className="community_search_thumbnail" src={image_src} alt={alt} />;
}

function CommunitySearch() {
	const navigate = useNavigate();
	const observer_target_ref = useRef(null);
	const search_input_ref = useRef(null);

	const [keyword, set_keyword] = useState("");
	const [searched_keyword, set_searched_keyword] = useState("");
	const [recent_searches, set_recent_searches] = useState([]);

	const [sort, set_sort] = useState("latest");
	const [is_sort_open, set_is_sort_open] = useState(false);

	const [posts, set_posts] = useState([]);
	const [meta, set_meta] = useState({
		hasNext: false,
		nextCursor: null,
		size: 20,
		totalCount: 0,
	});

	const [is_searched, set_is_searched] = useState(false);
	const [is_loading, set_is_loading] = useState(false);
	const [is_more_loading, set_is_more_loading] = useState(false);
	const [error_message, set_error_message] = useState("");

	const sort_text = sort === "latest" ? "최신순" : "인기순";
	const next_sort_text = sort === "latest" ? "인기순" : "최신순";
	const next_sort_value = sort === "latest" ? "likes" : "latest";

	useEffect(() => {
		const saved_recent_searches = localStorage.getItem(RECENT_SEARCH_KEY);

		if (!saved_recent_searches) {
			return;
		}

		try {
			const parsed_searches = JSON.parse(saved_recent_searches);

			if (Array.isArray(parsed_searches)) {
				set_recent_searches(parsed_searches);
			}
		} catch (error) {
			localStorage.removeItem(RECENT_SEARCH_KEY);
		}
	}, []);

	useEffect(() => {
		search_input_ref.current?.focus();
	}, []);

	const save_recent_search = (next_keyword) => {
		const trimmed_keyword = next_keyword.trim();

		if (!trimmed_keyword) {
			return;
		}

		const next_recent_searches = [
			trimmed_keyword,
			...recent_searches.filter((item) => item !== trimmed_keyword),
		].slice(0, 12);

		set_recent_searches(next_recent_searches);
		localStorage.setItem(
			RECENT_SEARCH_KEY,
			JSON.stringify(next_recent_searches)
		);
	};

	const fetch_search_posts = async ({
		next_keyword = searched_keyword,
		next_sort = sort,
		cursor,
		is_more = false,
	}) => {
		if (!next_keyword.trim()) {
			return;
		}

		try {
			if (is_more) {
				set_is_more_loading(true);
			} else {
				set_is_loading(true);
			}

			set_error_message("");

			const data = await searchPosts({
				keyword: next_keyword.trim(),
				sort: next_sort,
				cursor,
				size: 20,
			});

			const next_posts = data.posts || [];
			const next_meta = data.meta || {
				hasNext: false,
				nextCursor: null,
				size: 20,
				totalCount: 0,
			};

			if (is_more) {
				set_posts((prev_posts) => [...prev_posts, ...next_posts]);
			} else {
				set_posts(next_posts);
			}

			set_meta(next_meta);
		} catch (error) {
			set_error_message("검색 결과를 불러오지 못했습니다.");
		} finally {
			set_is_loading(false);
			set_is_more_loading(false);
		}
	};

	useEffect(() => {
		if (!is_searched || !searched_keyword) {
			return;
		}

		fetch_search_posts({
			next_keyword: searched_keyword,
			next_sort: sort,
			cursor: null,
			is_more: false,
		});
	}, [sort]);

	useEffect(() => {
		if (!observer_target_ref.current) {
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];

				if (
					target.isIntersecting &&
					meta.hasNext &&
					!is_loading &&
					!is_more_loading &&
					is_searched
				) {
					fetch_search_posts({
						next_keyword: searched_keyword,
						next_sort: sort,
						cursor: meta.nextCursor,
						is_more: true,
					});
				}
			},
			{
				root: null,
				rootMargin: "160px",
				threshold: 0,
			}
		);

		observer.observe(observer_target_ref.current);

		return () => {
			observer.disconnect();
		};
	}, [
		meta.hasNext,
		meta.nextCursor,
		is_loading,
		is_more_loading,
		is_searched,
		searched_keyword,
		sort,
	]);

	const handle_back_click = () => {
		navigate(-1);
	};

	const handle_search_submit = (event) => {
		event.preventDefault();

		const trimmed_keyword = keyword.trim();

		if (!trimmed_keyword) {
			return;
		}

		set_is_searched(true);
		set_searched_keyword(trimmed_keyword);
		save_recent_search(trimmed_keyword);
		set_is_sort_open(false);

		if (sort !== "latest") {
			set_sort("latest");
			return;
		}

		fetch_search_posts({
			next_keyword: trimmed_keyword,
			next_sort: "latest",
			cursor: null,
			is_more: false,
		});
	};

	const handle_recent_search_click = (recent_keyword) => {
		set_keyword(recent_keyword);
		set_is_searched(true);
		set_searched_keyword(recent_keyword);
		save_recent_search(recent_keyword);
		set_is_sort_open(false);

		if (sort !== "latest") {
			set_sort("latest");
			return;
		}

		fetch_search_posts({
			next_keyword: recent_keyword,
			next_sort: "latest",
			cursor: null,
			is_more: false,
		});
	};

	const handle_recent_search_delete = async (recent_keyword) => {
		const next_recent_searches = recent_searches.filter(
			(item) => item !== recent_keyword
		);

		set_recent_searches(next_recent_searches);
		localStorage.setItem(
			RECENT_SEARCH_KEY,
			JSON.stringify(next_recent_searches)
		);

		try {
			await deleteRecentSearch(recent_keyword);
		} catch (error) {
		}
	};

	const handle_sort_change = (next_sort) => {
		set_sort(next_sort);
		set_is_sort_open(false);
	};

	const render_recent_searches = () => {
		if (recent_searches.length === 0) {
			return (
				<p className="community_search_empty_recent">
					검색기록이 없어요
				</p>
			);
		}

		return (
			<ul className="community_search_recent_list">
				{recent_searches.map((recent_keyword, index) => (
					<li key={`${recent_keyword}-${index}`}>
						<div className="community_search_recent_item">
							<button
								className="community_search_recent_button"
								type="button"
								onClick={() => handle_recent_search_click(recent_keyword)}
							>
								<img
									className="community_search_recent_icon"
									src={RecentIcon}
									alt=""
								/>

								<span>{recent_keyword}</span>
							</button>

							<button
								className="community_search_recent_delete_button"
								type="button"
								onClick={() => handle_recent_search_delete(recent_keyword)}
								aria-label="최근 검색어 삭제"
							>
								<img src={DeleteIcon} alt="" />
							</button>
						</div>
					</li>
				))}
			</ul>
		);
	};

	const render_post_card = (post) => {
		const created_at_text = format_created_at(post.createdAt);
		const thumbnail_urls = (post.thumbnails || []).filter(Boolean);

		const media_items = thumbnail_urls.map((thumbnail_url) => ({
			type: "image",
			url: thumbnail_url,
		}));

		if (post.hasVideo) {
			media_items.push({
				type: "video",
			});
		}

		const total_media_count = media_items.length;
		const should_show_more = total_media_count > 3;

		const visible_media_items = should_show_more
			? media_items.slice(0, 3)
			: media_items;

		const hidden_media_count =
			total_media_count - visible_media_items.length;

		const should_show_media = visible_media_items.length > 0;

		return (
			<article
				className={`community_search_post_card ${
					should_show_media ? "has_media" : "no_media"
				}`}
				key={post.id}
				onClick={() => navigate(`/community/${post.id}`)}
			>
				<div className="community_search_post_content">
					<h3>{post.title}</h3>

					<p className="community_search_post_preview">
						{post.content || ""}
					</p>

					{should_show_media && (
						<div className="community_search_thumbnail_row">
							{visible_media_items.map((item, media_index) => {
								if (item.type === "video") {
									return (
										<div
											className="community_search_thumbnail video"
											key={`${post.id}-video-${media_index}`}
										>
											<span>▶</span>
										</div>
									);
								}

								return (
									<CommunityThumbnailImage
										key={`${post.id}-${item.url}-${media_index}`}
										src={item.url}
										alt={`게시글 이미지 ${media_index + 1}`}
									/>
								);
							})}

							{should_show_more && hidden_media_count > 0 && (
								<div className="community_search_thumbnail more">
									+{hidden_media_count}
								</div>
							)}
						</div>
					)}
				</div>

				<span className="community_search_post_time">
					{created_at_text}
				</span>
			</article>
		);
	};

	return (
		<div className="community_search_page">
			<header className="community_search_header">
				<button
					className="community_search_back_button"
					type="button"
					onClick={handle_back_click}
					aria-label="뒤로가기"
				>
					<img src={BackIcon} alt="" />
				</button>

				<h1>게시글 검색</h1>
			</header>

			<form className="community_search_form" onSubmit={handle_search_submit}>
				<input
					ref={search_input_ref}
					value={keyword}
					onChange={(event) => set_keyword(event.target.value)}
					placeholder="게시글을 검색하여 찾아보세요"
				/>

				<button type="submit" aria-label="검색">
					<img src={SearchIcon} alt="" />
				</button>
			</form>

			<main className="community_search_main">
				{!is_searched && render_recent_searches()}

				{is_searched && (
					<>
						<section className="community_search_result_header">
							<h2>
								‘{searched_keyword}’에 대한 검색
								<br />
								결과 총{" "}
								<strong>{meta.totalCount || posts.length}</strong>개
							</h2>

							<div className="community_search_sort">
								{is_sort_open ? (
									<div className="community_search_sort_menu">
										<button
											className="community_search_sort_menu_selected"
											type="button"
											onClick={() => set_is_sort_open(false)}
										>
											<span>{sort_text}</span>
											<img src={SortArrowIcon} alt="" />
										</button>

										<button
											type="button"
											onClick={() => handle_sort_change(next_sort_value)}
										>
											{next_sort_text}
										</button>
									</div>
								) : (
									<button
										className="community_search_sort_button"
										type="button"
										onClick={() => set_is_sort_open(true)}
									>
										<span>{sort_text}</span>
										<img src={SortArrowIcon} alt="" />
									</button>
								)}
							</div>
						</section>

						{is_loading && (
							<p className="community_search_state_text">
								검색 결과를 불러오는 중입니다.
							</p>
						)}

						{!is_loading && error_message && (
							<p className="community_search_state_text">
								{error_message}
							</p>
						)}

						{!is_loading &&
							!error_message &&
							posts.length === 0 && (
								<section className="community_search_no_result">
									<p>아직 게시글이 없어요</p>
									<img src={NoSearchDogIcon} alt="" />
								</section>
							)}

						{!is_loading &&
							!error_message &&
							posts.length > 0 && (
								<section className="community_search_result_list">
									{posts.map((post) => render_post_card(post))}
								</section>
							)}

						<div
							ref={observer_target_ref}
							className="community_search_observer_target"
						/>

						{is_more_loading && (
							<p className="community_search_more_loading_text">
								게시글을 더 불러오는 중입니다.
							</p>
						)}
					</>
				)}
			</main>
		</div>
	);
}

export default CommunitySearch;