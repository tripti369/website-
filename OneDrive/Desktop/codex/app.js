const STORAGE_KEYS = {
  profiles: "hackmates-profiles",
  currentProfileId: "hackmates-current-profile-id",
  requests: "hackmates-requests",
};

const seedProfiles = [
  {
    id: "seed-1",
    name: "Riya Patel",
    rollNumber: "22CSE1104",
    course: "B.Tech CSE",
    year: "3rd Year",
    github: "https://github.com/riyapatel-dev",
    interest: "AI / ML",
    role: "ML Engineer",
    skills: "Python, TensorFlow, FastAPI, Data Visualization",
    bio: "I enjoy building practical AI products with clean APIs and polished demos.",
    goals: "Looking for a frontend teammate and a product thinker for healthcare or education hackathons.",
    isSeed: true,
  },
  {
    id: "seed-2",
    name: "Karan Mehta",
    rollNumber: "23ECE2049",
    course: "B.Tech ECE",
    year: "2nd Year",
    github: "https://github.com/karan-builds",
    interest: "IoT / Hardware",
    role: "Embedded Systems Developer",
    skills: "Arduino, ESP32, Sensors, C++, MQTT",
    bio: "I love rapid prototyping and blending hardware with software for impactful hackathon builds.",
    goals: "Searching for app developers and UI designers to turn sensor-driven ideas into products.",
    isSeed: true,
  },
  {
    id: "seed-3",
    name: "Sana Khan",
    rollNumber: "21IT3088",
    course: "B.Tech IT",
    year: "4th Year",
    github: "https://github.com/sanakhan-ui",
    interest: "UI / UX Design",
    role: "Product Designer",
    skills: "Figma, Design Systems, Wireframing, User Research",
    bio: "I bring structure to fast-moving teams and turn raw ideas into intuitive user journeys.",
    goals: "Want to join teams building social impact, fintech, or student productivity apps.",
    isSeed: true,
  },
  {
    id: "seed-4",
    name: "Aditya Singh",
    rollNumber: "22MCA4152",
    course: "MCA",
    year: "1st Year",
    github: "https://github.com/adityasingh-api",
    interest: "Web Development",
    role: "Backend Developer",
    skills: "Node.js, PostgreSQL, Express, Auth, REST APIs",
    bio: "I enjoy solving product logic, backend performance, and team integration problems.",
    goals: "Open to joining strong design or AI teams that need a backend lead for hackathons.",
    isSeed: true,
  },
];

const dom = {
  profileForm: document.getElementById("student-profile-form"),
  formMessage: document.getElementById("form-message"),
  preview: document.getElementById("current-profile-preview"),
  profileList: document.getElementById("profile-list"),
  profileDetail: document.getElementById("profile-detail"),
  requestList: document.getElementById("request-list"),
  searchInput: document.getElementById("search-input"),
  interestFilter: document.getElementById("interest-filter"),
  courseFilter: document.getElementById("course-filter"),
  yearFilter: document.getElementById("year-filter"),
  clearForm: document.getElementById("clear-form"),
  profileCount: document.getElementById("profile-count"),
  requestCount: document.getElementById("request-count"),
  modal: document.getElementById("connect-modal"),
  modalTitle: document.getElementById("modal-title"),
  connectForm: document.getElementById("connect-form"),
  connectMessage: document.getElementById("connect-message"),
  connectFeedback: document.getElementById("connect-feedback"),
  closeModal: document.getElementById("close-modal"),
};

let selectedProfileId = null;
let activeTargetProfileId = null;

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Unable to read storage key ${key}`, error);
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getProfiles() {
  const savedProfiles = readStorage(STORAGE_KEYS.profiles, []);
  const merged = [...seedProfiles];

  savedProfiles.forEach((profile) => {
    const existingIndex = merged.findIndex((item) => item.id === profile.id);

    if (existingIndex >= 0) {
      merged[existingIndex] = profile;
    } else {
      merged.push(profile);
    }
  });

  return merged;
}

function getUserCreatedProfiles() {
  return readStorage(STORAGE_KEYS.profiles, []);
}

function getCurrentProfile() {
  const currentProfileId = localStorage.getItem(STORAGE_KEYS.currentProfileId);
  return getProfiles().find((profile) => profile.id === currentProfileId) || null;
}

function getRequests() {
  return readStorage(STORAGE_KEYS.requests, []);
}

function populateFilters() {
  const profiles = getProfiles();
  const uniqueInterests = [...new Set(profiles.map((profile) => profile.interest))].sort();
  const uniqueCourses = [...new Set(profiles.map((profile) => profile.course))].sort();
  const uniqueYears = [...new Set(profiles.map((profile) => profile.year))].sort();

  setOptions(dom.interestFilter, uniqueInterests, "All interests");
  setOptions(dom.courseFilter, uniqueCourses, "All courses");
  setOptions(dom.yearFilter, uniqueYears, "All years");
}

function setOptions(selectElement, values, defaultLabel) {
  const currentValue = selectElement.value;
  selectElement.innerHTML = `<option value="All">${defaultLabel}</option>`;

  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });

  selectElement.value = values.includes(currentValue) ? currentValue : "All";
}

function renderCurrentProfile() {
  const currentProfile = getCurrentProfile();

  if (!currentProfile) {
    dom.preview.className = "empty-state";
    dom.preview.textContent = "Save your profile to see it highlighted here and in the directory.";
    return;
  }

  dom.preview.className = "preview-profile";
  dom.preview.innerHTML = `
    <div class="identity-panel">
      <p class="eyebrow">Ready for hackathons</p>
      <h3>${escapeHtml(currentProfile.name)}</h3>
      <p>${escapeHtml(currentProfile.role)} • ${escapeHtml(currentProfile.interest)}</p>
    </div>
    <div class="profile-meta">
      <span class="meta-pill">${escapeHtml(currentProfile.rollNumber)}</span>
      <span class="meta-pill">${escapeHtml(currentProfile.course)}</span>
      <span class="meta-pill">${escapeHtml(currentProfile.year)}</span>
    </div>
    <div class="mini-grid">
      <div class="mini-card">
        <p class="mini-label">Skills</p>
        <p>${escapeHtml(currentProfile.skills)}</p>
      </div>
      <div class="mini-card">
        <p class="mini-label">Collaboration goal</p>
        <p>${escapeHtml(currentProfile.goals)}</p>
      </div>
    </div>
    <a class="card-link" href="${escapeAttribute(currentProfile.github)}" target="_blank" rel="noreferrer">
      View GitHub profile
    </a>
  `;
}

function getFilteredProfiles() {
  const query = dom.searchInput.value.trim().toLowerCase();
  const interest = dom.interestFilter.value;
  const course = dom.courseFilter.value;
  const year = dom.yearFilter.value;

  return getProfiles().filter((profile) => {
    const queryMatches =
      !query ||
      [
        profile.name,
        profile.rollNumber,
        profile.course,
        profile.year,
        profile.interest,
        profile.role,
        profile.skills,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    const interestMatches = interest === "All" || profile.interest === interest;
    const courseMatches = course === "All" || profile.course === course;
    const yearMatches = year === "All" || profile.year === year;

    return queryMatches && interestMatches && courseMatches && yearMatches;
  });
}

function renderProfiles() {
  const profiles = getFilteredProfiles();
  const currentProfile = getCurrentProfile();

  dom.profileCount.textContent = `${getProfiles().length}`;

  if (!profiles.length) {
    dom.profileList.innerHTML = `
      <div class="empty-state">
        No profiles match these filters yet. Try another search or create a new profile.
      </div>
    `;
    dom.profileDetail.innerHTML = `
      <div class="empty-state">
        No profile selected right now.
      </div>
    `;
    return;
  }

  if (!selectedProfileId || !profiles.some((profile) => profile.id === selectedProfileId)) {
    selectedProfileId = profiles[0].id;
  }

  dom.profileList.innerHTML = profiles
    .map((profile) => {
      const isCurrentUser = currentProfile && currentProfile.id === profile.id;
      const cardClass = profile.id === selectedProfileId ? "profile-card active" : "profile-card";

      return `
        <article class="${cardClass}" data-profile-id="${escapeAttribute(profile.id)}" tabindex="0">
          <div class="profile-card-header">
            <div>
              <h3>${escapeHtml(profile.name)}</h3>
              <p>${escapeHtml(profile.role)} • ${escapeHtml(profile.interest)}</p>
            </div>
            <span class="tag">${isCurrentUser ? "You" : escapeHtml(profile.year)}</span>
          </div>
          <div class="profile-meta">
            <span class="meta-pill">${escapeHtml(profile.rollNumber)}</span>
            <span class="meta-pill">${escapeHtml(profile.course)}</span>
          </div>
          <p>${escapeHtml(profile.bio)}</p>
          <div class="card-footer">
            <button class="ghost-button" type="button" data-view-profile="${escapeAttribute(profile.id)}">
              View profile
            </button>
            <a class="card-link" href="${escapeAttribute(profile.github)}" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </article>
      `;
    })
    .join("");

  renderProfileDetail(selectedProfileId);
}

function renderProfileDetail(profileId) {
  const profile = getProfiles().find((item) => item.id === profileId);
  const currentProfile = getCurrentProfile();

  if (!profile) {
    dom.profileDetail.innerHTML = `
      <div class="empty-state">
        Select a profile to view more details and send a collaboration request.
      </div>
    `;
    return;
  }

  selectedProfileId = profile.id;
  const isCurrentUser = currentProfile && currentProfile.id === profile.id;

  dom.profileDetail.innerHTML = `
    <div class="detail-layout">
      <div class="detail-header">
        <div>
          <p class="eyebrow">Profile detail</p>
          <h3>${escapeHtml(profile.name)}</h3>
          <p>${escapeHtml(profile.role)} • ${escapeHtml(profile.interest)}</p>
        </div>
        <span class="tag">${isCurrentUser ? "Your profile" : "Open to team up"}</span>
      </div>
      <div class="detail-meta">
        <span class="meta-pill">Roll no: ${escapeHtml(profile.rollNumber)}</span>
        <span class="meta-pill">${escapeHtml(profile.course)}</span>
        <span class="meta-pill">${escapeHtml(profile.year)}</span>
      </div>
      <div class="detail-copy">
        <div class="detail-section">
          <strong>Skills</strong>
          <p>${escapeHtml(profile.skills)}</p>
        </div>
        <div class="detail-section">
          <strong>Bio</strong>
          <p>${escapeHtml(profile.bio)}</p>
        </div>
        <div class="detail-section">
          <strong>Collaboration goals</strong>
          <p>${escapeHtml(profile.goals)}</p>
        </div>
      </div>
      <div class="detail-actions">
        <a class="card-link" href="${escapeAttribute(profile.github)}" target="_blank" rel="noreferrer">
          Open GitHub
        </a>
        <button
          class="button button-primary"
          type="button"
          data-approach-profile="${escapeAttribute(profile.id)}"
          ${isCurrentUser ? "disabled" : ""}
        >
          ${isCurrentUser ? "This is you" : "Approach for collaboration"}
        </button>
      </div>
    </div>
  `;

  document.querySelectorAll(".profile-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.profileId === profile.id);
  });
}

function renderRequests() {
  const requests = getRequests().sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  dom.requestCount.textContent = `${requests.length}`;

  if (!requests.length) {
    dom.requestList.innerHTML = `
      <div class="empty-state">
        No requests yet. Open any profile and send your first collaboration message.
      </div>
    `;
    return;
  }

  dom.requestList.innerHTML = requests
    .map(
      (request) => `
        <article class="request-card">
          <div class="request-header">
            <div>
              <h3>${escapeHtml(request.toName)}</h3>
              <p>From ${escapeHtml(request.fromName)}</p>
            </div>
            <span class="tag">${formatDate(request.sentAt)}</span>
          </div>
          <p>${escapeHtml(request.message)}</p>
          <p class="request-meta">
            ${escapeHtml(request.toRole)} • ${escapeHtml(request.toInterest)} • Roll no ${escapeHtml(request.toRollNumber)}
          </p>
        </article>
      `
    )
    .join("");
}

function saveProfile(event) {
  event.preventDefault();

  const formData = new FormData(dom.profileForm);
  const payload = {
    name: (formData.get("name") || "").toString().trim(),
    rollNumber: (formData.get("rollNumber") || "").toString().trim(),
    course: (formData.get("course") || "").toString().trim(),
    year: (formData.get("year") || "").toString().trim(),
    github: (formData.get("github") || "").toString().trim(),
    interest: (formData.get("interest") || "").toString().trim(),
    role: (formData.get("role") || "").toString().trim(),
    skills: (formData.get("skills") || "").toString().trim(),
    bio: (formData.get("bio") || "").toString().trim(),
    goals: (formData.get("goals") || "").toString().trim(),
  };

  const missingField = Object.entries(payload).find(([, value]) => !value);

  if (missingField) {
    dom.formMessage.textContent = "Please complete every required field before saving your profile.";
    return;
  }

  if (!isValidGithubUrl(payload.github)) {
    dom.formMessage.textContent = "Please enter a valid GitHub profile link.";
    return;
  }

  const userProfiles = getUserCreatedProfiles();
  const existingId = localStorage.getItem(STORAGE_KEYS.currentProfileId);
  const profileId = existingId || `user-${Date.now()}`;
  const profile = { id: profileId, ...payload };
  const updatedProfiles = userProfiles.filter((item) => item.id !== profileId);
  updatedProfiles.push(profile);

  writeStorage(STORAGE_KEYS.profiles, updatedProfiles);
  localStorage.setItem(STORAGE_KEYS.currentProfileId, profileId);
  selectedProfileId = profileId;

  dom.formMessage.textContent = "Your profile is live. You can now explore and approach teammates.";
  populateFilters();
  renderCurrentProfile();
  renderProfiles();
}

function handleProfileListClick(event) {
  const viewButton = event.target.closest("[data-view-profile]");
  const profileCard = event.target.closest("[data-profile-id]");

  if (viewButton) {
    renderProfileDetail(viewButton.dataset.viewProfile);
    return;
  }

  if (profileCard) {
    renderProfileDetail(profileCard.dataset.profileId);
  }
}

function handleProfileListKeydown(event) {
  const profileCard = event.target.closest("[data-profile-id]");
  if (!profileCard) {
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    renderProfileDetail(profileCard.dataset.profileId);
  }
}

function handleDetailActions(event) {
  const approachButton = event.target.closest("[data-approach-profile]");

  if (!approachButton) {
    return;
  }

  const currentProfile = getCurrentProfile();

  if (!currentProfile) {
    dom.formMessage.textContent = "Create your profile first so others know who is sending the request.";
    document.getElementById("profile-form").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  activeTargetProfileId = approachButton.dataset.approachProfile;
  const targetProfile = getProfiles().find((profile) => profile.id === activeTargetProfileId);

  if (!targetProfile) {
    return;
  }

  dom.modalTitle.textContent = `Send a collaboration request to ${targetProfile.name}`;
  dom.connectMessage.value = `Hi ${targetProfile.name}, I saw your ${targetProfile.interest} profile and would love to collaborate for an upcoming hackathon.`;
  dom.connectFeedback.textContent = "";
  openModal();
}

function handleConnectSubmit(event) {
  event.preventDefault();

  const currentProfile = getCurrentProfile();
  const targetProfile = getProfiles().find((profile) => profile.id === activeTargetProfileId);
  const message = dom.connectMessage.value.trim();

  if (!currentProfile || !targetProfile) {
    dom.connectFeedback.textContent = "Unable to send this request right now. Please try again.";
    return;
  }

  if (!message) {
    dom.connectFeedback.textContent = "Please write a message before sending the request.";
    return;
  }

  const requests = getRequests();
  requests.push({
    id: `request-${Date.now()}`,
    fromId: currentProfile.id,
    fromName: currentProfile.name,
    toId: targetProfile.id,
    toName: targetProfile.name,
    toRole: targetProfile.role,
    toInterest: targetProfile.interest,
    toRollNumber: targetProfile.rollNumber,
    message,
    sentAt: new Date().toISOString(),
  });

  writeStorage(STORAGE_KEYS.requests, requests);
  renderRequests();
  dom.connectFeedback.textContent = "Request sent. It is now stored in your collaboration history.";

  setTimeout(() => {
    closeModal();
  }, 700);
}

function resetForm() {
  dom.profileForm.reset();
  dom.formMessage.textContent = "";
}

function openModal() {
  dom.modal.classList.remove("hidden");
  dom.modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  dom.modal.classList.add("hidden");
  dom.modal.setAttribute("aria-hidden", "true");
  activeTargetProfileId = null;
  dom.connectFeedback.textContent = "";
}

function syncFormWithCurrentProfile() {
  const currentProfile = getCurrentProfile();

  if (!currentProfile) {
    return;
  }

  dom.profileForm.elements.name.value = currentProfile.name;
  dom.profileForm.elements.rollNumber.value = currentProfile.rollNumber;
  dom.profileForm.elements.course.value = currentProfile.course;
  dom.profileForm.elements.year.value = currentProfile.year;
  dom.profileForm.elements.github.value = currentProfile.github;
  dom.profileForm.elements.interest.value = currentProfile.interest;
  dom.profileForm.elements.role.value = currentProfile.role;
  dom.profileForm.elements.skills.value = currentProfile.skills;
  dom.profileForm.elements.bio.value = currentProfile.bio;
  dom.profileForm.elements.goals.value = currentProfile.goals;
}

function isValidGithubUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.hostname === "github.com" || url.hostname === "www.github.com";
  } catch (error) {
    return false;
  }
}

function formatDate(isoString) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(isoString));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function attachEvents() {
  dom.profileForm.addEventListener("submit", saveProfile);
  dom.profileList.addEventListener("click", handleProfileListClick);
  dom.profileList.addEventListener("keydown", handleProfileListKeydown);
  dom.profileDetail.addEventListener("click", handleDetailActions);
  dom.connectForm.addEventListener("submit", handleConnectSubmit);
  dom.clearForm.addEventListener("click", resetForm);

  [dom.searchInput, dom.interestFilter, dom.courseFilter, dom.yearFilter].forEach((element) => {
    element.addEventListener("input", renderProfiles);
    element.addEventListener("change", renderProfiles);
  });

  dom.closeModal.addEventListener("click", closeModal);
  dom.modal.addEventListener("click", (event) => {
    if (event.target.dataset.closeModal === "true") {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function init() {
  populateFilters();
  syncFormWithCurrentProfile();
  renderCurrentProfile();
  renderProfiles();
  renderRequests();
  attachEvents();
}

init();
