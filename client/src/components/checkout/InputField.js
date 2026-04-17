const Input = ({ label, required = false, className = "", ...props }) => (
	<div>
		<label className="mb-1.5 block text-sm font-semibold text-gray-800">
			{label} {required && <span className="text-secondary">*</span>}
		</label>
		<input
			{...props}
			className={[
				"subtext w-full rounded-xl border border-gray-300 bg-white p-3 text-gray-900",
				"placeholder:text-gray-400 input-focus",
				"disabled:cursor-not-allowed disabled:bg-gray-100",
				className,
			].join(" ")}
		/>
	</div>
);

export default Input;
