"use client";

export default function LogoutButton() {
  const handleLogout = () => {
    try {
      localStorage.removeItem("velox_access_token");
      localStorage.removeItem("velox_refresh_token");
      localStorage.removeItem("velox_username");
      window.dispatchEvent(new Event("velox-auth-changed"));
    } catch {
      // Ignorar en entornos sin localStorage
    }
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex w-full items-center justify-center rounded-lg bg-[#2A1515] border border-[#EF4444]/40 py-2.5 text-xs font-bold uppercase tracking-wider text-[#F87171] transition-colors hover:bg-[#3D1A1A] hover:border-[#EF4444]"
    >
      CERRAR SESIÓN
    </button>
  );
}
