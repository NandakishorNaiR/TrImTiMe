import React from "react";

const AuthLoading = () => {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
			<div className="text-center">
				<div className="mb-6">
					<div className="inline-block">
						<div className="w-16 h-16 rounded-full border-4 border-gray-300 border-t-blue-600 animate-spin"></div>
					</div>
				</div>
				<h2 className="text-xl font-semibold text-gray-700 mb-2">Verifying Session</h2>
				<p className="text-gray-500 text-sm">Authenticating your device...</p>
			</div>
		</div>
	);
};

export default AuthLoading;
