import FolderNavbar from './FolderNavbar';
import AnimatedBackground from './AnimatedBackground';

const AppLayout = ({ children }) => {
	return (
		<div className="min-h-screen bg-[var(--shell-bg)] p-2 sm:p-3 md:p-5">
			<div className="relative max-w-[1600px] mx-auto rounded-[20px] border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow-folder)]">

				<AnimatedBackground />

				{/* TOP BAR */}
				<div className="relative z-20 h-16 sm:h-20 md:h-24 px-3 sm:px-5 md:px-6 flex items-end overflow-visible">
					<div className="w-full pb-3 sm:pb-4 overflow-visible">
						<FolderNavbar />
					</div>
				</div>

				{/* CONTENT */}
				<div className="relative z-10 min-h-[calc(100vh-140px)] p-3 sm:p-5 md:p-8 overflow-hidden rounded-b-[20px]">
					{children}
				</div>

			</div>
		</div>
	);
};

export default AppLayout;