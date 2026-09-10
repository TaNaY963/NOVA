"use client";

import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import api from "@/src/lib/api";

export default function ProfilePage() {
	const { user, loading, logout, refreshUser } = useAuth();

	const [name, setName] = useState("");
	const [profileLoading, setProfileLoading] = useState(false);
	const [profileError, setProfileError] = useState("");
	const [profileSuccess, setProfileSuccess] = useState("");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordLoading, setPasswordLoading] = useState(false);
	const [passwordError, setPasswordError] = useState("");
	const [passwordSuccess, setPasswordSuccess] = useState("");

	useEffect(() => {
		if (user) {
			setName(user.name || "");
		}
	}, [user]);

	const handleSaveProfile = async (e: FormEvent) => {
		e.preventDefault();

		setProfileError("");
		setProfileSuccess("");

		if (!name.trim()) {
			setProfileError("Name cannot be empty.");
			return;
		}

		try {
			setProfileLoading(true);

			const token = localStorage.getItem("token");

			const response = await api.put(
				"/auth/profile",
				{ name: name.trim() },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setProfileSuccess(response.data?.message || "Profile updated.");

			// Refresh user in context
			if (refreshUser) await refreshUser();
		} catch (error: any) {
			setProfileError(
				error.response?.data?.message || "Unable to update profile."
			);
		} finally {
			setProfileLoading(false);
		}
	};

	const handleChangePassword = async (e: FormEvent) => {
		e.preventDefault();

		setPasswordError("");
		setPasswordSuccess("");

		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordError("All fields are required.");
			return;
		}

		if (newPassword.length < 6) {
			setPasswordError("New password must be at least 6 characters.");
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError("New passwords do not match.");
			return;
		}

		try {
			setPasswordLoading(true);

			const token = localStorage.getItem("token");

			const response = await api.put(
				"/auth/password",
				{ currentPassword, newPassword },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			setPasswordSuccess(response.data?.message || "Password updated.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error: any) {
			setPasswordError(
				error.response?.data?.message || "Unable to update password."
			);
		} finally {
			setPasswordLoading(false);
		}
	};

	if (loading) return null;

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<div className="mx-auto max-w-4xl px-6 py-10">
				<div className="mb-8">
					<h1 className="text-3xl font-bold">Profile</h1>
					<p className="mt-1 text-sm text-slate-400">Manage your account and security settings.</p>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					<div className="lg:col-span-2 space-y-6">
						{/* Profile Card */}
						<form onSubmit={handleSaveProfile} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
							<h2 className="text-lg font-semibold">Profile Information</h2>

							<div className="mt-4 grid gap-4">
								<div>
									<label className="mb-2 block text-sm font-medium">Name</label>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium">Email</label>
									<input
										value={user?.email || ""}
										readOnly
										className="w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium">Account Created</label>
									<div className="text-sm text-slate-400">
										{user?.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}
									</div>
								</div>
							</div>

							{profileError && <p className="mt-4 text-sm text-red-400">{profileError}</p>}
							{profileSuccess && <p className="mt-4 text-sm text-emerald-400">{profileSuccess}</p>}

							<div className="mt-6">
								<button
									type="submit"
									disabled={profileLoading}
									className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
								>
									{profileLoading ? "Saving..." : "Save Changes"}
								</button>
							</div>
						</form>

						{/* Change Password */}
						<form onSubmit={handleChangePassword} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
							<h2 className="text-lg font-semibold">Change Password</h2>

							<div className="mt-4 grid gap-4">
								<div>
									<label className="mb-2 block text-sm font-medium">Current Password</label>
									<input
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium">New Password</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
									/>
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium">Confirm New Password</label>
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500"
									/>
								</div>
							</div>

							{passwordError && <p className="mt-4 text-sm text-red-400">{passwordError}</p>}
							{passwordSuccess && <p className="mt-4 text-sm text-emerald-400">{passwordSuccess}</p>}

							<div className="mt-6">
								<button
									type="submit"
									disabled={passwordLoading}
									className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-60"
								>
									{passwordLoading ? "Updating..." : "Change Password"}
								</button>
							</div>
						</form>
					</div>

					{/* Account Actions */}
					<aside className="space-y-6">
						<div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
							<h3 className="text-lg font-semibold">Account Actions</h3>
							<p className="mt-2 text-sm text-slate-400">Manage your account</p>

							<div className="mt-6 space-y-3">
								<button
									onClick={() => logout()}
									className="w-full rounded-xl border border-red-900 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-950/40"
								>
									Logout
								</button>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</main>
	);
}
