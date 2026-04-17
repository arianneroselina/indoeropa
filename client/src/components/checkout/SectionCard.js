import React from "react";
import { FaInfoCircle } from "react-icons/fa";

const SectionCard = ({ step, title, tooltip, children, logo = null }) => {
	return (
		<div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div>
					<div className="text-xs font-semibold uppercase tracking-wide text-primary-400">
						Step {step}
					</div>

					<div className="mt-1 flex items-center gap-2">
						<h3 className="text-xl font-semibold text-gray-900">
							{title}
						</h3>

						{tooltip ? (
							<div className="group relative inline-flex">
								<button
									type="button"
									tabIndex={-1}
									className="text-gray-400 transition hover:text-primary"
									aria-label={`${title} info`}
								>
									<FaInfoCircle className="h-4 w-4" />
								</button>

								<div
									className="
										subtext pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64
										-translate-x-1/2 rounded-xl border border-gray-200 bg-white px-3 py-2
										text-xs text-gray-600 shadow-lg opacity-0 transition
										group-hover:opacity-100
									"
								>
									{tooltip}
								</div>
							</div>
						) : null}
					</div>
				</div>

				{logo ? (
					<img
						src={logo}
						alt=""
						className="h-10 w-auto shrink-0 rounded-md border border-gray-200 bg-white p-1"
					/>
				) : null}
			</div>

			<div className="space-y-4">{children}</div>
		</div>
	);
};

export default SectionCard;
