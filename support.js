const THEME_KEY = "freshMusicTheme";
const themeButton = document.getElementById("themeButton");
const copyAccountButton = document.getElementById("copyAccountButton");
const accountNumber = document.getElementById("accountNumber");
const copyNotice = document.getElementById("copyNotice");

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const useDark = savedTheme === "dark";
  document.body.classList.toggle("dark", useDark);
  themeButton.textContent = useDark ? "☾" : "☀";
}

function toggleTheme() {
  const useDark = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", useDark);
  localStorage.setItem(THEME_KEY, useDark ? "dark" : "light");
  themeButton.textContent = useDark ? "☾" : "☀";
}

async function copyAccountNumber() {
  try {
    await navigator.clipboard.writeText(accountNumber.textContent.trim());
    copyNotice.textContent = "Đã sao chép số tài khoản.";
  } catch {
    copyNotice.textContent = "Không thể tự sao chép. Bạn hãy nhấn giữ số tài khoản.";
  }

  setTimeout(() => {
    copyNotice.textContent = "";
  }, 2500);
}

themeButton.addEventListener("click", toggleTheme);
copyAccountButton.addEventListener("click", copyAccountNumber);

applySavedTheme();
