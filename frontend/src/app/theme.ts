export type ThemeMode = "light" | "dark";

export function getInitialTheme(): ThemeMode {
  const savedTheme = localStorage.getItem("birgefund-theme");

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return "light";
}

export function applyTheme(mode: ThemeMode) {
  localStorage.setItem("birgefund-theme", mode);
  document.documentElement.classList.toggle("dark", mode === "dark");
}
