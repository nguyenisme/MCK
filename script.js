const songs = [
  "1 - Elegie.mp3",
  "2- IDK.mp3",
  "3 - Wtf Bby I’m Lit.mp3",
  "4 - Anh Không Muốn Nó Dễ Dàng.mp3",
  "5 - Baby.mp3",
  "6 - Yêu Anh Giết Anh.mp3",
  "7 - Mắt Môi Tay Chân.mp3",
  "8 - Đao Của Anh Vừa.mp3",
  "9 - Là Gì Của Nhau.mp3",
  "10 - Night In Prague.mp3",
  "11 - Một Cái Ôm.mp3",
  "12 - Liệm.mp3",
  "13 - Nếu Như Ta Chẳng Còn.mp3",
  "14 - Ai Mới Là Kẻ Xấu Xa.mp3",
  "15 - Slippery.mp3",
  "16 - Intenpol.mp3",
  "17 - Tây thi.mp3",
  "18 - Hút và Hút.mp3",
  "19 - Dưa chua.mp3",
  "20 - Xa xôi.mp3",
  "21 - Che Phủ.mp3",
  "22 - Oanh M = Thuoc.mp3",
  "23 - Ghet Xog Lai Thik.mp3",
  "24 - Nhìn Kẻ Thù Của Tao.mp3",
  "25 - Envy.mp3",
  "26 - Cảm Ơn.mp3",
  "27 - Không Cần Lo Cho Tao.mp3",
  "28 - Huh.mp3",
  "29 - Nguyễn Văn Mười.mp3",
  "30 - Thịt Lợn.mp3"
];

const STORAGE_KEY = "freshMusicPlaylists";
const THEME_KEY = "freshMusicTheme";

const audio = document.getElementById("audioPlayer");
const currentTitle = document.getElementById("currentTitle");
const currentSource = document.getElementById("currentSource");
const playingStatus = document.getElementById("playingStatus");
const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");
const progressBar = document.getElementById("progressBar");
const volumeBar = document.getElementById("volumeBar");
const playButton = document.getElementById("playButton");
const previousButton = document.getElementById("previousButton");
const nextButton = document.getElementById("nextButton");
const sequentialModeButton = document.getElementById("sequentialModeButton");
const shuffleModeButton = document.getElementById("shuffleModeButton");
const playAllButton = document.getElementById("playAllButton");
const librarySongs = document.getElementById("librarySongs");
const playlistTabs = document.getElementById("playlistTabs");
const playlistSongs = document.getElementById("playlistSongs");
const createPlaylistButton = document.getElementById("createPlaylistButton");
const playPlaylistButton = document.getElementById("playPlaylistButton");
const playlistDialog = document.getElementById("playlistDialog");
const playlistForm = document.getElementById("playlistForm");
const playlistNameInput = document.getElementById("playlistNameInput");
const dialogTitle = document.getElementById("dialogTitle");
const cancelDialogButton = document.getElementById("cancelDialogButton");
const themeButton = document.getElementById("themeButton");
const desktopProgressMirror = document.getElementById("desktopProgressMirror");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const mobileMenuButton = document.getElementById("mobileMenuButton");

let playMode = "sequential";
let currentQueue = songs.map((_, index) => index);
let currentQueuePosition = 0;
let currentSongIndex = null;
let currentQueueName = "Thư viện nhạc";
let playlists = loadPlaylists();
let activePlaylistId = playlists[0]?.id ?? null;
let dialogMode = "create";

function titleFromFile(fileName) {
  return decodeURIComponent(fileName)
    .replace(/\.mp3$/i, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function songUrl(fileName) {
  return `songs/${encodeURIComponent(fileName).replace(/%2F/g, "/")}`;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainSeconds.toString().padStart(2, "0")}`;
}

function loadPlaylists() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function savePlaylists() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(playlists));
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getActivePlaylist() {
  return playlists.find((playlist) => playlist.id === activePlaylistId) ?? null;
}

function loadTrack(songIndex, queue = currentQueue, queueName = currentQueueName) {
  currentSongIndex = songIndex;
  currentQueue = queue.length ? [...queue] : songs.map((_, index) => index);
  currentQueuePosition = Math.max(0, currentQueue.indexOf(songIndex));
  currentQueueName = queueName;

  const fileName = songs[songIndex];
  audio.src = songUrl(fileName);
  audio.load();

  currentTitle.textContent = titleFromFile(fileName);
  currentSource.textContent = queueName;
  playingStatus.textContent = "Đã chọn bài";
  progressBar.value = 0;
  if (desktopProgressMirror) desktopProgressMirror.value = 0;
  currentTimeText.textContent = "0:00";
  durationText.textContent = "0:00";

  renderLibrary();
  renderActivePlaylistSongs();
  updateMediaSession();
}

async function playCurrent() {
  if (currentSongIndex === null) {
    loadTrack(currentQueue[0] ?? 0, currentQueue, currentQueueName);
  }

  try {
    await audio.play();
  } catch (error) {
    console.error(error);
    playingStatus.textContent = "Chạm nút phát để bắt đầu";
  }
}

function pauseCurrent() {
  audio.pause();
}

function togglePlay() {
  audio.paused ? playCurrent() : pauseCurrent();
}

function getNextQueuePosition() {
  if (!currentQueue.length) return 0;

  if (playMode === "shuffle" && currentQueue.length > 1) {
    let nextPosition = currentQueuePosition;

    while (nextPosition === currentQueuePosition) {
      nextPosition = Math.floor(Math.random() * currentQueue.length);
    }

    return nextPosition;
  }

  return (currentQueuePosition + 1) % currentQueue.length;
}

function playNext() {
  if (!currentQueue.length) return;
  currentQueuePosition = getNextQueuePosition();
  loadTrack(currentQueue[currentQueuePosition], currentQueue, currentQueueName);
  playCurrent();
}

function playPrevious() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  if (!currentQueue.length) return;

  currentQueuePosition =
    (currentQueuePosition - 1 + currentQueue.length) % currentQueue.length;

  loadTrack(currentQueue[currentQueuePosition], currentQueue, currentQueueName);
  playCurrent();
}

function setPlayMode(mode) {
  playMode = mode;
  sequentialModeButton.classList.toggle("active", mode === "sequential");
  shuffleModeButton.classList.toggle("active", mode === "shuffle");
}

function renderLibrary() {
  librarySongs.innerHTML = "";

  songs.forEach((fileName, index) => {
    const row = document.createElement("div");
    row.className = `song-row ${currentSongIndex === index ? "active" : ""}`;
    row.innerHTML = `
      <span class="song-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="song-title">${titleFromFile(fileName)}</span>
      <div class="song-buttons">
        <button class="song-action play-song" type="button" aria-label="Phát bài hát">▶</button>
        <button class="song-action add-song" type="button" aria-label="Thêm vào playlist">＋</button>
      </div>
    `;

    row.querySelector(".song-title").addEventListener("click", () => {
      const queue = songs.map((_, songIndex) => songIndex);
      loadTrack(index, queue, "Thư viện nhạc");
      playCurrent();
    });

    row.querySelector(".play-song").addEventListener("click", () => {
      const queue = songs.map((_, songIndex) => songIndex);
      loadTrack(index, queue, "Thư viện nhạc");
      playCurrent();
    });

    row.querySelector(".add-song").addEventListener("click", () => {
      addSongToActivePlaylist(index);
    });

    librarySongs.appendChild(row);
  });
}

function closePlaylistMenus() {
  document.querySelectorAll(".playlist-menu-floating").forEach((menu) => menu.remove());
}

function openPlaylistMenu(anchorButton, playlist) {
  closePlaylistMenus();

  const menu = document.createElement("div");
  menu.className = "playlist-menu-floating";
  menu.innerHTML = `
    <button type="button" data-action="rename">✎ <span>Đổi tên</span></button>
    <button type="button" data-action="delete" class="danger">⌫ <span>Xóa playlist</span></button>
  `;

  document.body.appendChild(menu);
  const anchorRect = anchorButton.getBoundingClientRect();
  const menuWidth = 174;
  const menuHeight = 96;
  const gap = 8;
  const left = Math.min(
    window.innerWidth - menuWidth - 10,
    Math.max(10, anchorRect.right - menuWidth)
  );
  let top = anchorRect.bottom + gap;
  if (top + menuHeight > window.innerHeight - 10) {
    top = anchorRect.top - menuHeight - gap;
  }

  menu.style.left = `${left}px`;
  menu.style.top = `${Math.max(10, top)}px`;

  menu.querySelector('[data-action="rename"]').addEventListener("click", () => {
    activePlaylistId = playlist.id;
    closePlaylistMenus();
    openPlaylistDialog("rename");
  });

  menu.querySelector('[data-action="delete"]').addEventListener("click", () => {
    activePlaylistId = playlist.id;
    closePlaylistMenus();
    deleteActivePlaylist();
  });
}

function renderPlaylistTabs() {
  closePlaylistMenus();
  playlistTabs.innerHTML = "";

  if (!playlists.length) {
    const empty = document.createElement("span");
    empty.className = "section-label";
    empty.textContent = "Chưa có playlist";
    playlistTabs.appendChild(empty);
    return;
  }

  playlists.forEach((playlist) => {
    const item = document.createElement("div");
    item.className = `playlist-tab-row ${playlist.id === activePlaylistId ? "active" : ""}`;

    const button = document.createElement("button");
    button.className = "playlist-tab";
    button.type = "button";
    button.textContent = playlist.name;

    const menuButton = document.createElement("button");
    menuButton.className = "playlist-menu-button";
    menuButton.type = "button";
    menuButton.setAttribute("aria-label", `Tùy chọn ${playlist.name}`);
    menuButton.textContent = "⋯";

    button.addEventListener("click", () => {
      activePlaylistId = playlist.id;
      renderPlaylistTabs();
      renderActivePlaylistSongs();
      closeMobileSidebar();
    });

    menuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      openPlaylistMenu(menuButton, playlist);
    });

    item.append(button, menuButton);
    playlistTabs.appendChild(item);
  });
}

function renderActivePlaylistSongs() {
  const playlist = getActivePlaylist();

  if (!playlist || !playlist.songIndexes.length) {
    playlistSongs.className = "playlist-list empty-state";
    playlistSongs.textContent = playlist
      ? "Chưa có bài hát trong playlist này."
      : "Hãy tạo playlist đầu tiên của bạn.";
    return;
  }

  playlistSongs.className = "playlist-list";
  playlistSongs.innerHTML = "";

  playlist.songIndexes.forEach((songIndex, position) => {
    const fileName = songs[songIndex];
    if (!fileName) return;

    const row = document.createElement("div");
    row.className = `song-row ${currentSongIndex === songIndex ? "active" : ""}`;
    row.innerHTML = `
      <span class="song-index">${String(position + 1).padStart(2, "0")}</span>
      <span class="song-title">${titleFromFile(fileName)}</span>
      <div class="song-buttons">
        <button class="song-action play-song" type="button">▶</button>
        <button class="song-action remove-song" type="button">×</button>
      </div>
    `;

    const playSong = () => {
      loadTrack(songIndex, playlist.songIndexes, playlist.name);
      playCurrent();
    };

    row.querySelector(".song-title").addEventListener("click", playSong);
    row.querySelector(".play-song").addEventListener("click", playSong);
    row.querySelector(".remove-song").addEventListener("click", () => {
      playlist.songIndexes.splice(position, 1);
      savePlaylists();
      renderActivePlaylistSongs();
    });

    playlistSongs.appendChild(row);
  });
}

function addSongToActivePlaylist(songIndex) {
  let playlist = getActivePlaylist();

  if (!playlist) {
    playlist = {
      id: createId(),
      name: "Playlist của tôi",
      songIndexes: []
    };

    playlists.push(playlist);
    activePlaylistId = playlist.id;
  }

  if (!playlist.songIndexes.includes(songIndex)) {
    playlist.songIndexes.push(songIndex);
    savePlaylists();
  }

  renderPlaylistTabs();
  renderActivePlaylistSongs();
}

function openPlaylistDialog(mode) {
  dialogMode = mode;
  const playlist = getActivePlaylist();

  if (mode === "rename" && !playlist) return;

  dialogTitle.textContent = mode === "create" ? "Tạo playlist mới" : "Đổi tên playlist";
  playlistNameInput.value = mode === "rename" ? playlist.name : "";
  playlistDialog.showModal();
  setTimeout(() => playlistNameInput.focus(), 50);
}

function deleteActivePlaylist() {
  const playlist = getActivePlaylist();
  if (!playlist) return;

  const confirmed = confirm(`Xóa playlist "${playlist.name}"?`);
  if (!confirmed) return;

  playlists = playlists.filter((item) => item.id !== playlist.id);
  activePlaylistId = playlists[0]?.id ?? null;
  savePlaylists();
  renderPlaylistTabs();
  renderActivePlaylistSongs();
}

function playActivePlaylist() {
  const playlist = getActivePlaylist();
  if (!playlist || !playlist.songIndexes.length) return;

  const startPosition =
    playMode === "shuffle"
      ? Math.floor(Math.random() * playlist.songIndexes.length)
      : 0;

  const songIndex = playlist.songIndexes[startPosition];
  loadTrack(songIndex, playlist.songIndexes, playlist.name);
  playCurrent();
}

function updateMediaSession() {
  if (!("mediaSession" in navigator) || currentSongIndex === null) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: titleFromFile(songs[currentSongIndex]),
    artist: "Fresh Music",
    album: currentQueueName
  });
}

function applySavedTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const useDark = savedTheme === null ? true : savedTheme === "dark";
  document.body.classList.toggle("dark", useDark);
  themeButton.textContent = useDark ? "☾" : "☀";
}

function toggleTheme() {
  const useDark = !document.body.classList.contains("dark");
  document.body.classList.toggle("dark", useDark);
  localStorage.setItem(THEME_KEY, useDark ? "dark" : "light");
  themeButton.textContent = useDark ? "☾" : "☀";
}

playButton.addEventListener("click", togglePlay);
previousButton.addEventListener("click", playPrevious);
nextButton.addEventListener("click", playNext);
sequentialModeButton.addEventListener("click", () => setPlayMode("sequential"));
shuffleModeButton.addEventListener("click", () => setPlayMode("shuffle"));

playAllButton.addEventListener("click", () => {
  const queue = songs.map((_, index) => index);
  const firstPosition =
    playMode === "shuffle" ? Math.floor(Math.random() * queue.length) : 0;

  loadTrack(queue[firstPosition], queue, "Thư viện nhạc");
  playCurrent();
});

createPlaylistButton.addEventListener("click", () => openPlaylistDialog("create"));
playPlaylistButton.addEventListener("click", playActivePlaylist);
cancelDialogButton.addEventListener("click", () => playlistDialog.close());
themeButton.addEventListener("click", toggleTheme);

playlistForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = playlistNameInput.value.trim();
  if (!name) return;

  if (dialogMode === "create") {
    const playlist = {
      id: createId(),
      name,
      songIndexes: []
    };

    playlists.push(playlist);
    activePlaylistId = playlist.id;
  } else {
    const playlist = getActivePlaylist();
    if (playlist) playlist.name = name;
  }

  savePlaylists();
  renderPlaylistTabs();
  renderActivePlaylistSongs();
  playlistDialog.close();
});

volumeBar.addEventListener("input", () => {
  

// Mobile sidebar navigation: close the drawer, scroll to section, and mark active item.
const mainNavItems = document.querySelectorAll(".main-nav .nav-item");

mainNavItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    const href = item.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();

    mainNavItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");

    closeMobileSidebar();

    // Wait one frame so the sidebar/overlay starts closing before scrolling.
    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Keep the section in the URL without causing another jump.
      history.replaceState(null, "", href);
    });
  });
});

audio.volume = Number(volumeBar.value);
});

progressBar.addEventListener("input", () => {
  if (!Number.isFinite(audio.duration)) return;
  audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
  if (desktopProgressMirror) desktopProgressMirror.value = progressBar.value;
});

if (desktopProgressMirror) {
  desktopProgressMirror.addEventListener("input", () => {
    if (!Number.isFinite(audio.duration)) return;
    audio.currentTime = (Number(desktopProgressMirror.value) / 100) * audio.duration;
    progressBar.value = desktopProgressMirror.value;
  });
}

audio.addEventListener("loadedmetadata", () => {
  durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  currentTimeText.textContent = formatTime(audio.currentTime);

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
    if (desktopProgressMirror) desktopProgressMirror.value = progressBar.value;
  }
});

audio.addEventListener("play", () => {
  playButton.textContent = "❚❚";
  playButton.setAttribute("aria-label", "Tạm dừng");
  playingStatus.textContent = "Đang phát";
  renderLibrary();
  renderActivePlaylistSongs();

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "playing";
  }
});

audio.addEventListener("pause", () => {
  playButton.textContent = "▶";
  playButton.setAttribute("aria-label", "Phát");
  playingStatus.textContent = currentSongIndex === null ? "Sẵn sàng phát" : "Đã tạm dừng";

  if ("mediaSession" in navigator) {
    navigator.mediaSession.playbackState = "paused";
  }
});

audio.addEventListener("ended", playNext);

audio.addEventListener("error", () => {
  playingStatus.textContent = "Không tìm thấy file MP3";
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", playCurrent);
  navigator.mediaSession.setActionHandler("pause", pauseCurrent);
  navigator.mediaSession.setActionHandler("previoustrack", playPrevious);
  navigator.mediaSession.setActionHandler("nexttrack", playNext);
  navigator.mediaSession.setActionHandler("seekto", (details) => {
    if (details.seekTime !== undefined) {
      audio.currentTime = details.seekTime;
    }
  });
}

function openMobileSidebar() {
  if (!sidebar || !sidebarOverlay || !mobileMenuButton) return;
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("open");
  sidebarOverlay.setAttribute("aria-hidden", "false");
  mobileMenuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("sidebar-open");
}

function closeMobileSidebar() {
  if (!sidebar || !sidebarOverlay || !mobileMenuButton) return;
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("open");
  sidebarOverlay.setAttribute("aria-hidden", "true");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("sidebar-open");
  closePlaylistMenus();
}

mobileMenuButton?.addEventListener("click", () => {
  sidebar?.classList.contains("open") ? closeMobileSidebar() : openMobileSidebar();
});
sidebarOverlay?.addEventListener("click", closeMobileSidebar);
window.addEventListener("resize", () => {
  closePlaylistMenus();
  if (window.innerWidth > 900) closeMobileSidebar();
});
window.addEventListener("scroll", closePlaylistMenus, true);
document.addEventListener("click", (event) => {
  if (!event.target.closest(".playlist-menu-floating") && !event.target.closest(".playlist-menu-button")) {
    closePlaylistMenus();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePlaylistMenus();
    closeMobileSidebar();
  }
});



// Mobile sidebar navigation: close the drawer, scroll to section, and mark active item.
const mainNavItems = document.querySelectorAll(".main-nav .nav-item");

mainNavItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    const href = item.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    event.preventDefault();

    mainNavItems.forEach((navItem) => navItem.classList.remove("active"));
    item.classList.add("active");

    closeMobileSidebar();

    // Wait one frame so the sidebar/overlay starts closing before scrolling.
    requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      // Keep the section in the URL without causing another jump.
      history.replaceState(null, "", href);
    });
  });
});

audio.volume = Number(volumeBar.value);
applySavedTheme();
setPlayMode("sequential");
renderLibrary();
renderPlaylistTabs();
renderActivePlaylistSongs();
