import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./CommunityWrite.css";
import { createPost } from "./CommunityApi";

import BackIcon from "../../assets/community/back.svg";
import ImageIcon from "../../assets/community/image.svg";
import ExitImageIcon from "../../assets/community/exit_image.svg";

function CommunityWrite() {
	const navigate = useNavigate();
	const fileInputRef = useRef(null);

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [files, setFiles] = useState([]);
	const [previewItems, setPreviewItems] = useState([]);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const isTitleEmpty = title.trim() === "";
	const isContentEmpty = content.trim() === "";
	const isActive = !isTitleEmpty && !isContentEmpty;

	useEffect(() => {
		return () => {
			previewItems.forEach((item) => URL.revokeObjectURL(item.url));
		};
	}, [previewItems]);

	const handleBackClick = () => {
		navigate(-1);
	};

	const handleTitleChange = (event) => {
		setTitle(event.target.value);

		event.target.style.height = "auto";
		event.target.style.height = `${event.target.scrollHeight}px`;
	};

	const handleFileButtonClick = () => {
		fileInputRef.current.click();
	};

	const isSameFile = (fileA, fileB) => {
		return (
			fileA.name === fileB.name &&
			fileA.size === fileB.size &&
			fileA.lastModified === fileB.lastModified
		);
	};

	const isAllowedFile = (file) => {
		return file.type.startsWith("image/") || file.type.startsWith("video/");
	};

	const makePreviewItems = (targetFiles) => {
		return targetFiles.map((file) => ({
			url: URL.createObjectURL(file),
			type: file.type.startsWith("video/") ? "video" : "image",
			name: file.name,
		}));
	};

	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);

		if (selectedFiles.length === 0) {
			return;
		}

		const allowedFiles = selectedFiles.filter((file) => isAllowedFile(file));

		if (allowedFiles.length !== selectedFiles.length) {
			alert("이미지 또는 동영상 파일만 업로드할 수 있습니다.");
		}

		const newFiles = allowedFiles.filter((selectedFile) => {
			return !files.some((existingFile) =>
				isSameFile(existingFile, selectedFile)
			);
		});

		if (newFiles.length === 0) {
			event.target.value = "";
			return;
		}

		const nextFiles = [...files, ...newFiles];
		const limitedFiles = nextFiles.slice(0, 5);

		if (nextFiles.length > 5) {
			alert("파일은 최대 5개까지 업로드할 수 있습니다.");
		}

		previewItems.forEach((item) => URL.revokeObjectURL(item.url));

		setFiles(limitedFiles);
		setPreviewItems(makePreviewItems(limitedFiles));

		event.target.value = "";
	};

	const handleRemoveFile = (removeIndex) => {
		const nextFiles = files.filter((_, index) => index !== removeIndex);

		previewItems.forEach((item) => URL.revokeObjectURL(item.url));

		setFiles(nextFiles);
		setPreviewItems(makePreviewItems(nextFiles));
	};

	const handleSubmit = async () => {
		setIsSubmitted(true);

		if (!isActive || isSubmitting) {
			return;
		}

		try {
			setIsSubmitting(true);

			await createPost({
				title: title.trim(),
				content: content.trim(),
				files,
			});

			navigate("/community");
		} catch (error) {
			alert("게시글 작성에 실패했습니다.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="community_write_page">
			<header className="community_write_header">
				<button
					className="community_write_back_button"
					type="button"
					onClick={handleBackClick}
					aria-label="뒤로가기"
				>
					<img src={BackIcon} alt="" />
				</button>

				<h1>글 쓰기</h1>

				<button
					className={`community_write_submit_button ${
						isActive ? "active" : ""
					}`}
					type="button"
					onClick={handleSubmit}
					disabled={isSubmitting}
				>
					완료
				</button>
			</header>

			<main className="community_write_main">
				<section className="community_write_field">
					<textarea
						className={`community_write_title_input ${
							isSubmitted && isTitleEmpty ? "error" : ""
						}`}
						value={title}
						onChange={handleTitleChange}
						placeholder="제목을 입력해주세요."
						maxLength={50}
						rows={1}
					/>

					{isSubmitted && isTitleEmpty && (
						<p className="community_write_error_text">
							* 제목을 입력해주세요
						</p>
					)}
				</section>

				<section className="community_write_field content">
					<textarea
						className={`community_write_content_input ${
							isSubmitted && isContentEmpty ? "error" : ""
						}`}
						value={content}
						onChange={(event) => setContent(event.target.value)}
						placeholder={
							"우리 아이의 이야기, 궁금한 점, 일상 등\n반려동물 이야기를 자유롭게 적어보세요."
						}
					/>

					{isSubmitted && isContentEmpty && (
						<p className="community_write_error_text">
							* 내용을 입력해주세요
						</p>
					)}
				</section>

				<section className="community_write_file_section">
					<button
						className="community_write_file_add_button"
						type="button"
						onClick={handleFileButtonClick}
					>
						<img src={ImageIcon} alt="" />
						<span>사진 추가</span>
					</button>

					{previewItems.map((item, index) => (
						<div className="community_write_file_preview" key={item.url}>
							{item.type === "image" ? (
								<img src={item.url} alt={`첨부 이미지 ${index + 1}`} />
							) : (
								<video src={item.url} muted playsInline />
							)}

							{item.type === "video" && (
								<span className="community_write_video_badge">동영상</span>
							)}

							<button
								type="button"
								onClick={() => handleRemoveFile(index)}
								aria-label="파일 삭제"
							>
								<img src={ExitImageIcon} alt="" />
							</button>
						</div>
					))}
				</section>

				<input
					ref={fileInputRef}
					className="community_write_file_input"
					type="file"
					accept="image/*,video/*"
					multiple
					onChange={handleFileChange}
				/>
			</main>
		</div>
	);
}

export default CommunityWrite;